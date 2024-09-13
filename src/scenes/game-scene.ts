import { Math, Scene, Tilemaps } from "phaser";
import { RESOURCES } from "../assets";

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  map: Phaser.Tilemaps.Tilemap;

  constructor() {
    super("Game");
  }

  water_level: Phaser.GameObjects.Rectangle;
  damage_level: Phaser.GameObjects.Rectangle;
  martin: Phaser.GameObjects.Image;

  tileLayer!: Phaser.Tilemaps.TilemapLayer;

  space_key!: Phaser.Input.Keyboard.Key;
  key_w!: Phaser.Input.Keyboard.Key;
  key_a!: Phaser.Input.Keyboard.Key;
  key_d!: Phaser.Input.Keyboard.Key;

  create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x00ff00);
    this.camera.scrollX = 200;

    this.space_key = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    this.key_w = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.key_a = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.key_d = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    this.map = this.add.tilemap(RESOURCES["test-island-16"]);
    this.map.addTilesetImage("tilemap", RESOURCES["tilemap-test"]);
    this.tileLayer = this.map.createLayer("map", "tilemap")!;

    this.martin = this.add.image(382, 235, RESOURCES.martin).setScale(0.25);

    const water_bg = this.add.rectangle(175, 670, 210, 50);
    water_bg.isStroked = true;
    water_bg.strokeColor = 0x333333;
    water_bg.lineWidth = 4;
    water_bg.setScrollFactor(0, 0);

    this.water_level = this.add.rectangle(75, 670, 1, 40);
    this.water_level.setOrigin(0, 0.5);
    this.water_level.isFilled = true;
    this.water_level.fillColor = 0x8ff8e2;
    this.water_level.isStroked = true;
    this.water_level.strokeColor = 0xffffff;
    this.water_level.lineWidth = 4;
    this.water_level.setScrollFactor(0, 0);
    this.add
      .text(175, 720, "WATER", {
        fontFamily: "DotGothic16",
        fontSize: "24px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8,
        align: "center",
      })
      .setOrigin(0.5)
      .setScrollFactor(0, 0);

    const damage_bg = this.add.rectangle(175, 540, 210, 50);
    damage_bg.isStroked = true;
    damage_bg.strokeColor = 0x333333;
    damage_bg.lineWidth = 4;
    damage_bg.setScrollFactor(0, 0);

    this.damage_level = this.add.rectangle(75, 540, 1, 40);
    this.damage_level.setOrigin(0, 0.5);
    this.damage_level.isFilled = true;
    this.damage_level.fillColor = 0xae2339;
    this.damage_level.isStroked = true;
    this.damage_level.strokeColor = 0xffffff;
    this.damage_level.lineWidth = 4;
    this.damage_level.setScrollFactor(0, 0);

    this.add
      .text(175, 590, "DAMAGE", {
        fontFamily: "DotGothic16",
        fontSize: "24px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8,
        align: "center",
      })
      .setOrigin(0.5)
      .setScrollFactor(0, 0);

    const burnableTiles = [1, 5, 6];
    const damagedTiles = [5, 6];

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
          }
          let leftTile = this.tileLayer.getTileAt(tile.x - 1, tile.y);
          let rightTile = this.tileLayer.getTileAt(tile.x + 1, tile.y);
          let topTile = this.tileLayer.getTileAt(tile.x, tile.y - 1);
          let bottomTile = this.tileLayer.getTileAt(tile.x, tile.y + 1);

          if (leftTile && burnableTiles.indexOf(leftTile.index) >= 0) {
            if (damagedTiles.indexOf(leftTile.index) >= 0) {
              this.damageLevel += 1;
              this.damage_level.width =
                (this.damageLevel / this.maxDamageLevel) * 200;
            }
            leftTile.index = 2;
          }

          if (rightTile && burnableTiles.indexOf(rightTile.index) >= 0) {
            if (damagedTiles.indexOf(rightTile.index) >= 0) {
              this.damageLevel += 1;
              this.damage_level.width =
                (this.damageLevel / this.maxDamageLevel) * 200;
            }
            rightTile.index = 2;
          }

          if (topTile && burnableTiles.indexOf(topTile.index) >= 0) {
            if (damagedTiles.indexOf(topTile.index) >= 0) {
              this.damageLevel += 1;
              this.damage_level.width =
                (this.damageLevel / this.maxDamageLevel) * 200;
            }
            topTile.index = 2;
          }

          if (bottomTile && burnableTiles.indexOf(bottomTile.index) >= 0) {
            if (damagedTiles.indexOf(bottomTile.index) >= 0) {
              this.damageLevel += 1;
              this.damage_level.width =
                (this.damageLevel / this.maxDamageLevel) * 200;
            }
            bottomTile.index = 2;
          }
        });
    });

    this.time.delayedCall(1000, () => {
      this.events.emit("fire");
      this.events.emit("fire");
    });

    this.maxDamageLevel = this.tileLayer.filterTiles(
      (t: Tilemaps.Tile) => t.index === 5 || t.index === 6
    ).length;
  }

  waterLevel = 0;
  maxWaterLevel = 200;

  damageLevel = 0;
  maxDamageLevel = 1;

  fireCounterSpeed = 600;
  fireCounter = 0;

  martinDirection = Math.Vector2.DOWN.clone();
  martinVelocity = new Math.Vector2(0, 0);
  martinAcceleration = new Math.Vector2(0, 0);

  update() {
    this.martin.x += this.martinVelocity.x;
    this.martin.y += this.martinVelocity.y;

    if (this.key_a.isDown) {
      this.martinDirection.rotate(-1 / 50);
      this.martinVelocity.rotate(-1 / 50);
    } else if (this.key_d.isDown) {
      this.martinDirection.rotate(1 / 50);
      this.martinVelocity.rotate(1 / 50);
    }

    if (this.key_w.isDown) {
      this.martinAcceleration = this.martinDirection.clone().scale(0.1);
    } else {
      this.martinAcceleration = new Math.Vector2(0, 0);
    }

    this.martinVelocity.add(this.martinAcceleration);
    this.martinVelocity.limit(1.5);

    // Convert martinDirection to degrees
    const degrees = Phaser.Math.RadToDeg(
      Phaser.Math.Angle.Between(
        0,
        0,
        this.martinDirection.x,
        this.martinDirection.y
      )
    );

    this.martin.rotation = Phaser.Math.DegToRad(degrees - 90);

    this.fireCounter -= 1;
    if (this.fireCounter <= 0) {
      this.fireCounter = this.fireCounterSpeed;
      this.events.emit("fire");
    }

    if (
      this.space_key.isDown &&
      this.waterLevel > 5 &&
      this.tileLayer.getTileAtWorldXY(
        this.martin.x,
        this.martin.y,
        true,
        this.camera
      )?.index !== 3
    ) {
      this.waterLevel -= 3;
      this.waterLevel = Math.Clamp(this.waterLevel, 1, this.maxWaterLevel);
      this.water_level.width = this.waterLevel;

      this.tileLayer
        .getTilesWithinWorldXY(
          this.martin.x,
          this.martin.y,
          24,
          24,
          {},
          this.camera
        )
        .filter((t: Tilemaps.Tile) => t.index === 2)
        .forEach((t: Tilemaps.Tile) => {
          this.tileLayer.putTileAt(1, t.x, t.y);
        });
    }

    if (
      this.space_key.isDown &&
      this.tileLayer.getTileAtWorldXY(
        this.martin.x,
        this.martin.y,
        true,
        this.camera
      )?.index === 3
    ) {
      this.waterLevel += 5;
      this.waterLevel = Math.Clamp(this.waterLevel, 1, this.maxWaterLevel);
      this.water_level.width = this.waterLevel;
    }
  }
}
