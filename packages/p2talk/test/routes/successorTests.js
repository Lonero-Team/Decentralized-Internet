'use strict';

const path = require('path');

const assert = require('assertthat'),
    request = require('supertest'),
    requireAll = require('require-all');

const successor = require('../../lib/routes/successor');

const mocks = requireAll(path.join(__dirname, 'mocks'));

suite('successor', () => {
  test('is a function.', done => {
    assert.that(successor).is.ofType('function');
    done();
  });

  test('throws an error if peer is missing.', done => {
    assert.that(function () {
      successor();
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
      assert.that(successor(peer)).is.ofType('function');
      done();
    });

    test('returns successor.', done => {
      request(peer.app).
        post('/successor').
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(res.body).is.equalTo({
            host: 'localhost',
            port: 4000,
            id: 'dc4f424bb575238275aac70b0324ca3a77d5b3dd'
          });
          done();
        });
    });
  });
});
