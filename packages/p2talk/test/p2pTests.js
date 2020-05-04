'use strict';

const fs = require('fs'),
    path = require('path');

const assert = require('assertthat'),
    freeport = require('freeport');

const p2p = require('../lib/p2p'),
    Peer = require('../lib/Peer');

/* eslint-disable no-process-env  */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
/* eslint-enable no-process-env  */

suite('p2p', () => {
  test('is an object.', done => {
    assert.that(p2p).is.ofType('object');
    done();
  });

  suite('peer', () => {
    // Set the service interval to a very long timespan to avoid unwanted
    // side-effects in the unit tests that are caused by the housekeeping
    // functions.
    const serviceInterval = '1h';

    const certificate = fs.readFileSync(path.join(__dirname, '..', 'keys', 'localhost.selfsigned', 'certificate.pem')),
        privateKey = fs.readFileSync(path.join(__dirname, '..', 'keys', 'localhost.selfsigned', 'privateKey.pem'));

    let port;

    setup(done => {
      freeport(function (err, result) {
        port = result;
        done(err);
      });
    });

    test('is a function.', done => {
      assert.that(p2p.peer).is.ofType('function');
      done();
    });

    test('throws an error if options are missing.', done => {
      assert.that(() => {
        p2p.peer();
      }).is.throwing('Options are missing.');
      done();
    });

    test('throws an error if the host is missing.', done => {
      assert.that(() => {
        p2p.peer({ port, privateKey, certificate, serviceInterval });
      }).is.throwing('Host is missing.');
      done();
    });

    test('throws an error if the port is missing.', done => {
      assert.that(() => {
        p2p.peer({ host: 'localhost', privateKey, certificate, serviceInterval });
      }).is.throwing('Port is missing.');
      done();
    });

    test('throws an error if the private key is missing.', done => {
      assert.that(() => {
        p2p.peer({ host: 'localhost', port, certificate, serviceInterval });
      }).is.throwing('Private key is missing.');
      done();
    });

    test('throws an error if the certificate is missing.', done => {
      assert.that(() => {
        p2p.peer({ host: 'localhost', port, privateKey, serviceInterval });
      }).is.throwing('Certificate is missing.');
      done();
    });

    test('returns an https peer.', done => {
      const peer = p2p.peer({ host: 'localhost', port, privateKey, certificate, serviceInterval });

      assert.that(peer).is.instanceOf(Peer);
      done();
    });

    test('returns an http peer.', done => {
      const peer = p2p.peer({ host: 'localhost', port, serviceInterval });

      assert.that(peer).is.instanceOf(Peer);
      done();
    });

    test('runs an https server.', done => {
      const peer = p2p.peer({ host: 'localhost', port, privateKey, certificate, serviceInterval });

      peer.remote(peer.self).run('self', err => {
        assert.that(err).is.null();
        done();
      });
    });

    test('runs an http server.', done => {
      const peer = p2p.peer({ host: 'localhost', port, serviceInterval });

      peer.remote(peer.self).run('self', err => {
        assert.that(err).is.null();
        done();
      });
    });
  });
});
