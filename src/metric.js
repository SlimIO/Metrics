"use strict";

// Require Third-Party Dependencies
const SafeEmitter = require("@slimio/safe-emitter");

// Require Internal Dependencies
const getEntity = require("./entity.class");
const getMic = require("./mic.class");
const { doWhile } = require("./utils");

// CONSTANTS
const TYPES = Object.freeze({ entity: 0, mic: 1, metric: 2 });
const EVENT_MAP = Object.freeze({
    [TYPES.entity]: "create_entity",
    [TYPES.mic]: "create_mic",
    [TYPES.metric]: "publish_metric"
});

/**
 * @function Metric
 * @param {!Addon} addon SlimIO Addon Container
 * @returns {void}
 */
function Metric(addon) {
    if (addon.constructor.name !== "Addon") {
        throw new TypeError("addon must be instanceof Addon");
    }

    // Scoped Variables
    const cache = [];
    const event = new SafeEmitter();
    event.catch((err) => console.error(err));
    const entities = new Set([1]);
    const mics = new Map();

    // Bind new Prototype
    const localEntity = getEntity(event);

    function sendMessage(target, args) {
        return new Promise((resolve, reject) => addon.sendMessage(target, { args }).subscribe(resolve, reject));
    }

    function sendRawQoS(micName, value, harvestedAt = Date.now()) {
        if (mics.has(micName)) {
            mics.get(micName).publish(value, harvestedAt);
        }
    }

    event.on("create_entity", async(entity) => {
        if (!addon.isAwake) {
            return cache.push([TYPES.entity, entity]);
        }

        // Handle unknown parent
        if (!entities.has(entity.parent)) {
            const stop = await doWhile({ max: 6, ms: 5 }, () => !entities.has(entity.parent));
            if (stop) {
                return void 0;
            }
        }

        const descriptors = [];
        // eslint-disable-next-line
        const handler = (id, key, value) => descriptors.push([id, key, value]);
        event.on("register_entity_descriptor", handler);

        const entityID = await sendMessage("events.declare_entity", [entity.toJSON()]);
        entity.id = entityID;
        entities.add(entity);
        event.removeEventListener("register_entity_descriptor", handler);

        for (const [, key, value] of descriptors) {
            event.emit("register_entity_descriptor", entityID, key, value);
        }

        return void 0;
    });

    event.on("register_entity_descriptor", async(entityId, key, value) => {
        if (!addon.isAwake || entityId === null) {
            return void 0;
        }

        await sendMessage("events.declare_entity_descriptor", [entityId, [key, value]]);

        return void 0;
    });

    event.on("create_mic", async(mic) => {
        mics.set(mic.name, mic);
        if (!addon.isAwake) {
            return cache.push([TYPES.mic, mic]);
        }

        // Handle unknown entity
        if (!entities.has(mic.entity)) {
            const stop = await doWhile({ max: 6, ms: 5 }, () => !entities.has(mic.entity));
            if (stop) {
                return void 0;
            }
        }

        const micID = await sendMessage("events.declare_mic", [mic.toJSON()]);
        mic.id = micID;
        mic.emit("ready");

        if (mic.entity instanceof localEntity) {
            mic.entity.mics.push(mic);
        }

        return void 0;
    });

    event.on("publish_metric", async([micId, value, harvestedAt]) => {
        if (!addon.isAwake || micId === null) {
            return void 0;
        }

        await sendMessage("events.publish_metric", [micId, [value, harvestedAt]]);

        return void 0;
    });

    // Add lockOn on nextTick (to process cache)
    process.nextTick(() => {
        if (!addon.locks.has("events")) {
            addon.lockOn("events");
        }

        addon.on("awake", async() => {
            const allEntities = await sendMessage("events.search_entities", [{ fields: "id" }]);
            for (const ent of allEntities) {
                entities.add(ent.id);
            }

            const lCache = cache.splice(0, cache.length).sort((left, right) => left[0] - right[0]);
            for (const [type, element] of lCache) {
                event.emit(EVENT_MAP[type], element);
            }
        });
    });

    return {
        Global: Object.freeze({ entities, mics }),
        sendRawQoS,
        Entity: localEntity,
        MetricIdentityCard: getMic(event)
    };
}

module.exports = Metric;
