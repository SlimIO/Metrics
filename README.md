# SlimIO Metrics
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/SlimIO/is/commit-activity)
![MIT](https://img.shields.io/github/license/mashape/apistatus.svg)
![V1.0](https://img.shields.io/badge/version-1.5.0-blue.svg)
![0DEP](https://img.shields.io/badge/Dependencies-1-yellow.svg)

This package provide a developer interface to interact with Event Addon to automatically publish Metrics in local database without managing the asynchronous nature of the product.

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @slimio/metrics
# or
$ yarn add @slimio/metrics
```

## Usage exemple
A script that demonstrate how to publish `Entity` and `IdentityCard`

```js
// NodeJS Dependencies
const os = require("os");

// SlimIO Dependencies
const { Pourcent } = require("@slimio/units");
const Metrics = require("@slimio/metrics");
const Addon = require("@slimio/addon");

const CPU = new Addon("CPU");
const metric = new Metrics(CPU);

CPU.on("start", () => {
    console.log("[CPU] Start event triggered!");
    const cpuEntity = metric.entity("CPU", {
        description: "Central Processing Unit"
    });

    const cpus = os.cpus();
    for (let id = 0; id < cpus.length; id++) {
        const entity = metric.entity(`CPU.${id}`, { parent: cpuEntity })
            .set("speed", cpus[id].speed)
            .set("model", cpus[id].model);

        const micConfig = { unit: Pourcent, entity };
        metric.identityCard("USER", micConfig);
        metric.identityCard("NICE", micConfig);
        metric.identityCard("SYS", micConfig);
        metric.identityCard("IDLE", micConfig);
        metric.identityCard("IRQ", micConfig);
    }
});

// Export addon
module.exports = CPU;
```
## API

### metric.entity(name: string, options: EntityOption): Entity
Publish entity in local db

```js
const Metrics = require("@slimio/metrics");
const Addon = require("@slimio/addon");

const CPU = new Addon("CPU");
const metric = new Metrics(CPU);

CPU.on("start", () => {
    const cpuEntity = metric.entity("CPU", {
        description: "Central Processing Unit"
    });
    const childCPU = metric.entity(`CPU.1`, { parent: cpuEntity });
}
```

Entity options interface
```typescript
interface EntityOption {
    description?: string;
    parent?: Entity;
}
```

### Entity.set(key: string, value: number|string): Entity
Publish entity descriptor
```js
const Metrics = require("./Metrics");
const Addon = require("@slimio/addon");

const CPU = new Addon("CPU");
const metric = new Metrics(CPU);

CPU.on("start", () => {
    metric.entity("CPU", {
        description: "Central Processing Unit"
    })
        .set("speed", cpus[id].speed)
        .set("model", cpus[id].model);
}
```

### metric.identityCard(name: string, options: IdentityCardOption): IdentityCard
Publish identityCard in local db
```js
const Unit = require("@slimio/units");
const Metrics = require("./Metrics");
const Addon = require("@slimio/addon");

const CPU = new Addon("CPU");
const metric = new Metrics(CPU);

CPU.on("start", () => {
    const entity = metric.entity("CPU", {
        description: "Central Processing Unit"
    });
    const cardConfig = { unit: Unit.Pourcent, entity };
    metric.identityCard("USER", cardConfig);
}
```

IdentityCard options interface
```typescript
interface IdentityCardOption {
    unit: Units;
    entity: Entity;
    description?: string;
    max?: number;
    interval?: number;
}
```

### metric.publish(name: string, value: number, harvestedAt: Date): void
Publish metric in local db
```js
const Unit = require("@slimio/units");
const Metrics = require("./Metrics");
const Addon = require("@slimio/addon");

const CPU = new Addon("CPU");
const metric = new Metrics(CPU);

CPU.on("start", () => {
    const entity = metric.entity("CPU", {
        description: "Central Processing Unit"
    });
    const cardConfig = { unit: Unit.Pourcent, entity };
    metric.identityCard("USER", cardConfig);

    setInterval(() => {
        const harvestedAt = Date.now();
        const cpus = os.cpus();
        metric.publish(`CPU_USER`, cpus[0].times.user, harvestedAt);
    }, 5000);
}
```

## Licence

MIT

## TODO

- Test offset async publish Entity, IdentityCard and Metrics
