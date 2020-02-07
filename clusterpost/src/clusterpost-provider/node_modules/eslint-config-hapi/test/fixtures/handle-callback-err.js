/* eslint-disable no-unused-vars */
'use strict';

module.exports.foo = function (value) {

    const top = function (err) {

        const inner = function (e) {

            return value;
        };
    };

    top();
};


module.exports.bar = function (value) {

    const top = function (abc) {

        const inner = function (xyz) {

            return value;
        };
    };

    top();
};
