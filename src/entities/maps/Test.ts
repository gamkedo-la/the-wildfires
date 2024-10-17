import { RESOURCES } from "../../assets";
import { GameMap } from "./GameMap";
import { MapWithProperties } from "./index";

export class TestMap extends GameMap {
  constructor(scene: Phaser.Scene) {
    super();

    this.map = scene.add.tilemap(
      RESOURCES["test-island-16"]
    ) as MapWithProperties;
    this.map.addTilesetImage(
      "tilemap-large",
      RESOURCES["tilemap-test-3"],
      24,
      32
    );
    this.mapLayer = this.map.createLayer("map", "tilemap-large")!;

    this.fireLayer = this.map.createLayer("fire", "tilemap-large")!;

    //TODO: Might move all structures here (even forest)
    this.map.createLayer("structures", "tilemap-large")!;

    // Phaser <3
    this.mapLayer.tileset[0].tileOffset = new Phaser.Math.Vector2(4, 16);

    this.create();
  }
}
