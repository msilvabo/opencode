import { beforeEach, describe, expect, test } from "bun:test";
import {
  TEST_DATA_FILE,
  expectIsolatedDataFile,
  makeCity,
  removeTestDataFile,
} from "../helpers/testSupport";
import {
  loadCitiesState,
  saveCitiesState,
} from "../../storage/citiesStorage";

beforeEach(() => {
  removeTestDataFile();
  // Guardia: los tests nunca deben leer ni escribir el cities.json real.
  expectIsolatedDataFile();
});

describe("loadCitiesState", () => {
  test("devuelve estado vacío si el archivo no existe", async () => {
    expect(await loadCitiesState()).toEqual({ cities: [], defaultCity: null });
  });

  test("normaliza `cities` a un array si no lo es", async () => {
    await Bun.write(TEST_DATA_FILE, JSON.stringify({ cities: "no-es-array" }));

    expect(await loadCitiesState()).toEqual({ cities: [], defaultCity: null });
  });

  test("devuelve null como defaultCity si no está en el archivo", async () => {
    await Bun.write(TEST_DATA_FILE, JSON.stringify({ cities: [] }));

    expect((await loadCitiesState()).defaultCity).toBeNull();
  });
});

describe("saveCitiesState + loadCitiesState", () => {
  test("conserva ciudades y defaultCity en el round-trip", async () => {
    const ottawa = makeCity();
    const lima = makeCity({ name: "Lima", country: "Perú", latitude: -12.05, longitude: -77.04 });
    const state = { cities: [ottawa, lima], defaultCity: ottawa };

    await saveCitiesState(state);

    expect(await loadCitiesState()).toEqual(state);
  });
});
