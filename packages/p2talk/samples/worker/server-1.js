'use strict';

const server = require('./serverBase');

server.run({
  http: {
    port: 3000
  },
  p2p: {
    port: 3001,
    portJoin: 4001
  },
  serviceInterval: '1s'
});
