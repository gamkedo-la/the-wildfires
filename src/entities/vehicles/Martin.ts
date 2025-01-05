import { signal } from "@game/state/lib/signals";
import { MapScene } from "../../scenes/game/map-scene";
import { Vehicle } from "./Vehicle";

export class Martin extends Vehicle {
  static model = "Martin JRM-3 Mars";
  static description =
    "Slow but powerful.It can swoop up to 27,000L of water in 22 seconds.";

  constructor(scene: MapScene, x: number, y: number) {
    super(scene, x, y, "martin-spritesheet", "martin-outline", 0.35, "MARTIN");

    this.maxSpeed = 50;
    this.accelerationRate = 1;
    this.turnRate = Math.PI * 0.45;

    this.waterTankCapacity = 300;
    this.waterTankConsumptionRate = 130;
    this.waterTankRefillRate = 150;

    this.waterTankLevel = signal(0);
    this.retardantTankLevel = signal(0);

    this.turningState.set(50);
    this.turningBias = 120;
    this.straightBias = 280;
  }
}
