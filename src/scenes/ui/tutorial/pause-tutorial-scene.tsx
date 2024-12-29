import { RESOURCES } from "@game/assets";
import { TEXT_STYLE } from "@game/consts";
import { AbstractScene } from "../..";
import { SCENES } from "../../consts";
import { WaterDrop } from "./WaterDrop";
import { WaterCollection } from "./WaterCollection";
import { Directions } from "./Directions";
import { RetardantDrop } from "./RetardantDrop";
import { PoiStatuses } from "./PoiStatuses";
import { FireVelocity } from "./FireVelocity";

export class PauseTutorialScene extends AbstractScene {
  constructor() {
    super(SCENES.UI_PAUSE_TUTORIAL);
  }

  key_esc!: Phaser.Input.Keyboard.Key;
  key_p!: Phaser.Input.Keyboard.Key;

  create() {
    this.key_esc = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    );
    this.key_p = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.P);

    const { width, height } = this.scale;

    this.add.rectangle(0, 0, width, height, 0x000000, 0.6).setOrigin(0);

    this.add.existing(
      <nineslice
        texture={RESOURCES["key-nine-slice"]}
        frame={0}
        originX={0.5}
        scale={2}
        x={width / 2}
        y={height - 80}
        width={100}
        height={40}
        leftWidth={4}
        rightWidth={4}
        topHeight={4}
        bottomHeight={5}
        interactive={true}
        onPointerdown={() => this.resumeGame()}
      />
    );

    const resumeButton = this.add
      .text(width / 2, height - 83, "Resume", {
        ...TEXT_STYLE,
        fontSize: "24px",
        color: "#000000",
      })
      .setOrigin(0.5)
      .setInteractive();

    resumeButton.on("pointerdown", () => this.resumeGame());

    this.add.existing(
      <text
        x={width / 2}
        originX={0.5}
        y={30}
        text="How to play"
        style={{ ...TEXT_STYLE, fontSize: "30px", color: "#ffffff" }}
      />
    );

    this.add.existing(<WaterCollection x={-1} y={80} scene={this} />);
    this.add.existing(
      <WaterDrop x={this.scale.width / 3} y={80} scene={this} />
    );
    this.add.existing(
      <RetardantDrop x={(2 * this.scale.width) / 3} y={80} scene={this} />
    );

    //x={this.scale.width / 2 - this.scale.width / 6}
    this.add.existing(<Directions x={0} y={450} scene={this} />);

    this.add.existing(
      <PoiStatuses x={this.scale.width / 2} y={380} scene={this} />
    );

    this.add.existing(
      <FireVelocity x={(2 * this.scale.width) / 3} y={380} scene={this} />
    );
  }

  update(time: number, delta: number) {
    if (this.key_esc.isDown || Phaser.Input.Keyboard.JustDown(this.key_p)) {
      this.resumeGame();
    }
  }

  resumeGame() {
    this.scene.resume(SCENES.MAP);
    this.scene.stop();
  }

  shutdown() {}
}
