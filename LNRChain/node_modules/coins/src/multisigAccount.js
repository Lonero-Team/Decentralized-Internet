let secp256k1 = require('secp256k1')
let { addressHash } = require('./common.js')

module.exports = {
  // address is hash of threshold combined with list of pubkeys
  getAddress (input) {
    let { threshold, pubkeys } = input
    return addressHash(`${threshold}/${pubkeys.join()}`)
  },

  // can only spend if there are at least `threshold` valid sigs
  onSpend ({ threshold, pubkeys, signatures }, { sigHash }) {
    // verify and count valid signatures
    let validSigs = 0
    for (let i = 0; i < pubkeys.length; i++) {
      let pubkey = pubkeys[i]
      let signature = signatures[i]

      // skip null sigs
      if (signature.length === 0) continue

      // verify signatures[i] against pubkeys[i]
      if (!secp256k1.verify(sigHash, signature, pubkey)) {
        throw Error('Invalid signature')
      }
      validSigs += 1

      // if enough sigs, the spend is valid
      if (validSigs === threshold) return
    }

    throw Error('Not enough signatures to meet threshold')
  }
}
