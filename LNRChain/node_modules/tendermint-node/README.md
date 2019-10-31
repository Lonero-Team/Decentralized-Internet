# tendermint-node

Run a [Tendermint](https://tendermint.com) full node.

On install, this package downloads a prebuilt Tendermint binary from the [official Tendermint releases](https://github.com/tendermint/tendermint/releases), and checks it against a known SHA256 hash.

## Usage
`npm install tendermint-node`

```js
let tendermint = require('tendermint-node')

// init a directory for running tendermint
tendermint.initSync({ home: './tendermint' })

// start the full node
let node = tendermint.node({
  home: './tendermint',
  rpc: {
    laddr: 'tcp://0.0.0.0:8888'
  }
  // these options are equivalent to CLI flags
})
node.stdout.pipe(process.stdout)
```

### `tendermint.init(path)`

Initializes a data directory to be used by a full node.  `path` should be the path to the directory to be initialized.

Returns a `Promise`.

### `tendermint.initSync(path)`

The synchronous version of `tendermint.init()`.

### `tendermint.node(path, opts)`

Spawns a Tendermint full node.

Returns a `ChildProcess` object representing the Tendermint process. It has an `rpc` property which is a client for the node's RPC server ([RpcClient](https://github.com/mappum/js-tendermint)).
`path` should be a path to the directory (initialized by `init` or `initSync`).

`opts` may be an object containing options passed to Tendermint as CLI arguments (you may use any flag supported by Tendermint). To see all supported options, run `npm i -g tendermint-node && tendermint node --help`.

### `tendermint.lite(target, path, opts)`

Spawns a Tendermint light node (talks to a full node and verifies its RPC data).

Returns a `ChildProcess` object representing the Tendermint process. It has an `rpc` property which is a client for the node's RPC server ([RpcClient](https://github.com/mappum/js-tendermint)).

`target` should be the URL of a full node's RPC server (e.g. `http://somefullnode.com:46657`).

`path` should be a path to a directory where light client data will be stored.

`opts` may be an object containing options passed to tendermint as CLI arguments (you may use any flag supported by tendermint). To see all supported options, run `npm i -g tendermint-node && tendermint lite --help`.

### `tendermint.version()`

Returns the tendermint binary's version string.

### `tendermint.genValidator()`

Generates a validator private key, returned as stringified JSON.
