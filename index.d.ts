/// <reference types="node" />
/// <reference types="@types/es6-shim" />

declare namespace Metrics {

    interface EntityOption {
        description?: string;
        parent?: Entity;
    }

    interface EntityJSON {
        name: string;
        description: string;
        descriptors: {
            [key: string]: string;
        };
        parent: number;
    }

    declare class Entity {
        constructor(name: string, options?: EntityOption);

        public name: string;
        public description: string;
        public parent: number;
        public descriptors: Map<string, string>;
        public id: number;
        public dbPushed: boolean;

        toJSON(): EntityJSON;
        set(key: string, value: number|string): Entity;
    }

    interface IdentityCardOption {
        unit: Units;
        entity: Entity;
        description?: string;
        max?: number;
        interval?: number;
    }

    interface IdentityCardJSON {
        public description: string;
        public unit: Units;
        public entityId: number;
        public max: number;
        public interval: number;
    }

    declare class MetricIdentityCard {
        constructor(name: string, config?: IdentityCardOption);

        public name: string;
        public description: string;
        public unit: Units;
        public entity: Entity;
        public max: number;
        public interval: number;

        toJSON(): IdentityCardJSON;
    }

}

export as namespace Metrics;
export = Metrics;
