'use strict';

const interval = require('../interval');

const closestPrecedingFinger = function (peer) {
  if (!peer) {
    throw new Error('Peer is missing.');
  }

  return (req, res) => {
    const id = req.body.id;

    if (!id) {
      return res.sendStatus(400);
    }

    for (let i = 160; i >= 1; i--) {
      const finger = peer.fingers[i];

      if (!finger) {
        continue;
      }

      if (interval({ left: peer.self.id, right: id, type: 'open' }).contains(finger.id)) {
        return res.send(finger);
      }
    }

    res.send(peer.self);
  };
};

module.exports = closestPrecedingFinger;
