import type { TemperatureUnit } from "../types/Weather";
import { readConfigFile, writeConfigFile } from "./configFile";

function isTemperatureUnit(value: unknown): value is TemperatureUnit {
  return value === "celsius" || value === "fahrenheit";
}

export async function loadTemperatureUnit(): Promise<TemperatureUnit> {
  const data = await readConfigFile();

  return isTemperatureUnit(data.unit) ? data.unit : "celsius";
}

export async function saveTemperatureUnit(unit: TemperatureUnit): Promise<void> {
  await writeConfigFile({ unit });
}
