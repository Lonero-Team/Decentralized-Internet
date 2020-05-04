'use strict';

const self = function (peer) {
  if (!peer) {
    throw new Error('Peer is missing.');
  }

  return (req, res) => {
    res.send(peer.self);
  };
};

module.exports = self;
