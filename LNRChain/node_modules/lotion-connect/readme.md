# lotion-connect

The [Lotion](https://github.com/keppel/lotion) `connect()` API in a standalone, browser-friendly module.

## Installation

```bash
$ npm install lotion-connect
```

## Usage

Connecting by GCI isn't supported in this module just yet, so for now, connect to your app like this:

```js
let connect = require('lotion-connect')

let { state, send } = await connect(null, { 
  genesis: require('./genesis.json'),
  nodes: [ 'ws://localhost:46657' ]
})

console.log(await state)
console.log(await send({ foo: 'bar' }))
```