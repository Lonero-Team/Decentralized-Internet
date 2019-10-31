'use strict'
var VarBuffer = require('./varbuffer')
var util = require('../util')

module.exports = function (lengthType, encoding) {
  if (!util.isAbstractCodec(lengthType)) throw new TypeError('lengthType is invalid codec')

  var varbuffer = VarBuffer(lengthType)
  if (!encoding) encoding = 'utf8'

  return {
    encode: function encode (value, buffer, offset) {
      if (typeof value !== 'string') throw new TypeError('value must be a string')
      buffer = varbuffer.encode(new Buffer(value, encoding), buffer, offset)
      encode.bytes = varbuffer.encode.bytes
      return buffer
    },
    decode: function decode (buffer, offset, end) {
      var sbuffer = varbuffer.decode(buffer, offset, end)
      decode.bytes = varbuffer.decode.bytes
      return sbuffer.toString(encoding)
    },
    encodingLength: function (value) {
      if (typeof value !== 'string') throw new TypeError('value must be a string')
      return varbuffer.encodingLength(new Buffer(value, encoding))
    }
  }
}
