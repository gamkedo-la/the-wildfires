import { Math, Tilemaps } from "phaser";
import { GameScene } from "../../scenes/game-scene";
import { Vehicle } from "./Vehicle";

export class Martin extends Vehicle {
  constructor(scene: GameScene, x: number, y: number) {
    super(scene, x, y, "martin-spritesheet");

    this.maxSpeed = 1.0;
    this.accelerationRate = 0.1;
    this.turnRate = 1 / 100;

    this.tankCapacity = 600;
    this.tankLevel = 0;
    this.tankConsumptionRate = 3;
    this.tankRefillRate = 5;

    this.turningState = 50;
    this.turningBias = 7;
    this.straightBias = 7;
  }
}
