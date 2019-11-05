let secp256k1 = require('secp256k1')
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
    if (!secp256k1.verify(sigHash, signature, pubkey)) {
      throw Error('Invalid signature')
    }
  }
}
