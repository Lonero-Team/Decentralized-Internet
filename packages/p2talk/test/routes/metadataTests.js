'use strict';

const path = require('path');

const assert = require('assertthat'),
    request = require('supertest'),
    requireAll = require('require-all');

const metadata = require('../../lib/routes/metadata');

const mocks = requireAll(path.join(__dirname, 'mocks'));

suite('metadata', () => {
  test('is a function.', done => {
    assert.that(metadata).is.ofType('function');
    done();
  });

  test('throws an error if peer is missing.', done => {
    assert.that(() => {
      metadata();
    }).is.throwing('Peer is missing.');
    done();
  });

  suite('route', () => {
    let peer;

    setup(() => {
      peer = new mocks.LonelyPeer({
        host: 'localhost',
        port: 3000
      });
    });

    test('is a function.', done => {
      assert.that(metadata(peer)).is.ofType('function');
      done();
    });

    test('returns an empty object if no metadata are set.', done => {
      request(peer.app).
        post('/metadata').
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(res.body).is.equalTo({});
          done();
        });
    });

    test('returns metadata.', done => {
      peer.metadata = { foo: 'bar' };

      request(peer.app).
        post('/metadata').
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(res.body).is.equalTo({ foo: 'bar' });
          done();
        });
    });
  });
});
