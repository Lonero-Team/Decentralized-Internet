var DC = require('./index.js')
var bufferFrom = require('buffer-from')

var channel = DC({
  dns: {
    servers: [
      'discovery1.publicbits.org',
      'discovery2.publicbits.org'
    ]
  }
})

var hash = bufferFrom('deadbeefbeefbeefbeefdeadbeefbeefbeefbeef', 'hex')

channel.join(hash)
channel.on('peer', function (hash, peer, type) {
  console.log('found peer: ' + peer.host + ':' + peer.port + ' using ' + type + (peer.local ? ' (local)' : ''))
})
