# peer-exchange

[![npm version](https://img.shields.io/npm/v/peer-exchange.svg)](https://www.npmjs.com/package/peer-exchange)
[![Build Status](https://travis-ci.org/mappum/peer-exchange.svg?branch=master)](https://travis-ci.org/mappum/peer-exchange)
[![Dependency Status](https://david-dm.org/mappum/peer-exchange.svg)](https://david-dm.org/mappum/peer-exchange)

**Decentralized peer discovery and signaling**

`peer-exchange` is a client for the Peer Exchange Protocol (PXP), a decentralized protocol for peer discovery and signaling. Rather than using centralized signal hubs, each node in the network exchanges peers and relays signaling data.

This client uses WebRTC for peer connections, but you may also use any other transport by manually connecting and passing in a duplex stream.

## Usage

`npm install peer-exchange`

```js
var Exchange = require('peer-exchange')

var ex = new Exchange('some-network-id', { wrtc: wrtc })
// The network id can be any string unique to your network.
// When using Node.js, the `wrtc` option is required.
// (This can come from the 'wrtc' or 'electron-webrtc' packages).

ex.on('connect', (conn) => {
  // `conn` is a duplex stream multiplexed through the PXP connection,
  // which can be used for your P2P protocol.
  conn.pipe(something).pipe(conn)

  // We can query our current peers for a new peer by calling `getNewPeer()`.
  // `peer-exchange` will do the WebRTC signaling and connect to the peer.
  if (ex.peers.length < 8) ex.getNewPeer()
})

// Bootstrap by connecting to one or more already-known PXP peers.
// You can use any transport that creates a duplex stream (in this case TCP).
var socket = net.connect(8000, '10.0.0.1', () => ex.connect(socket))

// You can optionally accept incoming connections using any transport.
var server = net.createServer((socket) => ex.accept(socket))
server.listen(8000)
```

### API

## Exchange

```js
var Exchange = require('peer-exchange')
```

#### Methods


#### `var ex = new Exchange(networkId, [opts])`

Creates a new exchange, which is used to manage connections to peers in a P2P network. After we establish some initial connections, we can query our current peers for new peers. Additionally, we will share peers when we receive queries.

`networkId` should be a string unique to the network. Nodes can only peer with other nodes that use the same ID. If you need to participate in multiple networks, create multiple `Exchange` instances with different IDs.

`opts` should contain the following properties:
 - `wrtc`, *Object* - A WebRTC implementation for Node.js clients (e.g. [`wrtc`](https://github.com/js-platform/node-webrtc) or [`electron-webrtc`](https://github.com/mappum/electron-webrtc)). In browsers, the built-in implementation is used by default.

----
#### `ex.connect(socket, [callback])`

Manually adds a peer. This is necessary to bootstrap our exchange with initial peers which we can query for additional peers. This method is for *outgoing* connections, for *incoming* connections use `accept`.

`socket` should be a duplex stream that represents a connection to a peer which implements the Peer Exchange Protocol.

`callback` will be called with `callback(err, connection)`, where `connection` is a duplex stream which may be used by your application for your P2P protocol.

----
#### `ex.accept(socket, [callback])`

Similar to `connect`, but used with *incoming* peer connections.

----
#### `ex.getNewPeer([callback])`

Queries out current peers for a new peer, then connects to it via WebRTC. The already-connected peer will act as a relay for signaling.

The `'connect'` event will be emitted once the connection is established.

This will error if our exchange is not connected to any peers.

`callback` will be called with `callback(err, connection)`.

----
#### `ex.close([callback])`

Closes all peer connections in the exchange and prevents adding any new connections.

`callback` is called with `callback(err)` when the exchange is closed (or when an error occurs).

----

#### Properties

#### `ex.peers`

An array of connected peers. Useful for iterating through peers or getting the number of connections.

#### `ex.networkId`

The network ID provided in the constructor.

----

#### Events

#### `ex.on('connect', function (conn) { ... })`

Emitted whenever a new peer connection is established (both incoming and outgoing).

#### `ex.on('error', function (err) { ... })`

Emitted when an error occurs.

----

## Security Notes

Some efforts were made to make this module DoS-resistant, but there are probably still some weaknesses.

It is recommended to use an authenticated transport when possible (e.g. WebSockets over HTTPS) for initial bootstrapping to prevent man-in-the-middle attacks (attackers could control all the peers you connect to, which can be very bad in some applications).

## Comparison with `signalhub`

This module provides functionality similar to [`signalhub`](https://github.com/mafintosh/signalhub), where P2P nodes can get addresses of new peers and establish connections by relaying signaling data. However, this module differs by getting all nodes to provide this "hub" service, rather than a few centralized servers. It also only exchanges currently-connected peer addresses rather than providing general-purpose broadcasting.

Note that `signalhub` may be better suited for some applications, for instance when connecting to peers in small swarms when no peer addresses are initially known (e.g. BitTorrent swarms). In the future, a DHT could help with finding initial peers for this sort of use case.
