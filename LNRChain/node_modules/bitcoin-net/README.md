# bitcoin-net

[![npm version](https://img.shields.io/npm/v/bitcoin-net.svg)](https://www.npmjs.com/package/bitcoin-net)
[![Build Status](https://travis-ci.org/mappum/bitcoin-net.svg?branch=master)](https://travis-ci.org/mappum/bitcoin-net)
[![Dependency Status](https://david-dm.org/mappum/bitcoin-net.svg)](https://david-dm.org/mappum/bitcoin-net)

**Bitcoin P2P networking that works in Node and the browser**

## Usage

`npm install bitcoin-net`

```js
// import network parameters for Bitcoin
var params = require('webcoin-bitcoin').net

// create peer group
var PeerGroup = require('./').PeerGroup
var peers = new PeerGroup(params)

peers.on('peer', (peer) => {
  console.log('connected to peer', peer.socket.remoteAddress)

  // send/receive messages
  peer.once('pong', () => console.log('received ping response'))
  peer.send('ping', {
    nonce: require('crypto').pseudoRandomBytes(8)
  })
  console.log('sent ping')
})

// create connections to peers
peers.connect()

// allow incoming connections from bitcoin-net peers
peers.accept((err) => {
  if (err) return console.error(err)
  console.log('accepting incoming connections')
})
```

#### Table of Contents

- [Class: PeerGroup](#peergroup)
  - [`new PeerGroup(params, [opts])`](#var-peers--new-peergroupparams-opts)
  - [`peers.connect()`](#peersconnect)
  - [`peers.accept([port], [cb])`](#peersacceptport-cb)
  - [`peers.addPeer(peer)`](#peersaddpeerpeer)
  - [`peer.send(command, payload, [assert])`](#peerssendcommand-payload-assert)
  - [`peers.createHeaderStream([opts])`](#peerscreateheaderstreamopts)
  - [`peers.createBlockStream(chain, [opts])`](#peerscreateheaderstreamchain-opts)
  - [`peers.getBlocks(hashes, [opts], cb)`](#peersgetblockshashes-opts-cb)
  - [`peers.getTransactions(blockHash, txids, [opts], cb)`](#peersgettransactionsblockhash-txids-opts-cb)
  - [`peers.getHeaders(locator, [opts], cb)`](#peersgetheaderslocator-opts-cb)
  - [`peers.randomPeer()`](#peersrandompeer)
  - [`peers.unaccept([cb])`](#peersunacceptcb)
  - [`peers.close([cb])`](#peersclosecb)
  - [`peers.peers`](#peerspeers)
  - [`peers.closed`](#peersclosed)
  - [`peers.accepting`](#peersaccepting)
- [Class: Peer](#peer)
  - [`new Peer(params, [opts])`](#var-peer--new-peerparams-opts)
  - [`peer.connect(socket)`](#peerconnectsocket)
  - [`peer.send(command, payload)`](#peersendcommand-payload)
  - [`peer.ping(cb)`](#peerpingcb)
  - [`peer.getBlocks(hashes, [opts], cb)`](#peergetblockshashes-opts-cb)
  - [`peer.getTransactions(blockHash, txids, [opts], cb)`](#peergettransactionsblockhash-txids-opts-cb)
  - [`peer.getHeaders(locator, [opts], cb)`](#peergetheaderslocator-opts-cb)
  - [`peer.disconnect([error])`](#peerdisconnecterror)
  - [`peer.version`](#peerversion)
  - [`peer.services`](#peerservices)
  - [`peer.socket`](#peersocket)

### PeerGroup

`PeerGroup` manages connections to multiple peers. It discovers peers through multiple methods: static IPs and DNS seeds provided in the network parameters, and [`peer-exchange`](https://github.com/mappum/peer-exchange) for clients in the browser. `PeerGroup` also optionally accepts incoming connections via WebSocket and/or WebRTC, to be accessible to browser clients.

----
#### `var peers = new PeerGroup(params, [opts])`

Creates  `PeerGroup` which manages peer connections for a network.

`params` should be the network parameters for the network you wish to use. Parameters for Bitcoin are available at `require('webcoin-bitcoin').net`. For more info about params you can use, see the [Parameters](#parameters) section.

`opts` can optionally specify the following:
- `numPeers` *Number* (default: `8`) - the number of peer connections to maintain
- `hardLimit` *Boolean* (default: `false`) - If `false`, the number of peers may exceed `numPeers` when accepting incoming connections. If `true` then we will drop some random connections to keep the number of peers at `numPeers`.
- `connectWeb` *Boolean* (default: `true` in browsers, `false` in Node) - enables making outgoing connections to `bitcoin-net` WebSocket/WebRTC peers
- `connectTimeout` *Number* (default: `5000`) - the amount of time (in milliseconds) before timing out when trying to open a connection
- `wrtc` *Object* (default: built-in implementation in browsers, `undefined` in Node) - a WebRTC implementation for Node.js clients, e.g. the [`wrtc`](https://github.com/js-platform/node-webrtc) or [`electron-webrtc`](https://github.com/mappum/electron-webrtc) packages
- `peerOpts` *Object* (default: `{}`) - The options object to pass to the [`Peer` constructor](#Peer).

----
#### `peers.connect()`

Begins making outgoing connections. Peers are discovered by choosing a random peer discovery method (static IPs and DNS seeds provided in the network parameters for standard TCP network peers, and [`peer-exchange`](https://github.com/mappum/peer-exchange) for `bitcoin-net` WebSocket/WebRTC peers).

The `PeerGroup` will connect to 8 peers by default (overridable via the `numPeers` option in the constructor). When a connection ends, a new one will be automatically created with a different peer to maintain the number of connections.

Whenever a connection is established, the new `Peer` will be emitted via the `peer` event.

----
#### `peers.accept([port], [cb])`

Begins accepting incoming connections via WebSocket and WebRTC. Note that in Node.js WebRTC is only used if the `wrtc` option was specified in the constructor.

`port` is the port the WebSocket server will listen on. If not provided, it will default to the `defaultWebPort` property in the network parameters (and if that is not set, it will default to 8192).

If provided, `cb` will be called with `cb(err)` when the `PeerGroup` begins listening or encounters an error while setting up the server.

For more information about the protocol for incoming connections, see the [`peer-exchange`](https://github.com/mappum/peer-exchange) module.

----
#### `peers.addPeer(peer)`

Manually add an already connected `Peer` to the `PeerGroup`. This can be useful if you would like to make a peer connection through your own transport, but have it be managed by the `PeerGroup`. This method will error if the `Peer` has not already finished its handshake (e.g. it hasn't emitted the `ready` event).

----
#### `peers.send(command, payload, [assert])`

Sends a message to all peers in the `PeerGroup`. See the [`bitcoin-protocol`](https://github.com/mappum/bitcoin-protocol#payload-reference) reference for a list of commands and message formats.

An error will thrown if there are no peers connected, unless `assert` is `false` (it defaults to `true`).

----
#### `peers.createHeaderStream([opts])`

Returns a new [`HeaderStream`](#HeaderStream), which is a readable stream that emits blockchain headers downloaded from peers in the `PeerGroup`.

The `opts` object is passed to the [`HeaderStream`](#HeaderStream) constructor.

----
#### `peers.createBlockStream(chain, [opts])`

Returns a new [`BlockStream`](#BlockStream), which is a readable stream that emits full or Bloom filtered blockchain blocks downloaded from peers in the `PeerGroup`.

`chain` should be an instance of `Blockchain`, as provided by the [`blockchain-spv`](https://github.com/mappum/blockchain-spv) module.

The `opts` object is passed to the [`BlockStream`](#BlockStream) constructor.

----
#### `peers.getBlocks(hashes, [opts], cb)`

Downloads a set of blocks from one of the peers in the `PeerGroup`. If the peer times out, the request will be retried with a different peer.

`hashes` should be an array of hashes of the blocks to download (as `Buffer`s).

`opts` may contain the following:
- `timeout` *Number* (default: `peer.latency * 10`) - Amount of time (in milliseconds) to wait before timing out on the request. If it times out, the request will be retried with a different peer.
- `filtered` *Boolean* (default: `false`) - Whether or not to request Bloom filtered Merkle-blocks, or full blocks

`cb` will be called with `cb(err, blocks)` once all of the requested blocks have been received or an error occurs.

----
#### `peers.getTransactions(blockHash, txids, [opts], cb)`

Downloads a set of transactions from one of the peers in the `PeerGroup`. Note that due to the design of Bitcoin full nodes, the requested transactions must all be in the same block and the block hash must be specified. Returned transactions are instances of `Transaction` from the [`bitcoinjs-lib`](https://github.com/bitcoinjs/bitcoinjs-lib) module.

`blockHash` should be the hash of the block containing the transactions (as a `Buffer`).

`txids` should be an array of `Buffer`s representing the hashes of the transactions to be downloaded.

`opts` may contain the following:
- `timeout` *Number* (default: `peer.latency * 10`) - Amount of time (in milliseconds) to wait before timing out on the request. If it times out, the request will be retried with a different peer.

`cb` will be called with `cb(err, transactions)` once all of the requested blocks have been received or an error occurs.

----
#### `peers.getHeaders(locator, [opts], cb)`

Downloads blockchain headers from a peer in the `PeerGroup`. Returns up to 2000 contiguous block headers, in order. Returned headers are instances of `Block` from the [`bitcoinjs-lib`](https://github.com/bitcoinjs/bitcoinjs-lib) module.

`locator` should be an array of one or more block hashes (as `Buffer`s), ordered descending by height, representing the starting point for the headers that will be sent. For more information about this, see the [`bitcoin wiki`](https://en.bitcoin.it/wiki/Protocol_documentation#getblocks).

`opts` may contain the following:
- `timeout` *Number* (default: `peer.latency * 10`) - Amount of time (in milliseconds) to wait before timing out on the request. If it times out, the request will be retried with a different peer.
- `stop` *Buffer* - If provided, no headers will be sent that come after the header with this hash

`cb` will be called with `cb(err, headers)` once all of the requested blocks have been received or an error occurs.

----
#### `peers.randomPeer()`

A helper function which returns a random peer from the `PeerGroup`. If there are no connected peers, this method will throw an error.

----
#### `peers.unaccept([cb])`

Stops accepting incoming connections. If provided, `cb` is called with `cb(err)` when listening has stopped.

----
#### `peers.close([cb])`

Disconnects from all peers and stops accepting incoming connections. If provided, `cb` is called with `cb(err)` when all peer connections have ended and listening has stopped.

----
#### `peers.peers`

An array containing the currently connected `Peer`s. Modifying this will cause undefined behavior.

----
#### `peers.closed`

A boolean which is true if `peers.close()` has been called.

----
#### `peers.accepting`

A boolean which is true if the `PeerGroup` is accepting incoming connections.

### Peer

`Peer` represents a connection to another node.

Received messages are parsed as JS objects (see [`bitcoin-protocol`](https://github.com/mappum/bitcoin-protocol#payload-reference) for the message formats) and emitted as events (e.g. `peer.on('inv', handler)` for `inv` messages). Some basic protocol logic is handled automatically (namely the initial handshake and sending/responding to ping messages).

----
#### `var peer = new Peer(params, [opts])`

`params` should be the network parameters for the network you wish to use. Parameters for Bitcoin are available at `require('webcoin-bitcoin').net`. For more info about params you can use, see the [Parameters](#parameters) section.

`opts` can specify the following:
- `getTip` *Function* - Should return a *Number* representing the node's blockchain height. This will get sent in the initial handshake for peer connections. Note that things will work fine even if this isn't provided.
- `relay` *Boolean* (default: `true`) - if `false` then the remote node will not relay transactions (unless a Bloom filter is set)
- `requireBloom` *Boolean* (default: `true`) - error if the peer does not support Bloom filtering
- `userAgent` *String* (default: `/<node or browser>:<version>/bitcoin-net:<version>/`) - sent in the handshake. See [BIP 14](https://github.com/bitcoin/bips/blob/master/bip-0014.mediawiki#Proposal) for the proper user agent format.
- `subUserAgent` *String* - like the `userAgent` option, but gets appended to the default user agent string rather than overriding it
- `handshakeTimeout` *Number* (default: `8000`) - the amount of time (in milliseconds) to wait before timing out when doing the initial handshake
- `pingInterval` *Number* (default: `15000`) - the amount of time (in milliseconds) between pings sent to the remote peer (used to ensure it is responsive and to measure latency)
- `socket` *duplex stream* - the peer connection (equivalent to calling `peer.connect(socket)`)

----
#### `peer.connect(socket)`

Begins communication with the remote peer over `socket`. The handshake will start after calling this, and the `ready` event will be emitted once it is complete.

`socket` should be a duplex stream.

----
#### `peer.send(command, payload)`

Sends a message to the remote peer. See the [`bitcoin-protocol`](https://github.com/mappum/bitcoin-protocol#payload-reference) reference for a list of commands and message formats.

----
#### `peer.ping(cb)`

Sends a ping message to the peer and calls the callback once a `pong` message is received.

`cb` will be called with `cb(err, latency)`.

----
#### `peer.getBlocks(hashes, [opts], cb)`

Downloads a set of blocks from the remote peer.

`hashes` should be an array of hashes of the blocks to download (as `Buffer`s).

`opts` may contain the following:
- `timeout` *Number* (default: `peer.latency * 10`) - Amount of time (in milliseconds) to wait before timing out on the request
- `filtered` *Boolean* (default: `false`) - Whether or not to request Bloom filtered Merkle-blocks, or full blocks

`cb` will be called with `cb(err, blocks)` once all of the requested blocks have been received or an error occurs.

----
#### `peer.getTransactions(blockHash, txids, [opts], cb)`

Downloads a set of transactions from the remote peer. Note that due to the design of Bitcoin full nodes, the requested transactions must all be in the same block and the block hash must be specified. Returned transactions are instances of `Transaction` from the [`bitcoinjs-lib`](https://github.com/bitcoinjs/bitcoinjs-lib) module.

`blockHash` should be the hash of the block containing the transactions (as a `Buffer`).

`txids` should be an array of `Buffer`s representing the hashes of the transactions to be downloaded.

`opts` may contain the following:
- `timeout` *Number* (default: `peer.latency * 10`) - Amount of time (in milliseconds) to wait before timing out on the request

`cb` will be called with `cb(err, transactions)` once all of the requested blocks have been received or an error occurs.

----
#### `peer.getHeaders(locator, [opts], cb)`

Downloads blockchain headers from the remote peer. Returns up to 2000 contiguous block headers, in order. Returned headers are instances of `Block` from the [`bitcoinjs-lib`](https://github.com/bitcoinjs/bitcoinjs-lib) module.

`locator` should be an array of one or more block hashes (as `Buffer`s), ordered descending by height, representing the starting point for the headers that will be sent. For more information about this, see the [`bitcoin wiki`](https://en.bitcoin.it/wiki/Protocol_documentation#getblocks).

`opts` may contain the following:
- `timeout` *Number* (default: `peer.latency * 10`) - Amount of time (in milliseconds) to wait before timing out on the request
- `stop` *Buffer* - If provided, no headers will be sent that come after the header with this hash

`cb` will be called with `cb(err, headers)` once all of the requested blocks have been received or the request times out.

----
#### `peer.disconnect([error])`

Disconnects the peer and its underlying socket. The `disconnect` event will be emitted once the peer has disconnected.

`error` may be an `Error` that describes why the peer is being disconnected (emitted as an argument to listeners of the `disconnect` event).

----
#### `peer.version`

The `version` message received from the remote peer during the initial handshake.

----
#### `peer.services`

The node services supported by the remote peer, as an array of strings (containing service strings such as `'NODE_NETWORK'`, `'NODE_BLOOM'`).

----
#### `peer.socket`

The underlying duplex stream used to communicate with the remote peer.


----
### Parameters

Parameters specify constants for cryptocurrency networks. Parameters should contain the following:
```js
{
  // REQUIRED

  // the fixed value which is used as a prefix to each packet, used to ensure
  // peers are on the same network.
  // (in Bitcoin, this is 0xd9b4bef9)
  magic: Number,

  // the default port this network uses to listen for TCP connections
  // (in Bitcoin, this is 8333)
  defaultPort: Number,

  // OPTIONAL

  // the default port to listen on for WebSocket servers. If not provided,
  // default will be 8192
  defaultWebPort: Number,

  // an array of `bitcoin-net` nodes which are accepting incoming WebSocket
  // connections, used to bootstrap the WebSocket/WebRTC peer exchange. If no
  // web seeds are provided, browser clients will not be able to make any
  // connections
  webSeeds: [
    String, // the hostname of a seed, and optionally the port, in the following format:
            // 'hostname' or 'hostname:port'
    ...
  ],

  // an array of DNS seeds which will be used to discover TCP peers
  dnsSeeds: [
    String, // the hostname of a DNS seed, e.g. 'seed.bitcoin.sipa.be'
    ...
  ],

  // an array of known TCP peers that can be connected to when making outgoing connections
  staticPeers: [
    String, // the hostname of a peer, and optionally the port, in the following format:
            // 'hostname' or 'hostname:port'
    ...
  ]
}
```

For some examples, see these parameter repos:
- [`webcoin-bitcoin`](https://github.com/mappum/webcoin-bitcoin/blob/master/src/net.js)
- [`webcoin-bitcoin-testnet`](https://github.com/mappum/webcoin-bitcoin-testnet/blob/master/src/net.js)
- [`webcoin-zcash-alpha`](https://github.com/mappum/webcoin-zcash-alpha/blob/master/src/net.js)
