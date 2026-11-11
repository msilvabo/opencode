import type { TemperatureUnit } from "../types/Weather";
import { ansi } from "../utils/colors";

export function renderMenu(cityCount: number, unit: TemperatureUnit): void {
  const symbol = unit === "celsius" ? "°C" : "°F";

  console.log(ansi.cyan(`
════════════════════════════════════════
         WEATHER CLI
════════════════════════════════════════`));
  console.log(`  1. Clima de ciudad default
  2. Clima de todas las ciudades (${cityCount})
  3. Buscar y agregar ciudad
  4. Eliminar ciudad
  5. Establecer ciudad default
  8. Ajustes (${ansi.yellow(symbol)})
  9. Salir`);
  console.log(ansi.cyan("════════════════════════════════════════"));
}
