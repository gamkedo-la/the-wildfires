import { Canadair } from "./Canadair";
import { Martin } from "./Martin";
import { Skycrane } from "./Skycrane";

export const VEHICLES = {
  CANADAIR: Canadair,
  MARTIN: Martin,
  SKYCRANE: Skycrane,
} as const;

export type VehicleType = keyof typeof VEHICLES;
export type VehicleClass = (typeof VEHICLES)[VehicleType];
