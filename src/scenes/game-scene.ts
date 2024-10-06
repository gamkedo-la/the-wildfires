import { Scene, Tilemaps } from "phaser";
import { RESOURCES } from "../assets";
import PhaserGamebus from "../lib/gamebus";
import { VehicleSystem } from "../systems/vehicle/vehicle-system";
import { FireSystem } from "../systems/fire/fire-system";
import { MapSystem } from "../systems/map/map-system";
import { WindSystem } from "../systems/wind/wind-system";

const MAX_BURN = 4;
const FIRE_INTERVAL_MS = 8000;
const BURN_INTERVAL_MS = 5000;
const WIND_INTERVAL_MS = 10000;

export class GameScene extends Scene {
  declare bus: Phaser.Events.EventEmitter;
  declare gamebus: PhaserGamebus;

  camera: Phaser.Cameras.Scene2D.Camera;
  map: Phaser.Tilemaps.Tilemap;

  constructor() {
    super("Game");
  }

  mapLayer!: Phaser.Tilemaps.TilemapLayer;
  fireLayer!: Phaser.Tilemaps.TilemapLayer;
  fireTileId!: integer;

  space_key!: Phaser.Input.Keyboard.Key;
  key_w!: Phaser.Input.Keyboard.Key;
  key_up!: Phaser.Input.Keyboard.Key;
  key_a!: Phaser.Input.Keyboard.Key;
  key_left!: Phaser.Input.Keyboard.Key;
  key_d!: Phaser.Input.Keyboard.Key;
  key_right!: Phaser.Input.Keyboard.Key;
  key_p!: Phaser.Input.Keyboard.Key;
  key_esc!: Phaser.Input.Keyboard.Key;

  create() {
    this.bus = this.gamebus.getBus();

    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x00ff00);
    this.camera.scrollX = 200;

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
    this.key_p = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this.key_esc = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    );

    this.map = this.add.tilemap(RESOURCES["test-island-16"]);
    this.map.addTilesetImage("tilemap", RESOURCES["tilemap-test"]);
    this.mapLayer = this.map.createLayer("map", "tilemap")!;
    this.fireLayer = this.map.createLayer("fire", "tilemap")!;
    // Tilemap global properties seem to be missing type info?
    let mapProperties = this.map.properties as Array<{ name: string, value: number }>;
    let fireTileId = mapProperties.find(p => p.name === "fireTileId")?.value
    if (fireTileId) {
      this.fireTileId = fireTileId
    } else {
      throw new Error('Invalid or missing fireTileId property in tilemap')
    }

    this.maxDamageLevel = this.mapLayer.filterTiles(
      (t: Tilemaps.Tile) => t.properties.addsDamage
    ).length;

    this.registerSystems();

    this.scene.run("UI", {
      gameScene: this,
    });
    this.scene.run("Debug");
  }

  vehiclesSystem: VehicleSystem;
  fireSystem: FireSystem;
  mapSystem: MapSystem;
  windSystem: WindSystem;

  registerSystems() {
    this.vehiclesSystem = new VehicleSystem(this).create();
    this.fireSystem = new FireSystem(this, FIRE_INTERVAL_MS).create();
    this.mapSystem = new MapSystem(this, BURN_INTERVAL_MS, MAX_BURN).create();
    this.windSystem = new WindSystem(this, WIND_INTERVAL_MS).create();
  }

  updateSystems(time: number, delta: number) {
    this.vehiclesSystem.update(time, delta);
    this.fireSystem.update(time, delta);
    this.mapSystem.update(time, delta);
    this.windSystem.update(time, delta);
  }

  damageLevel = 0;
  maxDamageLevel = 1;

  update(time: number, delta: number) {
    this.updateSystems(time, delta);

    if (this.key_p.isDown || this.key_esc.isDown) {
      console.log("Pause key down");
      this.doPause();
    }
  }

  increaseDamage(points: number) {
    this.damageLevel += points;
    this.bus.emit("damage_level_changed", this.damageLevel);
  }

  doPause() {
    this.scene.pause();
    this.scene.launch('Pause');
  }
}
