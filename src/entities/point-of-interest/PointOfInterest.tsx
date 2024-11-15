import { computed, signal } from "@game/state/lib/signals";
import { RESOURCES } from "../../assets";
import { GameScene } from "../../scenes/game-scene";
import { GameMap } from "../maps/GameMap";
import { Signal } from "@game/state/lib/types";

export class PointOfInterest {
  scene: GameScene;
  map: GameMap;

  id: number;
  name: string;
  timeout: number;

  legend: Phaser.GameObjects.Text;

  timer: Phaser.Time.TimerEvent;

  position: Phaser.Math.Vector2;
  coordinates: Phaser.Math.Vector2;

  maxTiles: Signal<number> = signal(1);
  tilesLeft: Signal<number> = signal(0);
  savedTiles: Signal<number> = signal(0);
  damagedTiles: Signal<number> = signal(0);

  constructor(
    scene: GameScene,
    map: GameMap,
    id: number,
    name: string,
    timeout: number,
    delay: number,
    x: number,
    y: number
  ) {
    this.scene = scene;
    this.map = map;
    this.id = id;

    x = Math.floor(x);
    // TODO: magic number
    y = Math.floor(y - 25);

    this.name = name;
    this.position = new Phaser.Math.Vector2(x, y);
    this.coordinates = map.map.worldToTileXY(x, y)!;

    // TODO: magic number
    const maxWidth = 53;

    // TODO: Fix colors
    const background = this.scene.add
      .rectangle(x, y + 4, maxWidth, 6, 0xffffff)
      .setOrigin(0.5, 0);

    const savedHealthBar = (
      <rectangle
        x={x - maxWidth / 2}
        y={y + 4}
        width={computed(
          () => (this.savedTiles.get() / this.maxTiles.get()) * maxWidth
        )}
        height={6}
        fillColor={0x00ff00}
      />
    );
    this.scene.add.existing(savedHealthBar);
    savedHealthBar.setOrigin(0.5, 0);

    const damageBar: Phaser.GameObjects.Rectangle = (
      <rectangle
        x={computed(
          () =>
            x +
            maxWidth / 2 -
            (this.damagedTiles.get() / this.maxTiles.get()) * maxWidth
        )}
        y={y + 4}
        width={computed(
          () => (this.damagedTiles.get() / this.maxTiles.get()) * maxWidth
        )}
        height={6}
        fillColor={0xff0000}
      />
    );
    this.scene.add.existing(damageBar);
    damageBar.setOrigin(0.5, 0);

    // TODO: Fix this on the map file. This is now how much one tile takes to be saved
    this.timeout = 5;

    this.timer = this.scene.time.addEvent({
      delay: this.timeout * 1000,
      callback: () => {
        this.saveTile();
      },
      callbackScope: this,
      paused: true,
    });

    // Start the timer
    this.scene.time.delayedCall(delay * 1000, () => {
      this.timer.paused = false;
    });

    const pin: Phaser.GameObjects.Sprite = (
      <sprite
        x={x}
        y={y}
        texture={RESOURCES["pin"]}
        frame={0}
        interactive={true}
        onPointerover={() => {
          pin.play("pin-flash");
          this.legend.setVisible(true);
        }}
        onPointerout={() => {
          pin.play("pin-hide");
          this.legend.setVisible(false);
        }}
      />
    );

    this.scene.add.existing(pin);

    this.scene.anims.create({
      key: "pin-hide",
      frames: this.scene.anims.generateFrameNumbers("pin-spritesheet", {
        start: 0,
        end: 6,
      }),
      frameRate: 16,
    });

    this.scene.anims.create({
      key: "pin-flash",
      frames: this.scene.anims.generateFrameNumbers("pin-spritesheet", {
        start: 6,
        end: 0,
      }),
      frameRate: 16,
    });

    pin.setVisible(false);

    this.legend = this.scene.add
      .text(x, y, name, {
        fontFamily: "DotGothic16",
        fontSize: "12px",
        color: "#36170c",
      })
      .setOrigin(0.5, 1.1)
      .setVisible(false);

    this.scene.time.delayedCall(100 * id, () => {
      pin.setVisible(true);
      pin.play("pin-flash");
      this.scene.time.delayedCall(300, () => {
        this.legend.setVisible(true);
      });
    });

    this.scene.time.delayedCall(2500, () => {
      this.legend.setVisible(false);
      pin.play("pin-hide");
    });
  }

  damageTile() {
    const damage = 1;

    if (this.tilesLeft.get() > 0) {
      this.tilesLeft.update((value) => value - damage);
      this.damagedTiles.update((value) => value + damage);
      this.legend.setText(`${this.maxTiles.get() - this.damagedTiles.get()}%`);
    }
  }

  saveTile() {
    if (this.tilesLeft.get() > 0) {
      this.tilesLeft.update((value) => value - 1);
      this.savedTiles.update((value) => value + 1);
    }
  }

  addTileCount(count: number) {
    this.tilesLeft.update((value) => value + count);
  }

  setMaxTiles() {
    this.maxTiles.set(this.tilesLeft.get());
    this.timer.repeatCount = this.maxTiles.get();
  }
}
