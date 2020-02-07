'use strict';

// Load modules

const Http = require('http');
const Stream = require('stream');
const B64 = require('b64');
const Code = require('code');
const Content = require('content');
const FormData = require('form-data');
const Fs = require('fs');
const Hoek = require('hoek');
const Lab = require('lab');
const Pez = require('..');
const Wreck = require('wreck');


// Declare internals

const internals = {};


// Test shortcuts

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;


describe('Dispenser', () => {

    const simulate = function (payload, boundary, contentType, callback) {

        if (arguments.length === 3) {
            callback = contentType;
            contentType = 'multipart/form-data; boundary="' + boundary + '"';
        }

        const req = new internals.Payload(payload);
        req.headers = { 'content-type': contentType };

        const dispenser = internals.interceptor(boundary, callback);
        req.pipe(dispenser);
    };

    it('throws on invalid options', (done) => {

        const fail = (options) => {

            expect(() => {

                return new Pez.Dispenser(options);
            }).to.throw(Error, 'options must be an object');
        };

        fail();
        fail(null);
        fail('foo');
        fail(1);
        fail(false);
        done();
    });

    it('parses RFC1867 payload', (done) => {

        const payload =
            'pre\r\nemble\r\n' +
            '--AaB03x\r\n' +
            'content-disposition: form-data; name="field1"\r\n' +
            '\r\n' +
            'one\r\ntwo\r\n' +
            '--AaB03x\r\n' +
            'content-disposition: form-data; name="pics"; filename="file1.txt"\r\n' +
            'content-transfer-encoding: 7bit\r\n' +
            'Content-Type: text/plain\r\n' +
            '\r\n' +
            'some content\r\nwith \rnewline\r\r\n' +
            '--AaB03x--\r\n' +
            'epi\r\nlogue';

        simulate(payload, 'AaB03x', (err, data) => {

            expect(err).to.not.exist();
            expect(data).to.deep.equal({
                preamble: {
                    value: 'pre\r\nemble'
                },
                field1: {
                    value: 'one\r\ntwo'
                },
                epilogue: {
                    value: 'epi\r\nlogue'
                },
                pics: {
                    value: 'some content\r\nwith \rnewline\r',
                    headers: {
                        'content-disposition': 'form-data; name=\"pics\"; filename=\"file1.txt\"',
                        'content-transfer-encoding': '7bit',
                        'content-type': 'text/plain'
                    },
                    filename: 'file1.txt'
                }
            });

            done();
        });
    });

    it('parses payload in chunks', (done) => {

        const payload = [
            'pre\r\nemble\r\n',
            '--AaB03x\r\n',
            'content-disposition: form-data; name="field1"\r\n',
            '\r\n',
            'one\r\ntwo\r\n',
            '--AaB03x\r\n',
            'content-disposition: form-data; name="pics"; filename="file.bin"\r\n',
            'Content-Type: text/plain\r\n',
            '\r\n',
            'aliuexrnhfaliuerxnhfaiuerhfxnlaiuerhfxnlaiuerhfxnliaeruhxnfaieruhfnxc',
            'aliuexrnhfaliuerxnhfaiuerhfxnlaiuerhfxnlaiuerhfxnliaeruhxnfaieruhfnxc',
            'aliuexrnhfaliuerxnhfaiuerhfxnlaiuerhfxnlaiuerhfxnliaeruhxnfaieruhfnxc',
            'aliuexrnhfaliuerxnhfaiuerhfxnlaiuerhfxnlaiuerhfxnliaeruhxnfaieruhfnxc',
            'aliuexrnhfaliuerxnhfaiuerhfxnlaiuerhfxnlaiuerhfxnliaeruhxnfaieruhfnxc',
            'aliuexrnhfaliuerxnhfaiuerhfxnlaiuerhfxnlaiuerhfxnliaeruhxnfaieruhfnxc',
            'aliuexrnhfaliuerxnhfaiuerhfxnlaiuerhfxnlaiuerhfxnliaeruhxnfaieruhfnxc\r\n',
            '--AaB03x--'
        ];

        simulate(payload, 'AaB03x', (err, data) => {

            expect(err).to.not.exist();
            expect(data).to.deep.equal({
                preamble: {
                    value: 'pre\r\nemble'
                },
                field1: {
                    value: 'one\r\ntwo'
                },
                pics: {
                    value: 'aliuexrnhfaliuerxnhfaiuerhfxnlaiuerhfxnlaiuerhfxnliaeruhxnfaieruhfnxcaliuexrnhfaliuerxnhfaiuerhfxnlaiuerhfxnlaiuerhfxnliaeruhxnfaieruhfnxcaliuexrnhfaliuerxnhfaiuerhfxnlaiuerhfxnlaiuerhfxnliaeruhxnfaieruhfnxcaliuexrnhfaliuerxnhfaiuerhfxnlaiuerhfxnlaiuerhfxnliaeruhxnfaieruhfnxcaliuexrnhfaliuerxnhfaiuerhfxnlaiuerhfxnlaiuerhfxnliaeruhxnfaieruhfnxcaliuexrnhfaliuerxnhfaiuerhfxnlaiuerhfxnlaiuerhfxnliaeruhxnfaieruhfnxcaliuexrnhfaliuerxnhfaiuerhfxnlaiuerhfxnlaiuerhfxnliaeruhxnfaieruhfnxc',
                    headers: {
                        'content-disposition': 'form-data; name=\"pics\"; filename=\"file.bin\"',
                        'content-type': 'text/plain'
                    },
                    filename: 'file.bin'
                }
            });

            done();
        });
    });

    it('parses payload without trailing crlf', (done) => {

        const payload =
            '--AaB03x\r\n' +
            'content-disposition: form-data; name="field1"\r\n' +
            '\r\n' +
            'one\r\ntwo\r\n' +
            '--AaB03x\r\n' +
            'content-disposition: form-data; name="pics"; filename="file1.txt"\r\n' +
            'Content-Type: text/plain\r\n' +
            '\r\n' +
            'some content\r\r\n' +
            '--AaB03x--';

        simulate(payload, 'AaB03x', (err, data) => {

            expect(err).to.not.exist();
            expect(data).to.deep.equal({
                field1: {
                    value: 'one\r\ntwo'
                },
                pics: {
                    value: 'some content\r',
                    headers: {
                        'content-disposition': 'form-data; name=\"pics\"; filename=\"file1.txt\"',
                        'content-type': 'text/plain'
                    },
                    filename: 'file1.txt'
                }
            });

            done();
        });
    });

    it('ignores whitespace after boundary', (done) => {

        const payload =
            '--AaB03x  \r\n' +
            'content-disposition: form-data; name="field"\r\n' +
            '\r\n' +
            'value\r\n' +
            '--AaB03x--';

        simulate(payload, 'AaB03x', (err, data) => {

            expect(err).to.not.exist();
            expect(data).to.deep.equal({
                field: {
                    value: 'value'
                }
            });

            done();
        });
    });

    it('parses single part without epilogue', (done) => {

        const payload =
            '--AaB03x  \r\n' +
            'content-disposition: form-data; name="field"\r\n' +
            '\r\n' +
            'value\r\n' +
            '--AaB03x--\r\n';

        simulate(payload, 'AaB03x', (err, data) => {

            expect(err).to.not.exist();
            expect(data).to.deep.equal({
                field: {
                    value: 'value'
                }
            });

            done();
        });
    });

    it('reads header over multiple lines', (done) => {

        const payload =
            '--AaB03x\r\n' +
            'content-disposition:\r\n form-data; name="field"\r\n' +
            '\r\n' +
            'value\r\n' +
            '--AaB03x--';

        simulate(payload, 'AaB03x', (err, data) => {

            expect(err).to.not.exist();
            expect(data).to.deep.equal({
                field: {
                    value: 'value'
                }
            });

            done();
        });
    });

    it('parses b64 file', (done) => {

        const payload =
            '--AaB03x\r\n' +
            'content-disposition: form-data; name="field"; filename="file.txt"\r\n' +
            'content-transfer-encoding: base64\r\n' +
            '\r\n' +
            B64.encode(new Buffer('this is the content of the file')) + '\r\n' +
            '--AaB03x--';

        simulate(payload, 'AaB03x', (err, data) => {

            expect(err).to.not.exist();
            expect(data).to.deep.equal({
                field: {
                    value: 'this is the content of the file',
                    headers: {
                        'content-disposition': 'form-data; name="field"; filename="file.txt"',
                        'content-transfer-encoding': 'base64'
                    },
                    filename: 'file.txt'
                }
            });

            done();
        });
    });

    it('errors on partial header over multiple lines', (done) => {

        const payload =
            '--AaB03x\r\n' +
            ' form-data; name="field"\r\n' +
            '\r\n' +
            'value\r\n' +
            '--AaB03x--';

        simulate(payload, 'AaB03x', (err, data) => {

            expect(err).to.exist();
            expect(err.message).to.equal('Invalid header continuation without valid declaration on previous line');

            done();
        });
    });

    it('errors on missing terminator', (done) => {

        const payload =
            '--AaB03x\r\n' +
            'content-disposition: form-data; name="field"\r\n' +
            '\r\n' +
            'value\r\n' +
            '--AaB03x';

        simulate(payload, 'AaB03x', (err, data) => {

            expect(err).to.exist();
            expect(err.message).to.equal('Missing end boundary');

            done();
        });
    });

    it('errors on missing preamble terminator (\\n)', (done) => {

        const payload =
            'preamble--AaB03x\r\n' +
            'content-disposition: form-data; name="field"\r\n' +
            '\r\n' +
            'value\r\n' +
            '--AaB03x--';

        simulate(payload, 'AaB03x', (err, data) => {

            expect(err).to.exist();
            expect(err.message).to.equal('Preamble missing CRLF terminator');

            done();
        });
    });

    it('errors on missing preamble terminator (\\r)', (done) => {

        const payload =
            'preamble\n--AaB03x\r\n' +
            'content-disposition: form-data; name="field"\r\n' +
            '\r\n' +
            'value\r\n' +
            '--AaB03x--';

        simulate(payload, 'AaB03x', (err, data) => {

            expect(err).to.exist();
            expect(err.message).to.equal('Preamble missing CRLF terminator');

            done();
        });
    });

    it('errors on incomplete part', (done) => {

        const payload =
            '--AaB03x\r\n' +
            'content-disposition: form-data; name="field"\r\n' +
            '\r\n' +
            'value\r\n';

        simulate(payload, 'AaB03x', (err, data) => {

            expect(err).to.exist();
            expect(err.message).to.equal('Incomplete multipart payload');

            done();
        });
    });

    it('errors on invalid part header (missing field name)', (done) => {

        const payload =
            '--AaB03x\r\n' +
            'content-disposition: form-data; name="field"\r\n' +
            ': invalid\r\n' +
            '\r\n' +
            'content\r\n' +
            '--AaB03x--';

        simulate(payload, 'AaB03x', (err, data) => {

            expect(err).to.exist();
            expect(err.message).to.equal('Invalid header missing field name');

            done();
        });
    });

    it('errors on invalid part header (missing colon)', (done) => {

        const payload =
            '--AaB03x\r\n' +
            'content-disposition: form-data; name="field"\r\n' +
            'invalid\r\n' +
            '\r\n' +
            'content\r\n' +
            '--AaB03x--';

        simulate(payload, 'AaB03x', (err, data) => {

            expect(err).to.exist();
            expect(err.message).to.equal('Invalid header missing colon separator');

            done();
        });
    });

    it('errors on missing content-disposition', (done) => {

        const payload =
            '--AaB03x\r\n' +
            '\r\n' +
            'content\r\n' +
            '--AaB03x--';

        simulate(payload, 'AaB03x', (err, data) => {

            expect(err).to.exist();
            expect(err.message).to.equal('Missing content-disposition header');

            done();
        });
    });

    it('errors on invalid text after boundary', (done) => {

        const payload =
            '--AaB03x\r\n' +
            'content-disposition: form-data; name="field"\r\n' +
            '\r\n' +
            'content\r\n' +
            '--AaB03xc\r\n' +
            'content-disposition: form-data; name="field"\r\n' +
            '\r\n' +
            'content\r\n' +
            '--AaB03x--\r\n';

        simulate(payload, 'AaB03x', (err, data) => {

            expect(err).to.exist();
            expect(err.message).to.equal('Only white space allowed after boundary');

            done();
        });
    });

    it('errors on invalid text after boundary at end', (done) => {

        const payload =
            '--AaB03x\r\n' +
            'content-disposition: form-data; name="field"\r\n' +
            '\r\n' +
            'content\r\n' +
            '--AaB03xc';

        simulate(payload, 'AaB03x', (err, data) => {

            expect(err).to.exist();
            expect(err.message).to.equal('Only white space allowed after boundary at end');

            done();
        });
    });

    it('errors on aborted request', (done) => {

        const req = new internals.Payload('--AaB03x\r\n', true);
        req.headers = { 'content-type': 'multipart/form-data; boundary="AaB03x"' };

        const dispenser = new Pez.Dispenser({ boundary: 'AaB03x' });

        dispenser.once('error', (err) => {

            expect(err).to.exist();
            expect(err.message).to.equal('Client request aborted');
            done();
        });

        req.pipe(dispenser);
        req.emit('aborted');
    });

    it('parses direct write', (done) => {

        const dispenser = new Pez.Dispenser({ boundary: 'AaB03x' });

        dispenser.on('field', (name, value) => {

            expect(name).to.equal('field1');
            expect(value).to.equal('value');
            done();
        });

        dispenser.write('--AaB03x\r\n' +
            'content-disposition: form-data; name="field1"\r\n' +
            '\r\n' +
            'value\r\n' +
            '--AaB03x--');

        dispenser.end();
    });

    it('ignores write after error', (done) => {

        const dispenser = new Pez.Dispenser({ boundary: 'AaB03x' });

        dispenser.on('field', (name, value) => {

            dispenser.write('--AaB03x\r\n' +
                'content-disposition: form-data; name="field1"\r\n' +
                '\r\n' +
                'value\r\n' +
                '--AaB03x*');

            dispenser.write('--AaB03x\r\n' +
                'content-disposition: form-data; name="field1"\r\n' +
                '\r\n' +
                'value\r\n' +
                '--AaB03x*');
        });

        dispenser.once('error', (err) => {

            expect(err instanceof Error).to.equal(true);
            done();
        });

        dispenser.write('--AaB03x\r\n' +
            'content-disposition: form-data; name="field1"\r\n' +
            '\r\n' +
            'value\r\n' +
            '--AaB03x*');
    });

    it('parses a standard text file', (done) => {

        const payload =
            '--AaB03x\r\n' +
            'content-disposition: form-data; name="file"; filename="file1.txt"\r\n' +
            'content-transfer-encoding: 7bit\r\n' +
            'Content-Type: text/plain\r\n' +
            '\r\n' +
            'I am a plain text file\r\n' +
            '--AaB03x--\r\n';

        simulate(payload, 'AaB03x', (err, data) => {

            expect(err).to.not.exist();
            expect(data).to.deep.equal({
                file: {
                    filename: 'file1.txt',
                    value: 'I am a plain text file',
                    headers: {
                        'content-disposition': 'form-data; name="file"; filename="file1.txt"',
                        'content-transfer-encoding': '7bit',
                        'content-type': 'text/plain'
                    }
                }
            });
            done();
        });
    });

    it('parses an uploaded standard text file', (done) => {

        let port = 0;
        const server = Http.createServer((req, res) => {

            const contentType = Content.type(req.headers['content-type']);
            const dispenser = internals.interceptor(contentType.boundary, (err, result) => {

                expect(err).to.not.exist();
                expect(result).to.deep.equal({
                    file1: {
                        filename: 'file1.txt',
                        headers: {
                            'content-disposition': 'form-data; name="file1"; filename="file1.txt"',
                            'content-type': 'text/plain'
                        },
                        value: 'I am a plain text file'
                    }
                });
                done();
            });
            req.pipe(dispenser);
        }).listen(port, '127.0.0.1');

        server.once('listening', () => {

            port = server.address().port;

            const form = new FormData();
            form.append('file1', Fs.createReadStream('./test/files/file1.txt'));

            Wreck.post('http://127.0.0.1:' + port, {
                payload: form, headers: form.getHeaders()
            }, (err, res, payload) => {

                expect(err).to.not.exist();
            });
        });
    });

    it('errors if the payload size exceeds the byte limit', (done) => {

        const payload =
            '--AaB03x\r\n' +
            'content-disposition: form-data; name="file"; filename="file1.txt"\r\n' +
            'Content-Type: text/plain\r\n' +
            '\r\n' +
            'I am a plain text file\r\n' +
            '--AaB03x--\r\n';

        const req = new internals.Payload(payload, true);
        req.headers = { 'content-type': 'multipart/form-data; boundary="AaB03x"' };

        const dispenser = new Pez.Dispenser({ boundary: 'AaB03x', maxBytes: payload.length - 1 });

        dispenser.once('error', (err) => {

            expect(err).to.exist();
            expect(err.message).to.equal('Maximum size exceeded');
            done();
        });

        req.pipe(dispenser);
    });

    it('parses a request with "=" in the boundary', (done) => {

        const payload =
            '--AaB=03x\r\n' +
            'content-disposition: form-data; name="file"; filename="file1.txt"\r\n' +
            'content-transfer-encoding: 7bit\r\n' +
            'Content-Type: text/plain\r\n' +
            '\r\n' +
            'I am a plain text file\r\n' +
            '--AaB=03x--\r\n';

        simulate(payload, 'AaB=03x', (err, data) => {

            expect(err).to.not.exist();
            expect(data).to.deep.equal({
                file: {
                    filename: 'file1.txt',
                    value: 'I am a plain text file',
                    headers: {
                        'content-disposition': 'form-data; name="file"; filename="file1.txt"',
                        'content-transfer-encoding': '7bit',
                        'content-type': 'text/plain'
                    }
                }
            });
            done();
        });
    });

    it('parses a request with non-standard contentType', (done) => {

        const payload =
            '--AaB03x\r\n' +
            'content-disposition: form-data; name="file"; filename="file1.txt"\r\n' +
            'content-transfer-encoding: 7bit\r\n' +
            'Content-Type: text/plain\r\n' +
            '\r\n' +
            'I am a plain text file\r\n' +
            '--AaB03x--\r\n';
        const contentType = 'multipart/form-data; boundary="--AaB03x"; charset=utf-8; random=foobar';

        simulate(payload, 'AaB03x', contentType, (err, data) => {

            expect(err).to.not.exist();
            expect(data).to.deep.equal({
                file: {
                    filename: 'file1.txt',
                    value: 'I am a plain text file',
                    headers: {
                        'content-disposition': 'form-data; name="file"; filename="file1.txt"',
                        'content-transfer-encoding': '7bit',
                        'content-type': 'text/plain'
                    }
                }
            });
            done();
        });
    });

    it('parses a png file', (done) => {

        const png = Fs.readFileSync('./test/files/image.png');

        const payload =
            '--AaB03x\r\n' +
            'content-disposition: form-data; name="sticker"; filename="image.png"\r\n' +
            'content-transfer-encoding: base64\r\n' +
            'Content-Type: image/png\r\n' +
            '\r\n' +
            B64.encode(png) + '\r\n' +
            '--AaB03x--\r\n';

        simulate(payload, 'AaB03x', (err, data) => {

            expect(err).to.not.exist();
            expect(data).to.deep.equal({
                sticker: {
                    value: png.toString(),
                    headers: {
                        'content-disposition': 'form-data; name="sticker"; filename="image.png"',
                        'content-transfer-encoding': 'base64',
                        'content-type': 'image/png'
                    },
                    filename: 'image.png'
                }
            });
            done();
        });
    });

    it('parses an uploaded png file', (done) => {

        const server = Http.createServer((req, res) => {

            const contentType = Content.type(req.headers['content-type']);
            const dispenser = internals.interceptor(contentType.boundary, (err, result) => {

                expect(err).to.not.exist();

                expect(result).to.deep.equal({
                    sticker: {
                        value: Fs.readFileSync('./test/files/image.png').toString(),
                        headers: {
                            'content-disposition': 'form-data; name="sticker"; filename="image.png"',
                            'content-type': 'image/png'
                        },
                        filename: 'image.png'
                    }
                });
                done();
            });

            req.pipe(dispenser);
        }).listen(0, '127.0.0.1');

        server.once('listening', () => {

            const form = new FormData();
            form.append('sticker', Fs.createReadStream('./test/files/image.png'));
            Wreck.request('POST', 'http://127.0.0.1:' + server.address().port, { payload: form, headers: form.getHeaders() });
        });
    });

    it('parses a large uploaded png file', (done) => {

        const server = Http.createServer((req, res) => {

            const contentType = Content.type(req.headers['content-type']);
            const dispenser = internals.interceptor(contentType.boundary, (err, result) => {

                expect(err).to.not.exist();
                expect(result).to.deep.equal({
                    sticker: {
                        value: Fs.readFileSync('./test/files/large.png').toString(),
                        headers: {
                            'content-disposition': 'form-data; name="sticker"; filename="large.png"',
                            'content-type': 'image/png'
                        },
                        filename: 'large.png'
                    }
                });
                done();
            });

            req.pipe(dispenser);
        }).listen(0, '127.0.0.1');

        server.once('listening', () => {

            const form = new FormData();
            form.append('sticker', Fs.createReadStream('./test/files/large.png'));
            Wreck.request('POST', 'http://127.0.0.1:' + server.address().port, { payload: form, headers: form.getHeaders() });
        });
    });

    it('parses a blank gif file', (done) => {

        const blankgif = Fs.readFileSync('./test/files/blank.gif');

        const payload =
            '--AaB03x\r\n' +
            'content-disposition: form-data; name="file"; filename="blank.gif"\r\n' +
            'content-transfer-encoding: base64\r\n' +
            'Content-Type: image/gif\r\n' +
            '\r\n' +
            B64.encode(blankgif) + '\r\n' +
            '--AaB03x--\r\n';

        simulate(payload, 'AaB03x', (err, data) => {

            expect(err).to.not.exist();
            expect(data).to.deep.equal({
                file: {
                    filename: 'blank.gif',
                    value: blankgif.toString(),
                    headers: {
                        'content-disposition': 'form-data; name="file"; filename="blank.gif"',
                        'content-transfer-encoding': 'base64',
                        'content-type': 'image/gif'
                    }
                }
            });
            done();
        });
    });

    it('parses an uploaded blank gif file', (done) => {

        const server = Http.createServer((req, res) => {

            const contentType = Content.type(req.headers['content-type']);
            const dispenser = internals.interceptor(contentType.boundary, (err, result) => {

                expect(err).to.not.exist();
                expect(result).to.deep.equal({
                    file: {
                        value: Fs.readFileSync('./test/files/blank.gif').toString(),
                        headers: {
                            'content-disposition': 'form-data; name="file"; filename="blank.gif"',
                            'content-type': 'image/gif'
                        },
                        filename: 'blank.gif'
                    }
                });
                done();
            });

            req.pipe(dispenser);
        }).listen(0, '127.0.0.1');

        server.once('listening', () => {

            const form = new FormData();
            form.append('file', Fs.createReadStream('./test/files/blank.gif'));
            Wreck.request('POST', 'http://127.0.0.1:' + server.address().port, { payload: form, headers: form.getHeaders() });
        });
    });

    it('parses an empty file without a filename', (done) => {

        const payload =
            '--AaB03x\r\n' +
            'content-disposition: form-data; name="file"; filename=""\r\n' +
            '\r\n' +
            '\r\n' +
            '--AaB03x--\r\n';

        simulate(payload, 'AaB03x', (err, data) => {

            expect(err).to.not.exist();
            expect(data).to.deep.equal({
                file: {
                    value: '',
                    headers: {
                        'content-disposition': 'form-data; name="file"; filename=""'
                    }
                }
            });
            done();
        });
    });

    it('parses a file without a filename', (done) => {

        const blankgif = Fs.readFileSync('./test/files/blank.gif');

        const payload =
            '--AaB03x\r\n' +
            'content-disposition: form-data; name="file"; filename=""\r\n' +
            'content-transfer-encoding: base64\r\n' +
            'Content-Type: image/gif\r\n' +
            '\r\n' +
            B64.encode(blankgif) + '\r\n' +
            '--AaB03x--\r\n';

        simulate(payload, 'AaB03x', (err, data) => {

            expect(err).to.not.exist();
            expect(data).to.deep.equal({
                file: {
                    value: blankgif.toString(),
                    headers: {
                        'content-disposition': 'form-data; name="file"; filename=""',
                        'content-transfer-encoding': 'base64',
                        'content-type': 'image/gif'
                    }
                }
            });
            done();
        });
    });

    it('handles unusual filename', (done) => {

        const blankgif = Fs.readFileSync('./test/files/blank.gif');
        const filename = ': \\ ? % * | %22 < > . ? ; \' @ # $ ^ & ( ) - _ = + { } [ ] ` ~.txt';

        const payload =
            '--AaB03x\r\n' +
            'content-disposition: form-data; name="file"; filename="' + filename + '"\r\n' +
            'content-transfer-encoding: base64\r\n' +
            'Content-Type: image/gif\r\n' +
            '\r\n' +
            B64.encode(blankgif) + '\r\n' +
            '--AaB03x--\r\n';

        simulate(payload, 'AaB03x', (err, data) => {

            expect(err).to.not.exist();
            expect(data).to.deep.equal({
                file: {
                    value: blankgif.toString(),
                    headers: {
                        'content-disposition': 'form-data; name="file"; filename="' + filename + '"',
                        'content-transfer-encoding': 'base64',
                        'content-type': 'image/gif'
                    },
                    filename: filename
                }
            });
            done();
        });
    });
});


internals.Payload = function (payload, err) {

    Stream.Readable.call(this);

    this._data = [].concat(payload);
    this._position = 0;
    this._err = err;
};

Hoek.inherits(internals.Payload, Stream.Readable);


internals.Payload.prototype._read = function (size) {

    const chunk = this._data[this._position++];

    if (chunk) {
        this.push(chunk);
    }
    else if (!this._err) {
        this.push(null);
    }
};


internals.Recorder = function () {

    Stream.Writable.call(this);

    this.buffers = [];
    this.nexts = [];
    this.length = 0;
};

Hoek.inherits(internals.Recorder, Stream.Writable);


internals.Recorder.prototype._write = function (chunk, encoding, next) {

    this.length = this.length + chunk.length;
    this.buffers.push(chunk);
    this.nexts.push(next);
    this.emit('ping');
};


internals.Recorder.prototype.collect = function () {

    const buffer = (this.buffers.length === 0 ? new Buffer(0) : (this.buffers.length === 1 ? this.buffers[0] : Buffer.concat(this.buffers, this.length)));
    return buffer;
};


internals.Recorder.prototype.next = () => {

    for (let i = 0; i < this.nexts.length; ++i) {
        this.nexts[i]();
    }

    this.nexts = [];
};

internals.interceptor = function (boundary, callback) {

    const dispenser = new Pez.Dispenser({ boundary: boundary });
    const data = {};
    const set = function (name, value, headers, filename) {

        const item = { value: value };

        if (headers) {
            item.headers = headers;
        }

        if (filename) {
            item.filename = filename;
        }

        if (!data.hasOwnProperty(name)) {
            data[name] = item;
        }
        else if (Array.isArray(data[name])) {
            data[name].push(item);
        }
        else {
            data[name] = [data[name], item];
        }
    };

    dispenser.on('preamble', (chunk) => {

        set('preamble', chunk.toString());
    });

    dispenser.on('epilogue', (value) => {

        set('epilogue', value);
    });

    dispenser.on('part', (part) => {

        Wreck.read(part, {}, (err, payload) => {

            expect(err).to.not.exist();
            set(part.name, payload.toString(), part.headers, part.filename);
        });
    });

    dispenser.on('field', (name, value) => {

        set(name, value);
    });

    dispenser.once('close', () => {

        callback(null, data);
    });

    dispenser.once('error', (err) => {

        return callback(err);
    });

    return dispenser;
};
