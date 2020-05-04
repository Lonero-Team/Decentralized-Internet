'use strict';

const _ = require('lodash'),
    async = require('async'),
    flaschenpost = require('flaschenpost');

const logger = flaschenpost.getLogger();

const isRing = function (peers, callback) {
  const peersWithNeighbours = [];

  const getPeerIndex = function (self) {
    if (!self) {
      return -1;
    }

    return _.findIndex(peersWithNeighbours, function (peerWithNeighbours) {
      return (
        peerWithNeighbours.self.host === self.host &&
        peerWithNeighbours.self.port === self.port
      );
    });
  };

  logger.info('Verifying ring...');

  async.eachSeries(peers, (peer, doneEach) => {
    async.series({
      self: done => {
        peer.self(done);
      },
      successor: done => {
        peer.successor(done);
      },
      predecessor: done => {
        peer.predecessor(done);
      }
    }, (err, peerWithNeighbours) => {
      if (err) {
        return doneEach(err);
      }
      peersWithNeighbours.push(peerWithNeighbours);
      doneEach(null);
    });
  }, err => {
    if (err) {
      return callback(err);
    }

    peersWithNeighbours.forEach(peerWithNeighbours => {
      peerWithNeighbours.successor = getPeerIndex(peerWithNeighbours.successor);
      peerWithNeighbours.predecessor = getPeerIndex(peerWithNeighbours.predecessor);
    });

    const predecessors = _.uniq(_.pluck(peersWithNeighbours, 'predecessor').sort(), true),
        successors = _.uniq(_.pluck(peersWithNeighbours, 'successor').sort(), true);

    if (predecessors[0] !== 0 || predecessors.length !== peers.length) {
      return callback(new Error('Predecessors are broken.'));
    }
    if (successors[0] !== 0 || successors.length !== peers.length) {
      return callback(new Error('Successors are broken.'));
    }

    callback(null);
  });
};

module.exports = isRing;
