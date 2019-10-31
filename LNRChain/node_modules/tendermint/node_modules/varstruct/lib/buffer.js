'use strict'
const Buffer = require('safe-buffer').Buffer

module.exports = function (length) {
  if (typeof length !== 'number') throw new TypeError('length must be a number')

  function encodingLength () {
    return length
  }

  function encode (value, buffer, offset) {
    if (!Buffer.isBuffer(value)) throw new TypeError('value must be a Buffer instance')
    if (value.length !== length) throw new RangeError('value.length is out of bounds')
    if (!buffer) return Buffer.from(value)
    if (!offset) offset = 0
    if (offset + length > buffer.length) throw new RangeError('destination buffer is too small')
    value.copy(buffer, offset)
    return buffer
  }

  function decode (buffer, offset, end) {
    if (!offset) offset = 0
    if (!end) end = buffer.length
    if (offset + length > end) throw new RangeError('not enough data for decode')
    return Buffer.from(buffer.slice(offset, offset + length))
  }

  encode.bytes = decode.bytes = length
  return { encode, decode, encodingLength }
}
