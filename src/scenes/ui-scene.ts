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

  create({ gameScene }: { gameScene: GameScene }) {
    this.gameScene = gameScene;
    this.bus = this.gamebus.getBus();

    // These events keys should probably be constants
    this.gamebus.on("water_level_changed", (water_level: number) => {
      // Do something
    });

    this.gamebus.on("damage_level_changed", (damage_level: number) => {
      // Do something
    });

    this.add.image(512, 384, RESOURCES["the-wildfires-ui"]);
  }
}
