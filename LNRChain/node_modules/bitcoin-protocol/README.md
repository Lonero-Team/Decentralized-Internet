# bitcoin-protocol

[![npm version](https://img.shields.io/npm/v/bitcoin-protocol.svg)](https://www.npmjs.com/package/bitcoin-protocol)
[![Build Status](https://travis-ci.org/mappum/bitcoin-protocol.svg?branch=master)](https://travis-ci.org/mappum/bitcoin-protocol)
[![Dependency Status](https://david-dm.org/mappum/bitcoin-protocol.svg)](https://david-dm.org/mappum/bitcoin-protocol)

**Bitcoin network protocol streams**

This module encodes and decodes low-level network protocol data using streams.

You may want a higher-level module like [bitcoin-net](https://github.com/mappum/bitcoin-net/), which some things for you such as connection handshakes, sending keepalive pings, etc.

## Usage

`npm install bitcoin-protocol`

```js
var net = require('net')
var bp = require('bitcoin-protocol')

var decoder = bp.createDecodeStream()
decoder.on('data', function (message) { console.log(message) })

var encoder = bp.createEncodeStream()

var socket = net.connect(8333, '127.0.0.1', function () {
  socket.pipe(decoder)
  encoder.pipe(socket)

  encoder.write({
    magic: 0xd9b4bef9,
    command: 'version',
    payload: {
      version: 70012,
      services: Buffer(8).fill(0),
      timestamp: Math.round(Date.now() / 1000),
      receiverAddress: {
        services: Buffer('0100000000000000', 'hex'),
        address: '0.0.0.0',
        port: 8333
      },
      senderAddress: {
        services: Buffer(8).fill(0),
        address: '0.0.0.0',
        port: 8333
      },
      nonce: Buffer(8).fill(123),
      userAgent: 'foobar',
      startHeight: 0,
      relay: true
    }
  })
})
```

### Methods

#### `createDecodeStream([opts])`

Creates a stream which parses raw network bytes written to it and outputs message objects.

Opts may contain:
```js
{
  magic: Number
  // If provided, the decoder will check if messages' "magic" field matches
  // this value. If it does not match, the stream will emit an error.
}
```

#### `createEncodeStream([opts])`

Creates a stream which encodes message objects to raw network bytes.

Opts may contain:
```js
{
  magic: Number
  // If provided, the encoder will automatically add the "magic" field to each
  // message written to it.
}
```

### Format

**Decoder**

Emitted by the decoder:
```js
{
  magic: Number,
  command: String,
  length: Number,
  checksum: Buffer, // 8 bytes,
  payload: Object // see below for detailed payload formats
}
```

**Encoder**

Written to the encoder:
```js
{
  magic: Number, // optional if you set this in the options
  command: String,
  payload: Object // see below for detailed payload formats
}
```

### Payload Reference

The formats for the objects used as message payloads for the various commands are as follows. See [the wiki](https://en.bitcoin.it/wiki/Protocol_documentation) for more information about these messages.

#### `version`
```js
{
  version: Number,
  services: Buffer, // 8 bytes
  timestamp: Number,
  receiverAddress: {
    services: Buffer, // 8 bytes
    address: String, // ipv4 or ipv6
    port: Number
  },
  senderAddress: {
    services: Buffer, // 8 bytes
    address: String, // ipv4 or ipv6
    port: Number
  },
  nonce: Buffer, // 8 bytes
  userAgent: String,
  startHeight: Number,
  relay: Boolean
}
```

#### `verack`, `getaddr`, `mempool`, `filterclear`, `sendheaders`
```js
// no payload needed
```

#### `addr`
```js
[
  {
    time: Number,
    services: Buffer, // 8 bytes
    address: String, // ipv4 or ipv6
    port: Number
  },
  ...
]
```

#### `inv`, `getdata`, `notfound`
```js
[
  {
    type: Number,
    hash: Buffer // 32 bytes
  },
  ...
]
```

#### `getblocks`, `getheaders`
```js
{
  version: Number,
  locator: [
    Buffer // 32 bytes
  ],
  hashStop: Buffer // 32 bytes
}
```

#### `tx`
```js
{
  version: Number,
  ins: [
    {
      hash: Buffer, // 32 bytes
      index: Number,
      script: Buffer, // varying length
      sequence: Number
    },
    ...
  ],
  outs: [
    {
      value: BN, // from 'bn.js' package
      script: Buffer // varying length
    },
    ...
  ],
  locktime: Number
}
```

#### `block`
```js
{
  header: {
    version: Number,
    prevHash: Buffer, // 32 bytes
    merkleRoot: Buffer, // 32 bytes
    timestamp: Number,
    bits: Number,
    nonce: Number,
  },
  transactions: [
    {}, // same format as 'tx' message
    ...
  ]
}
```

#### `headers`
```js
[
  {
    header: {
      version: Number,
      prevHash: Buffer, // 32 bytes
      merkleRoot: Buffer, // 32 bytes
      timestamp: Number,
      bits: Number,
      nonce: Number,
    },
    nTransactions: Number
  },
  ...
]
```

#### `ping`, `pong`
```js
{
  nonce: Buffer // 8 bytes
}
```

#### `reject`
```js
{
  message: String,
  ccode: Number,
  reason: String,
  data: Buffer // varying length
}
```

#### `filterload`
```js
{
  data: Buffer, // varying length
  nHashFuncs: Number,
  nTweak: Number,
  nFlags: Number
}
```

#### `filteradd`
```js
{
  data: Buffer // varying length
}
```

#### `merkleblock`
```js
{
  header: {
    version: Number,
    prevHash: Buffer, // 32 bytes
    merkleRoot: Buffer, // 32 bytes
    timestamp: Number,
    bits: Number,
    nonce: Number
  },
  numTransactions: Number,
  hashes: [
    Buffer // 32 bytes
  ],
  flags: Buffer // varying length
}
```

#### `alert`
```js
{
  payload: Buffer, // varying length
  signature: Buffer // varying length
}
```
