'use strict';

const assert = require('assertthat');

const WellKnownPeers = require('../lib/WellKnownPeers');

suite('WellKnownPeers', () => {
  test('is a function.', done => {
    assert.that(WellKnownPeers).is.ofType('function');
    done();
  });

  suite('get', () => {
    test('returns an empty array.', done => {
      const wellKnownPeers = new WellKnownPeers();

      assert.that(wellKnownPeers.get()).is.equalTo([]);
      done();
    });

    test('returns an array with all added peers.', done => {
      const wellKnownPeers = new WellKnownPeers();

      wellKnownPeers.add([
        { host: 'localhost', port: 3000 },
        { host: 'localhost', port: 4000 }
      ]);

      assert.that(wellKnownPeers.get()).is.equalTo([
        { host: 'localhost', port: 3000 },
        { host: 'localhost', port: 4000 }
      ]);
      done();
    });
  });

  suite('add', () => {
    test('adds a single peer.', done => {
      const wellKnownPeers = new WellKnownPeers();

      wellKnownPeers.add({ host: 'localhost', port: 3000 });

      assert.that(wellKnownPeers.get()).is.equalTo([
        { host: 'localhost', port: 3000 }
      ]);
      done();
    });

    test('adds multiple peers at once.', done => {
      const wellKnownPeers = new WellKnownPeers();

      wellKnownPeers.add([
        { host: 'localhost', port: 3000 },
        { host: 'localhost', port: 4000 }
      ]);

      assert.that(wellKnownPeers.get()).is.equalTo([
        { host: 'localhost', port: 3000 },
        { host: 'localhost', port: 4000 }
      ]);
      done();
    });

    test('adds multiple peers one by one.', done => {
      const wellKnownPeers = new WellKnownPeers();

      wellKnownPeers.add({ host: 'localhost', port: 3000 });
      wellKnownPeers.add({ host: 'localhost', port: 4000 });

      assert.that(wellKnownPeers.get()).is.equalTo([
        { host: 'localhost', port: 3000 },
        { host: 'localhost', port: 4000 }
      ]);
      done();
    });

    test('does not add duplicate peers.', done => {
      const wellKnownPeers = new WellKnownPeers();

      wellKnownPeers.add([
        { host: 'localhost', port: 3000 },
        { host: 'localhost', port: 4000 }
      ]);

      wellKnownPeers.add([
        { host: 'localhost', port: 4000 },
        { host: 'localhost', port: 5000 }
      ]);

      assert.that(wellKnownPeers.get()).is.equalTo([
        { host: 'localhost', port: 3000 },
        { host: 'localhost', port: 4000 },
        { host: 'localhost', port: 5000 }
      ]);
      done();
    });

    test('ignores empty arrays.', done => {
      const wellKnownPeers = new WellKnownPeers();

      wellKnownPeers.add([
        { host: 'localhost', port: 3000 },
        { host: 'localhost', port: 4000 }
      ]);

      wellKnownPeers.add([]);

      assert.that(wellKnownPeers.get()).is.equalTo([
        { host: 'localhost', port: 3000 },
        { host: 'localhost', port: 4000 }
      ]);
      done();
    });
  });
});
