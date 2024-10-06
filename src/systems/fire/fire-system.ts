import { Math as PMath } from "phaser";

import { Tilemaps } from "phaser";
import { System } from "..";
import { GameScene } from "../../scenes/game-scene";

export class FireSystem implements System {
  scene: GameScene;
  fireInterval: number;
  windAngle: number;
  windSpeed: number;
  windDirection: PMath.Vector2;

  constructor(scene: GameScene, fireInterval: number) {
    this.scene = scene;
    this.fireInterval = fireInterval;
    this.windAngle = PMath.RadToDeg(PMath.Vector2.UP.angle());
    this.windSpeed = 2;
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
    let {
      direction: windDirection,
      angle: windAngle,
      speed: windSpeed
    } = this.scene.windSystem.get();

    this.windDirection = windDirection;
    this.windAngle = windAngle;
    this.windSpeed = windSpeed;
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
    let eastSpread = 1;
    let westSpread = 1;
    let southSpread = 1;
    let northSpread = 1;

    if (this.windSpeed >= 3) {
      if (this.windDirection.x >= 0.8) {
        westSpread = 0;
      } else if (this.windDirection.x <= -0.8) {
        eastSpread = 0;
      } else if (this.windDirection.y >= 0.8) {
        northSpread = 0;
      } else if (this.windDirection.y <= -0.8) {
        southSpread = 0;
      }
    }

    if (this.windSpeed >= 7) {
      [westSpread, eastSpread] = this.windDirection.x >= 0.5 ?
        [Math.max(westSpread - 1, 0), eastSpread + 1] : [westSpread, eastSpread];
      [westSpread, eastSpread] = this.windDirection.x >= -0.5 ?
        [westSpread + 1, Math.max(eastSpread - 1)] : [westSpread, eastSpread];
      [northSpread, southSpread] = this.windDirection.y >= 0.5 ?
        [Math.max(northSpread - 1, 0), southSpread + 1] : [northSpread, southSpread];
      [northSpread, southSpread] = this.windDirection.y >= -0.5 ?
        [northSpread + 1, Math.max(southSpread - 1, 0)] : [northSpread, southSpread];
    }

    const ignitionPoints =
      this.scene.fireLayer
        .filterTiles((t: Tilemaps.Tile) => t.index === this.scene.fireTileId)
        .flatMap((tile) => [
          { x: tile.x - westSpread, y: tile.y },
          { x: tile.x + eastSpread, y: tile.y },
          { x: tile.x, y: tile.y - northSpread },
          { x: tile.x, y: tile.y + southSpread },
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
          angle: () => PMath.RND.between(this.windAngle - 15, this.windAngle + 15),
          speed: () => 4 + this.windSpeed,
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