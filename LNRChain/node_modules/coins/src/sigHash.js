let { clone, sha256, normalizeTx } = require('./common.js')
let { stringify } = require('deterministic-json')

// gets the hash of a transaction to be used for signing
module.exports = function getSigHash (tx) {
  tx = clone(tx)
  normalizeTx(tx)

  // exclude properties of inputs named "signature" or "signatures"
  // (we can't check the signature against the hash of the signature!)
  for (let input of tx.from) {
    for (let key in input) {
      if (key === 'signature' || key === 'signatures') {
        delete input[key]
      }
    }
  }

  // stringify tx deterministically (and convert buffers to strings)
  // then return sha256 hash of that
  let txString = stringify(tx)
  return sha256(txString)
}
