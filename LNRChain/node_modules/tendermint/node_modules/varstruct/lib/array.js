'use strict'
const Buffer = require('safe-buffer').Buffer
const util = require('./util')

module.exports = function build (length, type) {
  if (typeof length !== 'number') throw new TypeError('length must be a number')
  if (!util.isAbstractCodec(type)) throw new TypeError('itemType is invalid codec')

  function _length (items) {
    return util.size(items, type.encodingLength)
  }

  function encode (value, buffer, offset) {
    if (!Array.isArray(value)) throw new TypeError('value must be an Array instance')
    if (value.length !== length) throw new RangeError('value.length is out of bounds')
    if (!buffer) buffer = Buffer.allocUnsafe(_length(value))
    if (!offset) offset = 0
    encode.bytes = util.size(value, function (item, index, loffset) {
      type.encode(item, buffer, loffset)
      return type.encode.bytes
    }, offset) - offset
    return buffer
  }

  function decode (buffer, offset, end) {
    if (!offset) offset = 0
    const items = new Array(length)
    decode.bytes = util.size(items, function (item, index, loffset) {
      items[index] = type.decode(buffer, loffset, end)
      return type.decode.bytes
    }, offset) - offset
    return items
  }

  function encodingLength (value) {
    if (!Array.isArray(value)) throw new TypeError('value must be an Array instance')
    if (value.length !== length) throw new RangeError('value.length is out of bounds')
    return _length(value)
  }

  return { encode, decode, encodingLength }
}
