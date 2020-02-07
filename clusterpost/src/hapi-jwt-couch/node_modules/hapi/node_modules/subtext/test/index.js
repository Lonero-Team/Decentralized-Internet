'use strict';

// Load modules

const Domain = require('domain');
const Fs = require('fs');
const Http = require('http');
const Path = require('path');
const Stream = require('stream');
const Zlib = require('zlib');
const Code = require('code');
const FormData = require('form-data');
const Lab = require('lab');
const Subtext = require('..');
const Wreck = require('wreck');


// Declare internals

const internals = {};


// Test shortcuts

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;


describe('parse()', () => {

    it('returns a raw body', (done) => {

        const payload = '{"x":"1","y":"2","z":"3"}';
        const request = Wreck.toReadableStream(payload);
        request.headers = {
            'content-type': 'application/json'
        };

        Subtext.parse(request, null, { parse: false, output: 'data' }, (err, parsed) => {

            expect(err).to.not.exist();
            expect(parsed.mime).to.equal('application/json');
            expect(Buffer.isBuffer(parsed.payload)).to.be.true();
            expect(parsed.payload.toString()).to.equal(payload);
            done();
        });
    });

    it('returns a parsed body', (done) => {

        const payload = '{"x":"1","y":"2","z":"3"}';
        const request = Wreck.toReadableStream(payload);
        request.headers = {
            'content-type': 'application/json'
        };

        Subtext.parse(request, null, { parse: true, output: 'data' }, (err, parsed) => {

            expect(err).to.not.exist();
            expect(parsed.mime).to.equal('application/json');
            expect(parsed.payload).to.deep.equal(JSON.parse(payload));
            done();
        });
    });

    it('returns a parsed body as stream', (done) => {

        const payload = '{"x":"1","y":"2","z":"3"}';
        const request = Wreck.toReadableStream(payload);
        request.headers = {
            'content-type': 'application/json'
        };

        Subtext.parse(request, null, { parse: true, output: 'stream' }, (err, parsed) => {

            expect(err).to.not.exist();
            expect(parsed.mime).to.equal('application/json');
            Wreck.read(parsed.payload, null, (err, result) => {

                expect(err).to.not.exist();
                expect(result.toString()).to.equal(payload);
                done();
            });
        });
    });

    it('returns a raw body as stream', (done) => {

        const payload = '{"x":"1","y":"2","z":"3"}';
        const request = Wreck.toReadableStream(payload);
        request.headers = {
            'content-type': 'application/json'
        };

        Subtext.parse(request, null, { parse: false, output: 'stream' }, (err, parsed) => {

            expect(err).to.not.exist();
            expect(parsed.mime).to.equal('application/json');
            Wreck.read(parsed.payload, null, (err, result) => {

                expect(err).to.not.exist();
                expect(result.toString()).to.equal(payload);
                done();
            });
        });
    });

    it('returns a parsed body (json-derived media type)', (done) => {

        const payload = '{"x":"1","y":"2","z":"3"}';
        const request = Wreck.toReadableStream(payload);
        request.headers = {
            'content-type': 'application/json-patch+json'
        };

        Subtext.parse(request, null, { parse: true, output: 'data' }, (err, parsed) => {

            expect(err).to.not.exist();
            expect(parsed.mime).to.equal('application/json-patch+json');
            expect(parsed.payload).to.deep.equal(JSON.parse(payload));
            done();
        });
    });

    it('returns an empty parsed body', (done) => {

        const payload = '';
        const request = Wreck.toReadableStream(payload);
        request.headers = {
            'content-type': 'application/json'
        };

        Subtext.parse(request, null, { parse: true, output: 'data' }, (err, parsed) => {

            expect(err).to.not.exist();
            expect(parsed.mime).to.equal('application/json');
            expect(parsed.payload).to.equal(null);
            done();
        });
    });

    it('returns an empty string', (done) => {

        const payload = '';
        const request = Wreck.toReadableStream(payload);
        request.headers = {
            'content-type': 'text/plain'
        };

        Subtext.parse(request, null, { parse: true, output: 'data' }, (err, parsed) => {

            expect(err).to.not.exist();
            expect(parsed.payload).to.equal('');
            done();
        });
    });

    it('errors on invalid content type header', (done) => {

        const payload = '{"x":"1","y":"2","z":"3"}';
        const request = Wreck.toReadableStream(payload);
        request.headers = {
            'content-type': 'steve'
        };

        Subtext.parse(request, null, { parse: true, output: 'data' }, (err, parsed) => {

            expect(err).to.exist();
            expect(err.message).to.equal('Invalid content-type header');
            done();
        });
    });

    it('errors on unsupported content type', (done) => {

        const payload = '{"x":"1","y":"2","z":"3"}';
        const request = Wreck.toReadableStream(payload);
        request.headers = {
            'content-type': 'james/bond'
        };

        Subtext.parse(request, null, { parse: true, output: 'data' }, (err, parsed) => {

            expect(err).to.exist();
            expect(err.message).to.equal('Unsupported Media Type');
            expect(parsed.payload).to.be.null();
            done();
        });
    });

    it('errors when content-length header greater than maxBytes', (done) => {

        const payload = '{"x":"1","y":"2","z":"3"}';
        const request = Wreck.toReadableStream(payload);
        request.headers = {
            'content-length': '50',
            'content-type': 'application/json'
        };

        Subtext.parse(request, null, { parse: false, output: 'data', maxBytes: 10 }, (err, parsed) => {

            expect(err).to.exist();
            expect(err.message).to.equal('Payload content length greater than maximum allowed: 10');
            done();
        });
    });

    it('limits maxBytes when content-length header missing', (done) => {

        const payload = '{"x":"1","y":"2","z":"3"}';
        const request = Wreck.toReadableStream(payload);
        request.headers = {
            'content-type': 'application/json'
        };
        request.destroy = function () { };

        Subtext.parse(request, null, { parse: false, output: 'data', maxBytes: 10 }, (err, parsed) => {

            expect(err).to.exist();
            expect(err.message).to.equal('Payload content length greater than maximum allowed: 10');
            done();
        });
    });

    it('errors on invalid JSON payload', (done) => {

        const payload = '{"x":"1","y":"2","z":"3"';
        const request = Wreck.toReadableStream(payload);
        request.headers = {
            'content-type': 'application/json'
        };

        Subtext.parse(request, null, { parse: true, output: 'data' }, (err, parsed) => {

            expect(err).to.exist();
            expect(err.message).to.equal('Invalid request payload JSON format');
            done();
        });
    });

    it('peeks at the unparsed stream of a parsed body', (done) => {

        const payload = '{"x":"1","y":"2","z":"3"}';
        const request = Wreck.toReadableStream(payload);
        request.headers = {
            'content-type': 'application/json'
        };

        let raw = '';
        const tap = new Stream.Transform();
        tap._transform = function (chunk, encoding, callback) {

            raw = raw + chunk.toString();
            this.push(chunk, encoding);
            callback();
        };

        Subtext.parse(request, tap, { parse: true, output: 'data' }, (err, parsed) => {

            expect(err).to.not.exist();
            expect(parsed.payload).to.deep.equal(JSON.parse(payload));
            expect(raw).to.equal(payload);
            done();
        });
    });

    it('peeks at the unparsed stream of an unparsed body', (done) => {

        const payload = '{"x":"1","y":"2","z":"3"}';
        const request = Wreck.toReadableStream(payload);
        request.headers = {
            'content-type': 'application/json'
        };

        let raw = '';
        const tap = new Stream.Transform();
        tap._transform = function (chunk, encoding, callback) {

            raw = raw + chunk.toString();
            this.push(chunk, encoding);
            callback();
        };

        Subtext.parse(request, tap, { parse: false, output: 'data' }, (err, parsed) => {

            expect(err).to.not.exist();
            expect(parsed.payload.toString()).to.deep.equal(payload);
            expect(raw).to.equal(payload);
            done();
        });
    });

    it('saves file', (done) => {

        const request = Wreck.toReadableStream('payload');
        request.headers = {
            'content-type': 'application/json'
        };

        Subtext.parse(request, null, { parse: false, output: 'file' }, (err, parsed) => {

            expect(err).to.not.exist();

            const receivedContents = Fs.readFileSync(parsed.payload.path);
            Fs.unlinkSync(parsed.payload.path);
            expect(receivedContents.toString()).to.equal('payload');
            done();
        });
    });

    it('saves a file after content decoding', (done) => {

        const path = Path.join(__dirname, './file/image.jpg');
        const sourceContents = Fs.readFileSync(path);
        const stats = Fs.statSync(path);

        Zlib.gzip(sourceContents, (err, compressed) => {

            expect(err).to.not.exist();
            const request = Wreck.toReadableStream(compressed);
            request.headers = {
                'content-encoding': 'gzip'
            };

            Subtext.parse(request, null, { parse: true, output: 'file' }, (err, parsed) => {

                expect(err).to.not.exist();

                const receivedContents = Fs.readFileSync(parsed.payload.path);
                Fs.unlinkSync(parsed.payload.path);
                expect(receivedContents).to.deep.equal(sourceContents);
                expect(parsed.payload.bytes).to.equal(stats.size);
                done();
            });
        });
    });

    it('saves a file ignoring content decoding when parse is false', (done) => {

        const path = Path.join(__dirname, './file/image.jpg');
        const sourceContents = Fs.readFileSync(path);

        Zlib.gzip(sourceContents, (err, compressed) => {

            expect(err).to.not.exist();
            const request = Wreck.toReadableStream(compressed);
            request.headers = {
                'content-encoding': 'gzip',
                'content-type': 'application/json'
            };

            Subtext.parse(request, null, { parse: false, output: 'file' }, (err, parsed) => {

                expect(err).to.not.exist();

                const receivedContents = Fs.readFileSync(parsed.payload.path);
                Fs.unlinkSync(parsed.payload.path);
                expect(receivedContents).to.deep.equal(compressed);
                done();
            });
        });
    });

    it('errors on invalid upload directory (parse false)', (done) => {

        const request = Wreck.toReadableStream('payload');
        request.headers = {
            'content-type': 'application/json'
        };

        Subtext.parse(request, null, { parse: false, output: 'file', uploads: '/a/b/c/no/such/folder' }, (err, parsed) => {

            expect(err).to.exist();
            expect(err.message).to.contain('ENOENT');
            done();
        });
    });

    it('errors on invalid upload directory (parse true)', (done) => {

        const request = Wreck.toReadableStream('payload');
        request.headers = {
            'content-type': 'application/json'
        };

        Subtext.parse(request, null, { parse: true, output: 'file', uploads: '/a/b/c/no/such/folder' }, (err, parsed) => {

            expect(err).to.exist();
            expect(err.message).to.contain('ENOENT');
            done();
        });
    });

    it('processes application/octet-stream', (done) => {

        const payload = '{"x":"1","y":"2","z":"3"}';
        const request = Wreck.toReadableStream(payload);
        request.headers = {
            'content-type': 'application/octet-stream'
        };

        Subtext.parse(request, null, { parse: true, output: 'data' }, (err, parsed) => {

            expect(err).to.not.exist();
            expect(parsed.mime).to.equal('application/octet-stream');
            expect(Buffer.isBuffer(parsed.payload)).to.be.true();
            expect(parsed.payload.toString()).to.equal(payload);
            done();
        });
    });

    it('defaults to application/octet-stream', (done) => {

        const payload = '{"x":"1","y":"2","z":"3"}';
        const request = Wreck.toReadableStream(payload);
        request.headers = {};

        Subtext.parse(request, null, { parse: true, output: 'data' }, (err, parsed) => {

            expect(err).to.not.exist();
            expect(parsed.mime).to.equal('application/octet-stream');
            expect(Buffer.isBuffer(parsed.payload)).to.be.true();
            expect(parsed.payload.toString()).to.equal(payload);
            done();
        });
    });

    it('returns null on empty payload and application/octet-stream', (done) => {

        const payload = '';
        const request = Wreck.toReadableStream(payload);
        request.headers = {};

        Subtext.parse(request, null, { parse: true, output: 'data' }, (err, parsed) => {

            expect(err).to.not.exist();
            expect(parsed.mime).to.equal('application/octet-stream');
            expect(parsed.payload).to.be.null();
            done();
        });
    });

    it('overrides content-type', (done) => {

        const payload = '{"x":"1","y":"2","z":"3"}';
        const request = Wreck.toReadableStream(payload);
        request.headers = {
            'content-type': 'text/plain'
        };

        Subtext.parse(request, null, { parse: true, output: 'data', override: 'application/json' }, (err, parsed) => {

            expect(err).to.not.exist();
            expect(parsed.mime).to.equal('application/json');
            expect(parsed.payload).to.deep.equal(JSON.parse(payload));
            done();
        });
    });

    it('custom default content-type', (done) => {

        const payload = '{"x":"1","y":"2","z":"3"}';
        const request = Wreck.toReadableStream(payload);
        request.headers = {};

        Subtext.parse(request, null, { parse: true, output: 'data', defaultContentType: 'application/json' }, (err, parsed) => {

            expect(err).to.not.exist();
            expect(parsed.mime).to.equal('application/json');
            expect(parsed.payload).to.deep.equal(JSON.parse(payload));
            done();
        });
    });

    it('returns a parsed text payload', (done) => {

        const payload = '{"x":"1","y":"2","z":"3"}';
        const request = Wreck.toReadableStream(payload);
        request.headers = {
            'content-type': 'text/plain'
        };

        Subtext.parse(request, null, { parse: true, output: 'data' }, (err, parsed) => {

            expect(err).to.not.exist();
            expect(parsed.mime).to.equal('text/plain');
            expect(parsed.payload).to.deep.equal(payload);
            done();
        });
    });

    it('parses an allowed content-type', (done) => {

        const payload = '{"x":"1","y":"2","z":"3"}';
        const request = Wreck.toReadableStream(payload);
        request.headers = {
            'content-type': 'text/plain'
        };

        Subtext.parse(request, null, { parse: true, output: 'data', allow: 'text/plain' }, (err, parsed) => {

            expect(err).to.not.exist();
            expect(parsed.mime).to.equal('text/plain');
            expect(parsed.payload).to.deep.equal(payload);
            done();
        });
    });

    it('parses an allowed content-type (array)', (done) => {

        const payload = '{"x":"1","y":"2","z":"3"}';
        const request = Wreck.toReadableStream(payload);
        request.headers = {
            'content-type': 'text/plain'
        };

        Subtext.parse(request, null, { parse: true, output: 'data', allow: ['text/plain'] }, (err, parsed) => {

            expect(err).to.not.exist();
            expect(parsed.mime).to.equal('text/plain');
            expect(parsed.payload).to.deep.equal(payload);
            done();
        });
    });

    it('errors on an unallowed content-type', (done) => {

        const payload = '{"x":"1","y":"2","z":"3"}';
        const request = Wreck.toReadableStream(payload);
        request.headers = {
            'content-type': 'text/plain'
        };

        Subtext.parse(request, null, { parse: true, output: 'data', allow: 'application/json' }, (err, parsed) => {

            expect(err).to.exist();
            expect(err.message).to.equal('Unsupported Media Type');
            done();
        });
    });

    it('errors on an unallowed content-type (array)', (done) => {

        const payload = '{"x":"1","y":"2","z":"3"}';
        const request = Wreck.toReadableStream(payload);
        request.headers = {
            'content-type': 'text/plain'
        };

        Subtext.parse(request, null, { parse: true, output: 'data', allow: ['application/json'] }, (err, parsed) => {

            expect(err).to.exist();
            expect(err.message).to.equal('Unsupported Media Type');
            done();
        });
    });

    it('parses form encoded payload', (done) => {

        const payload = 'x=abc';
        const request = Wreck.toReadableStream(payload);
        request.headers = {
            'content-type': 'application/x-www-form-urlencoded'
        };

        Subtext.parse(request, null, { parse: true, output: 'data' }, (err, parsed) => {

            expect(err).to.not.exist();
            expect(parsed.mime).to.equal('application/x-www-form-urlencoded');
            expect(parsed.payload.x).to.equal('abc');
            done();
        });
    });

    it('parses empty form encoded payload', (done) => {

        const payload = '';
        const request = Wreck.toReadableStream(payload);
        request.headers = {
            'content-type': 'application/x-www-form-urlencoded'
        };

        Subtext.parse(request, null, { parse: true, output: 'data' }, (err, parsed) => {

            expect(err).to.not.exist();
            expect(parsed.mime).to.equal('application/x-www-form-urlencoded');
            expect(parsed.payload).to.deep.equal({});
            done();
        });
    });

    it('errors on malformed zipped payload', (done) => {

        const payload = '7d8d78347h8347d58w347hd58w374d58w37h5d8w37hd4';
        const request = Wreck.toReadableStream(payload);
        request.headers = {
            'content-encoding': 'gzip',
            'content-type': 'application/json'
        };

        Subtext.parse(request, null, { parse: true, output: 'data' }, (err, parsed) => {

            expect(err).to.exist();
            expect(err.message).to.equal('Invalid compressed payload');
            done();
        });
    });

    it('errors on malformed zipped payload (parse gunzip only)', (done) => {

        const payload = '7d8d78347h8347d58w347hd58w374d58w37h5d8w37hd4';
        const request = Wreck.toReadableStream(payload);
        request.headers = {
            'content-encoding': 'gzip',
            'content-type': 'application/json'
        };

        Subtext.parse(request, null, { parse: 'gunzip', output: 'data' }, (err, parsed) => {

            expect(err).to.exist();
            expect(err.message).to.equal('Invalid compressed payload');
            done();
        });
    });

    it('parses a gzipped payload', (done) => {

        const payload = '{"x":"1","y":"2","z":"3"}';
        Zlib.gzip(payload, (err, compressed) => {

            expect(err).to.not.exist();
            const request = Wreck.toReadableStream(compressed);
            request.headers = {
                'content-encoding': 'gzip',
                'content-type': 'application/json'
            };

            Subtext.parse(request, null, { parse: true, output: 'data' }, (err, parsed) => {

                expect(err).to.not.exist();
                expect(parsed.payload).to.deep.equal(JSON.parse(payload));
                done();
            });
        });
    });

    it('unzips payload without parsing', (done) => {

        const payload = '{"x":"1","y":"2","z":"3"}';
        Zlib.gzip(payload, (err, compressed) => {

            expect(err).to.not.exist();
            const request = Wreck.toReadableStream(compressed);
            request.headers = {
                'content-encoding': 'gzip',
                'content-type': 'application/json'
            };

            Subtext.parse(request, null, { parse: 'gunzip', output: 'data' }, (err, parsed) => {

                expect(err).to.not.exist();
                expect(parsed.payload.toString()).to.equal(payload);
                done();
            });
        });
    });

    it('parses a deflated payload', (done) => {

        const payload = '{"x":"1","y":"2","z":"3"}';
        Zlib.deflate(payload, (err, compressed) => {

            expect(err).to.not.exist();
            const request = Wreck.toReadableStream(compressed);
            request.headers = {
                'content-encoding': 'deflate',
                'content-type': 'application/json'
            };

            Subtext.parse(request, null, { parse: true, output: 'data' }, (err, parsed) => {

                expect(err).to.not.exist();
                expect(parsed.payload).to.deep.equal(JSON.parse(payload));
                done();
            });
        });
    });

    it('deflates payload without parsing', (done) => {

        const payload = '{"x":"1","y":"2","z":"3"}';
        Zlib.deflate(payload, (err, compressed) => {

            expect(err).to.not.exist();
            const request = Wreck.toReadableStream(compressed);
            request.headers = {
                'content-encoding': 'deflate',
                'content-type': 'application/json'
            };

            Subtext.parse(request, null, { parse: 'gunzip', output: 'data' }, (err, parsed) => {

                expect(err).to.not.exist();
                expect(parsed.payload.toString()).to.equal(payload);
                done();
            });
        });
    });

    it('parses a multipart payload', (done) => {

        const payload =
                '--AaB03x\r\n' +
                'content-disposition: form-data; name="x"\r\n' +
                '\r\n' +
                'First\r\n' +
                '--AaB03x\r\n' +
                'content-disposition: form-data; name="x"\r\n' +
                '\r\n' +
                'Second\r\n' +
                '--AaB03x\r\n' +
                'content-disposition: form-data; name="x"\r\n' +
                '\r\n' +
                'Third\r\n' +
                '--AaB03x\r\n' +
                'content-disposition: form-data; name="field1"\r\n' +
                '\r\n' +
                'Joe Blow\r\nalmost tricked you!\r\n' +
                '--AaB03x\r\n' +
                'content-disposition: form-data; name="field1"\r\n' +
                '\r\n' +
                'Repeated name segment\r\n' +
                '--AaB03x\r\n' +
                'content-disposition: form-data; name="pics"; filename="file1.txt"\r\n' +
                'Content-Type: text/plain\r\n' +
                '\r\n' +
                '... contents of file1.txt ...\r\r\n' +
                '--AaB03x--\r\n';

        const request = Wreck.toReadableStream(payload);
        request.headers = {
            'content-type': 'multipart/form-data; boundary=AaB03x'
        };

        Subtext.parse(request, null, { parse: true, output: 'data' }, (err, parsed) => {

            expect(err).to.not.exist();
            expect(parsed.payload).to.deep.equal({
                x: ['First', 'Second', 'Third'],
                field1: ['Joe Blow\r\nalmost tricked you!', 'Repeated name segment'],
                pics: '... contents of file1.txt ...\r'
            });

            done();
        });
    });

    it('parses a multipart payload (ignores unknown mime type)', (done) => {

        const payload =
                '--AaB03x\r\n' +
                'content-disposition: form-data; name="x"\r\n' +
                '\r\n' +
                'First\r\n' +
                '--AaB03x\r\n' +
                'content-disposition: form-data; name="x"\r\n' +
                '\r\n' +
                'Second\r\n' +
                '--AaB03x\r\n' +
                'content-disposition: form-data; name="x"\r\n' +
                '\r\n' +
                'Third\r\n' +
                '--AaB03x\r\n' +
                'content-disposition: form-data; name="field1"\r\n' +
                '\r\n' +
                'Joe Blow\r\nalmost tricked you!\r\n' +
                '--AaB03x\r\n' +
                'content-disposition: form-data; name="field1"\r\n' +
                '\r\n' +
                'Repeated name segment\r\n' +
                '--AaB03x\r\n' +
                'content-disposition: form-data; name="pics"; filename="file1.txt"\r\n' +
                'Content-Type: unknown/X\r\n' +
                '\r\n' +
                '... contents of file1.txt ...\r\r\n' +
                '--AaB03x--\r\n';

        const request = Wreck.toReadableStream(payload);
        request.headers = {
            'content-type': 'multipart/form-data; boundary=AaB03x'
        };

        Subtext.parse(request, null, { parse: true, output: 'data' }, (err, parsed) => {

            expect(err).to.not.exist();
            expect(parsed.payload).to.deep.equal({
                x: ['First', 'Second', 'Third'],
                field1: ['Joe Blow\r\nalmost tricked you!', 'Repeated name segment'],
                pics: new Buffer('... contents of file1.txt ...\r')
            });

            done();
        });
    });

    it('parses a multipart payload (empty file)', (done) => {

        const payload =
                '--AaB03x\r\n' +
                'content-disposition: form-data; name="pics"; filename="file1.txt"\r\n' +
                'Content-Type: text/plain\r\n' +
                '\r\n' +
                '\r\n' +
                '--AaB03x--\r\n';

        const request = Wreck.toReadableStream(payload);
        request.headers = {
            'content-type': 'multipart/form-data; boundary=AaB03x'
        };

        Subtext.parse(request, null, { parse: true, output: 'data' }, (err, parsed) => {

            expect(err).to.not.exist();
            expect(parsed.payload.pics).to.deep.equal({});
            done();
        });
    });

    it('errors on an invalid multipart header (missing boundary)', (done) => {

        const payload =
                '--AaB03x\r\n' +
                'content-disposition: form-data; name="x"\r\n' +
                '\r\n' +
                'First\r\n' +
                '--AaB03x\r\n' +
                'content-disposition: form-data; name="x"\r\n' +
                '\r\n' +
                'Second\r\n' +
                '--AaB03x\r\n' +
                'content-disposition: form-data; name="x"\r\n' +
                '\r\n' +
                'Third\r\n' +
                '--AaB03x\r\n' +
                'content-disposition: form-data; name="field1"\r\n' +
                '\r\n' +
                'Joe Blow\r\nalmost tricked you!\r\n' +
                '--AaB03x\r\n' +
                'content-disposition: form-data; name="field1"\r\n' +
                '\r\n' +
                'Repeated name segment\r\n' +
                '--AaB03x\r\n' +
                'content-disposition: form-data; name="pics"; filename="file1.txt"\r\n' +
                'Content-Type: text/plain\r\n' +
                '\r\n' +
                '... contents of file1.txt ...\r\r\n' +
                '--AaB03x--\r\n';

        const request = Wreck.toReadableStream(payload);
        request.headers = {
            'content-type': 'multipart/form-data'
        };

        Subtext.parse(request, null, { parse: true, output: 'data' }, (err, parsed) => {

            expect(err).to.exist();
            expect(err.message).to.equal('Invalid content-type header: multipart missing boundary');
            done();
        });
    });

    it('errors on an invalid multipart payload', (done) => {

        const payload =
                '--AaB03x\r\n' +
                'content-disposition: form-data; name="x"\r\n' +
                '\r\n' +
                'First\r\n';

        const request = Wreck.toReadableStream(payload);
        request.headers = {
            'content-type': 'multipart/form-data; boundary=AaB03x'
        };

        Subtext.parse(request, null, { parse: true, output: 'data' }, (err, parsed) => {

            expect(err).to.exist();
            expect(err.message).to.equal('Invalid multipart payload format');
            done();
        });
    });

    it('parses file without content-type', (done) => {

        const payload =
                '--AaB03x\r\n' +
                'content-disposition: form-data; name="pics"; filename="file1.txt"\r\n' +
                '\r\n' +
                '... contents of file1.txt ...\r\r\n' +
                '--AaB03x--\r\n';

        const request = Wreck.toReadableStream(payload);
        request.headers = {
            'content-type': 'multipart/form-data; boundary="AaB03x"'
        };

        Subtext.parse(request, null, { parse: true, output: 'data' }, (err, parsed) => {

            expect(err).to.not.exist();
            expect(parsed.payload.pics.toString()).to.equal('... contents of file1.txt ...\r');
            done();
        });
    });

    it('errors on invalid uploads folder while processing multipart payload', (done) => {

        const payload =
                '--AaB03x\r\n' +
                'content-disposition: form-data; name="pics"; filename="file1.txt"\r\n' +
                '\r\n' +
                '... contents of file1.txt ...\r\r\n' +
                '--AaB03x--\r\n';

        const request = Wreck.toReadableStream(payload);
        request.headers = {
            'content-type': 'multipart/form-data; boundary="AaB03x"'
        };

        Subtext.parse(request, null, { parse: true, output: 'file', uploads: '/no/such/folder/a/b/c' }, (err, parsed) => {

            expect(err).to.exist();
            expect(err.message).to.contain('/no/such/folder/a/b/c');
            done();
        });
    });

    it('parses multiple files as streams', (done) => {

        const payload =
                '--AaB03x\r\n' +
                'content-disposition: form-data; name="files"; filename="file1.txt"\r\n' +
                'Content-Type: text/plain\r\n' +
                '\r\n' +
                'one\r\n' +
                '--AaB03x\r\n' +
                'content-disposition: form-data; name="files"; filename="file2.txt"\r\n' +
                'Content-Type: text/plain\r\n' +
                '\r\n' +
                'two\r\n' +
                '--AaB03x\r\n' +
                'content-disposition: form-data; name="files"; filename="file3.txt"\r\n' +
                'Content-Type: text/plain\r\n' +
                '\r\n' +
                'three\r\n' +
                '--AaB03x--\r\n';

        const request = Wreck.toReadableStream(payload);
        request.headers = {
            'content-type': 'multipart/form-data; boundary="AaB03x"'
        };

        Subtext.parse(request, null, { parse: true, output: 'stream' }, (err, parsed) => {

            expect(err).to.not.exist();
            expect(parsed.payload.files[0].hapi).to.deep.equal({ filename: 'file1.txt', headers: { 'content-disposition': 'form-data; name="files"; filename="file1.txt"', 'content-type': 'text/plain' } });
            expect(parsed.payload.files[1].hapi).to.deep.equal({ filename: 'file2.txt', headers: { 'content-disposition': 'form-data; name="files"; filename="file2.txt"', 'content-type': 'text/plain' } });
            expect(parsed.payload.files[2].hapi).to.deep.equal({ filename: 'file3.txt', headers: { 'content-disposition': 'form-data; name="files"; filename="file3.txt"', 'content-type': 'text/plain' } });

            Wreck.read(parsed.payload.files[1], null, (err, payload2) => {

                expect(err).to.not.exist();
                Wreck.read(parsed.payload.files[0], null, (err, payload1) => {

                    expect(err).to.not.exist();
                    Wreck.read(parsed.payload.files[2], null, (err, payload3) => {

                        expect(err).to.not.exist();
                        expect(payload1.toString()).to.equal('one');
                        expect(payload2.toString()).to.equal('two');
                        expect(payload3.toString()).to.equal('three');
                        done();
                    });
                });
            });
        });
    });

    it('parses a multipart file as file', (done) => {

        const path = Path.join(__dirname, './file/image.jpg');
        const stats = Fs.statSync(path);

        const form = new FormData();
        form.append('my_file', Fs.createReadStream(path));
        form.headers = form.getHeaders();

        Subtext.parse(form, null, { parse: true, output: 'file' }, (err, parsed) => {

            expect(err).to.not.exist();

            expect(parsed.payload.my_file.bytes).to.equal(stats.size);

            const sourceContents = Fs.readFileSync(path);
            const receivedContents = Fs.readFileSync(parsed.payload.my_file.path);
            Fs.unlinkSync(parsed.payload.my_file.path);
            expect(sourceContents).to.deep.equal(receivedContents);
            done();
        });
    });

    it('parses multiple files as files', (done) => {

        const path = Path.join(__dirname, './file/image.jpg');
        const stats = Fs.statSync(path);

        const form = new FormData();
        form.append('file1', Fs.createReadStream(path));
        form.append('file2', Fs.createReadStream(path));
        form.headers = form.getHeaders();

        Subtext.parse(form, null, { parse: true, output: 'file' }, (err, parsed) => {

            expect(err).to.not.exist();
            expect(parsed.payload.file1.bytes).to.equal(stats.size);
            expect(parsed.payload.file2.bytes).to.equal(stats.size);
            Fs.unlinkSync(parsed.payload.file1.path);
            Fs.unlinkSync(parsed.payload.file2.path);
            done();
        });
    });

    it('parses multiple files of different sizes', (done) => {

        const path = Path.join(__dirname, './file/smallimage.png');
        const path2 = Path.join(__dirname, './file/image.jpg');
        const stats = Fs.statSync(path);
        const stats2 = Fs.statSync(path2);

        const form = new FormData();
        form.append('file1', Fs.createReadStream(path));
        form.append('file2', Fs.createReadStream(path2));
        form.headers = form.getHeaders();

        Subtext.parse(form, null, { parse: true, output: 'file' }, (err, parsed) => {

            expect(err).to.not.exist();
            expect(parsed.payload.file1.bytes).to.equal(stats.size);
            expect(parsed.payload.file2.bytes).to.equal(stats2.size);
            Fs.unlinkSync(parsed.payload.file1.path);
            Fs.unlinkSync(parsed.payload.file2.path);
            done();
        });
    });

    it('parses multiple files of different sizes', (done) => {

        const path = Path.join(__dirname, './file/image.jpg');
        const path2 = Path.join(__dirname, './file/smallimage.png');
        const stats = Fs.statSync(path);
        const stats2 = Fs.statSync(path2);

        const form = new FormData();
        form.append('file1', Fs.createReadStream(path));
        form.append('file2', Fs.createReadStream(path2));
        form.headers = form.getHeaders();

        Subtext.parse(form, null, { parse: true, output: 'file' }, (err, parsed) => {

            expect(err).to.not.exist();
            expect(parsed.payload.file1.bytes).to.equal(stats.size);
            expect(parsed.payload.file2.bytes).to.equal(stats2.size);
            Fs.unlinkSync(parsed.payload.file1.path);
            Fs.unlinkSync(parsed.payload.file2.path);
            done();
        });
    });


    it('parses multiple small files', (done) => {

        const path = Path.join(__dirname, './file/smallimage.png');
        const stats = Fs.statSync(path);

        const form = new FormData();
        form.append('file1', Fs.createReadStream(path));
        form.append('file2', Fs.createReadStream(path));
        form.headers = form.getHeaders();

        Subtext.parse(form, null, { parse: true, output: 'file' }, (err, parsed) => {

            expect(err).to.not.exist();
            expect(parsed.payload.file1.bytes).to.equal(stats.size);
            expect(parsed.payload.file2.bytes).to.equal(stats.size);
            Fs.unlinkSync(parsed.payload.file1.path);
            done();
        });
    });


    it('parses multiple larger files', (done) => {

        const path = Path.join(__dirname, './file/image.jpg');
        const stats = Fs.statSync(path);

        const form = new FormData();
        form.append('file1', Fs.createReadStream(path));
        form.append('file2', Fs.createReadStream(path));
        form.headers = form.getHeaders();

        Subtext.parse(form, null, { parse: true, output: 'file' }, (err, parsed) => {

            expect(err).to.not.exist();
            expect(parsed.payload.file1.bytes).to.equal(stats.size);
            expect(parsed.payload.file2.bytes).to.equal(stats.size);
            Fs.unlinkSync(parsed.payload.file1.path);
            Fs.unlinkSync(parsed.payload.file2.path);
            done();
        });
    });

    it('parses multiple files while waiting for last file to be written', { parallel: false }, (done) => {

        const path = Path.join(__dirname, './file/image.jpg');
        const stats = Fs.statSync(path);

        const orig = Fs.createWriteStream;
        Fs.createWriteStream = function () {        // Make the first file write happen faster by bypassing the disk

            Fs.createWriteStream = orig;
            const stream = new Stream.Writable();
            stream._write = (chunk, encoding, callback) => {

                callback();
            };
            stream.once('finish', () => {

                stream.emit('close');
            });
            return stream;
        };

        const form = new FormData();
        form.append('a', Fs.createReadStream(path));
        form.append('b', Fs.createReadStream(path));
        form.headers = form.getHeaders();

        Subtext.parse(form, null, { parse: true, output: 'file' }, (err, parsed) => {

            expect(err).to.not.exist();
            expect(parsed.payload.a.bytes).to.equal(stats.size);
            expect(parsed.payload.b.bytes).to.equal(stats.size);

            // The first file is never written due to createWriteStream() above
            Fs.unlinkSync(parsed.payload.b.path);
            done();
        });
    });

    it('parses a multipart file as data', (done) => {

        const path = Path.join(__dirname, '../package.json');

        const form = new FormData();
        form.append('my_file', Fs.createReadStream(path));
        form.headers = form.getHeaders();

        Subtext.parse(form, null, { parse: true, output: 'data' }, (err, parsed) => {

            expect(err).to.not.exist();
            expect(parsed.payload.my_file.name).to.equal('subtext');
            done();
        });
    });

    it('peeks at multipart in stream mode', (done) => {

        const payload =
                '--AaB03x\r\n' +
                'content-disposition: form-data; name="x"\r\n' +
                '\r\n' +
                'First\r\n' +
                '--AaB03x\r\n' +
                'content-disposition: form-data; name="x"\r\n' +
                '\r\n' +
                'Second\r\n' +
                '--AaB03x\r\n' +
                'content-disposition: form-data; name="x"\r\n' +
                '\r\n' +
                'Third\r\n' +
                '--AaB03x\r\n' +
                'content-disposition: form-data; name="field1"\r\n' +
                '\r\n' +
                'Joe Blow\r\nalmost tricked you!\r\n' +
                '--AaB03x\r\n' +
                'content-disposition: form-data; name="field1"\r\n' +
                '\r\n' +
                'Repeated name segment\r\n' +
                '--AaB03x\r\n' +
                'content-disposition: form-data; name="pics"; filename="file1.txt"\r\n' +
                'Content-Type: text/plain\r\n' +
                '\r\n' +
                '... contents of file1.txt ...\r\r\n' +
                '--AaB03x--\r\n';

        const request = Wreck.toReadableStream(payload);
        request.headers = {
            'content-type': 'multipart/form-data; boundary=AaB03x'
        };

        let raw = '';
        const tap = new Stream.Transform();
        tap._transform = function (chunk, encoding, callback) {

            raw = raw + chunk.toString();
            this.push(chunk, encoding);
            callback();
        };

        Subtext.parse(request, tap, { parse: true, output: 'stream' }, (err, parsed) => {

            expect(err).to.not.exist();
            expect(parsed.payload.x).to.deep.equal(['First', 'Second', 'Third']);
            expect(parsed.payload.field1).to.deep.equal(['Joe Blow\r\nalmost tricked you!', 'Repeated name segment']);
            expect(parsed.payload.pics.hapi.filename).to.equal('file1.txt');
            expect(raw).to.equal(payload);
            done();
        });
    });

    it('parses a file correctly on stream mode', (done) => {

        const path = Path.join(__dirname, './file/image.jpg');
        const fileStream = Fs.createReadStream(path);
        const fileContents = Fs.readFileSync(path);

        const form = new FormData();
        form.append('my_file', fileStream);
        form.headers = form.getHeaders();

        Subtext.parse(form, null, { parse: true, output: 'stream' }, (err, parsed) => {

            expect(err).to.not.exist();

            expect(parsed.payload.my_file.hapi).to.deep.equal({
                filename: 'image.jpg',
                headers: {
                    'content-disposition': 'form-data; name="my_file"; filename="image.jpg"',
                    'content-type': 'image/jpeg'
                }
            });

            Wreck.read(parsed.payload.my_file, null, (err, buffer) => {

                expect(err).to.not.exist();
                expect(fileContents.length).to.equal(buffer.length);
                expect(fileContents.toString('binary') === buffer.toString('binary')).to.equal(true);
                done();
            });
        });
    });

    it('cleans file when stream is aborted', (done) => {

        const path = Path.join(__dirname, 'file');
        const count = Fs.readdirSync(path).length;

        const server = Http.createServer();
        server.on('request', (req, res) => {

            Subtext.parse(req, null, { parse: false, output: 'file', uploads: path }, (err, parsed) => {

                expect(err).to.exist();
                expect(Fs.readdirSync(path).length).to.equal(count);
                done();
            });
        });

        server.listen(0, () => {

            const options = {
                hostname: 'localhost',
                port: server.address().port,
                path: '/',
                method: 'POST',
                headers: { 'content-length': 1000000 }
            };

            const req = Http.request(options, (res) => { });

            req.on('error', () => { });

            const random = new Buffer(100000);
            req.write(random);
            req.write(random);
            setTimeout(() => {

                req.abort();
            }, 10);
        });
    });

    it('avoids catching an error thrown in sync callback', (done) => {

        const payload = '{"x":"1","y":"2","z":"3"}';
        const request = Wreck.toReadableStream(payload);
        request.headers = {
            'content-type': 'application/json'
        };

        const domain = Domain.create();
        domain.once('error', (err) => {

            expect(err.message).to.equal('callback error');
            done();
        });

        domain.run(() => {

            Subtext.parse(request, null, { parse: true, output: 'data' }, (err, parsed) => {

                expect(err).to.not.exist();
                throw new Error('callback error');
            });
        });
    });

    it('will timeout correctly for a multipart payload with output as stream', (done) => {

        const path = Path.join(__dirname, './file/image.jpg');
        const fileStream = Fs.createReadStream(path);

        const form = new FormData();
        form.append('my_file', fileStream);
        form.headers = form.getHeaders();

        Subtext.parse(form, null, { parse: true, output: 'stream', timeout: 1 }, (err, parsed) => {

            expect(err).to.exist();
            expect(err.message).to.equal('Request Time-out');
            expect(err.output.statusCode).to.equal(408);
            done();
        });
    });

    it('will timeout correctly for a multipart payload with output file', (done) => {

        const path = Path.join(__dirname, './file/image.jpg');
        const fileStream = Fs.createReadStream(path);

        const form = new FormData();
        form.append('my_file', fileStream);
        form.headers = form.getHeaders();

        Subtext.parse(form, null, { parse: true, output: 'file', timeout: 1 }, (err, parsed) => {

            expect(err).to.exist();
            expect(err.message).to.equal('Request Time-out');
            expect(err.output.statusCode).to.equal(408);
            done();
        });
    });

    it('errors if the payload size exceeds the byte limit', (done) => {

        const payload =
                '--AaB03x\r\n' +
                'content-disposition: form-data; name="x"\r\n' +
                '\r\n' +
                'First\r\n' +
                '--AaB03x\r\n' +
                'content-disposition: form-data; name="x"\r\n' +
                '\r\n' +
                'Second\r\n' +
                '--AaB03x\r\n' +
                'content-disposition: form-data; name="x"\r\n' +
                '\r\n' +
                'Third\r\n' +
                '--AaB03x\r\n' +
                'content-disposition: form-data; name="field1"\r\n' +
                '\r\n' +
                'Joe Blow\r\nalmost tricked you!\r\n' +
                '--AaB03x\r\n' +
                'content-disposition: form-data; name="field1"\r\n' +
                '\r\n' +
                'Repeated name segment\r\n' +
                '--AaB03x\r\n' +
                'content-disposition: form-data; name="pics"; filename="file1.txt"\r\n' +
                'Content-Type: text/plain\r\n' +
                '\r\n' +
                '... contents of file1.txt ...\r\r\n' +
                '--AaB03x--\r\n';

        const request = Wreck.toReadableStream(payload);
        request.headers = {
            'content-type': 'multipart/form-data; boundary=AaB03x'
        };

        Subtext.parse(request, null, { parse: true, output: 'stream', maxBytes: 10 }, (err, parsed) => {

            expect(err).to.exist();
            done();
        });
    });
});
