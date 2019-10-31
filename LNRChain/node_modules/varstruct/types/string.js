'use strict'
var BufferType = require('./buffer')

module.exports = function (length, encoding) {
  if (typeof length !== 'number') throw new TypeError('length must be a number')

  var bufferCodec = BufferType(length)
  if (!encoding) encoding = 'utf-8'

  function encode (value, buffer, offset) {
    if (typeof value !== 'string') throw new TypeError('value must be a string')
    return bufferCodec.encode(new Buffer(value, encoding), buffer, offset)
  }

  function decode (buffer, offset, end) {
    return bufferCodec.decode(buffer, offset, end).toString(encoding)
  }

  encode.bytes = decode.bytes = length
  return { encode: encode, decode: decode, encodingLength: bufferCodec.encodingLength }
}
