// Require Internal Dependencies
const Entity = require("./entity.class.js");
const MetricIdentityCard = require("./metricIdentityCard.class.js");
const is = require("@slimio/is");

/**
 * @class Metric
 * @property {Addon} addon Addon
 * @property {Boolean=} [eventLoaded=false] Event addon is loaded ?
 */
class Metric {

    /**
     * @constructor
     * @param {!Addon} addon Addon
     *
     * @throws {TypeError}
     */
    constructor(addon) {
        if (addon.constructor.name !== "Addon") {
            throw new TypeError("addon param must be an Addon object");
        }

        this.eventLoaded = false;
        this.addon = addon;

        /** @type {Array<Entity>} */
        this.entities = [];

        /** @type {Map<String, MetricIdentityCard>} */
        this.mic = new Map();

        /** @type {Map<Entity.id, entities.index|MetricIdentityCard.name>} */
        this.linker = new Map();

        /** @type {Map<MetricIdentityCard.name, number>} */
        this.publishMetrics = new Map();

        this.addon.on("addonLoaded", (addonName) => {
            if (addonName === "events") {
                console.log(`AddonLoaded : ${addonName}`);
                this.eventLoaded = true;
                if (this.entities.length > 0) {
                    this.declare();
                }
            }
        });
    }

    /**
     * @private
     * @async
     * @method declare
     * @memberof Metric#
     * @param {Number=} [parentIndex=1] parentIndex
     *
     * @returns {void}
     */
    async declare(parentIndex = 1) {
        if (!this.linker.has(parentIndex)) {
            return;
        }
        const promises = [];
        const elems = this.linker.get(parentIndex);
        for (const elem of elems) {
            if (typeof elem === "number") {
                const entity = this.entities[elem];
                promises.push(this.declareEntity(entity));
            }
            else {
                const mic = this.mic.get(elem);
                this.declareIdentityCard(mic);
            }
        }

        const declareIds = await Promise.all(promises);
        for (const id of declareIds) {
            this.declare(id);
        }
    }

    /**
     * @async
     * @private
     * @method declareEntity
     * @memberof Metric#
     * @param {!Entity} entity entity
     *
     * @return {Promise<Number>}
     */
    async declareEntity(entity) {
        const data = entity.toJSON();
        const oldId = entity.id;
        const newId = await this.sendMessage("events.declare_entity", data);

        entity.id = newId;
        entity.dbPushed = true;

        // Reset all Ids after pushed in DB
        if (this.linker.has(oldId)) {
            const elems = this.linker.get(oldId);
            this.linker.delete(oldId);
            this.linker.set(newId, elems);

            for (const elem of elems) {
                if (typeof elem === "number") {
                    this.entities[elem].parent = newId;
                }
                else {
                    const mic = this.mic.get(elem);
                    mic.entityId = newId;
                }
            }
        }

        return newId;
    }

    /**
     * @async
     * @private
     * @method declareIdentityCard
     * @memberof Metric#
     * @param {!MetricIdentityCard} mic mic
     *
     * @return {Promise<void>};
     */
    async declareIdentityCard(mic) {
        const data = mic.toJSON();
        const newId = await this.sendMessage("events.declare_mic", data);
        mic.id = newId;
        mic.dbPushed = true;

        if (this.publishMetrics.has(data.name)) {
            const metrics = this.publishMetrics.get(data.name);
            for (const { micId, value, harvestedAt } of metrics) {
                this.addon.sendMessage("events.publish_metric", { args: [micId, value, harvestedAt] });
            }
        }

    }

    /**
     * @async
     * @private
     * @method sendMessage
     * @memberof Metric#
     * @param {!String} event event
     * @param {!Object} data data
     *
     * @return {Promise<Number>}
     */
    sendMessage(event, ...data) {
        return new Promise((resolve) => {
            this.addon.sendMessage(event, { args: data }).subscribe(resolve);
        });
    }

    /**
     * @private
     * @method setLinker
     * @memberof Metric#
     * @param {!Number} parent parent
     * @param {!Number|String} value value
     *
     * @returns {void}
     */
    setLinker(parent, value) {
        if (!this.linker.has(parent)) {
            this.linker.set(parent, [value]);
        }
        else {
            this.linker.get(parent).push(value);
        }
    }

    /**
     * @public
     * @method identityCard
     * @memberof Metric#
     * @param {!String} name Entity name
     * @param {Object} options Entity options
     *
     * @return {MetricIdentityCard}
     */
    identityCard(name, options) {
        const identityCard = new MetricIdentityCard(name, options);
        this.mic.set(identityCard.name, identityCard);
        this.setLinker(identityCard.entity.id, identityCard.name);
        // if (this.eventLoaded === true) {
        //     if (Reflect.has(options, "entity") && options.entity.dbPushed === true) {
        //         this.declareIdentityCard();
        //     }
        // }

        return identityCard;
    }

    /**
     * @public
     * @method entity
     * @memberof Metric#
     * @param {!String} name Entity name
     * @param {Object} options Entity options
     *
     * @return {Entity}
     */
    entity(name, options) {
        const ent = new Entity(name, options);
        const index = this.entities.push(ent);

        this.setLinker(ent.parent, index - 1);

        if (this.eventLoaded === true) {
            if (Reflect.has(options, "parent") && options.parent.dbPushed === true) {
                this.declareEntity(ent.parent);
            }
        }

        return ent;
    }

    /**
     * @public
     * @memberof Metric#
     * @param {String} name name
     * @param {Number} value value
     * @param {Date} harvestedAt harvested time of the metric
     *
     * @throws {TypeError}
     * @throws {Error}
     * @return {void}
     */
    publish(name, value, harvestedAt = Date.now()) {
        if (!is.string(name)) {
            throw new TypeError("name param must a <string> type");
        }
        if (!is.number(value)) {
            throw new TypeError("value param must a <number>");
        }
        if (!this.mic.has(name)) {
            throw new Error(`There is no IdentityCard with name : ${name}`);
        }

        const mic = this.mic.get(name);
        if (!this.eventLoaded || this.eventLoaded && !mic.dbPushed) {
            if (!this.publishMetrics.has(name)) {
                this.publishMetrics.set(name, [{ micId: mic.id, value, harvestedAt }]);
            }
            else {
                const micArr = this.publishMetrics.get(name);
                micArr.push({ micId: mic.id, value, harvestedAt });
                this.publishMetrics.set(name, micArr);
            }
        }
        else {
            this.addon.sendMessage("events.publish_metric", { args: [mic.id, value, harvestedAt] });
        }
    }
}

module.exports = Metric;
