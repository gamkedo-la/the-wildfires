import { TEXT_STYLE } from "@game/consts";
import { AbstractScene } from "..";
import { SCENES } from "../consts";
import { PointOfInterestBadge } from "./components/PointOfInterestBadge";
import { END_REASONS } from "@game/state/game-state";
import { RESOURCES } from "@game/assets";
import { Stack } from "../../ui/components/Stack";

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

    const run = this.gameState.currentRun.get();
    const poi = run?.poi || [];

    this.add.existing(
      <text
        x={50}
        y={260}
        text="Paused"
        resolution={2}
        style={{
          ...TEXT_STYLE,
          fontSize: "48px",
        }}
      />
    );

    const poiList = poi.map((item) => (
      <PointOfInterestBadge item={item} x={100} y={100} />
    ));

    this.add.existing(
      <Stack
        direction="vertical"
        spacing={10}
        x={550}
        y={height / 2 - (poiList.length / 2) * 40}
      >
        {poiList.slice(0, poiList.length / 2)}
      </Stack>
    );

    this.add.existing(
      <Stack
        direction="vertical"
        spacing={10}
        x={770}
        y={height / 2 - (poiList.length / 2) * 40}
      >
        {poiList.slice(poiList.length / 2)}
      </Stack>
    );

    this.add.existing(
      <container
        x={150}
        y={500}
        width={200}
        height={80}
        interactive
        onPointerdown={() => {
          this.resumeGame();
        }}
      >
        <nineslice
          texture={RESOURCES["key-nine-slice"]}
          frame={0}
          originX={0.5}
          scale={2}
          x={0}
          y={0}
          width={100}
          height={40}
          leftWidth={4}
          rightWidth={4}
          topHeight={4}
          bottomHeight={5}
        />
        <text
          text={"Resume game"}
          x={0}
          y={0}
          origin={0.5}
          resolution={2}
          style={{ ...TEXT_STYLE, fontSize: "24px", color: "#000000" }}
        />
      </container>
    );

    this.add.existing(
      <container
        x={370}
        y={500}
        width={200}
        height={80}
        interactive
        onPointerdown={() => {
          this.scene.stop(SCENES.MAP);
          this.gameState.endRun(END_REASONS.CANCELLED);
          this.scene.start(SCENES.UI_HOME);
        }}
      >
        <nineslice
          texture={RESOURCES["key-nine-slice"]}
          frame={0}
          originX={0.5}
          scale={2}
          x={0}
          y={0}
          width={100}
          tint={0xffffff}
          height={40}
          leftWidth={4}
          rightWidth={4}
          topHeight={4}
          bottomHeight={5}
        />
        <text
          text={"Main menu"}
          x={0}
          y={0}
          origin={0.5}
          resolution={2}
          style={{ ...TEXT_STYLE, fontSize: "24px", color: "#000000" }}
        />
      </container>
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
