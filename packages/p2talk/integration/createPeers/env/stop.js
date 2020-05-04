'use strict';

const async = require('async'),
    flaschenpost = require('flaschenpost');

const logger = flaschenpost.getLogger();

const stop = function (peers, callback) {
  logger.info('Stopping peers...');
  async.each(peers, (peer, done) => {
    peer.stop(done);
  }, callback);
};

module.exports = stop;
