'use strict';

const fibonacci = function (iterations) {
  const result = [ 1, 1 ];

  for (let i = 2; i < (iterations + 2); i++) {
    result[i] = result[i - 1] + result[i - 2];
  }

  return result.slice(2);
};

module.exports = fibonacci;
