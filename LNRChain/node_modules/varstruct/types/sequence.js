'use strict'
var util = require('../util')

module.exports = function (types) {
  if (!Array.isArray(types)) throw new TypeError('types must be an Array instance')

  // copy items for freezing
  types = types.map(function (itemType) {
    if (!util.isAbstractCodec(itemType)) throw new TypeError('types Array has invalid codec')
    return itemType
  })

  function _length (items) {
    return util.reduce(types, function (total, itemType, index) {
      return total + itemType.encodingLength(items[index])
    }, 0)
  }

  return {
    encode: function encode (value, buffer, offset) {
      if (!Array.isArray(value)) throw new TypeError('value must be an Array instance')
      if (value.length !== types.length) throw new RangeError('value.length is out of bounds')
      if (!buffer) buffer = new Buffer(_length(value))
      if (!offset) offset = 0
      encode.bytes = util.reduce(types, function (loffset, itemType, index) {
        itemType.encode(value[index], buffer, loffset)
        return loffset + itemType.encode.bytes
      }, offset) - offset
      return buffer
    },
    decode: function decode (buffer, offset, end) {
      if (!offset) offset = 0
      var items = new Array(types.length)
      decode.bytes = util.reduce(types, function (loffset, itemType, index) {
        items[index] = itemType.decode(buffer, loffset, end)
        return loffset + itemType.decode.bytes
      }, offset) - offset
      return items
    },
    encodingLength: function (value) {
      if (!Array.isArray(value)) throw new TypeError('value must be an Array instance')
      if (value.length !== types.length) throw new RangeError('value.length is out of bounds')
      return _length(value)
    }
  }
}
