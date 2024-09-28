import { GameScene } from "../../scenes/game-scene";
import { Vehicle } from "./Vehicle";

export class Canadair extends Vehicle {
  constructor(scene: GameScene, x: number, y: number) {
    super(scene, x, y, "canadair-spritesheet", 0.4);

    this.maxSpeed = 1.3;
    this.accelerationRate = 0.1;
    this.turnRate = 1 / 33;

    this.tankCapacity = 100;
    this.tankLevel = 0;
    this.tankConsumptionRate = 3;
    this.tankRefillRate = 5;

    this.turningState = 50;
    this.turningBias = 3;
    this.straightBias = 7;
  }
}
