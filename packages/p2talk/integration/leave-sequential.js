'use strict';

const _ = require('lodash'),
    assert = require('assertthat'),
    async = require('async'),
    parse = require('parse-duration');

const createPeers = require('./createPeers'),
    runTest = require('./runTest');

runTest(__filename, configuration => {
  return done => {
    createPeers({ count: configuration.ringSize, serviceInterval: configuration.serviceInterval }, (err, peers, env) => {
      const peersJoined = _.clone(peers);

      assert.that(err).is.null();
      async.series([
        callback => {
          env.waitUntil(peers, { interval: configuration.serviceInterval }).have('status').equalTo({ status: 'lonely' }, callback);
        },
        callback => {
          env.formRing(peers, callback);
        },
        callback => {
          env.waitUntil(peers, { interval: configuration.serviceInterval }).have('status').equalTo({ status: 'joined' }, callback);
        },
        callback => {
          env.isRing(peers, callback);
        },
        callback => {
          async.eachSeries(peers, (peer, callbackEachSeries) => {
            if (peersJoined.length < 3) {
              return callbackEachSeries(null);
            }
            _.remove(peersJoined, peer);
            async.series([
              callbackSeries => {
                peer.stop(callbackSeries);
              },
              callbackSeries => {
                setTimeout(callbackSeries, parse(configuration.serviceInterval) * 1.5);
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
          env.stop(peersJoined, callback);
        }
      ], done);
    });
  };
});
