import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import {
  TEST_DATA_FILE,
  asFetch,
  captureConsoleLog,
  expectIsolatedDataFile,
  inputState,
  makeCity,
  makeConfig,
  removeTestDataFile,
} from "../helpers/testSupport";
import type { City } from "../../types/City";

// Respuesta de la Geocoding API simulada por cada test.
let geocodingBody: unknown;
let geocodingStatus: number;
let geocodingRejects: boolean;
let fetchCalls: string[];

const { addCity } = await import("../../actions/addCity");

beforeEach(() => {
  removeTestDataFile();
  // Guardia: los tests nunca deben leer ni escribir el cities.json real.
  expectIsolatedDataFile();

  inputState.cityName = null;
  inputState.cityChoice = 0;
  geocodingBody = { results: [] };
  geocodingStatus = 200;
  geocodingRejects = false;
  fetchCalls = [];

  spyOn(globalThis, "fetch").mockImplementation(
    asFetch((input) => {
      fetchCalls.push(String(input));
      if (geocodingRejects) {
        return Promise.reject(new Error("network down"));
      }
      return Promise.resolve(
        new Response(JSON.stringify(geocodingBody), { status: geocodingStatus }),
      );
    }),
  );
});

afterEach(() => {
  mock.restore();
});

/** Ejecuta addCity capturando console.log y devuelve las líneas impresas. */
async function runAddCity(config: Parameters<typeof addCity>[0]): Promise<string[]> {
  const capture = captureConsoleLog();
  try {
    await addCity(config);
  } finally {
    capture.restore();
  }
  return capture.lines;
}

const ottawaResult = {
  name: "Ottawa",
  country: "Canadá",
  country_code: "CA",
  latitude: 45.41117,
  longitude: -75.69812,
  timezone: "America/Toronto",
  population: 1017449,
};

describe("addCity", () => {
  test("agrega la primera ciudad y la convierte en default", async () => {
    inputState.cityName = "Ottawa";
    geocodingBody = { results: [ottawaResult] };
    const config = makeConfig();

    await runAddCity(config);

    expect(config.cities).toEqual([makeCity()]);
    expect(config.defaultCity?.name).toBe("Ottawa");

    // También debe haberse persistido.
    const saved = (await Bun.file(TEST_DATA_FILE).json()) as { cities: City[] };
    expect(saved.cities).toEqual([makeCity()]);
  });

  test("consulta la Geocoding API con el nombre ingresado", async () => {
    inputState.cityName = "Ottawa";
    geocodingBody = { results: [ottawaResult] };

    await runAddCity(makeConfig());

    expect(fetchCalls).toHaveLength(1);
    expect(fetchCalls[0]).toContain("name=Ottawa");
  });

  test("no agrega ciudades duplicadas (misma latitud y longitud)", async () => {
    const config = makeConfig({
      cities: [makeCity()],
      defaultCity: makeCity(),
    });
    inputState.cityName = "Ottawa";
    geocodingBody = { results: [ottawaResult] };

    const lines = await runAddCity(config);

    expect(config.cities).toHaveLength(1);
    expect(lines.join("\n")).toContain("ya está en tu lista de ciudades");
  });

  test("avisa si la ciudad no fue encontrada", async () => {
    inputState.cityName = "Ahoraheroadsadfh";
    geocodingBody = {};

    const lines = await runAddCity(makeConfig());

    expect(lines.join("\n")).toContain('La ciudad "Ahoraheroadsadfh" no fue encontrada.');
  });

  test("no llama a la API si no se ingresó ningún nombre", async () => {
    inputState.cityName = "";

    await runAddCity(makeConfig());

    expect(fetchCalls).toHaveLength(0);
  });

  test("con varios candidatos elige el elegido por el usuario", async () => {
    inputState.cityName = "Ottawa";
    inputState.cityChoice = 2;
    geocodingBody = {
      results: [
        ottawaResult,
        { ...ottawaResult, country: "Estados Unidos", latitude: 38.35, longitude: -95.9 },
      ],
    };
    const config = makeConfig();

    await runAddCity(config);

    expect(config.cities).toEqual([
      makeCity({ name: "Ottawa", country: "Estados Unidos", latitude: 38.35, longitude: -95.9 }),
    ]);
    expect(config.defaultCity?.country).toBe("Estados Unidos");
  });

  test("cancela la selección con la opción 0", async () => {
    inputState.cityName = "Ottawa";
    inputState.cityChoice = 0;
    geocodingBody = { results: [ottawaResult, { ...ottawaResult, name: "Ottawa II" }] };
    const config = makeConfig();

    const lines = await runAddCity(config);

    expect(config.cities).toEqual([]);
    expect(lines.join("\n")).toContain("Selección cancelada.");
  });

  test("avisa de errores de red sin romper el flujo", async () => {
    inputState.cityName = "Ottawa";
    geocodingRejects = true;

    const lines = await runAddCity(makeConfig());

    expect(lines.join("\n")).toContain("Error al buscar la ciudad: network down");
  });
});
