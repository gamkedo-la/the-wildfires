import PhaserGamebus from "./lib/gamebus";
import { RexUIPlugin } from "./lib/rexui";

import { Boot } from "./scenes/boot/boot-scene";
import { Preloader } from "./scenes/boot/preloader-scene";
import { Debug } from "./scenes/debug-scene";

import { GameScene as MainGame } from "./scenes/game-scene";

import { Game, Types } from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "./consts";
import { PauseScene } from "./scenes/pause-scene";
import { UIScene } from "./scenes/ui-scene";
import { SummaryScene } from "./scenes/summary-scene";
import { GameStateManager } from "./state/game-state";

const config: Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: "game-container",
  backgroundColor: "#028af8",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  plugins: {
    global: [
      {
        key: "PhaserGamebus",
        plugin: PhaserGamebus,
        start: true,
        mapping: "gamebus",
      },
      {
        key: "GameStateManager",
        plugin: GameStateManager,
        mapping: "gameState",
      },
    ],
    scene: [
      {
        key: "rexUI",
        plugin: RexUIPlugin,
        mapping: "rexUI",
      },
    ],
  },
  scene: [Boot, Preloader, MainGame, UIScene, PauseScene, SummaryScene, Debug],
};

export default new Game(config);
