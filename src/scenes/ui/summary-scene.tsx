import { AbstractScene } from "..";
import { Stack } from "../../ui/components/Stack";
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

    const poi = run?.poi || [];

    const stack = (
      <Stack direction="vertical" spacing={10} x={800} y={100}>
        {poi.map((item) => (
          <container width={100} height={50}>
            <rectangle
              origin={0}
              width={100}
              height={50}
              strokeColor={
                Phaser.Display.Color.HexStringToColor("#ffffff").color
              }
            />
            <text x={0} y={0} text={item.name} />
          </container>
        ))}
      </Stack>
    );

    this.add.existing(stack);

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
