'use strict'

const struct = require('varstruct')
const varint = require('varuint-bitcoin')
const ip = require('ip')

exports.buffer8 = struct.Buffer(8)
exports.buffer32 = struct.Buffer(32)
exports.varBuffer = struct.VarBuffer(varint)

exports.boolean = (function () {
  function encode (value, buffer, offset) {
    return struct.UInt8.encode(+!!value, buffer, offset)
  }

  function decode (buffer, offset, end) {
    return !!struct.UInt8.decode(buffer, offset, end)
  }

  encode.bytes = decode.bytes = 1
  return { encode, decode, encodingLength: function () { return 1 } }
})()

exports.ipAddress = (function () {
  let IPV4_PREFIX = Buffer.from('00000000000000000000ffff', 'hex')
  function encode (value, buffer, offset) {
    if (!buffer) buffer = Buffer.alloc(16)
    if (!offset) offset = 0
    if (offset + 16 > buffer.length) throw new RangeError('destination buffer is too small')

    if (ip.isV4Format(value)) {
      IPV4_PREFIX.copy(buffer, offset)
      ip.toBuffer(value, buffer, offset + 12)
    } else if (ip.isV6Format(value)) {
      ip.toBuffer(value, buffer, offset)
    } else {
      throw Error('Invalid IP address value')
    }

    return buffer
  }

  function decode (buffer, offset, end) {
    if (!offset) offset = 0
    if (!end) end = buffer.length
    if (offset + 16 > end) throw new RangeError('not enough data for decode')

    let start = buffer.slice(offset, offset + 12).equals(IPV4_PREFIX) ? 12 : 0
    return ip.toString(buffer.slice(offset + start, offset + 16))
  }

  encode.bytes = decode.bytes = 16
  return { encode, decode, encodingLength: () => 16 }
})()

exports.peerAddress = struct([
  { name: 'services', type: exports.buffer8 },
  { name: 'address', type: exports.ipAddress },
  { name: 'port', type: struct.UInt16BE }
])

exports.inventoryVector = struct([
  { name: 'type', type: struct.UInt32LE },
  { name: 'hash', type: exports.buffer32 }
])

exports.alertPayload = struct([
  { name: 'version', type: struct.Int32LE },
  { name: 'relayUntil', type: struct.UInt64LE },
  { name: 'expiration', type: struct.UInt64LE },
  { name: 'id', type: struct.Int32LE },
  { name: 'cancel', type: struct.Int32LE },
  { name: 'cancelSet', type: struct.VarArray(varint, struct.Int32LE) },
  { name: 'minVer', type: struct.Int32LE },
  { name: 'maxVer', type: struct.Int32LE },
  { name: 'subVerSet', type: struct.VarArray(varint, struct.VarString(varint, 'ascii')) },
  { name: 'priority', type: struct.Int32LE },
  { name: 'comment', type: struct.VarString(varint, 'ascii') },
  { name: 'statusBar', type: struct.VarString(varint, 'ascii') },
  { name: 'reserved', type: struct.VarString(varint, 'ascii') }
])

exports.messageCommand = (function () {
  let buffer12 = struct.Buffer(12)

  function encode (value, buffer, offset) {
    let bvalue = Buffer.from(value, 'ascii')
    let nvalue = Buffer.alloc(12)
    bvalue.copy(nvalue, 0)
    for (let i = bvalue.length; i < nvalue.length; ++i) nvalue[i] = 0
    return buffer12.encode(nvalue, buffer, offset)
  }

  function decode (buffer, offset, end) {
    let bvalue = buffer12.decode(buffer, offset, end)
    let stop
    for (stop = 0; bvalue[stop] !== 0; ++stop) {
      if (stop === 11) {
        throw Error('Non-terminated string. Are you sure this is a Bitcoin packet?')
      }
    }
    for (let i = stop; i < bvalue.length; ++i) {
      if (bvalue[i] !== 0) {
        throw Error('Found a non-null byte after the first null byte in a null-padded string')
      }
    }
    return bvalue.slice(0, stop).toString('ascii')
  }

  encode.bytes = decode.bytes = 12
  return { encode, decode, encodingLength: () => 12 }
})()

let transaction = struct([
  { name: 'version', type: struct.Int32LE },
  {
    name: 'ins',
    type: struct.VarArray(varint, struct([
      { name: 'hash', type: exports.buffer32 },
      { name: 'index', type: struct.UInt32LE },
      { name: 'script', type: exports.varBuffer },
      { name: 'sequence', type: struct.UInt32LE }
    ]))
  },
  {
    name: 'outs',
    type: struct.VarArray(varint, struct([
      { name: 'value', type: struct.UInt64LE },
      { name: 'script', type: exports.varBuffer }
    ]))
  },
  { name: 'locktime', type: struct.UInt32LE }
])
let witnessTransaction = struct([
  { name: 'version', type: struct.Int32LE },
  { name: 'marker', type: struct.Byte },
  { name: 'flag', type: struct.Byte },
  {
    name: 'ins',
    type: struct.VarArray(varint, struct([
      { name: 'hash', type: exports.buffer32 },
      { name: 'index', type: struct.UInt32LE },
      { name: 'script', type: exports.varBuffer },
      { name: 'sequence', type: struct.UInt32LE }
    ]))
  },
  {
    name: 'outs',
    type: struct.VarArray(varint, struct([
      { name: 'value', type: struct.UInt64LE },
      { name: 'script', type: exports.varBuffer }
    ]))
  }
])
let varBufferArray = struct.VarArray(varint, exports.varBuffer)
exports.transaction = (function () {
  function encode (value, buffer = Buffer.alloc(encodingLength(value)), offset = 0) {
    value = Object.assign({}, value)
    let hasWitness = value.ins.some(({ witness }) =>
      witness != null && witness.length > 0)
    let type = hasWitness ? witnessTransaction : transaction

    if (hasWitness) {
      value.marker = 0
      value.flag = 1
    }

    type.encode(value, buffer, offset)
    let bytes = type.encode.bytes

    if (hasWitness) {
      let encode = (type, value) => {
        type.encode(value, buffer, offset + bytes)
        bytes += type.encode.bytes
      }
      for (let input of value.ins) {
        encode(varBufferArray, input.witness || [])
      }
      encode(struct.UInt32LE, value.locktime)
    }

    encode.bytes = bytes
    return buffer.slice(offset, offset + bytes)
  }

  function decode (buffer, offset = 0, end = buffer.length) {
    let hasWitness = buffer[offset + 4] === 0
    let type = hasWitness ? witnessTransaction : transaction

    let tx = type.decode(buffer, offset, end)
    decode.bytes = type.decode.bytes
    return tx
  }

  function encodingLength (value) {
    value = Object.assign({}, value)
    let hasWitness = value.ins.some(({ witness }) =>
      witness != null && witness.length > 0)
    let type = hasWitness ? witnessTransaction : transaction

    let witnessLength = 0
    if (hasWitness) {
      for (let input of value.ins) {
        witnessLength += varBufferArray.encodingLength(input.witness || [])
      }
      witnessLength += 4
    }

    return type.encodingLength(value) + witnessLength
  }

  return { encode, decode, encodingLength }
})()

exports.header = struct([
  { name: 'version', type: struct.Int32LE },
  { name: 'prevHash', type: exports.buffer32 },
  { name: 'merkleRoot', type: exports.buffer32 },
  { name: 'timestamp', type: struct.UInt32LE },
  { name: 'bits', type: struct.UInt32LE },
  { name: 'nonce', type: struct.UInt32LE }
])
