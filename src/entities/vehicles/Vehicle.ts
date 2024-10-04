import { Math as PMath } from "phaser";
import { GameScene } from "../../scenes/game-scene";
import { MapTileType } from "../../systems/map/map-system";

export abstract class Vehicle {
  scene: GameScene;
  image: Phaser.GameObjects.Image;
  engineSound: Phaser.Sound.BaseSound;
  waterSound: Phaser.Sound.HTML5AudioSound |
    Phaser.Sound.WebAudioSound |
    Phaser.Sound.NoAudioSound;
  splashSound: Phaser.Sound.HTML5AudioSound |
    Phaser.Sound.WebAudioSound |
    Phaser.Sound.NoAudioSound;

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

    // a looped audio file we can pitch-shift and fade in
    this.engineSound = scene.sound.add("airplane-propeller-loop", { loop: true, volume: 0.25 });
    this.engineSound.play();

    this.waterSound = scene.sound.add("water-loop", { loop: true, volume: 0 });
    this.waterSound.play();

    this.splashSound = scene.sound.add("fire-extinguished", { loop: false, volume: 0.5 });

    this.started = false;
  }

  update(_time: number, delta: number): void {

    this.waterSound.setVolume(0); // silent unless useTank is active

    const deltaSeconds = delta * 0.001;

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
      this.direction.rotate(-this.turnRate * deltaSeconds);
      this.velocity.rotate(-this.turnRate * deltaSeconds);
    } else if (this.turningState > 50) {
      this.direction.rotate(this.turnRate * deltaSeconds);
      this.velocity.rotate(this.turnRate * deltaSeconds);
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

    this.position.add(this.velocity.clone().scale(deltaSeconds));

    const rads = PMath.Angle.Between(0, 0, this.direction.x, this.direction.y);

    this.image.rotation = rads - PMath.TAU;
  }

  useTank(_time: number, delta: number): void {
    const deltaSeconds = delta * 0.001;

    if (
      this.tankLevel > 5 &&
      this.scene.mapSystem.typeAtWorldXY(
        this.position.x,
        this.position.y,
      ) !== MapTileType.Water
    ) {

      this.tankLevel -= this.tankConsumptionRate * deltaSeconds;
      this.tankLevel = PMath.Clamp(this.tankLevel, 1, this.tankCapacity);
      this.scene.bus.emit("water_level_changed", this.tankLevel);

      this.scene.events.emit("drop-water", {
        x: this.position.x,
        y: this.position.y,
        range: 24
      });

      // fixme: only play one sound when multiple tiles are being extinguished
      this.splashSound.play(); // sound effect
    }

    if (this.scene.mapSystem.typeAtWorldXY(
      this.position.x,
      this.position.y,
    ) === MapTileType.Water) {
      this.tankLevel += this.tankRefillRate * deltaSeconds;
      this.tankLevel = PMath.Clamp(this.tankLevel, 1, this.tankCapacity);
      this.scene.bus.emit("water_level_changed", this.tankLevel);

      this.waterSound.setVolume(0.25);

    }
  }

  destroy(): void {
    this.image.destroy();
  }
}