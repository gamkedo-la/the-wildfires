import { System } from "..";
import vehicles from "../../entities/vehicles";
import { Canadair } from "../../entities/vehicles/Canadair";
import { Vehicle } from "../../entities/vehicles/Vehicle";
import { MapScene } from "../../scenes/game/map-scene";

export class VehicleSystem implements System {
  scene: MapScene;
  vehicle: Vehicle;
  vehicleType: string;

  constructor(scene: MapScene, vehicleType: string = "canadair") {
    this.scene = scene;
    this.vehicleType = vehicleType;

    // TODO With future picker for vehicle type, this will take into consideration vehicle type
    this.vehicle = new Canadair(
      this.scene,
      this.scene.currentMap.aircraftStartPosition.x,
      this.scene.currentMap.aircraftStartPosition.y
    );
  }

  create(): this {
    return this;
  }

  update(time: number, delta: number): void {
    this.vehicle.update(time, delta);
    this.vehicle.useTank(time, delta);
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

  destroy(): void {
    this.vehicle.destroy();
  }
}
