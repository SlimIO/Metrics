# SlimIO Metrics
![version](https://img.shields.io/badge/dynamic/json.svg?url=https://raw.githubusercontent.com/SlimIO/Metrics/master/package.json&query=$.version&label=Version)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/SlimIO/Metrics/commit-activity)
![MIT](https://img.shields.io/github/license/mashape/apistatus.svg)
![dep](https://img.shields.io/david/SlimIO/Metrics)
![size](https://img.shields.io/bundlephobia/min/@slimio/metrics)
![Known Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/github/SlimIO/Metrics)
[![Build Status](https://travis-ci.com/SlimIO/Metrics.svg?branch=master)](https://travis-ci.com/SlimIO/Metrics)

This package provide a developer interface to interact with Event Addon to automatically publish Metrics in local database without managing the asynchronous nature of the product.

## Requirements
- [Node.js](https://nodejs.org/en/) v12 or higher

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @slimio/metrics
# or
$ yarn add @slimio/metrics
```

## Usage example
Simple example for CPU Addon:

```js
// Require Node.js Dependencies
import os from "os";

// Require Dependencies
import Units from "@slimio/units";
import metrics from "@slimio/metrics";
import Addon from "@slimio/addon";

// Initialize Addon and Wrappers
const CPUAddon = new Addon("cpu");
const { Entity, MetricIdentityCard } = metrics(CPUAddon);

// Declare entities and MIC
const E_CPU = new Entity("CPU", {
    description: "Central Processing Unit"
});

const cpus = os.cpus();
for (let id = 0; id < cpus.length; id++) {
    const entity = new Entity(`CPU.${id}`, { parent: E_CPU })
        .set("speed", cpus[id].speed)
        .set("model", cpus[id].model);

    const config = { unit: Units.MilliSecond, entity };
    new MetricIdentityCard("USER", config);
    new MetricIdentityCard("NICE", cardConfig);
    new MetricIdentityCard("SYS", cardConfig);
    new MetricIdentityCard("IDLE", cardConfig);
    new MetricIdentityCard("IRQ", cardConfig);
}

export default CPUAddon;
```

## API
The metrics package return a function described by the following interface:
```ts
declare function Metrics(addon: Addon): {
    Global: {
        entities: Map<number, null | number | Metrics.Entity>;
        mics: Map<string, Metrics.MetricIdentityCard>;
    };
    sendRawQoS: (micName: string, value: any, harvestedAt?: number) => void;
    Entity: typeof Metrics.Entity;
    MetricIdentityCard: typeof Metrics.MetricIdentityCard;
};
```

Each instance of Entity and MetricIdentityCard are unique to the local Addon. Global is a freezed Object which contains information on Entity and MetricIdentityCard (helpful if you want **to retrieve a MIC by his name** for example).

There is no way to retrieve Entity by name (the operation cost is `O(1)`). The callback `events.search_entities` can be used instead.

### sendRawQoS(micName: string, value: any, harvestedAt?: number): void
Will search for an mic with the given name in `Global.mics` and execute the method `MetricIdentityCard.publish` on it with the given value and harvested timestamp.

### Entity
This section describe the methods and properties of Entity Object.

<details><summary>constructor(name: string, options?: EntityOptions)</summary>
<br />

Create a new Entity Object. Options is described by the following interface:
```ts
{
    description?: string;
    parent?: Entity | number;
}
```

if the parent is not defined it will be defined to integer `1` (which corresponds to the root entity of the product).
```js
new Entity("CPU", {
    description: "hello world!"
});
```
</details>

<details><summary>set(key: string, value: number|string): this</summary>
<br />

Set a new static descriptor on the entity. Descriptors can be added at any time !
```js
new Entity("CPU").set("foo", "bar");
```
</details>

<details><summary>toJSON(): SlimIO.RawEntity</summary>
<br />

Return the JSON version of Entity Object.
```ts
interface EntityJSON {
    name: string;
    description: string;
    descriptors: {
        [key: string]: string;
    };
    parent: number;
}
```
</details>
<br />

> Note: the Entity.description field is a getter/setter. Any update will be automatically pushed to the event database!

### MetricIdentityCard
This section describe the methods and properties of MetricIdentityCard Object. This object is extended by the Node.js EventEmitter.

<details><summary>constructor(name: string, options?: IdentityCardOption)</summary>
<br />

Create a new MetricIdentityCard Object. Options is described by the following interface:
```ts
interface IdentityCardOption {
    unit: Units;
    entity: Entity | number;
    description?: string;
    max?: number;
    interval?: number;
}
```

`max` will be defined by `Units.max`. The default interval is equal to `5`.

```js
new MetricIdentityCard("CPU_1", {
    units: Units.Seconds,
    entity: CPU
});
```
</details>

<details><summary>publish(value: any, harvestedAt?: number): void</summary>
<br />

Publish a new raw metric to the event DB. When is the MIC is not yet ready, raw metrics are cached awaiting for the local Addon is awakened.

When the MIC is ready to publish, the event `ready` will be throw.
</details>

<details><summary>toJSON(): SlimIO.RawIdentityCard</summary>
<br />

Return the JSON version of MetricIdentityCard Object.
```ts
interface IdentityCardJSON {
    description: string;
    unit: number;
    entityId: number;
    max: number;
    interval: number;
}
```
</details>
<br />

> Note: "ready" event will be throw when the MIC is ready to publish raw metrics.

## Dependencies

|Name|Refactoring|Security Risk|Usage|
|---|---|---|---|
|[@slimio/is](https://github.com/SlimIO/is#readme)|Minor|Low|Type checker|
|[@slimio/safe-emitter](https://github.com/SlimIO/safeEmitter#readme)|Minor|High|Safe emitter|
|[@slimio/utils](https://github.com/SlimIO/Utils#readme)|Minor|High|Bunch of useful functions|


## License
MIT
