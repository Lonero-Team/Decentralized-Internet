'use strict';

// Load modules

const Code = require('code');
const Cryptiles = require('cryptiles');
const Iron = require('iron');
const Lab = require('lab');
const Statehood = require('../');


// Declare internals

const internals = {};


// Test shortcuts

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;


describe('Definitions', () => {

    const password = 'a_password_that_is_not_too_short_and_also_not_very_random_but_is_good_enough';

    describe('add()', () => {

        it('throws on missing name', (done) => {

            const definitions = new Statehood.Definitions();
            expect(() => {

                definitions.add();
            }).to.throw('Invalid name');
            done();
        });

        it('uses defaults', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.add('test');
            expect(definitions.cookies.test).to.equal({
                strictHeader: true,
                ignoreErrors: false,
                isSecure: false,
                isHttpOnly: false,
                path: null,
                domain: null,
                ttl: null,
                encoding: 'none'
            });
            done();
        });

        it('records name', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.add('test');
            expect(definitions.names).to.equal(['test']);
            done();
        });

        it('adds definition with null value', (done) => {

            const definitions = new Statehood.Definitions({ path: '/' });

            definitions.add('base');
            expect(definitions.cookies.base.path).to.equal('/');

            definitions.add('test', { path: null });
            expect(definitions.cookies.test.path).to.equal(null);

            done();
        });
    });

    describe('parse()', () => {

        it('parses cookie', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.parse('a=b', (err, states, failed) => {

                expect(err).to.not.exist();
                expect(failed).to.have.length(0);
                expect(states).to.equal({ a: 'b' });
                done();
            });
        });

        it('parses cookie (loose)', (done) => {

            const definitions = new Statehood.Definitions({ strictHeader: false });
            definitions.parse('a="1; b="2"; c=3; d[1]=4;=1', (err, states, failed) => {

                expect(err).to.not.exist();
                expect(failed).to.have.length(0);
                expect(states).to.equal({ a: '"1', b: '2', c: '3', 'd[1]': '4', '': '1' });
                done();
            });
        });

        it('parses cookie (empty)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.parse('a=', (err, states, failed) => {

                expect(err).to.not.exist();
                expect(failed).to.have.length(0);
                expect(states).to.equal({ a: '' });
                done();
            });
        });

        it('parses cookie (quoted empty)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.parse('a=""', (err, states, failed) => {

                expect(err).to.not.exist();
                expect(failed).to.have.length(0);
                expect(states).to.equal({ a: '' });
                done();
            });
        });

        it('parses cookie (semicolon single)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.parse('a=;', (err, states, failed) => {

                expect(err).to.not.exist();
                expect(failed).to.have.length(0);
                expect(states).to.equal({ a: '' });
                done();
            });
        });

        it('parses cookie (number)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.parse('a=23', (err, states, failed) => {

                expect(err).to.not.exist();
                expect(failed).to.have.length(0);
                expect(states).to.equal({ a: '23' });
                done();
            });
        });

        it('parses cookie (array)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.parse('a=1; a=2', (err, states, failed) => {

                expect(err).to.not.exist();
                expect(failed).to.have.length(0);
                expect(states).to.equal({ a: ['1', '2'] });
                done();
            });
        });

        it('parses cookie (mixed style array)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.parse('a=1; b="2"; c=3', (err, states, failed) => {

                expect(err).to.not.exist();
                expect(failed).to.have.length(0);
                expect(states).to.equal({ a: '1', b: '2', c: '3' });
                done();
            });
        });

        it('parses cookie (mixed style array quoted first)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.parse('a="1"; b="2"; c=3', (err, states, failed) => {

                expect(err).to.not.exist();
                expect(failed).to.have.length(0);
                expect(states).to.equal({ a: '1', b: '2', c: '3' });
                done();
            });
        });

        it('parses cookie (white space)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.parse('A    = b;   b  =   c', (err, states, failed) => {

                expect(err).to.not.exist();
                expect(failed).to.have.length(0);
                expect(states).to.equal({ A: 'b', b: 'c' });
                done();
            });
        });

        it('parses cookie (raw form)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.parse('a="b=123456789&c=something"', (err, states, failed) => {

                expect(err).to.not.exist();
                expect(failed).to.have.length(0);
                expect(states).to.equal({ a: 'b=123456789&c=something' });
                done();
            });
        });

        it('parses cookie (raw percent)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.parse('a=%1;b=x', (err, states, failed) => {

                expect(err).to.not.exist();
                expect(failed).to.have.length(0);
                expect(states).to.equal({ a: '%1', b: 'x' });
                done();
            });
        });

        it('parses cookie (raw encoded)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.parse('z=%20%22%2c%3b%2f', (err, states, failed) => {

                expect(err).to.not.exist();
                expect(failed).to.have.length(0);
                expect(states).to.equal({ z: '%20%22%2c%3b%2f' });
                done();
            });
        });

        it('parses cookie (form single)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.add('a', { encoding: 'form' });
            definitions.parse('a="b=%p123456789"', (err, states, failed) => {

                expect(err).to.not.exist();
                expect(failed).to.have.length(0);
                expect(states).to.equal({ a: { b: '%p123456789' } });
                done();
            });
        });

        it('parses cookie (form multiple)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.add('a', { encoding: 'form' });
            definitions.parse('a="b=123456789&c=something%20else"', (err, states, failed) => {

                expect(err).to.not.exist();
                expect(failed).to.have.length(0);
                expect(states).to.equal({ a: { b: '123456789', c: 'something else' } });
                done();
            });
        });

        it('parses cookie (base64 array 2)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.add('a', { encoding: 'base64' });
            definitions.parse('a=dGVzdA; a=dGVzdA', (err, states, failed) => {

                expect(err).to.not.exist();
                expect(failed).to.have.length(0);
                expect(states).to.equal({ a: ['test', 'test'] });
                done();
            });
        });

        it('parses cookie (base64 array 3)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.add('a', { encoding: 'base64' });
            definitions.parse('a=dGVzdA; a=dGVzdA; a=dGVzdA', (err, states, failed) => {

                expect(err).to.not.exist();
                expect(failed).to.have.length(0);
                expect(states).to.equal({ a: ['test', 'test', 'test'] });
                done();
            });
        });

        it('parses cookie (base64 padding)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.add('key', { encoding: 'base64' });
            definitions.parse('key=dGVzdA==', (err, states, failed) => {

                expect(err).to.not.exist();
                expect(failed).to.have.length(0);
                expect(states).to.equal({ key: 'test' });
                done();
            });
        });

        it('parses cookie (base64)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.add('key', { encoding: 'base64' });
            definitions.parse('key=dGVzdA', (err, states, failed) => {

                expect(err).to.not.exist();
                expect(failed).to.have.length(0);
                expect(states).to.equal({ key: 'test' });
                done();
            });
        });

        it('parses cookie (none encoding)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.add('key', { encoding: 'none' });
            definitions.parse('key=dGVzdA', (err, states, failed) => {

                expect(err).to.not.exist();
                expect(failed).to.have.length(0);
                expect(states).to.equal({ key: 'dGVzdA' });
                done();
            });
        });

        it('parses cookie (base64json)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.add('key', { encoding: 'base64json' });
            definitions.parse('key=eyJ0ZXN0aW5nIjoianNvbiJ9', (err, states, failed) => {

                expect(err).to.not.exist();
                expect(failed).to.have.length(0);
                expect(states).to.equal({ key: { testing: 'json' } });
                done();
            });
        });

        it('parses cookie (iron)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.add('key', { encoding: 'iron', password: password });
            definitions.parse('key=Fe26.2**8ec29d2e64ab19a0429faab76c46167c933b7c2c94dac8022bb4c97de0fc359d*O2aDw2nk5Svfc4xiuatycw*DWWOPpI3-B6Bb4oOOuNxGT8v9S4jZ_hpQZaaeYREvuk**34d98c193fd2048b40655966115d75dae62aab96cd1f5b374908b86fc47a61d3*H_zsHSt6UoOj3QgBIuNMrNHAUosM6Sp51uLKak0ZUjg', (err, states, failed) => {

                expect(err).to.not.exist();
                expect(failed).to.have.length(0);
                expect(states).to.equal({ key: { a: 1, b: 2, c: 3 } });
                done();
            });
        });

        it('parses cookie (iron settings)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.add('key', { encoding: 'iron', password: password, iron: Iron.defaults });
            definitions.parse('key=Fe26.2**8ec29d2e64ab19a0429faab76c46167c933b7c2c94dac8022bb4c97de0fc359d*O2aDw2nk5Svfc4xiuatycw*DWWOPpI3-B6Bb4oOOuNxGT8v9S4jZ_hpQZaaeYREvuk**34d98c193fd2048b40655966115d75dae62aab96cd1f5b374908b86fc47a61d3*H_zsHSt6UoOj3QgBIuNMrNHAUosM6Sp51uLKak0ZUjg', (err, states, failed) => {

                expect(err).to.not.exist();
                expect(failed).to.have.length(0);
                expect(states).to.equal({ key: { a: 1, b: 2, c: 3 } });
                done();
            });
        });

        it('parses cookie (signed form)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.add('sid', { encoding: 'form', sign: { password: password } });

            definitions.parse('sid=a=1&b=2&c=3%20x.2d75635d74c1a987f84f3ee7f3113b9a2ff71f89d6692b1089f19d5d11d140f8*anm-37hjjRC3eY7Mcv4gP7gXgXBKTtUz9fNFWnetEZo', (err, states, failed) => {

                expect(err).to.not.exist();
                expect(failed).to.have.length(0);
                expect(states).to.equal({ sid: { a: '1', b: '2', c: '3 x' } });
                done();
            });
        });

        it('parses cookie (signed form integrity settings)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.add('sid', { encoding: 'form', sign: { password: password, integrity: Iron.defaults.integrity } });
            definitions.parse('sid=a=1&b=2&c=3%20x.2d75635d74c1a987f84f3ee7f3113b9a2ff71f89d6692b1089f19d5d11d140f8*anm-37hjjRC3eY7Mcv4gP7gXgXBKTtUz9fNFWnetEZo', (err, states, failed) => {

                expect(err).to.not.exist();
                expect(failed).to.have.length(0);
                expect(states.sid).to.equal({ a: '1', b: '2', c: '3 x' });
                expect(states).to.equal({ sid: { a: '1', b: '2', c: '3 x' } });
                done();
            });
        });

        it('parses cookie (cookie level strict override)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.add('a', { strictHeader: false });
            definitions.parse('a="1', (err, states, failed) => {

                expect(err).to.not.exist();
                expect(failed).to.have.length(0);
                expect(states).to.equal({ a: '"1' });
                done();
            });
        });

        it('fails parsing cookie (mismatching quotes)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.parse('a="1; b="2"; c=3', (err, states, failed) => {

                expect(err).to.exist();
                expect(err.data).to.equal([
                    {
                        name: 'a',
                        value: '"1',
                        settings: {
                            isSecure: false,
                            isHttpOnly: false,
                            path: null,
                            domain: null,
                            ttl: null,
                            encoding: 'none',
                            strictHeader: true,
                            ignoreErrors: false
                        },
                        reason: 'Invalid cookie value'
                    }
                ]);

                expect(failed).to.equal(err.data);

                done();
            });
        });

        it('ignores failed parsing cookie (mismatching quotes)', (done) => {

            const definitions = new Statehood.Definitions({ ignoreErrors: true });
            definitions.parse('a="1; b="2"; c=3', (err, states, failed) => {

                expect(err).to.not.exist();
                expect(failed).to.equal([
                    {
                        name: 'a',
                        value: '"1',
                        settings: {
                            isSecure: false,
                            isHttpOnly: false,
                            path: null,
                            domain: null,
                            ttl: null,
                            encoding: 'none',
                            strictHeader: true,
                            ignoreErrors: true
                        },
                        reason: 'Invalid cookie value'
                    }
                ]);
                done();
            });
        });

        it('ignores failed parsing cookie (cookie settings)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.add('a', { ignoreErrors: true });
            definitions.parse('a="1', (err, states, failed) => {

                expect(err).to.not.exist();
                done();
            });
        });

        it('fails parsing cookie (name)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.parse('a@="1"; b="2"; c=3', (err, states, failed) => {

                expect(err).to.exist();
                expect(err.data).to.equal([
                    {
                        name: 'a@',
                        value: '1',
                        settings: {
                            isSecure: false,
                            isHttpOnly: false,
                            path: null,
                            domain: null,
                            ttl: null,
                            encoding: 'none',
                            strictHeader: true,
                            ignoreErrors: false
                        },
                        reason: 'Invalid cookie name'
                    }
                ]);
                done();
            });
        });

        it('fails parsing cookie (multiple)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.parse('a@="1"; b@="2"; c=3', (err, states, failed) => {

                expect(err).to.exist();
                expect(err.data).to.equal([
                    {
                        name: 'a@',
                        value: '1',
                        settings: {
                            isSecure: false,
                            isHttpOnly: false,
                            path: null,
                            domain: null,
                            ttl: null,
                            encoding: 'none',
                            strictHeader: true,
                            ignoreErrors: false
                        },
                        reason: 'Invalid cookie name'
                    },
                    {
                        name: 'b@',
                        value: '2',
                        settings: {
                            isSecure: false,
                            isHttpOnly: false,
                            path: null,
                            domain: null,
                            ttl: null,
                            encoding: 'none',
                            strictHeader: true,
                            ignoreErrors: false
                        },
                        reason: 'Invalid cookie name'
                    }
                ]);
                done();
            });
        });

        it('ignores failed parsing cookie (name)', (done) => {

            const definitions = new Statehood.Definitions({ ignoreErrors: true });
            definitions.parse('a@="1"; b="2"; c=3', (err, states, failed) => {

                expect(err).to.not.exist();
                done();
            });
        });

        it('fails parsing cookie (empty pair)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.parse('a=1; b=2; c=3;;', (err, states, failed) => {

                expect(err).to.exist();
                expect(err.message).to.equal('Invalid cookie header');
                done();
            });
        });

        it('fails parsing cookie (base64json)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.add('x', { encoding: 'base64json' });
            definitions.parse('x=XeyJ0ZXN0aW5nIjoianNvbiJ9', (err, states, failed) => {

                expect(err).to.exist();
                expect(err.message).to.equal('Invalid cookie value');
                expect(err.data).to.equal([
                    {
                        name: 'x',
                        value: 'XeyJ0ZXN0aW5nIjoianNvbiJ9',
                        settings: {
                            strictHeader: true,
                            ignoreErrors: false,
                            isSecure: false,
                            isHttpOnly: false,
                            path: null,
                            domain: null,
                            ttl: null,
                            encoding: 'base64json'
                        },
                        reason: err.data[0].reason
                    }
                ]);

                done();
            });
        });

        it('ignores failed parsing cookie (base64json)', (done) => {

            const definitions = new Statehood.Definitions({ ignoreErrors: true });
            definitions.add('x', { encoding: 'base64json' });
            definitions.parse('x=XeyJ0ZXN0aW5nIjoianNvbiJ9', (err, states, failed) => {

                expect(err).to.not.exist();
                done();
            });
        });

        it('fails parsing cookie (double base64json)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.add('x', { encoding: 'base64json' });
            definitions.parse('x=XeyJ0ZXN0aW5nIjoianNvbiJ9; x=XeyJ0ZXN0aW5dnIjoianNvbiJ9', (err, states, failed) => {

                expect(err).to.exist();
                expect(err.message).to.equal('Invalid cookie value');
                done();
            });
        });

        it('ignores failed parsing cookie (double base64json)', (done) => {

            const definitions = new Statehood.Definitions({ ignoreErrors: true });
            definitions.add('x', { encoding: 'base64json' });
            definitions.parse('x=XeyJ0ZXN0aW5nIjoianNvbiJ9; x=XeyJ0ZXN0aW5dnIjoianNvbiJ9', (err, states, failed) => {

                expect(err).to.not.exist();
                done();
            });
        });

        it('fails parsing cookie (iron)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.add('key', { encoding: 'iron', password: password });
            definitions.parse('key=Fe26.1**f3fc42242467f7a97c042be866a32c1e7645045c2cc085124eadc66d25fc8395*URXpH8k-R0d4O5bnY23fRQ*uq9rd8ZzdjZqUrq9P2Ci0yZ-EEUikGzxTLn6QTcJ0bc**3880c0ac8bab054f529afec8660ebbbbc8050e192e39e5d622e7ac312b9860d0*r_g7N9kJYqXDrFlvOnuKpfpEWwrJLOKMXEI43LAGeFg', (err, states, failed) => {

                expect(err).to.exist();
                expect(err.message).to.equal('Invalid cookie value');
                done();
            });
        });

        it('fails parsing cookie (iron password)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.add('key', { encoding: 'iron', password: 'passwordx' });
            definitions.parse('key=Fe26.2**f3fc42242467f7a97c042be866a32c1e7645045c2cc085124eadc66d25fc8395*URXpH8k-R0d4O5bnY23fRQ*uq9rd8ZzdjZqUrq9P2Ci0yZ-EEUikGzxTLn6QTcJ0bc**3880c0ac8bab054f529afec8660ebbbbc8050e192e39e5d622e7ac312b9860d0*r_g7N9kJYqXDrFlvOnuKpfpEWwrJLOKMXEI43LAGeFg', (err, states, failed) => {

                expect(err).to.exist();
                expect(err.message).to.equal('Invalid cookie value');
                done();
            });
        });

        it('fails parsing cookie (signed form missing options)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.add('sid', { encoding: 'form', sign: {} });
            definitions.parse('sid=a=1&b=2&c=3%20x.2d75635d74c1a987f84f3ee7f3113b9a2ff71f89d6692b1089f19d5d11d140f8*khsb8lmkNJS-iljqDKZDMmd__2PcHBz7Ksrc-48gZ-0', (err, states, failed) => {

                expect(err).to.exist();
                expect(err.message).to.equal('Invalid cookie value');
                done();
            });
        });

        it('fails parsing cookie (signed form missing signature)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.add('sid', { encoding: 'form', sign: { password: password } });
            definitions.parse('sid=a=1&b=2&c=3%20x', (err, states, failed) => {

                expect(err).to.exist();
                expect(err.message).to.equal('Invalid cookie value');
                done();
            });
        });

        it('ignores failed parsing cookie (signed form missing signature)', (done) => {

            const definitions = new Statehood.Definitions({ ignoreErrors: true });
            definitions.add('sid', { encoding: 'form', sign: { password: password } });
            definitions.parse('sid=a=1&b=2&c=3%20x', (err, states, failed) => {

                expect(err).to.not.exist();
                done();
            });
        });

        it('fails parsing cookie (signed form missing signature double)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.add('sid', { encoding: 'form', sign: { password: password } });
            definitions.parse('sid=a=1&b=2&c=3%20x; sid=a=1&b=2&c=3%20x', (err, states, failed) => {

                expect(err).to.exist();
                expect(err.message).to.equal('Invalid cookie value');
                done();
            });
        });

        it('ignores failed parsing cookie (signed form missing signature double)', (done) => {

            const definitions = new Statehood.Definitions({ ignoreErrors: true });
            definitions.add('sid', { encoding: 'form', sign: { password: password } });
            definitions.parse('sid=a=1&b=2&c=3%20x; sid=a=1&b=2&c=3%20x', (err, states, failed) => {

                expect(err).to.not.exist();
                done();
            });
        });

        it('fails parsing cookie (signed form missing signature with sep)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.add('sid', { encoding: 'form', sign: { password: password } });
            definitions.parse('sid=a=1&b=2&c=3%20x.', (err, states, failed) => {

                expect(err).to.exist();
                expect(err.message).to.equal('Invalid cookie value');
                done();
            });
        });

        it('fails parsing cookie (signed form invalid signature)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.add('sid', { encoding: 'form', sign: { password: password } });
            definitions.parse('sid=a=1&b=2&c=3%20x.2d75635d74c1a987f84f3ee7f3113b9a2ff71f89d6692b1089f19d5d11d140f8', (err, states, failed) => {

                expect(err).to.exist();
                expect(err.message).to.equal('Invalid cookie value');
                done();
            });
        });

        it('fails parsing cookie (signed form wrong signature)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.add('sid', { encoding: 'form', sign: { password: password } });
            definitions.parse('sid=a=1&b=2&c=3%20x.2d75635d74c1a987f84f3ee7f3113b9a2ff71f89d6692b1089f19d5d11d140f8*-Ghc6WvkE55V-TzucCl0NVFmbijeCwgs5Hf5tAVbSUo', (err, states, failed) => {

                expect(err).to.exist();
                expect(err.message).to.equal('Invalid cookie value');
                done();
            });
        });
    });

    describe('format()', () => {

        it('skips an empty header', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.format(null, (err, header) => {

                expect(err).to.not.exist();
                expect(header).to.equal([]);
                done();
            });
        });

        it('skips an empty array', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.format([], (err, header) => {

                expect(err).to.not.exist();
                expect(header).to.equal([]);
                done();
            });
        });

        it('formats a header', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.format({ name: 'sid', value: 'fihfieuhr9384hf', options: { ttl: 3600, isSecure: true, isHttpOnly: true, path: '/', domain: 'example.com' } }, (err, header) => {

                const expires = new Date(Date.now() + 3600);
                expect(err).to.not.exist();
                expect(header[0]).to.equal('sid=fihfieuhr9384hf; Max-Age=3; Expires=' + expires.toUTCString() + '; Secure; HttpOnly; Domain=example.com; Path=/');
                done();
            });
        });

        it('formats a header (with null ttl)', (done) => {

            const definitions = new Statehood.Definitions({ ttl: 3600 });
            definitions.format({ name: 'sid', value: 'fihfieuhr9384hf', options: { ttl: null, isSecure: true, isHttpOnly: true, path: '/', domain: 'example.com' } }, (err, header) => {

                expect(err).to.not.exist();
                expect(header[0]).to.equal('sid=fihfieuhr9384hf; Secure; HttpOnly; Domain=example.com; Path=/');
                done();
            });
        });

        it('formats a header (with zero ttl)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.format({ name: 'sid', value: 'fihfieuhr9384hf', options: { ttl: 0, isSecure: true, isHttpOnly: true, path: '/', domain: 'example.com' } }, (err, header) => {

                expect(err).to.not.exist();
                expect(header[0]).to.equal('sid=fihfieuhr9384hf; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; HttpOnly; Domain=example.com; Path=/');
                done();
            });
        });

        it('formats a header with null value', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.format({ name: 'sid', options: { ttl: 3600, isSecure: true, isHttpOnly: true, path: '/', domain: 'example.com' } }, (err, header) => {

                const expires = new Date(Date.now() + 3600);
                expect(err).to.not.exist();
                expect(header[0]).to.equal('sid=; Max-Age=3; Expires=' + expires.toUTCString() + '; Secure; HttpOnly; Domain=example.com; Path=/');
                done();
            });
        });

        it('formats a header with server definition', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.add('sid', { ttl: 3600, isSecure: true, isHttpOnly: true, path: '/', domain: 'example.com' });
            definitions.format({ name: 'sid', value: 'fihfieuhr9384hf' }, (err, header) => {

                const expires = new Date(Date.now() + 3600);
                expect(err).to.not.exist();
                expect(header[0]).to.equal('sid=fihfieuhr9384hf; Max-Age=3; Expires=' + expires.toUTCString() + '; Secure; HttpOnly; Domain=example.com; Path=/');
                done();
            });
        });

        it('formats a header with server definition (base64)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.add('sid', { encoding: 'base64' });
            definitions.format({ name: 'sid', value: 'fihfieuhr9384hf' }, (err, header) => {

                expect(err).to.not.exist();
                expect(header[0]).to.equal('sid=ZmloZmlldWhyOTM4NGhm');
                done();
            });
        });

        it('formats a header with server definition (base64json)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.add('sid', { encoding: 'base64json' });
            definitions.format({ name: 'sid', value: { a: 1, b: 2, c: 3 } }, (err, header) => {

                expect(err).to.not.exist();
                expect(header[0]).to.equal('sid=eyJhIjoxLCJiIjoyLCJjIjozfQ==');
                done();
            });
        });

        it('fails on a header with server definition and bad value (base64json)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.add('sid', { encoding: 'base64json' });
            const bad = { a: {} };
            bad.b = bad.a;
            bad.a.x = bad.b;

            definitions.format({ name: 'sid', value: bad }, (err, header) => {

                expect(err).to.exist();
                done();
            });
        });

        it('formats a header with server definition (form)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.add('sid', { encoding: 'form' });
            definitions.format({ name: 'sid', value: { a: 1, b: 2, c: '3 x' } }, (err, header) => {

                expect(err).to.not.exist();
                expect(header[0]).to.equal('sid=a=1&b=2&c=3%20x');
                done();
            });
        });

        it('formats a header with server definition (form+sign)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.add('sid', {
                encoding: 'form',
                sign: {
                    password: password,
                    integrity: {
                        saltBits: 256,
                        algorithm: 'sha256',
                        iterations: 1,
                        salt: '2d75635d74c1a987f84f3ee7f3113b9a2ff71f89d6692b1089f19d5d11d140f8'
                    }
                }
            });
            definitions.format({ name: 'sid', value: { a: 1, b: 2, c: '3 x' } }, (err, header) => {

                expect(err).to.not.exist();
                expect(header[0]).to.equal('sid=a=1&b=2&c=3%20x.2d75635d74c1a987f84f3ee7f3113b9a2ff71f89d6692b1089f19d5d11d140f8*anm-37hjjRC3eY7Mcv4gP7gXgXBKTtUz9fNFWnetEZo');
                done();
            });
        });

        it('formats a header with server definition (form+sign, buffer password)', (done) => {

            const buffer = new Buffer('fa4321e8c21b44a49d382fa7709226855f40eb23a32b2f642c3fd797c958718e', 'base64');
            const definitions = new Statehood.Definitions();
            definitions.add('sid', {
                encoding: 'form',
                sign: {
                    password: buffer,
                    integrity: {
                        saltBits: 256,
                        algorithm: 'sha256',
                        iterations: 1,
                        salt: '2d75635d74c1a987f84f3ee7f3113b9a2ff71f89d6692b1089f19d5d11d140f8'
                    }
                }
            });
            definitions.format({ name: 'sid', value: { a: 1, b: 2, c: '3 x' } }, (err, header) => {

                expect(err).to.not.exist();
                expect(header[0]).to.equal('sid=a=1&b=2&c=3%20x.*4wjD4tIxyiNW-rC3xBqL56TxUbb_aQT5PMykruWlR0Q');
                done();
            });
        });

        it('fails a header with bad server definition (form+sign)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.add('sid', {
                encoding: 'form',
                sign: {}
            });
            definitions.format({ name: 'sid', value: { a: 1, b: 2, c: '3 x' } }, (err, header) => {

                expect(err).to.exist();
                expect(err.message).to.equal('Failed to sign cookie (sid) value: Empty password');
                done();
            });
        });

        it('formats a header with server definition (iron)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.add('sid', { encoding: 'iron', password: password });
            definitions.format({ name: 'sid', value: { a: 1, b: 2, c: 3 } }, (err, header) => {

                expect(err).to.not.exist();
                expect(header[0]).to.have.string('sid=Fe26.2*');
                done();
            });
        });

        it('formats a header with server definition (iron + options)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.add('sid', { encoding: 'iron', password: password, iron: Iron.defaults });
            definitions.format({ name: 'sid', value: { a: 1, b: 2, c: 3 } }, (err, header) => {

                expect(err).to.not.exist();
                expect(header[0]).to.have.string('sid=Fe26.2*');
                done();
            });
        });

        it('formats a header with server definition (iron + options, buffer password)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.add('sid', { encoding: 'iron', password: Cryptiles.randomBits(256), iron: Iron.defaults });
            definitions.format({ name: 'sid', value: { a: 1, b: 2, c: 3 } }, (err, header) => {

                expect(err).to.not.exist();
                expect(header[0]).to.have.string('sid=Fe26.2*');
                done();
            });
        });

        it('fails a header with bad server definition (iron)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.add('sid', { encoding: 'iron' });
            definitions.format({ name: 'sid', value: { a: 1, b: 2, c: 3 } }, (err, header) => {

                expect(err).to.exist();
                expect(err.message).to.equal('Failed to encode cookie (sid) value: Empty password');
                done();
            });
        });

        it('formats a header with multiple cookies', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.format([
                { name: 'sid', value: 'fihfieuhr9384hf', options: { ttl: 3600, isSecure: true, isHttpOnly: true, path: '/', domain: 'example.com' } },
                { name: 'pid', value: 'xyz' }
            ], (err, header) => {

                const expires = new Date(Date.now() + 3600);
                expect(err).to.not.exist();
                expect(header[0]).to.equal('sid=fihfieuhr9384hf; Max-Age=3; Expires=' + expires.toUTCString() + '; Secure; HttpOnly; Domain=example.com; Path=/');
                expect(header[1]).to.equal('pid=xyz');
                done();
            });
        });

        it('fails on bad cookie name', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.format({ name: 's;id', value: 'fihfieuhr9384hf', options: { isSecure: true, isHttpOnly: false, path: '/', domain: 'example.com' } }, (err, header) => {

                expect(err).to.exist();
                expect(err.message).to.equal('Invalid cookie name: s;id');
                done();
            });
        });

        it('allows bad cookie name in loose mode', (done) => {

            const definitions = new Statehood.Definitions({ strictHeader: false });
            definitions.format({ name: 's;id', value: 'fihfieuhr9384hf', options: { isSecure: true, isHttpOnly: false, path: '/', domain: 'example.com' } }, (err, header) => {

                expect(err).to.not.exist();
                expect(header[0]).to.equal('s;id=fihfieuhr9384hf; Secure; Domain=example.com; Path=/');
                done();
            });
        });

        it('allows empty cookie name in loose mode', (done) => {

            const definitions = new Statehood.Definitions({ strictHeader: false });
            definitions.format({ name: '', value: 'fihfieuhr9384hf', options: { isSecure: true, isHttpOnly: false, path: '/', domain: 'example.com' } }, (err, header) => {

                expect(err).to.not.exist();
                expect(header[0]).to.equal('=fihfieuhr9384hf; Secure; Domain=example.com; Path=/');
                done();
            });
        });

        it('allows bad cookie name in loose mode (cookie level)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.add('s;id', { strictHeader: false });
            definitions.format({ name: 's;id', value: 'fihfieuhr9384hf', options: { isSecure: true, isHttpOnly: false, path: '/', domain: 'example.com' } }, (err, header) => {

                expect(err).to.not.exist();
                expect(header[0]).to.equal('s;id=fihfieuhr9384hf; Secure; Domain=example.com; Path=/');
                done();
            });
        });

        it('fails on bad cookie value', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.format({ name: 'sid', value: 'fi"hfieuhr9384hf', options: { isSecure: true, isHttpOnly: false, path: '/', domain: 'example.com' } }, (err, header) => {

                expect(err).to.exist();
                expect(err.message).to.equal('Invalid cookie value: fi"hfieuhr9384hf');
                done();
            });
        });

        it('fails on bad cookie value (non string)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.format({ name: 'sid', value: {}, options: { isSecure: true, isHttpOnly: false, path: '/', domain: 'example.com' } }, (err, header) => {

                expect(err).to.exist();
                expect(err.message).to.equal('Invalid cookie value: [object Object]');
                done();
            });
        });

        it('allows bad cookie value in loose mode', (done) => {

            const definitions = new Statehood.Definitions({ strictHeader: false });
            definitions.format({ name: 'sid', value: 'fi"hfieuhr9384hf', options: { isSecure: true, isHttpOnly: false, path: '/', domain: 'example.com' } }, (err, header) => {

                expect(err).to.not.exist();
                expect(header[0]).to.equal('sid=fi"hfieuhr9384hf; Secure; Domain=example.com; Path=/');
                done();
            });
        });

        it('fails on bad cookie domain', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.format({ name: 'sid', value: 'fihfieuhr9384hf', options: { isSecure: true, isHttpOnly: false, path: '/', domain: '-example.com' } }, (err, header) => {

                expect(err).to.exist();
                expect(err.message).to.equal('Invalid cookie domain: -example.com');
                done();
            });
        });

        it('fails on too long cookie domain', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.format({ name: 'sid', value: 'fihfieuhr9384hf', options: { isSecure: true, isHttpOnly: false, path: '/', domain: '1234567890123456789012345678901234567890123456789012345678901234567890.example.com' } }, (err, header) => {

                expect(err).to.exist();
                expect(err.message).to.equal('Cookie domain too long: 1234567890123456789012345678901234567890123456789012345678901234567890.example.com');
                done();
            });
        });

        it('formats a header with cookie domain with . prefix', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.format({ name: 'sid', value: 'fihfieuhr9384hf', options: { isSecure: true, isHttpOnly: false, path: '/', domain: '.12345678901234567890.example.com' } }, (err, header) => {

                expect(err).to.not.exist();
                done();
            });
        });

        it('fails on bad cookie path', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.format({ name: 'sid', value: 'fihfieuhr9384hf', options: { isSecure: true, isHttpOnly: false, path: 'd', domain: 'example.com' } }, (err, header) => {

                expect(err).to.exist();
                expect(err.message).to.equal('Invalid cookie path: d');
                done();
            });
        });
    });

    describe('passThrough()', () => {

        it('returns header unchanged', (done) => {

            const definitions = new Statehood.Definitions();
            const header = 'a=4;b=5;c=6';
            const result = definitions.passThrough(header);
            expect(result).to.equal(header);
            done();
        });

        it('returns header excluding local', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.add('b');
            const header = 'a=4;b=5;c=6';
            const result = definitions.passThrough(header);
            expect(result).to.equal('a=4;c=6');
            done();
        });

        it('returns header including local (fallback)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.add('b');
            const header = 'a=4;b=5;c=6';
            const result = definitions.passThrough(header, true);
            expect(result).to.equal('a=4;b=5;c=6');
            done();
        });

        it('returns header including local (state option)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.add('b', { passThrough: true });
            const header = 'a=4;b=5;c=6';
            const result = definitions.passThrough(header);
            expect(result).to.equal('a=4;b=5;c=6');
            done();
        });

        it('returns header including local (state option with fallback)', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.add('b', { passThrough: false });
            const header = 'a=4;b=5;c=6';
            const result = definitions.passThrough(header, true);
            expect(result).to.equal('a=4;c=6');
            done();
        });

        it('errors on invalid header', (done) => {

            const definitions = new Statehood.Definitions();
            definitions.add('b');
            const header = 'a=4;b=5;c=6;;';
            const result = definitions.passThrough(header);
            expect(result.message).to.equal('Invalid cookie header');
            done();
        });
    });
});

describe('prepareValue()', () => {

    it('throws when missing options', (done) => {

        expect(() => {

            Statehood.prepareValue('name', 'value');
        }).to.throw('Missing or invalid options');
        done();
    });
});

describe('exclude()', () => {

    it('returns all keys', (done) => {

        const header = 'a=4;b=5;c=6';
        const result = Statehood.exclude(header, []);
        expect(result).to.equal(header);
        done();
    });

    it('returns keys without excluded', (done) => {

        const header = 'a=4;b=5;c=6';
        const result = Statehood.exclude(header, ['b']);
        expect(result).to.equal('a=4;c=6');
        done();
    });

    it('returns keys without excluded (empty name)', (done) => {

        const header = '=4;b=5;c=6';
        const result = Statehood.exclude(header, ['']);
        expect(result).to.equal('b=5;c=6');
        done();
    });

    it('returns error on invalid header', (done) => {

        const header = 'a';
        const result = Statehood.exclude(header, ['b']);
        expect(result.message).to.equal('Invalid cookie header');
        done();
    });
});
