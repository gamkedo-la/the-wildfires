import { computed, effect, mutable, signal } from "@game/state/lib/signals";
import { MutableSignal, Signal } from "@game/state/lib/types";
import { Math as PMath } from "phaser";
import {
  EVENT_DROP_RETARDANT,
  EVENT_DROP_WATER,
  GAME_HEIGHT,
  GAME_WIDTH,
} from "../../consts";
import { MapScene } from "../../scenes/game/map-scene";
import { MapTileType } from "../maps";
import { RESOURCES } from "@game/assets";
import { VehicleType } from ".";

export abstract class Vehicle {
  static model: string;
  static description: string;

  scene: MapScene;

  sprite: Phaser.GameObjects.Image;
  shadow: Phaser.GameObjects.Image;
  outline: Phaser.GameObjects.Image;

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
  waterDrop: Phaser.GameObjects.Particles.ParticleEmitter;
  waterCollection: Phaser.GameObjects.Particles.ParticleEmitter;

  position: MutableSignal<PMath.Vector2>;
  direction: MutableSignal<PMath.Vector2>;
  velocity: MutableSignal<PMath.Vector2>;
  acceleration: MutableSignal<PMath.Vector2>;
  type: VehicleType;

  maxSpeed: number;
  accelerationRate: number;
  slowingRate: number = 3;
  turnRate: number;

  waterTankCapacity: number;
  waterTankConsumptionRate: number;
  waterTankRefillRate: number;
  waterTankLevel: Signal<number>;

  retardantTankCapacity: number = 99;
  retardantChargeSize: number = 33;
  retardantTankConsumptionRate: number = 25;
  retardantTankRefillRate: number = 38;
  retardantTankLevel: Signal<number>;

  selectedTank: Signal<"water" | "retardant">;

  windRiding: Signal<boolean>;
  windRidingLength: number = 0;

  started: boolean;

  turningState: Signal<number>;
  turningBias: number;
  straightBias: number;

  startImageScale: number = 0.05;
  imageScaleUnit: number;
  imageScale: Signal<number>;
  imageScaleGoal: number;
  maxImageScale: number;

  retardantChargeFx: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(
    scene: MapScene,
    x: number,
    y: number,
    texture: string,
    outlineTexture: string,
    imageScale: number,
    type: VehicleType
  ) {
    this.scene = scene;
    this.type = type;

    this.position = mutable(new PMath.Vector2(x, y));
    this.direction = mutable(PMath.Vector2.DOWN.clone());
    this.velocity = mutable(new PMath.Vector2(0, 0));
    this.acceleration = mutable(new PMath.Vector2(0, 0));
    this.started = false;

    this.windRiding = signal(false);
    this.windRidingLength = 0;

    this.maxImageScale = imageScale;

    this.startImageScale = imageScale * 0.5;
    this.imageScaleGoal = this.maxImageScale;
    this.imageScaleUnit = this.maxImageScale - this.startImageScale;

    this.imageScale = signal(this.startImageScale);

    this.waterDrop = this.initWaterFX();
    this.waterCollection = this.initWaterCollectionFX();

    this.turningState = signal(0);

    this.selectedTank = signal("water");

    this.initSounds();

    this.retardantChargeFx = scene.add.particles(
      0,
      0,
      RESOURCES["retardant-particle"],
      {
        x: {
          onUpdate: (_particle, _key, t, value) => {
            return value + Math.sin(5 * t * Math.PI) + (Math.random() - 0.5);
          },
        },
        quantity: 10,
        speedY: { min: -25, max: -15 },
        scale: 0.75,
        frequency: 25,
        lifespan: { min: 1000, max: 2000 },
        emitting: false,
      }
    );

    this.shadow = (
      <image
        x={computed(() => {
          // const x = this.sprite.x; // can't access sprite from here?
          const x = this.position.get().x;
          if (x < 40) return 120;
          if (x > GAME_WIDTH + 63) return GAME_WIDTH - 20;
          return x;
        })}
        y={computed(() => {
          const y = this.position.get().y;
          if (y < 30) return 100;
          if (y > GAME_HEIGHT + 30) return GAME_HEIGHT - 40;
          // shadow is far below the plane when faster,
          // and directly underneath when stopped
          let altitudeFromSpeed = this.velocity.get().length() / 2;

          if (
            this.isCollectingWater &&
            this.waterTankLevel.get() < this.waterTankCapacity
          ) {
            altitudeFromSpeed /= this.maxSpeed - this.velocity.get().length();
            altitudeFromSpeed = Math.min(30, altitudeFromSpeed);
          }

          return y + altitudeFromSpeed;
        })}
        texture={texture} // same as plane sprite
        alpha={0.2}
        tint={0x000000} // except tinted black and mostly transparent
        angle={computed(
          () => PMath.RadToDeg(this.direction.get().angle()) - 90
        )}
        frame={computed(() => {
          const currentFrame = Math.floor(this.turningState.get() / 20);
          return Math.max(0, Math.min(4, currentFrame));
        })}
        scale={this.imageScale}
      />
    );
    this.scene.add.existing(this.shadow);

    this.sprite = (
      <image
        x={computed(() => {
          const x = this.position.get().x;
          if (x < 40) return 120;
          if (x > GAME_WIDTH + 63) return GAME_WIDTH - 20;
          return x;
        })}
        y={computed(() => {
          const y = this.position.get().y;
          if (y < 30) return 100;
          if (y > GAME_HEIGHT + 30) return GAME_HEIGHT - 40;
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
        scale={this.imageScale}
      />
    );

    this.scene.add.existing(this.sprite);

    this.outline = (
      <image
        texture={outlineTexture}
        x={computed(() => {
          const x = this.position.get().x;
          if (x < 40) return 120;
          if (x > GAME_WIDTH + 63) return GAME_WIDTH - 20;
          return x;
        })}
        y={computed(() => {
          const y = this.position.get().y;
          if (y < 30) return 100;
          if (y > GAME_HEIGHT + 30) return GAME_HEIGHT - 40;
          return y;
        })}
        angle={computed(
          () => PMath.RadToDeg(this.direction.get().angle()) - 90
        )}
        frame={computed(() => {
          const currentFrame = Math.floor(this.turningState.get() / 20);
          return Math.max(0, Math.min(4, currentFrame));
        })}
        scale={this.imageScale}
        tint={computed(() => {
          if (this.selectedTank.get() === "retardant") return 0xef3a0c;
          return 0x2a1d0d;
        })}
      />
    );

    let firstPlay = true;

    effect(() => {
      this.selectedTank.get();
      if (firstPlay) {
        firstPlay = false;
      } else {
        this.scene.sound.play(RESOURCES["tank-switch"], { volume: 0.33 });
      }
    });

    this.outline.setDepth(2);
    this.scene.add.existing(this.outline);
  }

  initWaterFX() {
    return this.scene.add.particles(0, 0, "water", {
      quantity: 10,
      follow: this.position.get(),
      speedX: { random: [-20, 20] },
      speedY: { random: [-20, 20] },
      gravityY: 50,
      frequency: 10,
      lifespan: 500,
      emitting: false,
    });
  }

  initWaterCollectionFX() {
    return this.scene.add.particles(0, 0, "water", {
      quantity: 10,
      blendMode: Phaser.BlendModes.SCREEN,
      follow: this.position.get(),
      speedX: { random: [-30, 30] },
      speedY: { random: [-30, 30] },
      frequency: 10,
      lifespan: 500,
      emitting: false,
    });
  }

  initSounds() {
    // looped audio we can pitch-shift based on velocity
    this.engineSound = this.scene.sound.add(
      this.type === "SKYCRANE"
        ? RESOURCES["helicopter-loop"]
        : RESOURCES["airplane-propeller-loop"],
      {
        loop: true,
      }
    );
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
    this.engineSound.detune = this.type === "MARTIN" ? -1200 : 0;
    this.engineSound.setRate(
      this.type === "MARTIN"
        ? 0.1 + this.velocity.get().length() / this.maxSpeed
        : 0.1 + 0.5 * (this.velocity.get().length() / this.maxSpeed)
    );
  }

  mute() {
    this.engineSound.stop();
    this.waterSound.stop();
  }

  updateScale(dt: number) {
    if (this.imageScaleGoal > 0 && this.imageScaleUnit > 0) {
      this.imageScale.update((currentScale) => {
        const currentStep: number =
          (currentScale - this.startImageScale) / this.imageScaleUnit;
        const goalStep: number =
          (this.imageScaleGoal - this.startImageScale) / this.imageScaleUnit;
        const stepDiff: number = goalStep - currentStep;
        const goUpOrDown: number = stepDiff > 0 ? dt : stepDiff < 0 ? -dt : 0;

        return currentScale + goUpOrDown * this.imageScaleUnit;
      });
    }
  }

  update(_time: number, delta: number): void {
    const deltaSeconds = delta * 0.001;

    this.updateSounds(deltaSeconds);

    if (this.scene.key_w.isDown || this.scene.key_up.isDown) {
      this.started = true;
    }

    if (this.scene.key_one.isDown) {
      this.selectedTank.set("water");
    } else if (this.scene.key_two.isDown) {
      this.selectedTank.set("retardant");
    }

    if (!this.started) return;

    this.updateScale(deltaSeconds);

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

    if (
      this.isCollectingWater &&
      this.waterTankLevel.get() < this.waterTankCapacity
    ) {
      const slowProportionally =
        (this.slowingRate / 3.3) *
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
    } else if (this.scene.key_s.isDown || this.scene.key_down.isDown) {
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

    this.windRiding.update(() => {
      const angleDiff =
        this.direction.get().angle() -
        this.scene.windSystem.windVector.get().angle();
      const isRiding = angleDiff < 0.25 && angleDiff > -0.25;

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

    this.velocity.mutate((velocity) => {
      if (velocity.length() >= this.maxSpeed - 0.1) return false;
      velocity.add(this.acceleration.get());
      return true;
    });

    this.position.mutate((position) => {
      position.add(
        this.velocity
          .get()
          .clone()
          .scale(deltaSeconds * (this.windRiding.get() ? 1.5 : 1))
      );
      return true;
    });
  }

  // Vehicles will drop water continuously until the tank is empty
  // Water is collected when space is pressed until it's pressed again
  tankWasOpen: "water" | "retardant" | null = null;
  closeRetardantTankAt: number = 0;
  spacePressedTime: number = 0;
  isCollectingWater: boolean = false;

  useTank(_time: number, delta: number): void {
    const deltaSeconds = delta * 0.001;

    if (this.scene.space_key.isDown) {
      if (!this.isCollectingWater && !this.tankWasOpen) {
        const isTileWater =
          this.scene.currentMap.typeAtWorldXY(
            this.position.get().x,
            this.position.get().y
          ) === MapTileType.Water;
        const isSelectedWater = this.selectedTank.get() === "water";
        const isSelectedRetardant = !isSelectedWater;

        if (
          isSelectedWater &&
          isTileWater &&
          this.waterTankLevel.get() === this.waterTankCapacity
        ) {
          this.tankWasOpen = "water";
          this.spacePressedTime = _time;
        } else if (
          isTileWater &&
          this.waterTankLevel.get() !== this.waterTankCapacity
        ) {
          this.isCollectingWater = true;
          this.spacePressedTime = _time;
        } else if (isSelectedWater && this.waterTankLevel.get() > 5) {
          this.tankWasOpen = "water";
          this.spacePressedTime = _time;
        } else if (
          isSelectedRetardant &&
          this.retardantTankLevel.get() > this.retardantChargeSize
        ) {
          this.tankWasOpen = "retardant";
          this.spacePressedTime = _time;
          this.closeRetardantTankAt =
            this.retardantTankLevel.get() - this.retardantChargeSize;
        } else if (_time - this.spacePressedTime > 700) {
          this.spacePressedTime = _time;
          this.scene.sound.play(RESOURCES["empty-tank"], { volume: 0.25 });
        }
      }

      // Collect water when space is pressed
      if (
        this.waterTankLevel.get() < this.waterTankCapacity &&
        this.isCollectingWater &&
        this.scene.currentMap.typeAtWorldXY(
          this.position.get().x,
          this.position.get().y
        ) === MapTileType.Water
      ) {
        this.waterTankLevel.update((value) =>
          PMath.Clamp(
            value + this.waterTankRefillRate * deltaSeconds,
            1,
            this.waterTankCapacity
          )
        );

        if (
          this.waterTankLevel.get() >= this.waterTankCapacity &&
          !this.scene.sound.isPlaying(RESOURCES["water-filled"])
        ) {
          this.scene.sound.play(RESOURCES["water-filled"]);
          this.retardantChargeFx.explode(
            3,
            this.position.get().x,
            this.position.get().y
          );
          this.remainingCharges++;
        }

        // fade in the water tank filling sound
        let newVolume = Math.min(
          this.waterSound.volume + 0.5 * deltaSeconds,
          0.5
        );
        this.waterSound.setVolume(newVolume);
        if (_time - this.spacePressedTime > 250) {
          this.waterCollection.emitting = true;
        }
        this.imageScaleGoal = this.maxImageScale * 0.8;
      } else {
        this.waterCollection.emitting = false;
        this.imageScaleGoal = this.maxImageScale;
      }
    }

    // Stop collecting water when raise the space
    if (this.isCollectingWater && !this.scene.space_key.isDown) {
      this.isCollectingWater = false;
      this.waterCollection.emitting = false;
      this.imageScaleGoal = this.maxImageScale;
    }

    /** DEBUGGING STATES 
    if (this.isCollectingWater) {
      this.sprite.tint = 0x00ffff;
    } else if (this.tankWasOpen) {
      this.sprite.tint = 0xff0000;
    } else {
      this.sprite.tint = 0xffffff;
    } */

    if (this.tankWasOpen === "water") {
      this.waterTankLevel.update((value) =>
        PMath.Clamp(
          value - this.waterTankConsumptionRate * deltaSeconds,
          1,
          this.waterTankCapacity
        )
      );

      if (this.waterTankLevel.get() <= 1) {
        this.tankWasOpen = null;
      }

      // Water takes time to reach the ground
      if (_time - this.spacePressedTime > 150) {
        const positionBehind = this.position
          .get()
          .clone()
          .subtract(this.direction.get().clone().scale(5));

        this.scene.events.emit(EVENT_DROP_WATER, {
          x: positionBehind.x,
          y: positionBehind.y + 12,
          range: this.type === "MARTIN" ? 2 : 1,
        });
      }

      this.waterDrop.emitting = true;
      this.waterDrop.particleTint = 0xffffff;

      if (!this.splashSound.isPlaying) this.splashSound.play(); // sound effect
    } else if (this.tankWasOpen === "retardant") {
      this.retardantTankLevel.update((value) =>
        PMath.Clamp(
          value - this.retardantTankConsumptionRate * deltaSeconds,
          this.closeRetardantTankAt,
          this.retardantTankCapacity
        )
      );

      const currentLevel = this.retardantTankLevel.get();
      if (currentLevel <= 1 || currentLevel <= this.closeRetardantTankAt) {
        this.tankWasOpen = null;
      }

      // Water takes time to reach the ground
      if (_time - this.spacePressedTime > 150) {
        const positionBehind = this.position
          .get()
          .clone()
          .subtract(this.direction.get().clone().scale(5));

        this.scene.events.emit(EVENT_DROP_RETARDANT, {
          x: positionBehind.x,
          y: positionBehind.y + 12,
          range: 1,
        });
      }

      this.waterDrop.emitting = true;
      this.waterDrop.particleTint = 0xff3333;

      if (!this.splashSound.isPlaying) this.splashSound.play(); // sound effect
    } else {
      this.waterDrop.emitting = false;
    }
  }

  remainingCharges: number = 0;

  loadRetardantCharge(delta: number) {
    const deltaSeconds = delta * 0.001;
    let lastRetardantTankLevel = this.retardantTankLevel.get();

    // DEBUG
    this.retardantTankLevel.update((value) => {
      return PMath.Clamp(
        value +
          (this.retardantTankRefillRate * deltaSeconds) / 100 +
          1 * this.remainingCharges,
        1,
        this.retardantTankCapacity
      );
    });

    this.remainingCharges = 0;

    if (
      lastRetardantTankLevel % this.retardantChargeSize >
      this.retardantTankLevel.get() % this.retardantChargeSize
    ) {
      this.scene.sound.play(RESOURCES["retardant-fill"]);
    }
  }

  destroy(): void {
    this.position.dispose();
    this.direction.dispose();
    this.velocity.dispose();
    this.acceleration.dispose();
    this.turningState.dispose();

    this.engineSound.destroy();
    this.waterSound.destroy();
    this.splashSound.destroy();

    this.waterDrop.destroy();
  }
}
