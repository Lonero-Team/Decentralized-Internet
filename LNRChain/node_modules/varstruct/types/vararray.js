'use strict'
var util = require('../util')

module.exports = function (lengthType, itemType) {
  if (!util.isAbstractCodec(lengthType)) throw new TypeError('lengthType is invalid codec')
  if (!util.isAbstractCodec(itemType)) throw new TypeError('itemType is invalid codec')

  function _length (items) {
    return util.reduce(items, function (total, item) {
      return total + itemType.encodingLength(item)
    }, lengthType.encodingLength(items.length))
  }

  return {
    encode: function encode (value, buffer, offset) {
      if (!Array.isArray(value)) throw new TypeError('value must be an Array instance')
      if (!buffer) buffer = new Buffer(_length(value))
      if (!offset) offset = 0
      lengthType.encode(value.length, buffer, offset)
      encode.bytes = util.reduce(value, function (loffset, item) {
        itemType.encode(item, buffer, loffset)
        return loffset + itemType.encode.bytes
      }, lengthType.encode.bytes + offset) - offset
      return buffer
    },
    decode: function decode (buffer, offset, end) {
      if (!offset) offset = 0
      var items = new Array(lengthType.decode(buffer, offset, end))
      decode.bytes = util.reduce(items, function (loffset, item, index) {
        items[index] = itemType.decode(buffer, loffset, end)
        return loffset + itemType.decode.bytes
      }, lengthType.decode.bytes + offset) - offset
      return items
    },
    encodingLength: function (value) {
      if (!Array.isArray(value)) throw new TypeError('value must be an Array instance')
      return _length(value)
    }
  }
}
