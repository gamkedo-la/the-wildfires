import { ContinentalMap } from "./Continental";
import { ContinentalTestMap } from "./ContinentalTest";

export interface MapWithProperties extends Phaser.Tilemaps.Tilemap {
  properties: Array<{
    name: string;
    value: number;
  }>;
}

export interface PoiProperties {
  poi: number;
  name: string;
  duration: number;
  delay: number;
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
    burnedTileId: number;
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
  CONTINENTAL_TEST: ContinentalTestMap,
};

export type MapType = keyof typeof MAPS;
export type MapClass = (typeof MAPS)[MapType];
