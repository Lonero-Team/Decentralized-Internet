'use strict';

const Endpoint = require('../Endpoint');

const fixSuccessors = function (peer) {
  if (!peer) {
    throw new Error('Peer is missing.');
  }

  return (req, res) => {
    peer.remote(peer.successor).run('successors', (err, successors) => {
      if (err) {
        peer.fixSuccessor();
        return res.sendStatus(500);
      }

      successors.unshift(new Endpoint(peer.successor));
      peer.successors = successors;

      res.sendStatus(200);
    });
  };
};

module.exports = fixSuccessors;
