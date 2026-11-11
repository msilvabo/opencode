import { mkdirSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, spyOn } from "bun:test";
import type { City } from "../../types/City";
import type { AppConfig } from "../../types/Settings";

/**
 * Los tests se ejecutan con el directorio de trabajo dentro de una carpeta
 * temporal. Como `DATA_FILE` es la ruta relativa "cities.json", así ningún
 * test lee ni escribe el archivo real del proyecto.
 */
export const TEST_DATA_DIR = join(tmpdir(), `weather-cli-test-${process.pid}`);
export const TEST_DATA_FILE = join(TEST_DATA_DIR, "cities.json");

mkdirSync(TEST_DATA_DIR, { recursive: true });
process.chdir(TEST_DATA_DIR);

/** Elimina el archivo de datos de pruebas, si existe. */
export function removeTestDataFile(): void {
  try {
    unlinkSync(TEST_DATA_FILE);
  } catch {
    // No existe: nada que limpiar.
  }
}

/**
 * Guardia de seguridad: verifica que los tests corran en la carpeta
 * temporal antes de tocar el almacenamiento.
 */
export function expectIsolatedDataFile(): void {
  expect(process.cwd()).toBe(TEST_DATA_DIR);
}

export function makeCity(overrides: Partial<City> = {}): City {
  return {
    name: "Ottawa",
    country: "Canadá",
    latitude: 45.41117,
    longitude: -75.69812,
    countryCode: "CA",
    timezone: "America/Toronto",
    population: 1017449,
    ...overrides,
  };
}

export function makeConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  return {
    cities: [],
    defaultCity: null,
    unit: "celsius",
    ...overrides,
  };
}

export function stripAnsi(text: string): string {
  return text.replace(/\x1b\[[0-9;]*m/g, "");
}

/**
 * Completa el tipo `typeof fetch` de Bun (que exige la propiedad
 * `preconnect`) para poder usar una función simple como implementación
 * simulada en `spyOn(globalThis, "fetch")`.
 */
export function asFetch(
  implementation: (input: string | Request | URL) => Promise<Response>,
): typeof fetch {
  return Object.assign(implementation, { preconnect: () => {} }) as typeof fetch;
}

export interface ConsoleCapture {
  /** Líneas impresas por console.log, sin códigos ANSI. */
  lines: string[];
  /** Restaura el console.log original. */
  restore: () => void;
}

/** Sustituye console.log por un espía que captura cada línea impresa. */
export function captureConsoleLog(): ConsoleCapture {
  const lines: string[] = [];
  const spy = spyOn(console, "log").mockImplementation((...data: unknown[]) => {
    lines.push(stripAnsi(data.map((item) => String(item ?? "")).join(" ")));
  });

  return {
    lines,
    restore: () => spy.mockRestore(),
  };
}
