'use strict';

const path = require('path');

const assert = require('assertthat'),
    nock = require('nock'),
    request = require('supertest'),
    requireAll = require('require-all');

const Endpoint = require('../../lib/Endpoint'),
    stabilize = require('../../lib/routes/stabilize');

const mocks = requireAll(path.join(__dirname, 'mocks'));

suite('stabilize', () => {
  test('is a function.', done => {
    assert.that(stabilize).is.ofType('function');
    done();
  });

  test('throws an error if peer is missing.', done => {
    assert.that(function () {
      stabilize();
    }).is.throwing('Peer is missing.');
    done();
  });

  suite('route', function () {
    let peer;

    setup(function () {
      peer = new mocks.JoinedPeer({
        host: 'localhost',
        port: 3000
      });
    });

    test('is a function.', done => {
      assert.that(stabilize(peer)).is.ofType('function');
      done();
    });

    test('fixes the successor if the successor is not reachable.', done => {
      let fixSuccessorCalled = false;

      peer.fixSuccessor = () => {
        fixSuccessorCalled = true;
      };

      request(peer.app).
        post('/stabilize').
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(500);
          assert.that(fixSuccessorCalled).is.true();
          done();
        });
    });

    suite('asks the successor about the successor\'s predecessor and', () => {
      suite('does not update its successor if the successor', () => {
        test('does not have a predecessor.', done => {
          const remotePeerPredecessor = nock('https://localhost:4000').post('/predecessor').reply(200);
          const remotePeerNotify = nock('https://localhost:4000').post('/notify').reply(200);

          request(peer.app).
            post('/stabilize').
            end((err, res) => {
              assert.that(err).is.null();
              assert.that(res.statusCode).is.equalTo(200);
              assert.that(peer.successor).is.equalTo({
                host: 'localhost',
                port: 4000,
                id: 'dc4f424bb575238275aac70b0324ca3a77d5b3dd'
              });
              assert.that(remotePeerPredecessor.isDone()).is.true();
              assert.that(remotePeerNotify.isDone()).is.true();
              done();
            });
        });

        test('returns the peer itself.', done => {
          const remotePeerPredecessor = nock('https://localhost:4000').post('/predecessor').reply(200, peer.self);
          const remotePeerNotify = nock('https://localhost:4000').post('/notify').reply(200);

          request(peer.app).
            post('/stabilize').
            end((err, res) => {
              assert.that(err).is.null();
              assert.that(res.statusCode).is.equalTo(200);
              assert.that(peer.successor).is.equalTo({
                host: 'localhost',
                port: 4000,
                id: 'dc4f424bb575238275aac70b0324ca3a77d5b3dd'
              });
              assert.that(remotePeerPredecessor.isDone()).is.true();
              assert.that(remotePeerNotify.isDone()).is.true();
              done();
            });
        });

        test('returns the successor itself.', done => {
          const remotePeerPredecessor = nock('https://localhost:4000').post('/predecessor').reply(200, peer.successor.self);
          const remotePeerNotify = nock('https://localhost:4000').post('/notify').reply(200);

          request(peer.app).
            post('/stabilize').
            end((err, res) => {
              assert.that(err).is.null();
              assert.that(res.statusCode).is.equalTo(200);
              assert.that(peer.successor).is.equalTo({
                host: 'localhost',
                port: 4000,
                id: 'dc4f424bb575238275aac70b0324ca3a77d5b3dd'
              });
              assert.that(remotePeerPredecessor.isDone()).is.true();
              assert.that(remotePeerNotify.isDone()).is.true();
              done();
            });
        });

        test('returns a peer between the successor and the peer.', done => {
          const remotePeerPredecessor = nock('https://localhost:4000').post('/predecessor').reply(200, new Endpoint({
            host: 'localhost',
            port: 2000
          }));
          const remotePeerNotify = nock('https://localhost:4000').post('/notify').reply(200);

          request(peer.app).
            post('/stabilize').
            end((err, res) => {
              assert.that(err).is.null();
              assert.that(res.statusCode).is.equalTo(200);
              assert.that(peer.successor).is.equalTo({
                host: 'localhost',
                port: 4000,
                id: 'dc4f424bb575238275aac70b0324ca3a77d5b3dd'
              });
              assert.that(remotePeerPredecessor.isDone()).is.true();
              assert.that(remotePeerNotify.isDone()).is.true();
              done();
            });
        });
      });

      suite('updates its successor if the successor', () => {
        test('returns a peer between the peer itself and the successor.', done => {
          const remotePeerPredecessor = nock('https://localhost:2000').post('/predecessor').reply(200, new Endpoint({
            host: 'localhost',
            port: 4000
          }));
          const remotePeerNotify = nock('https://localhost:4000').post('/notify').reply(200);

          peer.successor = new Endpoint({
            host: 'localhost',
            port: 2000
          });

          request(peer.app).
            post('/stabilize').
            end((err, res) => {
              assert.that(err).is.null();
              assert.that(res.statusCode).is.equalTo(200);
              assert.that(peer.successor).is.equalTo({
                host: 'localhost',
                port: 4000,
                id: 'dc4f424bb575238275aac70b0324ca3a77d5b3dd'
              });
              assert.that(remotePeerPredecessor.isDone()).is.true();
              assert.that(remotePeerNotify.isDone()).is.true();
              done();
            });
        });
      });
    });

    test('notifies its successor about itself as potential predecessor.', done => {
      const remotePeerPredecessor = nock('https://localhost:4000').post('/predecessor').reply(200);
      const remotePeerNotify = nock('https://localhost:4000').post('/notify', peer.successor.self).reply(200);

      request(peer.app).
        post('/stabilize').
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(remotePeerPredecessor.isDone()).is.true();
          assert.that(remotePeerNotify.isDone()).is.true();
          done();
        });
    });

    test('fixes successor if notifying the successor fails.', done => {
      const remotePeerPredecessor = nock('https://localhost:4000').post('/predecessor').reply(200);
      let fixSuccessorCalled = false;

      peer.fixSuccessor = () => {
        fixSuccessorCalled = true;
      };

      request(peer.app).
        post('/stabilize').
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(500);
          assert.that(fixSuccessorCalled).is.true();
          assert.that(remotePeerPredecessor.isDone()).is.true();
          done();
        });
    });
  });
});
