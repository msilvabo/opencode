import { beforeEach, describe, expect, test } from "bun:test";
import {
  TEST_DATA_FILE,
  captureConsoleLog,
  expectIsolatedDataFile,
  makeConfig,
  removeTestDataFile,
} from "../helpers/testSupport";
import { loadTemperatureUnit } from "../../storage/settingsStorage";
import type { AppConfig } from "../../types/Settings";

const { changeUnit } = await import("../../actions/changeUnit");

beforeEach(() => {
  removeTestDataFile();
  // Guardia: los tests nunca deben leer ni escribir el cities.json real.
  expectIsolatedDataFile();
});

describe("changeUnit", () => {
  test("alterna de celsius a fahrenheit y lo persiste", async () => {
    const config: AppConfig = makeConfig({ unit: "celsius" });

    const capture = captureConsoleLog();
    try {
      await changeUnit(config);
    } finally {
      capture.restore();
    }

    expect(config.unit).toBe("fahrenheit");
    expect(await loadTemperatureUnit()).toBe("fahrenheit");
    expect(capture.lines.join("\n")).toContain("°F (fahrenheit)");
  });

  test("alterna de fahrenheit a celsius y lo persiste", async () => {
    const config: AppConfig = makeConfig({ unit: "fahrenheit" });

    const capture = captureConsoleLog();
    try {
      await changeUnit(config);
    } finally {
      capture.restore();
    }

    expect(config.unit).toBe("celsius");
    expect(await loadTemperatureUnit()).toBe("celsius");
    expect(capture.lines.join("\n")).toContain("°C (celsius)");
  });
});
