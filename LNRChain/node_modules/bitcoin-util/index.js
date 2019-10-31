var reverse = require('buffer-reverse')

var nullHash = new Buffer('0000000000000000000000000000000000000000000000000000000000000000', 'hex')

function isHexString (str) {
  return !(typeof str !== 'string' || str.length === 0 || str.length % 2)
}

function toHash (hex) {
  if (hex.length !== 64 || !isHexString(hex)) {
    throw new Error('argument must be a hex string')
  }
  return reverse(new Buffer(hex, 'hex'))
}

function compressTarget (target) {
  if (!Buffer.isBuffer(target)) {
    throw new Error('target must be a "Buffer"')
  }
  if (target.length !== 32) {
    throw new Error('target must be 32 bytes long')
  }

  for (var i = 0; i < 29; i++) {
    if (target[i]) break
  }
  var exponent = 32 - i
  var mantissa = target.readUInt32BE(i) >> 8 & 0x00ffffff
  if (mantissa & 0x00800000) {
    mantissa >>= 8
    exponent++
  }
  return (exponent << 24) | mantissa
}

function expandTarget (bits) {
  if (bits > 0xffffffff) {
    throw new Error('"bits" may not be larger than 4 bytes')
  }
  var exponent = bits >>> 24
  if (exponent <= 3) throw new Error('target exponent must be > 3')
  if (exponent > 32) throw new Error('target exponent must be < 32')
  var mantissa = bits & 0x007fffff
  var target = new Buffer(32).fill(0)
  target.writeUInt32BE(mantissa << 8, 32 - exponent)
  return target
}

module.exports = {
  nullHash: nullHash,
  toHash: toHash,
  compressTarget: compressTarget,
  expandTarget: expandTarget
}
