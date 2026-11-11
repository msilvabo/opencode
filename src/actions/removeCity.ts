import type { AppConfig } from "../types/Settings";
import { saveCitiesState } from "../storage/citiesStorage";
import { printError, printInfo, printSuccess } from "../presentation/output";
import { readCityName } from "../presentation/input";
import { listCities } from "./listCities";

function findCityIndex(config: AppConfig, name: string): number {
  const normalized = name.trim().toLowerCase();
  return config.cities.findIndex(
    (city) => city.name.toLowerCase() === normalized,
  );
}

export async function removeCity(config: AppConfig): Promise<void> {
  if (!listCities(config)) {
    return;
  }

  const name = await readCityName();

  const index = name !== null ? findCityIndex(config, name) : -1;
  if (name === null || index === -1) {
    printError(`"${name ?? ""}" no está en tu lista de ciudades.`);
    return;
  }

  const [removed] = config.cities.splice(index, 1);

  if (removed !== undefined) {
    if (
      config.defaultCity !== null &&
      config.defaultCity.name === removed.name
    ) {
      config.defaultCity = config.cities[0] ?? null;
      printInfo(
        config.defaultCity !== null
          ? `La ciudad default ahora es: ${config.defaultCity.name}.`
          : "Ya no hay ciudad default.",
      );
    }

    await saveCitiesState(config);
    printSuccess(`Ciudad eliminada: ${removed.name}.`);
  }
}
