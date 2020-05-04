'use strict';

const tourism = require('tourism');

module.exports = tourism({
  analyse: {
    server: [ '**/*.js', '!node_modules/**/*.js', '!coverage/**/*.js' ],
    options: {
      server: {
        language: 'es2015'
      }
    }
  },
  test: {
    server: [ 'test/**/*Tests.js' ]
  },
  shell: {
    integration: [
      'docker build -t thenativeweb/p2p-test .',
      'mocha --async-only --bail --colors --recursive --reporter spec --ui tdd integration'
    ].join(' && ')
  }
});
