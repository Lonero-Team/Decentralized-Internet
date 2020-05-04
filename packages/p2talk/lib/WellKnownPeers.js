'use strict';

const _ = require('lodash');

const WellKnownPeers = function () {
  this.peers = [];
};

WellKnownPeers.prototype.get = function () {
  return _.cloneDeep(this.peers);
};

WellKnownPeers.prototype.add = function (newPeers) {
  newPeers = _.flatten([ newPeers ]);

  for (let i = 0; i < newPeers.length; i++) {
    const newPeer = newPeers[i];

    if (!_.find(this.peers, newPeer)) {
      this.peers.push({ host: newPeer.host, port: newPeer.port });
    }
  }
};

module.exports = WellKnownPeers;
