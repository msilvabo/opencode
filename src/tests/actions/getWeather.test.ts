import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import {
  asFetch,
  captureConsoleLog,
  makeCity,
  makeConfig,
  removeTestDataFile,
} from "../helpers/testSupport";

// Respuesta de la Forecast API simulada por cada test.
let forecastBody: unknown;
let forecastRejects: boolean;
let fetchCalls: string[];

const { showDefaultCityWeather, showAllCitiesWeather } = await import(
  "../../actions/getWeather"
);

beforeEach(() => {
  removeTestDataFile();
  forecastBody = { current: { temperature_2m: 21.5 } };
  forecastRejects = false;
  fetchCalls = [];

  spyOn(globalThis, "fetch").mockImplementation(
    asFetch((input) => {
      fetchCalls.push(String(input));
      if (forecastRejects) {
        return Promise.reject(new Error("network down"));
      }
      return Promise.resolve(
        new Response(JSON.stringify(forecastBody), { status: 200 }),
      );
    }),
  );
});

afterEach(() => {
  mock.restore();
});

/** Ejecuta una acción capturando console.log y devuelve las líneas impresas. */
async function captureLines(action: () => Promise<void>): Promise<string[]> {
  const capture = captureConsoleLog();
  try {
    await action();
  } finally {
    capture.restore();
  }
  return capture.lines;
}

describe("showDefaultCityWeather", () => {
  test("muestra el clima de la ciudad default", async () => {
    const config = makeConfig({ cities: [makeCity()], defaultCity: makeCity() });

    const lines = await captureLines(() => showDefaultCityWeather(config));

    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain("Clima actual en Ottawa, Canadá");
    expect(lines[0]).toContain("21.5");
    expect(fetchCalls).toHaveLength(1);
    expect(fetchCalls[0]).toContain("latitude=45.41117");
    expect(fetchCalls[0]).toContain("longitude=-75.69812");
    expect(fetchCalls[0]).toContain("temperature_unit=celsius");
  });

  test("avisa si no hay ciudad default", async () => {
    const lines = await captureLines(() => showDefaultCityWeather(makeConfig()));

    expect(lines.join("\n")).toContain("No hay ciudad default");
    expect(fetchCalls).toHaveLength(0);
  });

  test("avisa si falla la petición del clima", async () => {
    forecastRejects = true;
    const config = makeConfig({ cities: [makeCity()], defaultCity: makeCity() });

    const lines = await captureLines(() => showDefaultCityWeather(config));

    expect(lines.join("\n")).toContain("No se pudo obtener el clima de Ottawa");
  });
});

describe("showAllCitiesWeather", () => {
  test("muestra el clima de todas las ciudades guardadas", async () => {
    const ottawa = makeCity();
    const lima = makeCity({ name: "Lima", country: "Perú", latitude: -12.05, longitude: -77.04 });
    const config = makeConfig({ cities: [ottawa, lima], defaultCity: ottawa });

    const lines = await captureLines(() => showAllCitiesWeather(config));

    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain("Ottawa, Canadá");
    expect(lines[1]).toContain("Lima, Perú");
    expect(fetchCalls).toHaveLength(2);
  });

  test("usa la unidad configurada", async () => {
    const config = makeConfig({
      cities: [makeCity()],
      defaultCity: makeCity(),
      unit: "fahrenheit",
    });

    await captureLines(() => showAllCitiesWeather(config));

    expect(fetchCalls[0]).toContain("temperature_unit=fahrenheit");
  });

  test("avisa si no hay ciudades guardadas", async () => {
    const lines = await captureLines(() => showAllCitiesWeather(makeConfig()));

    expect(lines.join("\n")).toContain("No hay ciudades guardadas");
    expect(fetchCalls).toHaveLength(0);
  });

  test("continúa con el resto de ciudades si una falla", async () => {
    forecastRejects = true;
    const ottawa = makeCity();
    const lima = makeCity({ name: "Lima", country: "Perú", latitude: -12.05, longitude: -77.04 });
    const config = makeConfig({ cities: [ottawa, lima], defaultCity: ottawa });

    const lines = await captureLines(() => showAllCitiesWeather(config));

    expect(lines.join("\n")).toContain("No se pudo obtener el clima de Ottawa");
    expect(lines.join("\n")).toContain("No se pudo obtener el clima de Lima");
    expect(fetchCalls).toHaveLength(2);
  });
});
