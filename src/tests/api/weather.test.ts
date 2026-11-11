import { afterEach, describe, expect, mock, spyOn, test } from "bun:test";
import { asFetch } from "../helpers/testSupport";
import { getCurrentTemperature } from "../../api/weather";

afterEach(() => {
  mock.restore();
});

/** Sustituye fetch por una versión que responde con el payload indicado. */
function mockFetchWith(payload: unknown, status = 200) {
  return spyOn(globalThis, "fetch").mockImplementation(
    asFetch(() => Promise.resolve(new Response(JSON.stringify(payload), { status }))),
  );
}

describe("getCurrentTemperature", () => {
  test("devuelve la temperatura actual", async () => {
    mockFetchWith({ current: { temperature_2m: 21.5 } });

    expect(await getCurrentTemperature(45.41117, -75.69812, "celsius")).toBe(21.5);
  });

  test("pide la temperatura en la unidad configurada", async () => {
    let requestedUrl = "";
    spyOn(globalThis, "fetch").mockImplementation(
      asFetch((input) => {
        requestedUrl = String(input);
        return Promise.resolve(
          new Response(JSON.stringify({ current: { temperature_2m: 70.7 } }), { status: 200 }),
        );
      }),
    );

    expect(await getCurrentTemperature(45.41117, -75.69812, "fahrenheit")).toBe(70.7);

    expect(requestedUrl).toStartWith("https://api.open-meteo.com/v1/forecast?");
    expect(requestedUrl).toContain("latitude=45.41117");
    expect(requestedUrl).toContain("longitude=-75.69812");
    expect(requestedUrl).toContain("current=temperature_2m");
    expect(requestedUrl).toContain("temperature_unit=fahrenheit");
  });

  test("lanza un error si la respuesta no incluye la temperatura", async () => {
    mockFetchWith({ current: {} });

    expect(getCurrentTemperature(45.41117, -75.69812, "celsius")).rejects.toThrow(
      "La respuesta del clima no incluyó la temperatura actual",
    );
  });

  test("lanza un error si la API responde con un código HTTP de error", async () => {
    mockFetchWith({}, 503);

    expect(getCurrentTemperature(45.41117, -75.69812, "celsius")).rejects.toThrow(
      "El servicio del clima respondió con el error 503",
    );
  });
});
