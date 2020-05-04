'use strict';

const successor = function (peer) {
  if (!peer) {
    throw new Error('Peer is missing.');
  }

  return (req, res) => {
    res.send(peer.successor);
  };
};

module.exports = successor;
