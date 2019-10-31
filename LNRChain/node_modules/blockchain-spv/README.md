# blockchain-spv

[![npm version](https://img.shields.io/npm/v/blockchain-spv.svg)](https://www.npmjs.com/package/blockchain-spv)
[![Build Status](https://travis-ci.org/mappum/blockchain-spv.svg?branch=master)](https://travis-ci.org/mappum/blockchain-spv)
[![Dependency Status](https://david-dm.org/mappum/blockchain-spv.svg)](https://david-dm.org/mappum/blockchain-spv)

**SPV Bitcoin blockchain verifier**

## Usage

`npm install blockchain-spv`

```js
let Blockchain = require('blockchain-spv')

let bitcoinGenesis = {
  height: 0,
  version: 1,
  prevHash: Buffer.alloc(32),
  merkleRoot: Buffer.from('4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b', 'hex').reverse(),
  timestamp: 1231006505,
  bits: 0x1d00ffff,
  nonce: 2083236893
}

let chain = new Blockchain({
  start: bitcoinGenesis
})

// add arrays of headers, throws if invalid
chain.add(header)
```

`Blockchain` stores and verifies block headers, and does SPV (light client) verification. It is compatible with Bitcoin and Bitcoin-derived blockchains.

----
#### `new Blockchain(opts)`

Creates an SPV `Blockchain` which stores and verifies block headers.

`opts` can contain:
- `start` - a header to be used as the starting point (e.g. the genesis or a checkpoint)
- `store` *(optional)* an array where the verified chain of headers should be stored
- `indexed` *(default: false)* whether or not to index headers by their hash, enabling the `getByHash` method
- `maxTarget` *(default: Bitcoin maxTarget)* a maximum difficulty target value as a 32-byte `Buffer`, should only be changed to make mining easier for writing tests

----
#### `chain.add(headers, now = Date.now())`

Adds block headers to the chain. `headers` should be an array of contiguous, ascending block headers. `now` is an optional argument that should be the current time in milliseconds. The headers will be verified (checked to make sure the expected amount of work was done, the difficulty was correct, etc.), then added to the store if valid. An error will be thrown if there is a validation error.

The headers can contain a reorg (e.g. they don't connect to chain's current tip).

----
#### `chain.getByHeight(height)`

Gets a header in the chain with height `height`. If the header isn't found, an error is thrown. This runs in `O(1)`.

----
#### `chain.getByHash(hash)`

Gets a header in the chain with hash `hash` (either a `Buffer` or a hex string). If the header isn't found or indexing was not enabled (see the `Blockchain` constructor), an error is thrown.
This runs in `O(1)`.

----
#### `chain.height()`

Returns the height of the highest block added to the chain.
