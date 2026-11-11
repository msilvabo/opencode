import { beforeEach, describe, expect, test } from "bun:test";
import {
  TEST_DATA_FILE,
  expectIsolatedDataFile,
  removeTestDataFile,
} from "../helpers/testSupport";
import { readConfigFile, writeConfigFile } from "../../storage/configFile";

beforeEach(() => {
  removeTestDataFile();
  // Guardia: los tests nunca deben leer ni escribir el cities.json real.
  expectIsolatedDataFile();
});

describe("readConfigFile", () => {
  test("devuelve un objeto vacío si el archivo no existe", async () => {
    expect(await readConfigFile()).toEqual({});
  });

  test("devuelve un objeto vacío si el JSON es inválido", async () => {
    await Bun.write(TEST_DATA_FILE, "{ esto no es json");
    expect(await readConfigFile()).toEqual({});
  });
});

describe("writeConfigFile", () => {
  test("crea el archivo con el contenido indicado", async () => {
    await writeConfigFile({ unit: "fahrenheit" });

    const data = await readConfigFile();
    expect(data).toEqual({ unit: "fahrenheit" });
  });

  test("conserva las claves existentes al aplicar un patch", async () => {
    await writeConfigFile({ unit: "celsius" });
    await writeConfigFile({ cities: [] });

    expect(await readConfigFile()).toEqual({ unit: "celsius", cities: [] });
  });
});
