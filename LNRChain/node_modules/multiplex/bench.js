var multiplex = require('./')
var time = Date.now()

var plex = multiplex(function (stream, name) {
  stream.pipe(stream)
})

plex.pipe(plex)

var stream = plex.createStream()
var hello = new Buffer(16 * 1024 - 1)
var sent = 100000
var rcvd = 0

// the bench is just to test the actual parsing speed on multiplex
// don't put too much weight into it - its mainly used to spot performance regressions between commits
stream.on('data', function (data) {
  rcvd += data.length
  if (!--sent) {
    var delta = Date.now() - time
    console.log('%d b/s (%d ms)', Math.floor(100000 * rcvd / delta) / 100, delta)
    process.exit(0)
  }
})

stream.pipe(stream)
stream.write(hello)
