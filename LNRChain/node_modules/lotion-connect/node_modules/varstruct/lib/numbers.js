'use strict'
const Buffer = require('safe-buffer').Buffer
const int53 = require('int53')

function getWrite (name) {
  if (Buffer.prototype[name]) return Buffer.prototype[name]
  return function (value, offset) {
    return int53[name](value, this, offset)
  }
}

function getRead (name) {
  if (Buffer.prototype[name]) return Buffer.prototype[name]
  return function (offset) {
    return int53[name](this, offset)
  }
}

module.exports = function build (type, length) {
  const write = getWrite('write' + type)
  const read = getRead('read' + type)

  function encode (value, buffer, offset) {
    if (typeof value !== 'number') throw new TypeError('value must be a number')
    if (!buffer) buffer = Buffer.allocUnsafe(length)
    if (!offset) offset = 0
    write.call(buffer, value, offset)
    return buffer
  }

  function decode (buffer, offset, end) {
    if (!offset) offset = 0
    if (!end) return read.call(buffer, offset)
    return read.call(buffer.slice(offset, end), 0)
  }

  function encodingLength () {
    return length
  }

  encode.bytes = decode.bytes = length
  return { encode, decode, encodingLength }
}
