var dgram = require('dgram')
var tape = require('tape')
var discovery = require('./')

freePort(function (port) {
  tape('discovers', function (t) {
    var disc1 = discovery()
    var disc2 = discovery()
    var ns = Math.random().toString(16) + '-' + process.pid
    var appName = 'dns-discovery-' + ns

    disc2.on('peer', function (name, peer) {
      disc1.destroy()
      disc2.destroy()
      t.same(name, appName)
      t.same(peer.port, 8080)
      t.same(typeof peer.host, 'string')
      t.end()
    })

    disc1.announce(appName, 8080)
  })

  tape('discovers only using server', function (t) {
    t.plan(4)

    var server = discovery({multicast: false})
    var client2 = discovery({multicast: false, server: 'localhost:' + port})
    var client1 = discovery({multicast: false, server: 'localhost:' + port})

    server.on('peer', function (name, peer) {
      t.same(name, 'hello-world')
      t.same(peer.port, 8080)
    })

    client2.on('peer', function (name, peer) {
      t.same(name, 'hello-world')
      t.same(peer.port, 8080)
      server.destroy()
      client1.destroy()
      client2.destroy()
    })

    server.listen(port, function () {
      client1.announce('hello-world', 8080, function () {
        client2.lookup('hello-world')
      })
    })
  })

  tape('discovers only using server with secondary port', function (t) {
    t.plan(4)

    var server = discovery({multicast: false})
    var client2 = discovery({multicast: false, server: 'localhost:9999,' + port})
    var client1 = discovery({multicast: false, server: 'localhost:9998,' + port})

    server.on('peer', function (name, peer) {
      t.same(name, 'hello-world')
      t.same(peer.port, 8080)
    })

    client2.on('peer', function (name, peer) {
      t.same(name, 'hello-world')
      t.same(peer.port, 8080)
      server.destroy()
      client1.destroy()
      client2.destroy()
    })

    server.listen(port, function () {
      client1.announce('hello-world', 8080, function () {
        client2.lookup('hello-world')
      })
    })
  })

  tape('discovers only using multiple servers', function (t) {
    t.plan(6)

    var server = discovery({multicast: false})
    var client1 = discovery({multicast: false, server: ['localhost:' + port, 'localhost:' + port]})
    var client2 = discovery({multicast: false, server: ['localhost:' + port, 'localhost:' + port]})

    server.on('peer', function (name, peer) {
      t.same(name, 'hello-world')
      t.same(peer.port, 8080)
    })

    client2.on('peer', function (name, peer) {
      t.same(name, 'hello-world')
      t.same(peer.port, 8080)
      server.destroy()
      client1.destroy()
      client2.destroy()
    })

    server.listen(port, function () {
      client1.announce('hello-world', 8080, function () {
        client2.lookup('hello-world')
      })
    })
  })

  tape('limit', function (t) {
    var server = discovery({multicast: false, limit: 1})
    var ns = Math.random().toString(16) + '-' + process.pid

    server.announce(ns + 'hello-world', 8080)
    server.announce(ns + 'hello-world-2', 8081)

    var domains = server.toJSON()
    t.same(domains.length, 1)
    t.same(domains[0].records.length, 1)
    t.end()
  })

  tape('push', function (t) {
    var server = discovery({multicast: false})
    var client1 = discovery({multicast: false, server: 'localhost:' + port})
    var client2 = discovery({multicast: false, server: 'localhost:' + port})

    server.listen(port, function () {
      server.once('peer', function () {
        client2.announce('hello-world', 8081)
      })
      client1.lookup('hello-world')
      client1.announce('hello-world', 8080)
      client1.on('peer', function (id, peer) {
        if (peer.port === 8081) {
          client1.destroy()
          client2.destroy()
          server.destroy()
          t.pass('got peer')
          t.end()
        }
      })
    })
  })

  tape('unannounce', function (t) {
    var server = discovery({multicast: false})
    var client1 = discovery({multicast: false, server: 'localhost:' + port})
    var client2 = discovery({multicast: false, server: 'localhost:' + port})

    client2.on('peer', function () {
      t.fail('no peers should be discovered')
    })

    server.listen(port, function () {
      client1.announce('test', 8080, function () {
        client1.unannounce('test', 8080, function () {
          client2.lookup('test', function () {
            setTimeout(function () {
              client2.destroy()
              client1.destroy()
              server.destroy()
              t.end()
            }, 100)
          })
        })
      })
    })
  })

  tape('custom socket + server', function (t) {
    t.plan(5)

    var socket = dgram.createSocket('udp4')

    socket.once('message', function () {
      t.pass('used custom socket')
    })

    var server = discovery({multicast: false})
    var client2 = discovery({multicast: false, server: 'localhost:' + port, socket: socket})
    var client1 = discovery({multicast: false, server: 'localhost:' + port})

    server.on('peer', function (name, peer) {
      t.same(name, 'hello-world')
      t.same(peer.port, 8080)
    })

    client2.on('peer', function (name, peer) {
      t.same(name, 'hello-world')
      t.same(peer.port, 8080)
      server.destroy()
      client1.destroy()
      client2.destroy()
    })

    server.listen(port, function () {
      client1.announce('hello-world', 8080, function () {
        client2.lookup('hello-world')
      })
    })
  })

  tape('implied port', function (t) {
    t.plan(4)

    var socket = dgram.createSocket('udp4')

    var server = discovery({multicast: false})
    var client2 = discovery({multicast: false, server: 'localhost:' + port})
    var client1 = discovery({multicast: false, server: 'localhost:' + port, socket: socket})

    server.on('peer', function (name, peer) {
      t.same(name, 'hello-world')
      t.same(peer.port, socket.address().port)
    })

    client2.on('peer', function (name, peer) {
      t.same(name, 'hello-world')
      t.same(peer.port, socket.address().port)
      server.destroy()
      client1.destroy()
      client2.destroy()
    })

    server.listen(port, function () {
      client1.announce('hello-world', 8080, {impliedPort: true}, function () {
        client2.lookup('hello-world')
      })
    })
  })

  tape('loopback', function (t) {
    var client = discovery({loopback: true})

    client.on('peer', function () {
      client.destroy()
      t.end()
    })

    client.announce('test', 8080)
  })

  tape('public port', function (t) {
    var server = discovery({multicast: false})
    var client2 = discovery({server: 'localhost:' + port})
    var client1 = discovery({server: 'localhost:' + port})
    var ns = Math.random().toString(16) + '-' + process.pid
    var appName = 'dns-discovery-' + ns
    var missing = 2

    server.on('peer', function (name, peer) {
      t.same(name, appName)
      t.same(peer.port, 9090, 'server port')
    })

    client2.on('peer', function (name, peer) {
      t.same(name, appName)
      t.same(peer.port, peer.host === '127.0.0.1' ? 9090 : 8080)
      if (--missing) return
      server.destroy()
      client1.destroy()
      client2.destroy()
      t.end()
    })

    server.listen(port, function () {
      client1.announce(appName, 8080, {publicPort: 9090}, function () {
        client2.lookup(appName)
      })
    })
  })
})

function freePort (cb) {
  var socket = dgram.createSocket('udp4')
  socket.bind(0, function () {
    socket.on('close', cb.bind(null, socket.address().port))
    socket.close()
  })
}
