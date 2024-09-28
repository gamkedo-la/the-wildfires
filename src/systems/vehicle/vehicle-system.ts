import { System } from "..";
import { GameScene } from "../../scenes/game-scene";

import { Math, Tilemaps } from "phaser";

interface VehicleEntry {
  sprite: string;
  scale: number;
}

const VEHICLES: Record<string, VehicleEntry> = {
  "martin": {
    sprite: "martin",
    scale: 0.25
  },
  "canadair": {
    sprite: "canadair",
    scale: 0.4
  },
  "skycrane": {
    sprite: "skycrane",
    scale: 0.4
  }
};

export class VehicleSystem implements System {
  scene: GameScene;

  constructor(scene: GameScene) {
    this.scene = scene;
  }

  vehicle: Phaser.GameObjects.Image;

  vehicleDirection = Math.Vector2.DOWN.clone();
  vehiclePosition = new Math.Vector2(382, 235);
  vehicleVelocity = new Math.Vector2(0, 0);
  vehicleAcceleration = new Math.Vector2(0, 0);

  create(): this {
    this.vehicle = this.scene.add
      .image(
        this.vehiclePosition.x,
        this.vehiclePosition.y,
        "martin-spritesheet",
        2
      )
      .setScale(0.25);

    return this;
  }

  getVehicles(): Array<string> {
    return Object.keys(VEHICLES);
  }

  setVehicle(name: string): void {
    let vehicle = VEHICLES[name];
    this.vehicle.setTexture(`${vehicle.sprite}-spritesheet`);
    this.vehicle.setScale(vehicle.scale);
  }

  update(time: number, delta: number): void {
    this.updateVehicle();
    this.useTank();
  }

  updateVehicle(): void {
    this.vehiclePosition.add(this.vehicleVelocity);

    this.vehicle.x = this.vehiclePosition.x;
    this.vehicle.y = this.vehiclePosition.y;

    if (this.scene.key_a.isDown || this.scene.key_left.isDown) {
      this.vehicleDirection.rotate(-1 / 50);
      this.vehicleVelocity.rotate(-1 / 50);
      this.vehicle.setFrame(1);
    } else if (this.scene.key_d.isDown || this.scene.key_right.isDown) {
      this.vehicleDirection.rotate(1 / 50);
      this.vehicleVelocity.rotate(1 / 50);
      this.vehicle.setFrame(3);
    } else {
      this.vehicle.setFrame(2);
    }

    if (this.scene.key_w.isDown || this.scene.key_up.isDown) {
      this.vehicleAcceleration = this.vehicleDirection.clone().scale(0.1);
    } else {
      this.vehicleAcceleration = new Math.Vector2(0, 0);
    }

    this.vehicleVelocity.add(this.vehicleAcceleration);
    this.vehicleVelocity.limit(1.5);

    const rads = Phaser.Math.Angle.Between(
      0,
      0,
      this.vehicleDirection.x,
      this.vehicleDirection.y
    );

    this.vehicle.rotation = rads - Math.TAU;
  }

  useTank(): void {
    if (!this.scene.space_key.isDown) return;

    if (
      this.scene.waterLevel > 5 &&
      this.scene.tileLayer.getTileAtWorldXY(
        this.vehiclePosition.x,
        this.vehiclePosition.y,
        true,
        this.scene.camera
      )?.index !== 3
    ) {
      this.scene.waterLevel -= 3;
      this.scene.waterLevel = Math.Clamp(
        this.scene.waterLevel,
        1,
        this.scene.maxWaterLevel
      );
      this.scene.bus.emit("water_level_changed", this.scene.waterLevel);

      this.scene.tileLayer
        .getTilesWithinWorldXY(
          this.vehiclePosition.x,
          this.vehiclePosition.y,
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
        this.vehiclePosition.x,
        this.vehiclePosition.y,
        true,
        this.scene.camera
      )?.index === 3
    ) {
      this.scene.waterLevel += 5;
      this.scene.waterLevel = Math.Clamp(
        this.scene.waterLevel,
        1,
        this.scene.maxWaterLevel
      );
      this.scene.bus.emit("water_level_changed", this.scene.waterLevel);
    }
  }

  getVehiclePosition(): Math.Vector2 {
    return this.vehiclePosition;
  }
}
