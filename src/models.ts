export type TemperatureUnit = "celsius" | "fahrenheit";

export interface City {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  /** Opcionales: las ciudades guardadas antes de esta versión no los tienen. */
  countryCode?: string;
  timezone?: string;
  population?: number;
}

export interface WeatherData {
  city: City;
  temperature: number;
  unit: TemperatureUnit;
}

export interface AppConfig {
  cities: City[];
  defaultCity: City | null;
  unit: TemperatureUnit;
}
