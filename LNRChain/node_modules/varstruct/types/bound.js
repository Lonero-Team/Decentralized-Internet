'use strict'
var util = require('../util')

module.exports = function (itemType, checkValue) {
  if (!util.isAbstractCodec(itemType)) throw new TypeError('itemType is invalid codec')
  if (typeof checkValue !== 'function') throw new TypeError('checkValue must be a function')

  return {
    encode: function encode (value, buffer, offset) {
      checkValue(value)
      buffer = itemType.encode(value, buffer, offset)
      encode.bytes = itemType.encode.bytes
      return buffer
    },
    decode: function decode (buffer, offset, end) {
      var value = itemType.decode(buffer, offset, end)
      checkValue(value)
      decode.bytes = itemType.decode.bytes
      return value
    },
    encodingLength: function encodingLength (value) {
      checkValue(value)
      return itemType.encodingLength(value)
    }
  }
}
