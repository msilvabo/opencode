import type { AppConfig } from "../types/Settings";
import { saveCitiesState } from "../storage/citiesStorage";
import { printError, printSuccess } from "../presentation/output";
import { readCityName } from "../presentation/input";
import { listCities } from "./listCities";

export async function setDefaultCity(config: AppConfig): Promise<void> {
  if (!listCities(config)) {
    return;
  }

  const name = await readCityName();

  const city =
    name !== null
      ? config.cities.find(
          (candidate) =>
            candidate.name.toLowerCase() === name.trim().toLowerCase(),
        )
      : undefined;

  if (city === undefined) {
    printError(`"${name ?? ""}" no está en tu lista de ciudades.`);
    return;
  }

  config.defaultCity = city;
  await saveCitiesState(config);
  printSuccess(`Ciudad default establecida: ${city.name}.`);
}
