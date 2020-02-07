'use strict';

// Load modules

const Events = require('events');
const Stream = require('stream');
const Util = require('util');
const Code = require('code');
const Lab = require('lab');
const Peekaboo = require('..');


// Declare internals

const internals = {};


// Test shortcuts

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;


describe('Peek', () => {

    it('taps into pass-through stream', (done) => {

        // Source

        const Source = function (values) {

            this.data = values;
            this.pos = 0;

            Stream.Readable.call(this);
        };

        Util.inherits(Source, Stream.Readable);

        Source.prototype._read = function (/* size */) {

            if (this.pos === this.data.length) {
                this.push(null);
                return;
            }

            this.push(this.data[this.pos++]);
        };

        // Target

        const Target = function () {

            this.data = [];

            Stream.Writable.call(this);
        };

        Util.inherits(Target, Stream.Writable);

        Target.prototype._write = function (chunk, encoding, callback) {

            this.data.push(chunk.toString());
            return callback();
        };

        // Peek

        const emitter = new Events.EventEmitter();
        const peek = new Peekaboo(emitter);

        const chunks = ['abcd', 'efgh', 'ijkl', 'mnop', 'qrst', 'uvwx'];
        const source = new Source(chunks);
        const target = new Target();

        const seen = [];
        emitter.on('peek', (chunk, encoding) => {

            seen.push(chunk.toString());
        });

        emitter.once('finish', () => {

            expect(seen).to.deep.equal(chunks);
            expect(target.data).to.deep.equal(chunks);
            done();
        });

        source.pipe(peek).pipe(target);
    });
});
