'use strict';

// Load modules

const Code = require('code');
const Lab = require('lab');
const Content = require('..');


// Declare internals

const internals = {};


// Test shortcuts

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;


describe('type()', () => {

    it('parses header', (done) => {

        const type = Content.type('application/json; some=property; and="another"');
        expect(type.isBoom).to.not.exist();
        expect(type.mime).to.equal('application/json');
        expect(type.boundary).to.not.exist();
        done();
    });

    it('parses header (only type)', (done) => {

        const type = Content.type('application/json');
        expect(type.isBoom).to.not.exist();
        expect(type.mime).to.equal('application/json');
        expect(type.boundary).to.not.exist();
        done();
    });

    it('parses header (boundary)', (done) => {

        const type = Content.type('application/json; boundary=abcdefghijklm');
        expect(type.isBoom).to.not.exist();
        expect(type.mime).to.equal('application/json');
        expect(type.boundary).to.equal('abcdefghijklm');
        done();
    });

    it('parses header (quoted boundary)', (done) => {

        const type = Content.type('application/json; boundary="abcdefghijklm"');
        expect(type.isBoom).to.not.exist();
        expect(type.mime).to.equal('application/json');
        expect(type.boundary).to.equal('abcdefghijklm');
        done();
    });

    it('errors on invalid header', (done) => {

        const type = Content.type('application/json; some');
        expect(type.isBoom).to.exist();
        done();
    });

    it('errors on multipart missing boundary', (done) => {

        const type = Content.type('multipart/form-data');
        expect(type.isBoom).to.exist();
        done();
    });
});

describe('disposition()', () => {

    it('parses header', (done) => {

        const header = 'form-data; name="file"; filename=file.jpg';

        expect(Content.disposition(header)).to.deep.equal({ name: 'file', filename: 'file.jpg' });
        done();
    });

    it('parses header (empty filename)', (done) => {

        const header = 'form-data; name="file"; filename=""';

        expect(Content.disposition(header)).to.deep.equal({ name: 'file', filename: '' });
        done();
    });

    it('handles language filename', (done) => {

        const header = 'form-data; name="file"; filename*=utf-8\'en\'with%20space';

        expect(Content.disposition(header)).to.deep.equal({ name: 'file', filename: 'with space' });
        done();
    });

    it('errors on invalid language filename', (done) => {

        const header = 'form-data; name="file"; filename*=steve';

        expect(Content.disposition(header).message).to.equal('Invalid content-disposition header format includes invalid parameters');
        done();
    });

    it('errors on invalid format', (done) => {

        const header = 'steve';

        expect(Content.disposition(header).message).to.equal('Invalid content-disposition header format');
        done();
    });

    it('errors on missing header', (done) => {

        expect(Content.disposition('').message).to.equal('Missing content-disposition header');
        done();
    });

    it('errors on missing parameters', (done) => {

        const header = 'form-data';

        expect(Content.disposition(header).message).to.equal('Invalid content-disposition header missing parameters');
        done();
    });

    it('errors on missing language value', (done) => {

        const header = 'form-data; name="file"; filename*=';

        expect(Content.disposition(header).message).to.equal('Invalid content-disposition header format includes invalid parameters');
        done();
    });

    it('errors on invalid percent encoded language value', (done) => {

        const header = 'form-data; name="file"; filename*=utf-8\'en\'with%vxspace';

        expect(Content.disposition(header).message).to.equal('Invalid content-disposition header format includes invalid parameters');
        done();
    });

    it('errors on missing name', (done) => {

        const header = 'form-data; filename=x';

        expect(Content.disposition(header).message).to.equal('Invalid content-disposition header missing name parameter');
        done();
    });
});
