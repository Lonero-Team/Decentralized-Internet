'use strict';

const path = require('path');

const assert = require('assertthat'),
    request = require('supertest'),
    requireAll = require('require-all');

const handle = require('../../lib/routes/handle');

const mocks = requireAll(path.join(__dirname, 'mocks'));

suite('handle', () => {
  test('is a function.', done => {
    assert.that(handle).is.ofType('function');
    done();
  });

  test('throws an error if peer is missing.', done => {
    assert.that(() => {
      handle();
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
      assert.that(handle(peer)).is.ofType('function');
      done();
    });

    test('returns 404 if there is no action handler.', done => {
      request(peer.app).
        post('/handle/non-existent').
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(404);
          done();
        });
    });

    test('calls the registered action handler.', done => {
      let wasActionHandlerCalled = false;

      peer.handle.foo = (payload, callback) => {
        wasActionHandlerCalled = true;
        callback(null);
      };

      request(peer.app).
        post('/handle/foo').
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(wasActionHandlerCalled).is.true();
          done();
        });
    });

    test('hands over the body of the request to the action handler.', done => {
      peer.handle.foo = (payload, callback) => {
        assert.that(payload).is.equalTo({ foo: 'bar' });
        callback(null);
      };

      request(peer.app).
        post('/handle/foo').
        set('content-type', 'application/json').
        send({ foo: 'bar' }).
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          done();
        });
    });

    test('hands over an empty object if no request body is given.', done => {
      peer.handle.foo = (payload, callback) => {
        assert.that(payload).is.equalTo({});
        callback(null);
      };

      request(peer.app).
        post('/handle/foo').
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          done();
        });
    });

    test('returns 200 if the action handler does not return an error.', done => {
      peer.handle.foo = (payload, callback) => {
        callback(null);
      };

      request(peer.app).
        post('/handle/foo').
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          done();
        });
    });

    test('returns the result of the action handler.', done => {
      peer.handle.foo = (payload, callback) => {
        callback(null, { foo: 'bar' });
      };

      request(peer.app).
        post('/handle/foo').
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(res.body).is.equalTo({ foo: 'bar' });
          done();
        });
    });

    test('returns 500 if the action handler returns an error.', done => {
      peer.handle.foo = (payload, callback) => {
        callback(new Error('foobar'));
      };

      request(peer.app).
        post('/handle/foo').
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(500);
          done();
        });
    });
  });
});
