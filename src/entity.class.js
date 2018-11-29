// Require Third-Party Dependencies
const is = require("@slimio/is");

/**
 * @class Entity
 * @property {String} name Entity name
 * @property {String} description Entity description
 * @property {Number=} [parent=1] Parent Entity number
 * @property {Addon} addon Addon attach to listen addon event
 * @property {Number} id id
 * @property {Boolean} dbPushed db controller
 */
class Entity {
    /**
     * @constructor
     * @param {!String} name Entity name
     * @param {Object} options option
     * @param {String} options.description option description
     * @param {Number} options.parent option entity parent id
     *
     * @throws {TypeError}
     */
    constructor(name, options = Object.create(null)) {
        if (!is.string(name)) {
            throw new TypeError("name param must be a string");
        }

        if (!is.nullOrUndefined(options.description) && !is.string(options.description)) {
            throw new TypeError("options.description param must be a string");
        }

        if (!is.nullOrUndefined(options.parent) && !(options.parent instanceof Entity)) {
            throw new TypeError("options.parent param must be an <Entity> object");
        }

        this.name = name;
        this.description = options.description ? options.description : "N/A";
        this.parent = options.parent ? options.parent.id : 1;

        /** @type {Map<String, Number|String>} */
        this.descriptors = new Map();

        this.id = ++Entity.count;
        this.dbPushed = false;
    }

    /**
     * @public
     * @method set
     * @memberof Entity#
     * @param {!String} key key
     * @param {!String|!Number} value value
     *
     * @throws {TypeError}
     * @return {Entity}
     */
    set(key, value) {
        if (!is.string(key)) {
            throw new TypeError("key param must be a <string>");
        }
        if (!is.number(value) && !is.string(value)) {
            throw new TypeError("value param must be a <number> or a <string>");
        }

        this.descriptors.set(key, value);

        return this;
    }

    /**
     * @method toJSON
     * @memberof Entity#
     * @return {Object}
     */
    toJSON() {
        // Replace in futur with Object.fromEntries() ?
        const descriptors = Object.create(null);
        for (const [key, val] of this.descriptors) {
            Reflect.set(descriptors, key, val);
        }

        return {
            name: this.name,
            description: this.description,
            descriptors,
            parent: this.parent
        };
    }
}
Entity.count = 1;

module.exports = Entity;
