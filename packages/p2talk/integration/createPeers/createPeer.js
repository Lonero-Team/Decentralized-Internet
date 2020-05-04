'use strict';

const freeport = require('freeport');

const Peer = require('./Peer');

const createPeer = function (options, callback) {
  freeport((errFreeport, port) => {
    if (errFreeport) {
      return callback(errFreeport);
    }

    const peer = new Peer({
      port,
      serviceInterval: options.serviceInterval
    });

    peer.start(errStart => {
      if (errStart) {
        return callback(errStart);
      }
      callback(null, peer);
    });
  });
};

module.exports = createPeer;
