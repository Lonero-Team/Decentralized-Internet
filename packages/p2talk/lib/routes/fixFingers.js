'use strict';

const random = require('random-int');

const Endpoint = require('../Endpoint'),
    hex = require('../hex');

const fixFingers = function (peer) {
  if (!peer) {
    throw new Error('Peer is missing.');
  }

  return (req, res) => {
    const i = random(2, 160),
        id = hex.add(peer.self.id, hex.pow2x(i - 1));

    peer.remote(peer.self).run('find-successor', { id }, (err, successor) => {
      if (err) {
        return res.sendStatus(500);
      }

      peer.fingers[i] = new Endpoint({
        host: successor.host,
        port: successor.port
      });

      res.sendStatus(200);
    });
  };
};

module.exports = fixFingers;
