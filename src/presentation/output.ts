import type { City } from "../types/City";
import type { WeatherData } from "../types/Weather";
import {
  continentFromTimezone,
  formatLocation,
  formatPopulation,
} from "../utils/format";
import { ansi } from "../utils/colors";

export function printError(message: string): void {
  console.log(ansi.red(`  ✖ ${message}`));
}

export function printSuccess(message: string): void {
  console.log(ansi.green(`  ✔ ${message}`));
}

export function printInfo(message: string): void {
  console.log(ansi.yellow(`  ℹ ${message}`));
}

export function printWeather(weather: WeatherData): void {
  const symbol = weather.unit === "celsius" ? "°C" : "°F";
  const location = formatLocation(weather.city);

  console.log(
    `  ${ansi.cyan("🌡 Clima actual en")} ${ansi.bold(location)}: ` +
      `${ansi.yellow(weather.temperature.toFixed(1))} ${ansi.yellow(symbol)}`,
  );
}

export function printCityList(cities: City[], defaultCity: City | null): void {
  for (const [index, city] of cities.entries()) {
    const location = formatLocation(city);
    const isDefault = defaultCity !== null && defaultCity.name === city.name;
    const marker = isDefault ? ansi.yellow(" (default)") : "";

    console.log(`  ${ansi.dim(`${index + 1}.`)} ${location}${marker}`);
  }
}

/**
 * Muestra los candidatos del geocoding para que el usuario elija uno.
 * La opción 0 siempre sirve para cancelar la selección.
 */
export function printCityChoices(cities: City[]): void {
  console.log(`  ${ansi.cyan("Ciudades encontradas:")}`);

  for (const [index, city] of cities.entries()) {
    const location = formatLocation(city);
    const continent = continentFromTimezone(city.timezone);
    const detail =
      continent === null
        ? formatPopulation(city.population)
        : ` (${continent})${formatPopulation(city.population)}`;

    console.log(`  ${ansi.dim(`${index + 1}.`)} ${location}${ansi.dim(detail)}`);
  }

  console.log(`  ${ansi.dim("0.")} Cancelar`);
}
