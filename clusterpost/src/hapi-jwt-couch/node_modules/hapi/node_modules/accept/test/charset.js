'use strict';

// Load modules

const Accept = require('..');
const Code = require('code');
const Lab = require('lab');


// Declare internals

const internals = {};


// Test shortcuts

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;


// Charset

describe('charset()', () => {

    it('parses header', (done) => {

        const charset = Accept.charset('iso-8859-5, unicode-1-1;q=0.8, *;q=0.001');
        expect(charset.isBoom).to.not.exist();
        expect(charset).to.equal('iso-8859-5');
        done();
    });

    it('respects weights', (done) => {

        const charset = Accept.charset('iso-8859-5; q=0.1, unicode-1-1;q=0.8, *;q=0.001');
        expect(charset.isBoom).to.not.exist();
        expect(charset).to.equal('unicode-1-1');
        done();
    });

    it('requires that preferences parameter must be an array', (done) => {

        expect(() => {

            Accept.charset('iso-8859-5; q=0.1, unicode-1-1;q=0.8, *;q=0.001', 'iso-8859-5');
        }).to.throw('Preferences must be an array');
        done();
    });

    it('returns empty string when there are no charsets', (done) => {

        const charset = Accept.charset('*;q=0');
        expect(charset.isBoom).to.not.exist();
        expect(charset).to.equal('');
        done();
    });

    it('returns first charset when preferences array is empty', (done) => {

        const charset = Accept.charset('iso-8859-5; q=0.1, unicode-1-1;q=0.8, *;q=0.001', []);
        expect(charset.isBoom).to.not.exist();
        expect(charset).to.equal('unicode-1-1');
        done();
    });

    it('looks for top preference', (done) => {

        const charset = Accept.charset('iso-8859-5; q=0.1, unicode-1-1;q=0.8, *;q=0.001', ['iso-8859-5']);
        expect(charset.isBoom).to.not.exist();
        expect(charset).to.equal('iso-8859-5');
        done();
    });

    it('find anything in preferences', (done) => {

        const charset = Accept.charset('iso-8859-5; q=0.1, unicode-1-1;q=0.8', ['utf-8', 'iso-8859-5']);
        expect(charset.isBoom).to.not.exist();
        expect(charset).to.equal('iso-8859-5');
        done();
    });

    it('returns empty string if no preference match is found', (done) => {

        const charset = Accept.charset('iso-8859-5; q=0.1, unicode-1-1;q=0.8', ['utf-8']);
        expect(charset.isBoom).to.not.exist();
        expect(charset).to.equal('');
        done();
    });

    it('accepts any charset preference with *', (done) => {

        const charset = Accept.charset('*;q=0.001', ['utf-8']);
        expect(charset.isBoom).to.not.exist();
        expect(charset).to.equal('utf-8');
        done();
    });

    it('ignores preference case', (done) => {

        const charset = Accept.charset('UTF-8', ['utf-8']);
        expect(charset.isBoom).to.not.exist();
        expect(charset).to.equal('UTF-8');
        done();
    });

    it('obeys disallow with wildcard', (done) => {

        const charset = Accept.charset('*, not-this;q=0, UTF-8;q=0', ['utf-8', 'iso-8859-5']); // utf-8 is disallowed
        expect(charset.isBoom).to.not.exist();
        expect(charset).to.equal('iso-8859-5');
        done();
    });
});


// Charsets
describe('charsets()', () => {

    it('parses header', (done) => {

        const charsets = Accept.charsets('iso-8859-5, unicode-1-1;q=0.8, *;q=0.001');
        expect(charsets.isBoom).to.not.exist();
        expect(charsets).to.deep.equal(['iso-8859-5', 'unicode-1-1', '*']);
        done();
    });

    it('orders by weight(q)', (done) => {

        const charsets = Accept.charsets('iso-8859-5;q=0.5, unicode-1-1;q=0.8');
        expect(charsets.isBoom).to.not.exist();
        expect(charsets).to.deep.equal(['unicode-1-1', 'iso-8859-5']);
        done();
    });

    it('ignores case', (done) => {

        const charsets = Accept.charsets('ISO-8859-5, uNIcode-1-1;q=0.8, *;q=0.001');
        expect(charsets.isBoom).to.not.exist();
        expect(charsets).to.deep.equal(['iso-8859-5', 'unicode-1-1', '*']);
        done();
    });

    it('drops zero weighted charsets', (done) => {

        const charsets = Accept.charsets('iso-8859-5, unicode-1-1;q=0.8, drop-me;q=0');
        expect(charsets.isBoom).to.not.exist();
        expect(charsets).to.deep.equal(['iso-8859-5', 'unicode-1-1']);
        done();
    });

    it('ignores invalid weights', (done) => {

        const charsets = Accept.charsets('too-low;q=0.0001, unicode-1-1;q=0.8, too-high;q=1.1, letter-weight;q=a');
        expect(charsets.isBoom).to.not.exist();
        expect(charsets).to.deep.equal(['too-low', 'too-high', 'letter-weight', 'unicode-1-1']);
        done();
    });

    it('return empty array when no header is present', (done) => {

        const charsets = Accept.charsets();
        expect(charsets.isBoom).to.not.exist();
        expect(charsets).to.deep.equal([]);
        done();
    });

    it('return empty array when header is empty', (done) => {

        const charsets = Accept.charsets('');
        expect(charsets.isBoom).to.not.exist();
        expect(charsets).to.deep.equal([]);
        done();
    });
});
