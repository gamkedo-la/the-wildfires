import { Scene, Tilemaps } from "phaser";
import { RESOURCES } from "../assets";
import PhaserGamebus from "../lib/gamebus";
import { VehicleSystem } from "../systems/vehicle/vehicle-system";

export class GameScene extends Scene {
  declare bus: Phaser.Events.EventEmitter;
  declare gamebus: PhaserGamebus;

  camera: Phaser.Cameras.Scene2D.Camera;
  map: Phaser.Tilemaps.Tilemap;

  constructor() {
    super("Game");
  }

  tileLayer!: Phaser.Tilemaps.TilemapLayer;

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
    this.tileLayer = this.map.createLayer("map", "tilemap")!;

    const burnableTiles = [1, 5, 6];
    const damagedTiles = [5, 6];

    this.tileLayer
      .filterTiles((t: Tilemaps.Tile) => t.index === 2)
      .forEach((tile) => {
        this.emitSmoke(tile);
      });

    this.fireCounter = this.fireCounterSpeed;
    this.events.on("fire", () => {
      this.tileLayer
        .filterTiles((t: Tilemaps.Tile) => t.index === 2)
        .forEach((tile) => {
          if (tile.properties.burned === undefined) {
            tile.properties.burned = 0;
          }
          tile.properties.burned += 1;
          if (tile.properties.burned > 3) {
            tile.index = 7;
            this.stopSmoke(tile);
          }
          let leftTile = this.tileLayer.getTileAt(tile.x - 1, tile.y);
          let rightTile = this.tileLayer.getTileAt(tile.x + 1, tile.y);
          let topTile = this.tileLayer.getTileAt(tile.x, tile.y - 1);
          let bottomTile = this.tileLayer.getTileAt(tile.x, tile.y + 1);

          [leftTile, rightTile, topTile, bottomTile].forEach((tile) => {
            if (tile && burnableTiles.indexOf(tile.index) >= 0) {
              if (damagedTiles.indexOf(tile.index) >= 0) {
                this.damageLevel += 1;
                this.bus.emit("damage_level_changed", this.damageLevel);
              }
              tile.index = 2;
              this.emitSmoke(tile);
            }
          });
        });
    });

    this.time.delayedCall(1000, () => {
      this.events.emit("fire");
      this.events.emit("fire");
    });

    this.maxDamageLevel = this.tileLayer.filterTiles(
      (t: Tilemaps.Tile) => t.index === 5 || t.index === 6
    ).length;

    this.registerSystems();

    this.scene.run("UI", {
      gameScene: this,
    });
    this.scene.run("Debug");
  }

  vehiclesSystem: VehicleSystem;

  registerSystems() {
    this.vehiclesSystem = new VehicleSystem(this).create();
  }

  updateSystems(time: number, delta: number) {
    this.vehiclesSystem.update(time, delta);
  }

  damageLevel = 0;
  maxDamageLevel = 1;

  fireCounterSpeed = 600;
  fireCounter = 0;

  update(time: number, delta: number) {
    this.updateSystems(time, delta);

    this.fireCounter -= 1;
    if (this.fireCounter <= 0) {
      this.fireCounter = this.fireCounterSpeed;
      this.events.emit("fire");
    }

    if (this.key_p.isDown || this.key_esc.isDown) {
      console.log("Pause key down");
    }
  }

  private emitSmoke(tile: Tilemaps.Tile) {
    if (tile.properties.smoke === undefined) {
      tile.properties.smoke = this.add.particles(
        tile.pixelX,
        tile.pixelY,
        "smoke",
        {
          x: { random: [0, tile.width] },
          y: { random: [0, tile.height] },
          quantity: 1,
          angle: { min: -45, max: -15 },
          speed: 5,
          frequency: 80,
          lifespan: 2000,
        }
      );
    }
  }

  // TODO Removed the private, but this will go to its system (fire system?)
  stopSmoke(tile: Tilemaps.Tile) {
    tile.properties.smoke?.destroy();
    delete tile.properties.smoke;
  }
}
