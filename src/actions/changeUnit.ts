import type { AppConfig } from "../types/Settings";
import { saveTemperatureUnit } from "../storage/settingsStorage";
import { printSuccess } from "../presentation/output";

export async function changeUnit(config: AppConfig): Promise<void> {
  config.unit = config.unit === "celsius" ? "fahrenheit" : "celsius";
  await saveTemperatureUnit(config.unit);
  printSuccess(
    `Unidad de temperatura: ${config.unit === "celsius" ? "°C (celsius)" : "°F (fahrenheit)"}.`,
  );
}
