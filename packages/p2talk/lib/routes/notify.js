'use strict';

const Endpoint = require('../Endpoint'),
    interval = require('../interval');

const notify = function (peer) {
  if (!peer) {
    throw new Error('Peer is missing.');
  }

  return (req, res) => {
    const host = req.body.host,
        port = req.body.port;

    if (!host) {
      return res.sendStatus(400);
    }
    if (!port) {
      return res.sendStatus(400);
    }

    const possiblePredecessor = new Endpoint({ host, port });

    if (!peer.predecessor || interval({
      left: peer.predecessor.id,
      right: peer.self.id,
      type: 'open'
    }).contains(possiblePredecessor.id)) {
      peer.setPredecessor(possiblePredecessor);
    }

    res.sendStatus(200);
  };
};

module.exports = notify;
