/*
* @Author: zoujie.wzj
* @Date:   2016-01-23 18:25:37
* @Last Modified by:   zoujie.wzj
* @Last Modified time: 2016-10-13 15:18:00
*/

'use strict'

const path = require('path')
const utils = require('./utils')

function matchName (text, name) {
  if (!name) {
    return true
  }

  return text.match(name)
}

const finders = {
  darwin (cond) {
    return new Promise((resolve, reject) => {
      let cmd
      if ('pid' in cond) {
        cmd = `ps -p ${cond.pid} -ww -o pid,ppid,uid,gid,args`
      } else {
        cmd = `ps ax -ww -o pid,ppid,uid,gid,args`
      }

      utils.exec(cmd, function (err, stdout, stderr) {
        if (err) {
          if ('pid' in cond) {
            // when pid not exists, call `ps -p ...` will cause error, we have to
            // ignore the error and resolve with empty array
            resolve([])
          } else {
            reject(err)
          }
        } else {
          err = stderr.toString().trim()
          if (err) {
            reject(err)
            return
          }

          let data = utils.stripLine(stdout.toString(), 1)
          let columns = utils.extractColumns(data, [0, 1, 2, 3, 4], 5).filter(column => {
            if (column[0]) {
              return matchName(column[4], cond.name)
            } else {
              return false
            }
          })

          let list = columns.map(column => {
            let cmd = String(column[4]).split(' ', 1)[0]

            return {
              pid: column[0],
              ppid: column[1],
              uid: column[2],
              gid: column[3],
              name: path.basename(cmd),
              cmd: column[4]
            }
          })

          resolve(list)
        }
      })
    })
  },
  linux: 'darwin',
  sunos: 'darwin',
  freebsd: 'darwin',
  win32 (cond) {
    return new Promise((resolve, reject) => {
      let cmd = 'WMIC path win32_process get Name,Processid,ParentProcessId,Commandline'

      utils.exec(cmd, function (err, stdout, stderr) {
        if (err) {
          reject(err)
        } else {
          err = stderr.toString().trim()
          if (err) {
            reject(err)
            return
          }

          let list = utils.parseTable(stdout.toString())
            .filter(row => {
              if ('pid' in cond) {
                return row.ProcessId === String(cond.pid)
              } else {
                return matchName(row.CommandLine, cond.name)
              }
            })
            .map(row => {
              return {
                pid: row.ProcessId,
                ppid: row.ParentProcessId,
                uid: null,
                gid: null,
                name: row.Name,
                cmd: row.CommandLine
              }
            })

          resolve(list)
        }
      })
    })
  }
}

function findProcess (cond) {
  let platform = process.platform

  return new Promise((resolve, reject) => {
    if (!(platform in finders)) {
      reject(new Error(`platform ${platform} is unsupported`))
    }

    let find = finders[platform]
    if (typeof find === 'string') {
      find = finders[find]
    }

    find(cond).then(resolve, reject)
  })
}

module.exports = findProcess
