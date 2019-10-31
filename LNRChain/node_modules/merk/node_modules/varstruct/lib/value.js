'use strict'
const Buffer = require('safe-buffer').Buffer
const util = require('./util')

module.exports = function (valueType, value) {
  if (!util.isAbstractCodec(valueType)) throw new TypeError('valueType is invalid codec')

  const valueBuffer = valueType.encode(value)
  const encodeLength = valueBuffer.length

  function encode (valueParam, buffer, offset) {
    if (valueParam !== undefined &&
      valueParam !== value) throw new TypeError('Value parameter must be undefined or equal')

    if (!offset) offset = 0
    if (buffer) {
      if ((buffer.length - offset) < encodeLength) throw new RangeError('destination buffer is too small')
      valueBuffer.copy(buffer, offset)
    } else {
      buffer = Buffer.from(valueBuffer)
    }

    encode.bytes = encodeLength
    return buffer
  }

  function decode (target, offset, end) {
    if (!offset) offset = 0
    if (end === undefined) end = target.length
    if (offset + encodeLength > end) throw new RangeError('not enough data for decode')
    if (valueBuffer.compare(target, offset, offset + encodeLength) !== 0) throw new TypeError('Expected value ' + value)

    decode.bytes = encodeLength
    return value
  }

  function encodingLength (valueParam) {
    if (valueParam !== undefined) throw new TypeError('Value parameter must be undefined')
    return encodeLength
  }

  return { encode, decode, encodingLength }
}
