'use strict';

const path = require('path');

const assert = require('assertthat'),
    request = require('supertest'),
    requireAll = require('require-all');

const status = require('../../lib/routes/status');

const mocks = requireAll(path.join(__dirname, 'mocks'));

suite('status', () => {
  test('is a function.', done => {
    assert.that(status).is.ofType('function');
    done();
  });

  test('throws an error if peer is missing.', done => {
    assert.that(function () {
      status();
    }).is.throwing('Peer is missing.');
    done();
  });

  suite('route', function () {
    let peer;

    setup(function () {
      peer = new mocks.LonelyPeer({
        host: 'localhost',
        port: 3000
      });
    });

    test('is a function.', done => {
      assert.that(status(peer)).is.ofType('function');
      done();
    });

    test('returns status.', done => {
      request(peer.app).
        post('/status').
        end(function (err, res) {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(res.body).is.equalTo({
            status: 'lonely'
          });
          done();
        });
    });
  });
});
