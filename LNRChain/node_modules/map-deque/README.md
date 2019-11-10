# map-deque

[![npm version](https://img.shields.io/npm/v/map-deque.svg)](https://www.npmjs.com/package/map-deque)
[![Build Status](https://travis-ci.org/mappum/map-deque.svg?branch=master)](https://travis-ci.org/mappum/map-deque)
[![Dependency Status](https://david-dm.org/mappum/map-deque.svg)](https://david-dm.org/mappum/map-deque)

**A map with ordered insertion and removal**

`MapDeque` is used to get constant time ordered insertion and removal (like a queue or a stack), and also provide constant-time lookup by key (like a map).

## Usage

`npm install map-deque`

```js
var MapDeque = require('map-deque')
var md = new MapDeque()
md.push('key', 'value')
md.get('key') // => "value"
md.shift() // removes 'key'
```

#### `md.push(key, value)`

Adds the given key and value to the *end* of the `MapDeque`.

If a value already exists with this key, an error is thrown.

Note that the key is converted to a string, similar to `var o = {}; o[key] = value`.

----
#### `md.unshift(key, value)`

Adds the given key and value to the *beginning* of the `MapDeque`.

----
#### `md.shift([entry])`

Shifts a value off of the *beginning* of the `MapDeque`, and returns its value. If `entry` is `true`, the returned value will be an object containing `{ key: <key>, value: <value> }`.

----
#### `md.pop([entry])`

Shifts a value off of the *end* of the `MapDeque`, and returns its value. If `entry` is `true`, the returned value will be an object containing `{ key: <key>, value: <value> }`.

----
#### `md.get(key)`

Returns the value associated with `key`.

----
#### `md.has(key)`

Returns `true` if there is a value associated with `key`, otherwise `false`.

----
#### `md.length`

The number of values in the `MapDeque`.
