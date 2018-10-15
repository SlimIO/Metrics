const is = require("@slimio/is");

/**
 * @class Entity
 * @property {String} name Entity name
 * @property {String} description Entity description
 * @property {Number=} [parent=0] Parent Entity number
 * @property {Addon} addon Addon attach to listen addon event
 */
class Entity {
    /**
     * @constructor
     * @param {!String} name Entity name
     * @param {Object} options option
     *
     * @throws {TypeError}
     */
    constructor(name, options = Object.create(null)) {
        if (!is.string(name)) {
            throw new TypeError("name param must be a string");
        }

        this.name = name;

        this.description = options.description ? options.description : "N/A";
        this.parent = options.parent ? options.parent : 1;
    }

    /**
     * @public
     * @method use
     * @memberof Entity#
     * @param {!Addon} addon addon
     * @returns {Entity}
     */
    use(addon) {
        if (addon.contructor.name !== "Addon") {
            throw new TypeError("addon param must be an Addon object");
        }

        this.addon = addon;

        return this;
    }

    /**
     * @public
     * @method parent
     * @memberof Entity#
     * @param {!Entity} entity entity
     *
     * @throws {TypeError}
     * @return {Entity}
     */
    parent(entity) {
        if (!is.directInstanceOf(entity, Entity)) {
            throw new TypeError("entity param must be an Entity object");
        }
        this.parent = entity.parent;

        return this;
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
    async set(key, value) {
        if (!is.string(key)) {
            throw new TypeError("key param must be a string");
        }
        if (!is.number(value)) {
            throw new TypeError("value param must be a number");
        }

        if (this.addon) {
            throw new Error("You must attach an addon with 'use' method");
        }
        await new Promise((resolve) => {
            this.addon.on("addonLoaded", (addonName) => {
                console.log(`AddonLoaded : ${addonName}`);
                if (addonName === "event") {
                    resolve();
                }

            });
        })
        

        return this;
    }
}

module.exports = Entity;
