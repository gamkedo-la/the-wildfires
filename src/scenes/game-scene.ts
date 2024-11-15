import { EVENT_FIRE_EXTINGUISHED } from "@game/consts";
import { JSXScene } from ".";
import { ContinentalMap } from "../entities/maps/Continental";
import { GameMap } from "../entities/maps/GameMap";
import PhaserGamebus from "../lib/gamebus";
import { FireMapSystem } from "../systems/fire/fire-map-system";
import { VehicleSystem } from "../systems/vehicle/vehicle-system";
import { WindSystem } from "../systems/wind/wind-system";

const FIRE_INTERVAL_MS = 8000;
const BURN_INTERVAL_MS = 5000;

export class GameScene extends JSXScene {
  declare bus: Phaser.Events.EventEmitter;
  declare gamebus: PhaserGamebus;

  camera: Phaser.Cameras.Scene2D.Camera;

  constructor() {
    super("Game");
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

    this.currentMap = new ContinentalMap(this);

    this.camera.scrollX = Math.floor(this.currentMap.cameraPosition.x);
    this.camera.scrollY = Math.floor(this.currentMap.cameraPosition.y);

    this.registerSystems();

    this.scene.run("UI", {
      gameScene: this,
    });
    this.scene.run("Debug");

    this.events.on(EVENT_FIRE_EXTINGUISHED, () => {
      this.scene.stop("UI");
      this.scene.stop("Debug");
      this.scene.start("Summary");
    });
  }

  currentMap: GameMap;
  vehiclesSystem: VehicleSystem;
  fireMapSystem: FireMapSystem;
  windSystem: WindSystem;

  registerSystems() {
    this.vehiclesSystem = new VehicleSystem(this).create();
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

  doPause() {
    this.scene.pause();
    this.scene.launch("Pause");
  }
}
