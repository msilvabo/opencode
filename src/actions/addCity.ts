import { searchCities } from "../api/geocoding";
import type { City } from "../types/City";
import type { AppConfig } from "../types/Settings";
import { saveCitiesState } from "../storage/citiesStorage";
import {
  printCityChoices,
  printError,
  printInfo,
  printSuccess,
} from "../presentation/output";
import { readCityChoice, readCityName } from "../presentation/input";

function isAlreadySaved(cities: City[], city: City): boolean {
  return cities.some(
    (saved) =>
      saved.latitude === city.latitude && saved.longitude === city.longitude,
  );
}

export async function addCity(config: AppConfig): Promise<void> {
  const name = await readCityName();
  if (name === null || name === "") {
    printInfo("No se ingresó ningún nombre.");
    return;
  }

  try {
    const results = await searchCities(name);

    if (results.length === 0) {
      printError(`La ciudad "${name}" no fue encontrada.`);
      return;
    }

    let city: City;

    if (results.length === 1) {
      city = results[0]!;
    } else {
      printCityChoices(results);
      const choice = await readCityChoice(results.length);

      if (choice === null || choice === 0) {
        printInfo("Selección cancelada.");
        return;
      }

      city = results[choice - 1]!;
    }

    if (isAlreadySaved(config.cities, city)) {
      printInfo(`"${city.name}" ya está en tu lista de ciudades.`);
      return;
    }

    config.cities.push(city);

    // La primera ciudad agregada se convierte en la default.
    if (config.defaultCity === null) {
      config.defaultCity = city;
    }

    await saveCitiesState(config);
    printSuccess(`Ciudad agregada: ${city.name}, ${city.country}.`);
  } catch (error) {
    printError(
      error instanceof Error
        ? `Error al buscar la ciudad: ${error.message}`
        : "Error al buscar la ciudad",
    );
  }
}
