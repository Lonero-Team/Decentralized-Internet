let { EventEmitter } = require('events')

function createAppHashStore(lc) {
  let bus = new EventEmitter()
  let appHashByHeight = {}
  lc.on('update', function(header) {
    let appHash = header.app_hash
    appHashByHeight[header.height - 1] = appHash
  })
  setInterval(function() {
    // TODO: replace this with rpc block subscribe.
    // currently only one block subscription is supported per connection,
    // and the light client uses it
    bus.emit('block')
  }, 1000)
  return {
    getHashAtHeight(height) {
      return new Promise((resolve, reject) => {
        function checkForAppHash() {
          if (appHashByHeight[height]) {
            bus.removeListener('block', checkForAppHash)
            resolve(appHashByHeight[height].toLowerCase())
          }
        }
        checkForAppHash()
        bus.on('block', checkForAppHash)
      })
    }
  }
}

module.exports = createAppHashStore
