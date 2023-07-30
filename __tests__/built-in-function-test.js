const assert = require('assert')
const {test} = require('./test-util');

module.exports = eva => {
    // math functions:
    test(eva, `(+ 1 5)`, 6);
    test(eva, `(+ (+ 2 3) 5)`, 10);
    test(eva, `(+ (* 2 3) 5)`, 11);

    // comparisons
    test(eva, `(> 1 5)`, false);
};
