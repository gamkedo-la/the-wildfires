import { Scene } from "phaser";
import { ListBladeApi, Pane } from "tweakpane";
import { GameScene } from "./game-scene";

export const params = {
  fps: 0,
};

export class Debug extends Scene {
  declare pane: Pane;

  constructor() {
    super("Debug");
  }

  create() {
    this.pane = new Pane();
    this.pane.addBinding(params, "fps", { readonly: true });

    // Add bindings for damage and water levels
    const gameScene = this.scene.get("Game") as GameScene;

    this.pane.addBinding(gameScene, "damageLevel", {
      label: "Damage Level",
      min: 0,
      max: gameScene.maxDamageLevel,
      step: 1,
      disabled: true,
    });

    this.pane.addBinding(gameScene, "waterLevel", {
      label: "Water Level",
      min: 0,
      max: 200,
      step: 1,
      disabled: true,
    });

    // Add a button to refill water
    this.pane
      .addButton({
        title: "Refill Water",
      })
      .on("click", () => {
        gameScene.waterLevel = 200;
        gameScene.gamebus.emit("water_level_changed", 200);
      });

    let vehicles = gameScene.vehiclesSystem.getVehicles();

    let vehiclePicker = this.pane.addBlade({
      view: "list",
      label: "vehicle",
      options: vehicles.map(v => { return { text: v, value: v } }),
      value: vehicles[0],
    }) as ListBladeApi<string>;

    vehiclePicker.on("change", ({ value }) => {
      gameScene.vehiclesSystem.setVehicle(value);
    });
  }

  update() {
    params.fps = this.game.loop.actualFps;
    //params.worldCoord.x = worldPoint.x;
    //params.worldCoord.y = worldPoint.y;

    this.pane.refresh();
  }
}
