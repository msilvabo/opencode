import { beforeEach, describe, expect, test } from "bun:test";
import {
  TEST_DATA_FILE,
  expectIsolatedDataFile,
  removeTestDataFile,
} from "../helpers/testSupport";
import { readConfigFile, writeConfigFile } from "../../storage/configFile";
import {
  loadTemperatureUnit,
  saveTemperatureUnit,
} from "../../storage/settingsStorage";

beforeEach(() => {
  removeTestDataFile();
  // Guardia: los tests nunca deben leer ni escribir el cities.json real.
  expectIsolatedDataFile();
});

describe("loadTemperatureUnit", () => {
  test("devuelve celsius si el archivo no existe", async () => {
    expect(await loadTemperatureUnit()).toBe("celsius");
  });

  test("devuelve celsius si la unidad guardada no es válida", async () => {
    await Bun.write(TEST_DATA_FILE, JSON.stringify({ unit: "kelvin" }));

    expect(await loadTemperatureUnit()).toBe("celsius");
  });
});

describe("saveTemperatureUnit + loadTemperatureUnit", () => {
  test("conserva la unidad guardada", async () => {
    await saveTemperatureUnit("fahrenheit");

    expect(await loadTemperatureUnit()).toBe("fahrenheit");
  });

  test("no pisa el resto de la configuración al guardar", async () => {
    await writeConfigFile({ cities: [] });
    await saveTemperatureUnit("fahrenheit");

    expect((await readConfigFile()).cities).toEqual([]);
  });
});
