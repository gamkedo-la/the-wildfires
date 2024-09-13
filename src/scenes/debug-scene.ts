import { Scene } from "phaser";
import { Pane } from "tweakpane";

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
  }

  update() {
    params.fps = this.game.loop.actualFps;
    //params.worldCoord.x = worldPoint.x;
    //params.worldCoord.y = worldPoint.y;

    this.pane.refresh();
  }
}
