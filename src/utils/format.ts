import type { City } from "../types/City";

export function formatLocation(city: City): string {
  return city.country ? `${city.name}, ${city.country}` : city.name;
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

export function formatPopulation(population?: number): string {
  if (population === undefined) {
    return "";
  }

  return ` · pop. ${population.toLocaleString("es")}`;
}
