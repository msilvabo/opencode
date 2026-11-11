import type { TemperatureUnit } from "./models";
import { ansi } from "./ui";

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

/**
 * Lector de líneas propio. La API `node:readline` de Bun 1.4.4 cierra la
 * interfaz cuando stdin llega a EOF, lo que rompe lecturas posteriores;
 * leer `process.stdin` directamente funciona igual con teclado y con pipe.
 */
let buffer = "";
let isEof = false;
const pendingResolvers: Array<() => void> = [];

process.stdin.on("data", (chunk: string | Buffer) => {
  buffer += chunk.toString();
  flushResolvers();
});

process.stdin.on("end", () => {
  isEof = true;
  flushResolvers();
});

process.stdin.on("error", () => {
  isEof = true;
  flushResolvers();
});

function flushResolvers(): void {
  while (pendingResolvers.length > 0) {
    pendingResolvers.shift()?.();
  }
}

function shiftLine(): string {
  const end = buffer.search(/[\r\n]/);
  const line = buffer.slice(0, end);

  // Windows usa "\r\n" como fin de línea; un solo "\n" o "\r" también es válido.
  const skip = buffer[end] === "\r" && buffer[end + 1] === "\n" ? 2 : 1;
  buffer = buffer.slice(end + skip);

  return line;
}

async function readLine(promptText: string): Promise<string | null> {
  process.stdout.write(promptText);

  while (buffer.search(/[\r\n]/) === -1) {
    if (isEof) {
      if (buffer.length > 0) {
        const remainder = buffer;
        buffer = "";
        return remainder;
      }
      return null;
    }

    await new Promise<void>((resolve) => {
      pendingResolvers.push(resolve);
    });
  }

  return shiftLine();
}

export async function readOption(): Promise<string | null> {
  const option = await readLine("  Selecciona una opción: ");
  return option?.trim() ?? null;
}

export async function readCityName(): Promise<string | null> {
  const name = await readLine("  Nombre de la ciudad: ");
  return name?.trim() ?? null;
}

/**
 * Lee la opción elegida de un listado numerado (0 = cancelar).
 * Re-pide el número mientras la entrada no sea válida; devuelve
 * `null` si stdin llega a EOF.
 */
export async function readCityChoice(max: number): Promise<number | null> {
  while (true) {
    const raw = await readLine(`  Elige una opción (0-${max}): `);

    if (raw === null) {
      return null;
    }

    const choice = Number.parseInt(raw.trim(), 10);

    if (Number.isInteger(choice) && choice >= 0 && choice <= max) {
      return choice;
    }

    console.log(`  ✖ Ingresa un número entre 0 y ${max}.`);
  }
}
