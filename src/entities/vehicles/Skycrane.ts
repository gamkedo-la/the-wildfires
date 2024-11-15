import { Math as PMath } from "phaser";

import { GameScene } from "../../scenes/game-scene";
import { Vehicle } from "./Vehicle";

export class Skycrane extends Vehicle {
  bodyDirection: PMath.Vector2;
  bodyVelocity: PMath.Vector2;
  bodyTurnRate: number;
  dragRate: number;

  constructor(scene: GameScene, x: number, y: number) {
    super(scene, x, y, "skycrane-spritesheet", 0.5);

    this.sprite.setOrigin(0.5, 0.3);
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
    this.tankCapacity = 100;
    this.tankLevel = 0;
    this.tankConsumptionRate = 130;
    this.tankRefillRate = 150;
  }

  update(_time: number, delta: number): void {
    const deltaSeconds = delta * 0.001;

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

    this.sprite.setRotation(rads - PMath.TAU);

    this.position.mutate((position) => {
      position.add(this.velocity.get().clone().scale(deltaSeconds));
      return true;
    });
  }
}
