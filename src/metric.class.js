// Require Internal Dependencies
const Entity = require("./entity.class.js");
const MetricIdentityCard = require("./metricIdentityCard.class.js");

/**
 * @class Metric
 * @property {Addon} addon Addon
 * @property {Entity} entity Entity
 * @property {Boolean=} [eventLoaded=false] Event addon is loaded ?
 */
class Metric {
    /**
     * @constructor
     * @param {Addon} addon Addon
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

        /** @type {Map<Entity.id, Entity.parent|MetricIdentityCard.name>} */
        this.linker = new Map();

        this.addon.on("addonLoaded", (addonName) => {
            if (addonName === "events") {
                this.eventLoaded = true;
                if (this.entities.length > 0) {
                    this.declare();
                }
            }
        });
    }

    /**
     * @method sendMessage
     * @memberof Metric#
     * @param {String} event event
     * @param {Object} data data
     * @return {Promise<number>}
     */
    sendMessage(event, data) {
        return new Promise((resolve) => {
            this.addon.sendMessage(event, { args: [data] }).subscribe(resolve);
        });
    }

    /**
     * @private
     * @async
     * @method declare
     * @memberof Metric#
     * @param {Number} parentIndex parentIndex
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
     * @private
     * @method declareEntity
     * @memberof Metric#
     * @param {Entity} entity entity
     * @return {Promise<Number>}
     */
    async declareEntity(entity) {
        const data = entity.toJSON();
        const oldId = entity.id;
        const newId = await this.sendMessage("events.declare_entity", data)

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
     * @private
     * @method declareIdentityCard
     * @memberof Metric#
     * @param  {MetricIdentityCard} mic mic
     * @return {Promise<void>};
     */
    async declareIdentityCard(mic) {
        const data = mic.toJSON();
        const newId = await this.sendMessage("events.declare_mic", data);
        mic.id = newId;
        mic.dbPushed = true;
    }


    /**
     * @method identityCard
     * @param {String} name Entity name
     * @param {Object} options Entity options
     * @return {MetricIdentityCard}
     */
    identityCard(name, options) {
        const identityCard = new MetricIdentityCard(name, options);
        this.mic.set(identityCard.name, identityCard);
        this.setLinker(identityCard.entityId, identityCard.name);
        // if (this.eventLoaded === true) {
        //     if (Reflect.has(options, "entity") && options.entity.dbPushed === true) {
        //         this.declareIdentityCard();
        //     }
        // }

        return identityCard;
    }

    /**
     * @method entity
     * @param {String} name Entity name
     * @param {Object} options Entity options
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
     * @private
     * @method setLinker
     * @memberof Metric#
     * @param {Number} parent parent
     * @param {Number|String} value value
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

}

module.exports = Metric;
