import { GameMap } from "@game/entities/maps/GameMap";

import { PointOfInterest } from "../entities/point-of-interest/PointOfInterest";
import { Vehicle } from "../entities/vehicles/Vehicle";
import { mutable } from "./lib/signals";
import { MutableSignal } from "./lib/types";

const END_REASONS = {
  FIRE_EXTINGUISHED: "fire-extinguished",
  POI_SAVED: "poi-saved",
  POI_DESTROYED: "poi-destroyed",
} as const;

interface Run {
  vehicle?: Vehicle;
  map?: GameMap;
  poi: PointOfInterest[];
  time: number;
  score: number;
  endReason: (typeof END_REASONS)[keyof typeof END_REASONS];
}

interface GameState {
  currentRun: MutableSignal<Run | null>;
  runs: Run[];
}

export class GameStateManager
  extends Phaser.Plugins.BasePlugin
  implements GameState
{
  currentRun: MutableSignal<Run | null> = mutable(null);
  runs: Run[] = [];

  constructor(pluginManager: Phaser.Plugins.PluginManager) {
    super(pluginManager);

    // TODO: When we will have a menu, we will create a new run there
    this.currentRun.set({
      vehicle: undefined,
      map: undefined,
      poi: [],
      time: 0,
      score: 0,
      endReason: END_REASONS.FIRE_EXTINGUISHED,
    });
  }

  addPointOfInterest(poi: PointOfInterest) {
    this.currentRun.mutate((run) => {
      run?.poi.push(poi);
      return true;
    });
  }

  setMaxTiles() {
    this.currentRun.get()?.poi.forEach((poi) => {
      poi.setMaxTiles();
    });
  }

  causePointOfInterestDamage(poiId: number) {
    const poi = this.currentRun.get()?.poi.find((poi) => poi.id === poiId);
    poi?.damageTile();
  }

  updatePointOfInterestTileCount(poiId: number) {
    const poi = this.currentRun.get()?.poi.find((poi) => poi.id === poiId);
    poi?.addTileCount(1);
  }
}
