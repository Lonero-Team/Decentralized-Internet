const url = require('url')
const encodeHeader = require('bitcoin-protocol').types.header.encode
const encodeTx = require('bitcoin-protocol').types.transaction.encode
// TODO: create-hash package
const { createHash } = require('crypto')

function getRandom (array) {
  return array[Math.floor(Math.random() * array.length)]
}

function parseAddress (address) {
  // if address has a protocol in it, we don't need to add a fake one
  if ((/^\w+:\/\//).test(address)) return url.parse(address)
  return url.parse('x://' + address)
}

function assertParams (params) {
  // TODO: check more things
  // TODO: give more specific errors
  if (!params ||
    params.magic == null ||
    !params.defaultPort) {
    throw new Error('Invalid network parameters')
  }
}

function sha256 (data) {
  return createHash('sha256').update(data).digest()
}

function getBlockHash (header) {
  let headerBytes = encodeHeader(header)
  return sha256(sha256(headerBytes))
}

function getTxHash (tx) {
  let txBytes = encodeTx(tx)
  return sha256(sha256(txBytes))
}

module.exports = {
  getRandom,
  parseAddress,
  assertParams,
  getBlockHash,
  getTxHash,
  sha256
}
