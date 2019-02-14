// Require Node.js Dependencies
const events = require("events");

// Require Third-Party Dependencies
const is = require("@slimio/is");

// Require Internal Dependencies
const { privateKey } = require("./utils");

// Symbols
const SymID = Symbol("id");
const SymMetrics = Symbol("metrics");

function classExport(event) {
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
    return class MetricIdentityCard extends events {
        /**
         * @constructor
         * @param {!String} name name
         * @param {!Object} options options
         * @param {String} options.description options description
         * @param {!Unit} options.unit options Unit
         * @param {!Entity | Number} options.entity options Entity
         *
         * @throws {TypeError}
         */
        constructor(name, options = Object.create(null)) {
            super();
            if (!is.string(name)) {
                throw new TypeError("name param must be a string");
            }
            if (!is.nullOrUndefined(options.unit) && options.unit.constructor.name !== "Unit") {
                throw new TypeError("options.unit param must be an <Unit> object");
            }
            if (!is.number(options.entity) && options.entity.constructor.name !== "Entity") {
                throw new TypeError("options.entity must be a number or an Entity object");
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
            privateKey(this, SymID);
            privateKey(this, SymMetrics, []);

            event.emit("create_mic", this);
            this.on("ready", () => {
                const lMetrics = this[SymMetrics].splice(0);
                for (const payload of lMetrics) {
                    event.emit("publish_metric", [this.id, ...payload]);
                }
            });
        }

        /**
         * @param {!Number} id id
         * @returns {void}
         */
        set id(id) {
            if (typeof id !== "number") {
                throw new TypeError("id must be a number!");
            }

            this[SymID] = id;
        }

        /**
         * @public
         * @memberof MetricIdentityCard#
         * @member {Number} id
         */
        get id() {
            return this[SymID];
        }

        /**
         * @public
         * @memberof MetricIdentityCard#
         * @member {Boolean} hasLocalRef
         */
        get hasLocalRef() {
            return !is.number(this.entity);
        }

        /**
         * @method publish
         * @memberof MetricIdentityCard#
         * @param {!any} value Value
         * @param {Number} [harvestedAt] harvested time
         * @returns {void}
         *
         * @throws {Error}
         */
        publish(value, harvestedAt = Date.now()) {
            if (!this.hasLocalRef) {
                throw new Error("Unable to publish metric without local entity ref!");
            }

            if (this.id === null) {
                this[SymMetrics].push([value, harvestedAt]);
            }
            else {
                event.emit("publish_metric", [this.id, value, harvestedAt]);
            }
        }

        /**
         * @method toJSON
         * @memberof MetricIdentityCard#
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
                entityId: is.number(this.entity) ? this.entity : this.entity.id
            };
        }
    };
}

module.exports = classExport;
