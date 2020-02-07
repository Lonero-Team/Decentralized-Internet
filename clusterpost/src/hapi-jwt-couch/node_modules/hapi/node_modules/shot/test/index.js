'use strict';

// Load modules

const Util = require('util');
const Stream = require('stream');
const Fs = require('fs');
const Zlib = require('zlib');
const Lab = require('lab');
const Shot = require('../lib');
const Code = require('code');

// Declare internals

const internals = {};


// Test shortcuts

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;


describe('inject()', () => {

    it('returns non-chunked payload', (done) => {

        const output = 'example.com:8080|/hello';

        const dispatch = function (req, res) {

            res.writeHead(200, { 'Content-Type': 'text/plain', 'Content-Length': output.length });
            res.end(req.headers.host + '|' + req.url);
        };

        Shot.inject(dispatch, 'http://example.com:8080/hello', (res) => {

            expect(res.headers.date).to.exist();
            expect(res.headers.connection).to.exist();
            expect(res.headers['transfer-encoding']).to.not.exist();
            expect(res.payload).to.equal(output);
            expect(res.rawPayload.toString()).to.equal('example.com:8080|/hello');
            done();
        });
    });

    it('returns single buffer payload', (done) => {

        const dispatch = function (req, res) {

            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(req.headers.host + '|' + req.url);
        };

        Shot.inject(dispatch, { url: 'http://example.com:8080/hello' }, (res) => {

            expect(res.headers.date).to.exist();
            expect(res.headers.connection).to.exist();
            expect(res.headers['transfer-encoding']).to.equal('chunked');
            expect(res.payload).to.equal('example.com:8080|/hello');
            expect(res.rawPayload.toString()).to.equal('example.com:8080|/hello');
            done();
        });
    });

    it('passes headers', (done) => {

        const dispatch = function (req, res) {

            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(req.headers.super);
        };

        Shot.inject(dispatch, { method: 'get', url: 'http://example.com:8080/hello', headers: { Super: 'duper' } }, (res) => {

            expect(res.payload).to.equal('duper');
            done();
        });
    });

    it('passes remote address', (done) => {

        const dispatch = function (req, res) {

            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(req.connection.remoteAddress);
        };

        Shot.inject(dispatch, { method: 'get', url: 'http://example.com:8080/hello', remoteAddress: '1.2.3.4' }, (res) => {

            expect(res.payload).to.equal('1.2.3.4');
            done();
        });
    });

    it('passes localhost as default remote address', (done) => {

        const dispatch = function (req, res) {

            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(req.connection.remoteAddress);
        };

        Shot.inject(dispatch, { method: 'get', url: 'http://example.com:8080/hello' }, (res) => {

            expect(res.payload).to.equal('127.0.0.1');
            done();
        });
    });

    it('passes host option as host header', (done) => {

        const dispatch = function (req, res) {

            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(req.headers.host);
        };

        Shot.inject(dispatch, { method: 'get', url: '/hello', headers: { host: 'test.example.com' } }, (res) => {

            expect(res.payload).to.equal('test.example.com');
            done();
        });
    });

    it('passes localhost as default host header', (done) => {

        const dispatch = function (req, res) {

            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(req.headers.host);
        };

        Shot.inject(dispatch, { method: 'get', url: '/hello' }, (res) => {

            expect(res.payload).to.equal('localhost:80');
            done();
        });
    });

    it('passes authority as host header', (done) => {

        const dispatch = function (req, res) {

            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(req.headers.host);
        };

        Shot.inject(dispatch, { method: 'get', url: '/hello', authority: 'something' }, (res) => {

            expect(res.payload).to.equal('something');
            done();
        });
    });

    it('passes uri host as host header', (done) => {

        const dispatch = function (req, res) {

            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(req.headers.host);
        };

        Shot.inject(dispatch, { method: 'get', url: 'http://example.com:8080/hello' }, (res) => {

            expect(res.payload).to.equal('example.com:8080');
            done();
        });
    });

    it('includes default http port in host header', (done) => {

        const dispatch = function (req, res) {

            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(req.headers.host);
        };

        Shot.inject(dispatch, 'http://example.com', (res) => {

            expect(res.payload).to.equal('example.com:80');
            done();
        });
    });

    it('includes default https port in host header', (done) => {

        const dispatch = function (req, res) {

            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(req.headers.host);
        };

        Shot.inject(dispatch, 'https://example.com', (res) => {

            expect(res.payload).to.equal('example.com:443');
            done();
        });
    });

    it('optionally accepts an object as url', (done) => {

        const output = 'example.com:8080|/hello?test=1234';

        const dispatch = function (req, res) {

            res.writeHead(200, { 'Content-Type': 'text/plain', 'Content-Length': output.length });
            res.end(req.headers.host + '|' + req.url);
        };

        const url = {
            protocol: 'http',
            hostname: 'example.com',
            port: '8080',
            pathname: 'hello',
            query: {
                test: '1234'
            }
        };

        Shot.inject(dispatch, { url: url }, (res) => {

            expect(res.headers.date).to.exist();
            expect(res.headers.connection).to.exist();
            expect(res.headers['transfer-encoding']).to.not.exist();
            expect(res.payload).to.equal(output);
            done();
        });
    });

    it('leaves user-agent unmodified', (done) => {

        const dispatch = function (req, res) {

            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(req.headers['user-agent']);
        };

        Shot.inject(dispatch, { method: 'get', url: 'http://example.com:8080/hello', headers: { 'user-agent': 'duper' } }, (res) => {

            expect(res.payload).to.equal('duper');
            done();
        });
    });

    it('returns chunked payload', (done) => {

        const dispatch = function (req, res) {

            res.writeHead(200, 'OK');
            res.write('a');
            res.write('b');
            res.end();
        };

        Shot.inject(dispatch, { method: 'get', url: '/' }, (res) => {

            expect(res.headers.date).to.exist();
            expect(res.headers.connection).to.exist();
            expect(res.headers['transfer-encoding']).to.equal('chunked');
            expect(res.payload).to.equal('ab');
            done();
        });
    });

    it('sets trailers in response object', (done) => {

        const dispatch = function (req, res) {

            res.setHeader('Trailer', 'Test');
            res.addTrailers({ 'Test': 123 });
            res.end();
        };

        Shot.inject(dispatch, { method: 'get', url: '/' }, (res) => {

            expect(res.headers.trailer).to.equal('Test');
            expect(res.headers.test).to.be.undefined();
            expect(res.trailers.test).to.equal('123');
            done();
        });
    });

    it('parses zipped payload', (done) => {

        const dispatch = function (req, res) {

            res.writeHead(200, 'OK');
            const stream = Fs.createReadStream('./package.json');
            stream.pipe(Zlib.createGzip()).pipe(res);
        };

        Shot.inject(dispatch, { method: 'get', url: '/' }, (res) => {

            Fs.readFile('./package.json', { encoding: 'utf-8' }, (err, file) => {

                expect(err).to.not.exist();

                Zlib.unzip(res.rawPayload, (err, unzipped) => {

                    expect(err).to.not.exist();
                    expect(unzipped.toString('utf-8')).to.equal(file);
                    done();
                });
            });
        });
    });

    it('returns multi buffer payload', (done) => {

        const dispatch = function (req, res) {

            res.writeHead(200);
            res.write('a');
            res.write(new Buffer('b'));
            res.end();
        };

        Shot.inject(dispatch, { method: 'get', url: '/' }, (res) => {

            expect(res.payload).to.equal('ab');
            done();
        });
    });

    it('returns null payload', (done) => {

        const dispatch = function (req, res) {

            res.writeHead(200, { 'Content-Length': 0 });
            res.end();
        };

        Shot.inject(dispatch, { method: 'get', url: '/' }, (res) => {

            expect(res.payload).to.equal('');
            done();
        });
    });

    it('allows ending twice', (done) => {

        const dispatch = function (req, res) {

            res.writeHead(200, { 'Content-Length': 0 });
            res.end();
            res.end();
        };

        Shot.inject(dispatch, { method: 'get', url: '/' }, (res) => {

            expect(res.payload).to.equal('');
            done();
        });
    });

    it('identifies injection object', (done) => {

        const dispatch = function (req, res) {

            expect(Shot.isInjection(req)).to.equal(true);
            expect(Shot.isInjection(res)).to.equal(true);

            res.writeHead(200, { 'Content-Length': 0 });
            res.end();
        };

        Shot.inject(dispatch, { method: 'get', url: '/' }, (res) => {

            done();
        });
    });

    it('pipes response', (done) => {

        let finished = false;
        const dispatch = function (req, res) {

            res.writeHead(200);
            const stream = internals.getTestStream();

            res.on('finish', () => {

                finished = true;
            });

            stream.pipe(res);
        };

        Shot.inject(dispatch, { method: 'get', url: '/' }, (res) => {

            expect(finished).to.equal(true);
            expect(res.payload).to.equal('hi');
            done();
        });
    });

    it('pipes response with old stream', (done) => {

        let finished = false;
        const dispatch = function (req, res) {

            res.writeHead(200);
            const stream = internals.getTestStream();
            stream.pause();
            const stream2 = new Stream.Readable().wrap(stream);
            stream.resume();

            res.on('finish', () => {

                finished = true;
            });

            stream2.pipe(res);
        };

        Shot.inject(dispatch, { method: 'get', url: '/' }, (res) => {

            expect(finished).to.equal(true);
            expect(res.payload).to.equal('hi');
            done();
        });
    });

    it('echos object payload', (done) => {

        const dispatch = function (req, res) {

            res.writeHead(200, { 'content-type': req.headers['content-type'] });
            req.pipe(res);
        };

        Shot.inject(dispatch, { method: 'post', url: '/test', payload: { a: 1 } }, (res) => {

            expect(res.headers['content-type']).to.equal('application/json');
            expect(res.payload).to.equal('{"a":1}');
            done();
        });
    });

    it('echos buffer payload', (done) => {

        const dispatch = function (req, res) {

            res.writeHead(200, { 'content-type': req.headers['content-type'] });
            req.pipe(res);
        };

        Shot.inject(dispatch, { method: 'post', url: '/test', payload: new Buffer('test!') }, (res) => {

            expect(res.payload).to.equal('test!');
            done();
        });
    });

    it('echos object payload with non-english utf-8 string', (done) => {

        const dispatch = function (req, res) {

            res.writeHead(200, { 'content-type': req.headers['content-type'] });
            req.pipe(res);
        };

        Shot.inject(dispatch, { method: 'post', url: '/test', payload: { a: '½½א' } }, (res) => {

            expect(res.headers['content-type']).to.equal('application/json');
            expect(res.payload).to.equal('{"a":"½½א"}');
            done();
        });
    });

    it('echos object payload without payload', (done) => {

        const dispatch = function (req, res) {

            res.writeHead(200);
            req.pipe(res);
        };

        Shot.inject(dispatch, { method: 'post', url: '/test' }, (res) => {

            expect(res.payload).to.equal('');
            done();
        });
    });

    it('retains content-type header', (done) => {

        const dispatch = function (req, res) {

            res.writeHead(200, { 'content-type': req.headers['content-type'] });
            req.pipe(res);
        };

        Shot.inject(dispatch, { method: 'post', url: '/test', payload: { a: 1 }, headers: { 'content-type': 'something' } }, (res) => {

            expect(res.headers['content-type']).to.equal('something');
            expect(res.payload).to.equal('{"a":1}');
            done();
        });
    });

    it('adds a content-length header if none set when payload specified', (done) => {

        const dispatch = function (req, res) {

            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(req.headers['content-length']);
        };

        Shot.inject(dispatch, { method: 'post', url: '/test', payload: { a: 1 } }, (res) => {

            expect(res.payload).to.equal('{"a":1}'.length.toString());
            done();
        });

    });

    it('retains a content-length header when payload specified', (done) => {

        const dispatch = function (req, res) {

            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(req.headers['content-length']);
        };

        Shot.inject(dispatch, { method: 'post', url: '/test', payload: '', headers: { 'content-length': '10' } }, (res) => {

            expect(res.payload).to.equal('10');
            done();
        });
    });

    it('can handle a stream payload', (done) => {

        const dispatch = function (req, res) {

            internals.readStream(req, (buff) => {

                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end(buff);
            });
        };

        Shot.inject(dispatch, { method: 'post', url: '/', payload: internals.getTestStream() }, (res) => {

            expect(res.payload).to.equal('hi');
            done();
        });

    });

    it('can override stream payload content-length header', (done) => {

        const dispatch = function (req, res) {

            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(req.headers['content-length']);
        };

        const headers = { 'content-length': '100' };

        Shot.inject(dispatch, { method: 'post', url: '/', payload: internals.getTestStream(), headers }, (res) => {

            expect(res.payload).to.equal('100');
            done();
        });
    });
});

describe('writeHead()', () => {

    it('returns single buffer payload', (done) => {

        const reply = 'Hello World';
        const dispatch = function (req, res) {

            res.writeHead(200, 'OK', { 'Content-Type': 'text/plain', 'Content-Length': reply.length });
            res.end(reply);
        };

        Shot.inject(dispatch, { method: 'get', url: '/' }, (res) => {

            expect(res.payload).to.equal(reply);
            done();
        });
    });
});

describe('_read()', () => {

    it('plays payload', (done) => {

        const dispatch = function (req, res) {

            let buffer = '';
            req.on('readable', () => {

                buffer = buffer + (req.read() || '');
            });

            req.on('close', () => {
            });

            req.on('end', () => {

                res.writeHead(200, { 'Content-Length': 0 });
                res.end(buffer);
                req.destroy();
            });
        };

        const body = 'something special just for you';
        Shot.inject(dispatch, { method: 'get', url: '/', payload: body }, (res) => {

            expect(res.payload).to.equal(body);
            done();
        });
    });

    it('simulates split', (done) => {

        const dispatch = function (req, res) {

            let buffer = '';
            req.on('readable', () => {

                buffer = buffer + (req.read() || '');
            });

            req.on('close', () => {
            });

            req.on('end', () => {

                res.writeHead(200, { 'Content-Length': 0 });
                res.end(buffer);
                req.destroy();
            });
        };

        const body = 'something special just for you';
        Shot.inject(dispatch, { method: 'get', url: '/', payload: body, simulate: { split: true } }, (res) => {

            expect(res.payload).to.equal(body);
            done();
        });
    });

    it('simulates error', (done) => {

        const dispatch = function (req, res) {

            req.on('readable', () => {
            });

            req.on('error', () => {

                res.writeHead(200, { 'Content-Length': 0 });
                res.end('error');
            });
        };

        const body = 'something special just for you';
        Shot.inject(dispatch, { method: 'get', url: '/', payload: body, simulate: { error: true } }, (res) => {

            expect(res.payload).to.equal('error');
            done();
        });
    });

    it('simulates no end without payload', (done) => {

        let end = false;
        const dispatch = function (req, res) {

            req.resume();
            req.on('end', () => {

                end = true;
            });
        };

        let replied = false;
        Shot.inject(dispatch, { method: 'get', url: '/', simulate: { end: false } }, (res) => {

            replied = true;
        });

        setTimeout(() => {

            expect(end).to.equal(false);
            expect(replied).to.equal(false);
            done();
        }, 10);
    });

    it('simulates no end with payload', (done) => {

        let end = false;
        const dispatch = function (req, res) {

            req.resume();
            req.on('end', () => {

                end = true;
            });
        };

        let replied = false;
        Shot.inject(dispatch, { method: 'get', url: '/', payload: '1234567', simulate: { end: false } }, (res) => {

            replied = true;
        });

        setTimeout(() => {

            expect(end).to.equal(false);
            expect(replied).to.equal(false);
            done();
        }, 10);
    });

    it('simulates close', (done) => {

        const dispatch = function (req, res) {

            let buffer = '';
            req.on('readable', () => {

                buffer = buffer + (req.read() || '');
            });

            req.on('close', () => {

                res.writeHead(200, { 'Content-Length': 0 });
                res.end('close');
            });

            req.on('end', () => {
            });
        };

        const body = 'something special just for you';
        Shot.inject(dispatch, { method: 'get', url: '/', payload: body, simulate: { close: true } }, (res) => {

            expect(res.payload).to.equal('close');
            done();
        });
    });
});


internals.getTestStream = function () {

    const Read = function () {

        Stream.Readable.call(this);
    };

    Util.inherits(Read, Stream.Readable);

    const word = 'hi';
    let i = 0;

    Read.prototype._read = function (size) {

        this.push(word[i] ? word[i++] : null);
    };

    return new Read();
};


internals.readStream = function (stream, callback) {

    const chunks = [];

    stream.on('data', (chunk) => chunks.push(chunk));

    stream.on('end', () => {

        return callback(Buffer.concat(chunks));
    });
};
