'use strict'
const Buffer = require('safe-buffer').Buffer
const vsBuffer = require('./buffer')

module.exports = function (length, encoding) {
  if (typeof length !== 'number') throw new TypeError('length must be a number')

  const bufferCodec = vsBuffer(length)
  if (!encoding) encoding = 'utf-8'
  if (!Buffer.isEncoding(encoding)) throw new TypeError('invalid encoding')

  function encode (value, buffer, offset) {
    if (typeof value !== 'string') throw new TypeError('value must be a string')

    if (Buffer.byteLength(value, encoding) !== length) throw new RangeError('value.length is out of bounds')
    if (!buffer) return Buffer.from(value, encoding)
    if (!Buffer.isBuffer(buffer)) throw new TypeError('buffer must be a Buffer instance')

    if (!offset) offset = 0
    if (offset + length > buffer.length) throw new RangeError('destination buffer is too small')

    buffer.write(value, offset, length, encoding)
    return buffer
  }

  function decode (buffer, offset, end) {
    return bufferCodec.decode(buffer, offset, end).toString(encoding)
  }

  function encodingLength () {
    return length
  }

  encode.bytes = decode.bytes = length
  return { encode, decode, encodingLength }
}
