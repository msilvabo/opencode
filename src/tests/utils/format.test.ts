import { describe, expect, test } from "bun:test";
import {
  continentFromTimezone,
  formatLocation,
  formatPopulation,
} from "../../utils/format";

describe("formatLocation", () => {
  test("devuelve nombre y país cuando hay país", () => {
    expect(
      formatLocation({ name: "Ottawa", country: "Canadá", latitude: 45, longitude: -75 }),
    ).toBe("Ottawa, Canadá");
  });

  test("devuelve solo el nombre cuando no hay país", () => {
    expect(
      formatLocation({ name: "Ottawa", country: "", latitude: 45, longitude: -75 }),
    ).toBe("Ottawa");
  });
});

describe("continentFromTimezone", () => {
  test("deduce el continente del prefijo de la zona horaria", () => {
    expect(continentFromTimezone("America/Toronto")).toBe("América");
    expect(continentFromTimezone("Europe/Madrid")).toBe("Europa");
    expect(continentFromTimezone("Asia/Tokyo")).toBe("Asia");
    expect(continentFromTimezone("Africa/Cairo")).toBe("África");
    expect(continentFromTimezone("Australia/Sydney")).toBe("Oceanía");
    expect(continentFromTimezone("Pacific/Auckland")).toBe("Oceanía");
    expect(continentFromTimezone("Antarctica/McMurdo")).toBe("Antártida");
  });

  test("mapea Atlantic como Europa e Indian como África", () => {
    expect(continentFromTimezone("Atlantic/Canary")).toBe("Europa");
    expect(continentFromTimezone("Indian/Maldives")).toBe("África");
  });

  test("devuelve null para zonas horarias desconocidas", () => {
    expect(continentFromTimezone("Mars/Olympus")).toBeNull();
  });

  test("devuelve null con undefined o string vacío", () => {
    expect(continentFromTimezone(undefined)).toBeNull();
    expect(continentFromTimezone("")).toBeNull();
  });
});

describe("formatPopulation", () => {
  test("formatea la población con separador de miles", () => {
    expect(formatPopulation(1234567)).toBe(" · pop. 1.234.567");
  });

  test("devuelve string vacío sin población", () => {
    expect(formatPopulation(undefined)).toBe("");
  });
});
