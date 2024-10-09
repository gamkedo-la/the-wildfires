import { Scene } from "phaser";
import { GameScene } from "./game-scene";
import PhaserGamebus from "../lib/gamebus";
import { RESOURCES } from "../assets";

export class UIScene extends Scene {
  declare bus: Phaser.Events.EventEmitter;
  declare gamebus: PhaserGamebus;

  gameScene: GameScene;

  constructor() {
    super("UI");
  }

  water_level: Phaser.GameObjects.Rectangle;
  damage_level: Phaser.GameObjects.Rectangle;
  waterDialSprite: Phaser.GameObjects.Image;

  create({ gameScene }: { gameScene: GameScene }) {
    this.gameScene = gameScene;
    this.bus = this.gamebus.getBus();

    // These events keys should probably be constants
    this.gamebus.on("water_level_changed", (water_level: number) => {
      console.log("ui water gauge changing: "+water_level.toFixed(1));
      // the num we get is 0 to 100 and needle starts at about 225
      this.waterDialSprite.angle = 225+90*water_level/100;
    });

    this.gamebus.on("damage_level_changed", (damage_level: number) => {
      console.log("ui damage gauge changing: "+damage_level.toFixed(1));
    });

    this.add.image(512, 384, RESOURCES["the-wildfires-ui"]);

    // why is this not being added to assets.ts as expected? 
    this.waterDialSprite = this.add.image(264, 745, RESOURCES["water-dial"]);
    this.waterDialSprite.angle = 225;
  }
}
