'use strict';

const path = require('path');

const assert = require('assertthat'),
    request = require('supertest'),
    requireAll = require('require-all');

const predecessor = require('../../lib/routes/predecessor');

const mocks = requireAll(path.join(__dirname, 'mocks'));

suite('predecessor', () => {
  test('is a function.', done => {
    assert.that(predecessor).is.ofType('function');
    done();
  });

  test('throws an error if peer is missing.', done => {
    assert.that(() => {
      predecessor();
    }).is.throwing('Peer is missing.');
    done();
  });

  suite('route', function () {
    let peer;

    setup(() => {
      peer = new mocks.JoinedPeer({
        host: 'localhost',
        port: 3000
      });
    });

    test('is a function.', done => {
      assert.that(predecessor(peer)).is.ofType('function');
      done();
    });

    test('returns predecessor.', done => {
      request(peer.app).
        post('/predecessor').
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(res.body).is.equalTo({
            host: 'localhost',
            port: 2000,
            id: '07f28618c6541e6949f387bbcfdfcbad854b6016'
          });
          done();
        });
    });

    test('returns an empty object if peer is unbalanced.', done => {
      peer = new mocks.UnbalancedPeerWithoutPredecessor({
        host: 'localhost',
        port: 3000
      });

      request(peer.app).
        post('/predecessor').
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(res.body).is.equalTo({});
          done();
        });
    });
  });
});
