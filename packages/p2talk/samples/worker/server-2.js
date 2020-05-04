'use strict';

const server = require('./serverBase');

server.run({
  http: {
    port: 4000
  },
  p2p: {
    port: 4001,
    portJoin: 3001
  },
  serviceInterval: '1s'
});
