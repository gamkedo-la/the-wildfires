export class JSXScene extends Phaser.Scene {
  init() {
    // Required to make JSX magic happen
    (window as any).currentScene = this;
  }
}
