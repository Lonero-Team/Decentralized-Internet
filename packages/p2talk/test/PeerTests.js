'use strict';

const path = require('path');

const assert = require('assertthat'),
    eventEmitter2 = require('eventemitter2'),
    nock = require('nock'),
    requireAll = require('require-all'),
    sha1 = require('sha1');

const Peer = require('../lib/Peer');

const mocks = requireAll(path.join(__dirname, 'routes', 'mocks'));

const EventEmitter2 = eventEmitter2.EventEmitter2;

suite('Peer', () => {
  test('is a function.', done => {
    assert.that(Peer).is.ofType('function');
    done();
  });

  test('throws an error if options are missing.', done => {
    assert.that(() => {
      /* eslint-disable no-new */
      new Peer();
      /* eslint-enable no-new */
    }).is.throwing('Options are missing.');
    done();
  });

  test('throws an error if the host is missing.', done => {
    assert.that(() => {
      /* eslint-disable no-new */
      new Peer({
        port: 3000
      });
      /* eslint-enable no-new */
    }).is.throwing('Host is missing.');
    done();
  });

  test('throws an error if the port is missing.', done => {
    assert.that(() => {
      /* eslint-disable no-new */
      new Peer({
        host: 'localhost'
      });
      /* eslint-enable no-new */
    }).is.throwing('Port is missing.');
    done();
  });

  test('returns an event emitter.', done => {
    const peer = new Peer({
      host: 'localhost',
      port: 3000
    });

    assert.that(peer).is.instanceOf(EventEmitter2);
    done();
  });

  test('optionally sets metadata.', done => {
    const peer = new Peer({
      host: 'localhost',
      port: 3000,
      metadata: { foo: 'bar' }
    });

    assert.that(peer.metadata).is.equalTo({ foo: 'bar' });
    done();
  });

  suite('instance', () => {
    let peer;

    setup(done => {
      peer = new Peer({
        host: 'localhost',
        port: 3000
      });
      done();
    });

    suite('self', () => {
      test('contains information on the endpoint of the peer.', done => {
        assert.that(peer.self).is.equalTo({
          host: 'localhost',
          port: 3000,
          id: sha1('localhost:3000')
        });
        done();
      });
    });

    suite('metadata', () => {
      test('initially is an empty object.', done => {
        assert.that(peer.metadata).is.equalTo({});
        done();
      });
    });

    suite('successor', () => {
      test('initially contains information on the endpoint of the peer.', done => {
        assert.that(peer.successor).is.equalTo({
          host: 'localhost',
          port: 3000,
          id: sha1('localhost:3000')
        });
        done();
      });
    });

    suite('predecessor', () => {
      test('initially contains information on the endpoint of the peer.', done => {
        assert.that(peer.predecessor).is.equalTo({
          host: 'localhost',
          port: 3000,
          id: sha1('localhost:3000')
        });
        done();
      });
    });

    suite('successors', () => {
      test('is initially empty.', done => {
        assert.that(peer.successors).is.equalTo([]);
        done();
      });
    });

    suite('fingers', () => {
      test('is initially empty.', done => {
        assert.that(peer.fingers).is.equalTo([]);
        done();
      });
    });

    suite('wellKnownPeers', () => {
      test('initially contains the peer itself.', done => {
        assert.that(peer.wellKnownPeers.get()).is.equalTo([
          { host: 'localhost', port: 3000 }
        ]);
        done();
      });

      test('initially contains any well-known peers that were explicitly set.', done => {
        peer = new Peer({
          host: 'localhost',
          port: 3000,
          wellKnownPeers: [
            { host: 'localhost', port: 4000 },
            { host: 'localhost', port: 5000 }
          ]
        });

        assert.that(peer.wellKnownPeers.get()).is.equalTo([
          { host: 'localhost', port: 3000 },
          { host: 'localhost', port: 4000 },
          { host: 'localhost', port: 5000 }
        ]);
        done();
      });
    });

    suite('handle', () => {
      test('is an empty object.', done => {
        assert.that(peer.handle).is.equalTo({});
        done();
      });
    });

    suite('remote', () => {
      test('is a function.', done => {
        assert.that(peer.remote).is.ofType('function');
        done();
      });

      test('throws an error if target is missing.', done => {
        assert.that(() => {
          peer.remote();
        }).is.throwing('Target is missing.');
        done();
      });

      test('throws an error if host is missing.', done => {
        assert.that(() => {
          peer.remote({ port: 3000 });
        }).is.throwing('Host is missing.');
        done();
      });

      test('throws an error if port is missing.', done => {
        assert.that(() => {
          peer.remote({ host: 'localhost' });
        }).is.throwing('Port is missing.');
        done();
      });

      test('returns an object.', done => {
        assert.that(peer.remote({ host: 'localhost', port: 3000 })).is.ofType('object');
        done();
      });

      suite('run', () => {
        test('is a function.', done => {
          assert.that(peer.remote({ host: 'localhost', port: 3000 }).run).is.ofType('function');
          done();
        });

        test('throws an error if the function to be called is missing.', done => {
          assert.that(function () {
            peer.remote({ host: 'localhost', port: 3000 }).run();
          }).is.throwing('Function is missing.');
          done();
        });

        test('throws an error if the callback is missing.', done => {
          assert.that(function () {
            peer.remote({ host: 'localhost', port: 3000 }).run('rpc');
          }).is.throwing('Callback is missing.');
          done();
        });

        test('calls the remote function with the given arguments.', done => {
          const scope = nock('https://localhost:3000').
            post('/rpc', { foo: 'ping' }).
            reply(200, { foo: 'pong' });

          peer.remote({ host: 'localhost', port: 3000 }).run('rpc', { foo: 'ping' }, (err, result) => {
            assert.that(err).is.null();
            assert.that(result).is.equalTo({ foo: 'pong' });
            assert.that(scope.isDone()).is.true();
            done();
          });
        });

        test('calls the remote function with an empty object if no arguments are given.', done => {
          const scope = nock('https://localhost:3000').
            post('/rpc', {}).
            reply(200, { foo: 'pong' });

          peer.remote({ host: 'localhost', port: 3000 }).run('rpc', (err, result) => {
            assert.that(err).is.null();
            assert.that(result).is.equalTo({ foo: 'pong' });
            assert.that(scope.isDone()).is.true();
            done();
          });
        });

        test('returns an error if the target is not reachable.', function (done) {
          // Increase timeout to make this test work even when on slow networks
          // (such as hotels' wireless networks).
          this.timeout(10 * 1000);

          peer.remote({ host: 'non-existent.local', port: 3000 }).run('rpc', err => {
            assert.that(err).is.not.null();
            assert.that(err.code).is.equalTo('ENOTFOUND');
            done();
          });
        });

        test('returns an error if a status code other than 200 is returned.', done => {
          const scope = nock('https://localhost:3000').
            post('/rpc', {}).
            reply(500);

          peer.remote({ host: 'localhost', port: 3000 }).run('rpc', err => {
            assert.that(err).is.not.null();
            assert.that(err.message).is.equalTo('Unexpected status code 500 when running rpc.');
            assert.that(scope.isDone()).is.true();
            done();
          });
        });
      });
    });

    suite('setSuccessor', () => {
      test('is a function.', done => {
        assert.that(peer.setSuccessor).is.ofType('function');
        done();
      });

      test('throws an error if successor is missing.', done => {
        assert.that(() => {
          peer.setSuccessor();
        }).is.throwing('Successor is missing.');
        done();
      });

      test('throws an error if the host is missing.', done => {
        assert.that(() => {
          peer.setSuccessor({ port: 3000 });
        }).is.throwing('Host is missing.');
        done();
      });

      test('throws an error if the port is missing.', done => {
        assert.that(() => {
          peer.setSuccessor({ host: 'localhost' });
        }).is.throwing('Port is missing.');
        done();
      });

      test('sets the successor to the given successor.', done => {
        peer.setSuccessor({ host: 'example.com', port: 3000 });
        assert.that(peer.successor).is.equalTo({
          host: 'example.com',
          port: 3000,
          id: 'f8f595e2159543d3b9dd3f3ebbe48d4faa0819f1'
        });
        done();
      });

      test('emits an environment::successor event.', done => {
        peer.once('environment::successor', function (successor) {
          assert.that(successor).is.equalTo({
            host: 'example.com',
            port: 3000,
            id: 'f8f595e2159543d3b9dd3f3ebbe48d4faa0819f1'
          });
          done();
        });
        peer.setSuccessor({ host: 'example.com', port: 3000 });
      });

      test('emits a status::* event.', done => {
        peer.once('status::*', function (status) {
          assert.that(status).is.equalTo({
            from: 'lonely',
            to: 'unbalanced'
          });
          done();
        });
        peer.setSuccessor({ host: 'example.com', port: 3000 });
      });

      test('only emits a status::* event if the status did actually change.', done => {
        let counter = 0;

        peer.on('status::*', () => {
          counter++;
        });
        peer.setSuccessor({ host: 'example.com', port: 3000 });
        peer.setSuccessor({ host: 'example.com', port: 4000 });

        setTimeout(() => {
          assert.that(counter).is.equalTo(1);
          peer.removeAllListeners();
          done();
        }, 0.5 * 1000);
      });
    });

    suite('setPredecessor', () => {
      test('is a function.', done => {
        assert.that(peer.setPredecessor).is.ofType('function');
        done();
      });

      test('throws an error if the host is missing.', done => {
        assert.that(() => {
          peer.setPredecessor({ port: 3000 });
        }).is.throwing('Host is missing.');
        done();
      });

      test('throws an error if the port is missing.', done => {
        assert.that(() => {
          peer.setPredecessor({ host: 'localhost' });
        }).is.throwing('Port is missing.');
        done();
      });

      test('sets the predecessor to the given predecessor.', done => {
        peer.setPredecessor({ host: 'example.com', port: 3000 });
        assert.that(peer.predecessor).is.equalTo({
          host: 'example.com',
          port: 3000,
          id: 'f8f595e2159543d3b9dd3f3ebbe48d4faa0819f1'
        });
        done();
      });

      test('sets the predecessor to undefined if no predecessor is given.', done => {
        peer.setPredecessor();
        assert.that(peer.predecessor).is.undefined();
        done();
      });

      test('emits an environment::predecessor event.', done => {
        peer.once('environment::predecessor', function (predecessor) {
          assert.that(predecessor).is.equalTo({
            host: 'example.com',
            port: 3000,
            id: 'f8f595e2159543d3b9dd3f3ebbe48d4faa0819f1'
          });
          done();
        });
        peer.setPredecessor({ host: 'example.com', port: 3000 });
      });

      test('emits a environment::predecessor event when the predecessor is set to undefined.', done => {
        peer.once('environment::predecessor', function (predecessor) {
          assert.that(predecessor).is.undefined();
          done();
        });
        peer.setPredecessor();
      });

      test('emits a status::* event.', done => {
        peer.once('status::*', function (status) {
          assert.that(status).is.equalTo({
            from: 'lonely',
            to: 'unbalanced'
          });
          done();
        });
        peer.setPredecessor({ host: 'example.com', port: 3000 });
      });

      test('only emits a status::* event if the status did actually change.', done => {
        let counter = 0;

        peer.on('status::*', () => {
          counter++;
        });
        peer.setPredecessor({ host: 'example.com', port: 3000 });
        peer.setPredecessor({ host: 'example.com', port: 4000 });

        setTimeout(() => {
          assert.that(counter).is.equalTo(1);
          peer.removeAllListeners();
          done();
        }, 0.5 * 1000);
      });
    });

    suite('status', () => {
      test('is a function.', done => {
        assert.that(peer.status).is.ofType('function');
        done();
      });

      test('returns lonely if the peer only knows about itself.', done => {
        peer.setSuccessor({ host: peer.self.host, port: peer.self.port });
        peer.setPredecessor({ host: peer.self.host, port: peer.self.port });

        assert.that(peer.status()).is.equalTo('lonely');
        done();
      });

      test('returns joined if the peer is not connected to itself.', done => {
        peer.setSuccessor({ host: 'example.com', port: 3000 });
        peer.setPredecessor({ host: 'example.com', port: 3000 });

        assert.that(peer.status()).is.equalTo('joined');
        done();
      });

      suite('returns unbalanced if the peer', () => {
        suite('is its own successor and it', () => {
          test('does not have a predecessor.', done => {
            peer.setSuccessor({ host: peer.self.host, port: peer.self.port });
            peer.setPredecessor();

            assert.that(peer.status()).is.equalTo('unbalanced');
            done();
          });

          test('does have a predecessor other than itself.', done => {
            peer.setSuccessor({ host: peer.self.host, port: peer.self.port });
            peer.setPredecessor({ host: 'example.com', port: 3000 });

            assert.that(peer.status()).is.equalTo('unbalanced');
            done();
          });
        });

        suite('does have a successor other than itself and it', () => {
          test('does not have a predecessor.', done => {
            peer.setSuccessor({ host: 'example.com', port: 3000 });
            peer.setPredecessor();

            assert.that(peer.status()).is.equalTo('unbalanced');
            done();
          });

          test('is its own predecessor.', done => {
            peer.setSuccessor({ host: 'example.com', port: 3000 });
            peer.setPredecessor({ host: peer.self.host, port: peer.self.port });

            assert.that(peer.status()).is.equalTo('unbalanced');
            done();
          });
        });
      });
    });

    suite('fixSuccessor', () => {
      test('is a function.', done => {
        assert.that(peer.fixSuccessor).is.ofType('function');
        done();
      });

      test('sets itself as its successor if the successors list is empty.', done => {
        peer.setSuccessor({ host: 'example.com', port: 3000 });
        peer.successors = [];

        peer.fixSuccessor();

        assert.that(peer.successor).is.equalTo(peer.self);
        done();
      });

      test('sets itself as its successor if the successors list only has one element.', done => {
        peer.setSuccessor({ host: 'example.com', port: 3000 });
        peer.successors = [{ host: 'foo.com', port: 3000 }];

        peer.fixSuccessor();

        assert.that(peer.successor).is.equalTo(peer.self);
        done();
      });

      test('sets a new successor if the successors list has two elements.', done => {
        peer.setSuccessor({ host: 'example.com', port: 3000 });
        peer.successors = [
          { host: 'foo.com', port: 3000 },
          { host: 'bar.com', port: 3000 }
        ];

        peer.fixSuccessor();

        assert.that(peer.successor).is.equalTo({
          host: 'bar.com',
          port: 3000,
          id: '73b2c872ab0f76bc74f7f4d48a688d239c65ec4b'
        });
        done();
      });

      test('sets a new successor if the successors list has more than two elements.', done => {
        peer.setSuccessor({ host: 'example.com', port: 3000 });
        peer.successors = [
          { host: 'foo.com', port: 3000 },
          { host: 'bar.com', port: 3000 },
          { host: 'baz.com', port: 3000 },
          { host: 'bas.com', port: 3000 }
        ];

        peer.fixSuccessor();

        assert.that(peer.successor).is.equalTo({
          host: 'bar.com',
          port: 3000,
          id: '73b2c872ab0f76bc74f7f4d48a688d239c65ec4b'
        });
        done();
      });
    });

    suite('getEndpointFor', () => {
      test('is a function.', done => {
        assert.that(peer.getEndpointFor).is.ofType('function');
        done();
      });

      test('throws an error if value is missing.', done => {
        assert.that(() => {
          peer.getEndpointFor();
        }).is.throwing('Value is missing.');
        done();
      });

      test('throws an error if callback is missing.', done => {
        assert.that(() => {
          peer.getEndpointFor('foo');
        }).is.throwing('Callback is missing.');
        done();
      });

      test('calls findSuccessor with the id of the given value.', done => {
        const scopeFindSuccessor = nock('https://localhost:3000').
          post('/find-successor', { id: '0beec7b5ea3f0fdbc95d0dd47f3c5bc275da8a33' }).
          reply(200, {
            host: 'example.com',
            port: 3000,
            id: sha1('example.com:3000')
          });

        const scopeMetadata = nock('https://example.com:3000').
          post('/metadata').
          reply(200, { foo: 'bar' });

        peer.getEndpointFor('foo', function (err, endpoint, metadata) {
          assert.that(err).is.null();
          assert.that(endpoint).is.equalTo({
            host: 'example.com',
            port: 3000,
            id: sha1('example.com:3000')
          });
          assert.that(metadata).is.equalTo({
            foo: 'bar'
          });
          assert.that(scopeFindSuccessor.isDone()).is.true();
          assert.that(scopeMetadata.isDone()).is.true();
          done();
        });
      });

      test('returns an error if findSuccessor fails.', done => {
        const scope = nock('https://localhost:3000').
          post('/find-successor', { id: '0beec7b5ea3f0fdbc95d0dd47f3c5bc275da8a33' }).
          reply(500);

        peer.getEndpointFor('foo', function (err) {
          assert.that(err).is.not.null();
          assert.that(scope.isDone()).is.true();
          done();
        });
      });
    });

    suite('isResponsibleFor', () => {
      test('is a function.', done => {
        assert.that(peer.isResponsibleFor).is.ofType('function');
        done();
      });

      test('throws an error if value is missing.', done => {
        assert.that(() => {
          peer.isResponsibleFor();
        }).is.throwing('Value is missing.');
        done();
      });

      test('returns true if the peer is lonely.', done => {
        assert.that(peer.isResponsibleFor('foo')).is.true();
        done();
      });

      test('returns false if the peer is unbalanced.', done => {
        peer = new mocks.UnbalancedPeerWithoutPredecessor({
          host: 'localhost',
          port: 3000
        });

        assert.that(peer.isResponsibleFor('foo')).is.false();
        done();
      });

      test('returns true if the peer is joined and responsible.', done => {
        peer = new mocks.JoinedPeer({
          host: 'localhost',
          port: 3000
        });

        assert.that(peer.isResponsibleFor('foo')).is.true();
        done();
      });

      test('returns false if the peer is joined, but not responsible.', done => {
        peer = new mocks.JoinedPeer({
          host: 'localhost',
          port: 3000
        });

        assert.that(peer.isResponsibleFor('bar')).is.false();
        done();
      });
    });
  });
});
