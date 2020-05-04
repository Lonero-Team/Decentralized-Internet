'use strict';

const path = require('path');

const assert = require('assertthat'),
    request = require('supertest'),
    requireAll = require('require-all');

const Endpoint = require('../../lib/Endpoint'),
    successors = require('../../lib/routes/successors');

const mocks = requireAll(path.join(__dirname, 'mocks'));

suite('successors', () => {
  test('is a function.', done => {
    assert.that(successors).is.ofType('function');
    done();
  });

  test('throws an error if peer is missing.', done => {
    assert.that(function () {
      successors();
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
      assert.that(successors(peer)).is.ofType('function');
      done();
    });

    test('returns successors.', done => {
      for (let i = 0; i < 3; i++) {
        peer.successors.push(new Endpoint({ host: 'localhost', port: 4000 + (i * 1000) }));
      }

      request(peer.app).
        post('/successors').
        end(function (err, res) {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(res.body).is.ofType('array');
          assert.that(res.body.length).is.equalTo(3);

          // Supposed that the first and the last element of the array are
          // correct, all elements in-between are correct, too.
          assert.that(res.body[0]).is.equalTo({
            host: 'localhost',
            port: 4000,
            id: 'dc4f424bb575238275aac70b0324ca3a77d5b3dd'
          });
          assert.that(res.body[2]).is.equalTo({
            host: 'localhost',
            port: 6000,
            id: '6184ca5584478c69887da758e7d08fd83810a756'
          });
          done();
        });
    });

    test('limits successors to 16.', done => {
      for (let i = 0; i < 20; i++) {
        peer.successors.push(new Endpoint({ host: 'localhost', port: 4000 + (i * 1000) }));
      }

      request(peer.app).
        post('/successors').
        end(function (err, res) {
          assert.that(err).is.null();
          assert.that(res.statusCode).is.equalTo(200);
          assert.that(res.body).is.ofType('array');
          assert.that(res.body.length).is.equalTo(16);

          // Supposed that the first and the last element of the array are
          // correct, all elements in-between are correct, too.
          assert.that(res.body[0]).is.equalTo({
            host: 'localhost',
            port: 4000,
            id: 'dc4f424bb575238275aac70b0324ca3a77d5b3dd'
          });
          assert.that(res.body[15]).is.equalTo({
            host: 'localhost',
            port: 19000,
            id: 'eda5312b135aaad7d1ac0e84e95d5049305199c9'
          });
          done();
        });
    });
  });
});
