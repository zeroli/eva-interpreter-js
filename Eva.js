const assert = require('assert');

const Environment = require('./Environment');
const Transformer = require('./transform/Transformer');

/**
 * Eval interpreter.
 */
class Eva {
    /**
     * Creates an Eva instance with the global environment.
     */
    constructor(global = GlobalEnvironment) {
        this.global = global;
        this._transformer = new Transformer();
    }

    /**
     * Evaluats an expression in the given environment
     */
    eval(exp, env = this.global) {
        // ----------------------------------------------------------
        // Self-evaluating expressions:

        if (this._isNumber(exp)) {
            return exp;
        }
        if (this._isString(exp)) {
            return exp.slice(1, -1);
        }

        // Block: sequence of expressions
        if (exp[0] === 'begin') {
            const blockEnv = new Environment({}, env);
            return this._evalBlock(exp, blockEnv);
        }

        // -----------------------------------------------------------
        // Variable declarations:

        if (exp[0] === 'var') {
            const [_, name, value] = exp;
            return env.define(name, this.eval(value, env));
        }
        // ------------------------------------------------------------
        // Variable update: (set foo 10)
        if (exp[0] === 'set') {
            const [_, ref, value] = exp;
            // assignment to a property
            if (ref[0] === 'prop') {
                const [_tag, instance, propName] = ref;
                const instanceEnv = this.eval(instance, env);
                return instanceEnv.define(
                    propName,
                    this.eval(value, env),
                );
            }
            return env.assign(ref, this.eval(value, env));
        }

        if (this._isVariableName(exp)) {
            return env.lookup(exp);
        }

        // -----------------------------------------------------------
        // if-expression:
        if (exp[0] === 'if') {
            const [_tag, condition, consequent, alternate] = exp;
            if (this.eval(condition, env)) {
                return this.eval(consequent, env);
            } else {
                return this.eval(alternate, env);
            }
        }

        // ------------------------------------------------------------
        // while-expression:
        if (exp[0] === 'while') {
            const [_tag, condition, body] = exp;
            let result;
            while (this.eval(condition, env)) {
                result = this.eval(body, env);
            }
            return result;
        }

        // ------------------------------------------------------------
        // Function declaration: (def square (x) (* x x))
        // Syntactic sugar for : (var square (lambda (x) (* x x)))
        if (exp[0] === 'def') {
            const varExp = this._transformer.transformDefToVarLambda(exp);
            return this.eval(varExp, env);
        }

        // ------------------------------------------------------------
        // Switch-expression: (switch (cond1, block1) ...)
        // Syntactic sugar for nested if-expression
        if (exp[0] === 'switch') {
            const ifExpr = this._transformer.transformSwitchToIf(exp);
            return this.eval(ifExpr, env);
        }

        // ------------------------------------------------------------
        // For-loop: (for init condition modifier body)
        // Syntactic sugar for: (begin init (while condition (begin body modifier)))
        if (exp[0] === 'for') {
            const whileExp = this._transformer.transformForToWhile(exp);
            return this.eval(whileExp, env);
        }

        // ------------------------------------------------------------
        // Increment: (++ foo)
        // Syntactic sugar for: (set foo (+ foo 1))
        if (exp[0] === '++') {
            const setExp = this._transformer.transformIncToSet(exp);
            return this.eval(setExp, env);
        }

        // ------------------------------------------------------------
        // Increment: (+= foo inc)
        // Syntactic sugar for : (set foo (+ foo inc))
        if (exp[0] === '+=') {
            const setExp = this._transformer.transformIncValToSet(exp);
            return this.eval(setExp, env);
        }

        // ------------------------------------------------------------
        // Increment: (-= foo inc)
        // Syntactic sugar for : (set foo (- foo inc))
        if (exp[0] === '-=') {
            const setExp = this._transformer.transformDecValToSet(exp);
            return this.eval(setExp, env);
        }

        // ------------------------------------------------------------
        // Lambda function: (lambda (x) (* x x))
        if (exp[0] === 'lambda') {
            const [_tag, params, body] = exp;
            return {
                params,
                body,
                env, // closure
            };
        }

        // -------------------------------------------------------------
        // class declaration: (class <name> <parent> <body>)
        if (exp[0] === 'class') {
            const [_tag, name, parent, body] = exp;
            // A class is an environment -- a storage of methods,
            // and shared properties
            const parentEnv = this.eval(parent, env) || env;
            const classEnv = new Environment({}, parentEnv);
            this._evalBody(body, classEnv);
            return env.define(name, classEnv);
        }

        // -------------------------------------------------------------
        if (exp[0] === 'new') {
            const classEnv = this.eval(exp[1], env);
            // an instance of a class is an environment
            // the `parent` component of the instance environment
            // is set to its class.
            const instanceEnv = new Environment({}, classEnv);

            const args = exp
                .slice(2)
                .map(arg => this.eval(arg, env));
            this._callUserDefinedFunction(
                classEnv.lookup('constructor'),
                [instanceEnv, ...args],
            );
            return instanceEnv;
        }

        // -------------------------------------------------------------
        // Property access: (prop <instance> <name>)
        if (exp[0] === 'prop') {
            const [_tag, instance, name] = exp;
            const instanceEnv = this.eval(instance, env);
            return instanceEnv.lookup(name);
        }

        // -------------------------------------------------------------
        // Function calls:
        if (Array.isArray(exp)) {
            const fn = this.eval(exp[0], env);
            const args = exp
                    .slice(1)
                    .map(arg => this.eval(arg, env));

            // native functions:
            if (typeof fn === 'function') {
                return fn(...args);
            }
            // user-defined function
            // create a new environment, and put params as new envs
            return this._callUserDefinedFunction(fn, args);
        }

        throw `Unimplemented: ${JSON.stringify(exp)}`;
    }

    _callUserDefinedFunction(fn, args) {
        const activationRecord = {};
        fn.params.forEach((param, index) => {
            activationRecord[param] = args[index];
        });
        const activationEnv = new Environment(
            activationRecord,
            fn.env,
            // if one function call already binds one variable with same name
            // use that static bound variable!!!
        );
        return this._evalBody(fn.body, activationEnv);
    }

    _evalBody(body, env) {
        if (body[0] === 'begin') {
            return this._evalBlock(body, env);
        }
        return this.eval(body, env);
    }

    _evalBlock(block, env) {
        let result;
        const [_tag, ...expression] = block;

        expression.forEach(exp => {
            result = this.eval(exp, env);
        });

        return result;
    }

    _isNumber(exp) {
        return typeof exp === 'number';
    }

    _isString(exp) {
        return typeof exp === 'string' && exp[0] === '"' && exp.slice(-1) === '"';
    }

    _isVariableName(exp) {
        return typeof exp === 'string'
            && /^[+\-*/<>=a-zA-Z0-9_]*$/.test(exp);
        // support +/-/*// as function variable names
    }
}

/**
 * Default global environment
 */
const GlobalEnvironment = new Environment({
    null: null,

    true: true,
    false: false,

    VERSION: '0.1',

    // operators
    '+'(op1, op2) {
        return op1 + op2;
    },
    '*'(op1, op2) {
        return op1 * op2;
    },
    '-'(op1, op2 = null) {
        if (op2 == null) {
            return -op1;
        }
        return op1 - op2;
    },
    '/'(op1, op2 = null) {
        return op1 / op2;
    },

    // comparisons:
    '>'(op1, op2) {
        return op1 > op2;
    },
    '>='(op1, op2) {
        return op1 >= op2;
    },
    '<'(op1, op2) {
        return op1 < op2;
    },
    '<='(op1, op2) {
        return op1 <= op2;
    },
    '='(op1, op2) {
        return op1 === op2;
    },

    // console output
    print(...args) {
        console.log(...args);
    },
});

module.exports = Eva;
