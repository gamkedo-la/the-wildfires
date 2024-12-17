import { TEXT_STYLE } from "@game/consts";
import { AbstractScene } from "..";
import { SCENES } from "../consts";

export class PauseScene extends AbstractScene {
  constructor() {
    super(SCENES.UI_PAUSE);
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

    this.add
      .text(width / 2, height / 2 - 50, "Paused", {
        ...TEXT_STYLE,
        fontSize: "64px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    const resumeButton = this.add
      .text(width / 2, height / 2 + 100, "Resume", {
        ...TEXT_STYLE,
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setInteractive();

    resumeButton.on("pointerdown", () => this.resumeGame());
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
