'use strict'
var util = require('../util')

module.exports = function (items) {
  if (!Array.isArray(items)) throw new TypeError('items must be an Array instance')

  // copy items for freezing
  items = items.map(function (item) {
    if (Array.isArray(item)) item = { name: item[0], type: item[1] }
    if (!item || typeof item.name !== 'string') throw new TypeError('item missing "name" property')
    if (!util.isAbstractCodec(item.type)) throw new TypeError('item "' + item.name + '" has invalid codec')
    return { name: item.name, type: item.type }
  })

  function encodingLength (obj) {
    return util.reduce(items, function (total, item) {
      return total + item.type.encodingLength(obj[item.name])
    }, 0)
  }

  return {
    encode: function encode (value, buffer, offset) {
      if (typeof value !== 'object' || value === null) throw new TypeError('expected value as object, got ' + value)
      if (!buffer) buffer = new Buffer(encodingLength(value))
      if (!offset) offset = 0
      encode.bytes = util.reduce(items, function (loffset, item) {
        item.type.encode(value[item.name], buffer, loffset)
        return loffset + item.type.encode.bytes
      }, offset) - offset
      return buffer
    },
    decode: function decode (buffer, offset, end) {
      if (!offset) offset = 0
      var obj = {}
      decode.bytes = util.reduce(items, function (loffset, item) {
        obj[item.name] = item.type.decode(buffer, loffset, end)
        return loffset + item.type.decode.bytes
      }, offset) - offset
      return obj
    },
    encodingLength: encodingLength
  }
}
