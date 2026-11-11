import type { ForecastResponse, TemperatureUnit } from "../types/Weather";
import { FORECAST_API_URL } from "../utils/constants";

/**
 * Paso 2 del flujo: obtiene la temperatura actual a partir de coordenadas.
 * Open-Meteo devuelve la temperatura en la unidad solicitada.
 */
export async function getCurrentTemperature(
  latitude: number,
  longitude: number,
  unit: TemperatureUnit,
): Promise<number> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: "temperature_2m",
    temperature_unit: unit,
  });

  const response = await fetch(`${FORECAST_API_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`El servicio del clima respondió con el error ${response.status}`);
  }

  const data = (await response.json()) as ForecastResponse;
  const temperature = data.current?.temperature_2m;

  if (temperature === undefined) {
    throw new Error("La respuesta del clima no incluyó la temperatura actual");
  }

  return temperature;
}
