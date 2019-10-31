'use strict'
const util = require('./util')

module.exports = function (type, checkValue) {
  if (!util.isAbstractCodec(type)) throw new TypeError('itemType is invalid codec')
  if (typeof checkValue !== 'function') throw new TypeError('checkValue must be a function')

  function encode (value, buffer, offset) {
    checkValue(value)
    buffer = type.encode(value, buffer, offset)
    encode.bytes = type.encode.bytes
    return buffer
  }

  function decode (buffer, offset, end) {
    const value = type.decode(buffer, offset, end)
    checkValue(value)
    decode.bytes = type.decode.bytes
    return value
  }

  function encodingLength (value) {
    checkValue(value)
    return type.encodingLength(value)
  }

  return { encode, decode, encodingLength }
}
