import { System } from "..";
import vehicles from "../../entities/vehicles";
import { Canadair } from "../../entities/vehicles/Canadair";
import { Vehicle } from "../../entities/vehicles/Vehicle";
import { GameScene } from "../../scenes/game-scene";

export class VehicleSystem implements System {
  scene: GameScene;
  vehicle: Vehicle;
  vehicleType: string;

  constructor(scene: GameScene, vehicleType: string = "canadair") {
    this.scene = scene;
    this.vehicleType = vehicleType;

    // TODO With future picker for vehicle type, this will take into consideration vehicle type
    this.vehicle = new Canadair(this.scene, 382, 235);
  }

  create(): this {
    return this;
  }

  update(time: number, delta: number): void {
    this.vehicle.update(time, delta);

    if (this.scene.space_key.isDown) {
      this.vehicle.useTank();
    }
  }

  changeVehicle(type: string): void {
    const position = this.vehicle.position;
    this.vehicle.destroy();

    const VehicleClass = vehicles[type as keyof typeof vehicles];

    if (VehicleClass) {
      this.vehicle = new VehicleClass(this.scene, position.x, position.y);
    } else {
      console.warn(`Vehicle type ${type} not found`);
    }
  }
}
