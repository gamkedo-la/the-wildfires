import { RESOURCES } from "@game/assets";
import { TEXT_STYLE } from "@game/consts";
import { MAPS_TILEMAPS, MapWithProperties } from "@game/entities/maps/index";
import { END_REASONS } from "@game/state/game-state";
import { computed } from "@game/state/lib/signals";
import { Tilemaps } from "phaser";
import { AbstractScene } from "..";
import {
  createTransitionSignal,
  Sequence,
  Step,
  Transition,
} from "../../ui/animation/animation";
import { SCENES } from "../consts";

export class PreplanningScene extends AbstractScene {
  camera: Phaser.Cameras.Scene2D.Camera;

  constructor() {
    super(SCENES.UI_PREPLANNING);
  }

  key_esc!: Phaser.Input.Keyboard.Key;
  key_enter!: Phaser.Input.Keyboard.Key;

  create() {
    this.bus = this.gamebus.getBus();

    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x00ff00);

    this.key_enter = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.ENTER
    );
    this.key_esc = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    );

    const map = this.add.tilemap(
      RESOURCES[MAPS_TILEMAPS[this.gameState.currentRun.get().map]]
    ) as MapWithProperties;

    const configurationObjects = map.getObjectLayer("configuration")!;

    map.addTilesetImage("tilemap-large", RESOURCES["tilemap-planning"], 24, 32);

    map.createLayer("map", "tilemap-large")!.setCullPadding(2, 2)!;
    map.createLayer("structures", "tilemap-large")!.setCullPadding(2, 2)!;
    const fireLayer = map.createLayer("fire", "tilemap-large")!;

    let cameraPositionObject = configurationObjects.objects.find(
      (o) => o.name === "camera-position"
    )!;

    this.camera.scrollX = Math.floor(cameraPositionObject.x!);
    this.camera.scrollY = Math.floor(cameraPositionObject.y!);

    let fireTileId = map.properties.find((p) => p.name === "fireTileId")
      ?.value!;

    let aircraftStartObject = configurationObjects.objects.find(
      (o) => o.name === "aircraft-start"
    )!;

    this.add.existing(
      <image
        texture="canadair-spritesheet"
        frame="2"
        scale={0.5}
        origin={0}
        tint={0xaa0000}
        x={aircraftStartObject.x}
        y={aircraftStartObject.y}
      />
    );

    this.add.existing(
      <image
        texture="canadair-outline"
        frame="2"
        tint={0xff0000}
        scale={0.5}
        origin={0}
        x={aircraftStartObject.x}
        y={aircraftStartObject.y}
      />
    );

    configurationObjects.objects.forEach((obj) => {
      // Only validate if we have properties that look like a POI
      if (
        obj.properties?.some((prop: any) =>
          ["duration", "delay"].includes(prop.name)
        )
      ) {
        this.add.existing(
          <sprite x={obj.x} y={obj.y} texture="pin-spritesheet" frame={0} />
        );

        this.add.existing(
          <text
            x={obj.x}
            y={obj.y}
            text={obj.properties.find((p: any) => p.name === "name")?.value}
            style={{
              fontFamily: "DotGothic16",
              fontSize: "12px",
              color: "#36170c",
            }}
            resolution={2}
            origin={{ x: 0.5, y: 1.1 }}
          />
        );
        /*this.scene.gameState.addPointOfInterest(
            new PointOfInterest(
              this.scene,
              this,
              props.poi,
              props.name,
              props.duration + Phaser.Math.Between(-5, 5),
              props.delay + Phaser.Math.Between(-5, 5),
              obj.x!,
              obj.y!
            )
          );*/
      }
    });

    fireLayer
      .filterTiles((t: Tilemaps.Tile) => t.index === fireTileId)
      .flatMap((tile) => {
        fireLayer.putTileAt(fireTileId, tile.x, tile.y);
        fireLayer.putTileAt(fireTileId, tile.x + 1, tile.y);
        fireLayer.putTileAt(fireTileId, tile.x - 1, tile.y + 1);
        fireLayer.putTileAt(fireTileId, tile.x, tile.y + 1);
        fireLayer.putTileAt(fireTileId, tile.x, tile.y - 1);
        fireLayer.putTileAt(fireTileId, tile.x + 1, tile.y - 1);
      });

    this.add.existing(
      <container
        x={400}
        y={720}
        width={200}
        height={80}
        interactive
        onPointerdown={() => {
          this.scene.stop(SCENES.UI_PREPLANNING);
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
          height={40}
          leftWidth={4}
          rightWidth={4}
          topHeight={4}
          bottomHeight={5}
        />
        <text
          text={"Back"}
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
        x={180}
        y={720}
        width={200}
        height={80}
        interactive
        onPointerdown={() => {
          this.startGame();
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
          text={"Start"}
          x={0}
          y={0}
          origin={0.5}
          resolution={2}
          style={{ ...TEXT_STYLE, fontSize: "24px", color: "#000000" }}
        />
      </container>
    );
  }

  startGame() {
    const planeX = createTransitionSignal(0);

    this.add.existing(
      <rectangle
        x={planeX}
        y={this.scale.height / 2}
        width={this.scale.width + 100}
        height={this.scale.height}
        fillColor={0x000000}
        angle={-9}
        origin={{ x: 1, y: 1 }}
      />
    );

    this.add.existing(
      <rectangle
        x={planeX}
        y={this.scale.height / 2}
        width={this.scale.width + 100}
        height={this.scale.height}
        angle={9}
        fillColor={0x000000}
        origin={{ x: 1, y: 0 }}
      />
    );

    this.add.existing(
      <sprite
        x={computed(() => planeX.get() + 35)}
        y={this.scale.height / 2 + 38}
        texture="canadair-spritesheet"
        frame="2"
        angle={-90}
        origin={{ x: 0, y: 0.5 }}
      />
    );

    this.add.existing(
      <sprite
        x={computed(() => planeX.get() + 35)}
        y={this.scale.height / 2 + 38}
        texture="canadair-outline"
        frame="2"
        angle={-90}
        origin={{ x: 0, y: 0.5 }}
        tint={0x000000}
      />
    );

    this.animationEngine.run(
      <Sequence>
        <Transition
          signal={planeX}
          from={0}
          /* TODO: why 50??????????? */
          to={this.scale.width + 150}
          duration={1500}
          ease="Linear"
        />
        <Step duration={1} action={() => this.scene.start(SCENES.MAP)} />
      </Sequence>
    );
  }

  shutdown() {}
}
