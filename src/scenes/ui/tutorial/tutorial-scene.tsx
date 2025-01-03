import { RESOURCES } from "@game/assets";
import { TEXT_STYLE } from "@game/consts";
import { AbstractScene } from "../../";
import { SCENES } from "../../consts";
import { Directions } from "./Directions";
import { FireVelocity } from "./FireVelocity";
import { PoiStatuses } from "./PoiStatuses";
import { RetardantDrop } from "./RetardantDrop";
import { WaterCollection } from "./WaterCollection";
import { WaterDrop } from "./WaterDrop";

export class TutorialScene extends AbstractScene {
  constructor() {
    super(SCENES.UI_TUTORIAL);
  }

  key_enter!: Phaser.Input.Keyboard.Key;

  create() {
    this.key_enter = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.ENTER
    );

    const { width, height } = this.scale;

    this.add.rectangle(0, 0, width, height, 0x000000, 0.85).setOrigin(0);

    this.add.existing(
      <nineslice
        texture={RESOURCES["key-nine-slice"]}
        frame={0}
        originX={0.5}
        scale={2}
        x={width / 2}
        y={height - 80}
        width={100}
        tint={0xbbffbb}
        height={40}
        leftWidth={4}
        rightWidth={4}
        topHeight={4}
        bottomHeight={5}
        interactive={true}
        onPointerdown={() => this.startGame()}
      />
    );

    const resumeButton = this.add
      .text(width / 2, height - 83, "Preview mission", {
        ...TEXT_STYLE,
        fontSize: "22px",
        color: "#000000",
      })
      .setResolution(2)
      .setOrigin(0.5)
      .setInteractive();

    resumeButton.on("pointerdown", () => this.startGame());

    this.add.existing(
      <text
        x={width / 2}
        originX={0.5}
        y={30}
        resolution={2}
        text="How to play"
        style={{ ...TEXT_STYLE, fontSize: 30, color: "#ffffff" }}
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

  update(_time: number, _delta: number) {
    if (this.key_enter.isDown) {
      this.startGame();
    }
  }

  startGame() {
    this.scene.stop(SCENES.UI_HOME);
    this.scene.start(SCENES.UI_PREPLANNING);
  }

  shutdown() {}
}
