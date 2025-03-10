import { computed, effect, signal } from "@game/state/lib/signals";
import { Signal } from "@game/state/lib/types";
import { AbstractScene } from "..";
import { RESOURCES } from "../../assets";
import { GAME_HEIGHT, GAME_WIDTH, TEXT_STYLE } from "../../consts";
import {
  createTransitionSignal,
  Sequence,
  Transition,
} from "../../ui/animation/animation";
import { SCENES } from "../consts";
import { MapScene } from "./map-scene";

export class HUDScene extends AbstractScene {
  gameScene: MapScene;

  constructor() {
    super(SCENES.HUD);
  }

  water_level: Phaser.GameObjects.Rectangle;
  damage_level: Phaser.GameObjects.Rectangle;
  speedDialSprite: Phaser.GameObjects.Image;
  offscreenArrow: Phaser.GameObjects.Image;
  vehiclePositionArrow: Phaser.GameObjects.Image;
  vehiclePositionArrowShowInterval: Signal<number> = signal(0);
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
        angle={computed(() => {
          const vel = vehicle.velocity.get().length();
          return vehicle.isCollectingWater &&
            vehicle.waterTankLevel.get() < vehicle.waterTankCapacity
            ? (90 * vel) / (vehicle.maxSpeed + (vehicle.maxSpeed - vel) * 100)
            : (90 * vel) / vehicle.maxSpeed;
        })}
      />
    );

    altitudeDial.setOrigin(1, 0.5);

    this.add.existing(
      <text
        x={185}
        y={710}
        text={computed(() => {
          const vel = vehicle.velocity.get().length();
          return ` ${Math.min(
            600,
            Math.round(
              vehicle.isCollectingWater &&
                vehicle.waterTankLevel.get() < vehicle.waterTankCapacity
                ? (7.5 * vel) / (vehicle.maxSpeed - vel) + 0.001
                : 7.5 * vel
            )
          )
            .toString()
            .padStart(3, "0")} ft`;
        })}
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

    const maxWaterWidth = 94;
    this.add.existing(
      <rectangle
        x={15}
        y={667}
        width={computed(
          () =>
            maxWaterWidth *
            (vehicle.waterTankLevel.get() / vehicle.waterTankCapacity)
        )}
        height={29}
        fillColor={0x3c9f9c}
        origin={0}
      />
    );

    const retardantWidth = 30;
    const retardantGap = 2;
    const x = 15;
    const y = 735;

    // First third
    const firstThirdRect = this.add.existing(
      <rectangle
        x={x}
        y={y}
        width={retardantWidth}
        height={0}
        fillColor={0xef3a0c}
        origin={0}
      />
    );

    effect(() => {
      const level = vehicle.retardantTankLevel.get();
      const firstThird = Math.min(level, vehicle.retardantChargeSize);
      firstThirdRect.setSize(
        retardantWidth,
        29 * (firstThird / vehicle.retardantChargeSize)
      );
      firstThirdRect.setPosition(x, y - firstThirdRect.height);
    });

    // Second third
    const secondThirdRect = this.add.existing(
      <rectangle
        x={x + retardantWidth + retardantGap}
        y={y}
        width={retardantWidth}
        height={0}
        fillColor={0xef3a0c}
        origin={0}
      />
    );

    effect(() => {
      const level = vehicle.retardantTankLevel.get();
      const secondThird = Math.max(
        0,
        Math.min(
          level - vehicle.retardantChargeSize,
          vehicle.retardantChargeSize
        )
      );
      secondThirdRect.setSize(
        retardantWidth,
        29 * (secondThird / vehicle.retardantChargeSize)
      );
      secondThirdRect.setPosition(
        x + retardantWidth + retardantGap,
        y - secondThirdRect.height
      );
    });

    // Final third
    const thirdThirdRect = this.add.existing(
      <rectangle
        x={x + (retardantWidth + retardantGap) * 2}
        y={y}
        width={retardantWidth}
        height={0}
        fillColor={0xef3a0c}
        origin={0}
      />
    );

    effect(() => {
      const level = vehicle.retardantTankLevel.get();
      const thirdThird = Math.max(0, level - vehicle.retardantChargeSize * 2);
      thirdThirdRect.setSize(
        retardantWidth,
        29 * (thirdThird / vehicle.retardantChargeSize)
      );
      thirdThirdRect.setPosition(
        x + (retardantWidth + retardantGap) * 2,
        y - thirdThirdRect.height
      );
    });

    this.add.existing(
      <image x={14} y={667} texture={RESOURCES["tanks-overlay"]} origin={0} />
    );

    this.add.existing(
      <image
        texture={RESOURCES["wind-direction-pin"]}
        x={349}
        y={679}
        angle={computed(
          () => Phaser.Math.RadToDeg(vehicle.direction.get().angle()) + 180
        )}
        origin={{ x: 0.8, y: 0.5 }}
        tint={computed(() => {
          if (vehicle.windRiding.get()) {
            return 0xaaffaa;
          }
          return 0x00aaaa;
        })}
      />
    );

    this.add.existing(
      <image
        texture={RESOURCES["wind-direction-pin"]}
        x={349}
        y={679}
        angle={computed(
          () =>
            Phaser.Math.RadToDeg(
              this.gameScene.windSystem.windVector.get().angle()
            ) + 180
        )}
        origin={{ x: 0.8, y: 0.5 }}
      />
    );

    let pickerPosition = createTransitionSignal(0);

    const up = (
      <Sequence>
        <Transition
          signal={pickerPosition}
          to={0}
          duration={400}
          ease="Cubic.easeOut"
        />
      </Sequence>
    );

    const down = (
      <Sequence>
        <Transition
          signal={pickerPosition}
          to={1}
          duration={500}
          ease="Cubic.easeOut"
        />
      </Sequence>
    );

    this.input.keyboard!.on("keydown-ONE", () => this.animationEngine.run(up));
    this.input.keyboard!.on("keydown-TWO", () =>
      this.animationEngine.run(down)
    );

    this.add.existing(
      <image
        x={128}
        y={computed(() => 680 + pickerPosition.get() * 35)}
        texture={RESOURCES["payload-picker"]}
      />
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
            vehicle.position.get().x < 40 ||
            vehicle.position.get().x > GAME_WIDTH + 63 ||
            vehicle.position.get().y < 30 ||
            vehicle.position.get().y > GAME_HEIGHT + 30
        )}
        texture={RESOURCES["plane-offscreen-pointer"]}
      />
    );

    this.add.existing(this.offscreenArrow);

    this.vehiclePositionArrow = this.add.existing(
      <image
        x={computed(() => vehicle.position.get().x - 50)}
        y={computed(() => vehicle.position.get().y - 30)}
        texture={RESOURCES["plane-position-pointer"]}
        visible={computed(
          () =>
            (vehicle.velocity.get().x === 0 &&
              vehicle.velocity.get().y === 0) ||
            this.vehiclePositionArrowShowInterval.get() > 0
        )}
        scale={computed(() =>
          Math.max(1, this.vehiclePositionArrowShowInterval.get() / 150)
        )}
      />
    );

    this.add.existing(
      <container
        x={30}
        y={25}
        width={50}
        height={30}
        interactive
        onPointerdown={() => {
          this.sound.play(RESOURCES["button"]);
          this.scene.get(SCENES.MAP).doPause();
        }}
      >
        <nineslice
          texture={RESOURCES["key-nine-slice"]}
          frame={0}
          originX={0.5}
          x={0}
          y={0}
          width={50}
          height={30}
          leftWidth={4}
          rightWidth={4}
          topHeight={4}
          bottomHeight={5}
        />
        <text
          text={"Pause"}
          x={0}
          y={0}
          origin={0.5}
          resolution={2}
          style={{ ...TEXT_STYLE, fontSize: 12, color: "#000000" }}
        />
      </container>
    );

    this.add.existing(
      <container
        x={80}
        y={25}
        width={50}
        height={30}
        interactive
        onPointerdown={() => {
          this.sound.play(RESOURCES["button"]);
          this.scene.get(SCENES.MAP).doTutorialPause();
        }}
      >
        <nineslice
          texture={RESOURCES["key-nine-slice"]}
          frame={0}
          originX={0.5}
          x={0}
          y={0}
          width={50}
          height={30}
          leftWidth={4}
          rightWidth={4}
          topHeight={4}
          bottomHeight={5}
        />
        <text
          text={"Help"}
          x={0}
          y={0}
          origin={0.5}
          resolution={2}
          style={{ ...TEXT_STYLE, fontSize: 12, color: "#000000" }}
        />
      </container>
    );
  }

  update(time: number, delta: number) {
    const { isDown: whereIsTheVehicleKeyDown } = this.gameScene.key_control;
    const { isDown: hudKeyDown } = this.gameScene.key_h;

    if (whereIsTheVehicleKeyDown) {
      this.vehiclePositionArrowShowInterval.set(300);
    }

    if (this.vehiclePositionArrowShowInterval.get() > 0) {
      this.vehiclePositionArrowShowInterval.update(
        (interval) => interval - delta
      );
    }

    this.scene.setVisible(!hudKeyDown);
  }

  shutdown() {}
}
