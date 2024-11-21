import { GAME_HEIGHT, GAME_WIDTH } from "@game/consts";
import { SCENES } from "../consts";
import { AbstractScene } from "..";
import {
  createTransitionSignal,
  Parallel,
  Repeat,
  Sequence,
  Transition,
} from "../../ui/animation/animation";
import { computed } from "@game/state/lib/signals";
import { Stack } from "../../ui/components/Stack";

export class HomeScene extends AbstractScene {
  constructor() {
    super(SCENES.UI_HOME);
  }

  create() {
    const angle = createTransitionSignal(0);
    const radius = 250;
    const speed = 5000; // 2 seconds per rotation

    const canadair = (
      <image
        x={computed(
          () =>
            GAME_WIDTH / 2 +
            Math.cos(Phaser.Math.DegToRad(angle.get())) * radius
        )}
        y={computed(
          () =>
            GAME_HEIGHT / 2 +
            Math.sin(Phaser.Math.DegToRad(angle.get())) * radius
        )}
        texture="canadair-spritesheet"
        frame="4"
        angle={angle}
      />
    );

    this.add.existing(canadair);

    this.animationEngine.run(
      <Repeat times={100}>
        <Transition
          signal={angle}
          from={0}
          to={360}
          ease="linear"
          duration={speed}
        />
      </Repeat>
    );

    const startButton = (
      <container
        x={GAME_WIDTH / 2}
        y={GAME_HEIGHT / 2}
        width={200}
        height={100}
        interactive
        onPointerdown={() => {
          this.scene.start(SCENES.MAP);
        }}
      >
        <rectangle
          x={0}
          y={0}
          width={200}
          height={100}
          fillColor={Phaser.Display.Color.HexStringToColor("#ffffff").color}
        />
        <text
          text="Start"
          x={0}
          y={0}
          origin={0.5}
          style={{
            color: "#000000",
            fontSize: "24px",
            fontFamily: "DotGothic16",
          }}
        />
      </container>
    );

    this.add.existing(startButton);
  }

  shutdown() {}
}
