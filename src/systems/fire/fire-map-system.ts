import { END_REASONS } from "@game/state/game-state";
import { Math as PMath, Tilemaps } from "phaser";
import { System } from "..";
import { EVENT_DROP_RETARDANT, EVENT_DROP_WATER } from "../../consts";
import {
  FireLayerTile,
  MapLayerTile,
  StructuresLayerTile,
} from "../../entities/maps";
import { GameMap } from "../../entities/maps/GameMap";
import { MapScene } from "../../scenes/game/map-scene";
import { RESOURCES } from "@game/assets";

const burnedTilesIds = [41, 42, 43, 44, 166, 167, 168, 169, 231, 232, 233, 234];
const doNotChangeBurnedTiles = [45, 46, 47];

export class FireMapSystem implements System {
  scene: MapScene;
  burnTickInterval: number;
  burnRatio: number;
  windAngle: number;
  windSpeed: number;
  windDirection: PMath.Vector2;

  fireStarted: boolean;

  retardantChargeFx: Phaser.GameObjects.Particles.ParticleEmitter;

  map: GameMap;

  constructor(scene: MapScene) {
    this.scene = scene;
    this.map = scene.currentMap;
    this.burnTickInterval = this.map.fireTick;
    this.burnRatio = this.map.fireRatio;

    this.windAngle = PMath.RadToDeg(PMath.Vector2.UP.angle());
    this.windSpeed = 2;

    this.retardantChargeFx = scene.add
      .particles(0, 0, RESOURCES["retardant-particle"], {
        x: {
          onUpdate: (_particle, _key, t, value) => {
            return value + Math.sin(5 * t * Math.PI) + (Math.random() - 0.5);
          },
        },
        quantity: 10,
        speedY: { min: -25, max: -5 },
        frequency: 25,
        lifespan: { min: 1000, max: 2000 },
        emitting: false,
      })
      .setDepth(1);
  }

  create(): this {
    this.initializeFireTiles();
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
      .flatMap((tile) => {
        this.ignite(tile.x, tile.y);
      });

    this.fireStarted = true;
  }

  private setupWaterDropEvent() {
    this.scene.events.on(
      EVENT_DROP_WATER,
      ({ x, y, range }: { x: number; y: number; range: number }) => {
        this.dropCrossWater(x, y, range);
      }
    );

    this.scene.events.on(
      EVENT_DROP_RETARDANT,
      ({ x, y, range }: { x: number; y: number; range: number }) => {
        this.dropCrossRetardant(x, y, range);
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

  private dropWater(tileX: number, tileY: number) {
    let mapTile = this.map.mapLayer.getTileAt(tileX, tileY) as MapLayerTile;

    if (!mapTile || mapTile.properties.isWater) return;

    if (mapTile?.properties.isWatered && !mapTile.properties.isBurning) {
      return;
    }

    mapTile.properties.waterTimer = 10000;
    mapTile.properties.isWatered = true;

    mapTile.tint = 0xaaaaff;

    if (mapTile?.properties.isBurning) {
      mapTile.properties.isBurning = false;
      let tile = this.map.removeFire(tileX, tileY);
      this.stopSmoke(tile);
      this.retardantChargeFx.explode(2, mapTile.pixelX, mapTile.pixelY);
      this.scene.vehiclesSystem.vehicle.remainingCharges++;
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

  private dropRetardant(tileX: number, tileY: number) {
    let mapTile = this.map.mapLayer.getTileAt(tileX, tileY) as MapLayerTile;

    if (!mapTile || mapTile.properties.isWater) return;

    mapTile.properties.waterTimer = 40000;

    if (mapTile?.properties.isWatered) {
      return;
    }

    mapTile.properties.isWatered = true;
    mapTile.tint = 0xff6b6b;

    if (mapTile?.properties.isBurning) {
      let tile = this.map.fireLayer.getTileAt(tileX, tileY);
      this.stopSmoke(tile);
    }
  }

  private dropCrossRetardant(worldX: number, worldY: number, range: number) {
    try {
      // this.map is dangerous to keep as a reference, the scene can be destroyed amid the event
      const { x: tileX, y: tileY } = this.map.mapLayer.worldToTileXY(
        worldX,
        worldY,
        true
      );

      for (let x = tileX - range; x <= tileX + range; x++) {
        this.dropRetardant(x, tileY);
      }
      for (let y = tileY - range; y <= tileY + range; y++) {
        if (y !== tileY) {
          this.dropRetardant(tileX, y);
        }
      }
    } catch (e) {
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

  private burnDown(tileX: number, tileY: number) {
    let mapTile = this.map.mapLayer.getTileAt(tileX, tileY) as MapLayerTile;

    if (mapTile?.properties.isBurning) {
      mapTile.properties.isBurning = false;
      let tile = this.map.removeFire(tileX, tileY);
      this.stopSmoke(tile);
    }

    let structuresTile = this.map.structuresLayer.getTileAt(
      tileX,
      tileY
    ) as StructuresLayerTile;

    if (
      structuresTile?.properties.isBuilding ||
      structuresTile?.properties.isVegetation
    ) {
      structuresTile.index = structuresTile.properties.burnedTileId;
    }

    const poi = this.map.pointsOfInterestLayer.getTileAt(tileX, tileY)?.index;
    if (poi) {
      this.map.scene.gameState.causePointOfInterestDamage(
        poi - this.map.pointsOfInterestLayer.startingIndex
      );
    }
  }

  private ignite(tileX: number, tileY: number) {
    let mapTile = this.map.mapLayer.getTileAt(tileX, tileY) as MapLayerTile;

    // Corners
    if (
      !mapTile ||
      mapTile.properties.isWatered ||
      tileX < 2 ||
      tileY < 2 ||
      tileX >= 68 ||
      tileY >= 67
    )
      return;

    let structuresTile = this.map.structuresLayer.getTileAt(
      tileX,
      tileY
    ) as StructuresLayerTile;

    if (
      structuresTile?.properties.isRiver ||
      (structuresTile?.properties.isRoad && Phaser.Math.Between(0, 100) < 90)
    ) {
      // TODO: magic number
      // 10% chance to ignite road
      return;
    }

    if (mapTile?.properties.burnRate > 0 && !mapTile?.properties.isBurning) {
      const burnRate = structuresTile?.properties.burnRate
        ? Math.min(
            structuresTile.properties.burnRate,
            mapTile.properties.burnRate
          )
        : mapTile.properties.burnRate;

      mapTile.properties.isBurning = true;
      mapTile.properties.fuel = (5 - burnRate) * this.burnRatio;
      mapTile.properties.burnTimer = 0;

      let tile = this.map.putFire(tileX, tileY);
      this.emitSmoke(tile);
    }
  }

  tim: number = 0;
  fireDirectionStep: number = 0;
  directions = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];

  private getSomeFireDirection(biasX: number, biasY: number) {
    this.fireDirectionStep = (this.fireDirectionStep + 1) % 4;

    const direction = this.directions[this.fireDirectionStep];

    return {
      x: direction.x + biasX,
      y: direction.y + biasY,
    };
  }

  private burnTiles(delta: number) {
    let burningTiles = this.map.mapLayer.filterTiles(
      (t: MapLayerTile) => t.properties.isBurning
    );

    if (burningTiles.length === 0 && this.fireStarted) {
      this.scene.endGame(END_REASONS.FIRE_EXTINGUISHED);
    }

    this.tim += delta;
    if (this.tim > this.burnTickInterval) {
      this.tim = 0;
      this.spreadFire(burningTiles.length);
    }

    burningTiles.forEach((t: MapLayerTile) => {
      t.properties.burnTimer += delta;

      if (t.properties.burnTimer >= this.burnTickInterval) {
        t.properties.burnTimer = 0;
        t.properties.fuel -= 1;

        if (t.properties.fuel == 1) {
          this.ignite(
            t.x + Math.floor(Math.random() * 3) - 1,
            t.y + Math.floor(Math.random() * 3) - 1
          );
        }
        //}

        if (t.properties.fuel <= 0) {
          // TODO: Absolute hack, not sure it's worth the visual "improvement"
          if (doNotChangeBurnedTiles.includes(t.properties.burnedTileId)) {
            t.index = t.properties.burnedTileId;
          } else {
            t.index =
              burnedTilesIds[Phaser.Math.Between(0, burnedTilesIds.length - 1)];
          }
          t.properties.burnRate = 0;
          this.burnDown(t.x, t.y);
        }
      }
    });
  }

  private spreadFire(burningTilesCount: number) {
    let [eastSpread, westSpread, southSpread, northSpread] =
      this.calculateSpread();

    const chance = Math.max(0, 1 - (250 - burningTilesCount) / 200);
    const ignitionPoints = this.map.fireLayer
      .filterTiles((t: Tilemaps.Tile) => t.index === this.map.fireTileId)
      .flatMap((tile) => [
        this.getSomeFireDirection(tile.x - westSpread, tile.y),
        this.getSomeFireDirection(tile.x + eastSpread, tile.y),
        this.getSomeFireDirection(tile.x, tile.y - northSpread),
        this.getSomeFireDirection(tile.x, tile.y + southSpread),
      ]);

    [...new Set(ignitionPoints)].forEach((p) => {
      if (Math.random() < chance) {
        return;
      }

      this.ignite(p.x, p.y);
    });
  }

  private calculateSpread() {
    const normalizedSpeed = Math.min(this.windSpeed / 10, 1);
    const threshold = Math.random();
    const windInfluence = threshold < normalizedSpeed ? 1.5 : 0;
    return [
      Math.floor(windInfluence * Math.max(0, this.windDirection.x)),
      Math.floor(windInfluence * Math.max(0, -this.windDirection.x)),
      Math.floor(windInfluence * Math.max(0, this.windDirection.y)),
      Math.floor(windInfluence * Math.max(0, -this.windDirection.y)),
    ];
  }

  private emitSmoke(tile: FireLayerTile) {
    if (Phaser.Math.Between(0, 100) < 60) return;

    const tint = [
      [0x664433, 0x927e6a, 0xefd8a1, 0x927e6a],
      [0x434033, 0xefd8a1, 0x927e6a],
      [0x3f4033, 0x927e6a, 0xefd8a1],
      [0x504033, 0xefd8a1],
    ];

    if (tile.properties.smoke === undefined) {
      tile.properties.smoke = this.scene.add.particles(
        tile.pixelX,
        tile.pixelY,
        "smoke-spritesheet",
        {
          x: { random: [-tile.width / 3, tile.width / 3] },
          y: { random: [-tile.height / 3, tile.height / 3] },
          color: PMath.RND.pick(tint),
          quantity: 1,
          frame: [0, 1, 2, 3],
          angle: () =>
            PMath.RND.between(this.windAngle - 15, this.windAngle + 15),
          speed: {
            onEmit: () => 10 + this.windSpeed * 4,
          },
          frequency: PMath.RND.between(20, 50),
          lifespan: {
            onEmit: () =>
              Math.min(5000, PMath.RND.between(2500, 25000) / this.windSpeed),
          },
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
