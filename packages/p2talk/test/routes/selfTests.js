'use strict';

const path = require('path');

const assert = require('assertthat'),
    request = require('supertest'),
    requireAll = require('require-all');

const self = require('../../lib/routes/self');

const mocks = requireAll(path.join(__dirname, 'mocks'));

suite('self', () => {
  test('is a function.', done => {
    assert.that(self).is.ofType('function');
    done();
  });

  test('throws an error if peer is missing.', done => {
    assert.that(function () {
      self();
    }).is.throwing('Peer is missing.');
    done();
  });

  suite('route', function () {
    let peer;

    setup(() => {
      peer = new mocks.LonelyPeer({
        host: 'localhost',
        port: 3000
      });
    });

    test('is a function.', done => {
      assert.that(self(peer)).is.ofType('function');
      done();
    });

    test('returns self.', done => {
      request(peer.app).
        post('/self').
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(res.body).is.equalTo({
            host: 'localhost',
            port: 3000,
            id: '12a30e3632a51fdab4fedd07bcc219b433e17343'
          });
          done();
        });
    });
  });
});
