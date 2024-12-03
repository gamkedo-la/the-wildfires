import { computed } from "@game/state/lib/signals";
import { AbstractScene } from "..";
import { RESOURCES } from "../../assets";
import { GAME_HEIGHT, GAME_WIDTH, TEXT_STYLE } from "../../consts";
import { MapScene } from "./map-scene";
import { SCENES } from "../consts";

export class HUDScene extends AbstractScene {
  gameScene: MapScene;

  constructor() {
    super(SCENES.HUD);
  }

  water_level: Phaser.GameObjects.Rectangle;
  damage_level: Phaser.GameObjects.Rectangle;
  waterDialSprite: Phaser.GameObjects.Image;
  speedDialSprite: Phaser.GameObjects.Image;
  offscreenArrow: Phaser.GameObjects.Image;
  knotsTXT: Phaser.GameObjects.Text;

  create({ gameScene }: { gameScene: MapScene }) {
    this.gameScene = gameScene;
    this.bus = this.gamebus.getBus();

    const { height } = this.scale;

    const vehicle = this.gameScene.vehiclesSystem.vehicle;

    // the backdrop of the cockpit control panel
    this.add.image(0, height, RESOURCES["planes-hud"]).setOrigin(0, 1);

    const speedDial: Phaser.GameObjects.Image = this.add.existing(
      <image
        x={258}
        y={730}
        texture={RESOURCES["velocity-pin"]}
        angle={computed(
          () => -(80 * vehicle.velocity.get().length()) / vehicle.maxSpeed
        )}
      />
    );

    speedDial.setOrigin(1, 0.5);
    speedDial.setScale(-1, 1);

    this.add.existing(
      <text
        x={260}
        y={710}
        text={computed(
          () =>
            ` ${Math.round(vehicle.velocity.get().length())
              .toString()
              .padStart(2, "0")} KTS`
        )}
        style={{
          ...TEXT_STYLE,
          fontSize: 10,
          color: "#efd8a1",
        }}
      />
    );

    const altitudeDial: Phaser.GameObjects.Image = this.add.existing(
      <image
        x={225}
        y={730}
        texture={RESOURCES["velocity-pin"]}
        angle={computed(
          () => (90 * vehicle.velocity.get().length()) / vehicle.maxSpeed
        )}
      />
    );

    altitudeDial.setOrigin(1, 0.5);

    this.add.existing(
      <text
        x={185}
        y={710}
        text={computed(
          () =>
            ` ${Math.round(7.5 * vehicle.velocity.get().length())
              .toString()
              .padStart(3, "0")} ft`
        )}
        style={{
          ...TEXT_STYLE,
          fontSize: 10,
          color: "#efd8a1",
        }}
      />
    );

    const torqueDial1: Phaser.GameObjects.Image = this.add.existing(
      <image
        x={397}
        y={730}
        texture={RESOURCES["torque-pin"]}
        angle={computed(
          () =>
            Math.random() * 5 +
            (177 * vehicle.velocity.get().length()) / vehicle.maxSpeed
        )}
      />
    );

    torqueDial1.setOrigin(1, 0.5);

    const torqueDial2: Phaser.GameObjects.Image = this.add.existing(
      <image
        x={475}
        y={730}
        texture={RESOURCES["torque-pin"]}
        angle={computed(
          () =>
            Math.random() * 5 +
            (177 * vehicle.velocity.get().length()) / vehicle.maxSpeed
        )}
      />
    );

    torqueDial2.setOrigin(1, 0.5);

    // q) why was this not being added to assets.ts as expected?
    // a) you need to stop vite and re-run it (npm run dev) to refresh
    this.waterDialSprite = this.add.image(264, 745, RESOURCES["velocity-pin"]);
    this.waterDialSprite.alpha = 0;
    this.waterDialSprite.angle = 225;

    const maxWaterWidth = 94;
    this.add
      .existing(
        <rectangle
          x={15}
          y={667}
          width={computed(
            () =>
              maxWaterWidth * (vehicle.tankLevel.get() / vehicle.tankCapacity)
          )}
          height={29}
          fillColor={0x3c9f9c}
        />
      )
      .setOrigin(0);

    this.add.image(14, 667, RESOURCES["tanks-overlay"]).setOrigin(0);

    this.add.existing(
      <image x={128} y={680} texture={RESOURCES["payload-picker"]} />
    );

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

    this.add.existing(this.offscreenArrow);
  }

  shutdown() {}
}
