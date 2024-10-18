import { Math as PMath } from "phaser";
import { GameScene } from "../../scenes/game-scene";
import { EVENT_DROP_WATER } from "../../consts";
import { MapTileType } from "../maps";

export abstract class Vehicle {
  scene: GameScene;
  image: Phaser.GameObjects.Image;
  engineSound:
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.WebAudioSound
    | Phaser.Sound.NoAudioSound;
  waterSound:
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.WebAudioSound
    | Phaser.Sound.NoAudioSound;
  splashSound:
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.WebAudioSound
    | Phaser.Sound.NoAudioSound;
  water: Phaser.GameObjects.Particles.ParticleEmitter;

  position: PMath.Vector2;
  direction: PMath.Vector2;
  velocity: PMath.Vector2;
  acceleration: PMath.Vector2;

  maxSpeed: number;
  accelerationRate: number;
  slowingRate: number = 3;
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
    this.initSounds();
    this.started = false;

    this.water = this.initWaterFX();
  }

  initWaterFX() {
    return this.scene.add.particles(0, 0, "water", {
      x: { random: [0, 8] },
      y: { random: [0, 8] },
      quantity: 4,
      angle: () => {
        const directionAngle = PMath.RadToDeg(this.direction.angle()) + 180;
        return PMath.RND.between(directionAngle - 60, directionAngle + 60);
      },
      follow: this.position,
      speed: 12,
      frequency: 20,
      lifespan: 800,
      emitting: false,
    });
  }

  initSounds() {
    // looped audio we can pitch-shift based on velocity
    this.engineSound = this.scene.sound.add("airplane-propeller-loop", {
      loop: true,
      volume: 0.25,
    });
    this.engineSound.play();

    // looped audio we can fade in/out based on proximity to flame
    this.waterSound = this.scene.sound.add("water-loop", {
      loop: true,
      volume: 0,
    });
    this.waterSound.play();

    // a non-looped sound effect
    this.splashSound = this.scene.sound.add("fire-extinguished", {
      loop: false,
      volume: 0.15,
    });
  }

  updateSounds(dt: number) {
    // slowly fade out the water tank filling sound
    let newVolume = (this.waterSound.volume -= 0.25 * dt);
    if (newVolume < 0) newVolume = 0;
    this.waterSound.setVolume(newVolume);

    // pitch-shift the engine loop based on velocity
    this.engineSound.setRate(0.2 + this.velocity.length() / 200);
  }

  update(_time: number, delta: number): void {
    const deltaSeconds = delta * 0.001;

    this.updateSounds(deltaSeconds);

    this.image.x = this.position.x;
    this.image.y = this.position.y;

    if (this.scene.key_a.isDown || this.scene.key_left.isDown) {
      this.turningState = Math.max(
        this.turningState - this.turningBias * deltaSeconds,
        0
      );
    } else if (this.scene.key_d.isDown || this.scene.key_right.isDown) {
      this.turningState = Math.min(
        this.turningState + this.turningBias * deltaSeconds,
        100
      );
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

    if (this.scene.key_s.isDown || this.scene.key_down.isDown) {
      const slowProportionally =
        this.slowingRate * (this.accelerationRate + this.velocity.length());
      const slowVector = this.velocity
        .clone()
        .normalize()
        .scale(slowProportionally * deltaSeconds);
      this.velocity.subtract(slowVector);
      this.velocity.scale(
        1 - (slowProportionally * deltaSeconds) / this.maxSpeed
      );

      // to avoid going backwards or stalling
      if (this.velocity.dot(this.direction) < 0) {
        this.velocity.setLength(0);
      }
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
      this.scene.currentMap.typeAtWorldXY(this.position.x, this.position.y) !==
        MapTileType.Water
    ) {
      this.tankLevel -= this.tankConsumptionRate * deltaSeconds;
      this.tankLevel = PMath.Clamp(this.tankLevel, 1, this.tankCapacity);
      this.scene.bus.emit("water_level_changed", this.tankLevel);

      this.scene.events.emit(EVENT_DROP_WATER, {
        x: this.position.x,
        y: this.position.y,
        range: 1,
      });

      this.water.emitting = true;

      if (!this.splashSound.isPlaying) this.splashSound.play(); // sound effect

    } else {
      this.water.emitting = false;
    }

    if (
      this.scene.currentMap.typeAtWorldXY(this.position.x, this.position.y) ===
      MapTileType.Water
    ) {
      this.tankLevel += this.tankRefillRate * deltaSeconds;
      this.tankLevel = PMath.Clamp(this.tankLevel, 1, this.tankCapacity);
      this.scene.bus.emit("water_level_changed", this.tankLevel);

      // fade in the water tank filling sound
      let newVolume = this.waterSound.volume + 0.5 * deltaSeconds;
      if (newVolume > 0.25) newVolume = 0.25;
      this.waterSound.setVolume(newVolume);
    }
  }

  closeTank() {
    this.water.emitting = false;
  }

  destroy(): void {
    this.image.destroy();
    this.water.destroy();
  }
}
