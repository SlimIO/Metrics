# SlimIO Metrics
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/SlimIO/is/commit-activity)
![MIT](https://img.shields.io/github/license/mashape/apistatus.svg)
![V1.0](https://img.shields.io/badge/version-1.5.0-blue.svg)

This package provide a developer interface to interact with Event Addon to automatically publish Metrics in local database without managing the asynchronous nature of the product.

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @slimio/metrics
# or
$ yarn add @slimio/metrics
```

## Usage exemple
Simple example for CPU Addon:

```js
// Require Node.js Dependencies
const os = require("os");

// Require Dependencies
const Addon = require("@slimio/addon");
const metrics = require("@slimio/metrics");
const Units = require("@slimio/units");

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

CPUAddon.on("awake", () => {
    CPUAddon.ready();
});

module.exports = CPUAddon;
```

## API
TBC

## License
MIT
