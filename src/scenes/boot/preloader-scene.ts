import { Scene } from "phaser";
import { RESOURCES } from "../../assets";

import { GAME_WIDTH } from "../../main";

export const RESOURCES_INDEX = Object.keys(RESOURCES).reduce(
  (acc, key, index) => ({ ...acc, [key]: index }),
  {} as Record<keyof typeof RESOURCES, number>
);

export const RESOURCES_LIST = Object.values(RESOURCES);

declare var WebFont: any;

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  init() {
    this.add
      .rectangle(GAME_WIDTH / 2, 484, 468, 32)
      .setStrokeStyle(1, 0xffffff);

    const bar = this.add.rectangle(GAME_WIDTH / 2 - 230, 484, 4, 28, 0xffffff);

    this.load.on("progress", (progress: number) => {
      bar.width = 4 + 460 * progress;
    });
  }

  preload() {
    this.load.script(
      "webfont",
      "https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"
    );

    // Load the assetPack.json
    this.load.pack("assetPack", "assetPack.json");

    // TODO:
    // Make the spritesheets to be handled by assetPack.json through
    // the asset-conversion vite plugin. I'm not sure yet how to set
    // the metadata for the spritesheets.
    // PixelOver generates a spritesheet with a metadata file but not
    // sure it is worth the effort to parse it.
    this.load.spritesheet("martin-spritesheet", "assets/martin-sprite.png", {
      frameWidth: 125,
      frameHeight: 101,
    });
    this.load.spritesheet(
      "canadair-spritesheet",
      "assets/canadair-sprite.png",
      {
        frameWidth: 83,
        frameHeight: 85,
      }
    );
    this.load.spritesheet(
      "skycrane-spritesheet",
      "assets/skycrane-sprite.png",
      {
        frameWidth: 48,
        frameHeight: 83,
      }
    );


    // FIXME: perhaps we should access these urls via RESOURCES[] 
    this.load.audio("airplane-propeller-loop","public/assets/airplane-propeller-loop.mp3");
    this.load.audio("fire-extinguished","public/assets/fire-extinguished.mp3");
    this.load.audio("fire-loop","public/assets/fire-loop.mp3");
    this.load.audio("water-loop","public/assets/water-loop.mp3");

  }

  create() {
    WebFont.load({
      google: {
        families: ["DotGothic16"],
      },
      active: () => {
        //if (import.meta.env.DEV) {
        //this.scene.run("Debug");
        this.scene.start("Game");
        //} else {
        //this.add.image(0, 0, RESOURCES.MAIN_MENU).setOrigin(0, 0);

        //this.input.once("pointerdown", () => {
        // this.scene.start("MainMenu");
        //});
        //}
      },
    });
  }
}
