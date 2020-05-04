'use strict';

const interval = require('../interval');

const stabilize = function (peer) {
  if (!peer) {
    throw new Error('Peer is missing.');
  }

  return (req, res) => {
    peer.remote(peer.successor).run('predecessor', (err, predecessor) => {
      if (err) {
        peer.fixSuccessor();
        return res.sendStatus(500);
      }

      if (
        (predecessor) &&
        (interval({ left: peer.self.id, right: peer.successor.id, type: 'open' }).contains(predecessor.id))
      ) {
        peer.setSuccessor({
          host: predecessor.host,
          port: predecessor.port
        });
      }

      peer.remote(peer.successor).run('notify', peer.self, errNotify => {
        if (errNotify) {
          peer.fixSuccessor();
          return res.sendStatus(500);
        }

        res.sendStatus(200);
      });
    });
  };
};

module.exports = stabilize;
