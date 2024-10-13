import { System } from "..";
import { GameScene } from "../../scenes/game-scene";
import {
  EVENT_DROP_WATER,
  EVENT_IGNITE,
  EVENT_START_FIRE,
  EVENT_STOP_FIRE,
} from "../../consts";
import { MapLayerTile } from "../../entities/maps";

export enum MapTileType {
  Ground,
  Water,
}

export class MapSystem implements System {
  scene: GameScene;
  burnInterval: number;

  constructor(scene: GameScene, burnInterval: number) {
    this.scene = scene;
    this.burnInterval = burnInterval;
  }

  create(): this {
    this.scene.events.on(EVENT_IGNITE, ({ x, y }: { x: number; y: number }) => {
      this.ignite(x, y);
    });

    this.scene.events.on(
      EVENT_DROP_WATER,
      ({ x, y, range }: { x: number; y: number; range: number }) => {
        this.extinguish(x, y, range);
      }
    );

    return this;
  }

  update(_time: number, delta: number): void {
    this.burnTiles(delta);
  }

  typeAtWorldXY(x: number, y: number) {
    let tile = this.scene.mapLayer.getTileAtWorldXY(
      x,
      y,
      true,
      this.scene.camera
    );

    return this.getType(tile);
  }

  private ignite(tileX: number, tileY: number) {
    let tile = this.scene.mapLayer.getTileAt(tileX, tileY) as MapLayerTile;

    if (tile?.properties.burnRate > 0 && !tile?.properties.isBurning) {
      tile.properties.isBurning = true;
      tile.properties.burned = 0;
      tile.properties.fuel = tile.properties.maxFuel || 50;
      tile.properties.burnTimer = 0;
      this.scene.events.emit(EVENT_START_FIRE, { x: tileX, y: tileY });
    }
  }

  private extinguish(worldX: number, worldY: number, range: number) {
    let that = this;

    this.scene.mapLayer
      .getTilesWithinWorldXY(
        worldX,
        worldY,
        range,
        range,
        {},
        this.scene.camera
      )
      .filter((t: MapLayerTile) => t.properties.isBurning)
      .forEach((t: MapLayerTile) => {
        t.properties.isBurning = false;
        that.scene.events.emit(EVENT_STOP_FIRE, { x: t.x, y: t.y });
      });
  }

  private burnTiles(delta: number) {
    this.scene.mapLayer
      .filterTiles((t: MapLayerTile) => t.properties.isBurning)
      .forEach((t: MapLayerTile) => {
        t.properties.burnTimer += delta;

        if (
          t.properties.burnTimer >=
          this.burnInterval / t.properties.burnRate
        ) {
          t.properties.burnTimer = 0;
          t.properties.burned += 1;
          // TODO: Fuel can be killed by water
          t.properties.fuel -= 1;

          // The closer to 0, the higher chance of spreading fire
          // TODO: This should probably be a function of a tile spread speed (TBD)
          let spreadChance = t.properties.fuel / t.properties.maxFuel;
          if (spreadChance) {
            // The position of the ignition point is relative to the tile
            this.ignite(
              t.x + Math.floor(Math.random() * 3) - 1,
              t.y + Math.floor(Math.random() * 3) - 1
            );
          }

          if (t.properties.fuel <= 0) {
            this.consumeTile(t);
          }
        }
      });
  }

  private consumeTile(t: MapLayerTile) {
    if (t.properties.addsDamage) {
      this.scene.increaseDamage(1);
    }
    t.index = t.properties.burnedTileId;
    t.properties.isBurning = false;
    t.properties.burnRate = 0;
    t.properties.fuel = 0;
    this.scene.events.emit(EVENT_STOP_FIRE, { x: t.x, y: t.y });
  }

  private getType(tile: MapLayerTile | null) {
    if (tile?.properties.isWater === true) {
      return MapTileType.Water;
    } else {
      return MapTileType.Ground;
    }
  }
}
