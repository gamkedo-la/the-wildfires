import { GameMap } from "@game/entities/maps/GameMap";

import { Vehicle } from "../entities/vehicles/Vehicle";
import { PointOfInterest } from "../entities/point-of-interest/PointOfInterest";

const END_REASONS = {
  FIRE_EXTINGUISHED: "fire-extinguished",
  POI_SAVED: "poi-saved",
  POI_DESTROYED: "poi-destroyed",
} as const;

interface Run {
  vehicle: Vehicle;
  map: GameMap;
  poi: PointOfInterest[];
  time: number;
  score: number;
  endReason: (typeof END_REASONS)[keyof typeof END_REASONS];
}

interface GameState {
  currentRun: Run;
  runs: Run[];
}

export class GameStateManager {
  static state: GameState;

  private constructor() {}
}
