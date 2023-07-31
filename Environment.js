/**
 * Environment: names storages.
 */
class Environment {
    /**
     * Creates an environment with the given record
     */
    constructor(record = {}, parent = null) {
        this.record = record;
        this.parent = parent;
    }

    /**
     * Creates a variable with the given name and value.
     */
    define(name, value) {
        this.record[name] = value;
        return value;
    }

    /**
     * returns the value of a defined variable, or throws
     * if the variable is not defined
     */
    lookup(name) {
        return this.resolve(name).record[name];
    }

    /**
     * returns the specific environment in which a variable is defined, or
     * throws if a variable is not defined.
     */
    resolve(name) {
        if (this.record.hasOwnProperty(name)) {
            return this;
        }
        if (this.parent === null) {
            throw new ReferenceError(`Variable "${name}" is not defined.`);
        }
        return this.parent.resolve(name);
    }

    /**
     * updates an existing variable.
     */
    assign(name, value) {
        this.resolve(name).record[name] = value;
        return value;
    }
}

module.exports = Environment;
