'use strict';

const assert = require('assertthat'),
    async = require('async');

const createPeers = require('./createPeers'),
    runTest = require('./runTest');

runTest(__filename, configuration => {
  return done => {
    createPeers({ count: configuration.ringSize, serviceInterval: configuration.serviceInterval }, (err, peers, env) => {
      assert.that(err).is.null();
      async.series([
        function (callback) {
          env.waitUntil(peers, { interval: configuration.serviceInterval }).have('status').equalTo({ status: 'lonely' }, callback);
        },
        function (callback) {
          env.formRing(peers, callback);
        },
        function (callback) {
          env.waitUntil(peers, { interval: configuration.serviceInterval }).have('status').equalTo({ status: 'joined' }, callback);
        },
        function (callback) {
          env.isRing(peers, callback);
        },
        function (callback) {
          env.stop(peers, callback);
        }
      ], done);
    });
  };
});
