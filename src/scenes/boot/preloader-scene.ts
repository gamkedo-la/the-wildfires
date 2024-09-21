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
