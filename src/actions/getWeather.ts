import { getCurrentTemperature } from "../api/weather";
import type { City } from "../types/City";
import type { AppConfig } from "../types/Settings";
import { printError, printInfo, printWeather } from "../presentation/output";

async function fetchWeather(config: AppConfig, city: City): Promise<void> {
  try {
    const temperature = await getCurrentTemperature(
      city.latitude,
      city.longitude,
      config.unit,
    );

    printWeather({ city, temperature, unit: config.unit });
  } catch (error) {
    printError(
      error instanceof Error
        ? `No se pudo obtener el clima de ${city.name}: ${error.message}`
        : `No se pudo obtener el clima de ${city.name}`,
    );
  }
}

export async function showDefaultCityWeather(config: AppConfig): Promise<void> {
  if (config.defaultCity === null) {
    printInfo("No hay ciudad default. Usa la opción 5 para establecer una.");
    return;
  }

  await fetchWeather(config, config.defaultCity);
}

export async function showAllCitiesWeather(config: AppConfig): Promise<void> {
  if (config.cities.length === 0) {
    printInfo("No hay ciudades guardadas. Usa la opción 3 para agregar una.");
    return;
  }

  for (const city of config.cities) {
    await fetchWeather(config, city);
  }
}
