import { GAME_HEIGHT, GAME_WIDTH, TEXT_STYLE } from "@game/consts";
import { computed, signal } from "@game/state/lib/signals";
import { AbstractScene } from "..";
import {
  createTransitionSignal,
  Repeat,
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
        scale={0.5}
        {...props}
      />
      <image
        texture={`${vehicle}-outline`}
        tint={0x000000}
        frame={1}
        x={x}
        y={y}
        angle={-45}
        scale={0.5}
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
          origin={0.5}
          style={{ ...TEXT_STYLE, fontSize: "18px", color: "#ffffff" }}
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

    if (import.meta.env.VITE_DEBUG) {
      this.add.existing(
        <container width={250} height={30} x={173} y={280} scale={0.6}>
          <NineSlices
            x={0}
            y={0}
            width={250}
            height={168}
            origin={{ x: 0.5, y: 0 }}
          />
          <text
            text="Islands"
            x={0}
            y={0}
            origin={0.5}
            style={{
              ...TEXT_STYLE,
              color: "#efd8a1",
              fontStyle: "bold",
              stroke: "#000000",
              strokeThickness: 4,
            }}
          />
          <Stack direction="vertical" spacing={10} x={0} y={30}>
            {Object.keys(VEHICLES).map((vehicle, index) => (
              <container
                width={230}
                height={40}
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
                <NineSlices x={0} y={0} width={230} height={40} />
                <container width={180} height={40}>
                  <Stack x={-80} direction="horizontal" spacing={25}>
                    <VehicleSprite
                      vehicle={vehicle.toLowerCase() as VehicleTypeLowercase}
                      origin={0.5}
                    />
                    <text
                      text={vehicle}
                      origin={0.5}
                      style={{
                        ...TEXT_STYLE,
                        color: "#000000",
                        fontSize: "14px",
                      }}
                    />
                  </Stack>
                  <container width={100} height={28} x={58}>
                    <NineSlices
                      x={0}
                      y={0}
                      width={100}
                      height={28}
                      //tint={0xaaffaa}
                    />
                  </container>
                </container>
              </container>
            ))}
          </Stack>
        </container>
      );
    }

    this.add.existing(
      <container width={100} height={30} x={173} y={80} scale={0.6}>
        <NineSlices
          x={0}
          y={0}
          width={200}
          height={145}
          origin={{ x: 0.5, y: 0 }}
        />
        <text
          text="Islands"
          x={0}
          y={0}
          origin={0.5}
          style={{
            ...TEXT_STYLE,
            color: "#efd8a1",
            fontStyle: "bold",
            stroke: "#000000",
            strokeThickness: 4,
          }}
        />
        <Stack direction="vertical" spacing={10} x={0} y={30}>
          {Object.keys(VEHICLES).map((vehicle, index) => (
            <container
              width={180}
              height={30}
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
              <NineSlices x={0} y={0} width={180} height={30} />
              <Stack x={-30} direction="horizontal" spacing={25}>
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
                  style={{ ...TEXT_STYLE, color: "#000000", fontSize: "14px" }}
                />
              </Stack>
            </container>
          ))}
        </Stack>
      </container>
    );

    this.add.existing(
      <container width={100} height={30} x={500} y={80} scale={0.6}>
        <NineSlices
          x={0}
          y={0}
          width={200}
          height={145}
          origin={{ x: 0.5, y: 0 }}
        />
        <text
          text="Continent"
          x={0}
          y={0}
          origin={0.5}
          style={{
            ...TEXT_STYLE,
            color: "#efd8a1",
            fontStyle: "bold",
            stroke: "#000000",
            strokeThickness: 4,
          }}
        />
        <Stack direction="vertical" spacing={10} x={0} y={30}>
          {Object.keys(VEHICLES).map((vehicle, index) => (
            <container
              width={180}
              height={30}
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
              <NineSlices x={0} y={0} width={180} height={30} />
              <Stack x={-30} direction="horizontal" spacing={25}>
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
                  style={{ ...TEXT_STYLE, color: "#000000", fontSize: "14px" }}
                />
              </Stack>
            </container>
          ))}
        </Stack>
      </container>
    );

    this.add.existing(
      <container width={100} height={30} x={333} y={320} scale={0.6}>
        <NineSlices
          x={0}
          y={0}
          width={200}
          height={145}
          origin={{ x: 0.5, y: 0 }}
        />
        <text
          text="Coast"
          x={0}
          y={0}
          origin={0.5}
          style={{
            ...TEXT_STYLE,
            color: "#efd8a1",
            fontStyle: "bold",
            stroke: "#000000",
            strokeThickness: 4,
          }}
        />
        <Stack direction="vertical" spacing={10} x={0} y={30}>
          {Object.keys(VEHICLES).map((vehicle, index) => (
            <container
              width={180}
              height={30}
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
              <NineSlices x={0} y={0} width={180} height={30} />
              <Stack x={-30} direction="horizontal" spacing={25}>
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
                  style={{ ...TEXT_STYLE, color: "#000000", fontSize: "14px" }}
                />
              </Stack>
            </container>
          ))}
        </Stack>
      </container>
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
          runConfiguration.time = this.game.getTime();
          this.gameState.startRun(runConfiguration);
          this.scene.pause();
          this.scene.moveAbove(SCENES.UI_HOME, SCENES.UI_TUTORIAL);
          this.scene.launch(SCENES.UI_TUTORIAL);
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
