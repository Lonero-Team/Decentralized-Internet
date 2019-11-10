# dns-socket

Make custom low-level DNS requests from node with retry support.

```
npm install dns-socket
```

[![build status](https://travis-ci.org/mafintosh/dns-socket.svg?branch=master)](https://travis-ci.org/mafintosh/dns-socket)

## Usage

``` js
var dns = require('dns-socket')
var socket = dns()

socket.query({
  questions: [{
    type: 'A',
    name: 'google.com'
  }]
}, 53, '8.8.8.8', function (err, res) {
  console.log(err, res) // prints the A record for google.com
})
```

## API

#### `var socket = dns([options])`

Create a new DNS socket instance. The `options` object includes:

- `retries` *Number*: Number of total query attempts made during `timeout`. Default: 5.
- `socket` *Object*: A custom dgram socket. Default: A `'udp4'` socket.
- `timeout` *Number*: Total timeout in milliseconds after which a `'timeout'` event is emitted. Default: 7500.

#### `socket.on('query', query, port, host)`

Emitted when a dns query is received. The query is a [dns-packet](https://github.com/mafintosh/dns-packet)

#### `socket.on('response', response, port, host)`

Emitted when a dns response is received. The response is a [dns-packet](https://github.com/mafintosh/dns-packet)

#### `var id = socket.query(query, port, [host], [callback])`

Send a dns query. If host is omitted it defaults to localhost. When the remote replies the callback is called with `(err, response, query)` and an response is emitted as well. If the query times out the callback is called with an error.

Returns the query id

#### `socket.response(query, response, port, [host])`

Send a response to a query.

#### `socket.cancel(id)`

Cancel a query

#### `socket.bind(port, [onlistening])`

Bind the underlying udp socket to a specific port.

#### `socket.destroy([onclose])`

Destroy the socket.

#### `socket.inflight`

Number of inflight queries.

## License

MIT
