'use strict';

// Load modules

const Code = require('code');
const Lab = require('lab');
const Regex = require('../lib/regex');


// Declare internals

const internals = {};


// Test shortcuts

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;


describe('Call', () => {

    describe('Regex', () => {

        const pathRegex = Regex.generate();

        describe('validatePath', () => {

            const paths = {
                '/': true,
                '/path': true,
                '/path/': true,
                '/path/to/somewhere': true,
                '/{param}': true,
                '/{param?}': true,
                '/{param*}': true,
                '/{param*5}': true,
                '/path/{param}': true,
                '/path/{param}/to': true,
                '/path/{param?}': true,
                '/path/{param}/to/{some}': true,
                '/path/{param}/to/{some?}': true,
                '/path/{param*2}/to': true,
                '/path/{param*27}/to': true,
                '/path/{param*2}': true,
                '/path/{param*27}': true,
                '/%20path/': true,
                'path': false,
                '/%path/': false,
                '/path/{param*}/to': false,
                '/path/{param*0}/to': false,
                '/path/{param*0}': false,
                '/path/{param*01}/to': false,
                '/path/{param*01}': false,
                '/{param?}/something': false,
                '/{param*03}': false,
                '/{param*3?}': false,
                '/{param*?}': false,
                '/{param*}/': false,
                '/a{p}': true,
                '/{p}b': true,
                '/a{p}b': true,
                '/d/a{p}': true,
                '/d/{p}b': true,
                '/d/a{p}b': true,
                '/a{p}/d': true,
                '/{p}b/d': true,
                '/a{p}b/d': true,
                '/d/a{p}/e': true,
                '/d/{p}b/e': true,
                '/d/a{p}b/e': true,
                '/a{p}.{x}': true,
                '/{p}{x}': false,
                '/a{p}{x}': false,
                '/a{p}{x}b': false,
                '/{p}{x}b': false,
                '/{p?}{x}b': false,
                '/{a}b{c?}d{e}': true,
                '/a{p?}': true,
                '/{p*}d': false,
                '/a{p*3}': false
            };

            const test = function (path, isValid) {

                it('validates the path \'' + path + '\' as ' + (isValid ? 'well-formed' : 'malformed'), (done) => {

                    expect(!!(path.match(pathRegex.validatePath))).to.equal(isValid);
                    done();
                });
            };

            const keys = Object.keys(paths);
            for (let i = 0; i < keys.length; ++i) {
                test(keys[i], paths[keys[i]]);
            }
        });
    });
});
