'use strict'

// changed reduce: default value, auto sum
exports.size = function (items, iter, acc) {
  if (acc === undefined) acc = 0
  for (let i = 0; i < items.length; ++i) acc += iter(items[i], i, acc)
  return acc
}

exports.isAbstractCodec = function (codec) {
  return (codec &&
    typeof codec.encode === 'function' &&
    typeof codec.decode === 'function' &&
    typeof codec.encodingLength === 'function')
}
