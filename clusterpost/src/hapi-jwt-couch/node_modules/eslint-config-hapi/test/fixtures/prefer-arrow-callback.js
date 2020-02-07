/* eslint-disable no-unused-vars, handle-callback-err */
'use strict';
const foo = (arg, callback) => {

    return callback(null, arg + 1);
};

const bar = function (err, value) {

};

const baz = (err, value) => {

};

foo(1, bar);
foo(2, baz);
foo(3, (err, value) => {

});
foo(4, function (err, value) {

});
