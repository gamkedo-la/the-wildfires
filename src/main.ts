import PhaserGamebus from "./lib/gamebus";
import { RexUIPlugin } from "./lib/rexui";

import { Boot } from "./scenes/boot/boot-scene";
import { Preloader } from "./scenes/boot/preloader-scene";
import { Debug } from "./scenes/debug-scene";

import { GameScene as MainGame } from "./scenes/game-scene";

import { Game, Types } from "phaser";
import { UIScene } from "./scenes/ui-scene";
import { PauseScene } from "./scenes/pause-scene";

export const GAME_WIDTH = 1024;
export const GAME_HEIGHT = 768;

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
    ],
    scene: [
      {
        key: "rexUI",
        plugin: RexUIPlugin,
        mapping: "rexUI",
      },
    ],
  },
  scene: [Boot, Preloader, MainGame, UIScene, PauseScene, Debug],
};

export default new Game(config);
