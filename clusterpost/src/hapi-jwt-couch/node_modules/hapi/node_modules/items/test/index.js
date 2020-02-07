'use strict';

// Load modules

const Code = require('code');
const Lab = require('lab');
const Items = require('../');


// Declare internals

const internals = {};


// Test shortcuts

const lab = exports.lab = Lab.script();
const describe = lab.experiment;
const it = lab.it;
const expect = Code.expect;


describe('Items', () => {

    describe('serial()', () => {

        it('calls methods in serial', (done) => {

            const called = [];
            const is = [];
            const array = [1, 2, 3, 4, 5];
            const method = function (item, next, i) {

                called.push(item);
                is.push(i);
                setTimeout(next, 5);
            };

            Items.serial(array, method, (err) => {

                expect(err).to.not.exist();
                expect(called).to.deep.equal(array);
                expect(is).to.deep.equal([0, 1, 2, 3, 4]);
                done();
            });
        });

        it('skips on empty array', (done) => {

            const called = [];
            const array = [];
            const method = function (item, next) {

                called.push(item);
                setTimeout(next, 5);
            };

            Items.serial(array, method, (err) => {

                expect(err).to.not.exist();
                expect(called).to.deep.equal(array);
                done();
            });
        });

        it('aborts with error', (done) => {

            const called = [];
            const array = [1, 2, 3, 4, 5];
            const method = function (item, next) {

                called.push(item);
                if (item === 3) {
                    return next('error');
                }

                setTimeout(next, 5);
            };

            Items.serial(array, method, (err) => {

                expect(err).to.equal('error');
                expect(called).to.deep.equal([1, 2, 3]);
                done();
            });
        });
    });

    describe('parallel()', () => {

        it('calls methods in parallel', (done) => {

            const called = [];
            const array = [[1, 1], [2, 4], [3, 2], [4, 3], [5, 5]];
            const is = [];
            const method = function (item, next, i) {

                is.push(i);
                setTimeout(() => {

                    called.push(item[0]);
                    next();
                }, item[1]);
            };

            Items.parallel(array, method, (err) => {

                expect(err).to.not.exist();
                expect(called).to.deep.equal([1, 3, 4, 2, 5]);
                expect(is).to.deep.equal([0, 1, 2, 3, 4]);
                done();
            });
        });

        it('skips on empty array', (done) => {

            const called = [];
            const array = [];
            const method = function (item, next) {

                setTimeout(() => {

                    called.push(item[0]);
                    next();
                }, item[1]);
            };

            Items.parallel(array, method, (err) => {

                expect(err).to.not.exist();
                expect(called).to.deep.equal([]);
                done();
            });
        });

        it('aborts with error', (done) => {

            const called = [];
            const array = [[1, 1], [2, 4], [3, 2], [4, 3], [5, 5]];
            const method = function (item, next) {

                setTimeout(() => {

                    if (item[0] === 3) {
                        return next('error');
                    }

                    called.push(item[0]);
                    next();
                }, item[1]);
            };

            Items.parallel(array, method, (err) => {

                expect(err).to.equal('error');
                expect(called).to.deep.equal([1]);

                setTimeout(() => {

                    expect(called).to.deep.equal([1, 4, 2, 5]);
                    done();
                }, 6);
            });
        });
    });

    describe('parallel.execute()', () => {

        it('calls methods in parallel and returns the result', (done) => {

            const fns = {
                fn1: function (next) {

                    next(null, 'bye');
                },
                fn2: function (next) {

                    next(null, 'hi');
                }
            };

            Items.parallel.execute(fns, (err, result) => {

                expect(err).to.not.exist();
                expect(result.fn1).to.equal('bye');
                expect(result.fn2).to.equal('hi');
                done();
            });
        });

        it('returns an empty object to the callback when passed an empty object', (done) => {

            const fns = {};

            Items.parallel.execute(fns, (err, result) => {

                expect(err).to.not.exist();
                expect(Object.keys(result).length).to.equal(0);
                done();
            });
        });

        it('returns an empty object to the callback when passed a null object', (done) => {

            Items.parallel.execute(null, (err, result) => {

                expect(err).to.not.exist();
                expect(Object.keys(result).length).to.equal(0);
                done();
            });
        });

        it('exits early and result object is missing when an error is passed to callback', (done) => {

            const fns = {
                fn1: function (next) {

                    setImmediate(() => {

                        next(null, 'hello');
                    });
                },
                fn2: function (next) {

                    setImmediate(() => {

                        next(new Error('This is my error'));
                    });

                },
                fn3: function (next) {

                    setImmediate(() => {

                        next(null, 'bye');
                    });
                }
            };

            Items.parallel.execute(fns, (err, result) => {

                expect(err).to.exist();
                expect(result).to.not.exist();
                done();
            });
        });

        it('exits early and doesn\'t execute other functions on an error', (done) => {

            let fn2Executed = false;
            const fns = {
                fn1: function (next) {

                    next(new Error('This is my error'));
                },
                fn2: function (next) {

                    setImmediate(() => {

                        fn2Executed = true;
                        next();
                    });
                }
            };

            Items.parallel.execute(fns, (err, result) => {

                expect(err).to.exist();
                expect(result).to.not.exist();
                expect(fn2Executed).to.equal(false);
                done();
            });
        });

        it('handles multiple errors being returned by sending first error', (done) => {

            const fns = {
                fn1: function (next) {

                    next(new Error('fn1'));
                },
                fn2: function (next) {

                    next(new Error('fn2'));

                },
                fn3: function (next) {

                    next(new Error('fn3'));
                }
            };

            Items.parallel.execute(fns, (err, result) => {

                expect(err).to.exist();
                expect(result).to.not.exist();
                expect(err.message).to.equal('fn1');
                done();
            });
        });
    });
});
