/// <reference types="node" />

declare namespace Metrics {

    interface EntityOption {
        description: string,
        parent: number
    }
    interface IdentityCardOption {
        unit: Units,
        entity: Entity
    }
    
    declare class Entity {
        constructor(name: string, options?: EntityOption);
    
        public name: string;
        public description: string;
        public parent: number;

        parent(entity: Entity): Entity;
        set(key: string, value: number): Entity;
    }

    declare class IdentityCard {
        constructor(name: string, config?: IdentityCardOption);
    
        public name: string;
        public unit: Units;
        public entity: Entity;
    }

}

export as namespace Metrics;
export = Metrics;