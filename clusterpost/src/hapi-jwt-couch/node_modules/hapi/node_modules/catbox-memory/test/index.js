'use strict';

// Load modules

const Code = require('code');
const Lab = require('lab');
const Catbox = require('catbox');
const Memory = require('..');


// Declare internals

const internals = {};


// Test shortcuts

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;


describe('Memory', () => {

    it('throws an error if not created with new', (done) => {

        const fn = () => {

            Memory();
        };

        expect(fn).to.throw(Error);
        done();
    });

    it('creates a new connection', (done) => {

        const client = new Catbox.Client(Memory);

        client.start((err) => {

            expect(err).to.not.exist();
            expect(client.isReady()).to.equal(true);
            done();
        });
    });

    it('closes the connection', (done) => {

        const client = new Catbox.Client(Memory);

        client.start((err) => {

            expect(err).to.not.exist();
            expect(client.isReady()).to.equal(true);
            client.stop();
            expect(client.isReady()).to.equal(false);
            done();
        });
    });

    it('gets an item after setting it', (done) => {

        const client = new Catbox.Client(Memory);

        client.start((err) => {

            expect(err).to.not.exist();
            const key = { id: 'x', segment: 'test' };
            client.set(key, '123', 500, (err) => {

                expect(err).to.not.exist();
                client.get(key, (err, result) => {

                    expect(err).to.equal(null);
                    expect(result.item).to.equal('123');
                    done();
                });
            });
        });
    });

    it('buffers can be set and retrieved when allowMixedContent is true', (done) => {

        const buffer = new Buffer('string value');
        const client = new Catbox.Client(new Memory({ allowMixedContent: true }));

        client.start((err) => {

            expect(err).to.not.exist();
            const key = { id: 'x', segment: 'test' };
            client.set(key, buffer, 500, (err) => {

                expect(err).to.not.exist();
                client.get(key, (err, result) => {

                    expect(err).to.not.exist();
                    expect(result.item instanceof Buffer).to.equal(true);
                    expect(result.item).to.deep.equal(buffer);
                    done();
                });
            });
        });
    });

    it('buffers are copied before storing when allowMixedContent is true', (done) => {

        const buffer = new Buffer('string value');
        const client = new Catbox.Client(new Memory({ allowMixedContent: true }));

        client.start((err) => {

            expect(err).to.not.exist();
            const key = { id: 'x', segment: 'test' };
            client.set(key, buffer, 500, (err) => {

                expect(err).to.not.exist();
                client.get(key, (err, result) => {

                    expect(err).to.not.exist();
                    expect(result.item).to.not.equal(buffer);
                    done();
                });
            });
        });
    });

    it('buffers are stringified when allowMixedContent is not true', (done) => {

        const buffer = new Buffer('string value');
        const client = new Catbox.Client(new Memory());

        client.start((err) => {

            expect(err).to.not.exist();
            const key = { id: 'x', segment: 'test' };
            client.set(key, buffer, 500, (err) => {

                expect(err).to.not.exist();
                client.get(key, (err, result) => {

                    expect(err).to.not.exist();
                    expect(result.item instanceof Buffer).to.equal(false);
                    expect(result.item).to.deep.equal(JSON.parse(JSON.stringify(buffer)));
                    done();
                });
            });
        });
    });

    it('gets an item after setting it (no memory limit)', (done) => {

        const client = new Catbox.Client(new Memory({ maxByteSize: 0 }));

        client.start((err) => {

            expect(err).to.not.exist();
            const key = { id: 'x', segment: 'test' };
            client.set(key, '123', 500, (err) => {

                expect(err).to.not.exist();
                client.get(key, (err, result) => {

                    expect(err).to.equal(null);
                    expect(result.item).to.equal('123');

                    client.set(key, '345', 500, (err) => {

                        expect(err).to.not.exist();
                        client.get(key, (err, data) => {

                            expect(err).to.equal(null);
                            expect(data.item).to.equal('345');
                            done();
                        });
                    });
                });
            });
        });
    });

    it('fails setting an item circular references', (done) => {

        const client = new Catbox.Client(Memory);

        client.start((err) => {

            expect(err).to.not.exist();

            const key = { id: 'x', segment: 'test' };
            const value = { a: 1 };

            value.b = value;
            client.set(key, value, 10, (err) => {

                expect(err.message).to.equal('Converting circular structure to JSON');
                done();
            });
        });
    });

    it('fails setting an item with very long ttl', (done) => {

        const client = new Catbox.Client(Memory);

        client.start((err) => {

            expect(err).to.not.exist();

            const key = { id: 'x', segment: 'test' };

            client.set(key, '123', Math.pow(2, 31), (err) => {

                expect(err.message).to.equal('Invalid ttl (greater than 2147483647)');
                done();
            });
        });
    });

    it('ignored starting a connection twice on same event', (done) => {

        const client = new Catbox.Client(Memory);
        let x = 2;
        const start = () => {

            client.start((err) => {

                expect(err).to.not.exist();
                expect(client.isReady()).to.equal(true);
                --x;
                if (!x) {
                    done();
                }
            });
        };

        start();
        start();
    });

    it('ignored starting a connection twice chained', (done) => {

        const client = new Catbox.Client(Memory);

        client.start((err) => {

            expect(err).to.not.exist();
            expect(client.isReady()).to.equal(true);

            client.start((err) => {

                expect(err).to.not.exist();
                expect(client.isReady()).to.equal(true);
                done();
            });
        });
    });

    it('returns not found on get when using null key', (done) => {

        const client = new Catbox.Client(Memory);

        client.start((err) => {

            expect(err).to.not.exist();
            client.get(null, (err, result) => {

                expect(err).to.equal(null);
                expect(result).to.equal(null);
                done();
            });
        });
    });

    it('returns not found on get when item expired', (done) => {

        const client = new Catbox.Client(Memory);

        client.start((err) => {

            expect(err).to.not.exist();
            const key = { id: 'x', segment: 'test' };

            client.set(key, 'x', 1, (err) => {

                expect(err).to.not.exist();
                setTimeout(() => {

                    client.get(key, (err, result) => {

                        expect(err).to.equal(null);
                        expect(result).to.equal(null);
                        done();
                    });
                }, 2);
            });
        });
    });

    it('errors on set when using null key', (done) => {

        const client = new Catbox.Client(Memory);

        client.start((err) => {

            expect(err).to.not.exist();
            client.set(null, {}, 1000, (err) => {

                expect(err instanceof Error).to.equal(true);
                done();
            });
        });
    });

    it('errors on get when using invalid key', (done) => {

        const client = new Catbox.Client(Memory);

        client.start((err) => {

            expect(err).to.not.exist();
            client.get({}, (err) => {

                expect(err instanceof Error).to.equal(true);
                done();
            });
        });
    });

    it('errors on set when using invalid key', (done) => {

        const client = new Catbox.Client(Memory);

        client.start((err) => {

            expect(err).to.not.exist();
            client.set({}, {}, 1000, (err) => {

                expect(err instanceof Error).to.equal(true);
                done();
            });
        });
    });

    it('ignores set when using non-positive ttl value', (done) => {

        const client = new Catbox.Client(Memory);

        client.start((err) => {

            expect(err).to.not.exist();
            const key = { id: 'x', segment: 'test' };

            client.set(key, 'y', 0, (err) => {

                expect(err).to.not.exist();
                done();
            });
        });
    });

    it('errors on get when stopped', (done) => {

        const client = new Catbox.Client(Memory);
        client.stop();
        const key = { id: 'x', segment: 'test' };

        client.connection.get(key, (err, result) => {

            expect(err).to.exist();
            expect(result).to.not.exist();
            done();
        });
    });

    it('errors on set when stopped', (done) => {

        const client = new Catbox.Client(Memory);
        client.stop();
        const key = { id: 'x', segment: 'test' };
        client.connection.set(key, 'y', 1, (err) => {

            expect(err).to.exist();
            done();
        });
    });

    it('errors on missing segment name', (done) => {

        const config = {
            expiresIn: 50000
        };
        const fn = () => {

            const client = new Catbox.Client(Memory);
            const cache = new Catbox.Policy(config, client, '');    // eslint-disable-line no-unused-vars
        };
        expect(fn).to.throw(Error);
        done();
    });

    it('errors on bad segment name', (done) => {

        const config = {
            expiresIn: 50000
        };
        const fn = () => {

            const client = new Catbox.Client(Memory);
            const cache = new Catbox.Policy(config, client, 'a\u0000b');    // eslint-disable-line no-unused-vars
        };
        expect(fn).to.throw(Error);
        done();
    });

    it('cleans up timers when stopped', { parallel: false }, (done) => {

        let cleared;
        let set;

        const oldClear = clearTimeout;
        clearTimeout = function (id) {

            cleared = id;
            return oldClear(id);
        };

        const oldSet = setTimeout;
        setTimeout = function (fn, time) {

            set = oldSet(fn, time);
            return set;
        };

        const client = new Catbox.Client(Memory);
        client.start((err) => {

            expect(err).to.not.exist();
            const key = { id: 'x', segment: 'test' };
            client.set(key, '123', 500, (err) => {

                client.stop();
                clearTimeout = oldClear;
                setTimeout = oldSet;
                expect(err).to.not.exist();
                expect(cleared).to.exist();
                expect(cleared).to.equal(set);
                done();
            });
        });
    });

    describe('start()', () => {

        it('creates an empty cache object', (done) => {

            const memory = new Memory();
            expect(memory.cache).to.not.exist();
            memory.start(() => {

                expect(memory.cache).to.exist();
                done();
            });
        });
    });

    describe('stop()', () => {

        it('sets the cache object to null', (done) => {

            const memory = new Memory();
            expect(memory.cache).to.not.exist();
            memory.start(() => {

                expect(memory.cache).to.exist();
                memory.stop();
                expect(memory.cache).to.not.exist();
                done();
            });
        });
    });

    describe('get()', () => {

        it('errors on invalid json in cache', (done) => {

            const key = {
                segment: 'test',
                id: 'test'
            };

            const memory = new Memory();
            expect(memory.cache).to.not.exist();

            memory.start(() => {

                expect(memory.cache).to.exist();
                memory.set(key, 'myvalue', 10, () => {

                    expect(memory.cache[key.segment][key.id].item).to.equal('"myvalue"');
                    memory.cache[key.segment][key.id].item = '"myvalue';
                    memory.get(key, (err, result) => {

                        expect(err.message).to.equal('Bad value content');
                        done();
                    });
                });
            });
        });

        it('returns not found on missing segment', (done) => {

            const key = {
                segment: 'test',
                id: 'test'
            };

            const memory = new Memory();
            expect(memory.cache).to.not.exist();

            memory.start(() => {

                expect(memory.cache).to.exist();
                memory.get(key, (err, result) => {

                    expect(err).to.not.exist();
                    expect(result).to.not.exist();
                    done();
                });
            });
        });
    });

    describe('set()', () => {

        it('adds an item to the cache object', (done) => {

            const key = {
                segment: 'test',
                id: 'test'
            };

            const memory = new Memory();
            expect(memory.cache).to.not.exist();

            memory.start(() => {

                expect(memory.cache).to.exist();
                memory.set(key, 'myvalue', 10, () => {

                    expect(memory.cache[key.segment][key.id].item).to.equal('"myvalue"');
                    done();
                });
            });
        });

        it('removes an item from the cache object when it expires', (done) => {

            const key = {
                segment: 'test',
                id: 'test'
            };

            const memory = new Memory();
            expect(memory.cache).to.not.exist();

            memory.start(() => {

                expect(memory.cache).to.exist();
                memory.set(key, 'myvalue', 10, () => {

                    expect(memory.cache[key.segment][key.id].item).to.equal('"myvalue"');
                    setTimeout(() => {

                        expect(memory.cache[key.segment][key.id]).to.not.exist();
                        done();
                    }, 15);
                });
            });
        });

        it('errors when the maxByteSize has been reached', (done) => {

            const key = {
                segment: 'test',
                id: 'test'
            };

            const memory = new Memory({ maxByteSize: 4 });
            expect(memory.cache).to.not.exist();

            memory.start(() => {

                expect(memory.cache).to.exist();
                memory.set(key, 'myvalue', 10, (err) => {

                    expect(err).to.exist();
                    expect(err).to.be.instanceOf(Error);
                    done();
                });
            });
        });

        it('increments the byte size when an item is inserted and errors when the limit is reached', (done) => {

            const key1 = {
                segment: 'test',
                id: 'test'
            };

            const key2 = {
                segment: 'test',
                id: 'test2'
            };

            // maxByteSize is slightly larger than the first key so we are left with a small
            // amount of free space, but not enough for the second key to be created.
            const memory = new Memory({ maxByteSize: 200 });
            expect(memory.cache).to.not.exist();

            memory.start(() => {

                expect(memory.cache).to.exist();
                memory.set(key1, 'my', 10, (err) => {

                    expect(err).to.not.exist();
                    expect(memory.cache[key1.segment][key1.id].item).to.equal('"my"');

                    memory.set(key2, 'myvalue', 10, (err) => {

                        expect(err).to.exist();
                        done();
                    });
                });
            });
        });

        it('increments the byte size when an object is inserted', (done) => {

            const key1 = {
                segment: 'test',
                id: 'test'
            };
            const itemToStore = {
                my: {
                    array: [1, 2, 3],
                    bool: true,
                    string: 'test'
                }
            };

            const memory = new Memory({ maxByteSize: 2000 });
            expect(memory.cache).to.not.exist();

            memory.start(() => {

                expect(memory.cache).to.exist();
                memory.set(key1, itemToStore, 10, () => {

                    expect(memory.byteSize).to.equal(204);
                    expect(memory.cache[key1.segment][key1.id].byteSize).to.equal(204);
                    expect(memory.cache[key1.segment][key1.id].item).to.exist();
                    done();
                });
            });
        });

        it('leaves the byte size unchanged when an object overrides existing key with same size', (done) => {

            const key1 = {
                segment: 'test',
                id: 'test'
            };
            const itemToStore = {
                my: {
                    array: [1, 2, 3],
                    bool: true,
                    string: 'test',
                    undefined: undefined
                }
            };

            const memory = new Memory({ maxByteSize: 2000 });
            expect(memory.cache).to.not.exist();

            memory.start(() => {

                expect(memory.cache).to.exist();
                memory.set(key1, itemToStore, 10, () => {

                    expect(memory.cache[key1.segment][key1.id].byteSize).to.equal(204);
                    expect(memory.cache[key1.segment][key1.id].item).to.exist();
                    memory.set(key1, itemToStore, 10, () => {

                        expect(memory.cache[key1.segment][key1.id].byteSize).to.equal(204);
                        expect(memory.cache[key1.segment][key1.id].item).to.exist();
                        done();
                    });
                });
            });
        });
    });

    describe('drop()', () => {

        it('drops an existing item', (done) => {

            const client = new Catbox.Client(Memory);
            client.start((err) => {

                expect(err).to.not.exist();
                const key = { id: 'x', segment: 'test' };
                client.set(key, '123', 500, (err) => {

                    expect(err).to.not.exist();
                    client.get(key, (err, result) => {

                        expect(err).to.equal(null);
                        expect(result.item).to.equal('123');
                        client.drop(key, (err) => {

                            expect(err).to.not.exist();
                            done();
                        });
                    });
                });
            });
        });

        it('drops an item from a missing segment', (done) => {

            const client = new Catbox.Client(Memory);
            client.start((err) => {

                expect(err).to.not.exist();
                const key = { id: 'x', segment: 'test' };
                client.drop(key, (err) => {

                    expect(err).to.not.exist();
                    done();
                });
            });
        });

        it('drops a missing item', (done) => {

            const client = new Catbox.Client(Memory);
            client.start((err) => {

                expect(err).to.not.exist();
                const key = { id: 'x', segment: 'test' };
                client.set(key, '123', 500, (err) => {

                    expect(err).to.not.exist();
                    client.get(key, (err, result) => {

                        expect(err).to.equal(null);
                        expect(result.item).to.equal('123');
                        client.drop({ id: 'y', segment: 'test' }, (err) => {

                            expect(err).to.not.exist();
                            done();
                        });
                    });
                });
            });
        });

        it('errors on drop when using invalid key', (done) => {

            const client = new Catbox.Client(Memory);
            client.start((err) => {

                expect(err).to.not.exist();
                client.drop({}, (err) => {

                    expect(err instanceof Error).to.equal(true);
                    done();
                });
            });
        });

        it('errors on drop when using null key', (done) => {

            const client = new Catbox.Client(Memory);
            client.start((err) => {

                expect(err).to.not.exist();
                client.drop(null, (err) => {

                    expect(err instanceof Error).to.equal(true);
                    done();
                });
            });
        });

        it('errors on drop when stopped', (done) => {

            const client = new Catbox.Client(Memory);
            client.stop();
            const key = { id: 'x', segment: 'test' };
            client.connection.drop(key, (err) => {

                expect(err).to.exist();
                done();
            });
        });

        it('errors when cache item dropped while stopped', (done) => {

            const client = new Catbox.Client(Memory);
            client.stop();
            client.drop('a', (err) => {

                expect(err).to.exist();
                done();
            });
        });
    });

    describe('validateSegmentName()', () => {

        it('errors when the name is empty', (done) => {

            const memory = new Memory();
            const result = memory.validateSegmentName('');

            expect(result).to.be.instanceOf(Error);
            expect(result.message).to.equal('Empty string');
            done();
        });

        it('errors when the name has a null character', (done) => {

            const memory = new Memory();
            const result = memory.validateSegmentName('\u0000test');

            expect(result).to.be.instanceOf(Error);
            done();
        });

        it('returns null when there are no errors', (done) => {

            const memory = new Memory();
            const result = memory.validateSegmentName('valid');

            expect(result).to.not.be.instanceOf(Error);
            expect(result).to.equal(null);
            done();
        });
    });
});
