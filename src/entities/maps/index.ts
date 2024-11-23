import { ContinentalMap } from "./Continental";

export interface MapWithProperties extends Phaser.Tilemaps.Tilemap {
  properties: Array<{
    name: string;
    value: number;
  }>;
}

export interface FireLayerTile extends Phaser.Tilemaps.Tile {
  properties: {
    smoke: Phaser.GameObjects.Particles.ParticleEmitter;
  };
}

export interface StructuresLayerTile extends Phaser.Tilemaps.Tile {
  properties: {
    isBuilding: boolean;
    burnRate: number;
    isRoad: boolean;
  };
}

export interface MapLayerTile extends Phaser.Tilemaps.Tile {
  properties: {
    fireDamage: number;
    isBurning: boolean;
    wasBurning: boolean;
    burnTimer: number;
    burnRate: number;
    addsDamage: boolean;
    isWater: boolean;
    burnedTileId: number;
    fuel: number;
    maxFuel: number;
    isWatered: boolean;
    waterTimer: number;
  };
}

export enum MapTileType {
  Ground,
  Water,
}

export const MAPS = {
  CONTINENTAL: ContinentalMap,
};

export type MapType = keyof typeof MAPS;
export type MapClass = (typeof MAPS)[MapType];
