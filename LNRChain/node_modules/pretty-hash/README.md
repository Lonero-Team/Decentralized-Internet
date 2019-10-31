# pretty-hash

Output binary buffers as a nice shortened hex string

```js
var prettyHash = require('pretty-hash')
var crypto = require('crypto')

prettyHash(crypto.randomBytes(32)) // => '0b0a97..f3'
prettyHash(crypto.randomBytes(16)) // => '0b0395..8a'
prettyHash(crypto.randomBytes(4)) // => '49ab09ed'
prettyHash(crypto.randomBytes(1)) // => 'f8'
prettyHash('not a hash') // => 'not a hash'
```