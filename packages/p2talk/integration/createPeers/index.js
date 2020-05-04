'use strict';

const path = require('path');

const async = require('async'),
    flaschenpost = require('flaschenpost'),
    requireAll = require('require-all');

const createPeer = require('./createPeer');

const env = requireAll(path.join(__dirname, 'env')),
    logger = flaschenpost.getLogger();

const createPeers = function (options, callback) {
  logger.info('Creating peers...', { count: options.count });
  async.timesSeries(options.count, (n, next) => {
    createPeer(options, next);
  }, (err, peers) => {
    if (err) {
      return callback(err);
    }
    callback(null, peers, env);
  });
};

module.exports = createPeers;
