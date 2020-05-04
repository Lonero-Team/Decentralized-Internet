'use strict';

const metadata = function (peer) {
  if (!peer) {
    throw new Error('Peer is missing.');
  }

  return (req, res) => {
    res.send(peer.metadata);
  };
};

module.exports = metadata;
