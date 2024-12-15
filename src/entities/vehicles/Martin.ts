import { signal } from "@game/state/lib/signals";
import { MapScene } from "../../scenes/game/map-scene";
import { Vehicle } from "./Vehicle";

export class Martin extends Vehicle {
  constructor(scene: MapScene, x: number, y: number) {
    super(scene, x, y, "martin-spritesheet", 0.35, "MARTIN");

    this.maxSpeed = 50;
    this.accelerationRate = 1;
    this.turnRate = Math.PI * 0.35;

    this.waterTankCapacity = 600;
    this.waterTankConsumptionRate = 130;
    this.waterTankRefillRate = 150;

    this.waterTankLevel = signal(0);
    this.retardantTankLevel = signal(0);

    this.turningState.set(50);
    this.turningBias = 120;
    this.straightBias = 280;
  }
}
