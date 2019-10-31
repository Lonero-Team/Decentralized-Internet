let DC = require('discovery-channel')
let debug = require('debug')('lotion-connect:discovery')
let {
  startLightClientFromGCI
} = require('./connect-by-address.js')

function discover (GCI) {
  return new Promise((resolve, reject) => {
    let channel = DC()
    channel.on('error', reject)
    channel.on('peer', onPeer)
    channel.join(GCI)

    function done (peer) {
      channel.destroy()
      resolve(peer)
    }

    let connecting = false
    let peerQueue = []
    async function onPeer (id, peer) {
      // only try one peer at a time
      if (connecting) {
        // enqueue peer if we hear about it while attempting connection
        // to another
        peerQueue.push(peer)
        return
      }
      connecting = true

      try {
        // connectWithGCI will ensure peer serves the correct
        // genesis, and will use that to intialize the light client.
        // if this is a bad peer, we'll keep waiting to discover
        // a good one.
        let address = `ws://${peer.host}:${peer.port}`
        debug(`attempting to connect to "${address}"`)
        let client = await startLightClientFromGCI(GCI, address)
        debug('peer is valid')
        done(client)

      } catch (err) {
        // swallow errors since they can be trivially casued
        // by bad peers. try again with a different peer we heard about,
        // or if none we'll wait to hear about more
        debug('error connecting to new potential peer', err.stack)
        connecting = false
        if (peerQueue.length > 0) {
          let nextPeer = peerQueue.shift()
          await onPeer(null, nextPeer)
        }
      }
    }
  })
}

module.exports = discover
