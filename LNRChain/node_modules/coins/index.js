module.exports = require('./src/coins.js')
Object.assign(module.exports, {
  // handlers
  ed25519Account: require('./src/ed25519Account.js'),
  secp256k1Account: require('./src/secp256k1Account.js'),
  multisigAccount: require('./src/multisigAccount.js'),
  burnHandler: require('./src/common.js').burnHandler,

  // handler wrapper
  accounts: require('./src/accounts.js'),

  // helper functions
  getSigHash: require('./src/sigHash.js'),
  addressHash: require('./src/common.js').addressHash,
  hashToAddress: require('./src/common.js').hashToAddress,

  // wallet constructor
  wallet: require('./src/wallet.js')
})
