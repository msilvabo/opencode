import { describe, expect, test } from "bun:test";
import {
  captureConsoleLog,
  makeCity,
} from "../helpers/testSupport";
import {
  printCityChoices,
  printCityList,
  printWeather,
} from "../../presentation/output";

/** Ejecuta la acción capturando console.log y devuelve las líneas impresas. */
function capture(action: () => void): string[] {
  const capture_ = captureConsoleLog();
  try {
    action();
  } finally {
    capture_.restore();
  }
  return capture_.lines;
}

describe("printWeather", () => {
  test("muestra ubicación, temperatura y símbolo °C", () => {
    const lines = capture(() =>
      printWeather({ city: makeCity(), temperature: 21.5, unit: "celsius" }),
    );

    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain("Clima actual en Ottawa, Canadá");
    expect(lines[0]).toContain("21.5");
    expect(lines[0]).toContain("°C");
  });

  test("usa el símbolo °F para fahrenheit", () => {
    const lines = capture(() =>
      printWeather({ city: makeCity(), temperature: 70.7, unit: "fahrenheit" }),
    );

    expect(lines[0]).toContain("70.7");
    expect(lines[0]).toContain("°F");
  });
});

describe("printCityList", () => {
  test("lista numerada con marcador en la ciudad default", () => {
    const ottawa = makeCity();
    const lima = makeCity({ name: "Lima", country: "Perú", latitude: -12.05, longitude: -77.04 });

    const lines = capture(() => printCityList([ottawa, lima], ottawa));

    expect(lines).toEqual([
      "  1. Ottawa, Canadá (default)",
      "  2. Lima, Perú",
    ]);
  });

  test("no marca el default cuando es null", () => {
    const lines = capture(() => printCityList([makeCity()], null));

    expect(lines[0]).toBe("  1. Ottawa, Canadá");
  });
});

describe("printCityChoices", () => {
  test("muestra el listado con continente, población y opción de cancelar", () => {
    const lines = capture(() => printCityChoices([makeCity()]));

    expect(lines[0]).toContain("Ciudades encontradas:");
    expect(lines[1]).toContain("1. Ottawa, Canadá");
    expect(lines[1]).toContain("(América)");
    expect(lines[1]).toContain("pop.");
    expect(lines[2]).toContain("0. Cancelar");
  });

  test("omite el continente si la ciudad no tiene timezone", () => {
    const lines = capture(() =>
      printCityChoices([makeCity({ timezone: undefined })]),
    );

    expect(lines[1]).toContain("Ottawa, Canadá");
    expect(lines[1]).not.toContain("(América)");
    expect(lines[1]).toContain("pop.");
  });
});
