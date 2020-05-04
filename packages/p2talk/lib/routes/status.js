'use strict';

const status = function (peer) {
  if (!peer) {
    throw new Error('Peer is missing.');
  }

  return (req, res) => {
    res.send({
      status: peer.status()
    });
  };
};

module.exports = status;
