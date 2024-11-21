import { GAME_WIDTH } from "@game/consts";
import { Scene } from "phaser";
import { RESOURCES } from "../../assets";
import { SCENES } from "../consts";
import { HomeScene } from "../ui/home-scene";

export const RESOURCES_INDEX = Object.keys(RESOURCES).reduce(
  (acc, key, index) => ({ ...acc, [key]: index }),
  {} as Record<keyof typeof RESOURCES, number>
);

export const RESOURCES_LIST = Object.values(RESOURCES);

declare var WebFont: any;

export class Preloader extends Scene {
  constructor() {
    super(SCENES.PRELOADER);
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

    this.load.spritesheet("pin-spritesheet", "assets/pin.png", {
      frameWidth: 90,
      frameHeight: 44,
    });

    // FIXME: perhaps we should access these urls via RESOURCES[]
    this.load.audio(
      "airplane-propeller-loop",
      "assets/airplane-propeller-loop.mp3"
    );
    this.load.audio("fire-extinguished", "assets/fire-extinguished.mp3");
    this.load.audio("fire-loop", "assets/fire-loop.mp3");
    this.load.audio("water-loop", "assets/water-loop.mp3");
  }

  create() {
    WebFont.load({
      google: {
        families: ["DotGothic16"],
      },
      active: () => {
        // We start the game right away in dev mode
        if (import.meta.env.VITE_DEBUG) {
          this.scene.add(SCENES.UI_HOME, HomeScene);
          return this.scene.start(SCENES.UI_HOME);
        }

        // Otherwise we await for user input so the sound works correctly
        this.add.text(20, 20, "Click to start", {
          fontFamily: "DotGothic16",
          fontSize: "32px",
        });

        this.input.once("pointerdown", () => {
          this.scene.start(SCENES.MAP);
        });
      },
    });
  }
}
