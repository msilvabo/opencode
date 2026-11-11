import type { City } from "../types/City";
import type { AppConfig } from "../types/Settings";
import { readConfigFile, writeConfigFile } from "./configFile";

export interface CitiesState {
  cities: City[];
  defaultCity: City | null;
}

export async function loadCitiesState(): Promise<CitiesState> {
  const data = await readConfigFile();

  return {
    cities: Array.isArray(data.cities) ? data.cities : [],
    defaultCity: data.defaultCity ?? null,
  };
}

export async function saveCitiesState(state: CitiesState): Promise<void> {
  await writeConfigFile({
    cities: state.cities,
    defaultCity: state.defaultCity,
  });
}
