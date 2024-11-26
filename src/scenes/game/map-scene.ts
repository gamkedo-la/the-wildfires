import { EVENT_FIRE_EXTINGUISHED } from "@game/consts";
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
import { SCENES } from "../consts";

const FIRE_INTERVAL_MS = 8000;
const BURN_INTERVAL_MS = 5000;

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
  key_p!: Phaser.Input.Keyboard.Key;
  key_esc!: Phaser.Input.Keyboard.Key;

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
    this.key_p = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this.key_esc = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    );

    this.currentMap = new MAPS[this.gameState.currentRun.get().map](this);

    this.camera.scrollX = Math.floor(this.currentMap.cameraPosition.x);
    this.camera.scrollY = Math.floor(this.currentMap.cameraPosition.y);

    this.registerSystems();
    this.registerGameEndedListener();

    this.scene.run(SCENES.HUD, {
      gameScene: this,
    });
    this.scene.run(SCENES.DEBUG);

    this.gameState.setRunState(RunState.RUNNING);
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
    this.fireMapSystem = new FireMapSystem(
      this,
      FIRE_INTERVAL_MS,
      BURN_INTERVAL_MS
    ).create();
    this.windSystem = new WindSystem(this).create();
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
    // We need to call events like this so we can remove them later
    this.events.once(
      EVENT_FIRE_EXTINGUISHED,
      this.endGameFireExtinguished,
      this
    );

    effect(() => {
      const run = this.gameState.currentRun.get();
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
    this.gameState.endRun(endReason);
    this.scene.stop(SCENES.HUD);
    this.scene.stop(SCENES.DEBUG);
    this.scene.pause();
    this.scene.run(SCENES.UI_SUMMARY);
  }

  shutdown() {
    this.scene.stop(SCENES.DEBUG);
    this.scene.stop(SCENES.HUD);

    this.vehiclesSystem.destroy();
    this.fireMapSystem.destroy();
    this.windSystem.destroy();

    this.events.removeListener(
      EVENT_FIRE_EXTINGUISHED,
      this.endGameFireExtinguished,
      this
    );
  }

  doPause() {
    this.scene.pause();
    this.scene.launch(SCENES.UI_PAUSE);
  }
}
