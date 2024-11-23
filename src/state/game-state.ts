import MAPS, { MapType } from "../entities/maps";
import { PointOfInterest } from "../entities/point-of-interest/PointOfInterest";
import { VEHICLES, VehicleType } from "../entities/vehicles";
import { mutable } from "./lib/signals";
import { MutableSignal, Signal } from "./lib/types";

export const END_REASONS = {
  FIRE_EXTINGUISHED: "fire-extinguished",
  POI_SAVED: "poi-saved",
  POI_DESTROYED: "poi-destroyed",
} as const;

export interface Run {
  vehicle: VehicleType;
  map: MapType;
  poi: PointOfInterest[];
  time: number;
  score: number;
  endReason?: (typeof END_REASONS)[keyof typeof END_REASONS];
}

export interface GameState {
  currentRun: MutableSignal<Run | null>;
  runs: Run[];
}

export class GameStateManager
  extends Phaser.Plugins.BasePlugin
  implements GameState
{
  runs: Run[] = [];

  currentRun: MutableSignal<Run> = mutable(this.getEmptyRun());
  runCount: Signal<number> = mutable(0);

  constructor(pluginManager: Phaser.Plugins.PluginManager) {
    super(pluginManager);
  }

  private mutateRun(mutation: (run: Run) => boolean): void {
    const run = this.currentRun.get();
    if (!run) {
      throw new Error("Run not started");
    }

    this.currentRun.mutate(() => {
      return mutation(run);
    });
  }

  getEmptyRun(): Run {
    return {
      vehicle: "CANADAIR",
      map: "CONTINENTAL",
      poi: [],
      time: 0,
      score: 0,
    };
  }

  startRun(runConfiguration: Run) {
    if (this.runCount.get() !== this.runs.length && this.currentRun.get()) {
      throw new Error("Run already started");
    }

    this.currentRun.set(runConfiguration);
    this.runCount.update((count) => count + 1);
  }

  endRun(reason: (typeof END_REASONS)[keyof typeof END_REASONS]) {
    this.mutateRun((run) => {
      run.endReason = reason;
      this.runs.push(run);
      return true;
    });
  }

  setVehicle(vehicle: VehicleType) {
    this.mutateRun((run) => {
      run.vehicle = vehicle;
      return true;
    });
  }

  setMap(map: MapType) {
    this.mutateRun((run) => {
      run.map = map;
      return true;
    });
  }

  setMaxTiles() {
    this.mutateRun((run) => {
      run.poi.forEach((poi) => {
        poi.setMaxTiles();
      });
      return true;
    });
  }

  addPointOfInterest(poi: PointOfInterest) {
    this.mutateRun((run) => {
      run.poi.push(poi);
      return true;
    });
  }

  causePointOfInterestDamage(poiId: number) {
    this.mutateRun((run) => {
      run.poi.find((poi) => poi.id === poiId)?.damageTile();
      return true;
    });
  }

  updatePointOfInterestTileCount(poiId: number) {
    this.mutateRun((run) => {
      const poi = run.poi.find((poi) => poi.id === poiId);
      poi?.addTileCount(1);
      return true;
    });
  }
}
