// Require Third-Party Dependencies
const is = require("@slimio/is");

/**
 * @class MetricIdentityCard
 * @property {String} name MetricIdentityCard name
 * @property {String} description MetricIdentityCard description
 * @property {Unit} unit Unit
 * @property {Number} interval interval
 * @property {Number} max max
 * @property {Entity} entity entity
 * @property {Number} id id
 * @property {Boolean} dbPushed Db controller
 */
class MetricIdentityCard {
    /**
     * @constructor
     * @param {!String} name name
     * @param {!Object} options options
     * @param {String} options.description options description
     * @param {!Unit} options.unit options Unit
     * @param {!Entity} options.entity options Entity
     *
     * @throws {TypeError}
     * @throws {Error}
     */
    constructor(name, options) {
        if (!is.string(name)) {
            throw new TypeError("name param must be a string");
        }

        if (!is.nullOrUndefined(options.unit) && options.unit.constructor.name !== "Unit") {
            throw new TypeError("options.unit param must be an <Unit> object");
        }

        if (!Reflect.has(options, "entity")) {
            throw new Error("options param must have an <entity> property");
        }
        if (options.entity.constructor.name !== "Entity") {
            throw new TypeError("options.entity param must be an <Entity> object");
        }

        this.name = `${options.entity.name}_${name}`;
        this.description = options.description;
        this.unit = options.unit;
        this.interval = options.interval;
        this.max = options.unit.max;
        this.entity = options.entity;
        this.id = ++MetricIdentityCard.count;
        this.dbPushed = false;
    }

    /**
     * @method toJSON
     * @memberof IdentityCard#
     *
     * @return {Object}
     */
    toJSON() {
        return {
            name: this.name,
            description: this.description,
            unit: this.unit.symbol,
            interval: this.interval,
            max: this.max,
            entityId: this.entity.id
        };
    }
}

MetricIdentityCard.count = 0;

module.exports = MetricIdentityCard;
