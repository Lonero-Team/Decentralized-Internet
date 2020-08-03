# This package is under construction and not yet in a production ready environment

# p2talk  

p2talk is an implementation of the original old school p2p protocol with the decentralized internet as an optional sync host for the backend

---  
# p2p

p2p implements a peer-to-peer protocol.

## Installation

    $ npm install p2p

## Quick start

First you need to add a reference to p2p.

```javascript
const p2p = require('p2p');
```

Then create a new peer by calling the `peer` function and specifying the host and the port to listen on.

Additionally, you need to specify a private key and a certificate. Please note that these values must be strings that contain data in `.pem` format.

```javascript
const peer = p2p.peer({
  host: 'localhost',
  port: 3000,
  privateKey: '...',
  certificate: '...'
});
```

If you do not want to use encryption you may omit the private key and the certificate. Then, the network will use plain text messages. Please note that this should be avoided since it is not secure!

```javascript
const peer = p2p.peer({
  host: 'localhost',
  port: 3000
});
```

Optionally you may specify a `metadata` property to attach arbitrary data to a peer. These metadata will be available to others when asking for information about the peer. You may use it, e.g., to store information on services a peer offers.

```javascript
const peer = p2p.peer({
  host: 'localhost',
  port: 3000,
  privateKey: '...',
  certificate: '...',
  metadata: {
    foo: 'bar'
  }
});
```

### Joining a network

To join a network, provide the host and the port of another peer that you want to join using the `wellKnownPeers` property.

```javascript
const peer = p2p.peer({
  host: 'localhost',
  port: 3000,
  privateKey: '...',
  certificate: '...',
  wellKnownPeers: { host: 'localhost', port: 4000 }
});
```

You may also specify multiple peers. This increases the chance to join a network even in case that some peers are down.

```javascript
const peer = p2p.peer({
  host: 'localhost',
  port: 3000,
  privateKey: '...',
  certificate: '...',
  wellKnownPeers: [
    { host: 'localhost', port: 4000 },
    { host: 'localhost', port: 5000 },
    { host: 'localhost', port: 6000 }
  ]
});
```

If the peer leaves the network, e.g. because of a connection error, it automatically tries to rejoin. For that it manages an internal list of peers that it got to know. To retrieve this list run the `wellKnownPeers.get` function.

```javascript
const wellKnownPeers = peer.wellKnownPeers.get();
```

You may store this list and re-use it when setting up a peer from scratch for the next time.

To get the status of a peer call its `status` function.

```javascript
console.log(peer.status());
// => 'lonely' or 'unbalanced' or 'joined'
```

Additionally, you may subscribe to the `status::*` event to get notified whenever the status of a peer changes.

```javascript
peer.on('status::*', status => {
  console.log(status);
  // => {
  //      from: 'lonely',
  //      to: 'unbalanced'
  //    }
});
```

If you are interested in entering a specific status, you may also subscribe to the more specialized events `status::lonely`, `status::unbalanced` and `status::joined`.

### Configuring housekeeping

By default, a peer tries to do housekeeping around every 30 seconds. If you need to change this, provide a property called `serviceInterval`.

```javascript
const peer = p2p.peer({
  host: 'localhost',
  port: 3000,
  privateKey: '...',
  certificate: '...',
  wellKnownPeers: [ ... ],
  serviceInterval: '10s'
});
```

Please note that this affects the way the protocol works. Hence setting the `serviceInterval` property should be avoided in most cases.

### Finding the responsible peer

If you want to find the peer responsible for a value, call the `getEndpointFor` function and provide the value as a string.

As a result you will get the endpoint of the peer as well as its metadata. If no metadata have been set, an empty object is returned.

```javascript
peer.getEndpointFor('foobar', (err, endpoint, metadata) => {
  // ...
});
```

If you want to know whether a peer is responsible for a specific value, call the `isResponsibleFor` and provide the value in question.

```javascript
console.log(peer.isResponsibleFor('foobar'));
// => true
```

### Detecting changes in your neighborhood

To detect whether the successor or predecessor of a peer changed, subscribe to the `environment::successor` and `environment::predecessor` events. Please note that the predecessor may be `undefined`.

```javascript
peer.on('environment::successor', successor => {
  // ...
});

peer.on('environment::predecessor', predecessor => {
  // ...
});
```

Please note that you can also subscribe to any environmental changes using a wildcard.

```javascript
peer.on('environment::*', successorOrPredecessor => {
  // ...
});
```

### Registering actions

To register custom actions, add them to the `handle` object. If an action is called on a peer, the module will call the appropriate function automatically. Once you are done you need to call the `done` callback. Optionally, you may provide a result.

```javascript
peer.handle.foo = (payload, done) => {
  // Do something with payload...
  if (err) {
    return done(err);
  }
  done(null);
  // or: done(null, result);
};
```

### Calling actions on remote peers

If you want to call an action on a remote peer, call the `remote.run` function, and provide the name of the action prefixed with `handle/` as well as its arguments and a callback. If the action returns a result, the callback has a `result` parameter.

```javascript
peer.remote({
  host: 'localhost',
  port: 4000
}).run('handle/foo', { foo: 'bar' }, (err, result) => {
  // ...
});
```

## Running the build

This module can be built using [Grunt](http://gruntjs.com/). Besides running the tests, this also analyses the code. To run Grunt, go to the folder where you have installed p2p and run `grunt`. You need to have [grunt-cli](https://github.com/gruntjs/grunt-cli) installed.

    $ grunt

To run the integration tests setup Docker and run Grunt using the `integration command`.

    $ grunt integration

## License

The MIT License (MIT)  
Copyright (c) 2012-2015 the native web.  
Copyright (c) 2019-2020 The Lonero Foundation

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
