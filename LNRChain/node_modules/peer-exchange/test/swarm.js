var test = require('tape')
var Swarm = require('../')
var PassThrough = require('stream').PassThrough
var dup = require('duplexify')
var RTCPeer = require('simple-peer')
if (!process.browser) {
  var wrtc = require('wrtc')
} else if (!window.localStorage.debug) {
  window.localStorage.debug = '*'
  window.location.reload()
}

function nodeTest (t, name, f) {
  if (!process.browser) return t.test(name, f)
}

function browserTest (t, name, f) {
  if (process.browser) return t.test(name, f)
}

function createStreams () {
  var conn1 = new PassThrough()
  var conn2 = new PassThrough()
  return [
    dup(conn1, conn2),
    dup(conn2, conn1)
  ]
}

var rtcConfig = {
  iceServers: [
    {
      url: 'stun:23.21.150.121',
      urls: 'stun:23.21.150.121'
    }, {
      url: 'turn:104.236.185.38:3478?transport=tcp',
      urls: 'turn:104.236.185.38:3478?transport=tcp',
      username: 'HDCqbgHNTxpbwwdDXlip',
      credential: 'Ll0IWHrGsqtLSxjvIFMi'
    }, {
      url: 'turn:104.236.185.38:3478?transport=udp',
      urls: 'turn:104.236.185.38:3478?transport=udp',
      username: 'HDCqbgHNTxpbwwdDXlip',
      credential: 'Ll0IWHrGsqtLSxjvIFMi'
    }
  ]
}

function createRTCStreams (cb) {
  var peer1 = RTCPeer({ initiator: true, wrtc: wrtc, config: rtcConfig })
  var peer2 = RTCPeer({ wrtc: wrtc, config: rtcConfig })
  peer1.on('signal', function (data) { peer2.signal(data) })
  peer2.on('signal', function (data) { peer1.signal(data) })
  var maybeDone = function () {
    if (!peer1.connected || !peer2.connected) return
    cb(null, [ peer1, peer2 ])
  }
  peer1.on('connect', maybeDone)
  peer2.on('connect', maybeDone)
}

test('create Swarm', function (t) {
  t.test('no networkId', function (t) {
    try {
      var swarm = Swarm()
      t.notOk(swarm, 'should have thrown')
    } catch (err) {
      t.pass('error thrown')
      t.equal(err.message, 'networkId must be a string', 'correct error message')
      t.end()
    }
  })

  t.test('invalid networkId', function (t) {
    try {
      var swarm = Swarm(123)
      t.notOk(swarm, 'should have thrown')
    } catch (err) {
      t.pass('error thrown')
      t.equal(err.message, 'networkId must be a string', 'correct error message')
      t.end()
    }
  })

  nodeTest(t, 'no webrtc implementation', function (t) {
    try {
      var swarm = Swarm('somenet')
      t.notOk(swarm, 'should have thrown')
    } catch (err) {
      t.pass('error thrown')
      t.equal(err.message, 'No WebRTC implementation found, please pass one in  as the "wrtc" option (for example, the "wrtc" or "electron-webrtc" packages).', 'correct error message')
      t.end()
    }
  })

  nodeTest(t, 'with webrtc implementation', function (t) {
    var swarm = Swarm('somenet', { wrtc: {} })
    t.ok(swarm instanceof Swarm, 'created swarm')
    t.end()
  })

  browserTest(t, 'with builtin webrtc implementation', function (t) {
    var swarm = Swarm('somenet')
    t.ok(swarm instanceof Swarm, 'created swarm')
    t.end()
  })

  t.end()
})

test('connect', function (t) {
  t.test('simple connect', function (t) {
    t.plan(18)
    var swarm1 = Swarm('somenet', { wrtc: wrtc })
    var swarm2 = Swarm('somenet', { wrtc: wrtc })
    var streams = createStreams()
    swarm1.on('peer', function (peer) {
      t.pass('got "peer" event from swarm1')
      t.equal(swarm1.peers.length, 1, 'correct peers length')
      t.equal(swarm1.peers[0], peer, 'correct peer object')
    })
    swarm2.on('peer', function (peer) {
      t.pass('got "peer" event from swarm2')
      t.equal(swarm2.peers.length, 1, 'correct peers length')
      t.equal(swarm2.peers[0], peer, 'correct peer object')
    })
    swarm1.on('connect', function (stream) {
      t.pass('received "connect" event from swarm1')
      stream.write('123')
      stream.once('data', function (data) {
        t.pass('received stream data')
        t.equal(data.toString(), '456', 'correct data')
      })
    })
    swarm2.on('connect', function (stream) {
      t.pass('received "connect" event from swarm2')
      stream.write('456')
      stream.once('data', function (data) {
        t.pass('received stream data')
        t.equal(data.toString(), '123', 'correct data')
      })
    })
    swarm1.connect(streams[0], function (err, peer) {
      t.pass('swarm1 connect callback called')
      t.error(err, 'no error')
      t.ok(peer, 'got peer object')
    })
    swarm2.connect(streams[1], { incoming: true }, function (err, peer) {
      t.pass('swarm2 connect callback called')
      t.error(err, 'no error')
      t.ok(peer, 'got peer object')
    })
  })

  t.test('connect with incompatible networks', function (t) {
    t.plan(4)
    var swarm1 = Swarm('somenet', { wrtc: wrtc })
    var swarm2 = Swarm('somenet2', { wrtc: wrtc })
    var streams = createStreams()
    swarm1.connect(streams[0], function (err, peer) {
      t.ok(err, 'got error')
      t.equal(err.message, 'Peer does not have any networks in common.', 'correct error message')
    })
    swarm2.connect(streams[1], { incoming: true }, function (err, peer) {
      t.ok(err, 'got error')
      t.equal(err.message, 'Peer does not have any networks in common.', 'correct error message')
    })
  })

  t.test('connect with 2 outgoing', function (t) {
    var swarm1 = Swarm('somenet', { wrtc: wrtc })
    var swarm2 = Swarm('somenet', { wrtc: wrtc })
    var streams = createStreams()
    swarm2.on('error', function (err) {
      t.pass('got "error" event from swarm2')
      t.equal(err.message, 'Peer tried to connect to network "somenet" twice', 'correct error message')
      t.end()
    })
    swarm1.connect(streams[0])
    swarm2.connect(streams[1])
  })
})

test('accept', function (t) {
  t.test('simple accept', function (t) {
    t.plan(18)
    var swarm1 = Swarm('somenet', { wrtc: wrtc })
    var swarm2 = Swarm('somenet', { wrtc: wrtc })
    var streams = createStreams()
    swarm1.on('peer', function (peer) {
      t.pass('got "peer" event from swarm1')
      t.equal(swarm1.peers.length, 1, 'correct peers length')
      t.equal(swarm1.peers[0], peer, 'correct peer object')
    })
    swarm2.on('peer', function (peer) {
      t.pass('got "peer" event from swarm2')
      t.equal(swarm2.peers.length, 1, 'correct peers length')
      t.equal(swarm2.peers[0], peer, 'correct peer object')
    })
    swarm1.on('connect', function (stream) {
      t.pass('received "connect" event from swarm1')
      stream.write('123')
      stream.once('data', function (data) {
        t.pass('received stream data')
        t.equal(data.toString(), '456', 'correct data')
      })
    })
    swarm2.on('connect', function (stream) {
      t.pass('received "connect" event from swarm2')
      stream.write('456')
      stream.once('data', function (data) {
        t.pass('received stream data')
        t.equal(data.toString(), '123', 'correct data')
      })
    })
    swarm1.connect(streams[0], function (err, peer) {
      t.pass('swarm1 connect callback called')
      t.error(err, 'no error')
      t.ok(peer, 'got peer object')
    })
    swarm2.accept(streams[1], function (err, peer) {
      t.pass('swarm2 connect callback called')
      t.error(err, 'no error')
      t.ok(peer, 'got peer object')
    })
  })

  t.test('accept with opts', function (t) {
    t.plan(18)
    var swarm1 = Swarm('somenet', { wrtc: wrtc })
    var swarm2 = Swarm('somenet', { wrtc: wrtc })
    var streams = createStreams()
    swarm1.on('peer', function (peer) {
      t.pass('got "peer" event from swarm1')
      t.equal(swarm1.peers.length, 1, 'correct peers length')
      t.equal(swarm1.peers[0], peer, 'correct peer object')
    })
    swarm2.on('peer', function (peer) {
      t.pass('got "peer" event from swarm2')
      t.equal(swarm2.peers.length, 1, 'correct peers length')
      t.equal(swarm2.peers[0], peer, 'correct peer object')
    })
    swarm1.on('connect', function (stream) {
      t.pass('received "connect" event from swarm1')
      stream.write('123')
      stream.once('data', function (data) {
        t.pass('received stream data')
        t.equal(data.toString(), '456', 'correct data')
      })
    })
    swarm2.on('connect', function (stream) {
      t.pass('received "connect" event from swarm2')
      stream.write('456')
      stream.once('data', function (data) {
        t.pass('received stream data')
        t.equal(data.toString(), '123', 'correct data')
      })
    })
    swarm1.connect(streams[0], function (err, peer) {
      t.pass('swarm1 connect callback called')
      t.error(err, 'no error')
      t.ok(peer, 'got peer object')
    })
    swarm2.accept(streams[1], { foo: true }, function (err, peer) {
      t.pass('swarm2 connect callback called')
      t.error(err, 'no error')
      t.ok(peer, 'got peer object')
    })
  })
})

test('disconnect', function (t) {
  t.test('end connection with peer.close()', function (t) {
    var swarm1 = Swarm('somenet', { wrtc: wrtc })
    var swarm2 = Swarm('somenet', { wrtc: wrtc })

    t.test('setup', function (t) {
      t.plan(10)
      var streams = createStreams()
      swarm1.on('peer', function (peer) {
        t.pass('got "peer" event from swarm1')
        t.equal(swarm1.peers.length, 1, 'correct peers length')
        t.equal(swarm1.peers[0], peer, 'correct peer object')
      })
      swarm2.on('peer', function (peer) {
        t.pass('got "peer" event from swarm2')
        t.equal(swarm2.peers.length, 1, 'correct peers length')
        t.equal(swarm2.peers[0], peer, 'correct peer object')
      })
      swarm1.connect(streams[0], function (err, peer) {
        t.error(err, 'no error')
        t.pass('swarm1 connect callback called')
      })
      swarm2.accept(streams[1], function (err, peer) {
        t.error(err, 'no error')
        t.pass('swarm2 connect callback called')
      })
    })

    t.test('disconnect', function (t) {
      t.plan(4)
      swarm1.on('disconnect', function (peer) {
        t.pass('got "disconnect" event from swarm1')
        t.equal(swarm1.peers.length, 0, 'swarm1.peers is now empty')
      })
      swarm2.on('disconnect', function (peer) {
        t.pass('got "disconnect" event from swarm2')
        t.equal(swarm2.peers.length, 0, 'swarm2.peers is now empty')
      })
      swarm1.peers[0].close()
    })

    t.end()
  })

  t.test('end connection with socket.destroy()', function (t) {
    var swarm1 = Swarm('somenet', { wrtc: wrtc })
    var swarm2 = Swarm('somenet', { wrtc: wrtc })

    t.test('setup', function (t) {
      t.plan(11)
      createRTCStreams(function (err, streams) {
        t.error(err, 'no error')
        swarm1.on('peer', function (peer) {
          t.pass('got "peer" event from swarm1')
          t.equal(swarm1.peers.length, 1, 'correct peers length')
          t.equal(swarm1.peers[0], peer, 'correct peer object')
        })
        swarm2.on('peer', function (peer) {
          t.pass('got "peer" event from swarm2')
          t.equal(swarm2.peers.length, 1, 'correct peers length')
          t.equal(swarm2.peers[0], peer, 'correct peer object')
        })
        swarm1.connect(streams[0], function (err, peer) {
          t.error(err, 'no error')
          t.pass('swarm1 connect callback called')
        })
        swarm2.accept(streams[1], function (err, peer) {
          t.error(err, 'no error')
          t.pass('swarm2 connect callback called')
        })
      })
    })

    t.test('disconnect', function (t) {
      t.plan(4)
      swarm1.on('disconnect', function (peer) {
        t.pass('got "disconnect" event from swarm1')
        t.equal(swarm1.peers.length, 0, 'swarm1.peers is now empty')
      })
      swarm2.on('disconnect', function (peer) {
        t.pass('got "disconnect" event from swarm2')
        t.equal(swarm2.peers.length, 0, 'swarm2.peers is now empty')
      })
      swarm1.peers[0].socket.destroy()
    })

    t.end()
  })
})

test('getNewPeer', function (t) {
  var swarm1 = Swarm('somenet', { wrtc: wrtc, rtcConfig: rtcConfig })
  var swarm2 = Swarm('somenet', { wrtc: wrtc, rtcConfig: rtcConfig })
  var swarm3 = Swarm('somenet', { wrtc: wrtc, rtcConfig: rtcConfig, acceptIncoming: true })

  t.test('getNewPeer with no other peers', function (t) {
    t.test('setup', function (t) {
      t.plan(2)
      var streams = createStreams()
      swarm1.connect(streams[0], function (err, peer) {
        t.error(err, 'no error')
      })
      swarm2.accept(streams[1], function (err, peer) {
        t.error(err, 'no error')
      })
    })

    t.test('getNewPeer', function (t) {
      swarm1.getNewPeer(function (err, peer) {
        t.pass('getNewPeer callback called')
        t.ok(err, 'got error')
        t.notOk(peer, 'no peer returned')
        t.equal(err.message, 'Peer did not return any candidates', 'correct error message')
        t.end()
      })
    })

    t.end()
  })

  t.test('simple getNewPeer', function (t) {
    t.test('setup', function (t) {
      t.plan(2)
      var streams = createStreams()
      swarm3.connect(streams[0], function (err, peer) {
        t.error(err, 'no error')
      })
      swarm2.accept(streams[1], function (err, peer) {
        t.error(err, 'no error')
      })
    })
    t.test('getNewPeer', function (t) {
      t.plan(9)
      swarm1.on('connect', function (stream) {
        t.pass('swarm1 emitted "connect" event')
        stream.write('foo')
        stream.on('data', function (data) {
          t.pass('got stream data')
          t.equal(data.toString(), 'bar', 'correct data')
        })
      })
      swarm3.on('connect', function (stream) {
        t.pass('swarm2 emitted "connect" event')
        stream.write('bar')
        stream.on('data', function (data) {
          t.pass('got stream data')
          t.equal(data.toString(), 'foo', 'correct data')
        })
      })
      swarm1.getNewPeer(function (err, stream) {
        t.pass('getNewPeer callback called')
        t.error(err, 'no error')
        t.ok(stream, 'got stream object')
      })
    })
    t.end()
  })

  t.test('cleanup', function (t) {
    swarm1.close()
    swarm2.close()
    swarm3.close()
    t.end()
  })

  t.end()
})
