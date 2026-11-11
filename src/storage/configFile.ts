import type { AppConfig } from "../types/Settings";
import { DATA_FILE } from "../utils/constants";

/**
 * Acceso de bajo nivel al archivo de configuración. Los módulos de
 * `citiesStorage` y `settingsStorage` lo usan para leer y actualizar
 * solo su porción, sin pisar los datos de los demás.
 */
export async function readConfigFile(): Promise<Partial<AppConfig>> {
  try {
    const raw = await Bun.file(DATA_FILE).text();
    return JSON.parse(raw) as Partial<AppConfig>;
  } catch {
    return {};
  }
}

export async function writeConfigFile(patch: Partial<AppConfig>): Promise<void> {
  const current = await readConfigFile();
  const merged = { ...current, ...patch };

  await Bun.write(DATA_FILE, JSON.stringify(merged, null, 2));
}
