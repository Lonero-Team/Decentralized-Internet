'use strict'
const Buffer = require('safe-buffer').Buffer
const util = require('./util')

module.exports = function (types) {
  if (!Array.isArray(types)) throw new TypeError('types must be an Array instance')

  // copy items for freezing
  types = types.map(function (itemType) {
    if (!util.isAbstractCodec(itemType)) throw new TypeError('types Array has invalid codec')
    return itemType
  })

  function _length (items) {
    return util.size(types, function (itemType, index) {
      return itemType.encodingLength(items[index])
    })
  }

  function encode (value, buffer, offset) {
    if (!Array.isArray(value)) throw new TypeError('value must be an Array instance')
    if (value.length !== types.length) throw new RangeError('value.length is out of bounds')
    if (!buffer) buffer = Buffer.allocUnsafe(_length(value))
    if (!offset) offset = 0
    encode.bytes = util.size(types, function (itemType, index, loffset) {
      itemType.encode(value[index], buffer, loffset)
      return itemType.encode.bytes
    }, offset) - offset
    return buffer
  }

  function decode (buffer, offset, end) {
    if (!offset) offset = 0
    const items = new Array(types.length)
    decode.bytes = util.size(types, function (itemType, index, loffset) {
      items[index] = itemType.decode(buffer, loffset, end)
      return itemType.decode.bytes
    }, offset) - offset
    return items
  }

  function encodingLength (value) {
    if (!Array.isArray(value)) throw new TypeError('value must be an Array instance')
    if (value.length !== types.length) throw new RangeError('value.length is out of bounds')
    return _length(value)
  }

  return { encode, decode, encodingLength }
}
