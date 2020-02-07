'use strict';
var Path = require('path');

module.exports = {
  extends: Path.join(__dirname, 'index.js'),
  rules: {
    'no-var': 0,
    'prefer-arrow-callback': 0
  }
};
