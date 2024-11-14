import { RESOURCES } from "../../assets";
import { GameScene } from "../../scenes/game-scene";
import { GameMap } from "../maps/GameMap";

export class PointOfInterest {
  scene: GameScene;
  map: GameMap;

  name: string;
  timeout: number;

  legend: Phaser.GameObjects.Text;

  bar: Phaser.GameObjects.Rectangle;
  timer: Phaser.Time.TimerEvent;

  pinNumber: number;

  position: Phaser.Math.Vector2;
  coordinates: Phaser.Math.Vector2;

  constructor(
    scene: GameScene,
    map: GameMap,
    name: string,
    timeout: number,
    delay: number,
    pinNumber: number,
    x: number,
    y: number
  ) {
    this.scene = scene;
    this.map = map;
    this.pinNumber = pinNumber;

    x = Math.floor(x);
    y = Math.floor(y);

    this.name = name;
    this.position = new Phaser.Math.Vector2(x, y);
    this.coordinates = map.map.worldToTileXY(x, y)!;

    // 4

    this.scene.add.rectangle(x, y + 4, 55, 6, 0x333333).setOrigin(0.5, 0);
    // Create a horizontal bar
    this.bar = this.scene.add.rectangle(x - 25, y + 4, 0, 6, 0xffffff);
    this.bar.setOrigin(0.5, 0);

    // Start the timer
    this.scene.time.delayedCall(delay * 1000, () => {
      this.timer = this.scene.time.addEvent({
        delay: this.timeout * 1000,
        callback: this.onTimerComplete,
        callbackScope: this,
      });
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
        end: 7,
      }),
      frameRate: 16,
    });

    this.scene.anims.create({
      key: "pin-flash",
      frames: this.scene.anims.generateFrameNumbers("pin-spritesheet", {
        start: 7,
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

    this.scene.time.delayedCall(100 * pinNumber, () => {
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

    this.timeout = timeout;

    // Update the bar every frame
    this.scene.events.on("update", this.updateBar, this);
  }

  updateBar() {
    if (!this.timer) return;
    const progress = this.timer.getProgress();
    const width = 50 * progress; // Adjust 50 to change the max width of the bar
    this.bar.width = width;

    // Gradually change color from white to green
    const color = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(0xffffff),
      Phaser.Display.Color.ValueToColor(0x00ff00),
      100,
      progress * 100
    );
    this.bar.fillColor = Phaser.Display.Color.GetColor(
      color.r,
      color.g,
      color.b
    );
  }

  onTimerComplete() {
    this.scene.events.off("update", this.updateBar, this);
  }
}
