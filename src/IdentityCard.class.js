const is = require("@slimio/is");

/**
 * @class IdentityCard
 */
class IdentityCard {
    /**
     * @constructor
     * @param {String} name name
     * @param {Object} options options
     * @throws {TypeError}
     */
    constructor(name, options) {
        if (!is.string(name)) {
            throw new TypeError("name param must be a string");
        }

        if (!is.nullOrUndefined(options.unit) && options.unit.constructor.name === "Unit") {
            throw new TypeError("options.unit param must be an <Unit> object");
        }

        if (!Reflect.has(options, "entity")) {
            throw new Error("options param must have an <entity> property");
        }
        if (options.entity.constructor.name !== "Entity") {
            throw new TypeError("options.entity param must be an <Entity> object");
        }

        this.name = name;
        this.description = options.description;
        this.unit = options.unit;
        this.interval = options.interval;
        this.max = options.max;
        this.entity = options.entity;
    }

    /**
     * @public
     * @method entityId
     * @memberof IdentityCard#
     * @param {Number} id Entity id
     *
     * @throws {TypeError}
     * @return {IdentityCard}
     */
    // entityId(id) {
    //     if (!is.number(id)) {
    //         throw new TypeError("id param must be a <number>");
    //     }
    //     this.entityId = id;

    //     return this;
    // }

    /**
     * @public
     * @method eventLoaded
     * @memberof IdentityCard#
     * @param {Addon} addon addon
     * @return {void}
     */
    eventLoaded(addon) {
        const data = {

        };
        addon.sendMessage("events.declare_metric_identity", { args: [data] }).subscribe((id) => {
            this.id = id;
        });
    }

    /**
     * @method getDataIdentityCard
     * @memberof IdentityCard#
     * @return {Object}
     */
    getDataIdentityCard() {
        return {
            name: this.name,
            description: this.description,
            unit: this.unit,
            interval: this.interval,
            max: this.max,
            entityId: this.entity.id
        };
    }
}

module.exports = IdentityCard;
