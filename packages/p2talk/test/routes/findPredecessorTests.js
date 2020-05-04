'use strict';

const path = require('path');

const assert = require('assertthat'),
    nock = require('nock'),
    request = require('supertest'),
    requireAll = require('require-all');

const findPredecessor = require('../../lib/routes/findPredecessor');

const mocks = requireAll(path.join(__dirname, 'mocks'));

suite('findPredecessor', () => {
  test('is a function.', done => {
    assert.that(findPredecessor).is.ofType('function');
    done();
  });

  test('throws an error if peer is missing.', done => {
    assert.that(() => {
      findPredecessor();
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
      assert.that(findPredecessor(peer)).is.ofType('function');
      done();
    });

    test('returns 400 if options are missing.', done => {
      request(peer.app).
        post('/find-predecessor').
        set('content-type', 'application/json').
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(400);
          done();
        });
    });

    test('returns 400 if id is missing.', done => {
      request(peer.app).
        post('/find-predecessor').
        set('content-type', 'application/json').
        send({}).
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(400);
          done();
        });
    });

    test('returns 500 if getting the successor fails.', done => {
      // - 2000: 07f28618c6541e6949f387bbcfdfcbad854b6016
      // - 3000: 12a30e3632a51fdab4fedd07bcc219b433e17343
      // - 4000: dc4f424bb575238275aac70b0324ca3a77d5b3dd
      //
      // - ID: f424bb575238275aac70b0324ca3a77d5b3dddc4

      const remotePeerSuccessor = nock('https://localhost:3000').post('/successor').reply(500);

      request(peer.app).
        post('/find-predecessor').
        set('content-type', 'application/json').
        send({ id: 'f424bb575238275aac70b0324ca3a77d5b3dddc4' }).
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(500);
          assert.that(remotePeerSuccessor.isDone()).is.true();
          done();
        });
    });

    suite('returns the peer itself if the id', () => {
      test('is between the peer itself and its successor.', done => {
        // - 2000: 07f28618c6541e6949f387bbcfdfcbad854b6016
        // - 3000: 12a30e3632a51fdab4fedd07bcc219b433e17343
        // - 4000: dc4f424bb575238275aac70b0324ca3a77d5b3dd
        //
        // - ID: ac70b0324ca3a77d5b3dddc4f424bb575238275a

        const remotePeerSuccessor = nock('https://localhost:3000').post('/successor').reply(200, peer.successor);

        request(peer.app).
          post('/find-predecessor').
          set('content-type', 'application/json').
          send({ id: 'ac70b0324ca3a77d5b3dddc4f424bb575238275a' }).
          end((err, res) => {
            assert.that(err).is.null();
            assert.that(res.statusCode).is.equalTo(200);
            assert.that(res.body).is.equalTo({
              host: 'localhost',
              port: 3000,
              id: '12a30e3632a51fdab4fedd07bcc219b433e17343'
            });
            assert.that(remotePeerSuccessor.isDone()).is.true();
            done();
          });
      });

      test('matches the peer\'s successor.', done => {
        // - 2000: 07f28618c6541e6949f387bbcfdfcbad854b6016
        // - 3000: 12a30e3632a51fdab4fedd07bcc219b433e17343
        // - 4000: dc4f424bb575238275aac70b0324ca3a77d5b3dd
        //
        // - ID: ac70b0324ca3a77d5b3dddc4f424bb575238275a

        const remotePeerSuccessor = nock('https://localhost:3000').post('/successor').reply(200, peer.successor);

        request(peer.app).
          post('/find-predecessor').
          set('content-type', 'application/json').
          send({ id: 'dc4f424bb575238275aac70b0324ca3a77d5b3dd' }).
          end((err, res) => {
            assert.that(err).is.null();
            assert.that(res.statusCode).is.equalTo(200);
            assert.that(res.body).is.equalTo({
              host: 'localhost',
              port: 3000,
              id: '12a30e3632a51fdab4fedd07bcc219b433e17343'
            });
            assert.that(remotePeerSuccessor.isDone()).is.true();
            done();
          });
      });
    });

    test('does not return the peer itself if the id matches the peer.', done => {
      // - 2000: 07f28618c6541e6949f387bbcfdfcbad854b6016
      // - 3000: 12a30e3632a51fdab4fedd07bcc219b433e17343
      // - 4000: dc4f424bb575238275aac70b0324ca3a77d5b3dd
      //
      // - ID: ac70b0324ca3a77d5b3dddc4f424bb575238275a

      const remotePeerSuccessor = nock('https://localhost:3000').post('/successor').reply(200, peer.successor);

      request(peer.app).
        post('/find-predecessor').
        set('content-type', 'application/json').
        send({ id: '12a30e3632a51fdab4fedd07bcc219b433e17343' }).
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(500);
          assert.that(remotePeerSuccessor.isDone()).is.true();
          done();
        });
    });

    test('returns 500 if getting the closest preceding finger fails.', done => {
      // - 2000: 07f28618c6541e6949f387bbcfdfcbad854b6016
      // - 3000: 12a30e3632a51fdab4fedd07bcc219b433e17343
      // - 4000: dc4f424bb575238275aac70b0324ca3a77d5b3dd
      //
      // - ID: f424bb575238275aac70b0324ca3a77d5b3dddc4

      const remotePeerSuccessor = nock('https://localhost:3000').post('/successor').reply(200, peer.successor);
      const remotePeerClosestPrecedingFinger = nock('https://localhost:3000').post('/closest-preceding-finger', { id: 'f424bb575238275aac70b0324ca3a77d5b3dddc4' }).reply(500);

      request(peer.app).
        post('/find-predecessor').
        set('content-type', 'application/json').
        send({ id: 'f424bb575238275aac70b0324ca3a77d5b3dddc4' }).
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(500);
          assert.that(remotePeerSuccessor.isDone()).is.true();
          assert.that(remotePeerClosestPrecedingFinger.isDone()).is.true();
          done();
        });
    });

    test('finds the predecessor recursively.', done => {
      // - 2000: 07f28618c6541e6949f387bbcfdfcbad854b6016
      // - 3000: 12a30e3632a51fdab4fedd07bcc219b433e17343
      // - 4000: dc4f424bb575238275aac70b0324ca3a77d5b3dd
      //
      // - ID: f424bb575238275aac70b0324ca3a77d5b3dddc4

      const remotePeerSuccessor = nock('https://localhost:3000').post('/successor').reply(200, peer.successor);
      const remotePeerClosestPrecedingFinger = nock('https://localhost:3000').post('/closest-preceding-finger', { id: 'f424bb575238275aac70b0324ca3a77d5b3dddc4' }).reply(200, peer.successor);
      const remotePeerSuccessorRecursive = nock('https://localhost:4000').post('/successor').reply(200, peer.predecessor);

      request(peer.app).
        post('/find-predecessor').
        set('content-type', 'application/json').
        send({ id: 'f424bb575238275aac70b0324ca3a77d5b3dddc4' }).
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(res.body).is.equalTo({
            host: 'localhost',
            port: 4000,
            id: 'dc4f424bb575238275aac70b0324ca3a77d5b3dd'
          });
          assert.that(remotePeerSuccessor.isDone()).is.true();
          assert.that(remotePeerClosestPrecedingFinger.isDone()).is.true();
          assert.that(remotePeerSuccessorRecursive.isDone()).is.true();
          done();
        });
    });
  });
});
