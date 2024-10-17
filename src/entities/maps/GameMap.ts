import { MapWithProperties } from ".";

export abstract class GameMap {
  map: MapWithProperties;

  fireLayer: Phaser.Tilemaps.TilemapLayer;
  mapLayer: Phaser.Tilemaps.TilemapLayer;

  fireTileId: number;
  animatedTiles: any[];

  create() {
    let fireTileId = this.map.properties.find(
      (p) => p.name === "fireTileId"
    )?.value;

    if (fireTileId) {
      this.fireTileId = fireTileId;
    } else {
      throw new Error("Invalid or missing fireTileId property in tilemap");
    }

    this.registerAnimatedTiles();
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

  registerAnimatedTiles() {
    this.animatedTiles = [];
    const tileData = this.map.tilesets[0].tileData;

    if (this.map.tilesets.length > 1) {
      throw new Error("TODO: Add support for multiple tilesets");
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
}
