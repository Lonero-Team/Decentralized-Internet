'use strict'

const net = require('net')
const debug = require('debug')('abci')
const Connection = require('./connection.js')

function createServer (app) {
  let server = net.createServer((client) => {
    client.name = `${client.remoteAddress}:${client.remotePort}`

    let conn = new Connection(client, async (req, cb) => {
      let [ type ] = Object.keys(req)
      let message = req[type]

      // special messages
      if (type === 'flush') {
        conn.write({ flush: {} })
        return cb()
      } else if (type === 'echo') {
        conn.write({ echo: { message: message.message } })
        return cb()
      }

      let succeed = (response) => {
        // respond to client
        let message = { [type]: response }
        conn.write(message)
        cb()
      }

      let fail = (err) => {
        // if app throws an error, send an 'exception' response
        // and close the connection
        debug(`ABCI error on "${type}":`, err)
        message = { exception: { error: err.toString() } }
        conn.write(message)
        conn.close()
      }

      // message handler not implemented in app, send emtpy response
      if (app[type] == null) {
        return succeed({})
      }

      // call method
      try {
        let res = app[type](message)

        // method can optionally be async
        if (res instanceof Promise) {
          res = await res
        }

        succeed(res)
      } catch (err) {
        fail(err)
      }
    })
  })

  return server
}

module.exports = createServer
