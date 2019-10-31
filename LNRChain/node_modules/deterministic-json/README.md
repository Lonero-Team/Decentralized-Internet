# deterministic-json

*Deterministic JSON parse/stringify, with support for Buffers*

When writing crypto code that needs deterministic JSON strings, usually you're working with a lot of binary data (signatures, ciphertext, public keys, etc.). So for convenience, this module both makes the output deterministic, and lets Buffers survive the stringification/parsing by converting to base64 strings.

## Usage

`npm install deterministic-json`

```js
let json = require('deterministic-json')

let string = json.stringify({ b: 0, c: 1, a: 2, key: Buffer.from('foo') })
// -> '{"a":2,"b":0,"c":1,"key":":base64:Zm9v"}'

let obj = json.parse(string)
// -> { a: 2, b: 0, c: 1, key: <Buffer 66 6f 6f> }
```
