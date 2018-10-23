const is = require("@slimio/is");
const Entity = require("./entity.class.js");
const IdentityCard = require("./identityCard.class.js");

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
        this.entities = [];
        this.identityCards = [];

        this.addon.on("addonLoaded", (addonName) => {
            // console.log(`AddonLoaded : ${addonName}`);
            if (addonName === "events") {
                this.eventLoaded = true;
                if (this.entities.length > 0) {
                    this.declareEntity();
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
     * @method declareEntity
     * @memberof Metric#
     * @param {Number} parentIndex parentIndex
     * @return {Promise<void>}
     */
    async declareEntity(parentIndex = 1) {

        const promises = [];
        const entityIds = [];

        for (const entity of this.entities) {
            if (entity.parent === parentIndex) {
                const data = entity.getDataEntity();
                entityIds.push(entity.id);
                promises.push(this.sendMessage("events.declare_entity", data));
            }
        }
        const promisesIds = await Promise.all(promises);
        for (let i = 0; i < entityIds.length; i++) {
            // Get db id to entities published and link parentId

            for (const entity of this.entities) {
                if (entity.id === entityIds[i]) {
                    entity.id = promisesIds[i];
                    entity.dbPushed = true;
                }
                if (entity.parent === entityIds[i]) {
                    entity.parent = promisesIds[i];
                }
            }
            this.declareIdentityCard(promisesIds);
            this.declareEntity(promisesIds[i]);
        }
    }

    /**
     * @private
     * @method declareIdentityCard
     * @memberof Metric#
     * @param  {Array<Number>} entityId entityId
     * @return {Promise<void>};
     */
    async declareIdentityCard(entityId) {
        const promisesIdentityCard = [];

        const identityCards = this.identityCards.filter((ic) => {
            for (const entId of entityId) {
                if (entId === ic.entity.id) {
                    return true;
                }
            }

            return false;
        });

        const identityCardPubliched = [];

        for (const identityCard of identityCards) {
            const data = identityCard.getDataIdentityCard();
            promisesIdentityCard.push(this.sendMessage("events.declare_mic", data));
            identityCardPubliched.push(identityCard);
        }

        const IdentityCardIds = await Promise.all(promisesIdentityCard);
        for (let i = 0; i < identityCards.length; i++) {
            identityCards[i].id = IdentityCardIds[i];
        }
    }


    /**
     * @method identityCard
     * @param {String} name Entity name
     * @param {Object} options Entity options
     * @return {Metric}
     */
    identityCard(name, options) {
        const identityCard = new IdentityCard(name, options);
        this.identityCards.push(identityCard);
        if (this.eventLoaded === true) {
            if (Reflect.has(options, "entity") && options.entity.dbPushed === true) {
                this.declareIdentityCard();
            }
        }

        return this;
    }

    /**
     * @method entity
     * @param {String} name Entity name
     * @param {Object} options Entity options
     * @return {Entity}
     */
    entity(name, options) {
        const ent = new Entity(name, options);
        this.entities.push(ent);
        if (this.eventLoaded === true) {
            if (Reflect.has(options, "parent") && options.parent.dbPushed === true) {
                this.declareEntity(ent.parent);
            }
        }

        return ent;
    }

}

module.exports = Metric;
