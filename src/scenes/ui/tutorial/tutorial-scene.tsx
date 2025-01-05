import { RESOURCES } from "@game/assets";
import { TEXT_STYLE } from "@game/consts";
import { AbstractScene } from "../../";
import { SCENES } from "../../consts";
import { Directions } from "./Directions";
import { FireVelocity } from "./FireVelocity";
import { PoiStatuses } from "./PoiStatuses";
import { RetardantDrop } from "./RetardantDrop";
import { WaterCollection } from "./WaterCollection";
import { WaterDrop } from "./WaterDrop";
import { END_REASONS } from "@game/state/game-state";

export class TutorialScene extends AbstractScene {
  constructor() {
    super(SCENES.UI_TUTORIAL);
  }

  key_enter!: Phaser.Input.Keyboard.Key;
  key_esc!: Phaser.Input.Keyboard.Key;
  create() {
    this.key_enter = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.ENTER
    );
    this.key_esc = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    );

    const { width, height } = this.scale;

    this.add.existing(
      <rectangle
        x={0}
        y={0}
        origin={0}
        width={width}
        height={height}
        fillColor={0x000000}
        alpha={0.85}
        scrollFactor={0}
      />
    );

    this.add.existing(
      <text
        x={width / 2}
        originX={0.5}
        y={30}
        resolution={2}
        text="How to play"
        style={{ ...TEXT_STYLE, fontSize: 30, color: "#ffffff" }}
        scrollFactor={0}
      />
    );

    this.add.existing(
      <container
        x={130}
        y={690}
        width={200}
        height={80}
        scrollFactor={0}
        interactive
        onPointerdown={() => {
          this.sound.play(RESOURCES["button"]);

          this.startGame();
        }}
      >
        <nineslice
          texture={RESOURCES["key-nine-slice"]}
          frame={0}
          originX={0.5}
          scale={2}
          x={0}
          y={0}
          width={100}
          tint={0xbbffbb}
          height={40}
          leftWidth={4}
          rightWidth={4}
          topHeight={4}
          bottomHeight={5}
        />
        <text
          text={"Preview mission"}
          x={0}
          y={0}
          origin={0.5}
          resolution={2}
          scrollFactor={0}
          style={{ ...TEXT_STYLE, fontSize: 22, color: "#000000" }}
        />
      </container>
    );

    this.add.existing(
      <container
        x={width / 2}
        y={690}
        width={200}
        height={80}
        scrollFactor={0}
        interactive
        onPointerdown={() => {
          this.sound.play(RESOURCES["button"]);

          this.next();
        }}
      >
        <nineslice
          texture={RESOURCES["key-nine-slice"]}
          frame={0}
          originX={0.5}
          scale={2}
          x={0}
          y={0}
          width={100}
          height={40}
          leftWidth={4}
          rightWidth={4}
          topHeight={4}
          bottomHeight={5}
        />
        <text
          text={"Next"}
          x={0}
          y={0}
          origin={0.5}
          resolution={2}
          scrollFactor={0}
          style={{ ...TEXT_STYLE, fontSize: 22, color: "#000000" }}
        />
      </container>
    );

    this.add.existing(<WaterCollection x={-1} y={90} scene={this} />);
    this.add.existing(
      <WaterDrop x={this.scale.width / 3} y={90} scene={this} />
    );
    this.add.existing(
      <RetardantDrop x={(2 * this.scale.width) / 3} y={90} scene={this} />
    );

    const text = "Collect water using space over bodies of water.";

    this.add.existing(
      <text
        x={35}
        originX={0}
        y={420}
        resolution={2}
        text={text}
        style={{ ...TEXT_STYLE, fontSize: 22, color: "#ffffff" }}
        wordWrapWidth={this.scale.width / 3 - 50}
      />
    );

    const text2 = "Drop water by selecting 1 and pressing space.";

    this.add.existing(
      <text
        x={this.scale.width / 2}
        originX={0.45}
        y={420}
        resolution={2}
        text={text2}
        style={{ ...TEXT_STYLE, fontSize: 22, color: "#ffffff" }}
        wordWrapWidth={this.scale.width / 3 - 50}
      />
    );

    const text3 = "Drop retardant spray by selecting 2 and space.";

    this.add.existing(
      <text
        x={(2 * this.scale.width) / 3 + 30}
        y={420}
        resolution={2}
        text={text3}
        style={{ ...TEXT_STYLE, fontSize: 22, color: "#ffffff" }}
        wordWrapWidth={this.scale.width / 3 - 30}
      />
    );

    const text4 =
      "Extinguishing fire, and other actions, will recharge your retardant tank. Retardant will hold back the fire for a short time. You will need full tank charges to drop it. Use it wisely.";

    this.add.existing(
      <text
        x={this.scale.width / 2}
        originX={0.45}
        y={530}
        resolution={2}
        text={text4}
        style={{ ...TEXT_STYLE, fontSize: 22, color: "#ffffff" }}
        wordWrapWidth={this.scale.width / 1.25}
      />
    );

    const nextPagePos = this.scale.width + 100;

    const text5 =
      "When fire comes close, locations will slowly start evacuation. You only have to protect them until they evacuate.Larger places will take longer to evacuate";

    this.add.existing(
      <text
        x={nextPagePos + this.scale.width / 2}
        originX={0.45}
        y={480}
        resolution={2}
        text={text5}
        style={{ ...TEXT_STYLE, fontSize: 22, color: "#ffffff" }}
        wordWrapWidth={this.scale.width / 1.35}
      />
    );

    this.add.existing(<Directions x={nextPagePos} y={110} scene={this} />);

    this.add.existing(
      <PoiStatuses
        x={nextPagePos + this.scale.width / 2}
        y={150}
        scene={this}
      />
    );

    this.add.existing(
      <FireVelocity
        x={nextPagePos + (2 * this.scale.width) / 3}
        y={70}
        scene={this}
      />
    );

    this.nextPage = false;
  }

  update(_time: number, _delta: number) {
    if (this.key_enter.isDown) {
      this.startGame();
    }

    if (this.key_esc.isDown) {
      this.gameState.endRun(END_REASONS.CANCELLED);
      this.scene.stop(SCENES.UI_TUTORIAL);
      this.scene.resume(SCENES.UI_HOME);
    }
  }

  nextPage = false;
  next() {
    this.nextPage = !this.nextPage;

    if (this.nextPage) {
      this.tweens.add({
        targets: this.cameras.main,
        scrollX: this.scale.width + 100,
        duration: 1000,
      });
    } else {
      this.tweens.add({
        targets: this.cameras.main,
        scrollX: 0,
        duration: 1000,
      });
    }
  }

  startGame() {
    this.scene.stop(SCENES.UI_TUTORIAL);
    this.scene.start(SCENES.UI_PREPLANNING);
  }

  shutdown() {}
}
