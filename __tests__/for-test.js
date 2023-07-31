const assert = require('assert');
const {test} = require('./test-util');

module.exports = eva => {
    test(eva,
    `
        (for (set x 0)
            (< x 10)
            (++ x)
            x
        )
    `,
    10);

    test(eva,
        `
            (for (set x 0)
                (< x 10)
                (+= x 3)
                x
            )
        `,
        12);

    test(eva,
        `
            (for (set x 10)
                (> x 0)
                (-= x 3)
                x
            )
        `,
        -2);
}
