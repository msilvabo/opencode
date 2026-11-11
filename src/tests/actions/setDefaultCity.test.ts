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

const { setDefaultCity } = await import("../../actions/setDefaultCity");

beforeEach(() => {
  removeTestDataFile();
  // Guardia: los tests nunca deben leer ni escribir el cities.json real.
  expectIsolatedDataFile();

  cityNameReply = null;
});

/** Ejecuta setDefaultCity capturando console.log y devuelve las líneas impresas. */
async function runSetDefaultCity(
  config: Parameters<typeof setDefaultCity>[0],
): Promise<string[]> {
  const capture = captureConsoleLog();
  try {
    await setDefaultCity(config);
  } finally {
    capture.restore();
  }
  return capture.lines;
}

describe("setDefaultCity", () => {
  test("establece como default una ciudad guardada (sin distinguir mayúsculas)", async () => {
    const ottawa = makeCity();
    const lima = makeCity({ name: "Lima", country: "Perú", latitude: -12.05, longitude: -77.04 });
    const config = makeConfig({ cities: [ottawa, lima], defaultCity: ottawa });
    cityNameReply = "  LIMA  "; // con espacios, debe recortarse

    await runSetDefaultCity(config);

    expect(config.defaultCity).toEqual(lima);

    const saved = (await Bun.file(TEST_DATA_FILE).json()) as { defaultCity: City | null };
    expect(saved.defaultCity?.name).toBe("Lima");
  });

  test("avisa si la ciudad no está en la lista", async () => {
    const config = makeConfig({ cities: [makeCity()] });
    cityNameReply = "Lima";

    const lines = await runSetDefaultCity(config);

    expect(lines.join("\n")).toContain('"Lima" no está en tu lista de ciudades.');
    expect(config.defaultCity).toBeNull();
  });

  test("con la lista vacía no pide nombre y avisa", async () => {
    const lines = await runSetDefaultCity(makeConfig());

    expect(lines.join("\n")).toContain("No hay ciudades guardadas.");
    expect(cityNameReply).toBeNull();
  });
});
