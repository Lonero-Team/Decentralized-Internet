'use strict';

const defekt = require('defekt');

const errors = defekt([
  'InvalidOperation',
  'UnexpectedStatusCode'
]);

module.exports = errors;
