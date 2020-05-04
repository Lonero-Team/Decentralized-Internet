'use strict';

const async = require('async'),
    flaschenpost = require('flaschenpost');

const logger = flaschenpost.getLogger();

const formRing = function (peers, callback) {
  logger.info('Forming ring...');
  async.each(peers, (peer, done) => {
    peer.join(peers[0], done);
  }, callback);
};

module.exports = formRing;
