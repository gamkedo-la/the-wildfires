import { RESOURCES } from "../../assets";
import { MapScene } from "../../scenes/game/map-scene";
import { GameMap } from "./GameMap";
import { MapWithProperties } from "./index";

export class ContinentalMap extends GameMap {
  constructor(scene: MapScene) {
    super();

    this.scene = scene;

    this.map = scene.add.tilemap(RESOURCES["continental"]) as MapWithProperties;

    this.configurationObjects = this.map.getObjectLayer("configuration")!;

    const tileset = this.map.addTilesetImage(
      "tilemap-large",
      RESOURCES["tilemap-test-3"],
      24,
      32
    );

    this.mapLayer = this.map.createLayer("map", "tilemap-large")!;
    this.structuresLayer = this.map.createLayer("structures", "tilemap-large")!;
    this.fireLayer = this.map.createLayer("fire", "tilemap-large")!;
    this.pointsOfInterestLayer = this.map.createLayer(
      "poi-areas",
      "tilemap-large"
    )! as Phaser.Tilemaps.TilemapLayer & { startingIndex: number };

    // TODO: magic number
    this.pointsOfInterestLayer.startingIndex = tileset?.total! + 1;

    // Phaser <3
    this.mapLayer.tileset[0].tileOffset = new Phaser.Math.Vector2(4, 16);

    this.create();
  }
}
