/**
 * @namespace Utils
 */

/**
 * @async
 * @func doWhile
 * @memberof Utils#
 * @param {Object} [options] options
 * @param {any} cond condition to execute in do while
 * @returns {Boolean}
 */
async function doWhile({ max = 1, ms = 1000 }, cond) {
    let maxRetry = max;
    do {
        if (maxRetry-- === 0) {
            return true;
        }
        await new Promise((resolve) => setTimeout(resolve, ms));
    } while (cond());

    return false;
}

module.exports = { doWhile };
