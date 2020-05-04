'use strict';

const path = require('path');

const assert = require('assertthat'),
    nock = require('nock'),
    request = require('supertest'),
    requireAll = require('require-all');

const Endpoint = require('../../lib/Endpoint'),
    fixPredecessor = require('../../lib/routes/fixPredecessor');

const mocks = requireAll(path.join(__dirname, 'mocks'));

suite('fixPredecessor', () => {
  test('is a function.', done => {
    assert.that(fixPredecessor).is.ofType('function');
    done();
  });

  test('throws an error if peer is missing.', done => {
    assert.that(() => {
      fixPredecessor();
    }).is.throwing('Peer is missing.');
    done();
  });

  suite('route', () => {
    let peer;

    setup(() => {
      peer = new mocks.JoinedPeer({
        host: 'localhost',
        port: 3000
      });
    });

    test('is a function.', done => {
      assert.that(fixPredecessor(peer)).is.ofType('function');
      done();
    });

    test('returns 200 if there is no predecessor.', done => {
      peer = new mocks.UnbalancedPeerWithoutPredecessor({
        host: 'localhost',
        port: 3000
      });

      request(peer.app).
        post('/fix-predecessor').
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          done();
        });
    });

    test('does not change the predecessor if the predecessor is reachable.', done => {
      const remotePeerSelf = nock('https://localhost:2000').post('/self').reply(200, new Endpoint({
        host: 'localhost',
        port: 2000
      }));

      request(peer.app).
        post('/fix-predecessor').
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(peer.predecessor).is.equalTo({
            host: 'localhost',
            port: 2000,
            id: '07f28618c6541e6949f387bbcfdfcbad854b6016'
          });
          assert.that(remotePeerSelf.isDone()).is.true();
          done();
        });
    });

    test('removes the predecessor if the predecessor is not reachable.', done => {
      request(peer.app).
        post('/fix-predecessor').
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(peer.predecessor).is.undefined();
          done();
        });
    });
  });
});
