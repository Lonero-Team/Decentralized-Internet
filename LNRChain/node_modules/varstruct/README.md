# varstruct

[![NPM Package](https://img.shields.io/npm/v/varstruct.svg?style=flat-square)](https://www.npmjs.org/package/varstruct)
[![Build Status](https://img.shields.io/travis/dominictarr/varstruct.svg?branch=master&style=flat-square)](https://travis-ci.org/dominictarr/varstruct)
[![Dependency status](https://img.shields.io/david/dominictarr/varstruct.svg?style=flat-square)](https://david-dm.org/dominictarr/varstruct#info=dependencies)

[![abstract-encoding](https://img.shields.io/badge/abstract--encoding-compliant-brightgreen.svg?style=flat-square)](https://github.com/mafintosh/abstract-encoding)

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

encode/decode variable binary structures.

This module makes creating binary formats easy. It supports both fixed length structures (like classic c structs), and variable (usually length delemited) structures.

## Example - a 3d vector

```js
var vstruct = require('varstruct')

//create a vector codec.
var vector = vstruct([
  { name: 'x', type: vstruct.DoubleBE },
  { name: 'y', type: vstruct.DoubleBE },
  { name: 'z', type: vstruct.DoubleBE }
])

// or shortcut
var vector = vstruct([
  ['x', vstruct.DoubleBE],
  ['y', vstruct.DoubleBE],
  ['z', vstruct.DoubleBE]
])

//encode a object to get a buffer
var buffer = vector.encode({
  x: 93.1, y: 87.3, z: 10.39
})

var v = vector.decode(buffer)
```

## Example - a message metadata + attachments

```js
var vstruct = require('varstruct')
var VarIntProtobuf = require('varint')

//codec for a sha256 hash
var SHA256 = vstruct.Buffer(32)

var message = vstruct([
  // the hash of the previous message
  { name: 'previous', type: SHA256 },

  // the hash of the author's public key
  { name: 'author', type: SHA256 },

  // an arbitary length buffer
  { name: 'message', type: vstruct.VarBuffer(VarIntProtobuf) },

  // hashes of related documents.
  { name: 'attachments', type: vstruct.VarArray(vstruct.Byte, SHA256) }
])
```

## API

varstruct uses [abstract-encoding](http://github.com/mafintosh/abstract-encoding) as interface and provides next types:
 * [Byte, Int8, UInt8, Int16, UInt16, Int32, UInt32, Int32, UInt64, Float, Double](#byte-int8-uint8-int16-uint16-int32-uint32-int32-uint64-float-double)
 * [Array](#arraylengtharray-itemcodec), [VarArray](#vararraylengthcodec-itemcodec) and [Sequence](#sequence-itemtype-itemtype--itemtype-)
 * [Buffer](#bufferlength) and [VarBuffer](#varbufferlengthcodec)
 * [String](#stringlength--encoding--utf-8) and [VarString](#varstringlengthcodec--encoding--utf-8)
 * [Bound](#bounditemcodec-checkvalue)

### varstruct([{ name: string, type: codec }])

Instead object you can use [String name, Codec type]

Create a codec with a fixed number of fields.
If any subcodec has a variable length, then the new codec will as well.

### Byte, Int8, UInt8, Int16, UInt16, Int32, UInt32, Int32, UInt64, Float, Double

If you want Big Endian, append `BE`, for examlpe `Int16BE` or add `LE` for Little Endian.

64 bit ints are actually only 53 bit ints, but they will still be written to 8 bytes. (based on [int53](https://github.com/dannycoates/int53))

### Array(lengthArray, itemCodec)

Create codec that encodes an array with *fixed* length.

### VarArray(lengthCodec, itemCodec)

Create a variable length codec that encodes an array of items. `itemCodec` may be any varstruct compatible codec, including a VarArray. As long as it can encode very element in the array, `lengthCodec` must encode an integer.

### Sequence([ itemType, itemType, ..., itemType ])

Create codec that encodes an array with *fixed* length and *various* types.

### Buffer(length)

Create a *fixed* length buffer codec.

### VarBuffer(lengthCodec)

Create a variable length buffer codec. This will first write out the length of the value buffer and then the value buffer itself. The `lengthCodec` may be variable length itself, but must encode an integer.

### String(length [, encoding = 'utf-8'])

Create a *fixed* length (in bytes) string codec.

### VarString(lengthCodec [, encoding = 'utf-8'])

Create a variable length string codec. This codec uses `VarBuffer` (buffer will be created from string with given `encoding`).

### Bound(itemCodec, checkValue)

Return a codec that will check value before encode and after decode. `checkValue` should throw error if value is wrong.

## License

MIT
