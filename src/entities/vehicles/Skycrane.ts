import { Math as PMath } from "phaser";

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
    this.maxSpeed = 100;
    this.accelerationRate = 100;
    this.dragRate = 2;
    this.turnRate = 10;

    this.bodyDirection = this.direction.clone();
    this.bodyVelocity = this.velocity.clone();
    this.bodyTurnRate = Math.PI * 0.75;

    this.turningState = 50;
    this.turningBias = 120;
    this.straightBias = 280;

    // Water tank
    this.tankCapacity = 100;
    this.tankLevel = 0;
    this.tankConsumptionRate = 130;
    this.tankRefillRate = 150;
  }

  update(_time: number, delta: number): void {
    const deltaSeconds = delta * 0.001;

    this.position.add(this.velocity);

    this.image.x = this.position.x;
    this.image.y = this.position.y;

    if (this.scene.key_a.isDown || this.scene.key_left.isDown) {
      this.turningState = Math.max(this.turningState - this.turningBias * deltaSeconds, 0);
    } else if (this.scene.key_d.isDown || this.scene.key_right.isDown) {
      this.turningState = Math.min(this.turningState + this.turningBias * deltaSeconds, 100);
    } else {
      // Gradually return to center (50)
      if (this.turningState < 50) {
        this.turningState += this.straightBias * deltaSeconds;
      } else if (this.turningState > 50) {
        this.turningState -= this.straightBias * deltaSeconds;
      }
    }

    // Update frame based on turning state
    let currentFrame = Math.floor(this.turningState / 20);
    currentFrame = Math.max(0, Math.min(4, currentFrame)); // Ensure frame is within 0-4 range
    this.image.setFrame(currentFrame);

    // Apply turning based on turning state
    if (this.turningState < 50) {
      this.bodyDirection.rotate(-this.bodyTurnRate * deltaSeconds);
      this.bodyVelocity.rotate(-this.bodyTurnRate * deltaSeconds);
    } else if (this.turningState > 50) {
      this.bodyDirection.rotate(this.bodyTurnRate * deltaSeconds);
      this.bodyVelocity.rotate(this.bodyTurnRate * deltaSeconds);
    }

    if (this.scene.key_w.isDown || this.scene.key_up.isDown) {
      this.started = true;
      this.bodyVelocity.add(this.bodyDirection.clone().scale(this.accelerationRate));
      this.bodyVelocity.limit(this.maxSpeed);
    } else {
      this.bodyVelocity.lerp(PMath.Vector2.ZERO, this.dragRate * deltaSeconds);
    }

    this.velocity = this.velocity.lerp(
      this.bodyVelocity.clone().scale(deltaSeconds),
      this.turnRate * deltaSeconds
    );

    const rads = PMath.Angle.Between(0, 0, this.bodyDirection.x, this.bodyDirection.y);

    this.image.rotation = rads - PMath.TAU;
  }
}
