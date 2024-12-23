import { MAPS } from "@game/entities/maps/index";
import { END_REASONS, RunState } from "@game/state/game-state";
import { effect } from "@game/state/lib/signals";
import { AbstractScene } from "..";
import { GameMap } from "../../entities/maps/GameMap";
import { POI_STATE } from "../../entities/point-of-interest/PointOfInterest";
import PhaserGamebus from "../../lib/gamebus";
import { FireMapSystem } from "../../systems/fire/fire-map-system";
import { VehicleSystem } from "../../systems/vehicle/vehicle-system";
import { WindSystem } from "../../systems/wind/wind-system";
import {
  createTransitionSignal,
  Sequence,
  Transition,
} from "../../ui/animation/animation";
import { SCENES } from "../consts";
import { RESOURCES } from "@game/assets";

export class MapScene extends AbstractScene {
  declare bus: Phaser.Events.EventEmitter;
  declare gamebus: PhaserGamebus;

  camera: Phaser.Cameras.Scene2D.Camera;

  constructor() {
    super(SCENES.MAP);
  }

  space_key!: Phaser.Input.Keyboard.Key;
  key_w!: Phaser.Input.Keyboard.Key;
  key_up!: Phaser.Input.Keyboard.Key;
  key_a!: Phaser.Input.Keyboard.Key;
  key_left!: Phaser.Input.Keyboard.Key;
  key_d!: Phaser.Input.Keyboard.Key;
  key_right!: Phaser.Input.Keyboard.Key;
  key_s!: Phaser.Input.Keyboard.Key;
  key_down!: Phaser.Input.Keyboard.Key;
  key_one!: Phaser.Input.Keyboard.Key;
  key_two!: Phaser.Input.Keyboard.Key;
  key_control!: Phaser.Input.Keyboard.Key;
  key_p!: Phaser.Input.Keyboard.Key;
  key_esc!: Phaser.Input.Keyboard.Key;

  gameEnding: boolean;

  backgroundMusic:
    | Phaser.Sound.WebAudioSound
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.HTML5AudioSound;

  create() {
    this.bus = this.gamebus.getBus();

    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x00ff00);

    this.space_key = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    this.key_w = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.key_up = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.UP
    );
    this.key_a = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.key_left = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.LEFT
    );
    this.key_d = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.key_right = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.RIGHT
    );
    this.key_s = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.key_down = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.DOWN
    );
    this.key_one = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.ONE
    );
    this.key_two = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.TWO
    );
    this.key_control = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.CTRL
    );
    this.key_p = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this.key_esc = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    );

    this.gameEnding = false;
    this.currentMap = new MAPS[this.gameState.currentRun.get().map](this);

    this.camera.scrollX = Math.floor(this.currentMap.cameraPosition.x);
    this.camera.scrollY = Math.floor(this.currentMap.cameraPosition.y);

    this.registerSystems();
    this.setupWindParticles();
    this.registerGameEndedListener();

    this.scene.run(SCENES.HUD, {
      gameScene: this,
    });
    this.scene.run(SCENES.DEBUG);

    this.gameState.setRunState(RunState.RUNNING);

    this.backgroundMusic = this.sound.add(RESOURCES["maps-theme"], {
      loop: true,
      volume: 0.5,
    });

    this.backgroundMusic.play();

    this.tweens.add({
      targets: this.backgroundMusic,
      volume: 1,
      duration: 5000,
    });
  }

  currentMap: GameMap;
  vehiclesSystem: VehicleSystem;
  fireMapSystem: FireMapSystem;
  windSystem: WindSystem;

  registerSystems() {
    this.vehiclesSystem = new VehicleSystem(
      this,
      this.gameState.currentRun.get().vehicle
    ).create();
    this.fireMapSystem = new FireMapSystem(this).create();
    this.windSystem = new WindSystem(this).create();
  }

  windParticles: Phaser.GameObjects.Particles.ParticleEmitter;

  setupWindParticles() {
    const { width, height } = this.scale;

    this.windParticles = this.add.particles(0, 0, "wind_particle", {
      frequency: 100,
      lifespan: 4000,
      quantity: 10,
      speedX: 0,
      speedY: 0,
      alpha: {
        start: 1,
        end: 0.3,
        ease: "quart.out",
      },
      emitZone: {
        type: "random",
        source: new Phaser.Geom.Rectangle(0, 0, width, height),
      } as Phaser.Types.GameObjects.Particles.ParticleEmitterConfig["emitZone"],
    });

    this.windParticles.speedX = -20;
    this.windParticles.speedY = 20;

    effect(() => {
      const windVector = this.windSystem.windVector.get();
      this.windParticles.speedX = windVector.x * 20;
      this.windParticles.speedY = windVector.y * 20;
    });
  }

  update(time: number, delta: number) {
    this.vehiclesSystem.update(time, delta);
    this.fireMapSystem.update(time, delta);
    this.windSystem.update(time, delta);
    this.currentMap.update(time, delta);

    if (this.key_p.isDown || this.key_esc.isDown) {
      this.doPause();
    }
  }

  registerGameEndedListener() {
    effect(() => {
      const run = this.gameState.currentRun.get();
      // TODO: if something is partially saved it is not triggering
      if (run.state === RunState.RUNNING) {
        const allSaved = run.poi.every(
          (poi) => poi.state.get() === POI_STATE.SAVED
        );
        const allDamaged = run.poi.every(
          (poi) =>
            poi.state.get() === POI_STATE.DAMAGED ||
            poi.state.get() === POI_STATE.PARTIALLY_SAVED
        );
        if (allSaved) {
          this.endGame(END_REASONS.POI_SAVED);
        } else if (allDamaged) {
          this.endGame(END_REASONS.POI_DESTROYED);
        }
      }
    });
  }

  // We need a stable reference for this function
  endGameFireExtinguished() {
    this.endGame(END_REASONS.FIRE_EXTINGUISHED);
  }

  endGame(endReason: (typeof END_REASONS)[keyof typeof END_REASONS]) {
    if (this.gameEnding) return;
    this.gameEnding = true;

    const backgroundAlpha = createTransitionSignal(0);

    const { width, height } = this.scale;

    const rect: Phaser.GameObjects.Rectangle = this.add.existing(
      <rectangle
        x={0}
        y={0}
        width={width * 1.2}
        height={height * 1.2}
        fillColor={0x000000}
        origin={0}
        alpha={backgroundAlpha}
      />
    );

    rect.setDepth(2);

    this.animationEngine.run(
      <Sequence>
        <Transition
          from={0}
          duration={5000}
          to={0.75}
          signal={backgroundAlpha}
        />
      </Sequence>
    );

    this.time.delayedCall(5000, () => {
      this.gameState.endRun(endReason);
      this.scene.stop(SCENES.HUD);
      this.scene.stop(SCENES.DEBUG);
      this.scene.pause();
      this.backgroundMusic.stop();
      this.vehiclesSystem.vehicle.mute();
      this.scene.run(SCENES.UI_SUMMARY);
    });
  }

  shutdown() {
    this.scene.stop(SCENES.DEBUG);
    this.scene.stop(SCENES.HUD);

    this.vehiclesSystem.destroy();
    this.fireMapSystem.destroy();
    this.windSystem.destroy();
    this.windParticles.destroy();

    this.backgroundMusic.stop();
  }

  doPause() {
    this.scene.pause();
    this.scene.launch(SCENES.UI_PAUSE);
  }
}
