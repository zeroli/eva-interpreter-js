const assert = require('assert');

module.exports = eva => {
    assert.strictEqual(eva.eval(['var', 'x', 10]), 10);
    assert.strictEqual(eva.eval('x'), 10);
    assert.strictEqual(eva.eval(['var', 'y', 100]), 100);
    assert.strictEqual(eva.eval('y'), 100);
    assert.strictEqual(eva.eval('true'), true);
    assert.strictEqual(eva.eval(['var', 'IsUser', 'true']), true);
    assert.strictEqual(eva.eval(['var', 'z', ['*', 20, 3]]), 60);
};
