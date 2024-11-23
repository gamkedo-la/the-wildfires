import { TEXT_STYLE } from "@game/consts";
import { AbstractScene } from "..";
import { Stack } from "../../ui/components/Stack";
import { SCENES } from "../consts";

export class SummaryScene extends AbstractScene {
  constructor() {
    super(SCENES.UI_SUMMARY);
  }

  create() {
    const { width, height } = this.scale;

    const title = (
      <text
        x={100}
        y={height / 2 - 50}
        text="Game ended"
        style={{ ...TEXT_STYLE, fontSize: "64px", color: "#ffffff" }}
      />
    );
    this.add.existing(title);

    const run = this.gameState.currentRun.get();

    const poi = run?.poi || [];

    this.add.existing(
      <text
        text={`Points of interest`}
        x={600}
        y={20}
        style={{ ...TEXT_STYLE }}
      />
    );

    const stack = (
      <Stack direction="vertical" spacing={10} x={600} y={50}>
        {poi.map((item) => (
          <container width={200} height={100}>
            <rectangle
              origin={0}
              width={200}
              height={100}
              strokeColor={
                Phaser.Display.Color.HexStringToColor("#ffffff").color
              }
            />
            <Stack direction="vertical" spacing={10} x={10} y={10}>
              <text x={10} y={10} text={item.name} />
              {/* not sure what these numbers are being set to */}
              <text
                x={10}
                y={30}
                text={`${item.savedTiles.get()} / ${item.damagedTiles.get()}`}
              />
              <text
                x={10}
                y={50}
                text={`${item.tilesLeft.get()} / ${item.maxTiles.get()}`}
              />
            </Stack>
          </container>
        ))}
      </Stack>
    );

    this.add.existing(stack);

    // TODO: Actual Vehicle?
    const vehicle = run?.vehicle;
    this.add.existing(
      <text
        text={`Vehicle ${vehicle}`}
        x={100}
        y={200}
        style={{ ...TEXT_STYLE }}
      />
    );

    const map = run?.map;
    this.add.existing(
      <text text={`Map ${map}`} x={100} y={250} style={{ ...TEXT_STYLE }} />
    );

    this.add.existing(
      <container
        x={200}
        y={500}
        width={200}
        height={80}
        interactive
        onPointerdown={() => {
          this.scene.start(SCENES.UI_HOME);
        }}
      >
        <rectangle width={200} height={80} fillColor={0xffffff} />
        <text
          text={"Try again"}
          x={0}
          y={0}
          origin={0.5}
          style={{ ...TEXT_STYLE, color: "#000000" }}
        />
      </container>
    );
  }

  shutdown() {}
}
