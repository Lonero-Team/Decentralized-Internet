var tar = require('tar-fs'),
    zlib = require('zlib'),
    fs = require('fs');

module.exports = {
    compress: function(params, callback) {
        params.options = params.options || {};
        callback = callback || function() {};
        var error = function(error) {
            return callback(error);
        };
        process.nextTick(function() {
            tar.pack(params.source, params.options)
                .on('error', error)
                .pipe(zlib.createGzip({
                        level: params.level || 6,
                        memLevel: params.memLevel || 6
                    })
                    .on('error', error))
                .pipe(fs.createWriteStream(params.destination)
                    .on('error', error)
                    .on('finish', function() {
                        return callback(null);
                    }));
        });
    },
    decompress: function(params, callback) {
        params.options = params.options || {};
        callback = callback || function() {};
        var error = function(error) {
            return callback(error);
        };
        process.nextTick(function() {
            fs.createReadStream(params.source)
                .on('error', error)
                .pipe(zlib.createGunzip()
                    .on('error', error))
                .pipe(tar.extract(params.destination, params.options)
                    .on('error', error)
                    .on('finish', function() {
                        return callback(null);
                    }));
        });
    }
};