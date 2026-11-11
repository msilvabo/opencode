import type { City, TemperatureUnit, WeatherData } from "./models";

/** Helpers de color ANSI exportados para usarlos desde otros módulos (menú). */
export const ansi = {
  cyan: (text: string) => `\x1b[36m${text}\x1b[0m`,
  green: (text: string) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
  red: (text: string) => `\x1b[31m${text}\x1b[0m`,
  dim: (text: string) => `\x1b[2m${text}\x1b[0m`,
  bold: (text: string) => `\x1b[1m${text}\x1b[0m`,
};

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
  const location = weather.city.country
    ? `${weather.city.name}, ${weather.city.country}`
    : weather.city.name;

  console.log(
    `  ${ansi.cyan("🌡 Clima actual en")} ${ansi.bold(location)}: ` +
      `${ansi.yellow(weather.temperature.toFixed(1))} ${ansi.yellow(symbol)}`,
  );
}

export function printCityList(cities: City[], defaultCity: City | null): void {
  for (const [index, city] of cities.entries()) {
    const location = city.country ? `${city.name}, ${city.country}` : city.name;
    const isDefault = defaultCity !== null && defaultCity.name === city.name;
    const marker = isDefault ? ansi.yellow(" (default)") : "";

    console.log(`  ${ansi.dim(`${index + 1}.`)} ${location}${marker}`);
  }
}

const CONTINENT_BY_TIMEZONE_PREFIX: Readonly<Record<string, string>> = {
  Africa: "África",
  America: "América",
  Antarctica: "Antártida",
  Asia: "Asia",
  Atlantic: "Europa",
  Australia: "Oceanía",
  Europe: "Europa",
  Indian: "África",
  Pacific: "Oceanía",
};

/** Función pura: deduce el continente a partir del prefijo de la zona horaria. */
export function continentFromTimezone(timezone?: string): string | null {
  if (timezone === undefined || timezone === "") {
    return null;
  }

  const prefix = timezone.split("/")[0] ?? "";
  const continent = CONTINENT_BY_TIMEZONE_PREFIX[prefix];
  return continent ?? null;
}

function formatPopulation(population?: number): string {
  if (population === undefined) {
    return "";
  }

  return ` · pop. ${population.toLocaleString("es")}`;
}

/**
 * Muestra los candidatos del geocoding para que el usuario elija uno.
 * La opción 0 siempre sirve para cancelar la selección.
 */
export function printCityChoices(cities: City[]): void {
  console.log(`  ${ansi.cyan("Ciudades encontradas:")}`);

  for (const [index, city] of cities.entries()) {
    const location = city.country ? `${city.name}, ${city.country}` : city.name;
    const continent = continentFromTimezone(city.timezone);
    const detail =
      continent === null
        ? formatPopulation(city.population)
        : ` (${continent})${formatPopulation(city.population)}`;

    console.log(`  ${ansi.dim(`${index + 1}.`)} ${location}${ansi.dim(detail)}`);
  }

  console.log(`  ${ansi.dim("0.")} Cancelar`);
}
