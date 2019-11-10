# blockchain-download

[![npm version](https://img.shields.io/npm/v/blockchain-download.svg)](https://www.npmjs.com/package/blockchain-download)
[![Build Status](https://travis-ci.org/mappum/blockchain-download.svg?branch=master)](https://travis-ci.org/mappum/blockchain-download)
[![Dependency Status](https://david-dm.org/mappum/blockchain-download.svg)](https://david-dm.org/mappum/blockchain-download)

**Download blockchain data from peers**

## Usage

`npm install blockchain-download`

`blockchain-download` provides streams which simplify downloading blockchain data (headers, full blocks, filtered blocks, or transactions) from network peers. Peers are provided by the [`bitcoin-net`](https://github.com/mappum/bitcoin-net) module.

----
### `HeaderStream`

`HeaderStream` is  used for syncing blockchain state with a module like [`blockchain-spv`](https://github.com/mappum/blockchain-spv). It will download existing blocks from peers when doing an initial sync, and also outputs newly mined blocks relayed by the network.

Example sync:
```js
var PeerGroup = require('bitcoin-net').PeerGroup
var HeaderStream = require('blockchain-download').HeaderStream
var Blockchain = require('blockchain-spv')
var params = require('webcoin-bitcoin-testnet')

// connect to P2P network
var peers = new PeerGroup(params.net)
peers.connect()

// create/load Blockchain
var db = levelup('bitcoin.chain', { db: require('memdown') })
var chain = new Blockchain(params.blockchain, db)

chain.createLocatorStream() // locators tell us which headers to fetch
  .pipe(HeaderStream(peers)) // pipe locators into new HeaderStream
  .pipe(chain.createWriteStream()) // pipe headers into Blockchain
```
This example will download block headers and add them to our `Blockchain`, which will verify them and save them to its database.

#### `new HeaderStream(peers, [opts])`

`HeaderStream` is a `Transform` stream. Its **input** should be "locators", which are arrays of block hashes (as `Buffer`s), descending in height, which specify which blocks to download. For more info about locators, see the [bitcoin wiki](https://en.bitcoin.it/wiki/Protocol_documentation#getblocks). Its **output** will be Arrays of [BitcoinJS](https://github.com/bitcoinjs/bitcoinjs-lib) `Block` objects.

`peers` should be a [`bitcoin-net`](https://github.com/mappum/bitcoin-net) `PeerGroup` or `Peer` instance that the headers will be downloaded from.

`opts` may contain:
- `timeout` *Number* (default: *dynamic, based on peer latency*) - The amount of time to wait (in ms) before timing out when requesting headers from a peer. Peers that time out will be disconnected and the request will be retried with another peer
- `stop` *Buffer* (default: `null`) - If specified, the `HeaderStream` will end once a block header is reached with this hash
- `endOnTip` *Boolean* (default: `false` in browsers, `false` in Node) - If `true`, the stream will end once it syncs all the way to the most recent block (instead of listening for newly mined blocks)

---
### `BlockStream`

`BlockStream` is used to download full blocks or Bloom-filtered blocks, including transaction data.

Example blockchain scan:
```js
var PeerGroup = require('bitcoin-net').PeerGroup
var BlockStream = require('blockchain-download').BlockStream
var Blockchain = require('blockchain-spv')
var params = require('webcoin-bitcoin-testnet')

// connect to P2P network
var peers = new PeerGroup(params.net)
peers.connect()

// create/load Blockchain
var db = levelup('bitcoin.chain', { db: require('memdown') })
var chain = new Blockchain(params.blockchain, db)

var blocks = new BlockStream(peers)
blocks.on('data', function (block) {
  console.log('got block:', block.height)
  for (var i = 0; i < block.transactions.length; i++) {
    // do something with transaction
  }
})
chain.createReadStream().pipe(blocks)
```
In this example, we first call `chain.createReadStream()` which will output the headers already stored in our `Blockchain`. Then we pipe the output to a `BlockStream`, which will fetch the complete data for each block. We can then do something with this output, such as checking if transactions are relevant to us (e.g. it was sent to our address).

#### `new BlockStream(peers, [opts])`

`BlockStream` is a `Transform` stream.

The stream **input** should be block objects which have a `header` property, which is a [BitcoinJS](https://github.com/bitcoinjs/bitcoinjs-lib) `Block`.

The **output** will be objects containing the following properties (in addition to the properties of the input objects):

**Full blocks** (`opts.filtered` = `false`):
```js
{
  transactions: [
    ... // BitcoinJS transaction objects
  ]
}
```
**Merkle blocks** (`opts.filtered` = `true`):
```js
{
  transactions: [
    {}, // BitcoinJS transaction objects
    ...
  ],
  numTransactions: Number,
  hashes: [
    Buffer, // 32 bytes
    ...
  ],
  flags: Buffer // varying length
}
```

`peers` should be a [`bitcoin-net`](https://github.com/mappum/bitcoin-net) `PeerGroup` or `Peer` instance that the blocks will be downloaded from.

`opts` may contain:
- `filtered` *Boolean* (default: `false`) - If `false`, full blocks will be downloaded. If `true`, only relevant transactions that matched the Bloom filter will be downloaded (a filter must be set using a module such as [`bitcoin-filter`](https://github.com/mappum/bitcoin-filter))
- `batchSize` *Number* (default: `64`) - The number of blocks to download per request. Tweaking may improve performance
- `batchTimeout` *Number* (default: `2 * 1000`) - The maximum amount of time to wait (in ms) before making a request. Tweaking may improve performance
- `timeout` *Number* (default: *dynamic, based on peer latency*) - The amount of time to wait (in ms) before timing out when requesting headers from a peer. Peers that time out will be disconnected and the request will be retried with another peer
