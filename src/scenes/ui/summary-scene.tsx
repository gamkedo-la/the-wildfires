import { RESOURCES } from "@game/assets";
import { TEXT_STYLE } from "@game/consts";
import { END_REASONS } from "@game/state/game-state";
import { AbstractScene } from "..";
import { Parallel, Sequence, Step } from "../../ui/animation/animation";
import { Stack } from "../../ui/components/Stack";
import { SCENES } from "../consts";
import { PointOfInterestBadge } from "./components/PointOfInterestBadge";
import { POI_STATE } from "../../entities/point-of-interest/PointOfInterest";

export class SummaryScene extends AbstractScene {
  constructor() {
    super(SCENES.UI_SUMMARY);
  }

  backgroundMusic:
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.WebAudioSound;

  create() {
    const run = this.gameState.currentRun.get();
    const poi = run?.poi || [];

    const poiDamaged = poi.filter(
      (poi) =>
        poi.state.get() === POI_STATE.DAMAGED ||
        poi.state.get() === POI_STATE.PARTIALLY_SAVED
    ).length;

    const { width, height } = this.scale;

    this.backgroundMusic = this.sound.add(RESOURCES["menu-theme"], {
      volume: 0.5,
    });
    let completionMusic: string = RESOURCES["maps-success"];

    if (run?.endReason === END_REASONS.POI_DESTROYED) {
      completionMusic = RESOURCES["maps-failure"];
    }

    this.sound.play(completionMusic, {
      volume: 0.5,
    });

    this.time.addEvent({
      delay: 12000,
      callback: () => {
        if (this.scene.isActive(SCENES.UI_SUMMARY)) {
          this.backgroundMusic.play();
        }
      },
    });

    this.add.existing(
      <text
        x={50}
        y={260}
        text={
          run?.endReason === END_REASONS.POI_SAVED
            ? "Everyone is safe!"
            : run?.endReason === END_REASONS.POI_DESTROYED
            ? "Disaster!"
            : run?.endReason === END_REASONS.POI_SAVED_WITH_DAMAGE
            ? "Damage in the area!"
            : "Fire extinguished!"
        }
        style={{
          ...TEXT_STYLE,
          fontSize: "48px",
          color:
            run?.endReason === END_REASONS.POI_DESTROYED ||
            run?.endReason === END_REASONS.POI_SAVED_WITH_DAMAGE
              ? "#ffbbbb"
              : "#bbffbb",
        }}
      />
    );

    this.add.existing(
      <text
        text={`The mission took ${Math.floor(run?.time / 60)}m ${Math.floor(
          run?.time % 60
        )}s`}
        x={60}
        y={350}
        style={{ ...TEXT_STYLE, fontSize: "20px" }}
      />
    );

    this.add.existing(
      <text
        text={`The fire damaged ${poiDamaged === 0 ? "no" : poiDamaged} ${
          poiDamaged === 1 ? "place" : "places"
        }!`}
        x={60}
        y={380}
        style={{ ...TEXT_STYLE, fontSize: "20px" }}
      />
    );

    const poiList = poi.map((item) => (
      <PointOfInterestBadge
        item={item}
        x={100}
        y={100}
        scale={1.5}
        visible={false}
      />
    ));

    this.animationEngine.run(
      <Sequence>
        {poiList.map((item) => (
          <Parallel>
            <Step
              duration={50}
              action={() =>
                this.tweens.add({ targets: item, scale: 1, duration: 300 })
              }
            />
            <Step duration={60} action={() => item.setVisible(true)} />
          </Parallel>
        ))}
      </Sequence>
    );

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

    // TODO: Actual Vehicle?
    /*
    const vehicle = run?.vehicle;
    this.add.existing(
      <text
        text={`Vehicle ${vehicle}`}
        x={100}
        y={200}
        style={{ ...TEXT_STYLE, fontSize: "24px" }}
      />
    );

    const map = run?.map;
    this.add.existing(
      <text
        text={`Map ${map}`}
        x={100}
        y={250}
        style={{ ...TEXT_STYLE, fontSize: "24px" }}
      />
    );*/

    this.add.existing(
      <container
        x={150}
        y={500}
        width={200}
        height={80}
        interactive
        onPointerdown={() => {
          this.sound.play(RESOURCES["button"]);

          const run = this.gameState.currentRun.get();
          const runConfiguration = this.gameState.getEmptyRun();
          runConfiguration.map = run?.map;
          runConfiguration.vehicle = run?.vehicle;
          this.gameState.startRun(runConfiguration);

          this.scene.stop(SCENES.UI_SUMMARY);
          this.scene.start(SCENES.MAP);
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
          tint={0xbbffbb}
          height={40}
          leftWidth={4}
          rightWidth={4}
          topHeight={4}
          bottomHeight={5}
        />
        <text
          text={"Try again"}
          x={0}
          y={0}
          origin={0.5}
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
          this.sound.play(RESOURCES["button"]);

          this.scene.stop(SCENES.MAP);
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
          text={"Back to menu"}
          x={0}
          y={0}
          origin={0.5}
          style={{ ...TEXT_STYLE, fontSize: "24px", color: "#000000" }}
        />
      </container>
    );
  }

  shutdown() {
    this.backgroundMusic.stop();
    this.sound.stopByKey(RESOURCES["maps-success"]);
    this.sound.stopByKey(RESOURCES["maps-failure"]);
  }
}
