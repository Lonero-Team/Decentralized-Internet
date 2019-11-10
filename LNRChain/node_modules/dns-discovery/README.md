# dns-discovery

Discovery peers in a distributed system using regular dns and multicast dns.

```
npm install dns-discovery
```

[![build status](http://img.shields.io/travis/mafintosh/dns-discovery.svg?style=flat)](http://travis-ci.org/mafintosh/dns-discovery)

## Usage

``` js
var discovery = require('dns-discovery')

var disc1 = discovery()
var disc2 = discovery()

disc1.on('peer', function (name, peer) {
  console.log(name, peer)
})

// announce an app
disc2.announce('test-app', 9090)
```

## API

#### `var disc = discovery([options])`

Create a new discovery instance. Options include:

``` js
{
  server: 'discovery.example.com:9090', // put a centralized dns discovery server here
  ttl: someSeconds, // ttl for records in seconds. defaults to Infinity.
  limit: someLimit, // max number of records stored. defaults to 10000.
  multicast: true, // use multicast-dns. defaults to true.
  domain: 'my-domain.com', // top-level domain to use for records. defaults to dns-discovery.local
  socket: someUdpSocket, // use this udp socket as the client socket
  loopback: false // discover yourself over multicast
}
```

If you have more than one discovery server you can specify an array

``` js
{
  server: [
    'discovery.example.com:9090',
    'another.discovery.example.com'
  ]
}
```

#### `disc.lookup(name, [callback])`

Do a lookup for a specific app name. When new peers are discovered for this name peer events will be emitted. The callback will be called when the query is complete.

``` js
disc.on('peer', function (name, peer) {
  console.log(name) // app name this peer was discovered for (ie 'example')
  console.log(peer) // {host: 'some-ip', port: 1234}
})
disc.lookup('example')
```

#### `disc.announce(name, port, [options], [callback])`

Announce a new port for a specific app name. Announce also does a lookup so you don't need to do that afterwards.

If you want to specify a public port (a port that is reachable from outside your firewall) you can set the `publicPort: port`
option. This will announce the public port to your list of dns servers and use the other port over multicast.

You can also set `impliedPort: true` to announce the public port of the dns socket to the list of dns servers.

#### `disc.unannounce(name, port, [options], [callback])`

Stop announcing a port for an app. Has the same options as .announce

#### `disc.listen([port], [callback])`

Listen for dns records on a specific port. You *only* need to call this if you want to turn your peer into a discovery server that other peers can use to store peer objects on.

``` js
var server = discovery()
server.listen(9090, function () {
  var disc = discovery({server: 'localhost:9090'})
  disc.announce('test-app', 8080) // will announce this record to the above discovery server
})
```

You can setup a discovery server to announce records on the internet as multicast-dns only works on a local network.
The port defaults to `53` which is the standard dns port. Additionally it tries to bind to `5300` to support networks that filter dns traffic.

#### `disc.destroy([onclose])`

Destroy the discovery instance. Will destroy the underlying udp socket as well.

#### `Event: "listening"`

Emitted after a successful `listen()`.

#### `Event: "close"`

Emitted after a successful `destroy()`.

#### `Event: "peer" (name, {host, port})

Emitted when a peer has been discovered.

 - **name** The app name the peer was discovered for.
 - **host** The address of the peer.
 - **port** The port the peer is listening on.

#### `Event: "announced" (name, {port})`

Emitted after a successful `announce()`.

 - **name** The app name that was announced.
 - **port** The port that was announced.

#### `Event: "unannounced" (name, {port})`

Emitted after a successful `unannounce()`.

 - **name** The app name that was unannounced.
 - **port** The port that was unannounced.

#### `Event: "traffic" (type, details)`

Emitted when any kind of message event occurs. The `type` will be prefixed with `'in:'` to indicate inbound, and `'out:'` to indicate outbound messages. This event is mostly useful for debugging.

#### `Event: "secrets-rotated"`

Emitted when the internal secrets used to generate session tokens have been rotated. This event is mostly useful for debugging.

#### `Event: "error" (err)`

Emitted when networking errors occur, such as failures to bind the socket (EACCES, EADDRINUSE).

## CLI

There is a cli tool available as well

``` sh
npm install -g dns-discovery
dns-discovery help
```

To announce a service do

``` sh
# will announce test-app over multicast-dns
dns-discovery announce test-app --port=8080
```

To look it up

``` sh
# will print services when they are found
dns-discovery lookup test-app
```

To run a discovery server

``` sh
# listen for services and store them with a ttl of 30s
dns-discovery listen --port=9090 --ttl=30
```

And to announce to that discovery server (and over multicast-dns)

``` sh
# replace example.com with the host of the server running the discovery server
dns-discovery announce test-app --server=example.com:9090 --port=9090
```

And finally to lookup using that discovery server (and multicast-dns)

``` sh
dns-discovery lookup test-app --server=example.com:9090
```

You can use any other dns client to resolve the records as well. For example using `dig`.

``` sh
# dig requires the discovery server to run on port 53
dig @discovery.example.com test-app SRV
```

## License

MIT
