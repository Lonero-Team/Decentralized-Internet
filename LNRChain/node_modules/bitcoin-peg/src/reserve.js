'use strict'

let { script, Transaction, payments, networks } = require('bitcoinjs-lib')

const MAX_SIGNATORIES = 76
const MIN_RELAY_FEE = 1000

const firstSignatory = ({ pubkey, votingPower }) => `
  ${pubkey} OP_CHECKSIG
  OP_IF
    ${uint(votingPower)}
  OP_ELSE
    OP_0
  OP_ENDIF
`

const nthSignatory = ({ pubkey, votingPower }) => `
  OP_SWAP
    ${pubkey} OP_CHECKSIG
  OP_IF
    ${uint(votingPower)}
    OP_ADD
  OP_ENDIF
`

const compare = (threshold) => `
  ${uint(threshold)}
  OP_GREATERTHAN
`

function signature (signature) {
  return signature || 'OP_0'
}

function uint (n) {
  n = Number(n)
  if (!Number.isInteger(n)) {
    throw Error('Number must be an integer')
  }
  if (n > 0xffffffff || n < 0) {
    throw Error('Number must be >= 0 and < 2^32')
  }
  let nHex = n.toString(16)
  if (nHex.length % 2 === 1) {
    nHex = '0' + nHex
  }
  return nHex
}

function getVotingPowerThreshold (signatories) {
  let totalVotingPower = signatories.reduce((sum, s) => sum + s.votingPower, 0)
  let twoThirdsVotingPower = Math.ceil(totalVotingPower * 2 / 3)
  return twoThirdsVotingPower
}

function createWitnessScript (validators, signatoryKeys) {
  // get signatory key for each signatory
  let signatories = getSignatorySet(validators)
    .map(({ validatorKey, votingPower }) => {
      let pubkey = signatoryKeys[validatorKey]
      if (pubkey) {
        pubkey = pubkey.toString('hex')
      }
      return { pubkey, votingPower }
    })
    .filter((s) => s.pubkey != null)

  let twoThirdsVotingPower = getVotingPowerThreshold(signatories)

  let asm =
    firstSignatory(signatories[0]) +
    signatories
      .slice(1)
      .map(nthSignatory)
      .join('\n') +
    compare(twoThirdsVotingPower)

  return script.fromASM(trim(asm))
}

function createScriptSig (signatures) {
  let asm = signatures
    .map(signature)
    .reverse()
    .join('\n')

  return script.fromASM(trim(asm))
}

function trim (s) {
  return s
    .split(/\s/g)
    .filter((s) => !!s)
    .join(' ')
}

// gets the array of validators who are in the signatory set.
// note that each will commit to a separate secp256k1 signatory
// key for bitcoin transactions.
function getSignatorySet (validators) {
  let entries = Object.entries(validators)
  entries.sort((a, b) => {
    // sort by voting power, breaking ties with pubkey
    let cmp = b[1] - a[1]
    if (cmp === 0) {
      cmp = b[0] < a[0] ? 1 : -1
    }
    return cmp
  })
  return entries
    .map(([ validatorKey, votingPower ]) =>
      ({ validatorKey, votingPower }))
    .slice(0, MAX_SIGNATORIES)
}

function buildOutgoingTx (signingTx, validators, signatoryKeys) {
  let { inputs, outputs } = signingTx

  let tx = new Transaction()
  let totalAmount = 0

  for (let { txid, index, amount } of inputs) {
    tx.addInput(txid, index)
    totalAmount += amount
  }

  let remainingAmount = totalAmount
  for (let { script, amount } of outputs) {
    tx.addOutput(script, amount)
    remainingAmount -= amount
    if (remainingAmount <= 0) {
      throw Error('Output amount exceeds input amount')
    }
  }

  // change output
  let p2ss = createOutput(validators, signatoryKeys)
  tx.addOutput(p2ss, remainingAmount)

  // withdrawals pay fee
  let txLength = tx.byteLength()
  let feeAmount = txLength // 1 satoshi per byte
  // TODO: configure min relay fee
  feeAmount = Math.max(feeAmount, MIN_RELAY_FEE)
  // TODO: adjust fee amount
  let feeAmountPerWithdrawal = Math.ceil(feeAmount / outputs.length)
  for (let i = 0; i < outputs.length; i++) {
    tx.outs[i].value -= feeAmountPerWithdrawal
    if (tx.outs[i].value <= 0) {
      // TODO: remove this output and start fee paying process over
      throw Error('Output is not large enough to pay fee')
    }
  }

  return tx
}

function createOutput (validators, signatoryKeys) {
  // p2ss = pay to signatory set
  let p2ss = createWitnessScript(validators, signatoryKeys)

  return payments.p2wsh({
    redeem: { output: p2ss },
    network: networks.testnet // TODO
  }).output
}

module.exports = {
  createWitnessScript,
  createScriptSig,
  getSignatorySet,
  getVotingPowerThreshold,
  buildOutgoingTx,
  createOutput
}
