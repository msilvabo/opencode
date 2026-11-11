import { afterEach, describe, expect, mock, spyOn, test } from "bun:test";
import { asFetch } from "../helpers/testSupport";
import { searchCities } from "../../api/geocoding";

afterEach(() => {
  mock.restore();
});

/** Sustituye fetch por una versión que responde con el payload indicado. */
function mockFetchWith(payload: unknown, status = 200) {
  return spyOn(globalThis, "fetch").mockImplementation(
    asFetch(() => Promise.resolve(new Response(JSON.stringify(payload), { status }))),
  );
}

const geocodingPayload = {
  results: [
    {
      name: "Ottawa",
      country: "Canadá",
      country_code: "CA",
      latitude: 45.41117,
      longitude: -75.69812,
      timezone: "America/Toronto",
      population: 1017449,
    },
    {
      name: "Ottawa",
      latitude: 37.25,
      longitude: -95.9,
    },
  ],
};

describe("searchCities", () => {
  test("mapea los resultados de la API a objetos City", async () => {
    mockFetchWith(geocodingPayload);

    const cities = await searchCities("Ottawa");

    expect(cities).toEqual([
      {
        name: "Ottawa",
        country: "Canadá",
        latitude: 45.41117,
        longitude: -75.69812,
        countryCode: "CA",
        timezone: "America/Toronto",
        population: 1017449,
      },
      {
        name: "Ottawa",
        country: "",
        latitude: 37.25,
        longitude: -95.9,
        countryCode: undefined,
        timezone: undefined,
        population: undefined,
      },
    ]);
  });

  test("construye la URL con los parámetros esperados", async () => {
    let requestedUrl = "";
    spyOn(globalThis, "fetch").mockImplementation(
      asFetch((input) => {
        requestedUrl = String(input);
        return Promise.resolve(
          new Response(JSON.stringify({ results: [] }), { status: 200 }),
        );
      }),
    );

    await searchCities("Ottawa");

    expect(requestedUrl).toStartWith("https://geocoding-api.open-meteo.com/v1/search?");
    expect(requestedUrl).toContain("name=Ottawa");
    expect(requestedUrl).toContain("count=10");
    expect(requestedUrl).toContain("language=es");
    expect(requestedUrl).toContain("format=json");
  });

  test("devuelve un array vacío si la API no devuelve resultados", async () => {
    mockFetchWith({});

    expect(await searchCities("Ahoraheroadsadfh")).toEqual([]);
  });

  test("lanza un error si la API responde con un código HTTP de error", async () => {
    mockFetchWith({}, 500);

    expect(searchCities("Ottawa")).rejects.toThrow(
      "El servicio de geocoding respondió con el error 500",
    );
  });
});
