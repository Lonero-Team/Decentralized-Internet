'use strict'
module.exports = exports = require('./object')

// numbers
const numbers = require('./numbers')
exports.Byte = numbers('UInt8', 1)
exports.Int8 = numbers('Int8', 1)
exports.UInt8 = numbers('UInt8', 1)
exports.Int16BE = numbers('Int16BE', 2)
exports.Int16LE = numbers('Int16LE', 2)
exports.UInt16BE = numbers('UInt16BE', 2)
exports.UInt16LE = numbers('UInt16LE', 2)
exports.Int32BE = numbers('Int32BE', 4)
exports.Int32LE = numbers('Int32LE', 4)
exports.UInt32BE = numbers('UInt32BE', 4)
exports.UInt32LE = numbers('UInt32LE', 4)
exports.Int64BE = numbers('Int64BE', 8)
exports.Int64LE = numbers('Int64LE', 8)
exports.UInt64BE = numbers('UInt64BE', 8)
exports.UInt64LE = numbers('UInt64LE', 8)
exports.FloatBE = numbers('FloatBE', 4)
exports.FloatLE = numbers('FloatLE', 4)
exports.DoubleBE = numbers('DoubleBE', 8)
exports.DoubleLE = numbers('DoubleLE', 8)

// array & vararray & sequence
exports.Array = require('./array')
exports.VarArray = require('./vararray')
exports.Sequence = require('./sequence')

// buffer & varbuffer
exports.Buffer = require('./buffer')
exports.VarBuffer = require('./varbuffer')

// map
exports.VarMap = require('./varmap')

// string & varstring
exports.String = require('./string')
exports.VarString = require('./varstring')

// bound
exports.Bound = require('./bound')

// value
exports.Value = require('./value')
