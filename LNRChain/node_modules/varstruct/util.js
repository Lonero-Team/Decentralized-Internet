'use strict'

// should be faster + work with undefined values
exports.reduce = function (items, iter, acc) {
  for (var i = 0; i < items.length; ++i) acc = iter(acc, items[i], i, items)
  return acc
}

exports.isAbstractCodec = function (codec) {
  return (codec &&
    typeof codec.encode === 'function' &&
    typeof codec.decode === 'function' &&
    typeof codec.encodingLength === 'function')
}
