'use strict'
const Buffer = require('safe-buffer').Buffer
const util = require('./util')

module.exports = function (items) {
  if (!Array.isArray(items)) throw new TypeError('items must be an Array instance')

  // copy items for freezing
  items = items.map(function (item) {
    if (Array.isArray(item)) item = { name: item[0], type: item[1] }
    if (!item || typeof item.name !== 'string') throw new TypeError('item missing "name" property')
    if (!util.isAbstractCodec(item.type)) throw new TypeError('item "' + item.name + '" has invalid codec')
    return { name: item.name, type: item.type }
  })

  function _length (object) {
    if (typeof object !== 'object' || object === null) throw new TypeError('Expected Object, got ' + object)

    return items.reduce(function (a, item) {
      const value = object[item.name]
      return a + item.type.encodingLength(value)
    }, 0)
  }

  function encode (object, buffer, offset) {
    if (!offset) offset = 0

    const bytes = _length(object)
    if (!buffer) buffer = Buffer.allocUnsafe(bytes)
    else if ((buffer.length - offset) < bytes) throw new RangeError('destination buffer is too small')

    items.forEach(function (item) {
      const value = object[item.name]

      item.type.encode(value, buffer, offset)
      offset += item.type.encode.bytes
    })
    encode.bytes = bytes

    return buffer
  }

  function decode (buffer, offset, end) {
    if (!offset) offset = 0

    const result = {}
    const start = offset

    items.forEach(function (item) {
      const value = item.type.decode(buffer, offset, end)
      offset += item.type.decode.bytes

      result[item.name] = value
    })
    decode.bytes = offset - start

    return result
  }

  return { encode, decode, encodingLength: _length }
}
