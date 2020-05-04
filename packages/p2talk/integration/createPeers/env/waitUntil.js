'use strict';

const async = require('async'),
    cmp = require('comparejs'),
    flaschenpost = require('flaschenpost'),
    parse = require('parse-duration');

const logger = flaschenpost.getLogger();

const waitUntil = function (peers, options) {
  return {
    have: fn => {
      return {
        equalTo: (expected, callback) => {
          logger.info('Waiting for peers to fulfill predicate...', { expected });

          async.each(peers, (peer, doneEach) => {
            let actual;

            async.until(
              () => {
                return cmp.eq(actual, expected);
              },
              doneUntil => {
                peer[fn]((err, result) => {
                  if (err) {
                    return doneUntil(err);
                  }
                  actual = result;
                  setTimeout(() => {
                    doneUntil(null);
                  }, parse(options.interval));
                });
              },
              doneEach
            );
          }, callback);
        }
      };
    }
  };
};

module.exports = waitUntil;
