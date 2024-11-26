import { computed, effect, signal } from "@game/state/lib/signals";
import { RESOURCES } from "../../assets";
import { MapScene } from "../../scenes/game/map-scene";
import { GameMap } from "../maps/GameMap";
import { Signal } from "@game/state/lib/types";

// TODO: Maybe there will be a POI UI in the HUD where instead of a fixed time to start, it's on the player to alert the POI and start the evacuation. Obviously the less
export const POI_STATE = {
  ALERTED: "alerted", // Maybe
  EVACUATING: "evacuating",
  // TODO: too many states, too complicated. Make the state done or not done and count the tiles
  SAVED: "saved",
  PARTIALLY_SAVED: "partially-saved",
  DAMAGED: "damaged",
  UNTOUCHED: "untouched",
} as const;

export class PointOfInterest {
  scene: MapScene;
  map: GameMap;

  id: number;
  name: string;
  timeout: number;

  legend: Phaser.GameObjects.Text;

  timer: Phaser.Time.TimerEvent;

  position: Phaser.Math.Vector2;
  coordinates: Phaser.Math.Vector2;

  open: Signal<boolean> = signal(false);

  /**
   * Total number of tiles that can be saved
   */
  maxTiles: Signal<number> = signal(1);
  /**
   * Number of tiles left to be saved
   */
  tilesLeft: Signal<number> = signal(0);
  /**
   * Number of tiles saved
   */
  savedTiles: Signal<number> = signal(0);
  /**
   * Number of tiles damaged
   */
  damagedTiles: Signal<number> = signal(0);

  state: Signal<(typeof POI_STATE)[keyof typeof POI_STATE]>;
  finalState: Signal<(typeof POI_STATE)[keyof typeof POI_STATE]>;

  constructor(
    scene: MapScene,
    map: GameMap,
    id: number,
    name: string,
    timeout: number,
    delay: number,
    x: number,
    y: number
  ) {
    this.scene = scene;
    this.map = map;
    this.id = id;

    x = Math.floor(x);
    // TODO: magic number
    y = Math.floor(y - 25);

    this.name = name;
    this.position = new Phaser.Math.Vector2(x, y);
    this.coordinates = map.map.worldToTileXY(x, y)!;

    // TODO: magic number
    const maxWidth = 55;

    // TODO: Fix colors
    //this.scene.add.rectangle(x, y + 4, maxWidth, 6, 0xffffff).setOrigin(0.5, 0);

    const rectangle: Phaser.GameObjects.Rectangle = this.scene.add.existing(
      <rectangle
        x={x - 22}
        y={y + 1}
        width={10}
        height={27}
        fillColor={0x2a1d0d}
      />
    );

    const savedHealthBar: Phaser.GameObjects.Rectangle =
      this.scene.add.existing(
        <rectangle width={0} height={0} fillColor={0xa58c27} />
      );

    const damageBar: Phaser.GameObjects.Rectangle = this.scene.add.existing(
      <rectangle width={0} height={0} fillColor={0xae2334} />
    );

    effect(() => {
      const opened = this.open.get();
      const savedTilesRatio = this.savedTiles.get() / this.maxTiles.get();
      const damagedTilesRatio = this.damagedTiles.get() / this.maxTiles.get();

      if (opened) {
        rectangle.setX(x - 22);
        rectangle.setY(y + 16);
        rectangle.width = maxWidth;
        rectangle.height = 8;

        savedHealthBar.setX(x - maxWidth / 2);
        savedHealthBar.setY(y + 3);
        savedHealthBar.width = savedTilesRatio * maxWidth;
        savedHealthBar.height = 8;

        damageBar.setX(x + maxWidth / 2 - damagedTilesRatio * maxWidth);
        damageBar.setY(y + 4);
        damageBar.width = damagedTilesRatio * maxWidth;
        damageBar.height = 6;
      } else {
        rectangle.setX(x);
        rectangle.setY(y - 2);
        rectangle.width = 10;
        rectangle.height = 25;

        savedHealthBar.setX(x - 5);
        savedHealthBar.setY(y - 15 + (25 - savedTilesRatio * 25));
        savedHealthBar.width = 10;
        savedHealthBar.height = 25 * savedTilesRatio;

        damageBar.setX(x - 5);
        damageBar.setY(y - 14);
        damageBar.width = 10;
        damageBar.height = 25 * damagedTilesRatio;
      }
    });

    const statusIcon: Phaser.GameObjects.Sprite = this.scene.add.existing(
      <sprite
        x={x}
        y={y - 32}
        texture={RESOURCES["poi-status-icons"]}
        frame={3}
      />
    );

    this.state = computed(() => {
      if (this.tilesLeft.get() === 0) {
        if (this.damagedTiles.get() === 0) {
          return POI_STATE.SAVED;
        } else if (this.damagedTiles.get() === this.maxTiles.get()) {
          return POI_STATE.DAMAGED;
        }
        return POI_STATE.PARTIALLY_SAVED;
      }

      if (this.tilesLeft.get() !== this.maxTiles.get()) {
        return POI_STATE.EVACUATING;
      }

      return POI_STATE.UNTOUCHED;
    });

    this.finalState = computed(() => {
      if (this.damagedTiles.get() === 0) {
        return POI_STATE.SAVED;
      } else if (this.damagedTiles.get() === this.maxTiles.get()) {
        return POI_STATE.DAMAGED;
      }
      return POI_STATE.PARTIALLY_SAVED;
    });

    effect(() => {
      const state = this.state.get();

      // Triggering an update on the run so it updates its state
      this.scene.gameState.currentRun.mutate(() => true);

      if (state === POI_STATE.UNTOUCHED) {
        statusIcon.setVisible(false);
      } else {
        statusIcon.setVisible(true);
      }

      switch (state) {
        case POI_STATE.EVACUATING:
          statusIcon.setFrame(3);
          break;
        case POI_STATE.SAVED:
          statusIcon.setFrame(1);
          break;
        case POI_STATE.DAMAGED:
          statusIcon.setFrame(0);
          break;
        case POI_STATE.PARTIALLY_SAVED:
          statusIcon.setFrame(2);
          break;
      }
    });

    // TODO: Fix this on the map file. This is now how much one tile takes to be saved
    this.timeout = 5;

    this.timer = this.scene.time.addEvent({
      delay: this.timeout * 1000,
      callback: () => {
        this.saveTile();
      },
      callbackScope: this,
      paused: true,
    });

    // Start the timer
    this.scene.time.delayedCall(delay * 1000, () => {
      this.timer.paused = false;
    });

    const pin: Phaser.GameObjects.Sprite = (
      <sprite
        x={x}
        y={y}
        texture={RESOURCES["pin-vertical"]}
        frame={0}
        interactive={true}
        onPointerover={() => {
          this.open.set(true);
          pin.play("pin-vertical-flash");
          this.legend.setVisible(true);
        }}
        onPointerout={() => {
          this.open.set(false);
          pin.play("pin-vertical-hide");
          this.legend.setVisible(false);
        }}
      />
    );

    this.scene.add.existing(pin);

    pin.setVisible(false);

    this.legend = this.scene.add
      .text(x, y, name, {
        fontFamily: "DotGothic16",
        fontSize: "12px",
        color: "#36170c",
      })
      .setOrigin(0.5, 1.1)
      .setVisible(false);

    this.scene.time.delayedCall(100 * id, () => {
      pin.setVisible(true);
      this.open.set(true);
      pin.play("pin-vertical-flash");
      this.scene.time.delayedCall(300, () => {
        this.legend.setVisible(true);
      });
    });

    this.scene.time.delayedCall(2500, () => {
      this.legend.setVisible(false);
      pin.play("pin-vertical-hide");
      this.open.set(false);
    });
  }

  damageTile() {
    const damage = 1;

    if (this.tilesLeft.get() > 0) {
      this.tilesLeft.update((value) => value - damage);
      this.damagedTiles.update((value) => value + damage);
      this.legend.setText(`${this.maxTiles.get() - this.damagedTiles.get()}%`);
    }
  }

  saveTile() {
    if (this.tilesLeft.get() > 0) {
      this.tilesLeft.update((value) => value - 1);
      this.savedTiles.update((value) => value + 1);
    }
  }

  addTileCount(count: number) {
    this.tilesLeft.update((value) => value + count);
  }

  setMaxTiles() {
    this.maxTiles.set(this.tilesLeft.get());
    this.timer.repeatCount = this.maxTiles.get();
  }
}
