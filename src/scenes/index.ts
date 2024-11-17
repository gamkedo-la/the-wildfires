import PhaserGamebus from "@game/lib/gamebus";
import { GameStateManager } from "@game/state/game-state";

export class JSXScene extends Phaser.Scene {
  // Game plugins
  declare gameState: GameStateManager;
  declare bus: Phaser.Events.EventEmitter;
  declare gamebus: PhaserGamebus;

  init() {
    // Required to make JSX magic happen
    (window as any).currentScene = this;
  }
}
