"use strict";

// Require Third-Party Dependencies
const is = require("@slimio/is");
const { privateProperty } = require("@slimio/utils");

// Symbols
const SymID = Symbol("id");
const SymDesc = Symbol("desc");


function exportClass(event) {
    /**
     * @class Entity
     * @property {string} name Entity name
     * @property {string} description Entity description
     * @property {Entity} [parent=1] Parent Entity number
     * @property {number} id id
     */
    return class Entity {
        /**
         * @class
         * @param {!string} name Entity name
         * @param {object} options option
         * @param {string} options.description option description
         * @param {number | Entity} options.parent option entity parent id
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
         * @returns {string} description
         */
        get description() {
            return this[SymDesc];
        }

        /**
         * @param {!string} desc desc
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
         * @param {!number} id id
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
         * @returns {number} id
         */
        get id() {
            return this[SymID];
        }

        /**
         * @public
         * @function set
         * @memberof Entity#
         * @param {!string} key key
         * @param {!string|!number} value value
         *
         * @throws {TypeError}
         * @returns {Entity}
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
         * @function toJSON
         * @memberof Entity#
         * @returns {object}
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
