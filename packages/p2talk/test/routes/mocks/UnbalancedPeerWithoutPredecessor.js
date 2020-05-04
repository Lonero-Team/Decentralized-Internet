'use strict';

const util = require('util');

const Endpoint = require('../../../lib/Endpoint'),
    Peer = require('../../../lib/Peer');

const UnbalancedPeerWithoutPredecessor = function (options) {
  Peer.call(this, options);

  this.successor = new Endpoint({ host: options.host, port: options.port + 1000 });
  this.predecessor = undefined;
};

util.inherits(UnbalancedPeerWithoutPredecessor, Peer);

module.exports = UnbalancedPeerWithoutPredecessor;
