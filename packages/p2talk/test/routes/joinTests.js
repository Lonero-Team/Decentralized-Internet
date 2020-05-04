'use strict';

const path = require('path');

const assert = require('assertthat'),
    nock = require('nock'),
    request = require('supertest'),
    requireAll = require('require-all');

const join = require('../../lib/routes/join');

const mocks = requireAll(path.join(__dirname, 'mocks'));

suite('join', () => {
  test('is a function.', done => {
    assert.that(join).is.ofType('function');
    done();
  });

  test('throws an error if peer is missing.', done => {
    assert.that(() => {
      join();
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
      assert.that(join(peer)).is.ofType('function');
      done();
    });

    test('returns 400 if options are missing.', done => {
      request(peer.app).
        post('/join').
        set('content-type', 'application/json').
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(400);
          done();
        });
    });

    test('returns 400 if host is missing.', done => {
      request(peer.app).
        post('/join').
        set('content-type', 'application/json').
        send({ port: 4000 }).
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(400);
          done();
        });
    });

    test('returns 400 if port is missing.', done => {
      request(peer.app).
        post('/join').
        set('content-type', 'application/json').
        send({ host: 'localhost' }).
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(400);
          done();
        });
    });

    test('does nothing if the peer is told to join itself.', done => {
      const findSuccessor = nock('https://localhost:3000').post('/find-successor').reply(500);

      request(peer.app).
        post('/join').
        set('content-type', 'application/json').
        send({ host: 'localhost', port: 3000 }).
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(findSuccessor.isDone()).is.false();
          nock.cleanAll();
          done();
        });
    });

    test('does nothing if the peer is unbalanced.', done => {
      const findSuccessor = nock('https://localhost:3000').post('/find-successor').reply(500);

      peer = new mocks.UnbalancedPeerWithoutPredecessor({
        host: 'localhost',
        port: 3000
      });

      request(peer.app).
        post('/join').
        set('content-type', 'application/json').
        send({ host: 'localhost', port: 3000 }).
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(findSuccessor.isDone()).is.false();
          nock.cleanAll();
          done();
        });
    });

    test('does nothing if the peer is joined.', done => {
      const findSuccessor = nock('https://localhost:3000').post('/find-successor').reply(500);

      peer = new mocks.JoinedPeer({
        host: 'localhost',
        port: 3000
      });

      request(peer.app).
        post('/join').
        set('content-type', 'application/json').
        send({ host: 'localhost', port: 3000 }).
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(findSuccessor.isDone()).is.false();
          nock.cleanAll();
          done();
        });
    });

    test('asks the remote peer for the local peer\'s successor.', done => {
      const remotePeer = new mocks.LonelyPeer({ host: 'localhost', port: 4000 });
      const remotePeerFindSuccessor = nock('https://localhost:4000').post('/find-successor').reply(200, remotePeer.self);

      request(peer.app).
        post('/join').
        set('content-type', 'application/json').
        send({ host: 'localhost', port: 4000 }).
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(remotePeerFindSuccessor.isDone()).is.true();
          done();
        });
    });

    test('returns 500 if the remote peer can not be reached.', done => {
      const remotePeerFindSuccessor = nock('https://localhost:4000').post('/find-successor').reply(500);

      request(peer.app).
        post('/join').
        set('content-type', 'application/json').
        send({ host: 'localhost', port: 4000 }).
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(500);
          assert.that(remotePeerFindSuccessor.isDone()).is.true();
          done();
        });
    });

    test('sets the successor to the successor returned by the remote peer.', done => {
      const remotePeer = new mocks.LonelyPeer({ host: 'localhost', port: 4000 });
      const remotePeerFindSuccessor = nock('https://localhost:4000').post('/find-successor').reply(200, remotePeer.self);

      request(peer.app).
        post('/join').
        set('content-type', 'application/json').
        send({ host: 'localhost', port: 4000 }).
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(remotePeerFindSuccessor.isDone()).is.true();
          assert.that(peer.successor).is.equalTo(remotePeer.self);
          done();
        });
    });

    test('sets the predecessor to undefined.', done => {
      const remotePeer = new mocks.LonelyPeer({ host: 'localhost', port: 4000 });
      const remotePeerFindSuccessor = nock('https://localhost:4000').post('/find-successor').reply(200, remotePeer.self);

      request(peer.app).
        post('/join').
        set('content-type', 'application/json').
        send({ host: 'localhost', port: 4000 }).
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(remotePeerFindSuccessor.isDone()).is.true();
          assert.that(peer.predecessor).is.undefined();
          done();
        });
    });
  });
});
