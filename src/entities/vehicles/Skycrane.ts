import { Math as PMath } from "phaser";

import { MapScene } from "../../scenes/game/map-scene";
import { Vehicle } from "./Vehicle";
import { signal } from "@game/state/lib/signals";
import { RESOURCES } from "@game/assets";

export class Skycrane extends Vehicle {
  static model = "Sikorsky S-64 Skycrane";
  static description =
    "Heavy-lift helicopter. Fitted with a 10,000L tank that can be filled in 45 seconds.";

  bodyDirection: PMath.Vector2;
  bodyVelocity: PMath.Vector2;
  bodyTurnRate: number;
  dragRate: number;

  constructor(scene: MapScene, x: number, y: number) {
    super(
      scene,
      x,
      y,
      "skycrane-spritesheet",
      "skycrane-outline",
      0.5,
      "SKYCRANE"
    );

    this.sprite.setOrigin(0.5, 0.3);
    this.outline.setOrigin(0.5, 0.3);

    // Movement
    this.maxSpeed = 80;
    this.accelerationRate = 3;
    this.dragRate = 1;
    this.turnRate = 20;

    this.bodyDirection = this.direction.get().clone();
    this.bodyVelocity = this.velocity.get().clone();
    this.bodyTurnRate = Math.PI;

    this.turningState.set(50);
    this.turningBias = 200;
    this.straightBias = 200;

    // Water tank
    this.waterTankCapacity = 230;
    this.waterTankConsumptionRate = 130;
    this.waterTankRefillRate = 110;

    this.waterTankLevel = signal(0);
    this.retardantTankLevel = signal(0);

    // Hack to avoid the effect that works well for airplanes
    this.waterCollection.setQuantity(2);
  }

  update(_time: number, delta: number): void {
    const deltaSeconds = delta * 0.001;

    this.updateScale(deltaSeconds);

    if (this.scene.key_one.isDown) {
      this.selectedTank.set("water");
    } else if (this.scene.key_two.isDown) {
      this.selectedTank.set("retardant");
    }

    if (this.scene.key_a.isDown || this.scene.key_left.isDown) {
      this.bodyDirection.rotate(-this.bodyTurnRate * deltaSeconds);
      this.turningState.update((value) =>
        Math.max(value - this.turningBias * deltaSeconds, 0)
      );
    } else if (this.scene.key_d.isDown || this.scene.key_right.isDown) {
      this.bodyDirection.rotate(this.bodyTurnRate * deltaSeconds);

      this.turningState.update((value) =>
        Math.min(value + this.turningBias * deltaSeconds, 100)
      );
    } else {
      // Gradually return to center (50)
      if (this.turningState.get() < 50) {
        this.turningState.update((value) =>
          Math.min(value + this.straightBias * deltaSeconds, 50)
        );
      } else if (this.turningState.get() > 50) {
        this.turningState.update((value) =>
          Math.max(value - this.straightBias * deltaSeconds, 50)
        );
      }
    }

    if (this.scene.key_w.isDown || this.scene.key_up.isDown) {
      this.bodyVelocity.add(
        this.bodyDirection.clone().scale(this.accelerationRate)
      );
      this.bodyVelocity.limit(this.maxSpeed);
    } else {
      this.bodyVelocity.lerp(PMath.Vector2.ZERO, this.dragRate * deltaSeconds);
    }

    this.velocity.mutate((velocity) => {
      velocity.lerp(this.bodyVelocity.clone(), this.turnRate * deltaSeconds);

      return true;
    });

    const rads = PMath.Angle.Between(
      0,
      0,
      this.bodyDirection.x,
      this.bodyDirection.y
    );

    this.position.mutate((position) => {
      position.add(this.velocity.get().clone().scale(deltaSeconds));
      return true;
    });

    this.direction.mutate((direction) => {
      direction.setAngle(rads - PMath.PI2);
      return true;
    });

    this.windRiding.update((wasDiving) => {
      const angleDiff =
        this.direction.get().angle() -
        this.scene.windSystem.windVector.get().angle();
      const isRiding =
        angleDiff < 0.25 &&
        angleDiff > -0.25 &&
        (this.scene.key_w.isDown || this.scene.key_up.isDown);

      if (isRiding) {
        this.windRidingLength += deltaSeconds;
        if (this.windRidingLength > 1) {
          this.retardantChargeFx.explode(
            3,
            this.position.get().x,
            this.position.get().y
          );
          this.scene.sound.play(RESOURCES["wind-bonus"]);
          this.remainingCharges++;
          this.windRidingLength = 0;
        }
      } else {
        this.windRidingLength = 0;
      }

      return isRiding;
    });

    // Hack to avoid the auto scaling from the other two aircraft
    this.shadow.setY(this.sprite.y + this.maxSpeed / 2);
  }
}
