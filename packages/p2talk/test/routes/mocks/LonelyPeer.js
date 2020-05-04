'use strict';

const util = require('util');

const Peer = require('../../../lib/Peer');

const LonelyPeer = function (options) {
  Peer.call(this, options);
};

util.inherits(LonelyPeer, Peer);

module.exports = LonelyPeer;
