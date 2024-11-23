import { GAME_HEIGHT, GAME_WIDTH } from "@game/consts";
import { computed, signal } from "@game/state/lib/signals";
import { AbstractScene } from "..";
import {
  createTransitionSignal,
  Repeat,
  Transition,
} from "../../ui/animation/animation";
import { Stack } from "../../ui/components/Stack";
import { SCENES } from "../consts";
import { VEHICLES, VehicleType } from "@game/entities/vehicles/index";
import { MAPS, MapType } from "@game/entities/maps/index";

export class HomeScene extends AbstractScene {
  constructor() {
    super(SCENES.UI_HOME);
  }

  create() {
    const runConfiguration = this.gameState.getEmptyRun();

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

    const selectedPlane = signal<number | undefined>(undefined);

    const white = Phaser.Display.Color.HexStringToColor("#ffffff").color;
    const black = Phaser.Display.Color.HexStringToColor("#000000").color;

    const planeSelector = (
      <Stack direction="vertical" spacing={10} x={800} y={100}>
        {Object.keys(VEHICLES).map((vehicle, index) => (
          <container
            width={200}
            height={30}
            interactive
            onPointerdown={() => {
              selectedPlane.set(index);
              runConfiguration.vehicle = vehicle as VehicleType;
            }}
          >
            <rectangle
              width={200}
              height={30}
              fillColor={computed(() =>
                selectedPlane.get() === index ? white : black
              )}
            />
            <text
              text={vehicle}
              x={0}
              y={0}
              origin={0.5}
              style={computed(() => ({
                color: selectedPlane.get() === index ? "#000000" : "#ffffff",
              }))}
            />
          </container>
        ))}
      </Stack>
    );

    this.add.existing(planeSelector);

    const selectedMap = signal<number | undefined>(undefined);

    const mapSelector = (
      <Stack direction="vertical" spacing={10} x={300} y={100}>
        {Object.keys(MAPS).map((map, index) => (
          <container
            width={200}
            height={30}
            interactive
            onPointerdown={() => {
              selectedMap.set(index);
              runConfiguration.map = map as MapType;
            }}
          >
            <rectangle
              width={200}
              height={30}
              fillColor={computed(() =>
                selectedMap.get() === index ? white : black
              )}
            />
            <text
              text={map}
              x={0}
              y={0}
              origin={0.5}
              style={computed(() => ({
                color: selectedMap.get() === index ? "#000000" : "#ffffff",
              }))}
            />
          </container>
        ))}
      </Stack>
    );

    this.add.existing(mapSelector);

    const startButtonEnabled = computed(
      () => selectedPlane.get() !== undefined && selectedMap.get() !== undefined
    );

    const startButton = (
      <container
        x={GAME_WIDTH / 2}
        y={GAME_HEIGHT / 2}
        width={200}
        height={100}
        interactive={startButtonEnabled}
        onPointerdown={() => {
          this.gameState.startRun(runConfiguration);
          this.scene.start(SCENES.MAP);
        }}
      >
        <rectangle
          x={0}
          y={0}
          width={200}
          height={100}
          fillColor={computed(() => (startButtonEnabled.get() ? white : black))}
        />
        <text
          text="Start"
          x={0}
          y={0}
          origin={0.5}
          style={computed(() => ({
            color: startButtonEnabled.get() ? "#000000" : "#ffffff",
            fontSize: "24px",
            fontFamily: "DotGothic16",
          }))}
        />
      </container>
    );

    this.add.existing(startButton);
  }

  shutdown() {}
}
