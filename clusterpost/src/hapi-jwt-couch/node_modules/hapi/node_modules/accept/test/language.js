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


describe('language()', () => {

    it('parses the header', (done) => {

        const language = Accept.language('da, en-GB, en');
        expect(language).to.equal('da');
        done();
    });

    it('respects weights', (done) => {

        const language = Accept.language('en;q=0.6, en-GB;q=0.8');
        expect(language).to.equal('en-GB');
        done();
    });

    it('requires the preferences parameter to be an array', (done) => {

        expect(() => {

            Accept.language('en;q=0.6, en-GB;q=0.8', 'en');
        }).to.throw('Preferences must be an array');
        done();
    });

    it('returns empty string with header is empty', (done) => {

        const language = Accept.language('');
        expect(language).to.equal('');
        done();
    });

    it('returns empty string if header is missing', (done) => {

        const language = Accept.language();
        expect(language).to.equal('');
        done();
    });

    it('ignores an empty preferences array', (done) => {

        const language = Accept.language('da, en-GB, en', []);
        expect(language).to.equal('da');
        done();
    });

    it('returns empty string if none of the preferences match', (done) => {

        const language = Accept.language('da, en-GB, en', ['es']);
        expect(language).to.equal('');
        done();
    });

    it('returns first preference if header has *', (done) => {

        const language = Accept.language('da, en-GB, en, *', ['en-US']);
        expect(language).to.equal('en-US');
        done();
    });

    it('returns first found preference that header includes', (done) => {

        const language = Accept.language('da, en-GB, en', ['en-US', 'en-GB']);
        expect(language).to.equal('en-GB');
        done();
    });

    it('returns preference with highest specificity', (done) => {

        const language = Accept.language('da, en-GB, en', ['en', 'en-GB']);
        expect(language).to.equal('en-GB');
        done();
    });

    it('return language with heighest weight', (done) => {

        const language = Accept.language('da;q=0.5, en;q=1', ['da', 'en']);
        expect(language).to.equal('en');
        done();
    });

    it('ignores preference case when matching', (done) => {

        const language = Accept.language('da, en-GB, en', ['en-us', 'en-gb']); // en-GB vs en-gb
        expect(language).to.equal('en-GB');
        done();
    });
});


describe('languages()', () => {

    it('parses the header', (done) => {

        const languages = Accept.languages('da, en-GB, en');
        expect(languages).to.deep.equal(['da', 'en-GB', 'en']);
        done();
    });

    it('orders by weight(q)', (done) => {

        const languages = Accept.languages('da, en;q=0.7, en-GB;q=0.8');
        expect(languages).to.deep.equal(['da', 'en-GB', 'en']);
        done();
    });

    it('maintains case', (done) => {

        const languages = Accept.languages('da, en-GB, en');
        expect(languages).to.deep.equal(['da', 'en-GB', 'en']);
        done();
    });

    it('drops zero weighted charsets', (done) => {

        const languages = Accept.languages('da, en-GB, es;q=0, en');
        expect(languages).to.deep.equal(['da', 'en-GB', 'en']);
        done();
    });

    it('ignores invalid weights', (done) => {

        const languages = Accept.languages('da, en-GB;q=1.1, es;q=a, en;q=0.0001');
        expect(languages).to.deep.equal(['da', 'en-GB', 'es', 'en']);
        done();
    });

    it('return empty array when no header is present', (done) => {

        const languages = Accept.languages();
        expect(languages).to.deep.equal([]);
        done();
    });

    it('return empty array when header is empty', (done) => {

        const languages = Accept.languages('');
        expect(languages).to.deep.equal([]);
        done();
    });
});
