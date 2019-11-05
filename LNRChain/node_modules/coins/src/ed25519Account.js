let ed25519 = require('supercop.js')
try {
  // try to load native version
  ed25519 = require('ed25519-supercop')
} catch (err) {}

let { addressHash } = require('./common.js')

module.exports = {
  // address is hash of pubkey
  getAddress (input) {
    return addressHash(input.pubkey)
  },

  // specify rule for taking money out of account
  // (must have a valid signature from this account's pubkey)
  onSpend ({ pubkey, signature }, { sigHash }) {
    // verify signature
    if (!ed25519.verify(signature, sigHash, pubkey)) {
      throw Error('Invalid signature')
    }
  }
}
