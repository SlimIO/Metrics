const is = require("@slimio/is");
const Entity = require("./entity.class.js");

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
     */
    constructor(addon) {
        if (addon.constructor.name !== "Addon") {
            throw new TypeError("addon param must be an Addon object");
        }

        this.eventLoaded = false;
        this.addon = addon;
        this.entities = new Map();
        this.identityCards = new Map();

        this.addon.on("addonLoaded", (addonName) => {
            console.log(`AddonLoaded : ${addonName}`);
            if (addonName === "events") {
                this.eventLoaded = true;
                if (is.directInstanceOf(this.entity, Entity)) {
                    this.declareEntity();
                }
                // this.entity.eventLoaded(this.addon);
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
     * @method declareEntity
     */
    async declareEntity() {

        const promises = [];
        const ids = [];
        for (const [, entity] of this.entities) {
            if (entity.parent === 1) {
                const data = entity.getDataEntity();
                ids.push(entity.id);
                promises.push(this.sendMessage("events.declare_entity", data));
                entity.parentId(this.id);
                entity.eventLoaded(this.addon);
            }
        }
        const promisesIds = await Promise.all(promises);
        for (let i = 0; i < ids.length; i++) {
            for (const [, entity] of this.entities) {
                if (entity.id === ids[i]) {
                    entity.id = promisesIds[i];
                }
                if (entity.parent === ids[i]) {
                    entity.parent = promisesIds[i];
                }
                
            }
        }

        if (this.identityCards.size() > 0) {
            for (const [, identityCard] of this.identityCards) {
                identityCard.entityId(this.id);
                identityCard.eventLoaded(this.Entityaddon);
            }
        }
    }

    /**
     * @method entity
     * @param {String} name Entity name
     * @param {Object} options Entity options
     * @return {Entity}
     */
    entity(name, options) {
        const entity = new Entity(name, options);
        this.entities.set(name, entity);
        if (this.eventLoaded === true) {
            // this.entity.eventLoaded(this.addon);
            this.declareEntity();
        }

        return entity;
    }

}

module.exports = Metric;
