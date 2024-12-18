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

    this.add.rectangle(0, 0, width, height, 0x000000, 0.75).setOrigin(0);

    this.add.existing(
      <nineslice
        texture={RESOURCES["key-nine-slice"]}
        frame={0}
        originX={0.5}
        scale={2}
        x={width / 2}
        y={height - 90}
        width={100}
        tint={0x00ff00}
        height={50}
        leftWidth={4}
        rightWidth={4}
        topHeight={4}
        bottomHeight={5}
        interactive={true}
        onPointerdown={() => this.startGame()}
      />
    );

    const resumeButton = this.add
      .text(width / 2, height - 90, "START", {
        ...TEXT_STYLE,
        fontSize: "42px",
      })
      .setOrigin(0.5)
      .setInteractive();

    resumeButton.on("pointerdown", () => this.startGame());

    this.add.existing(
      <text x={40} y={30} text="How to play" style={TEXT_STYLE} />
    );

    this.add.existing(<WaterCollection x={-1} y={50} scene={this} />);
    this.add.existing(
      <WaterDrop x={this.scale.width / 3} y={50} scene={this} />
    );
    this.add.existing(
      <RetardantDrop x={(2 * this.scale.width) / 3} y={50} scene={this} />
    );

    //x={this.scale.width / 2 - this.scale.width / 6}
    this.add.existing(<Directions x={0} y={380} scene={this} />);

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
    this.scene.start(SCENES.MAP);
  }

  shutdown() {}
}
