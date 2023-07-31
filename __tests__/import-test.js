const assert = require('assert');
const {test} = require('./test-util');

module.exports = eva => {
    test(eva,
    `
        (import Math)
        ((prop Math abs) (- 10))
    `,
    10);

    test(eva,
    `
        (import Math)
        (abs (- 10))
    `,
    10);

};
