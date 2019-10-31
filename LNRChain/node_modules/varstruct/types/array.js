'use strict'
var util = require('../util')

module.exports = function (length, itemType) {
  if (typeof length !== 'number') throw new TypeError('length must be a number')
  if (!util.isAbstractCodec(itemType)) throw new TypeError('itemType is invalid codec')

  function _length (items) {
    return util.reduce(items, function (total, item) {
      return total + itemType.encodingLength(item)
    }, 0)
  }

  return {
    encode: function encode (value, buffer, offset) {
      if (!Array.isArray(value)) throw new TypeError('value must be an Array instance')
      if (value.length !== length) throw new RangeError('value.length is out of bounds')
      if (!buffer) buffer = new Buffer(_length(value))
      if (!offset) offset = 0
      encode.bytes = util.reduce(value, function (loffset, item) {
        itemType.encode(item, buffer, loffset)
        return loffset + itemType.encode.bytes
      }, offset) - offset
      return buffer
    },
    decode: function decode (buffer, offset, end) {
      if (!offset) offset = 0
      var items = new Array(length)
      decode.bytes = util.reduce(items, function (loffset, item, index) {
        items[index] = itemType.decode(buffer, loffset, end)
        return loffset + itemType.decode.bytes
      }, offset) - offset
      return items
    },
    encodingLength: function (value) {
      if (!Array.isArray(value)) throw new TypeError('value must be an Array instance')
      if (value.length !== length) throw new RangeError('value.length is out of bounds')
      return _length(value)
    }
  }
}
