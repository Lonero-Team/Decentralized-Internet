#!/usr/bin/env node

let fs = require('fs')
let os = require('os')
let secp256k1 = require('secp256k1')
let { randomBytes } = require('crypto')
let wallet = require('./src/wallet.js')

// generates or loads wallet from default path (~/.coins)
let path = os.homedir() + '/.coins'
let privKey
if (!fs.existsSync(path)) {
  do {
    privKey = randomBytes(32)
  } while (!secp256k1.privateKeyVerify(privKey))
  fs.writeFileSync(path, privKey.toString('hex'))
} else {
  privKey = Buffer.from(fs.readFileSync(path, 'utf8'), 'hex')
}

let address = wallet(privKey).address()

console.error('Your Address:')
console.log(address)
console.error(`
Your wallet seed is stored at "~/.coins",
make sure to keep it secret!`)
