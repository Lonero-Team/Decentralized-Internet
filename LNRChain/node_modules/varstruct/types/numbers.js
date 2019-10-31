'use strict'
var int53 = require('int53')

function createNumber (type, length) {
  var read = Buffer.prototype['read' + type]
  var write = Buffer.prototype['write' + type]

  function encode (value, buffer, offset) {
    if (!buffer) buffer = new Buffer(length)
    if (!offset) offset = 0
    write.call(buffer, value, offset)
    return buffer
  }

  function decode (buffer, offset, end) {
    if (!offset) offset = 0
    if (!end) return read.call(buffer, offset)
    return read.call(buffer.slice(offset, end), 0)
  }

  encode.bytes = decode.bytes = length
  return { encode: encode, decode: decode, encodingLength: function () { return length } }
}

function createNumber64 (read, write) {
  function encode (value, buffer, offset) {
    if (!buffer) buffer = new Buffer(8)
    if (!offset) offset = 0
    write(value, buffer, offset)
    return buffer
  }

  function decode (buffer, offset, end) {
    if (!offset) offset = 0
    if (!end) return read(buffer, offset)
    return read(buffer.slice(offset, end), 0)
  }

  encode.bytes = decode.bytes = 8
  return { encode: encode, decode: decode, encodingLength: function () { return 8 } }
}

exports.Byte = createNumber('UInt8', 1)
exports.Int8 = createNumber('Int8', 1)
exports.UInt8 = createNumber('UInt8', 1)
exports.Int16BE = createNumber('Int16BE', 2)
exports.Int16LE = createNumber('Int16LE', 2)
exports.UInt16BE = createNumber('UInt16BE', 2)
exports.UInt16LE = createNumber('UInt16LE', 2)
exports.Int32BE = createNumber('Int32BE', 4)
exports.Int32LE = createNumber('Int32LE', 4)
exports.UInt32BE = createNumber('UInt32BE', 4)
exports.UInt32LE = createNumber('UInt32LE', 4)
exports.Int64BE = createNumber64(int53.readInt64BE, int53.writeInt64BE)
exports.Int64LE = createNumber64(int53.readInt64LE, int53.writeInt64LE)
exports.UInt64BE = createNumber64(int53.readUInt64BE, int53.writeUInt64BE)
exports.UInt64LE = createNumber64(int53.readUInt64LE, int53.writeUInt64LE)
exports.FloatBE = createNumber('FloatBE', 4)
exports.FloatLE = createNumber('FloatLE', 4)
exports.DoubleBE = createNumber('DoubleBE', 8)
exports.DoubleLE = createNumber('DoubleLE', 8)
