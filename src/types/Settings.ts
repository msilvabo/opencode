import type { City } from "./City";
import type { TemperatureUnit } from "./Weather";

export interface AppConfig {
  cities: City[];
  defaultCity: City | null;
  unit: TemperatureUnit;
}
