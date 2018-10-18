const is = require("@slimio/is");
const IdentityCard = require("./identityCard.class.js");

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
     * @param {!Addon} addon Addon
     * @param {!String} name Entity name
     * @param {Object} options option
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

        if (!is.nullOrUndefined(options.parent) && !is.number(options.parent)) {
            throw new TypeError("options.parent param must be a number");
        }

        this.name = name;

        // this.description : good ternary ?
        this.description = options.description; /* ? options.description : "N/A"; */
        this.parent = options.parent; /* ? options.parent : 1; */

        this.descriptor = new Map();
        this.entities = new Map();

        this.id = ++Entity.count;
    }


    /**
     * @private
     * @method parent
     * @memberof Entity#
     * @param {!Entity} entity Parent entity
     *
     * @throws {TypeError}
     * @return {Entity}
     */
    parent(entity) {
        if (entity.constructor.name !== "Entity") {
            throw new TypeError("entity param must be an <Entity> object");
        }
        this.parent = entity.id;

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
    set(key, value) {
        if (!is.string(key)) {
            throw new TypeError("key param must be a <string>");
        }
        if (!is.number(value) && !is.string(value)) {
            throw new TypeError("value param must be a <number> or a <string>");
        }

        this.descriptor.set(key, value);

        return this;
    }

    /**
     * @public
     * @method eventLoaded
     * @memberof Entity#
     * @param {Addon} addon addon
     * @return {void}
     */
    eventLoaded(addon) {
        const data = {
            name: this.name,
            description: this.description,
            descriptor: this.descriptor,
            parent: this.parent
        };
        // console.log(this);
        addon.sendMessage("events.declare_entity", { args: [data] }).subscribe((id) => {
            this.id = id;
            for (const [, entity] of this.entities) {
                entity.parentId(this.id);
                entity.eventLoaded(addon);
            }
            if (this.identityCards.size() > 0) {
                for (const [, identityCard] of this.identityCards) {
                    identityCard.entityId(this.id);
                    identityCard.eventLoaded(addon);
                }
            }
        });
    }

    /**
     * @method getDataEntity
     * @memberof Entity#
     * @return {Object}
     */
    getDataEntity() {
        return {
            name: this.name,
            description: this.description,
            descriptor: this.descriptor,
            parent: this.parent
        };
    }
}
Entity.count = 0;

module.exports = Entity;
