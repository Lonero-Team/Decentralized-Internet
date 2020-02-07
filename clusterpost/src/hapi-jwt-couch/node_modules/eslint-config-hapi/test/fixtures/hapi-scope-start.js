/* eslint-disable strict, no-unused-vars */
const foo = function () {
    return 'there should be a blank line before this line';
};

const bar = function () {

    return 'no lint errors';
};

const baz = () => {

    return 'no lint errors';
};

const quux = () => 85;  // no lint errors

const buux = () => ({
    a: 'b'
});
