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
  animatedTiles: any[] = [];
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
    this.key_s = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.key_down = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.DOWN
    );
    this.key_p = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this.key_esc = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    );

    this.map = this.add.tilemap(RESOURCES["test-island-16"]);
    this.map.addTilesetImage("tilemap", RESOURCES["tilemap-test-2"]);
    this.mapLayer = this.map.createLayer("map", "tilemap")!;
    this.fireLayer = this.map.createLayer("fire", "tilemap")!;
    // Tilemap global properties seem to be missing type info?
    let mapProperties = this.map.properties as Array<{
      name: string;
      value: number;
    }>;
    let fireTileId = mapProperties.find((p) => p.name === "fireTileId")?.value;
    if (fireTileId) {
      this.fireTileId = fireTileId;
    } else {
      throw new Error("Invalid or missing fireTileId property in tilemap");
    }

    this.animatedTiles = [];
    const tileData = this.map.tilesets[0].tileData;

    // Tiles animation system from https://medium.com/@0xNicko/how-to-animate-your-tiles-in-a-phaser-3-game-scene-a2394bd7494b
    // TODO: If we know this will be only for fire, we don't need this here
    for (let tileid in tileData) {
      this.map.layers.forEach((layer) => {
        layer.data.forEach((tileRow) => {
          tileRow.forEach((tile) => {
            if (
              tile.index - this.map.tilesets[0].firstgid ===
              parseInt(tileid)
            ) {
              this.animatedTiles.push({
                tile,
                tileAnimationData: (tileData as any)[tileid].animation,
                firstgid: this.map.tilesets[0].firstgid,
                elapsedTime: 0,
              });
            }
          });
        });
      });
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
      this.doPause();
    }

    // TODO: This is here but we might just make it into the fire-system? I suspect we won't see any other tile animated
    this.animatedTiles.forEach((tile) => {
      if (!tile.tileAnimationData) return;

      let animationDuration =
        tile.tileAnimationData[0].duration * tile.tileAnimationData.length;

      tile.elapsedTime += delta;
      tile.elapsedTime %= animationDuration;

      const animatonFrameIndex = Math.floor(
        tile.elapsedTime / tile.tileAnimationData[0].duration
      );

      tile.tile.index =
        tile.tileAnimationData[animatonFrameIndex].tileid + tile.firstgid;
    });
  }

  increaseDamage(points: number) {
    this.damageLevel += points;
    this.bus.emit("damage_level_changed", this.damageLevel);
  }

  doPause() {
    this.scene.pause();
    this.scene.launch("Pause");
  }
}
