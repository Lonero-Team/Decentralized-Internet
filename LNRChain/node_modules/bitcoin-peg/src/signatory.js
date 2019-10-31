'use strict'

const { createHash } = require('crypto')
const ed = require('ed25519-supercop')
const secp = require('secp256k1')
const bitcoin = require('bitcoinjs-lib')
const {
  getSignatorySet,
  buildOutgoingTx,
  createWitnessScript
} = require('./reserve.js')
const { convertValidatorsToLotion } = require('./relay.js')

async function commitPubkey (client, privValidator, signatoryPub) {
  if (!secp.publicKeyVerify(signatoryPub)) {
    throw Error('Invalid signatory public key')
  }

  // locate our validator key in validators array
  let validators = convertValidatorsToLotion(client.validators)
  let signatorySet = getSignatorySet(validators)
  let signatoryIndex
  for (let i = 0; i < signatorySet.length; i++) {
    let signatory = signatorySet[i]
    if (signatory.validatorKey === privValidator.pub_key.value) {
      signatoryIndex = i
      break
    }
  }
  if (signatoryIndex == null) {
    throw Error('Given validator key not found in validator set')
  }

  let signature = ed25519Sign(privValidator, signatoryPub)

  return checkResult(await client.send({
    type: 'bitcoin',
    signatoryIndex,
    signatoryKey: signatoryPub,
    signature
  }))
}

async function signDisbursal (client, signatoryPriv) {
  let signatoryPub = secp.publicKeyCreate(signatoryPriv)
  let validators = convertValidatorsToLotion(client.validators)
  let signatoryKeys = await client.state.bitcoin.signatoryKeys
  let signatorySet = getSignatorySet(validators)
  let signatoryIndex
  for (let i = 0; i < signatorySet.length; i++) {
    let signatory = signatorySet[i]
    if (signatoryKeys[signatory.validatorKey].equals(signatoryPub)) {
      // found our signatory
      signatoryIndex = i
      break
    }
  }
  if (signatoryIndex == null) {
    throw Error('Given signatory key not found in signatory set')
  }

  let signingTx = await client.state.bitcoin.signingTx
  if (signingTx == null) {
    throw Error('No tx to be signed')
  }

  let bitcoinTx = buildOutgoingTx(signingTx, validators, signatoryKeys)

  let p2ss = createWitnessScript(validators, signatoryKeys)
  let sigHashes = signingTx.inputs.map((input, i) =>
    bitcoinTx.hashForWitnessV0(i, p2ss, input.amount, bitcoin.Transaction.SIGHASH_ALL))
  let signatures = sigHashes.map((hash) => {
    let signature = secp.sign(hash, signatoryPriv).signature
    return secp.signatureExport(signature)
  })

  return checkResult(await client.send({
    type: 'bitcoin',
    signatures,
    signatoryIndex
  }))
}

function sha512 (data) {
  return createHash('sha512').update(data).digest()
}

function ed25519Sign (privValidator, message) {
  if (privValidator.priv_key.type !== 'tendermint/PrivKeyEd25519') {
    throw Error('Expected privkey type "tendermint/PrivKeyEd25519"')
  }

  let pub = Buffer.from(privValidator.pub_key.value, 'base64')
  let ref10Priv = Buffer.from(privValidator.priv_key.value, 'base64')
  let priv = convertEd25519(ref10Priv)

  return ed.sign(message, pub, priv)
}

// TODO: move this somewhere else
function convertEd25519 (ref10Priv) {
  // see https://github.com/orlp/ed25519/issues/10#issuecomment-242761092
  let privConverted = sha512(ref10Priv.slice(0, 32))
  privConverted[0] &= 248
  privConverted[31] &= 63
  privConverted[31] |= 64
  return privConverted
}

function checkResult (res) {
  if (res.check_tx.code || res.deliver_tx.code) {
    let log = res.check_tx.log || res.deliver_tx.log
    throw Error(log)
  }
  return res
}

module.exports = {
  commitPubkey,
  signDisbursal,
  convertEd25519
}
