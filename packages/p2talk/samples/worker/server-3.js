'use strict';

const server = require('./serverBase');

server.run({
  http: {
    port: 5000
  },
  p2p: {
    port: 5001,
    portJoin: 3001
  },
  serviceInterval: '1s'
});
