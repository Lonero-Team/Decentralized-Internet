'use strict';

// Load modules

const Path = require('path');
const Hoek = require('hoek');
const MimeDb = require('mime-db');


// Declare internals

const internals = {};


internals.compressibleRx = /^text\/|\+json$|\+text$|\+xml$/;


module.exports = internals.Mimos = function (options) {

    options = options || {};

    Hoek.assert(this && this.constructor === internals.Mimos, 'Mimos must be created with new');

    const result = options.override ? internals.compile(options.override) : internals.base;
    this._byType = result.byType;
    this._byExtension = result.byExtension;
};


internals.compile = function (override) {

    const db = Hoek.clone(MimeDb);
    Hoek.merge(db, override, true, false);

    const result = {
        byType: db,
        byExtension: {}
    };

    const keys = Object.keys(result.byType);
    for (let i = 0; i < keys.length; ++i) {
        const type = keys[i];
        const mime = result.byType[type];
        mime.type = mime.type || type;
        mime.source = mime.source || 'mime-db';
        mime.extensions = mime.extensions || [];
        mime.compressible = (mime.compressible !== undefined ? mime.compressible : internals.compressibleRx.test(type));

        Hoek.assert(!mime.predicate || typeof mime.predicate === 'function', 'predicate option must be a function');

        for (let j = 0; j < mime.extensions.length; ++j) {
            const ext = mime.extensions[j];
            result.byExtension[ext] = mime;
        }
    }

    return result;
};


internals.base = internals.compile();       // Prevents an expensive copy on each constructor when no customization is needed


internals.Mimos.prototype.path = function (path) {

    const extension = Path.extname(path).slice(1).toLowerCase();
    const mime = this._byExtension[extension] || {};

    if (mime.predicate) {
        return mime.predicate(Hoek.clone(mime));
    }

    return mime;
};


internals.Mimos.prototype.type = function (type) {

    type = type.split(';', 1)[0].trim().toLowerCase();
    let mime = this._byType[type];
    if (!mime) {
        mime = {
            type: type,
            source: 'mimos',
            extensions: [],
            compressible: internals.compressibleRx.test(type)
        };

        this._byType[type] = mime;
        return mime;
    }

    if (mime.predicate) {
        return mime.predicate(Hoek.clone(mime));
    }

    return mime;
};
