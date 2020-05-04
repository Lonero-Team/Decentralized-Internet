'use strict';

const path = require('path');

const assert = require('assertthat'),
    nock = require('nock'),
    request = require('supertest'),
    requireAll = require('require-all');

const Endpoint = require('../../lib/Endpoint'),
    fingersFor3000 = require('./data/fingersFor3000.json'),
    fixFingers = require('../../lib/routes/fixFingers');

const mocks = requireAll(path.join(__dirname, 'mocks'));

suite('fixFingers', () => {
  test('is a function.', done => {
    assert.that(fixFingers).is.ofType('function');
    done();
  });

  test('throws an error if peer is missing.', done => {
    assert.that(() => {
      fixFingers();
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
      assert.that(fixFingers(peer)).is.ofType('function');
      done();
    });

    test('does not update the finger table if finding a new finger fails.', done => {
      const remotePeerFindSuccessor = nock('https://localhost:3000').post('/find-successor').reply(500);

      request(peer.app).
        post('/fix-fingers').
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(500);
          assert.that(peer.fingers.length).is.equalTo(0);
          assert.that(remotePeerFindSuccessor.isDone()).is.true();
          done();
        });
    });

    test('updates the finger table.', done => {
      let nthFinger;

      const remotePeerFindSuccessor = nock('https://localhost:3000').post('/find-successor').reply(function (uri, reqBody) {
        nthFinger = fingersFor3000.indexOf(JSON.parse(reqBody).id);
        return [ 200, new Endpoint({ host: 'localhost', port: 4000 }) ];
      });

      request(peer.app).
        post('/fix-fingers').
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(peer.fingers.length).is.equalTo(nthFinger + 1);
          assert.that(peer.fingers[nthFinger]).is.equalTo({
            host: 'localhost',
            port: 4000,
            id: 'dc4f424bb575238275aac70b0324ca3a77d5b3dd'
          });
          assert.that(remotePeerFindSuccessor.isDone()).is.true();
          done();
        });
    });
  });
});
