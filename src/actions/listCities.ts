import type { AppConfig } from "../types/Settings";
import { printCityList, printInfo } from "../presentation/output";

/**
 * Muestra las ciudades guardadas con su marcador de default.
 * Devuelve `false` si no hay ciudades, para que las acciones que
 * necesitan una lista puedan cancelarse temprano.
 */
export function listCities(config: AppConfig): boolean {
  if (config.cities.length === 0) {
    printInfo("No hay ciudades guardadas.");
    return false;
  }

  printCityList(config.cities, config.defaultCity);
  return true;
}
