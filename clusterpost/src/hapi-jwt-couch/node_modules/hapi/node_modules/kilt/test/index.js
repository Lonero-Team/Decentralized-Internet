'use strict';

// Load modules

const Code = require('code');
const Events = require('events');
const Lab = require('lab');
const Kilt = require('..');


// Declare internals

const internals = {};


// Test shortcuts

const lab = exports.lab = Lab.script();
const expect = Code.expect;
const it = lab.it;


it('combines multiple sources', (done) => {

    const source1 = new Events.EventEmitter();
    const source2 = new Events.EventEmitter();

    const kilt = new Kilt();
    kilt.addEmitter(source1);
    kilt.addEmitter(source2);

    let counter = 0;
    kilt.on('test', (a, b, c) => {

        expect(a).to.equal(1);
        expect(b).to.equal(2);
        expect(c).to.equal(3);

        if (++counter === 2) {
            done();
        }
    });

    source1.emit('test', 1, 2, 3);
    source2.emit('test', 1, 2, 3);
});

it('combines multiple sources in constructor', (done) => {

    const source1 = new Events.EventEmitter();
    const source2 = new Events.EventEmitter();

    const kilt = new Kilt([source1, source2]);

    let counter = 0;
    kilt.on('test', (a, b, c) => {

        expect(a).to.equal(1);
        expect(b).to.equal(2);
        expect(c).to.equal(3);

        if (++counter === 2) {
            done();
        }
    });

    source1.emit('test', 1, 2, 3);
    source2.emit('test', 1, 2, 3);
});

it('combines multiple sources in constructor in multiple arguments', (done) => {

    const source1 = new Events.EventEmitter();
    const source2 = new Events.EventEmitter();

    const kilt = new Kilt(source1, [source2]);

    let counter = 0;
    kilt.on('test', (a, b, c) => {

        expect(a).to.equal(1);
        expect(b).to.equal(2);
        expect(c).to.equal(3);

        if (++counter === 2) {
            done();
        }
    });

    source1.emit('test', 1, 2, 3);
    source2.emit('test', 1, 2, 3);
});

it('combines multiple sources in constructor and after', (done) => {

    const source1 = new Events.EventEmitter();
    const source2 = new Events.EventEmitter();

    const kilt = new Kilt(source1);
    kilt.addEmitter(source2);

    let counter = 0;
    kilt.on('test', (a, b, c) => {

        expect(a).to.equal(1);
        expect(b).to.equal(2);
        expect(c).to.equal(3);

        if (++counter === 2) {
            done();
        }
    });

    source1.emit('test', 1, 2, 3);
    source2.emit('test', 1, 2, 3);
});

it('combines multiple sources with own emit', (done) => {

    const source1 = new Events.EventEmitter();
    const source2 = new Events.EventEmitter();

    const kilt = new Kilt();
    kilt.addEmitter(source1);
    kilt.addEmitter(source2);

    let counter = 0;
    kilt.on('test', (a, b, c) => {

        expect(a).to.equal(1);
        expect(b).to.equal(2);
        expect(c).to.equal(3);

        if (++counter === 3) {
            done();
        }
    });

    source1.emit('test', 1, 2, 3);
    kilt.emit('test', 1, 2, 3);
    source2.emit('test', 1, 2, 3);
});

it('adds sources after listeners', (done) => {

    const source1 = new Events.EventEmitter();
    const source2 = new Events.EventEmitter();

    const kilt = new Kilt();

    let counter = 0;
    kilt.on('test', (a, b, c) => {

        expect(a).to.equal(1);
        expect(b).to.equal(2);
        expect(c).to.equal(3);

        if (++counter === 2) {
            done();
        }
    });

    kilt.addEmitter(source1);
    kilt.addEmitter(source2);

    source1.emit('test', 1, 2, 3);
    source2.emit('test', 1, 2, 3);
});

it('subscribed multiple times', (done) => {

    const source1 = new Events.EventEmitter();
    const source2 = new Events.EventEmitter();

    const kilt = new Kilt();

    let counter = 0;
    kilt.on('test', () => {

        ++counter;
    });

    kilt.on('test', () => {

        counter = counter * 4;
    });

    kilt.addEmitter(source1);
    kilt.addEmitter(source2);

    source1.emit('test');
    source2.emit('test');

    expect(counter).to.equal(20);
    done();
});

it('removes listener after once', (done) => {

    const source1 = new Events.EventEmitter();
    const source2 = new Events.EventEmitter();

    const kilt = new Kilt();
    kilt.addEmitter(source1);
    kilt.addEmitter(source2);

    let counter = 0;
    kilt.once('test', () => {

        ++counter;
    });

    expect(source1.listeners('test').length).to.equal(1);
    expect(source2.listeners('test').length).to.equal(1);
    expect(kilt.listeners('test').length).to.equal(1);

    source1.emit('test');

    expect(source1.listeners('test').length).to.equal(0);
    expect(source2.listeners('test').length).to.equal(0);
    expect(kilt.listeners('test').length).to.equal(0);

    source2.emit('test');

    expect(counter).to.equal(1);
    done();
});

it('removes listener', (done) => {

    const source1 = new Events.EventEmitter();
    const source2 = new Events.EventEmitter();

    const kilt = new Kilt();
    kilt.addEmitter(source1);
    kilt.addEmitter(source2);

    let counter = 0;
    const onTest = () => {

        ++counter;
    };

    kilt.on('test', onTest);
    kilt.removeListener('test', onTest);

    source1.emit('test');
    source2.emit('test');

    expect(counter).to.equal(0);
    done();
});

it('removes all listeners of given type', (done) => {

    const source1 = new Events.EventEmitter();
    const source2 = new Events.EventEmitter();

    const kilt = new Kilt();
    kilt.addEmitter(source1);
    kilt.addEmitter(source2);

    let counter = 0;
    const onTest = () => {

        ++counter;
    };

    kilt.on('test', onTest);

    expect(source1.listeners('test').length).to.equal(1);
    expect(source2.listeners('test').length).to.equal(1);
    expect(kilt.listeners('test').length).to.equal(1);

    kilt.removeAllListeners('test');

    expect(source1.listeners('test').length).to.equal(0);
    expect(source2.listeners('test').length).to.equal(0);
    expect(kilt.listeners('test').length).to.equal(0);

    source1.emit('test');
    source2.emit('test');

    expect(counter).to.equal(0);
    done();
});

it('removes all listeners', (done) => {

    const source1 = new Events.EventEmitter();
    const source2 = new Events.EventEmitter();

    const kilt = new Kilt();
    kilt.addEmitter(source1);
    kilt.addEmitter(source2);

    let counter = 0;
    const onTest = () => {

        ++counter;
    };

    kilt.on('test', onTest);

    expect(source1.listeners('test').length).to.equal(1);
    expect(source2.listeners('test').length).to.equal(1);
    expect(kilt.listeners('test').length).to.equal(1);

    kilt.removeAllListeners();

    expect(source1.listeners('test').length).to.equal(0);
    expect(source2.listeners('test').length).to.equal(0);
    expect(kilt.listeners('test').length).to.equal(0);

    source1.emit('test');
    source2.emit('test');

    expect(counter).to.equal(0);
    done();
});

it('removes all listeners of an unknown type', (done) => {

    const source1 = new Events.EventEmitter();
    const source2 = new Events.EventEmitter();

    const kilt = new Kilt();
    kilt.addEmitter(source1);
    kilt.addEmitter(source2);

    let counter = 0;
    const onTest = () => {

        ++counter;
    };

    kilt.on('test', onTest);
    kilt.removeAllListeners('test1');

    source1.emit('test');
    source2.emit('test');

    expect(counter).to.equal(2);
    done();
});
