# tendermint

A light client for Tendermint blockchains which works in Node.js and browsers.

### Usage
```
npm install tendermint
```

**Light Node**

Requests data over RPC and verifies blockchain headers

```js
let Tendermint = require('tendermint')

// some full node's RPC port
let peer = 'ws://localhost:46657'

// `state` contains a part of the chain we know to be valid. If it's
// too old, we cannot safely verify the chain and need to get a newer
// state out-of-band.
let state = {
  // a header, in the same format as returned by RPC
  // (see http://localhost:46657/commit, under `"header":`)
  header: { ... },

  // the valdiator set for this header, in the same format as returned by RPC
  // (see http://localhost:46657/validators)
  validators: [ ... ],

  // the commit (validator signatures) for this header, in the same format as
  // returned by RPC (see http://localhost:46657/commit, under `"commit":`)
  commit: { ... }
}

// options
let opts = {
  // the maximum age of a state to be safely accepted,
  // e.g. the unbonding period
  // (in seconds)
  maxAge: 1728000 // defaults to 30 days
}

// instantiate client. will automatically start syncing to the latest state of
// the blockchain
let node = Tendermint(peer, state, opts)

// make sure to handle errors
node.on('error', (err) => { ... })
// emitted once we have caught up to the current chain tip
node.on('synced', () => { ... })
// emitted every time we have verified a new part of the blockchain
node.on('update', () => { ... })

// returns the height of the most recent header we have verified
node.height()

// returns the state object ({ header, validators, commit }) of the most recently
// verified header, should be stored and used to instantiate the light client
// the next time the user runs the app
node.state()
```

**RPC Client**

Simple client to make RPC requests to nodes

```js
let { RpcClient } = require('tendermint')

let client = RpcClient('ws://localhost:46657')

// request a block
client.block({ height: 100 })
  .then((res) => console.log(res))
```

The following RPC methods are available:

```
- subscribe
- unsubscribe
- status
- netInfo
- dialSeeds
- blockchain
- genesis
- block
- validators
- dumpConsensusState
- broadcastTxCommit
- broadcastTxSync
- broadcastTxSync
- unconfirmedTxs
- numUnconfirmedTxs
- abciQuery
- abciInfo
- abciProof
- unsafeFlushMempool
- unsafeSetConfig
- unsafeStartCpuProfiler
- unsafeStopCpuProfiler
- unsafeWriteHeapProfile
```
