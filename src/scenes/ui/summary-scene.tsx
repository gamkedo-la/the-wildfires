import { AbstractScene } from "..";
import { SCENES } from "../consts";

export class SummaryScene extends AbstractScene {
  constructor() {
    super(SCENES.UI_SUMMARY);
  }

  key_esc!: Phaser.Input.Keyboard.Key;
  key_p!: Phaser.Input.Keyboard.Key;

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(0, 0, width, height, 0x000000, 0.5).setOrigin(0);

    this.add
      .text(width / 2, height / 2 - 50, "End!", {
        fontSize: "64px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    const run = this.gameState.currentRun.get();

    // TODO: Vehicle
    // TODO: Map

    const restartButton = this.add
      .text(width / 2, height / 2 + 50, "Restart", {
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setInteractive();

    restartButton.on("pointerdown", () => {
      this.scene.start(SCENES.UI_HOME);
    });
  }

  shutdown() {}
}
