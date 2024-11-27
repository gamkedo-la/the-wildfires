import { RESOURCES } from "@game/assets";
import { TEXT_STYLE } from "@game/consts";
import { END_REASONS } from "@game/state/game-state";
import { AbstractScene } from "..";
import { POI_STATE } from "../../entities/point-of-interest/PointOfInterest";
import { Parallel, Sequence, Step } from "../../ui/animation/animation";
import { Stack } from "../../ui/components/Stack";
import { SCENES } from "../consts";

export class SummaryScene extends AbstractScene {
  constructor() {
    super(SCENES.UI_SUMMARY);
  }

  create() {
    const run = this.gameState.currentRun.get();
    const poi = run?.poi || [];

    this.add.existing(
      <text
        x={100}
        y={100}
        text={`${
          run?.endReason === END_REASONS.POI_SAVED
            ? "Everyone is safe!"
            : run?.endReason === END_REASONS.POI_DESTROYED
            ? "Disaster!"
            : "Fire extinguished!"
        }`}
        style={{
          ...TEXT_STYLE,
          fontSize: "48px",
          color:
            run?.endReason === END_REASONS.POI_DESTROYED
              ? "#ffbbbb"
              : "#bbffbb",
        }}
      />
    );

    const poiList = poi.map((item) => (
      <container width={200} height={80} visible={false} scale={1.5}>
        <nineslice
          texture={RESOURCES["poi-results-nine-slice"]}
          origin={0}
          width={100}
          height={40}
          scale={2}
          leftWidth={7}
          rightWidth={7}
          topHeight={16}
          bottomHeight={6}
          tint={
            item.finalState.get() === POI_STATE.SAVED
              ? 0xbbffbb
              : item.finalState.get() === POI_STATE.DAMAGED
              ? 0xffbbbb
              : 0xffffbb
          }
        />
        <Stack direction="vertical" spacing={10} x={10} y={0}>
          <container width={20} height={20}>
            <image
              texture={RESOURCES["poi-status-icons"]}
              frame={
                item.finalState.get() === POI_STATE.SAVED
                  ? 1
                  : item.finalState.get() === POI_STATE.DAMAGED
                  ? 0
                  : 2
              }
              x={10}
              y={5}
              width={20}
              height={20}
            />
            <text
              x={25}
              y={0}
              text={item.name}
              style={{ ...TEXT_STYLE, fontSize: "16px", color: "#2a1d0d" }}
            />
          </container>
          <container width={200} height={30}>
            <container x={3} y={0} width={20} height={20}>
              <image
                texture={RESOURCES["poi-tiles-icons"]}
                x={20}
                y={5}
                width={20}
                height={20}
                frame={0}
              />
              <text
                x={40}
                y={0}
                text={item.savedTiles.get().toString()}
                style={{
                  ...TEXT_STYLE,
                  fontSize: "16px",
                  color: "#2a1d0d",
                }}
              />
              <image
                texture={RESOURCES["poi-tiles-icons"]}
                x={80}
                y={5}
                width={20}
                height={20}
                frame={1}
              />
              <text
                x={98}
                y={0}
                text={item.damagedTiles.get().toString()}
                style={{
                  ...TEXT_STYLE,
                  fontSize: "16px",
                  color: "#2a1d0d",
                }}
              />
              <image
                texture={RESOURCES["poi-tiles-icons"]}
                x={135}
                y={5}
                width={20}
                height={20}
                frame={2}
              />
              <text
                x={150}
                y={0}
                text={`${item.maxTiles.get()}`}
                style={{
                  ...TEXT_STYLE,
                  fontSize: "16px",
                  color: "#2a1d0d",
                }}
              />
            </container>
          </container>
        </Stack>
      </container>
    ));

    this.animationEngine.run(
      <Sequence>
        {poiList.map((item) => (
          <Parallel>
            <Step
              duration={100}
              action={() =>
                this.tweens.add({ targets: item, scale: 1, duration: 100 })
              }
            />
            <Step duration={200} action={() => item.setVisible(true)} />
          </Parallel>
        ))}
      </Sequence>
    );

    const stack = (
      <Stack direction="vertical" spacing={10} x={640} y={20}>
        {poiList}
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
          this.scene.stop(SCENES.MAP);
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
