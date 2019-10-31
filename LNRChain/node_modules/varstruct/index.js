'use strict'
module.exports = exports = require('./types/object')

// numbers
var numbers = require('./types/numbers')
exports.Byte = numbers.Byte
exports.Int8 = numbers.Int8
exports.UInt8 = numbers.UInt8
exports.Int16BE = numbers.Int16BE
exports.Int16LE = numbers.Int16LE
exports.UInt16BE = numbers.UInt16BE
exports.UInt16LE = numbers.UInt16LE
exports.Int32BE = numbers.Int32BE
exports.Int32LE = numbers.Int32LE
exports.UInt32BE = numbers.UInt32BE
exports.UInt32LE = numbers.UInt32LE
exports.Int64BE = numbers.Int64BE
exports.Int64LE = numbers.Int64LE
exports.UInt64BE = numbers.UInt64BE
exports.UInt64LE = numbers.UInt64LE
exports.FloatBE = numbers.FloatBE
exports.FloatLE = numbers.FloatLE
exports.DoubleBE = numbers.DoubleBE
exports.DoubleLE = numbers.DoubleLE

// array & vararray & sequence
exports.Array = require('./types/array')
exports.VarArray = require('./types/vararray')
exports.Sequence = require('./types/sequence')

// buffer & varbuffer
exports.Buffer = require('./types/buffer')
exports.VarBuffer = require('./types/varbuffer')

// string & varstring
exports.String = require('./types/string')
exports.VarString = require('./types/varstring')

// bound
exports.Bound = require('./types/bound')
