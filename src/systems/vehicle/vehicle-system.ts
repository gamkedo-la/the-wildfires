import { VEHICLES } from "@game/entities/vehicles/index";
import { System } from "..";
import { Vehicle } from "../../entities/vehicles/Vehicle";
import { MapScene } from "../../scenes/game/map-scene";

export class VehicleSystem implements System {
  scene: MapScene;
  vehicle: Vehicle;
  vehicleType: keyof typeof VEHICLES;

  constructor(scene: MapScene, vehicleType: keyof typeof VEHICLES) {
    this.scene = scene;
    this.vehicleType = vehicleType;

    // TODO With future picker for vehicle type, this will take into consideration vehicle type
    this.vehicle = new VEHICLES[vehicleType](
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
    this.vehicle.loadRetardantCharge(delta);
  }

  changeVehicle(type: keyof typeof VEHICLES): void {
    const position = this.vehicle.position;

    this.vehicle.destroy();

    const VehicleClass = VEHICLES[type];

    if (VehicleClass) {
      this.vehicle = new VehicleClass(
        this.scene,
        position.get().x,
        position.get().y
      );
    } else {
      console.warn(`Vehicle type ${type} not found`);
    }
  }

  destroy(): void {
    this.vehicle.destroy();
  }
}
