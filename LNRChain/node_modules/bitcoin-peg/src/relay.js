'use strict'

const debug = require('debug')('bitcoin-peg:relay')
const SPVNode = require('webcoin')
const bitcoin = require('bitcoinjs-lib')
const { PeerGroup } = require('bitcoin-net')
const Blockchain = require('blockchain-spv')
const params = require('webcoin-bitcoin-testnet')
const encodeTx = require('bitcoin-protocol').types.transaction.encode
const download = require('blockchain-download')
const buildMerkleProof = require('bitcoin-merkle-proof').build
const reserve = require('./reserve.js')

// TODO: get this from somewhere else
const { getTxHash, getBlockHash } = require('bitcoin-net/src/utils.js')

// fetches bitcoin headers and relays any unprocessed ones to the peg chain
async function relayHeaders (pegClient, opts = {}) {
  let tries = opts.tries != null ? opts.tries : 1
  let netOpts = opts.netOpts
  let chainOpts = opts.chainOpts
  let batchSize = opts.batchSize || 250

  let chainState = await pegClient.state.bitcoin.chain
  let chain = Blockchain({
    store: chainState,
    indexed: true,
    // TODO: disable for mainnet
    allowMinDifficultyBlocks: true,
    ...chainOpts
  })

  // connect to bitcoin peers
  let peers = PeerGroup(params.net, netOpts) // TODO: configure
  peers.connect()
  await waitForPeers(peers)

  // catch up chain
  await download(chain, peers)
  peers.close()

  let chainState2 = await pegClient.state.bitcoin.chain
  let tip = chainState2[chainState2.length - 1]

  if (chain.height() <= tip.height) {
    // peg chain is up to date
    return tip
  }

  if (tries === 0) {
    throw Error('Failed to relay headers')
  }

  // check for reorg blocks to relay
  let reorg = []
  for (let i = chainState2.length - 1; i >= 0; i--) {
    let pegBlock = chainState2[i]
    let localBlock = chain.getByHeight(pegBlock.height)

    // found fork point
    if (getBlockHash(pegBlock).equals(getBlockHash(localBlock))) {
      reorg = reorg.reverse()
      break
    }

    reorg.push(localBlock)
  }

  let toRelay = reorg.concat(
    chain.store.slice(tip.height - chain.height())
  )

  for (let i = 0; i < toRelay.length; i += batchSize) {
    let batch = toRelay.slice(i, i + batchSize)
    // TODO: emit errors that don't have to do with duplicate headers
    await pegClient.send({
      type: 'bitcoin',
      headers: batch
    })
  }

  // call again to ensure peg chain is now up-to-date, or retry if needed
  return relayHeaders(pegClient, Object.assign({}, opts, { tries: tries - 1 }))
}

// fetches a bitcoin block, and relays the relevant transactions in it (plus merkle proof)
// to the peg chain
async function relayDeposits (pegClient, opts = {}) {
  opts.chainOpts = Object.assign({}, opts.chainOpts, {
    store: await pegClient.state.bitcoin.chain,
    indexed: true,
    // TODO: disable for mainnet
    allowMinDifficultyBlocks: true
  })

  await relayHeaders(pegClient, Object.assign({}, opts, { tries: 3 }))

  let node = SPVNode({
    network: 'testnet', // TODO: configure this
    netOpts: opts.netOpts,
    chainOpts: opts.chainOpts
  })
  node.on('error', (err) => {
    pegClient.emit('error', err)
  })

  // get info about signatory set
  let validators = convertValidatorsToLotion(pegClient.validators)
  let signatoryKeys = await pegClient.state.bitcoin.signatoryKeys
  let p2ss = reserve.createOutput(validators, signatoryKeys)
  let p2ssHash = bitcoin.payments.p2wsh({
    output: p2ss,
    network: node.bitcoinJsNetwork
  }).hash

  let processedTxs = await pegClient.state.bitcoin.processedTxs

  node.filter(p2ssHash)
  node.start()

  // scan for deposit txs, get list of blocks which have at least 1
  let blockHashes = []
  await node.scan(20, (tx, header) => {
    // skip if already relayed to chain
    let txHashBase64 = getTxHash(tx).toString('base64')
    if (processedTxs[txHashBase64]) return

    // add blockHash to list, will fetch and build proof
    let blockHash = getBlockHash(header)
    if (blockHashes.length === 0 || !blockHash.equals(blockHashes[blockHashes.length - 1])) {
      blockHashes.push(blockHash)
    }
  })

  // fetch entire blocks so we can build proofs
  let blocks = await new Promise((resolve, reject) => {
    // TODO: filter so we don't have to download whole blocks
    node.peers.getBlocks(blockHashes, (err, blocks) => {
      if (err) return reject(err)
      resolve(blocks)
    })
  })
  // add height property to blocks
  for (let block of blocks) {
    let hash = getBlockHash(block.header)
    let header = node.chain.getByHash(hash)
    block.header.height = header.height
  }

  node.close()

  // submit a merkle proof tx to chain for each block, and ensure it got accepted
  let relayJobs = blocks.map((block) => relayBlock(pegClient, block, p2ss))
  let txids = await Promise.all(relayJobs)
  return [].concat(...txids)
}

async function relayBlock (pegClient, block, p2ss) {
  // relay any unprocessed txs (max of 4 tries)
  for (let i = 0; i < 4; i++) {
    let processedTxs = await pegClient.state.bitcoin.processedTxs

    // get txs to be relayed
    let hashes = [] // all hashes in block (so we can generate merkle proof)
    let includeHashes = [] // hashes to be included in proof
    let includeTxs = [] // txs to be included in proof
    let relayedHashes = [] // hashes already processed on the peg chain
    for (let tx of block.transactions) {
      let txid = getTxHash(tx)
      hashes.push(txid)

      // filter out txs that aren't valid deposits
      if (!isDepositTx(tx, p2ss)) continue

      // filter out txs that were already processed
      let txidBase64 = txid.toString('base64')
      if (processedTxs[txidBase64]) {
        relayedHashes.push(txid)
        continue
      }

      includeHashes.push(txid)
      includeTxs.push(tx)
    }

    // no txs left to process (success)
    // (either someone else relayed them, or there weren't any in the first place)
    if (includeHashes.length === 0) {
      return relayedHashes
    }

    let proof = buildMerkleProof({ hashes, include: includeHashes })
    // nodes verify against merkleRoot of stored header, so we don't need the `merkleProof` field
    delete proof.merkleRoot

    // we ignore response since it might have already been relayed by someone else
    let tx = {
      type: 'bitcoin',
      height: block.header.height,
      proof,
      transactions: includeTxs.map((tx) => encodeTx(tx))
    }
    let res = await pegClient.send(tx)
    debug('sent deposit relay transaction: ', tx, res)

    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  throw Error('Failed to fetch and relay block')
}

// calls `relayDeposits` and ensures given txid was relayed
async function relayDeposit (pegClient, txid) {
  if (!Buffer.isBuffer(txid)) {
    throw Error('Must specify txid')
  }
  let txidBase64 = txid.toString('base64')

  // relay deposit txs in latest bitcoin block
  let txids = await relayDeposits(pegClient)

  // check to see if given txid was relayed in this block
  let txidsBase64 = txids.map((txid) => txid.toString('base64'))
  if (txidsBase64.includes(txidBase64)) {
    // success, txid was relayed
    return
  }

  // maybe txid was in an older block? check if it was relayed
  let processedTxs = await pegClient.state.bitcoin.processedTxs
  if (processedTxs[txidBase64]) {
    // success, txid was relayed
    return
  }

  // TODO: instead of erroring here,
  //       1. scan for confirmation. if deposit not confirmed then error
  //       2. relay
  throw Error('Deposit transaction was not relayed')
}

// TODO: build the 3 separate transactions as outlined in the design document
function buildDisbursalTransaction (signedTx, validators, signatoryKeys) {
  // build tx
  let tx = reserve.buildOutgoingTx(signedTx, validators, signatoryKeys)

  // insert signatory set's signatures as p2wsh witness
  let redeemScript = reserve.createWitnessScript(validators, signatoryKeys)
  for (let i = 0; i < tx.ins.length; i++) {
    let signatures = getSignatures(signedTx.signatures, i)
    let scriptSig = reserve.createScriptSig(signatures)
    let p2wsh = bitcoin.payments.p2wsh({
      redeem: {
        input: scriptSig,
        output: redeemScript
      }
    })
    tx.setWitness(i, p2wsh.witness)
  }

  return tx
}

function isDepositTx (tx, p2ss) {
  if (tx.outs.length !== 2) return false
  if (!tx.outs[0].script.equals(p2ss)) return false
  // TODO: check 2nd output is correct format
  // TODO: other checks?
  return true
}

// converts validator set from Tendermint RPC format
// to Lotion {<pubkeyB64>: <votingPower>, ...} object
function convertValidatorsToLotion (validators) {
  return validators.reduce((obj, v) => {
    obj[v.pub_key.value] = v.voting_power
    return obj
  }, {})
}

// gets the signatures for the given input index from the
// peg network's signedTx state object as hex
function getSignatures (signatures, index) {
  return signatures.map((sigs) => {
    if (sigs == null) return null
    return sigs[index].toString('hex') +
      '01' // SIGHASH_ALL
  })
}

function waitForPeers (peers) {
  return new Promise((resolve) => {
    function onPeer (peer) {
      let isLocalhost = peer.socket.remoteAddress === '127.0.0.1'
      if (!isLocalhost && peers.peers.length < 4) {
        return
      }
      peers.removeListener('peer', onPeer)
      resolve()
    }
    peers.on('peer', onPeer)
  })
}

module.exports = {
  relayHeaders,
  relayDeposits,
  relayDeposit,
  buildDisbursalTransaction,
  isDepositTx,
  convertValidatorsToLotion
}
