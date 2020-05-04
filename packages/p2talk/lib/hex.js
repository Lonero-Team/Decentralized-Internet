'use strict';

const hex = {};

// The following line can be removed when ES7 is available.
require('string.prototype.padleft').shim();

hex.add = function (left, right) {
  if (left.length < right.length) {
    left = left.padLeft(right.length, '0');
  } else if (right.length < left.length) {
    right = right.padLeft(left.length, '0');
  }

  let carry = 0,
      sum = '';

  for (let i = left.length - 1; i >= 0; i--) {
    const digit = parseInt(left[i], 16) + parseInt(right[i], 16) + carry;

    carry = digit >> 4;
    sum = (digit & 15).toString(16) + sum;
  }

  return sum;
};

hex.pow2x = function (exponent) {
  const moduloExponent = exponent % 4,
      overflow = Math.floor(exponent / 4);

  const power = Math.pow(2, moduloExponent) + '0'.repeat(overflow);

  return power;
};

module.exports = hex;
