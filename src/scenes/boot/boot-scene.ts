import { Scene } from "phaser";

export class Boot extends Scene {
  constructor() {
    super("Boot");
  }

  preload() {
    //  Assets that will be used on the preloader (logo, etc) may be loaded here in the future
  }

  create() {
    this.scene.start("Preloader");
  }
}
