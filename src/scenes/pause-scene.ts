import { Scene, Tilemaps } from "phaser";

export class Pause extends Scene {
   camera: Phaser.Cameras.Scene2D.Camera;
   map: Phaser.Tilemaps.Tilemap;
 
   constructor() {
     super("Pause");
   }
}
