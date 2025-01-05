import { GAME_HEIGHT, GAME_WIDTH, TEXT_STYLE } from "@game/consts";
import { computed, signal } from "@game/state/lib/signals";
import { AbstractScene } from "..";
import {
  createTransitionSignal,
  Repeat,
  Sequence,
  Transition,
} from "../../ui/animation/animation";
import { Stack } from "../../ui/components/Stack";
import { SCENES } from "../consts";
import {
  VEHICLES,
  VehicleType,
  VehicleTypeLowercase,
} from "@game/entities/vehicles/index";
import { MAPS, MapType, MapWithProperties } from "@game/entities/maps/index";
import { RESOURCES } from "@game/assets";
import { Math as PMath } from "phaser";
import { CREDITS } from "@game/credits";

const NineSlices = ({
  x,
  y,
  width,
  height,
  ...props
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  [key: string]: any;
}) => {
  return (
    <nineslice
      texture={RESOURCES["key-nine-slice"]}
      frame={0}
      originX={0.5}
      x={x}
      y={y}
      width={width}
      height={height}
      leftWidth={4}
      rightWidth={4}
      topHeight={4}
      bottomHeight={5}
      {...props}
    />
  );
};

const VehicleSprite = ({
  vehicle,
  x,
  y,
  ...props
}: {
  vehicle: VehicleTypeLowercase;
  x: number;
  y: number;
  [key: string]: any;
}) => {
  return (
    <>
      <image
        texture={`${vehicle}-spritesheet`}
        frame={1}
        x={x}
        y={y}
        angle={-45}
        scale={0.33}
        {...props}
      />
      <image
        texture={`${vehicle}-outline`}
        tint={0x000000}
        frame={1}
        x={x}
        y={y}
        angle={-45}
        scale={0.33}
        {...props}
      />
    </>
  );
};

export class HomeScene extends AbstractScene {
  constructor() {
    super(SCENES.UI_HOME);
  }

  backgroundMusic!:
    | Phaser.Sound.WebAudioSound
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.HTML5AudioSound;

  animatedTiles: any[] = [];

  create() {
    const runConfiguration = this.gameState.getEmptyRun();

    const map = this.add.tilemap(RESOURCES["main-menu"]) as MapWithProperties;
    let fireTileId = map.properties.find((p) => p.name === "fireTileId")
      ?.value!;
    map.addTilesetImage("tilemap-large", RESOURCES["tilemap-test-3"], 24, 32);

    map.createLayer("map", "tilemap-large")!.setCullPadding(2, 2)!;
    map.createLayer("structures", "tilemap-large")!.setCullPadding(2, 2)!;
    const fireLayer = map.createLayer("fire", "tilemap-large")!;

    this.cameras.main.scrollX = -175;
    this.cameras.main.scrollY = +250;
    this.cameras.main.setZoom(2);

    //this.cameras.main.scrollY = -145;

    const tileData = map.tilesets[0].tileData as any;
    const firstgid = map.tilesets[0].firstgid;

    for (let tileid in tileData) {
      map.layers.forEach((layer) => {
        layer.data.forEach((tileRow) => {
          tileRow.forEach((tile) => {
            if (tile.index - map.tilesets[0].firstgid === parseInt(tileid)) {
              this.animatedTiles.push({
                tile,
                firstgid,
                tileAnimationData: (tileData as any)[tileid].animation,
                elapsedTime: 0,
              });
            }
          });
        });
      });
    }

    this.add.existing(
      <text
        text="THE WILDFIRES"
        x={330}
        y={600}
        origin={0.5}
        style={TEXT_STYLE}
      />
    );

    this.add.existing(
      <container width={100} height={30} x={330} y={750} scale={0.6}>
        <text
          text="Click to start"
          x={0}
          y={0}
          resolution={4}
          origin={0.5}
          style={{ ...TEXT_STYLE, fontSize: 16, color: "#ffffff" }}
        />
      </container>
    );

    let started = false;

    this.input.on("pointerdown", () => {
      if (!started) {
        started = true;
        this.tweens.add({
          targets: this.cameras.main,
          ease: "Cubic.easeInOut",
          scrollY: -145,
          duration: 3000,
        });
      }
    });

    fireLayer
      .filterTiles((t: Phaser.Tilemaps.Tile) => t.index === fireTileId)
      .flatMap((tile: Phaser.Tilemaps.Tile) => {
        const x = tile.pixelX;
        const y = tile.pixelY;
        const tint = [0x664433, 0x927e6a, 0xefd8a1, 0x927e6a];

        this.add.particles(0, 0, "smoke-spritesheet", {
          x: () => PMath.RND.between(x + 10, x + 20),
          y: () => PMath.RND.between(y + 10, y + 20),
          color: tint,
          frame: [0, 1, 2, 3],
          quantity: 1,
          angle: () => PMath.RND.between(-180, -90),
          speed: [5, 15],
          gravityX: -5,
          gravityY: -10,
          frequency: 25,
          lifespan: [2000, 3000],
        });
      });

    this.add.existing(
      <text
        text={"THE WILDFIRES"}
        x={110}
        y={95}
        origin={0}
        resolution={2}
        wordWrapWidth={260}
        style={{
          ...TEXT_STYLE,
          fontSize: 24,
          lineSpacing: 2,
        }}
      />
    );

    let vehiclesX = createTransitionSignal(-200);

    const showVehiclesDialog = (
      <Sequence>
        <Transition
          signal={vehiclesX}
          to={100}
          ease="Cubic.easeInOut"
          duration={1000}
        />
      </Sequence>
    );

    const hideVehiclesDialog = (
      <Sequence>
        <Transition
          signal={vehiclesX}
          to={-200}
          ease="Cubic.easeInOut"
          duration={1000}
        />
      </Sequence>
    );

    this.add.existing(
      <container
        x={160}
        y={143}
        width={100}
        height={25}
        interactive
        onPointerdown={() => {
          if (vehiclesX.get() > 90) {
            this.animationEngine.run(hideVehiclesDialog);
          } else if (vehiclesX.get() < -100) {
            this.animationEngine.run(hideCreditsDialog);
            this.animationEngine.run(showVehiclesDialog);
          }
        }}
        onPointerover={(self) => {
          self.first.tint = 0xaaffaa;
        }}
        onPointerout={(self) => {
          self.first.tint = 0xffffff;
        }}
      >
        <NineSlices x={0} y={0} width={200} height={50} scale={0.5} />
        <text
          text={"About vehicles"}
          x={0}
          y={0}
          origin={{ x: 0.5, y: 0.55 }}
          resolution={2}
          style={{ ...TEXT_STYLE, fontSize: 10, color: "#000000" }}
        />
      </container>
    );

    if (import.meta.env.VITE_DEBUG) {
      this.add.existing(
        <container width={280} height={210} x={vehiclesX} y={200}>
          <NineSlices x={0} y={0} width={280} height={210} origin={0} />
          <text
            text="Vehicles"
            x={60}
            y={0}
            origin={0.5}
            resolution={2}
            style={{
              ...TEXT_STYLE,
              fontSize: 24,
              color: "#efd8a1",
              stroke: "#000000",
              strokeThickness: 3,
            }}
          />
          <Stack direction="vertical" spacing={10} x={140} y={40}>
            {Object.keys(VEHICLES).map((vehicle, index) => (
              <container width={250} height={50}>
                <Stack x={-110} y={-20} direction="horizontal" spacing={25}>
                  <VehicleSprite
                    vehicle={vehicle.toLowerCase() as VehicleTypeLowercase}
                  />
                  <text
                    text={vehicle}
                    origin={0.5}
                    resolution={2}
                    style={{
                      ...TEXT_STYLE,
                      color: "#000000",
                      fontSize: 14,
                    }}
                  />
                  <text
                    text={VEHICLES[vehicle].model}
                    origin={{ x: 0.4, y: 0.5 }}
                    resolution={2}
                    style={{ ...TEXT_STYLE, fontSize: 8, color: "#000000" }}
                  />
                </Stack>
                <text
                  text={VEHICLES[vehicle].description}
                  x={-120}
                  y={-10}
                  origin={0}
                  resolution={2}
                  wordWrapWidth={260}
                  style={{
                    ...TEXT_STYLE,
                    fontSize: 11,
                    color: "#000000",
                    lineSpacing: 2,
                  }}
                />
              </container>
            ))}
          </Stack>
        </container>
      );
    }

    let creditsX = createTransitionSignal(-200);

    const showCreditsDialog = (
      <Sequence>
        <Transition
          signal={creditsX}
          to={100}
          ease="Cubic.easeInOut"
          duration={1000}
        />
      </Sequence>
    );

    const hideCreditsDialog = (
      <Sequence>
        <Transition
          signal={creditsX}
          to={-200}
          ease="Cubic.easeInOut"
          duration={1000}
        />
      </Sequence>
    );

    this.add.existing(
      <container
        x={160}
        y={173}
        width={100}
        height={25}
        interactive
        onPointerdown={() => {
          if (creditsX.get() > 90) {
            this.animationEngine.run(hideCreditsDialog);
          } else if (creditsX.get() < -100) {
            this.animationEngine.run(hideVehiclesDialog);
            this.animationEngine.run(showCreditsDialog);
          }
        }}
        onPointerover={(self) => {
          self.first.tint = 0xaaffaa;
        }}
        onPointerout={(self) => {
          self.first.tint = 0xffffff;
        }}
      >
        <NineSlices x={0} y={0} width={200} height={50} scale={0.5} />
        <text
          text={"Credits"}
          x={0}
          y={0}
          origin={{ x: 0.5, y: 0.55 }}
          resolution={2}
          style={{ ...TEXT_STYLE, fontSize: 10, color: "#000000" }}
        />
      </container>
    );

    this.add.existing(
      <container width={280} height={210} x={creditsX} y={200}>
        <NineSlices x={0} y={0} width={280} height={210} origin={0} />
        <text
          text="Credits"
          x={60}
          y={0}
          origin={0.5}
          resolution={2}
          style={{
            ...TEXT_STYLE,
            fontSize: 24,
            color: "#efd8a1",
            stroke: "#000000",
            strokeThickness: 3,
          }}
        />
        <Stack direction="vertical" spacing={10} x={140} y={40}>
          {Object.keys(CREDITS).map((credit, index) => (
            <container width={250} height={20}>
              <text
                x={0}
                y={0}
                text={credit}
                origin={0.5}
                resolution={2}
                style={{
                  ...TEXT_STYLE,
                  color: "#000000",
                  fontSize: 14,
                }}
              />
              <text
                x={0}
                y={10}
                text={CREDITS[credit]}
                origin={{ x: 0.4, y: 0.5 }}
                resolution={2}
                style={{ ...TEXT_STYLE, fontSize: 8, color: "#000000" }}
              />
            </container>
          ))}
        </Stack>
      </container>
    );

    this.add.existing(
      <container width={110} height={90} x={500} y={80}>
        <NineSlices
          x={0}
          y={0}
          width={110}
          height={90}
          origin={{ x: 0.5, y: 0 }}
        />
        <text
          text="Islands"
          x={0}
          y={0}
          origin={0.5}
          resolution={2}
          style={{
            ...TEXT_STYLE,
            fontSize: 16,
            color: "#efd8a1",
            stroke: "#000000",
            strokeThickness: 2,
          }}
        />
        <Stack direction="vertical" spacing={3} x={0} y={20}>
          {Object.keys(VEHICLES).map((vehicle, index) => (
            <container
              width={90}
              height={20}
              interactive
              onPointerdown={() => {
                runConfiguration.vehicle = vehicle as VehicleType;
                runConfiguration.map = "ARCHIPELAGO";
                runConfiguration.time = this.game.getTime();
                this.gameState.startRun(runConfiguration);
                this.scene.pause();
                this.scene.moveAbove(SCENES.UI_HOME, SCENES.UI_TUTORIAL);
                this.scene.launch(SCENES.UI_TUTORIAL);
              }}
              onPointerover={(self) => {
                self.first.tint = 0xaaffaa;
              }}
              onPointerout={(self) => {
                self.first.tint = 0xffffff;
              }}
            >
              <NineSlices x={0} y={0} width={180} height={40} scale={0.5} />
              <Stack x={-30} direction="horizontal" spacing={20}>
                <VehicleSprite
                  vehicle={vehicle.toLowerCase() as VehicleTypeLowercase}
                  x={0}
                  y={0}
                />
                <text
                  text={vehicle}
                  x={0}
                  y={0}
                  origin={0.5}
                  resolution={2}
                  style={{ ...TEXT_STYLE, color: "#000000", fontSize: 9 }}
                />
              </Stack>
            </container>
          ))}
        </Stack>
      </container>
    );

    this.add.existing(
      <container width={110} height={90} x={520} y={200}>
        <NineSlices
          x={0}
          y={0}
          width={110}
          height={90}
          origin={{ x: 0.5, y: 0 }}
        />
        <text
          text="Continent"
          x={0}
          y={0}
          origin={0.5}
          resolution={2}
          style={{
            ...TEXT_STYLE,
            color: "#efd8a1",
            fontSize: 16,
            stroke: "#000000",
            strokeThickness: 2,
          }}
        />
        <Stack direction="vertical" spacing={3} x={0} y={20}>
          {Object.keys(VEHICLES).map((vehicle, index) => (
            <container
              width={90}
              height={20}
              interactive
              onPointerdown={() => {
                runConfiguration.vehicle = vehicle as VehicleType;
                runConfiguration.map = "CONTINENTAL";
                runConfiguration.time = this.game.getTime();
                this.gameState.startRun(runConfiguration);
                this.scene.pause();
                this.scene.moveAbove(SCENES.UI_HOME, SCENES.UI_TUTORIAL);
                this.scene.launch(SCENES.UI_TUTORIAL);
              }}
              onPointerover={(self) => {
                self.first.tint = 0xaaffaa;
              }}
              onPointerout={(self) => {
                self.first.tint = 0xffffff;
              }}
            >
              <NineSlices x={0} y={0} width={180} height={40} scale={0.5} />
              <Stack x={-30} direction="horizontal" spacing={20}>
                <VehicleSprite
                  vehicle={vehicle.toLowerCase() as VehicleTypeLowercase}
                  x={0}
                  y={0}
                />
                <text
                  text={vehicle}
                  x={0}
                  y={0}
                  origin={0.5}
                  resolution={2}
                  style={{ ...TEXT_STYLE, color: "#000000", fontSize: 9 }}
                />
              </Stack>
            </container>
          ))}
        </Stack>
      </container>
    );

    this.add.existing(
      <container width={110} height={90} x={500} y={320}>
        <NineSlices
          x={0}
          y={0}
          width={110}
          height={90}
          origin={{ x: 0.5, y: 0 }}
        />
        <text
          text="Coast"
          x={0}
          y={0}
          origin={0.5}
          resolution={2}
          style={{
            ...TEXT_STYLE,
            color: "#efd8a1",
            fontSize: 16,
            stroke: "#000000",
            strokeThickness: 2,
          }}
        />
        <Stack direction="vertical" spacing={3} x={0} y={20}>
          {Object.keys(VEHICLES).map((vehicle, index) => (
            <container
              width={90}
              height={20}
              interactive
              onPointerdown={() => {
                runConfiguration.vehicle = vehicle as VehicleType;
                runConfiguration.map = "COASTAL";
                runConfiguration.time = this.game.getTime();
                this.gameState.startRun(runConfiguration);
                this.scene.pause();
                this.scene.moveAbove(SCENES.UI_HOME, SCENES.UI_TUTORIAL);
                this.scene.launch(SCENES.UI_TUTORIAL);
              }}
              onPointerover={(self) => {
                self.first.tint = 0xaaffaa;
              }}
              onPointerout={(self) => {
                self.first.tint = 0xffffff;
              }}
            >
              <NineSlices x={0} y={0} width={180} height={40} scale={0.5} />
              <Stack x={-30} direction="horizontal" spacing={20}>
                <VehicleSprite
                  vehicle={vehicle.toLowerCase() as VehicleTypeLowercase}
                  x={0}
                  y={0}
                />
                <text
                  text={vehicle}
                  x={0}
                  y={0}
                  origin={0.5}
                  resolution={2}
                  style={{ ...TEXT_STYLE, color: "#000000", fontSize: 9 }}
                />
              </Stack>
            </container>
          ))}
        </Stack>
      </container>
    );

    this.backgroundMusic = this.sound.add(RESOURCES["menu-theme"], {
      loop: true,
      volume: 0,
    });

    this.backgroundMusic.play();

    this.tweens.add({
      targets: this.backgroundMusic,
      volume: 1,
      duration: 5000,
    });
  }

  update(time: number, delta: number) {
    this.animatedTiles.forEach((tile) => {
      if (!tile.tileAnimationData) return;

      let animationDuration =
        tile.tileAnimationData[0].duration * tile.tileAnimationData.length;

      tile.elapsedTime += delta;
      tile.elapsedTime %= animationDuration;

      const animatonFrameIndex = Math.floor(
        tile.elapsedTime / tile.tileAnimationData[0].duration
      );

      tile.tile.index =
        tile.tileAnimationData[animatonFrameIndex].tileid + tile.firstgid;
    });
  }

  shutdown() {
    this.backgroundMusic.stop();
  }
}
