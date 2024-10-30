import { computed } from "@game/state/lib/signals";
import { JSXScene } from ".";
import { RESOURCES } from "../assets";
import PhaserGamebus from "../lib/gamebus";
import { GAME_HEIGHT, GAME_WIDTH } from "../main";
import { GameScene } from "./game-scene";

export class UIScene extends JSXScene {
  declare bus: Phaser.Events.EventEmitter;
  declare gamebus: PhaserGamebus;

  gameScene: GameScene;

  constructor() {
    super("UI");
  }

  water_level: Phaser.GameObjects.Rectangle;
  damage_level: Phaser.GameObjects.Rectangle;
  waterDialSprite: Phaser.GameObjects.Image;
  speedDialSprite: Phaser.GameObjects.Image;
  offscreenArrow: Phaser.GameObjects.Image;
  knotsTXT: Phaser.GameObjects.Text;

  create({ gameScene }: { gameScene: GameScene }) {
    this.gameScene = gameScene;
    this.bus = this.gamebus.getBus();

    const vehicle = this.gameScene.vehiclesSystem.vehicle;

    // These events keys should probably be constants
    this.gamebus.on("water_level_changed", (water_level: number) => {
      // console.log("ui water gauge changing: "+water_level.toFixed(1));
      // the num we get is 0 to 100 and needle starts at about 225
      this.waterDialSprite.angle = 225 + (90 * water_level) / 100;
    });

    this.gamebus.on("damage_level_changed", (damage_level: number) => {
      console.log("ui damage gauge changing: " + damage_level.toFixed(1));
    });

    // NOTE: this is fired every single frame...
    // perhaps it should not be an event and we
    // simply read a global variable instead?
    this.gamebus.on("speed_changed", (vel: number) => {
      //console.log("speed updated: "+vel.toFixed(1));
      // FIXME: 150 is a magic number set to look correct - depends on max speed!
      this.speedDialSprite.angle = 270 + (90 * vel) / 150;
      vel = Math.round(vel);
      let str = "" + vel;
      if (vel < 10) str = "00" + str;
      else if (vel < 100) str = "0" + str;
      this.knotsTXT.text = str;
    });

    // the backdrop of the cockpit control panel
    this.add.image(512, 384, RESOURCES["the-wildfires-ui"]);

    // q) why was this not being added to assets.ts as expected?
    // a) you need to stop vite and re-run it (npm run dev) to refresh
    this.waterDialSprite = this.add.image(264, 745, RESOURCES["water-dial"]);
    this.waterDialSprite.angle = 225;

    // speedometer
    this.speedDialSprite = this.add.image(28, 754, RESOURCES["water-dial"]);
    this.speedDialSprite.angle = 270;

    // txt speed in knots
    this.knotsTXT = this.add.text(44, 700, "0000", {
      fontFamily: "Arial",
      fontSize: 12,
      color: "#efd8a1",
    });

    // the arrow that appears when you fly off-screen
    this.offscreenArrow = (
      <image
        x={computed(() =>
          Math.min(Math.max(vehicle.position.get().x - 50, 70), GAME_WIDTH - 70)
        )}
        y={computed(() =>
          Math.min(
            Math.max(vehicle.position.get().y - 30, 70),
            GAME_HEIGHT - 70
          )
        )}
        angle={computed(() => {
          const pos = vehicle.position.get();
          // Left side with corners
          if (pos.x < 70) {
            if (pos.y < 70) return 180 + 45;
            if (pos.y > GAME_HEIGHT - 70) return 180 - 45;
            return 180;
          }
          // Right side with corners
          if (pos.x > GAME_WIDTH) {
            if (pos.y < 70) return 0 - 45;
            if (pos.y > GAME_HEIGHT - 70) return 0 + 45;
            return 0;
          }

          if (pos.y < 70) return 270;
          if (pos.y > GAME_HEIGHT - 70) return 90;

          return 0;
        })}
        visible={computed(
          () =>
            vehicle.position.get().x < 70 ||
            vehicle.position.get().x > GAME_WIDTH ||
            vehicle.position.get().y < 70 ||
            vehicle.position.get().y > GAME_HEIGHT
        )}
        texture={RESOURCES["plane-offscreen-pointer"]}
      />
    );
  }
}
