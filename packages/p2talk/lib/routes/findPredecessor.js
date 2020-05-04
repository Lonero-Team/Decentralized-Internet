'use strict';

const Endpoint = require('../Endpoint'),
    interval = require('../interval');

const findPredecessor = function (peer) {
  if (!peer) {
    throw new Error('Peer is missing.');
  }

  return (req, res) => {
    const id = req.body.id;

    if (!id) {
      return res.sendStatus(400);
    }

    let possiblePredecessor = new Endpoint(peer.self);

    const findPredecessorRecursive = () => {
      peer.remote(possiblePredecessor).run('successor', (err, successor) => {
        if (err) {
          return res.sendStatus(500);
        }

        if (interval({ left: possiblePredecessor.id, right: successor.id, type: 'leftopen' }).contains(id)) {
          return res.send(possiblePredecessor);
        }

        peer.remote(possiblePredecessor).run('closest-preceding-finger', { id }, (errClosestPrecedingFinger, closestPrecedingFinger) => {
          if (errClosestPrecedingFinger) {
            return res.sendStatus(500);
          }

          possiblePredecessor = new Endpoint(closestPrecedingFinger);
          findPredecessorRecursive();
        });
      });
    };

    findPredecessorRecursive();
  };
};

module.exports = findPredecessor;
