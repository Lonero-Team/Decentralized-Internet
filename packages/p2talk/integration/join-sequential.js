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
        callback => {
          env.waitUntil(peers, { interval: configuration.serviceInterval }).have('status').equalTo({ status: 'lonely' }, callback);
        },
        callback => {
          const peersJoined = [];

          async.eachSeries(peers, (peer, callbackEachSeries) => {
            peersJoined.push(peer);
            if (peersJoined.length === 1) {
              return callbackEachSeries(null);
            }
            async.series([
              callbackSeries => {
                peer.join(peersJoined[0], callbackSeries);
              },
              callbackSeries => {
                env.waitUntil(peersJoined, { interval: configuration.serviceInterval }).have('status').equalTo({ status: 'joined' }, callbackSeries);
              },
              callbackSeries => {
                env.isRing(peersJoined, callbackSeries);
              }
            ], callbackEachSeries);
          }, callback);
        },
        callback => {
          env.stop(peers, callback);
        }
      ], done);
    });
  };
});
