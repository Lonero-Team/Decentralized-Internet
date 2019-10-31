'use strict';

function safeParseInt(nStr) {
  var n = parseInt(nStr);
  if (!Number.isSafeInteger(n)) {
    throw Error('Value ' + JSON.stringify(nStr) + ' is not an integer in the valid range');
  }
  if (String(n) !== String(nStr)) {
    throw Error('Value ' + JSON.stringify(nStr) + ' is not a canonical integer string representation');
  }
  return n;
}

module.exports = { safeParseInt: safeParseInt };