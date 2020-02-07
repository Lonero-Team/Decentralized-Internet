/* eslint-disable strict, no-unused-vars, handle-callback-err */


// Declare internals

const internals = {};


module.exports.foo = function (value) {

    const top = function (err) {

        const inner = function (err) {

            return value;
        };
    };

    top();
};


module.exports.bar = function (value) {

    const top = function (res) {

        const inner = function (res) {

            return value;
        };
    };

    top();
};
