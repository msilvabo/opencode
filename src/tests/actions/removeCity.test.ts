import { beforeEach, describe, expect, mock, test } from "bun:test";
import {
  TEST_DATA_FILE,
  captureConsoleLog,
  expectIsolatedDataFile,
  makeCity,
  makeConfig,
  removeTestDataFile,
} from "../helpers/testSupport";
import type { City } from "../../types/City";

// Entrada del usuario controlada por cada test.
let cityNameReply: string | null;

mock.module("../../presentation/input", () => ({
  readCityName: () => Promise.resolve(cityNameReply),
}));

const { removeCity } = await import("../../actions/removeCity");

beforeEach(() => {
  removeTestDataFile();
  // Guardia: los tests nunca deben leer ni escribir el cities.json real.
  expectIsolatedDataFile();

  cityNameReply = null;
});

/** Ejecuta removeCity capturando console.log y devuelve las líneas impresas. */
async function runRemoveCity(config: Parameters<typeof removeCity>[0]): Promise<string[]> {
  const capture = captureConsoleLog();
  try {
    await removeCity(config);
  } finally {
    capture.restore();
  }
  return capture.lines;
}

describe("removeCity", () => {
  test("elimina una ciudad existente sin tocar la default", async () => {
    const ottawa = makeCity();
    const lima = makeCity({ name: "Lima", country: "Perú", latitude: -12.05, longitude: -77.04 });
    const config = makeConfig({ cities: [ottawa, lima], defaultCity: ottawa });
    cityNameReply = "lima"; // insensible a mayúsculas

    await runRemoveCity(config);

    expect(config.cities).toEqual([ottawa]);
    expect(config.defaultCity).toEqual(ottawa);

    const saved = (await Bun.file(TEST_DATA_FILE).json()) as { cities: City[] };
    expect(saved.cities).toEqual([ottawa]);
  });

  test("si se elimina la default, la primera restante pasa a ser default", async () => {
    const ottawa = makeCity();
    const lima = makeCity({ name: "Lima", country: "Perú", latitude: -12.05, longitude: -77.04 });
    const config = makeConfig({ cities: [ottawa, lima], defaultCity: ottawa });
    cityNameReply = "Ottawa";

    await runRemoveCity(config);

    expect(config.cities).toEqual([lima]);
    expect(config.defaultCity).toEqual(lima);
  });

  test("si se elimina la única ciudad, ya no hay default", async () => {
    const ottawa = makeCity();
    const config = makeConfig({ cities: [ottawa], defaultCity: ottawa });
    cityNameReply = "Ottawa";

    const lines = await runRemoveCity(config);

    expect(config.cities).toEqual([]);
    expect(config.defaultCity).toBeNull();
    expect(lines.join("\n")).toContain("Ya no hay ciudad default.");
  });

  test("avisa si la ciudad no está en la lista", async () => {
    const config = makeConfig({ cities: [makeCity()] });
    cityNameReply = "Lima";

    const lines = await runRemoveCity(config);

    expect(lines.join("\n")).toContain('"Lima" no está en tu lista de ciudades.');
    expect(config.cities).toHaveLength(1);
  });

  test("con la lista vacía no pide nombre y avisa", async () => {
    const lines = await runRemoveCity(makeConfig());

    expect(lines.join("\n")).toContain("No hay ciudades guardadas.");
    expect(cityNameReply).toBeNull(); // nunca se llegó a leer la entrada
  });
});
