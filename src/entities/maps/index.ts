import { TestMap } from "./Test";

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
    burnRate: number;
    addsDamage: boolean;
    isWater: boolean;
    burnedTileId: number;
  };
}

const maps = {
  test: TestMap,
};

export default maps;
