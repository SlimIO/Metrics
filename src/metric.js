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
 * @func Metric
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
    const entities = new Map([[1, null]]);

    // Bind new Prototype
    const localEntity = getEntity(event);

    function sendMessage(target, args) {
        return new Promise((resolve, reject) => addon.sendMessage(target, { args }).subscribe(resolve, reject));
    }

    event.on("create_entity", async(entity) => {
        if (!addon.isAwake) {
            return cache.push([TYPES.entity, entity]);
        }

        // Handle unknown parent
        if (!entities.has(entity.parent)) {
            await doWhile({ max: 10, ms: 10 }, () => !entities.has(entity.parent));
        }

        const descriptors = [];
        // eslint-disable-next-line
        const handler = (id, key, value) => descriptors.push([id, key, value]);
        event.on("register_entity_descriptor", handler);

        const entityID = await sendMessage("events.declare_entity", [entity.toJSON()]);
        if (entity.id === null) {
            entity.id = entityID;
            entities.set(entityID, entity);
        }
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
        if (!addon.isAwake) {
            return cache.push([TYPES.mic, mic]);
        }

        // Handle unknown entity
        if (!entities.has(mic.entity)) {
            await doWhile({ max: 10, ms: 10 }, () => !entities.has(mic.entity));
        }

        const micID = await sendMessage("events.declare_mic", [mic.toJSON()]);
        mic.id = micID;
        const entity = entities.get(mic.entity);
        if (entity instanceof localEntity) {
            entity.mics.push(mic);
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
                entities.set(ent.id, null);
            }

            for (const [type, element] of cache) {
                event.emit(EVENT_MAP[type], element);
            }
        });
    });

    return {
        Global: entities,
        Entity: localEntity,
        MetricIdentityCard: getMic(event)
    };
}

module.exports = Metric;
