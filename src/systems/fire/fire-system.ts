import { Tilemaps } from "phaser";
import { System } from "..";
import { GameScene } from "../../scenes/game-scene";

export class FireSystem implements System {
  scene: GameScene;
  fireInterval: number;

  constructor(scene: GameScene, fireInterval: number) {
    this.scene = scene;
    this.fireInterval = fireInterval;
  }

  create(): this {
    this.scene.fireLayer
      .filterTiles((t: Tilemaps.Tile) => t.index === this.scene.fireTileId)
      .forEach((tile) => {
        this.emitSmoke(tile);
      });

    this.scene.time.delayedCall(1000, () => {
      this.spreadFire();
      this.spreadFire();
    });

    this.scene.time.addEvent({
      delay: this.fireInterval,
      loop: true,
      callback: () => this.spreadFire()
    });

    this.scene.events.on("start-fire", ({ x, y }: { x: number, y: number }) => {
      this.startFire(x, y)
    });

    this.scene.events.on("stop-fire", ({ x, y }: { x: number, y: number }) => {
      this.stopFire(x, y)
    });

    return this;
  }

  update(_time: number, _delta: number): void {
    // noop for now
  }

  private startFire(tileX: number, tileY: number) {
    let tile = this.scene.fireLayer.getTileAt(tileX, tileY);

    if (tile?.index !== this.scene.fireTileId) {
      tile = this.scene.fireLayer.putTileAt(this.scene.fireTileId, tileX, tileY);
      this.emitSmoke(tile);
    }
  }

  private stopFire(tileX: number, tileY: number) {
    let tile = this.scene.fireLayer.getTileAt(tileX, tileY);

    if (tile.index === this.scene.fireTileId) {
      this.scene.fireLayer.removeTileAt(tileX, tileY);
      this.stopSmoke(tile);
    }
  }

  private spreadFire() {
    let ignitionPoints =
      this.scene.fireLayer
        .filterTiles((t: Tilemaps.Tile) => t.index === this.scene.fireTileId)
        .flatMap((tile) => [
          { x: tile.x - 1, y: tile.y },
          { x: tile.x + 1, y: tile.y },
          { x: tile.x, y: tile.y - 1 },
          { x: tile.x, y: tile.y + 1 },
        ]);

    [...new Set(ignitionPoints)].forEach(p => {
      this.scene.events.emit("ignite", p)
    });
  }

  private emitSmoke(tile: Tilemaps.Tile) {
    if (tile.properties.smoke === undefined) {
      tile.properties.smoke = this.scene.add.particles(
        tile.pixelX,
        tile.pixelY,
        "smoke",
        {
          x: { random: [0, tile.width] },
          y: { random: [0, tile.height] },
          quantity: 1,
          angle: { min: -45, max: -15 },
          speed: 5,
          frequency: 80,
          lifespan: 2000,
        }
      );
    }
  }

  private stopSmoke(tile: Tilemaps.Tile) {
    tile.properties.smoke?.destroy();
    delete tile.properties.smoke;
  }
}