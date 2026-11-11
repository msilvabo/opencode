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
