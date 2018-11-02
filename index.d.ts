/// <reference types="node" />
/// <reference types="@types/es6-shim" />

import { AddressInfo } from "net";

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
        public descriptors: Map<string, string|number>;
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
        public unit: number;
        public entityId: number;
        public max: number;
        public interval: number;
    }

    declare class MetricIdentityCard {
        constructor(name: string, config?: IdentityCardOption);

        public name: string;
        public description: string;
        public unit: Units;
        public interval: number;
        public max: number;
        public entity: Entity;
        public id: number;
        public dbPushed: boolean;

        toJSON(): IdentityCardJSON;
    }

    declare class Metric {
        constructor(addon: Addon);

        private eventLoaded: boolean;
        private addon: Addon;
        private publishMetrics : Map<MetricIdentityCard.name, number>;

        public entities: Entity[];
        public mic: Map<string, MetricIdentityCard>;
        public linker: Map<Entity.id, entities.index|MetricIdentityCard.name>;

        private async declare(parentIndex: number);
        private async declareEntity(entity: Entity): Promise<number>;
        private async declareIdentityCard(mic: MetricIdentityCard): Promise<void>;
        private sendMessage(event: string, ...data: any): Promise<number>;
        private setLinker(parent: number, value: number|string): void;

        public identityCard(name: string, options: IdentityCardOption): MetricIdentityCard;
        public entity(name: string, options: EntityOption): Entity;
        public publish(name: string, value: number, harvestedAt: Date): void;
    }

}

export as namespace Metrics;
export = Metrics;
