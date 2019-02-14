/// <reference types="node" />
/// <reference types="@types/es6-shim" />
/// <reference types="@slimio/addon" />

declare function Metrics(addon: Addon): {
    Global: {
        entities: Map<number, null | number | Metrics.Entity>;
        mics: Map<string, Metrics.MetricIdentityCard>;
    };
    Entity: typeof Metrics.Entity,
    MetricIdentityCard: typeof Metrics.MetricIdentityCard
};

declare namespace Metrics {
    interface EntityJSON {
        name: string;
        description: string;
        descriptors: {
            [key: string]: string;
        };
        parent: number;
    }

    declare class Entity {
        constructor(name: string, options?: {
            description?: string;
            parent?: Entity | number;
        });

        public name: string;
        public description: string;
        public parent: number;
        public descriptors: Map<string, string|number>;
        public id: number | null;
        public mics: MetricIdentityCard[];

        toJSON(): EntityJSON;
        set(key: string, value: number|string): Entity;
    }

    interface IdentityCardOption {
        unit: Units;
        entity: Entity | number;
        description?: string;
        max?: number;
        interval?: number;
    }

    interface IdentityCardJSON {
        description: string;
        unit: number;
        entityId: number;
        max: number;
        interval: number;
    }

    declare class MetricIdentityCard {
        constructor(name: string, options?: IdentityCardOption);

        public name: string;
        public description: string;
        public unit: Units;
        public interval: number;
        public max: number;
        public entity: Entity | number;
        public id: number;
        public readonly hasLocalRef: boolean;

        publish(value: any, harvestedAt?: number): void;
        toJSON(): IdentityCardJSON;
    }
}

export as namespace Metrics;
export = Metrics;
