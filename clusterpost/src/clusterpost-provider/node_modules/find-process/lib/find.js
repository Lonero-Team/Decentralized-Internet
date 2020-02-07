/*
* @Author: zoujie.wzj
* @Date:   2016-01-23 18:18:28
* @Last Modified by:   zoujie.wzj
* @Last Modified time: 2016-10-13 15:17:15
*/

'use strict'

const findPid = require('./find_pid')
const findProcess = require('./find_process')

const findBy = {
  port (port) {
    return findPid(port)
      .then(pid => {
        return findBy.pid(pid)
      }, () => {
        // return empty array when pid not found
        return []
      })
  },
  pid (pid) {
    return findProcess({pid: pid})
  },
  name (name) {
    return findProcess({name: name})
  }
}

/**
 * find process by condition
 *
 * return Promise: [{
 *   pid: <process id>,
 *   ppid: <process parent id>,
 *   uid: <user id (*nix)>,
 *   gid: <user group id (*nix)>,
 *   name: <command name>,
 *   cmd: <process run args>
 * }, ...]
 *
 * If no process found, resolve process with empty array (only reject when error occured)
 *
 * @param  {String} by condition: port/pid/name ...
 * @param {Mixed} condition value
 * @return {Promise}
 */
function find (by, value) {
  return new Promise((resolve, reject) => {
    if (!(by in findBy)) {
      reject(new Error(`do not support find by "${by}"`))
    } else {
      findBy[by](value).then(resolve, reject)
    }
  })
}

module.exports = find
