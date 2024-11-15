import { Math as PMath, Tilemaps } from "phaser";
import { System } from "..";
import { EVENT_DROP_WATER } from "../../consts";
import {
  FireLayerTile,
  MapLayerTile,
  StructuresLayerTile,
} from "../../entities/maps";
import { GameMap } from "../../entities/maps/GameMap";
import { GameScene } from "../../scenes/game-scene";

export class FireMapSystem implements System {
  scene: GameScene;
  fireInterval: number;
  burnInterval: number;
  windAngle: number;
  windSpeed: number;
  windDirection: PMath.Vector2;

  map: GameMap;

  constructor(scene: GameScene, fireInterval: number, burnInterval: number) {
    this.scene = scene;
    this.map = scene.currentMap;

    this.fireInterval = fireInterval;
    this.burnInterval = burnInterval;
    this.windAngle = PMath.RadToDeg(PMath.Vector2.UP.angle());
    this.windSpeed = 2;
  }

  create(): this {
    this.initializeFireTiles();
    this.setupFireSpread();
    this.setupWaterDropEvent();
    return this;
  }

  update(_time: number, delta: number): void {
    this.updateWindParameters();
    this.burnTiles(delta);
  }

  private initializeFireTiles() {
    this.map.fireLayer
      .filterTiles((t: Tilemaps.Tile) => t.index === this.map.fireTileId)
      .forEach((tile) => {
        this.emitSmoke(tile as FireLayerTile);
      });

    this.scene.time.delayedCall(100, () => {
      this.spreadFire();
    });

    this.scene.time.delayedCall(200, () => {
      this.spreadFire();
    });
  }

  private setupFireSpread() {
    this.scene.time.addEvent({
      delay: this.fireInterval,
      loop: true,
      callback: () => this.spreadFire(),
    });
  }

  private setupWaterDropEvent() {
    this.scene.events.on(
      EVENT_DROP_WATER,
      ({ x, y, range }: { x: number; y: number; range: number }) => {
        this.extinguishCross(x, y, range);
      }
    );
  }

  private updateWindParameters() {
    let {
      direction: windDirection,
      angle: windAngle,
      speed: windSpeed,
    } = this.scene.windSystem.get();

    this.windDirection = windDirection;
    this.windAngle = windAngle;
    this.windSpeed = windSpeed;
  }

  private ignite(tileX: number, tileY: number) {
    let mapTile = this.map.mapLayer.getTileAt(tileX, tileY) as MapLayerTile;
    let structuresTile = this.map.structuresLayer.getTileAt(
      tileX,
      tileY
    ) as StructuresLayerTile;

    if (structuresTile?.properties.isRoad && Phaser.Math.Between(0, 100) < 90) {
      // TODO: magic number
      // 10% chance to ignite road
      return;
    }

    if (mapTile?.properties.burnRate > 0 && !mapTile?.properties.isBurning) {
      mapTile.properties.isBurning = true;
      mapTile.properties.burned = 0;
      mapTile.properties.fuel = mapTile.properties.maxFuel || 50;
      mapTile.properties.burnTimer = 0;

      let tile = this.map.putFire(tileX, tileY);
      this.emitSmoke(tile);
    }
  }

  private extinguish(tileX: number, tileY: number) {
    let mapTile = this.map.mapLayer.getTileAt(tileX, tileY) as MapLayerTile;

    if (mapTile?.properties.isBurning) {
      mapTile.properties.isBurning = false;
      let tile = this.map.removeFire(tileX, tileY);
      this.stopSmoke(tile);
    }

    const poi = this.map.pointsOfInterestLayer.getTileAt(tileX, tileY)?.index;
    if (poi) {
      this.map.causePointOfInterestDamage(
        poi - this.map.pointsOfInterestLayer.startingIndex
      );
    }
  }

  // Extinguish in a '+' shape pattern
  private extinguishCross(worldX: number, worldY: number, range: number) {
    const { x: tileX, y: tileY } = this.map.mapLayer.worldToTileXY(
      worldX,
      worldY,
      true
    );

    for (let x = tileX - range; x <= tileX + range; x++) {
      this.extinguish(x, tileY);
    }
    for (let y = tileY - range; y <= tileY + range; y++) {
      if (y !== tileY) {
        // Avoid double-extinguishing the center tile
        this.extinguish(tileX, y);
      }
    }
  }

  private burnTiles(delta: number) {
    this.map.mapLayer
      .filterTiles((t: MapLayerTile) => t.properties.isBurning)
      .forEach((t: MapLayerTile) => {
        t.properties.burnTimer += delta;

        if (
          t.properties.burnTimer >=
          this.burnInterval / t.properties.burnRate
        ) {
          t.properties.burnTimer = 0;
          t.properties.burned += 1;
          t.properties.fuel -= 1;

          // TODO: magic number
          let spreadChance = Phaser.Math.Between(0, 10);
          if (spreadChance < t.properties.burnRate) {
            this.ignite(
              t.x + Math.floor(Math.random() * 2) - 1,
              t.y + Math.floor(Math.random() * 2) - 1
            );
          }

          if (t.properties.fuel <= 0) {
            if (t.properties.addsDamage) {
              this.scene.increaseDamage(1);
            }
            t.index = t.properties.burnedTileId;
            t.properties.burnRate = 0;
            this.extinguish(t.x, t.y);
          }
        }
      });
  }

  private spreadFire() {
    let [eastSpread, westSpread, southSpread, northSpread] =
      this.calculateSpread();

    const ignitionPoints = this.map.fireLayer
      .filterTiles((t: Tilemaps.Tile) => t.index === this.map.fireTileId)
      .flatMap((tile) => [
        { x: tile.x - westSpread, y: tile.y },
        { x: tile.x + eastSpread, y: tile.y },
        { x: tile.x, y: tile.y - northSpread },
        { x: tile.x, y: tile.y + southSpread },
      ]);

    [...new Set(ignitionPoints)].forEach((p) => {
      this.ignite(p.x, p.y);
    });
  }

  private calculateSpread() {
    let eastSpread = 1,
      westSpread = 1,
      southSpread = 1,
      northSpread = 1;

    if (this.windSpeed >= 3) {
      if (this.windDirection.x >= 0.8) westSpread = 0;
      else if (this.windDirection.x <= -0.8) eastSpread = 0;
      else if (this.windDirection.y >= 0.8) northSpread = 0;
      else if (this.windDirection.y <= -0.8) southSpread = 0;
    }

    if (this.windSpeed >= 7) {
      [westSpread, eastSpread] =
        this.windDirection.x >= 0.5
          ? [Math.max(westSpread - 1, 0), eastSpread + 1]
          : [westSpread, eastSpread];
      [westSpread, eastSpread] =
        this.windDirection.x >= -0.5
          ? [westSpread + 1, Math.max(eastSpread - 1)]
          : [westSpread, eastSpread];
      [northSpread, southSpread] =
        this.windDirection.y >= 0.5
          ? [Math.max(northSpread - 1, 0), southSpread + 1]
          : [northSpread, southSpread];
      [northSpread, southSpread] =
        this.windDirection.y >= -0.5
          ? [northSpread + 1, Math.max(southSpread - 1, 0)]
          : [northSpread, southSpread];
    }

    return [eastSpread, westSpread, southSpread, northSpread];
  }

  private emitSmoke(tile: FireLayerTile) {
    if (tile.properties.smoke === undefined) {
      tile.properties.smoke = this.scene.add.particles(
        tile.pixelX,
        tile.pixelY,
        "smoke",
        {
          x: { random: [0, tile.width] },
          y: { random: [0, tile.height] },
          quantity: 1,
          angle: () =>
            PMath.RND.between(this.windAngle - 15, this.windAngle + 15),
          speed: () => 4 + this.windSpeed,
          frequency: 80,
          lifespan: 2000,
        }
      );
    } else {
      tile.properties.smoke.start();
    }
  }

  private stopSmoke(tile: FireLayerTile) {
    tile.properties.smoke?.stop();
  }
}
