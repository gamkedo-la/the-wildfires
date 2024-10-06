import { Scene } from "phaser";
import { FolderApi, InputBindingApi, Pane, ButtonApi } from "tweakpane";
import { GameScene } from "./game-scene";
import { Vehicle } from "../entities/vehicles/Vehicle";
import vehicles from "../entities/vehicles";

interface VehicleConfig {
  speed: number;
  turnRate: number;
  waterCapacity: number;
}

export const params = {
  fps: 0,
  windAngle: 0,
  windSpeed: 0
};

export class Debug extends Scene {
  declare pane: Pane;
  declare vehicleBindings: (InputBindingApi<any, any> | ButtonApi)[];

  constructor() {
    super("Debug");
  }

  vehicleConfig: any = {};

  create() {
    this.pane = new Pane();
    this.pane.addBinding(params, "fps", { readonly: true });
    this.pane.addBinding(params, "windAngle", { readonly: true });
    this.pane.addBinding(params, "windSpeed", { readonly: true });

    // Add bindings for damage and water levels
    const gameScene = this.scene.get("Game") as GameScene;

    this.pane.addBinding(gameScene, "damageLevel", {
      label: "Damage Level",
      min: 0,
      max: gameScene.maxDamageLevel,
      step: 1,
      disabled: true,
    }) as InputBindingApi<number, number>;

    this.vehicleBindings = [];
    this.addVehicleControls(gameScene);
  }

  addVehicleControls(gameScene: GameScene) {
    const vehicleFolder = this.pane.addFolder({ title: "Vehicle" });

    vehicleFolder
      .addBinding(gameScene.vehiclesSystem, "vehicleType", {
        options: Object.keys(vehicles).reduce(
          (acc: Record<string, string>, key) => {
            acc[key] = key;
            return acc;
          },
          {} as Record<string, string>
        ),
      })
      .on("change", ({ value }) => {
        this.changeVehicle(gameScene, value, vehicleFolder);
      });

    this.addVehicleParameters(vehicleFolder, gameScene.vehiclesSystem.vehicle);
  }

  changeVehicle(gameScene: GameScene, type: string, vehicleFolder: FolderApi) {
    gameScene.vehiclesSystem.changeVehicle(type);
    this.removeVehicleParameters();
    this.addVehicleParameters(vehicleFolder, gameScene.vehiclesSystem.vehicle);
  }

  removeVehicleParameters() {
    this.vehicleBindings.forEach((binding) => binding.dispose());
    this.vehicleBindings = [];
  }

  addVehicleParameters(folder: FolderApi, vehicle: Vehicle) {
    const excludedProperties = [
      "scene",
      "image",
      "position",
      "velocity",
      "acceleration",
      "direction",
    ];
    const numericProperties = [
      "maxSpeed",
      "accelerationRate",
      "turnRate",
      "tankCapacity",
      "tankLevel",
      "tankConsumptionRate",
      "tankRefillRate",
      "turningBias",
      "straightBias",
    ];

    const parameterConfig: Record<
      string,
      { min: number; max: number; step: number; format?: (v: number) => string; }
    > = {
      maxSpeed: { min: 0, max: 200, step: 1 },
      accelerationRate: { min: 0, max: 300, step: 1 },
      turnRate: { min: 0, max: 2 * Math.PI, step: Math.PI / 180, format: (v: number) => v.toFixed(2) },
      tankCapacity: { min: 0, max: 2000, step: 10 },
      tankLevel: { min: 0, max: 2000, step: 10 },
      tankConsumptionRate: { min: 0, max: 300, step: 1 },
      tankRefillRate: { min: 0, max: 500, step: 1 },
      turningBias: { min: 0, max: 500, step: 1 },
      straightBias: { min: 0, max: 500, step: 1 },
    };

    for (const [key, value] of Object.entries(vehicle)) {
      if (excludedProperties.includes(key)) continue;

      if (typeof value === "number") {
        let binding: InputBindingApi<number, number>;

        if (key in parameterConfig) {
          const config = parameterConfig[key as keyof typeof parameterConfig];
          binding = folder.addBinding(
            vehicle,
            key as keyof Vehicle,
            config
          ) as InputBindingApi<number, number>;
        } else {
          binding = folder.addBinding(
            vehicle,
            key as keyof Vehicle
          ) as InputBindingApi<number, number>;
        }

        binding.on("change", ({ value }) => {
          this.vehicleConfig[key as keyof VehicleConfig] = value;
        });

        if (key === "tankCapacity") {
          binding.on("change", ({ value }) => {
            const tankLevelBinding = this.vehicleBindings.find(
              (b) => (b as any).label === "tankLevel"
            ) as InputBindingApi<number, number>;
            if (tankLevelBinding) {
              (tankLevelBinding as any).max = value;
            }
          });
        }

        this.vehicleBindings.push(binding);
      } else if (typeof value === "boolean") {
        const binding = folder.addBinding(
          vehicle,
          key as keyof Vehicle
        ) as InputBindingApi<boolean, boolean>;
        this.vehicleBindings.push(binding);
      }
    }

    // Add a button to refill water
    const refillWaterButton = folder
      .addButton({
        title: "Refill Water",
      })
      .on("click", () => {
        vehicle.tankLevel = vehicle.tankCapacity;
      });

    this.vehicleBindings.push(refillWaterButton);
  }

  update() {
    const gameScene = this.scene.get("Game") as GameScene;
    const { angle, speed } = gameScene.windSystem.get();
    params.fps = this.game.loop.actualFps;
    params.windAngle = angle;
    params.windSpeed = speed;
    this.pane.refresh();
  }
}
