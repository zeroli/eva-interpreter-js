/**
 * AST Transformer
 */
class Transformer {
    /**
     * Translates `def` -expression (function declaration)
     * into a variable declaration with a lambda
     * expression
     */
    transformDefToVarLambda(defExp) {
        const [_tag, name, params, body] = defExp;
        return ['var', name, ['lambda', params, body]];
    }

    /**
     * Translate `switch` -expression (swith case)
     * into if/else nested expression
     */
    transformSwitchToIf(switchExp) {
        const [_tag, ...cases] = switchExp;

        const ifExp = ['if', null, null, null];
        let current = ifExp;
        for (let i = 0; i < cases.length - 1; i++) {
            //console.log(`${i}: ${JSON.stringify(current)}`);
            const [currentCond, currentBlock] = cases[i];

            // array automatically grow
            current[1] = currentCond;
            current[2] = currentBlock;

            const next = cases[i + 1];
            const [nextCond, nextBlock] = next;
            current[3] = nextCond === 'else'
                ? nextBlock
                : ['if'];
            //console.log(`${i}: ${JSON.stringify(current)}`);
            current = current[3];
        }
        return ifExp;
    }

    /**
     * transpile `for`-expression to while expression
     */
    transformForToWhile(forExp) {
        const [_tag, init, cond, modifier, exp] = forExp;
        const blockExp = ['begin', init, null];
        const whileExp = blockExp[2] = ['while', cond, null];
        whileExp[2] = ['begin', exp, modifier];
        return blockExp;
    }

    /**
     * transpile `++`-expression to set expression
     *  (++ foo) => (set foo (+ foo 1))
     */
    transformIncToSet(incExp) {
        const [_tag, sym] = incExp;
        const setExp = ['set', sym, null];
        setExp[2] = ['+', sym, 1];
        return setExp;
    }

    /**
     * transpile `+=`-expression to set expression
     *  (+= foo inc) => (set foo (+ foo inc))
     */
    transformIncValToSet(incExp) {
        const [_tag, sym, inc] = incExp;
        const setExp = ['set', sym, null];
        setExp[2] = ['+', sym, inc];
        return setExp;
    }

    /**
     * transpile `-=`-expression to set expression
     *  (-= foo inc) => (set foo (- foo inc))
     */
    transformDecValToSet(incExp) {
        const [_tag, sym, dec] = incExp;
        const setExp = ['set', sym, null];
        setExp[2] = ['-', sym, dec];
        return setExp;
    }
}

module.exports = Transformer;
