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


// Mediatypes
describe('mediaTypes()', () => {

    it('returns */* when header is missing', (done) => {

        const mediaTypes = Accept.mediaTypes();
        expect(mediaTypes).to.deep.equal(['*/*']);
        done();
    });

    it('parses header', (done) => {

        const mediaTypes = Accept.mediaTypes('text/plain, application/json;q=0.5, text/html, */*;q=0.1');
        expect(mediaTypes).to.deep.equal(['text/plain', 'text/html', 'application/json', '*/*']);
        done();
    });

    it('returns empty array when everything is disallowed', (done) => {

        const mediaTypes = Accept.mediaTypes('*/*;q=0');
        expect(mediaTypes).to.deep.equal([]);
        done();
    });

    it('respects disallows', (done) => {

        const mediaTypes = Accept.mediaTypes('text/plain, application/json;q=0.5, text/html, text/drop;q=0');
        expect(mediaTypes).to.deep.equal(['text/plain', 'text/html', 'application/json']);
        done();
    });

    it('orders by weight', (done) => {

        const mediaTypes = Accept.mediaTypes('application/json;q=0.2, text/html');
        expect(mediaTypes).to.deep.equal(['text/html', 'application/json']);
        done();
    });

    it('orders most specific to least specific', (done) => {

        const mediaTypes = Accept.mediaTypes('text/*, text/plain, text/plain;format=flowed, */*');
        expect(mediaTypes).to.deep.equal(['text/plain;format=flowed', 'text/plain', 'text/*', '*/*']);
        done();
    });

    it('keeps wildcard behind more specific', (done) => {

        const mediaTypes = Accept.mediaTypes('text/html, text/*');
        expect(mediaTypes).to.deep.equal(['text/html', 'text/*']);
        done();
    });

    it('keeps the order of two media types with extensions', (done) => {

        const mediaTypes = Accept.mediaTypes('text/html;level=1, text/html;level=2');
        expect(mediaTypes).to.deep.equal(['text/html;level=1', 'text/html;level=2']);
        done();
    });

    it('invalid header returns */*', (done) => {

        const mediaTypes = Accept.mediaTypes('ab');
        expect(mediaTypes).to.deep.equal([]);
        done();
    });

    it('invalid weight is ignored', (done) => {

        const mediaTypes = Accept.mediaTypes('text/html;q=0.0001, text/plain, text/csv;q=1.1');
        expect(mediaTypes).to.deep.equal(['text/html', 'text/plain', 'text/csv']);
        done();
    });
});
