import { Math as PhaserMath, Tilemaps } from "phaser";

import { GameScene } from "../../scenes/game-scene";
import { Vehicle } from "./Vehicle";

export class Canadair extends Vehicle {
  constructor(scene: GameScene, x: number, y: number) {
    super(scene, x, y, "canadair-spritesheet", 0.4);

    this.maxSpeed = 1.3;
    this.accelerationRate = 0.1;
    this.turnRate = 1 / 33;

    this.tankCapacity = 100;
    this.tankLevel = 0;
    this.tankConsumptionRate = 3;
    this.tankRefillRate = 5;

    this.turningState = 50;
    this.turningBias = 3;
    this.straightBias = 7;
  }

  useTank(): void {
    if (
      this.tankLevel > 5 &&
      this.scene.tileLayer.getTileAtWorldXY(
        this.position.x,
        this.position.y,
        true,
        this.scene.camera
      )?.index !== 3
    ) {
      this.tankLevel -= this.tankConsumptionRate;
      this.tankLevel = PhaserMath.Clamp(this.tankLevel, 1, this.tankCapacity);
      this.scene.bus.emit("water_level_changed", this.tankLevel);

      this.scene.tileLayer
        .getTilesWithinWorldXY(
          this.position.x,
          this.position.y,
          24,
          24,
          {},
          this.scene.camera
        )
        .filter((t: Tilemaps.Tile) => t.index === 2)
        .forEach((t: Tilemaps.Tile) => {
          this.scene.tileLayer.putTileAt(1, t.x, t.y);
          this.scene.stopSmoke(t);
        });
    }

    if (
      this.scene.tileLayer.getTileAtWorldXY(
        this.position.x,
        this.position.y,
        true,
        this.scene.camera
      )?.index === 3
    ) {
      this.tankLevel += this.tankRefillRate;
      this.tankLevel = PhaserMath.Clamp(this.tankLevel, 1, this.tankCapacity);
      this.scene.bus.emit("water_level_changed", this.tankLevel);
    }
  }
}
