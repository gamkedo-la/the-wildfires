import { Math as PMath } from "phaser";
import { GameScene } from "../../scenes/game-scene";

export abstract class Vehicle {
  scene: GameScene;
  image: Phaser.GameObjects.Image;

  position: PMath.Vector2;
  direction: PMath.Vector2;
  velocity: PMath.Vector2;
  acceleration: PMath.Vector2;

  maxSpeed: number;
  accelerationRate: number;
  turnRate: number;
  tankCapacity: number;
  tankLevel: number;
  tankConsumptionRate: number;
  tankRefillRate: number;

  started: boolean;

  turningState: number;
  turningBias: number;
  straightBias: number;

  constructor(
    scene: GameScene,
    x: number,
    y: number,
    texture: string,
    imageScale: number = 0.25
  ) {
    this.scene = scene;
    this.position = new PMath.Vector2(x, y);
    this.direction = PMath.Vector2.DOWN.clone();
    this.velocity = new PMath.Vector2(0, 0);
    this.acceleration = new PMath.Vector2(0, 0);
    this.image = scene.add.image(x, y, texture, 2).setScale(imageScale);
    this.started = false;
  }

  abstract useTank(): void;

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
      this.direction.rotate(-this.turnRate);
      this.velocity.rotate(-this.turnRate);
    } else if (this.turningState > 50) {
      this.direction.rotate(this.turnRate);
      this.velocity.rotate(this.turnRate);
    }

    if (this.scene.key_w.isDown || this.scene.key_up.isDown) {
      this.started = true;
    }

    if (this.started) {
      this.acceleration = this.direction.clone().scale(this.accelerationRate);
    } else {
      this.acceleration = new PMath.Vector2(0, 0);
    }

    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);

    const rads = PMath.Angle.Between(0, 0, this.direction.x, this.direction.y);

    this.image.rotation = rads - PMath.TAU;
  }

  destroy(): void {
    this.image.destroy();
  }
}
