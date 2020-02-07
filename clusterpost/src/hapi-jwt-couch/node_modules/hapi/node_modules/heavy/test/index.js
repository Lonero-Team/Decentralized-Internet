'use strict';

// Load modules

const Code = require('code');
const Heavy = require('..');
const Lab = require('lab');


// Declare internals

const internals = {};


// Test shortcuts

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;


describe('Heavy', { parallel: false }, () => {

    it('requires load interval when maxEventLoopDelay is set', (done) => {

        const heavy = new Heavy({ sampleInterval: 0 });
        expect(() => {

            heavy.policy({ maxEventLoopDelay: 10, maxHeapUsedBytes: 0, maxRssBytes: 0 });
        }).to.throw('Load sample interval must be set to enable load limits');
        done();
    });

    it('requires load interval when maxHeapUsedBytes is set', (done) => {

        const heavy = new Heavy({ sampleInterval: 0 });
        expect(() => {

            heavy.policy({ maxEventLoopDelay: 0, maxHeapUsedBytes: 10, maxRssBytes: 0 });
        }).to.throw('Load sample interval must be set to enable load limits');
        done();
    });

    it('requires load interval when maxRssBytes is set', (done) => {

        const heavy = new Heavy({ sampleInterval: 0 });
        expect(() => {

            heavy.policy({ maxEventLoopDelay: 0, maxHeapUsedBytes: 0, maxRssBytes: 10 });
        }).to.throw('Load sample interval must be set to enable load limits');
        done();
    });

    const sleep = function (msec) {

        const start = Date.now();
        while (Date.now() - start < msec) {}
    };

    it('measures load', (done) => {

        const heavy = new Heavy({ sampleInterval: 4 });
        heavy.start();

        expect(heavy.load.eventLoopDelay).to.equal(0);
        sleep(5);
        setImmediate(() => {

            sleep(5);
            expect(heavy.load.eventLoopDelay).to.be.above(0);

            setImmediate(() => {

                sleep(5);

                expect(heavy.load.eventLoopDelay).to.be.above(0);
                expect(heavy.load.heapUsed).to.be.above(1024 * 1024);
                expect(heavy.load.rss).to.be.above(1024 * 1024);
                heavy.stop();
                done();
            });
        });
    });

    it('throws when process not started', (done) => {

        const heavy = new Heavy({ sampleInterval: 5 });
        const policy = heavy.policy({ maxRssBytes: 1 });

        expect(() => {

            policy.check();
        }).to.throw('Cannot check load when sampler is not started');
        done();
    });

    it('fails check due to high rss load', (done) => {

        const heavy = new Heavy({ sampleInterval: 5 });
        const policy = heavy.policy({ maxRssBytes: 1 });

        heavy.start();
        expect(policy.check()).to.equal(null);

        setTimeout(() => {

            expect(policy.check().message).to.equal('Server under heavy load (rss)');
            expect(heavy.load.rss).to.be.above(10000);
            heavy.stop();
            done();
        }, 10);
    });

    it('fails check due to high heap load', (done) => {

        const heavy = new Heavy({ sampleInterval: 5 });
        const policy = heavy.policy({ maxHeapUsedBytes: 1 });

        heavy.start();
        expect(policy.check()).to.equal(null);

        setTimeout(() => {

            expect(policy.check().message).to.equal('Server under heavy load (heap)');
            expect(heavy.load.heapUsed).to.be.above(0);
            heavy.stop();
            done();
        }, 10);
    });

    it('fails check due to high event loop delay load', (done) => {

        const heavy = new Heavy({ sampleInterval: 1 });
        const policy = heavy.policy({ maxEventLoopDelay: 5 });

        heavy.start();

        expect(policy.check()).to.equal(null);
        expect(heavy.load.eventLoopDelay).to.equal(0);
        setImmediate(() => {

            sleep(10);

            setImmediate(() => {

                expect(policy.check().message).to.equal('Server under heavy load (event loop)');
                expect(heavy.load.eventLoopDelay).to.be.above(0);
                heavy.stop();
                done();
            });
        });
    });

    it('fails check due to high event loop delay load (delayed measure)', (done) => {

        const heavy = new Heavy({ sampleInterval: 1 });
        const policy = heavy.policy({ maxEventLoopDelay: 5 });

        heavy.start();

        expect(policy.check()).to.equal(null);
        expect(heavy.load.eventLoopDelay).to.equal(0);
        sleep(10);

        expect(policy.check().message).to.equal('Server under heavy load (event loop)');
        expect(heavy.load.eventLoopDelay).to.be.above(0);
        heavy.stop();
        done();
    });

    it('disabled by default', (done) => {

        const heavy = new Heavy();
        const policy = heavy.policy();

        heavy.start();
        setImmediate(() => {

            expect(heavy.load.rss).to.equal(0);
            expect(policy.check()).to.equal(null);
            heavy.stop();
            done();
        });
    });
});
