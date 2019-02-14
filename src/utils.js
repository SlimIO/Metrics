/**
 * @namespace Utils
 */

/**
 * @async
 * @func doWhile
 * @memberof Utils#
 * @param {Object} [options] options
 * @param {any} cond condition to execute in do while
 * @returns {void}
 */
async function doWhile({ max = 1, ms = 1000 }, cond) {
    let maxRetry = max;
    do {
        if (maxRetry-- === 0) {
            return void 0;
        }
        await new Promise((resolve) => setTimeout(resolve, ms));
    } while (cond());

    return void 0;
}

/**
 * @func privateKey
 * @memberof Utils#
 * @param {*} target target
 * @param {String | Symbol | Number} name property name
 * @param {*} value property value
 * @returns {void}
 */
function privateKey(target, name, value = null) {
    const ret = Reflect.defineProperty(target, name, {
        value,
        enumerable: false,
        configurable: false,
        writable: true
    });

    if (!ret) {
        throw new Error("Unable to define private property!");
    }
}

module.exports = { doWhile, privateKey };
