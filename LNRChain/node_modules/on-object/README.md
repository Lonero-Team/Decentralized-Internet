# on-object

[![npm version](https://img.shields.io/npm/v/on-object.svg)](https://www.npmjs.com/package/on-object)
[![Build Status](https://travis-ci.org/mappum/on-object.svg?branch=master)](https://travis-ci.org/mappum/on-object)
[![Dependency Status](https://david-dm.org/mappum/on-object.svg)](https://david-dm.org/mappum/on-object)

**Register many EventEmitter listeners at once using objects**

## Usage

`npm install on-object`

```js
var EventEmitter = require('on-object')
var emitter = new EventEmitter()

emitter.on({
  foo: function () {
    console.log('foo event emitted')
  },
  bar: function () {
    console.log('bar event emitted')
  }
})
emitter.once({ ... })
emitter.removeListener({ ... })
```

### Instantiation

You can just use this module as a replacement for the `EventEmitter` class in the `events` module:

```js
var EventEmitter = require('on-object')
var emitter = new EventEmitter()
```

You can also use it to wrap the methods of a pre-existing `EventEmitter`:

```js
var EventEmitter = require('events')
var onObject = require('on-object')

var emitter = onObject(new EventEmitter())
```

## Rationale

This module is useful when you find yourself registering many event listeners at once and want the syntax to look a little less noisy.

For example, you might write something like this using the original API:
```js
emitter.on('foo', function () {
  console.log('foo')
})
emitter.on('bar', function () {
  console.log('bar')
})
emitter.on('bar2', function () {
  console.log('bar2')
})
```

This module will let you do this:
```js
emitter.on({
  foo: function () {
    console.log('bar')
  },
  bar: function () {
    console.log('bar')
  },
  bar2: function () {
    console.log('bar2')
  }
})
```

Also, you can make it look especially nice with the ES6 object method syntax:
```js
emitter.on({
  foo () {
    console.log('bar')
  },
  bar () {
    console.log('bar')
  },
  bar2 () {
    console.log('bar2')
  }
})
```
