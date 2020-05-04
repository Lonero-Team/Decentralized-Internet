'use strict';

const predecessor = function (peer) {
  if (!peer) {
    throw new Error('Peer is missing.');
  }

  return (req, res) => {
    res.send(peer.predecessor);
  };
};

module.exports = predecessor;
