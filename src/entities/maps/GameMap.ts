import { MapLayerTile, MapTileType, MapWithProperties, PoiProperties } from ".";
import { MapScene } from "../../scenes/game/map-scene";
import { PointOfInterest } from "../point-of-interest/PointOfInterest";

export abstract class GameMap {
  scene: MapScene;
  map: MapWithProperties;

  configurationObjects: Phaser.Tilemaps.ObjectLayer;
  fireLayer: Phaser.Tilemaps.TilemapLayer;
  mapLayer: Phaser.Tilemaps.TilemapLayer;
  structuresLayer: Phaser.Tilemaps.TilemapLayer;
  pointsOfInterestLayer: Phaser.Tilemaps.TilemapLayer & {
    startingIndex: number;
  };

  cameraPosition: Phaser.Math.Vector2;
  aircraftStartPosition: Phaser.Math.Vector2;

  animatedTiles: any[];

  fireTileId: number;
  fireTick: number = 4000;
  fireRatio: number = 4;
  fireTilesCache: Phaser.Tilemaps.Tile[];

  evacuationTileDelay: number = 14000;
  evacuationAlarmDistance: number = 8000;

  create() {
    let fireTileId = this.map.properties.find(
      (p) => p.name === "fireTileId"
    )?.value;

    if (fireTileId) {
      this.fireTileId = fireTileId;
    } else {
      throw new Error("Invalid or missing fireTileId property in tilemap");
    }

    // find the camera-position object
    let cameraPositionObject = this.configurationObjects.objects.find(
      (o) => o.name === "camera-position"
    );

    if (cameraPositionObject) {
      this.cameraPosition = new Phaser.Math.Vector2(
        cameraPositionObject.x,
        cameraPositionObject.y
      );
    } else {
      throw new Error("Invalid or missing camera-position object in tilemap");
    }

    // find the aircraft-start object
    let aircraftStartObject = this.configurationObjects.objects.find(
      (o) => o.name === "aircraft-start"
    );

    if (aircraftStartObject) {
      this.aircraftStartPosition = new Phaser.Math.Vector2(
        aircraftStartObject.x,
        aircraftStartObject.y
      );
    } else {
      throw new Error("Invalid or missing aircraft-start object in tilemap");
    }

    this.registerPointsOfInterest();
    this.registerAnimatedTiles();

    this.fireTilesCache = [];
    this.scene.time.addEvent({
      delay: this.fireTick,
      callback: () => {
        this.fireTilesCache = this.fireLayer.filterTiles(
          (tile: Phaser.Tilemaps.Tile) => tile.index === this.fireTileId
        );
      },
      loop: true,
    });
  }

  update(_time: number, delta: number) {
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

  private validatePoiProperties(
    obj: Phaser.Types.Tilemaps.TiledObject
  ): PoiProperties {
    if (!obj.properties) {
      throw new Error(
        `Point of Interest at (${obj.x}, ${obj.y}) is missing required properties`
      );
    }

    const getProperty = (name: string) => {
      const prop = obj.properties!.find((p: any) => p.name === name);
      if (!prop) {
        throw new Error(
          `Point of Interest at (${obj.x}, ${obj.y}) is missing required property: ${name}`
        );
      }
      return prop.value;
    };

    // Validate all required properties
    const properties: PoiProperties = {
      poi: parseInt(getProperty("poi")),
      name: getProperty("name"),
      duration: getProperty("duration"),
      delay: getProperty("delay"),
    };

    // Additional validation
    if (isNaN(properties.poi)) {
      throw new Error(
        `Point of Interest at (${obj.x}, ${obj.y}) has invalid 'poi' value: ${properties.poi}`
      );
    }

    if (typeof properties.name !== "string" || properties.name.trim() === "") {
      throw new Error(
        `Point of Interest at (${obj.x}, ${obj.y}) has invalid 'name' value`
      );
    }

    if (typeof properties.duration !== "number" || properties.duration <= 0) {
      throw new Error(
        `Point of Interest at (${obj.x}, ${obj.y}) has invalid 'duration' value: ${properties.duration}`
      );
    }

    if (typeof properties.delay !== "number" || properties.delay < 0) {
      throw new Error(
        `Point of Interest at (${obj.x}, ${obj.y}) has invalid 'delay' value: ${properties.delay}`
      );
    }

    return properties;
  }

  registerPointsOfInterest() {
    this.configurationObjects.objects.forEach((obj) => {
      // Only validate if we have properties that look like a POI
      if (
        obj.properties?.some((prop: any) =>
          ["duration", "delay"].includes(prop.name)
        )
      ) {
        try {
          const props = this.validatePoiProperties(obj);

          this.scene.gameState.addPointOfInterest(
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
          );
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.error(error);
          } else {
            // In production, skip invalid POIs silently
            console.warn("Skipped invalid Point of Interest:", error);
          }
        }
      }
    });

    // Count the tiles for each POI
    this.pointsOfInterestLayer.forEachTile((tile) => {
      const poi = tile.index - this.pointsOfInterestLayer.startingIndex;
      if (poi >= 0) {
        this.scene.gameState.updatePointOfInterestTileCount(poi);
      }
    });

    // Now that we know how many tiles there are, we can set the max for each POI
    this.scene.gameState.setMaxTiles();
  }

  registerAnimatedTiles() {
    this.animatedTiles = [];
    const tileData = this.map.tilesets[0].tileData;

    if (this.map.tilesets.length > 1) {
      //throw new Error("TODO: Add support for multiple tilesets");
    }

    // Tiles animation system from https://medium.com/@0xNicko/how-to-animate-your-tiles-in-a-phaser-3-game-scene-a2394bd7494b
    for (let tileid in tileData) {
      this.map.layers.forEach((layer) => {
        layer.data.forEach((tileRow) => {
          tileRow.forEach((tile) => {
            if (
              tile.index - this.map.tilesets[0].firstgid ===
              parseInt(tileid)
            ) {
              this.animatedTiles.push({
                tile,
                tileAnimationData: (tileData as any)[tileid].animation,
                firstgid: this.map.tilesets[0].firstgid,
                elapsedTime: 0,
              });
            }
          });
        });
      });
    }
  }

  putFire(tileX: number, tileY: number): Phaser.Tilemaps.Tile {
    let tile = this.fireLayer.putTileAt(this.fireTileId, tileX, tileY);
    const tileData = this.map.tilesets[0].tileData;

    // TODO: Fires will be different for different tiles and also change during the health of the tile
    this.animatedTiles.push({
      tile,
      elapsedTime: 0,
      tileAnimationData: (tileData as any)[this.fireTileId - 1].animation,
      firstgid: this.map.tilesets[0].firstgid,
    });

    return tile;
  }

  removeFire(tileX: number, tileY: number): Phaser.Tilemaps.Tile {
    let tile = this.fireLayer.getTileAt(tileX, tileY);
    this.animatedTiles = this.animatedTiles.filter((t) => t.tile !== tile);
    this.fireLayer.removeTileAt(tile.x, tile.y);
    return tile;
  }

  typeAtWorldXY(x: number, y: number) {
    let tile = this.mapLayer.getTileAtWorldXY(x, y, true, this.scene.camera);

    return this.getType(tile);
  }

  private getType(tile: MapLayerTile | null) {
    if (tile?.properties.isWater === true) {
      return MapTileType.Water;
    } else {
      return MapTileType.Ground;
    }
  }
}
