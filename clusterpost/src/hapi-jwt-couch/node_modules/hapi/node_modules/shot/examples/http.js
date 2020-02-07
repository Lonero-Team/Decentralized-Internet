'use strict';

// Load modules

const Shot = require('..');


// Declare internals

const internals = {};


internals.main = function () {

    const dispatch = function (req, res) {

        const reply = 'Hello World';
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(reply);
    };

    Shot.inject(dispatch, { method: 'get', url: '/' }, (res) => {

        console.log(res.payload);
    });
};


internals.main();
