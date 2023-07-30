const assert = require('assert');
const testUtil = require('./test-util')

module.exports = eva => {
    assert.strictEqual(eva.eval(
        [ 'begin',
            ['var', 'x', 10],
            ['var', 'y', 20],

            ['+', ['*', 'x', 'y'], 30],
        ]),
        230);

    assert.strictEqual(eva.eval(
        [ 'begin',
            ['var', 'x', 10],
            ['begin',
                ['var', 'x', 20],
                'x',
            ],
            'x',
        ]),
        10);

    assert.strictEqual(eva.eval(
        [ 'begin',
            ['var', 'value', 10],
            ['begin',
                ['var', 'x', ['+', 'value', 10]],
                'x',
            ],
        ]),
        20);

    assert.strictEqual(eva.eval(
        [ 'begin',
            ['var', 'value', 10],
            ['begin',
                ['set', 'value', 20],
            ],
            'value',
        ]),
        20);

        testUtil.test(eva,
        `
            (begin
                (var x 10)
                (var y 20)
                (+ (* x 10) y))
        `,
        120);
};
