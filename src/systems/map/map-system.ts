import { Tilemaps } from "phaser";
import { System } from "..";
import { GameScene } from "../../scenes/game-scene";

export enum MapTileType {
  Ground,
  Water
}

export class MapSystem implements System {
  scene: GameScene;
  burnInterval: number;
  maxBurn: number;

  constructor(scene: GameScene, burnInterval: number, maxBurn: number) {
    this.scene = scene;
    this.burnInterval = burnInterval;
    this.maxBurn = maxBurn;
  }

  create(): this {
    this.scene.time.addEvent({
      delay: this.burnInterval,
      loop: true,
      callback: () => this.burn()
    });

    this.scene.events.on("ignite", ({ x, y }: { x: number, y: number }) => {
      this.ignite(x, y);
    });

    this.scene.events.on("drop-water", ({ x, y, range }: { x: number, y: number, range: number }) => {
      this.extinguish(x, y, range);
    });

    return this;
  }

  update(_time: number, _delta: number): void {
    // noop for now
  }

  typeAtWorldXY(x: number, y: number) {
    let tile =
      this.scene.mapLayer.getTileAtWorldXY(
        x,
        y,
        true,
        this.scene.camera
      )

    return this.getType(tile);
  }

  private ignite(tileX: number, tileY: number) {
    let tile = this.scene.mapLayer.getTileAt(tileX, tileY);

    if (tile?.properties.burnRate > 0 && !tile?.properties.isBurning) {
      tile.properties.isBurning = true;
      tile.properties.burned = 0;
      this.scene.events.emit("start-fire", { x: tileX, y: tileY });
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
      .filter((t: Tilemaps.Tile) => t.properties.isBurning)
      .forEach((t: Tilemaps.Tile) => {
        t.properties.isBurning = false;
        that.scene.events.emit("stop-fire", { x: t.x, y: t.y })
      });
  }

  private burn() {
    let that = this;

    this.scene.mapLayer
      .filterTiles((t: Tilemaps.Tile) => t.properties.isBurning)
      .forEach((t: Tilemaps.Tile) => {
        t.properties.burned += t.properties.burnRate;

        if (t.properties.burned >= this.maxBurn) {
          if (t.properties.addsDamage) {
            this.scene.increaseDamage(1)
          }
          this.scene.mapLayer.putTileAt(t.properties.burnedTileId, t.x, t.y);
          t.properties.isBurning = false;
          t.properties.burnRate = 0;
          that.scene.events.emit("stop-fire", { x: t.x, y: t.y })
        }
      });
  }

  private getType(tile: Tilemaps.Tile | null) {
    if (tile?.properties.isWater === true) {
      return MapTileType.Water;
    } else {
      return MapTileType.Ground;
    }
  }
}