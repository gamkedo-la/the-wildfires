import { MapScene } from "../../scenes/game/map-scene";
import { Vehicle } from "./Vehicle";

export class Martin extends Vehicle {
  constructor(scene: MapScene, x: number, y: number) {
    super(scene, x, y, "martin-spritesheet");

    this.maxSpeed = 50;
    this.accelerationRate = 1;
    this.turnRate = Math.PI * 0.35;

    this.tankCapacity = 600;
    this.tankLevel = 0;
    this.tankConsumptionRate = 130;
    this.tankRefillRate = 150;

    this.turningState.set(50);
    this.turningBias = 120;
    this.straightBias = 280;
  }
}
