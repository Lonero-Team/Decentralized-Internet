'use strict';

const successors = function (peer) {
  if (!peer) {
    throw new Error('Peer is missing.');
  }

  return (req, res) => {
    res.send(peer.successors.slice(0, 16));
  };
};

module.exports = successors;
