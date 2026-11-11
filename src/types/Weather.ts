import type { City } from "./City";

export type TemperatureUnit = "celsius" | "fahrenheit";

export interface WeatherData {
  city: City;
  temperature: number;
  unit: TemperatureUnit;
}

/** Respuesta de la Geocoding API de Open-Meteo. */
export interface GeocodingResponse {
  results?: GeocodingResult[];
}

export interface GeocodingResult {
  name: string;
  country?: string;
  country_code?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  population?: number;
}

/** Respuesta de la Forecast API de Open-Meteo. */
export interface ForecastResponse {
  current?: {
    temperature_2m?: number;
  };
}
