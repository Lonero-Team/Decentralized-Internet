#kilt

Combines multiple event emitters into a single emitter.

[![Build Status](https://secure.travis-ci.org/hapijs/kilt.svg)](http://travis-ci.org/hapijs/kilt)

Lead Maintainer - [Emily Rose](https://github.com/nexxy)

## Usage

Installation:

```bash
$ npm install --save kilt
```

Instantiate a kilt instance with the event emitters to combine and listen for
events on the new kilt instance. Kilt derives from `EventEmitter` and may also
be used to emit events.

```js
var Events = require('events');
var Kilt   = require('kilt');

var emitter1 = new Events.EventEmitter();
var emitter2 = new Events.EventEmitter();

var kilt = new Kilt([emitter1, emitter2]);

// A single handler for both emitters.
kilt.on('hello', function (data) {
    console.log(data);
});

// Emit events from multiple emitters.
emitter1.emit('hello', 'Hello from emitter1');
emitter2.emit('hello', 'Hello from emitter2');

// Emit a event using kilt.
kilt.emit('hello', 'Hello from Kilt');
```

Output:

```bash
Hello from emitter1
Hello from emitter2
Hello from kilt
```

### Methods

#### `Kilt([emitter(s)])`

Kilt constructor which accepts optional emitters to manage.

```js
var kilt = new Kilt();
... = new Kilt(emitter);
... = new Kilt([emitter]);
... = new Kilt([emitter1, emitter2]);
```

##### `addEmitter(emitter)`

Add an emitter for kilt to manage.

```js
var emitter = new Events.Emitter();
kilt.addEmitter(emitter);
```

##### `on(type, listener)`

Attach a listener to all emitters with the specified type.

```js
kilt.on('example', function (data) {
    console.log(data);
});
```

##### `once(type, listener)`

Attach a listener to all emitters with the specified type that will only fire
once.

```js
kilt.once('example', console.log.bind(console, '"example" event emitted once with data:'));
```

##### `removeListener(type, listener)`

Remove the specified listener.

```js
var emitter = new Events.Emitter();
var listener = function () {
    return;
};

kilt.addEmitter(emitter);

// Attach listener.
kilt.on('example', listener);

// Remove listener.
kilt.removeListener('example', listener);
```

##### `removeAllListeners([type])`

Remove all listeners. Optionally, you may specify the type of listeners to
remove.

```js
// Attach listeners.
kilt.on('example', ...);
kilt.on('example', ...);
kilt.on('example', ...);
kilt.on('other', ...);

// Only remove listeners of a specific type.
kilt.removeAllListeners('example');

// Remove all listeners.
kilt.removeAllListeners();
```

##### `emit(type[, data])`

Emit the specified event with the specified, optional data.

```js
var emitter = new Events.Emitter();
var kilt = new Kilt(emitter);

// Attach listener.
kilt.on('example', console.log.bind(console, '"example" event emitted with data:'));

// Emit event on kilt.
kilt.emit('example', 'emitted');
```
