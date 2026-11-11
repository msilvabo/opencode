import { isMenuOption, type MenuOption } from "../types/MenuOption";

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

/**
 * Lee la opción del menú. Devuelve la entrada tal cual (aunque no sea
 * válida, para poder mostrarla al usuario) o `null` si stdin llega a EOF.
 */
export async function readOption(): Promise<string | null> {
  const option = await readLine("  Selecciona una opción: ");
  return option?.trim() ?? null;
}

/** Convierte la entrada cruda del menú en una opción válida o `null`. */
export function toMenuOption(raw: string): MenuOption | null {
  return isMenuOption(raw) ? raw : null;
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
