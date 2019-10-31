# Proxmise

`proxmise` is short for "proxied Promise". It lets you create an object where arbitrary keys can be accessed asynchronously.

## Installation

Requires __node v7.6.0__ or higher.

```bash
$ npm install proxmise
```

## Usage

```js
let Proxmise = require('proxmise')

// define a getter func
let prox = Proxmise((path, resolve, reject) => {
  // if `prox.foo.bar` is accessed, path will be [ 'foo', 'bar' ]
  resolve(path.join('.'))
})

console.log(await prox.this.is.the.path)
// -> 'this.is.the.path'
```

```js
// you can also use an async function
let prox = Proxmise(async (path) => path)
```

## License

MIT
