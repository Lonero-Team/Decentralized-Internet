var createParams = require('./lib/utils.js').createParams

module.exports = createParams({
  blockchain: require('./lib/blockchain.js'),
  net: {}
}, false)
