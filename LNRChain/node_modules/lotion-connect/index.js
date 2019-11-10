let {
  startLightClientFromGCI,
  startLightClientFromGenesis
} = require('./lib/connect-by-address.js')
let GetState = require('./lib/get-state.js')
let SendTx = require('./lib/send-tx.js')
let discoverPeerByGCI = require('./lib/gci-get-peer.js')
let Proxmise = require('proxmise')
let { parse, stringify } = require('deterministic-json')
let { EventEmitter } = require('events')

async function connect(GCI, opts = {}) {
  let nodes = opts.nodes || []
  let genesis = opts.genesis

  if (!GCI) {
    if (nodes.length === 0) {
      throw Error('Cannot connect, must specify GCI or node addresses')
    } else if (genesis == null) {
      throw Error('Cannot verify state, must specify GCI or genesis')
    }
  }

  // TODO: support bootstrapping from known recent header hash
  // instead of just by GCI->genesis->lc_state
  let lc
  if (nodes.length) {
    // randomly sample from supplied seed nodes
    // TODO: pass all of these into light client
    //       once it supports multiple peers
    let randomIndex = Math.floor(Math.random() * nodes.length)
    let address = nodes[randomIndex]
    if (genesis) {
      lc = await startLightClientFromGenesis(genesis, address)
    } else {
      lc = await startLightClientFromGCI(GCI, address)
    }
  } else {
    // gci discovery magic...
    lc = await discoverPeerByGCI(GCI)
  }

  let getState = GetState(lc)
  let sendTx = SendTx(lc)

  let bus = new EventEmitter()
  lc.on('error', e => bus.emit('error', e))
  return Object.assign(bus, {
    getState,
    send: sendTx,
    lightClient: lc,
    state: Proxmise(path => {
      return getState(path.join('.'))
    }),
    get validators() {
      return lc._state.validators
    }
  })
}

module.exports = connect
