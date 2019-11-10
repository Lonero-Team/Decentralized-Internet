'use strict'
const Buffer = require('safe-buffer').Buffer
const vsVarBuffer = require('./varbuffer')
const util = require('./util')

module.exports = function (lengthType, encoding) {
  if (!util.isAbstractCodec(lengthType)) throw new TypeError('lengthType is invalid codec')

  const bufferCodec = vsVarBuffer(lengthType)
  if (!encoding) encoding = 'utf8'
  if (!Buffer.isEncoding(encoding)) throw new TypeError('invalid encoding')

  function _length (value) {
    if (typeof value !== 'string') throw new TypeError('value must be a string')

    const valueLength = Buffer.byteLength(value, encoding)
    return lengthType.encodingLength(value.length) + valueLength
  }

  function encode (value, buffer, offset) {
    if (typeof value !== 'string') throw new TypeError('value must be a string')
    if (!offset) offset = 0

    const valueLength = Buffer.byteLength(value, encoding)
    const bytes = lengthType.encodingLength(value.length) + valueLength

    if (!buffer) buffer = Buffer.allocUnsafe(bytes)
    else if (!Buffer.isBuffer(buffer)) throw new TypeError('buffer must be a Buffer instance')
    if (offset + bytes > buffer.length) throw new RangeError('destination buffer is too small')

    lengthType.encode(valueLength, buffer, offset)
    offset += lengthType.encode.bytes
    buffer.write(value, offset, valueLength, encoding)

    encode.bytes = bytes
    return buffer
  }

  function decode (buffer, offset, end) {
    const string = bufferCodec.decode(buffer, offset, end).toString(encoding)

    decode.bytes = bufferCodec.decode.bytes
    return string
  }

  return { encode, decode, encodingLength: _length }
}
