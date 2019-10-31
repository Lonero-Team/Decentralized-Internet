# js-abci

ABCI server for Node.js. Supports up to Tendermint version 0.19.

## Usage

`npm install abci`

Requires Node.js v10.9+

```js
let createServer = require('abci')

let server = createServer({
  info (request) {
    console.log('got info request', request)
    return { ... }
  }

  // implement any ABCI method handlers here
})
server.listen(26658)
```

### `let server = createServer(app)`

Returns a [`net.Server`](https://nodejs.org/api/net.html#net_class_net_server) that accepts ABCI connections from a Tendermint node.

`app` should be an object with ABCI method handler functions. Each handler receives one `request` argument, and can return the response value or a `Promise` which resolves to the response value. `cb` responds to the ABCI request with either the error or `response` value.

Supported ABCI methods are:

```
echo
flush
info
setOption
initChain
query
beginBlock
checkTx
deliverTx
endBlock
commit
```
