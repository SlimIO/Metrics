const is = require("@slimio/is");

/**
 * @class IdentityCard
 */
class IdentityCard {
    /**
     * @constructor
     * @param {String} name name
     * @param {Object} config config
     */
    constructor(name, config) {
        if (!is.string(name)) {
            throw new TypeError("name param must be a string");
        }
        if (!is.object(config)) {
            throw new TypeError("config param must be an object");
        }
    }
}

module.exports = IdentityCard;
