# discovery-channel

Search for a key across multiple discovery networks and find peers who answer.

Currently searches across and advertises on [the Bittorrent DHT](https://en.wikipedia.org/wiki/Mainline_DHT), centralized DNS servers and [Multicast DNS](https://en.wikipedia.org/wiki/Multicast_DNS) simultaneously.

Uses the [bittorrent-dht](https://github.com/feross/bittorrent-dht) and [dns-discovery](https://github.com/mafintosh/dns-discovery) modules.

Also check out [discovery-swarm](https://github.com/mafintosh/discovery-swarm) which adds connection management on top of this module.

[![travis][travis-image]][travis-url]

[travis-image]: https://img.shields.io/travis/maxogden/discovery-channel.svg?style=flat
[travis-url]: https://travis-ci.org/maxogden/discovery-channel

## Usage

### `var DC = require('discovery-channel')`

Returns a constructor

### `var channel = DC(<opts>)`

Returns a new instance. `opts` is optional and can have the following properties:

- `dns` - default `undefined`, if `false` will disable `dns` discovery, any other value type will be passed to the `dns-discovery` constructor
- `dht` - default `undefined`, if `false` will disable `dht` discovery, any other value type will be passed to the `bittorrent-dht` constructor
- `hash` - default `sha1`. provide a custom hash function to hash ids before they are stored in the dht / on dns servers.

By default hashes are re-announced around every 10 min on the dht and 1 min using dns. Set `dht.interval` or `dns.interval` to change these.

### `channel.join(id, [port], [cb])`

Perform a lookup across all networks for `id`. `id` can be a buffer or a string.
Specify `port` if you want to announce that you share `id` as well.

If you specify `cb`, it will be called **when the first round** of discovery has completed. But only on the first round.

### `channel.leave(id, [port])`

Stop looking for `id`. `id` can be a buffer or a string.
Specify `port` to stop announcing that you share `id` as well.

### `channel.update()`

Force announce / lookup all joined hashes

### `var list = channel.list()`

List all the channels you have joined. The returned array items look like this

``` js
{
  id: <Buffer>,
  port: <port you are announcing>
}
```

### `channel.on('peer', id, peer, type)`

Emitted when a peer answers your query.

- `id` is the id (as a buffer) this peer was discovered for
- `peer` is the peer that was discovered `{port: port, host: host}`
- `type` is the network type (one of `['dht', 'dns']`)

### `channel.destroy(cb)`

Stops all lookups and advertisements and call `cb` when done.

### `channel.on('close')`

Emitted when the channel is destroyed
