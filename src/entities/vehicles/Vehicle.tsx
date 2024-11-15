import { computed, mutable, signal } from "@game/state/lib/signals";
import { MutableSignal, Signal } from "@game/state/lib/types";
import { Math as PMath } from "phaser";
import { EVENT_DROP_WATER, GAME_HEIGHT, GAME_WIDTH } from "../../consts";
import { GameScene } from "../../scenes/game-scene";
import { MapTileType } from "../maps";

export abstract class Vehicle {
  scene: GameScene;

  sprite: Phaser.GameObjects.Image;

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

  position: MutableSignal<PMath.Vector2>;
  direction: MutableSignal<PMath.Vector2>;
  velocity: MutableSignal<PMath.Vector2>;
  acceleration: MutableSignal<PMath.Vector2>;

  maxSpeed: number;
  accelerationRate: number;
  slowingRate: number = 3;
  turnRate: number;
  tankCapacity: number;
  tankLevel: number;
  tankConsumptionRate: number;
  tankRefillRate: number;

  started: boolean;

  turningState: Signal<number>;
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
    this.position = mutable(new PMath.Vector2(x, y));
    this.direction = mutable(PMath.Vector2.DOWN.clone());
    this.velocity = mutable(new PMath.Vector2(0, 0));
    this.acceleration = mutable(new PMath.Vector2(0, 0));
    this.initSounds();
    this.started = false;

    this.water = this.initWaterFX();

    this.turningState = signal(0);

    this.sprite = (
      <image
        x={computed(() => {
          const x = this.position.get().x;
          if (x < 70) return 120;
          if (x > GAME_WIDTH) return GAME_WIDTH - 20;
          return x;
        })}
        y={computed(() => {
          const y = this.position.get().y;
          if (y < 70) return 100;
          if (y > GAME_HEIGHT) return GAME_HEIGHT - 40;
          return y;
        })}
        texture={texture}
        angle={computed(
          () => PMath.RadToDeg(this.direction.get().angle()) - 90
        )}
        frame={computed(() => {
          const currentFrame = Math.floor(this.turningState.get() / 20);
          return Math.max(0, Math.min(4, currentFrame));
        })}
      />
    );

    // Not handled yet
    this.sprite.setScale(imageScale);

    this.scene.add.existing(this.sprite);
  }

  initWaterFX() {
    return this.scene.add.particles(0, 0, "water", {
      x: { random: [0, 8] },
      y: { random: [0, 8] },
      quantity: 4,
      angle: () => {
        const directionAngle =
          PMath.RadToDeg(this.direction.get().angle()) + 180;
        return PMath.RND.between(directionAngle - 60, directionAngle + 60);
      },
      // TODO this is not subscribing or anything, it will not work
      follow: this.position.get(),
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
      volume: 0.25,
    });
  }

  updateSounds(dt: number) {
    // slowly fade out the water tank filling sound
    let newVolume = (this.waterSound.volume -= 0.25 * dt);
    if (newVolume < 0) newVolume = 0;
    this.waterSound.setVolume(newVolume);

    // pitch-shift the engine loop based on velocity
    this.engineSound.setRate(0.2 + this.velocity.get().length() / 200);
  }

  update(_time: number, delta: number): void {
    const deltaSeconds = delta * 0.001;

    this.updateSounds(deltaSeconds);

    if (this.scene.key_w.isDown || this.scene.key_up.isDown) {
      this.started = true;
    }

    if (!this.started) return;

    if (
      !this.scene.space_key.isDown &&
      (this.scene.key_a.isDown || this.scene.key_left.isDown)
    ) {
      this.turningState.update((value) =>
        Math.max(value - this.turningBias * deltaSeconds, 0)
      );
    } else if (
      !this.scene.space_key.isDown &&
      (this.scene.key_d.isDown || this.scene.key_right.isDown)
    ) {
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

    // Apply turning based on turning state
    if (this.turningState.get() < 50) {
      this.direction.mutate((value) => {
        value.rotate(-this.turnRate * deltaSeconds);
        return true;
      });
      this.velocity.mutate((value) => {
        value.rotate(-this.turnRate * deltaSeconds);
        return true;
      });
    } else if (this.turningState.get() > 50) {
      this.direction.mutate((value) => {
        value.rotate(this.turnRate * deltaSeconds);
        return true;
      });
      this.velocity.mutate((value) => {
        value.rotate(this.turnRate * deltaSeconds);
        return true;
      });
    }

    if (this.scene.key_s.isDown || this.scene.key_down.isDown) {
      const slowProportionally =
        this.slowingRate *
        (this.accelerationRate + this.velocity.get().length());
      const slowVector = this.velocity
        .get()
        .clone()
        .normalize()
        .scale(slowProportionally * deltaSeconds);
      this.velocity.mutate((velocity) => {
        velocity.subtract(slowVector);
        velocity.scale(1 - (slowProportionally * deltaSeconds) / this.maxSpeed);

        // to avoid going backwards or stalling
        if (velocity.dot(this.direction.get()) < 0) {
          velocity.setLength(0);
        }

        return true;
      });
    }

    this.acceleration.mutate((acceleration) => {
      acceleration.copy(this.direction.get()).scale(this.accelerationRate);
      return true;
    });

    this.velocity.mutate((velocity) => {
      if (velocity.length() >= this.maxSpeed - 0.1) return false;
      velocity.add(this.acceleration.get());
      return true;
    });

    this.position.mutate((position) => {
      position.add(this.velocity.get().clone().scale(deltaSeconds));
      return true;
    });
  }

  // Canadair will drop water continuously until the tank is empty
  tankWasOpen: boolean = false;

  useTank(_time: number, delta: number): void {
    const deltaSeconds = delta * 0.001;

    if (this.scene.space_key.isDown) {
      if (
        this.tankLevel > 5 &&
        this.scene.currentMap.typeAtWorldXY(
          this.position.get().x,
          this.position.get().y
        ) !== MapTileType.Water
      ) {
        this.tankWasOpen = true;
      }

      if (
        this.scene.currentMap.typeAtWorldXY(
          this.position.get().x,
          this.position.get().y
        ) === MapTileType.Water
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

    if (this.tankWasOpen) {
      this.tankLevel -= this.tankConsumptionRate * deltaSeconds;
      this.tankLevel = PMath.Clamp(this.tankLevel, 1, this.tankCapacity);

      if (this.tankLevel <= 1) {
        this.tankWasOpen = false;
      }

      this.scene.bus.emit("water_level_changed", this.tankLevel);

      this.scene.events.emit(EVENT_DROP_WATER, {
        x: this.position.get().x,
        y: this.position.get().y,
        range: 1,
      });

      this.water.emitting = true;

      if (!this.splashSound.isPlaying) this.splashSound.play(); // sound effect
    } else {
      this.water.emitting = false;
    }
  }

  destroy(): void {
    this.water.destroy();
  }
}
