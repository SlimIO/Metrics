/// <reference types="node" />
/// <reference types="@types/es6-shim" />
/// <reference types="@slimio/addon" />
/// <reference types="@slimio/tsd" />

import * as events from "events";

declare function Metrics(addon: Addon): {
    Global: {
        entities: Set<number | Metrics.Entity>;
        mics: Map<string, Metrics.MetricIdentityCard>;
    };
    Entity: typeof Metrics.Entity,
    MetricIdentityCard: typeof Metrics.MetricIdentityCard
};

declare namespace Metrics {
    declare class Entity {
        constructor(name: string, options?: {
            description?: string;
            parent?: Entity | number;
        });

        public name: string;
        public description: string;
        public parent: Entity | number;
        public descriptors: Map<string, string|number>;
        public id: number | null;
        public mics: MetricIdentityCard[];

        toJSON(): SlimIO.RawEntity;
        set(key: string, value: number|string): Entity;
    }

    declare class MetricIdentityCard extends events {
        constructor(name: string, options?: {
            unit: Units;
            entity: Entity | number;
            description?: string;
            max?: number;
            interval?: number;
        });

        public name: string;
        public description: string;
        public unit: Units;
        public interval: number;
        public max: number;
        public entity: Entity | number;
        public id: number;
        public readonly hasLocalRef: boolean;

        publish(value: any, harvestedAt?: number): void;
        toJSON(): SlimIO.RawIdentityCard;
    }
}

export as namespace Metrics;
export = Metrics;
