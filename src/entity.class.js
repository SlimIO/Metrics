// Require Third-Party Dependencies
const is = require("@slimio/is");
const { privateProperty } = require("@slimio/utils");

// Symbols
const SymID = Symbol("id");
const SymDesc = Symbol("desc");

function exportClass(event) {
    /**
     * @class Entity
     * @property {String} name Entity name
     * @property {String} description Entity description
     * @property {Entity} [parent=1] Parent Entity number
     * @property {Number} id id
     */
    return class Entity {
        /**
         * @constructor
         * @param {!String} name Entity name
         * @param {Object} options option
         * @param {String} options.description option description
         * @param {Number | Entity} options.parent option entity parent id
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

            const parent = options.parent || 1;
            if (!is.number(parent) && !(parent instanceof Entity)) {
                throw new TypeError("options.parent param must be a number or an Entity object");
            }

            this.name = name;
            this.parent = parent;
            privateProperty(this, SymID);
            privateProperty(this, SymDesc, options.description ? options.description : "N/A");

            /** @type {Map<string, number|string>} */
            this.descriptors = new Map();
            this.mics = [];

            event.emit("create_entity", this);
        }

        /**
         * @public
         * @memberof Entity#
         * @returns {String} description
         */
        get description() {
            return this[SymDesc];
        }

        /**
         * @param {!String} desc desc
         * @returns {void}
         * @throws {TypeError}
         */
        set description(desc) {
            if (typeof desc !== "string") {
                throw new TypeError("desc must be a string!");
            }

            this[SymDesc] = desc;
            if (this.id !== null) {
                event.emit("create_entity", this);
            }
        }

        /**
         * @param {!Number} id id
         * @returns {void}
         * @throws {TypeError}
         */
        set id(id) {
            if (typeof id !== "number") {
                throw new TypeError("id must be a number!");
            }

            this[SymID] = id;
        }

        /**
         * @public
         * @memberof Entity#
         * @returns {Number} id
         */
        get id() {
            return this[SymID];
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
            event.emit("register_entity_descriptor", this.id, key, value);

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
                parent: this.parent instanceof Entity ? this.parent.id : this.parent
            };
        }
    };
}

module.exports = exportClass;
