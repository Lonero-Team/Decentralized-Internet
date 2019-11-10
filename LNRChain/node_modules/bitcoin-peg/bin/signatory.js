#!/usr/bin/env node

'use strict'

let { readFileSync, writeFileSync } = require('fs')
let { randomBytes } = require('crypto')
let { join, dirname } = require('path')
let secp = require('secp256k1')
let { connect } = require('lotion')
let {
  commitPubkey,
  signDisbursal
} = require('../src/signatory.js')
let DJSON = require('deterministic-json')

async function main () {
  let gci = process.argv[2]
  let privValidatorPath = process.argv[3]

  if (gci == null || privValidatorPath == null) {
    console.error('usage: node signatory.js <GCI or genesis> <priv_validator>')
    process.exit(1)
  }

  // maybe read genesis
  let genesis
  if (gci.includes('/') || gci.includes('\\')) {
    let genesisPath = gci
    gci = null
    let genesisJSON = readFileSync(genesisPath)
    genesis = JSON.parse(genesisJSON)
  }

  // load privValidator
  let privValidatorJSON = readFileSync(privValidatorPath)
  let privValidator = JSON.parse(privValidatorJSON)

  // load or generate signatory key
  let signatoryKey
  let signatoryKeyPath = join(dirname(privValidatorPath), 'priv_signatory.json')
  try {
    let signatoryKeyJSON = readFileSync(signatoryKeyPath)
    signatoryKey = DJSON.parse(signatoryKeyJSON)
    console.log('loaded signatory private key')
  } catch (err) {
    signatoryKey = { priv: randomBytes(32) }
    let signatoryKeyJSON = DJSON.stringify(signatoryKey)
    writeFileSync(signatoryKeyPath, signatoryKeyJSON)
    console.log(`generated signatory private key, saved to "${signatoryKeyPath}"`)
  }

  let client = await connect(gci, {
    genesis,
    nodes: gci ? null : ['ws://localhost:1338']
  })
  console.log('connected to peg zone network')

  // ensure we haven't committed to a key yet
  let signatoryPub = secp.publicKeyCreate(signatoryKey.priv)
  let committedPub = await client.state.bitcoin.signatoryKeys[privValidator.pub_key.value]
  if (committedPub != null && !committedPub.equals(signatoryPub) && !process.argv.includes('-f')) {
    console.log('already committed to a different signatory key. i hope you didn\'t lose the private key you committed to...')
    process.exit(1)
  }
  // commit to a signatory key
  if (committedPub == null || !committedPub.equals(signatoryPub)) {
    await commitPubkey(client, privValidator, signatoryPub)
    console.log('committed to signatory key on chain')
  }

  // sign transactions as needed
  while (true) {
    try {
      await signDisbursal(client, signatoryKey.priv)
      console.log('signed disbursal')
    } catch (err) {
      if (err.message !== 'No tx to be signed') {
        throw err
      }
    }
    await delay(5000)
  }
}

main().catch((err) => {
  console.error(err.stack)
  process.exit(1)
})

function delay (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
