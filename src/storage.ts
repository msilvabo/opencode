import type { AppConfig, TemperatureUnit } from "./models";

const DATA_FILE = "cities.json";

const defaultConfig: AppConfig = {
  cities: [],
  defaultCity: null,
  unit: "celsius",
};

function isTemperatureUnit(value: unknown): value is TemperatureUnit {
  return value === "celsius" || value === "fahrenheit";
}

export async function loadConfig(): Promise<AppConfig> {
  try {
    const raw = await Bun.file(DATA_FILE).text();
    const parsed = JSON.parse(raw) as Partial<AppConfig>;

    return {
      cities: Array.isArray(parsed.cities) ? parsed.cities : [],
      defaultCity: parsed.defaultCity ?? null,
      unit: isTemperatureUnit(parsed.unit) ? parsed.unit : "celsius",
    };
  } catch {
    // Si el archivo no existe o es inválido, empezamos con configuración limpia.
    return { ...defaultConfig };
  }
}

export async function saveConfig(config: AppConfig): Promise<void> {
  await Bun.write(DATA_FILE, JSON.stringify(config, null, 2));
}
