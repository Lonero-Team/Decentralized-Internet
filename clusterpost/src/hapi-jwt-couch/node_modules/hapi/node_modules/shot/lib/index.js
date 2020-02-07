'use strict';

// Load modules

const Request = require('./request');
const Response = require('./response');


exports.inject = function (dispatchFunc, options, callback) {

    const req = new Request(options);
    const res = new Response(req, callback);

    return req.prepare(() => dispatchFunc(req, res));
};


exports.isInjection = function (obj) {

    return (obj instanceof Request || obj instanceof Response);
};
