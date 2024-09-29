import { Math as PMath, Tilemaps } from "phaser";

import { GameScene } from "../../scenes/game-scene";
import { Vehicle } from "./Vehicle";

export class Skycrane extends Vehicle {
  bodyDirection: PMath.Vector2;
  bodyVelocity: PMath.Vector2;
  bodyTurnRate: number;
  dragRate: number;

  constructor(scene: GameScene, x: number, y: number) {
    super(scene, x, y, "skycrane-spritesheet", 0.4);

    // Movement
    this.maxSpeed = 1.3;
    this.accelerationRate = 0.05;
    this.dragRate = 0.05;
    this.turnRate = 0.01;

    this.bodyDirection = this.direction.clone();
    this.bodyVelocity = this.velocity.clone();
    this.bodyTurnRate = 1 / 33;

    this.turningState = 50;
    this.turningBias = 3;
    this.straightBias = 7;

    // Water tank
    this.tankCapacity = 100;
    this.tankLevel = 0;
    this.tankConsumptionRate = 3;
    this.tankRefillRate = 5;
  }

  // TODO: Adapt the parameters to a helicopter handling (might need a different update method)
  // TODO: Implement tank usage
  update(time: number, delta: number): void {
    this.position.add(this.velocity);

    this.image.x = this.position.x;
    this.image.y = this.position.y;

    if (this.scene.key_a.isDown || this.scene.key_left.isDown) {
      this.turningState = Math.max(this.turningState - this.turningBias, 0);
    } else if (this.scene.key_d.isDown || this.scene.key_right.isDown) {
      this.turningState = Math.min(this.turningState + this.turningBias, 100);
    } else {
      // Gradually return to center (50)
      if (this.turningState < 50) {
        this.turningState += this.straightBias;
      } else if (this.turningState > 50) {
        this.turningState -= this.straightBias;
      }
    }

    // Update frame based on turning state
    let currentFrame = Math.floor(this.turningState / 20);
    currentFrame = Math.max(0, Math.min(4, currentFrame)); // Ensure frame is within 0-4 range
    this.image.setFrame(currentFrame);

    // Apply turning based on turning state
    if (this.turningState < 50) {
      this.bodyDirection.rotate(-this.bodyTurnRate);
      this.bodyVelocity.rotate(-this.bodyTurnRate);
    } else if (this.turningState > 50) {
      this.bodyDirection.rotate(this.bodyTurnRate);
      this.bodyVelocity.rotate(this.bodyTurnRate);
    }

    if (this.scene.key_w.isDown || this.scene.key_up.isDown) {
      this.started = true;
      this.bodyVelocity.add(this.bodyDirection.clone().scale(this.accelerationRate));
      this.bodyVelocity.limit(this.maxSpeed);
    } else {
      this.bodyVelocity.lerp(PMath.Vector2.ZERO, this.dragRate);
    }

    this.velocity = this.velocity.lerp(this.bodyVelocity, this.turnRate);

    const rads = PMath.Angle.Between(0, 0, this.bodyDirection.x, this.bodyDirection.y);

    this.image.rotation = rads - PMath.TAU;
  }
}
