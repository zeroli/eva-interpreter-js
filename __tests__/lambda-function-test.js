const assert = require('assert')
const {test} = require('./test-util');

module.exports = eva => {
    test(eva, `
        (begin
            (def onClick (callback)
                (begin
                    (var x 10)
                    (var y 20)
                    (callback (+ x y))
                )
            )
            (onClick (lambda (data) (* data 10)))
        )
    `,
    300);

    // immediately invoked lambda expression
    test(eva, `
        ((lambda (x) (* x 10)) 20)
    `,
    200);

    // save lambda expression to a variable:
    test(eva, `
        (begin
            (var fn (lambda (x) (* x 10)))
            (fn 20)
        )
    `,
    200);
};
