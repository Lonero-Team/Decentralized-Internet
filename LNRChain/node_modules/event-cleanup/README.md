# event-cleanup

[![npm version](https://img.shields.io/npm/v/event-cleanup.svg)](https://www.npmjs.com/package/event-cleanup)
[![Build Status](https://travis-ci.org/mappum/event-cleanup.svg?branch=master)](https://travis-ci.org/mappum/event-cleanup)
[![Dependency Status](https://david-dm.org/mappum/event-cleanup.svg)](https://david-dm.org/mappum/event-cleanup)

**Wrap an EventEmitter for easy listener cleanup**

## Usage

`npm install event-cleanup`

```js
var wrap = require('event-cleanup')

// wrap an EventEmitter called `emitter`
var wrapper = wrap(emitter)

// wrapper has all of the EventEmitter methods
// and receives all events emitted by `emitter`
wrapper.on(...)
wrapper.once(...)
wrapper.removeListener(...)
...

// when done, remove all listeners on `wrapper`
// (leaving `emitter` untouched)
wrapper.removeAll()
```

`event-cleanup` lets you wrap an [`EventEmitter`](https://nodejs.org/api/events.html#events_class_eventemitter), letting you add/remove listeners to a separate `EventEmitter` without polluting the original. When you are done, you can clean up all of the listeners added to the wrapper `EventEmitter`.

### API

#### `var wrapper = wrap(emitter)`

Creates a wrapper `EventEmitter` which receives all events emitted by `emitter`.

The returned object has all `EventEmitter` methods (e.g. `wrapper.on(event, listener)`). Calling `wrapper.emit(event, listener)` will only emit the event to the listeners added directly to the wrapper, not the wrapped `emitter`.

#### `wrapper.removeAll()`

Removes all listeners added directly to `wrapper`.

## Rationale

I often found myself in a code pattern where I would temporarily add event listeners to some `EventEmitter`, then need to remove them all when done. However, this requires keeping a reference to all listener functions so that they can be removed with `removeListener()`, which can be inconvenient. It also makes it possible to accidentally leak listeners if they never got removed.

This module makes this use-case easy: in a function where you add temporary listeners, wrap the `EventEmitter` and add the listeners to it, then call `removeAll()` when done to ensure all listeners are cleaned up.
