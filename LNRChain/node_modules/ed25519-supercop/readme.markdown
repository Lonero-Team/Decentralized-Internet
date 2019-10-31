# ed25519-supercop

ed25519 curve operations using a supercop/ref10 implementation

[![travis-image](https://api.travis-ci.org/substack/ed25519-supercop.svg)](https://travis-ci.org/substack/ed25519-supercop)

This module provides C++ bindings for
[orlp/ed25519](https://github.com/orlp/ed25519)
(formerly [nightcracker/ed25519](https://github.com/nightcracker/ed25519)).

supercop implementations use the same algorithm but different key formatting
than sodium/nacl keys.

bittorrent's
[dht_store (bep44)](http://libtorrent.org/dht_store.html) extension uses
supercop keys.

# see also

For a pure javascript emscripten implementation, see:

* [supercop.js](https://github.com/1p6/supercop.js)

# methods

``` js
var ed = require('ed25519-supercop')
```

## var seed = ed.createSeed()

Generate `seed`, a 32-byte buffer of cryptographically secure random data.

## var keypair = ed.createKeyPair(seed)

Generate `keypair` from a 32-byte `seed` buffer.

* `keypair.publicKey` - public key data (32 byte buffer)
* `keypair.secretKey` - secret/private key data (64 byte buffer)

## var signature = ed.sign(message, publicKey, secretKey)

Generate a 64-byte `signature` given:

* `message` (string or buffer)
* `publicKey` (32-byte buffer or hex string)
* `secretKey` (64-byte buffer or hex string)

## var ok = ed.verify(signature, message, publicKey)

Return a boolean `ok`, true if the 64-byte buffer or hex string `signature`
signs a buffer or string `message` with the 32-byte or hex string `publicKey`.

# install

```
npm install ed25519-supercop
```

# license

MIT
