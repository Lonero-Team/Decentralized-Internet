'use strict';

var _require = require('./hash.js'),
    tmhash = _require.tmhash;

function getAddress(pubkey) {
  var bytes = Buffer.from(pubkey.value, 'base64');
  return tmhash(bytes).slice(0, 20).toString('hex').toUpperCase();
}

module.exports = { getAddress: getAddress };