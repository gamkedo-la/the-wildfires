import { GAME_WIDTH } from "@game/consts";
import { AbstractScene } from "..";
import { RESOURCES } from "../../assets";
import { SCENES } from "../consts";

export const RESOURCES_INDEX = Object.keys(RESOURCES).reduce(
  (acc, key, index) => ({ ...acc, [key]: index }),
  {} as Record<keyof typeof RESOURCES, number>
);

export const RESOURCES_LIST = Object.values(RESOURCES);

declare var WebFont: any;

export class Preloader extends AbstractScene {
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

    this.load.spritesheet("martin-outline", "assets/martin-outline.png", {
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

    this.load.spritesheet("canadair-outline", "assets/canadair-outline.png", {
      frameWidth: 83,
      frameHeight: 85,
    });

    this.load.spritesheet(
      "skycrane-spritesheet",
      "assets/skycrane-sprite.png",
      {
        frameWidth: 48,
        frameHeight: 83,
      }
    );

    this.load.spritesheet("skycrane-outline", "assets/skycrane-outline.png", {
      frameWidth: 48,
      frameHeight: 83,
    });

    this.load.spritesheet("tilemap-spritesheet", "assets/tilemap-test-3.png", {
      frameWidth: 24,
      frameHeight: 32,
    });

    this.load.spritesheet("pin-spritesheet", "assets/pin.png", {
      frameWidth: 90,
      frameHeight: 44,
    });

    this.load.spritesheet(
      "pin-vertical-spritesheet",
      "assets/pin-vertical.png",
      {
        frameWidth: 90,
        frameHeight: 44,
      }
    );

    this.load.spritesheet("poi-status-icons", "assets/poi-status-icons.png", {
      frameWidth: 24,
      frameHeight: 24,
    });

    this.load.spritesheet("poi-tiles-icons", "assets/poi-tiles-icons.png", {
      frameWidth: 28,
      frameHeight: 28,
    });

    this.load.spritesheet("smoke-spritesheet", "assets/smoke.png", {
      frameWidth: 8,
      frameHeight: 8,
    });
  }

  create() {
    WebFont.load({
      google: {
        families: ["DotGothic16"],
      },
      active: () => {
        // We start the game right away in dev mode
        //this.scene.start(SCENES.TEST);
        //  return;

        if (import.meta.env.VITE_DEBUG) {
          // Normal game
          return this.scene.start(SCENES.UI_HOME);

          /**
          // Quick game start
          const runConfiguration = this.gameState.getEmptyRun();
          runConfiguration.map = "CONTINENTAL";
          runConfiguration.vehicle = "MARTIN";
          this.gameState.startRun(runConfiguration);
          this.scene.start(SCENES.MAP);

          /**
          // Quick summary screen
          this.scene.get(SCENES.MAP).time.addEvent({
            delay: 1,
            callback: () => {
              this.scene.get(SCENES.MAP).endGame(END_REASONS.FIRE_EXTINGUISHED);
            },
          });
          /**/
        }

        // Otherwise we await for user input so the sound works correctly
        this.scene.start(SCENES.UI_HOME);
      },
    });

    this.anims.create({
      key: "pin-hide",
      frames: this.anims.generateFrameNumbers("pin-spritesheet", {
        start: 0,
        end: 6,
      }),
      frameRate: 16,
    });

    this.anims.create({
      key: "pin-flash",
      frames: this.anims.generateFrameNumbers("pin-spritesheet", {
        start: 6,
        end: 0,
      }),
      frameRate: 16,
    });

    this.anims.create({
      key: "pin-vertical-hide",
      frames: this.anims.generateFrameNumbers("pin-vertical-spritesheet", {
        start: 0,
        end: 6,
      }),
      frameRate: 16,
    });

    this.anims.create({
      key: "smoke-out",
      frames: this.anims.generateFrameNumbers("smoke-spritesheet", {
        start: 0,
        end: 3,
      }),
      frameRate: 0.5,
    });

    this.anims.create({
      key: "pin-vertical-flash",
      frames: this.anims.generateFrameNumbers("pin-vertical-spritesheet", {
        start: 3,
        end: 0,
      }),
      frameRate: 16,
    });

    const graphics = this.add.graphics();
    graphics.fillStyle(0x927e6a);
    graphics.fillStyle(0xefd8a1);
    graphics.fillCircle(1, 1, 2);
    graphics.generateTexture("wind_particle", 2, 2);
    graphics.destroy();
  }

  shutdown() {}
}
