import { ContinentalMap } from "./Continental";
import { TestMap } from "./Test";

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

export interface MapLayerTile extends Phaser.Tilemaps.Tile {
  properties: {
    fireDamage: number;
    isBurning: boolean;
    burned: number;
    burnTimer: number;
    burnRate: number;
    addsDamage: boolean;
    isWater: boolean;
    burnedTileId: number;
    // TODO: Fuel can be killed by water?
    fuel: number;
    maxFuel: number;
  };
}

export enum MapTileType {
  Ground,
  Water,
}

const maps = {
  test: TestMap,
  continental: ContinentalMap,
};

export default maps;
