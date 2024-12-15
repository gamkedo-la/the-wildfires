import { signal } from "@game/state/lib/signals";
import { MapScene } from "../../scenes/game/map-scene";
import { Vehicle } from "./Vehicle";

export class Canadair extends Vehicle {
  constructor(scene: MapScene, x: number, y: number) {
    super(scene, x, y, "canadair-spritesheet", 0.4, "CANADAIR");

    this.maxSpeed = 60;
    this.accelerationRate = 1; // was 130; but this was instant
    this.turnRate = Math.PI * 0.75;

    this.waterTankCapacity = 200;
    this.waterTankConsumptionRate = 130;
    this.waterTankRefillRate = 150;

    this.waterTankLevel = signal(0);
    this.retardantTankLevel = signal(0);

    this.turningState.set(50);
    this.turningBias = 200;
    this.straightBias = 400;
  }
}
