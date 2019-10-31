# muta

Mutate your objects without mutating your objects

**Overview:**
- A thin wrapper around JS objects/arrays, using the [`Proxy`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) API
- Protects data (similar to cloning), but without memory or CPU costs
- Mutations made to the wrapper can be either committed to the original object or thrown away
- All operations happen in `O(1)`

`muta` lets you wrap an object and make mutations to it, while only keeping in memory the unmodified original object and the mutation "patch". The wrapper can be accessed as if the mutations had made to the original object, and the mutations can be eventually committed to the original object if desired.

This module provides similar functionality to the [`jsondiffpatch`](https://github.com/benjamine/jsondiffpatch) and [`immer`](https://github.com/mweststrate/immer) modules, although it is more efficient for large objects since we build the patch as the data is mutated rather than iterating through all the keys to compare at the end. In other words, `jsondiffpatch` and `immer` are both O(N), but `muta` is O(1).

## Usage
`npm install muta`

```js
let muta = require('muta')

let originalData = { foo: { bar: 123 } }

// `virtualData` appears to be the same as `originalData`,
let virtualData = muta(originalData)

// but changes you make to it don't affect `originalData`
virtualData.foo.bar += 1
console.log(originalData) // { foo: { bar: 123 } }
console.log(virtualData) // { foo: { bar: 124 } }

// view the mutations with muta.getPatch
console.log(muta.getPatch(virtualData)) // { foo: { [Symbol(assign)]: { bar: 124 } } }

// if you want to apply the changes,
// call muta.commit on the wrapper
muta.commit(virtualData)
console.log(originalData) // { foo: { bar: 124 } }
```
