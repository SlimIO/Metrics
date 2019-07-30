"use strict";

// Require Node.js Dependencies
const events = require("events");

// Require Third-Party Dependencies
const is = require("@slimio/is");
const { privateProperty } = require("@slimio/utils");

// Symbols
const SymID = Symbol("id");
const SymMetrics = Symbol("metrics");

/**
 *
 */
function classExport(event) {
    /**
     * @class MetricIdentityCard
     * @property {string} name MetricIdentityCard name
     * @property {string} description MetricIdentityCard description
     * @property {Unit} unit Unit
     * @property {number} interval interval
     * @property {number} max max
     * @property {Entity} entity entity
     * @property {number} id id
     * @property {boolean} dbPushed Db controller
     */
    return class MetricIdentityCard extends events {
        /**
         * @class
         * @param {!string} name name
         * @param {!object} options options
         * @param {string} options.description options description
         * @param {!Unit} options.unit options Unit
         * @param {!Entity | number} options.entity options Entity
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
            privateProperty(this, SymID);
            privateProperty(this, SymMetrics, []);

            event.emit("create_mic", this);
            this.on("ready", () => {
                const lMetrics = this[SymMetrics].splice(0);
                for (const payload of lMetrics) {
                    event.emit("publish_metric", [this.id, ...payload]);
                }
            });
        }

        /**
         * @param {!number} id id
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
         * @member {number} id
         * @returns {number}  this[SymID]
         */
        get id() {
            return this[SymID];
        }

        /**
         * @public
         * @memberof MetricIdentityCard#
         * @member {boolean} hasLocalRef
         * @returns {boolean} if entity is't a number
         */
        get hasLocalRef() {
            return !is.number(this.entity);
        }

        /**
         * @function publish
         * @memberof MetricIdentityCard#
         * @param {!any} value Value
         * @param {number} [harvestedAt] harvested time
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
         * @function toJSON
         * @memberof MetricIdentityCard#
         *
         * @returns {object}
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
