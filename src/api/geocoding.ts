import type { City } from "../models";

interface GeocodingResponse {
  results?: Array<{
    name: string;
    country?: string;
    country_code?: string;
    latitude: number;
    longitude: number;
    timezone?: string;
    population?: number;
  }>;
}

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

  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`,
  );

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
