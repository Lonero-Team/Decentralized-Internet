'use strict';

const path = require('path');

const assert = require('assertthat'),
    nock = require('nock'),
    request = require('supertest'),
    requireAll = require('require-all');

const Endpoint = require('../../lib/Endpoint'),
    fixSuccessors = require('../../lib/routes/fixSuccessors');

const mocks = requireAll(path.join(__dirname, 'mocks'));

suite('fixSuccessors', () => {
  test('is a function.', done => {
    assert.that(fixSuccessors).is.ofType('function');
    done();
  });

  test('throws an error if peer is missing.', done => {
    assert.that(() => {
      fixSuccessors();
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
      assert.that(fixSuccessors(peer)).is.ofType('function');
      done();
    });

    test('fixes the successor if the successor is not reachable.', done => {
      let fixSuccessorCalled = false;

      peer.fixSuccessor = () => {
        fixSuccessorCalled = true;
      };

      request(peer.app).
        post('/fix-successors').
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(500);
          assert.that(fixSuccessorCalled).is.true();
          done();
        });
    });

    test('stores the successors returned by its successor and prepends it with the successor itself.', done => {
      const remotePeerSuccessors = nock('https://localhost:4000').post('/successors').reply(200, [
        new Endpoint({
          host: 'localhost',
          port: 5000
        }),
        new Endpoint({
          host: 'localhost',
          port: 6000
        })
      ]);

      request(peer.app).
        post('/fix-successors').
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(peer.successors).is.equalTo([
            {
              host: 'localhost',
              port: 4000,
              id: 'dc4f424bb575238275aac70b0324ca3a77d5b3dd'
            }, {
              host: 'localhost',
              port: 5000,
              id: '74ed504de10a894a40d9545a0d4ca6d3885af8ed'
            }, {
              host: 'localhost',
              port: 6000,
              id: '6184ca5584478c69887da758e7d08fd83810a756'
            }
          ]);
          assert.that(remotePeerSuccessors.isDone()).is.true();
          done();
        });
    });

    test('stores at least the successor if the successor does not have any successors.', done => {
      const remotePeerSuccessors = nock('https://localhost:4000').post('/successors').reply(200, []);

      request(peer.app).
        post('/fix-successors').
        end((err, res) => {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(peer.successors).is.equalTo([
            {
              host: 'localhost',
              port: 4000,
              id: 'dc4f424bb575238275aac70b0324ca3a77d5b3dd'
            }
          ]);
          assert.that(remotePeerSuccessors.isDone()).is.true();
          done();
        });
    });
  });
});
