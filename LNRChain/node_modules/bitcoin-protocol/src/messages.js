'use strict'

const struct = require('varstruct')
const varint = require('varuint-bitcoin')
const defaultTypes = require('./types.js')

function createMessages (messages) {
  function extend (child) {
    let output = {}
    for (let k in messages) output[k] = messages[k]
    for (let k in child) output[k] = child[k]
    return createMessages(output)
  }
  for (let k in messages) {
    extend[k] = messages[k]
  }
  return extend
}

function createStructs (overrideTypes) {
  let types = Object.assign({}, defaultTypes, overrideTypes)

  // TODO: add segwit
  let reject = (function () {
    let baseStruct = struct([
      { name: 'message', type: struct.VarString(varint, 'ascii') },
      { name: 'ccode', type: struct.UInt8 },
      { name: 'reason', type: struct.VarString(varint, 'ascii') }
    ])

    function encode (value, buffer, offset) {
      if (!buffer) buffer = Buffer.alloc(encodingLength(value))
      if (!offset) offset = 0
      baseStruct.encode(value, buffer, offset)
      encode.bytes = baseStruct.encode.bytes
      if (Buffer.isBuffer(value.data)) {
        if (offset + encode.bytes + value.data.length > buffer.length) {
          throw new RangeError('destination buffer is too small')
        }
        value.data.copy(buffer, offset + encode.bytes)
        encode.bytes += value.data.length
      }
      return buffer
    }

    function decode (buffer, offset, end) {
      if (!offset) offset = 0
      if (!end) end = buffer.length
      let value = baseStruct.decode(buffer, offset, end)
      decode.bytes = baseStruct.decode.bytes
      if (decode.bytes === end) {
        value.data = Buffer.alloc(0)
      } else {
        value.data = buffer.slice(decode.bytes, end)
        decode.bytes = end
      }
      return value
    }

    function encodingLength (value) {
      let dataLength = Buffer.isBuffer(value.data) ? value.data.length : 0
      return baseStruct.encodingLength(value) + dataLength
    }

    return { encode, decode, encodingLength }
  })()

  // https://bitcoin.org/en/developer-reference#p2p-network
  // TODO: move to own files
  return createMessages({
    // Data Messages
    block: struct([
      { name: 'header', type: types.header },
      { name: 'transactions', type: struct.VarArray(varint, types.transaction) }
    ]),
    getblocks: struct([
      { name: 'version', type: struct.UInt32BE },
      { name: 'locator', type: struct.VarArray(varint, types.buffer32) },
      { name: 'hashStop', type: types.buffer32 }
    ]),
    getdata: struct.VarArray(varint, types.inventoryVector),
    getheaders: struct([
      { name: 'version', type: struct.UInt32BE },
      { name: 'locator', type: struct.VarArray(varint, types.buffer32) },
      { name: 'hashStop', type: types.buffer32 }
    ]),
    headers: struct.VarArray(varint, struct([
      { name: 'header', type: types.header },
      { name: 'numTransactions', type: varint }
    ])),
    inv: struct.VarArray(varint, types.inventoryVector),
    mempool: struct([]),
    merkleblock: struct([
      { name: 'header', type: types.header },
      { name: 'numTransactions', type: struct.UInt32LE },
      { name: 'hashes', type: struct.VarArray(varint, types.buffer32) },
      { name: 'flags', type: types.varBuffer }
    ]),
    notfound: struct.VarArray(varint, types.inventoryVector),
    tx: types.transaction,

    // Control Messages
    addr: struct.VarArray(varint, struct([
      { name: 'time', type: struct.UInt32LE },
      { name: 'services', type: types.buffer8 },
      { name: 'address', type: types.ipAddress },
      { name: 'port', type: struct.UInt16BE }
    ])),
    alert: struct([
      { name: 'payload', type: types.varBuffer }, // TODO: parse automatically?
      { name: 'signature', type: types.varBuffer }
    ]),
    filteradd: struct([
      { name: 'data', type: types.varBuffer }
    ]),
    filterload: struct([
      { name: 'data', type: struct.VarArray(varint, struct.UInt8) },
      { name: 'nHashFuncs', type: struct.UInt32LE },
      { name: 'nTweak', type: struct.UInt32LE },
      { name: 'nFlags', type: struct.UInt8 }
    ]),
    filterclear: struct([]),
    getaddr: struct([]),
    ping: struct([ { name: 'nonce', type: types.buffer8 } ]),
    pong: struct([ { name: 'nonce', type: types.buffer8 } ]),
    reject: reject,
    sendheaders: struct([]),
    verack: struct([]),
    version: struct([
      // TODO: check version before decoding optional fields
      { name: 'version', type: struct.UInt32LE },
      { name: 'services', type: types.buffer8 },
      { name: 'timestamp', type: struct.UInt64LE },
      { name: 'receiverAddress', type: types.peerAddress },
      { name: 'senderAddress', type: types.peerAddress },
      { name: 'nonce', type: types.buffer8 },
      { name: 'userAgent', type: struct.VarString(varint, 'ascii') },
      { name: 'startHeight', type: struct.Int32LE },
      { name: 'relay', type: types.boolean }
    ])
  })
}

exports.defaultMessages = createStructs(defaultTypes)
exports.createMessages = createMessages
exports.createStructs = createStructs
