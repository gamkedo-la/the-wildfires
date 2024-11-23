import { Math as PMath, Tilemaps } from "phaser";
import { System } from "..";
import { EVENT_DROP_WATER, EVENT_FIRE_EXTINGUISHED } from "../../consts";
import {
  FireLayerTile,
  MapLayerTile,
  StructuresLayerTile,
} from "../../entities/maps";
import { GameMap } from "../../entities/maps/GameMap";
import { MapScene } from "../../scenes/game/map-scene";

export class FireMapSystem implements System {
  scene: MapScene;
  fireInterval: number;
  burnInterval: number;
  windAngle: number;
  windSpeed: number;
  windDirection: PMath.Vector2;

  fireStarted: boolean;

  map: GameMap;

  constructor(scene: MapScene, fireInterval: number, burnInterval: number) {
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
    this.dryTiles(delta);
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

    this.scene.time.delayedCall(this.fireInterval * 2, () => {
      this.fireStarted = true;
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
        this.dropCrossWater(x, y, range);
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

    if (
      !mapTile ||
      mapTile.properties.isWatered ||
      tileX < 2 ||
      tileY < 2 ||
      tileX >= this.map.mapLayer.width ||
      tileY >= this.map.mapLayer.height
    )
      return;

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
      mapTile.properties.fuel =
        mapTile.properties.fuel || mapTile.properties.maxFuel || 50;
      mapTile.properties.burnTimer = 0;

      let tile = this.map.putFire(tileX, tileY);
      this.emitSmoke(tile);
    }

    if (!mapTile?.properties.wasBurning) {
      mapTile.properties.wasBurning = true;

      if (structuresTile?.properties.isRoad) {
        mapTile.properties.fuel += 20;
      }
      if (structuresTile?.properties.isBuilding) {
        console.log("burning building");
        mapTile.properties.fuel += 100;
      }
    }
  }

  private dropWater(tileX: number, tileY: number) {
    let mapTile = this.map.mapLayer.getTileAt(tileX, tileY) as MapLayerTile;

    if (!mapTile || mapTile.properties.isWater) return;

    mapTile.properties.waterTimer = 10000;

    if (mapTile?.properties.isWatered) {
      return;
    }

    mapTile.properties.isWatered = true;
    mapTile.tint = 0xaaaaff;

    mapTile.properties.fuel += 10;

    if (mapTile?.properties.isBurning) {
      mapTile.properties.isBurning = false;
      let tile = this.map.removeFire(tileX, tileY);
      this.stopSmoke(tile);
    }
  }
  // Extinguish in a '+' shape pattern
  private dropCrossWater(worldX: number, worldY: number, range: number) {
    try {
      // this.map is dangerous to keep as a reference, the scene can be destroyed amid the event
      const { x: tileX, y: tileY } = this.map.mapLayer.worldToTileXY(
        worldX,
        worldY,
        true
      );

      for (let x = tileX - range; x <= tileX + range; x++) {
        this.dropWater(x, tileY);
      }
      for (let y = tileY - range; y <= tileY + range; y++) {
        if (y !== tileY) {
          // Avoid double-extinguishing the center tile
          this.dropWater(tileX, y);
        }
      }
    } catch (e) {
      // TODO: Something is off with this function and I couldn't fix on a first check with the debugger. The try catch is a workaround
      console.error(e);
    }
  }

  private dryTiles(delta: number) {
    this.map.mapLayer
      .filterTiles((t: MapLayerTile) => t.properties.isWatered)
      .forEach((t: MapLayerTile) => {
        t.properties.waterTimer -= delta;

        if (t.properties.waterTimer <= 0) {
          t.properties.isWatered = false;
          t.properties.waterTimer = 0;
          t.tint = 0xffffff;
        }
      });
  }

  private burnTiles(delta: number) {
    let burningTiles = this.map.mapLayer.filterTiles(
      (t: MapLayerTile) => t.properties.isBurning
    );

    if (burningTiles.length === 0 && this.fireStarted) {
      this.scene.events.emit(EVENT_FIRE_EXTINGUISHED);
    }

    burningTiles.forEach((t: MapLayerTile) => {
      t.properties.burnTimer += delta;

      if (t.properties.burnTimer >= this.burnInterval / t.properties.burnRate) {
        t.properties.burnTimer = 0;
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
          t.index = t.properties.burnedTileId;
          t.properties.burnRate = 0;
          this.burnDown(t.x, t.y);
        }
      }
    });
  }

  private burnDown(tileX: number, tileY: number) {
    let mapTile = this.map.mapLayer.getTileAt(tileX, tileY) as MapLayerTile;

    if (mapTile?.properties.isBurning) {
      mapTile.properties.isBurning = false;
      let tile = this.map.removeFire(tileX, tileY);
      this.stopSmoke(tile);
    }

    const poi = this.map.pointsOfInterestLayer.getTileAt(tileX, tileY)?.index;
    if (poi) {
      this.map.scene.gameState.causePointOfInterestDamage(
        poi - this.map.pointsOfInterestLayer.startingIndex
      );
    }
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
    if (Phaser.Math.Between(0, 100) < 50) return;

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

  destroy(): void {
    console.log("FireMapSystem destroy");
  }
}
