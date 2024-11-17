import { GameStateManager } from "@game/state/game-state";
import { JSXScene } from ".";

export class SummaryScene extends JSXScene {
  constructor() {
    super("Summary");
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

    const poi = (
      <text
        x={width / 2}
        y={height / 2 - 100}
        text={`${run?.poi.length} POI`}
      />
    );
    this.add.existing(poi);

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
      this.scene.start("Game");
    });
  }
}
