import PhaserGamebus from "./lib/gamebus";

import { Boot } from "./scenes/boot/boot-scene";
import { Preloader } from "./scenes/boot/preloader-scene";
import { Debug } from "./scenes/game/debug-scene";

import { MapScene as MainGame } from "./scenes/game/map-scene";

import { Game, Types } from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "./consts";
import { PauseScene } from "./scenes/ui/pause-scene";
import { HUDScene } from "./scenes/game/hud-scene";
import { SummaryScene } from "./scenes/ui/summary-scene";
import { GameStateManager } from "./state/game-state";
import { TutorialScene } from "./scenes/ui/tutorial/tutorial-scene";

const config: Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: "game-container",
  backgroundColor: "#028af8",
  pixelArt: true,
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
  },
  scene: [
    Boot,
    Preloader,
    MainGame,
    HUDScene,
    SummaryScene,
    TutorialScene,
    PauseScene,
    Debug,
  ],
};

export default new Game(config);
