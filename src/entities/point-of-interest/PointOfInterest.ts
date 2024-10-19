import { RESOURCES } from "../../assets";
import { GameScene } from "../../scenes/game-scene";
import { GameMap } from "../maps/GameMap";

export class PointOfInterest {
  scene: GameScene;
  map: GameMap;

  name: string;
  timeout: number;

  image: Phaser.GameObjects.Image;
  legend: Phaser.GameObjects.Text;

  bar: Phaser.GameObjects.Rectangle;
  timer: Phaser.Time.TimerEvent;

  position: Phaser.Math.Vector2;
  coordinates: Phaser.Math.Vector2;

  constructor(
    scene: GameScene,
    map: GameMap,
    name: string,
    timeout: number,
    delay: number,
    x: number,
    y: number
  ) {
    this.scene = scene;
    this.map = map;

    this.name = name;
    this.position = new Phaser.Math.Vector2(x, y);
    this.coordinates = map.map.worldToTileXY(x, y)!;

    this.image = this.scene.add.image(x, y, RESOURCES["water-dial"]);

    this.image.setRotation(Math.PI / 2);
    this.image.setScale(0.25, 1);

    this.legend = this.scene.add
      .text(x, y, name, {
        fontSize: "16px",
        color: "#fff",
      })
      .setOrigin(0.5, 1);

    this.timeout = timeout;

    // Start the timer
    this.scene.time.delayedCall(delay * 1000, () => {
      // Create a horizontal bar
      this.scene.add.rectangle(x, y - 26, 52, 5, 0xaaaaa).setOrigin(0.5, 0);
      this.scene.add.rectangle(x, y - 25, 50, 3, 0x333333).setOrigin(0.5, 0);
      this.bar = this.scene.add.rectangle(x - 25, y - 25, 0, 3, 0xffffff);
      this.bar.setOrigin(0.5, 0);

      this.timer = this.scene.time.addEvent({
        delay: this.timeout * 1000,
        callback: this.onTimerComplete,
        callbackScope: this,
      });
    });

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
    this.image.setTint(0x00ff00);
    this.scene.events.off("update", this.updateBar, this);
  }
}
