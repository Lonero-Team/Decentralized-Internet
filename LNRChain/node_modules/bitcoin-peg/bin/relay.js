#!/usr/bin/env node

let { PeerGroup } = require('bitcoin-net')
let Inventory = require('bitcoin-inventory')
let params = require('webcoin-bitcoin-testnet')
let connect = require('lotion-connect')
let {
  relayDeposits,
  convertValidatorsToLotion,
  buildDisbursalTransaction
} = require('../src/relay.js')

// TODO: get this from somewhere else
let { getTxHash } = require('bitcoin-net/src/utils.js')

// TODO: keep one webcoin node alive and watch for new blocks/deposits
// TODO: listen for transactions on lotion light client

async function main () {
  let gci = process.argv[2]
  if (gci == null) {
    console.error('usage: node relay.js <GCI>')
    process.exit(1)
  }

  let client = await connect(gci)
  console.log('connected to peg zone network')

  relayDeposits(client)
    .catch((err) => console.error(err.stack))

  relayDisbursal(client)
    .catch((err) => console.error(err.stack))

  await sleep(60)

  process.exit()
}

async function relayDisbursal (client) {
  let signedTx = await client.state.bitcoin.signedTx
  if (!signedTx) return // no tx to sign

  let validators = convertValidatorsToLotion(client.validators)
  let signatoryKeys = await client.state.bitcoin.signatoryKeys

  let tx = buildDisbursalTransaction(signedTx, validators, signatoryKeys)
  await broadcastTx(tx)
}

function broadcastTx (tx) {
  return new Promise((resolve, reject) => {
    // connect to network to listen for txs
    let broadcastPeers = PeerGroup(params.net) // TODO: configurable params
    let listenPeers = PeerGroup(params.net, { peerOpts: { relay: true } }) // TODO: configurable params
    let inventory = Inventory(broadcastPeers)
    broadcastPeers.connect()
    listenPeers.connect()

    // handle errrors
    broadcastPeers.on('error', reject)
    listenPeers.on('error', reject)
    inventory.on('error', reject)

    let interval = setInterval(() => {
      if (broadcastPeers.peers.length < 7) return
      if (listenPeers.peers.length < 7) return
      inventory.broadcast(tx)
      listenPeers.send('mempool')
    }, 3000)

    // count how many peers relay our tx back to us so we know they liked it
    let relayCount = 0
    let txid = getTxHash(tx)
    listenPeers.on('inv', inv => {
      let isOurTx = false
      for (let { hash } of inv) {
        if (hash.equals(txid)) {
          isOurTx = true
          break
        }
      }

      if (!isOurTx) return
      relayCount += 1
      if (relayCount < 3) return

      // 4 people relayed it back to us, we're done!
      clearInterval(interval)
      listenPeers.close()
      broadcastPeers.close()
      resolve()
    })
  })
}

function sleep (seconds = 1) {
  return new Promise((resolve) =>
    setTimeout(resolve, seconds * 1000))
}

main().catch((err) => {
  console.error(err.stack)
  process.exit(1)
})
