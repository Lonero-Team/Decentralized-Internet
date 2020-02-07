'use strict';

// Load modules

const Code = require('code');
const Lab = require('lab');
const Mimos = require('..');


// Declare internals

const internals = {};


// Test shortcuts

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;

describe('Mimos', () => {

    describe('path()', () => {

        it('returns the mime type from a file path', (done) => {

            const mimos = new Mimos();

            expect(mimos.path('/static/javascript/app.js')).deep.equal({
                source: 'iana',
                charset: 'UTF-8',
                compressible: true,
                extensions: ['js'],
                type: 'application/javascript'
            });
            done();
        });

        it('returns empty object if a match can not be found', (done) => {

            const mimos = new Mimos();

            expect(mimos.path('/static/javascript')).to.deep.equal({});
            done();
        });

        it('ignores extension upper case', (done) => {

            const lower = '/static/image/image.jpg';
            const upper = '/static/image/image.JPG';
            const mimos = new Mimos();

            expect(mimos.path(lower).type).to.equal(mimos.path(upper).type);

            done();
        });
    });

    describe('type()', () => {

        it('returns a found type', (done) => {

            const mimos = new Mimos();

            expect(mimos.type('text/plain')).to.deep.equal({
                source: 'iana',
                compressible: true,
                extensions: ['txt', 'text', 'conf', 'def', 'list', 'log', 'in', 'ini'],
                type: 'text/plain'
            });
            done();
        });

        it('returns a missing type', (done) => {

            const mimos = new Mimos();

            expect(mimos.type('hapi/test')).to.deep.equal({
                source: 'mimos',
                compressible: false,
                extensions: [],
                type: 'hapi/test'
            });
            done();
        });
    });

    it('accepts an override object to make adjustments to the internal mime database', (done) => {

        const nodeModule = {
            source: 'iana',
            compressible: false,
            extensions: ['node', 'module', 'npm'],
            type: 'node/module'
        };
        const dbOverwrite = {
            override: {
                'node/module': nodeModule
            }
        };

        const mimos = new Mimos(dbOverwrite);
        expect(mimos.type('node/module')).to.deep.equal(nodeModule);
        expect(mimos.path('/node_modules/node/module.npm')).to.deep.equal(nodeModule);

        done();
    });

    it('allows built-in types to be replaced with user mime data', (done) => {

        const jsModule = {
            source: 'iana',
            charset: 'UTF-8',
            compressible: true,
            extensions: ['js', 'javascript'],
            type: 'text/javascript'
        };
        const dbOverwrite = {
            override: {
                'application/javascript': jsModule
            }
        };

        const mimos = new Mimos(dbOverwrite);

        expect(mimos.type('application/javascript')).to.deep.equal(jsModule);
        expect(mimos.path('/static/js/app.js')).to.deep.equal(jsModule);

        done();
    });

    it('executes a predicate function if it is provided', (done) => {

        const jsModule = {
            predicate: function (mime) {

                return {
                    foo: 'bar',
                    type: mime.type
                };
            },
            type: 'text/javascript'
        };
        const dbOverwrite = {
            override: {
                'application/javascript': jsModule
            }
        };

        const mimos = new Mimos(dbOverwrite);

        const typeResult = mimos.type('application/javascript');

        expect(typeResult).to.deep.equal({
            foo: 'bar',
            type: 'text/javascript'
        });

        const pathResult = mimos.path('/static/js/app.js');

        expect(pathResult).to.deep.equal({
            foo: 'bar',
            type: 'text/javascript'
        });

        done();
    });

    it('throws an error if created without new', (done) => {

        expect(() => {

            Mimos();
        }).to.throw('Mimos must be created with new');
        done();

    });

    it('throws an error if the predicate option is not a functino', (done) => {

        expect(() => {

            new Mimos({
                override: {
                    'application/javascript': {
                        predicate: 'foo'
                    }
                }
            });
        }).to.throw('predicate option must be a function');
        done();
    });
});
