# protocol-buffers-encodings

Base encodings for [protocol-buffers](https://github.com/mafintosh/protocol-buffers).

```
npm install protocol-buffers-encodings
```

[![build status](https://travis-ci.org/mafintosh/protocol-buffers-encodings.svg?branch=master)](https://travis-ci.org/mafintosh/protocol-buffers-encodings)

Moved into it's own module for lighter installs

## Usage

``` js
var encodings = require('protocol-buffers-encodings')
var buf = Buffer.alloc(4096)

encodings.string('hi', buf, 0)
console.log(encodings.string(buf, 0)) // prints 'hi'
```

## API

In general all encoders follow this API

#### `buffer = enc.encode(value, buffer, offset)`

Encode a value. `buffer` should be a buffer big enough to fit the value, `offset` should be the byte offset in the buffer where you want to write it.
The buffer is returned for conveinience.

After a value has been encoded `enc.encode.bytes` contains the amount of bytes used in the buffer.

#### `value = enc.decode(buffer, offset)`

Decode a value. `buffer` shoudl be an encoded value and `offset` should be the byte offset where you want to start decoding.

After a value has been decoded `enc.decode.bytes` contains the amount of bytes that was consumed from the buffer.

#### `var len = enc.encodingLength(value)`

Use this method to calculate how much space is needed to encode a value.

#### `enc.type`

A number indicating the protobuf wire type for the encoding

## Encodings

The following encodings are available

* `encodings.bytes` - encode a buffer
* `encodings.string` - encode a string
* `encodings.bool` - encode a boolean
* `encodings.uint64` - encode a uint64 to varint
* `encodings.uint32` - encode a uint32 to varint
* `encodings.sint64` - encode a signed int64 to a signed varint
* `encodings.sint32` - encode a signed int32 to a signed varint
* `encodings.int64` - encode a signed int64 to a varint
* `encodings.int32` - encode a signed int32 to a varint
* `encodings.fixed32` - encode a uint32 to a fixed 4 byte buffer
* `encodings.sfixed32` - encode a signed int32 to a fixed 4 byte buffer
* `encodings.fixed64` - encode a uint64 (represented as a buffer) to a fixed 8 byte buffer
* `encodings.sfixed64` - encode a signed int64 (represented as a buffer) to a fixed 8 byte buffer
* `encodings.double` - encode a double
* `encodings.float` - encode a float
* `encodings.enum` - encode a numeric enum as a varint

## License

MIT
