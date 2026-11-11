import type { City } from "../types/City";
import type { GeocodingResponse } from "../types/Weather";
import { GEOCODING_API_URL } from "../utils/constants";

/**
 * Paso 1 del flujo: convierte el nombre de una ciudad en coordenadas.
 * Devuelve hasta 10 candidatos para que el usuario elija cuando hay
 * ciudades homónimas, o una lista vacía si no encuentra resultados.
 */
export async function searchCities(name: string): Promise<City[]> {
  const params = new URLSearchParams({
    name,
    count: "10",
    language: "es",
    format: "json",
  });

  const response = await fetch(`${GEOCODING_API_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`El servicio de geocoding respondió con el error ${response.status}`);
  }

  const data = (await response.json()) as GeocodingResponse;

  return (data.results ?? []).map((result) => ({
    name: result.name,
    country: result.country ?? "",
    latitude: result.latitude,
    longitude: result.longitude,
    countryCode: result.country_code,
    timezone: result.timezone,
    population: result.population,
  }));
}
