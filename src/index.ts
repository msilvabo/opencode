import { searchCities } from "./api/geocoding";
import { getCurrentTemperature } from "./api/weather";
import { readCityChoice, readCityName, readOption, renderMenu } from "./menu";
import type { AppConfig, City } from "./models";
import { loadConfig, saveConfig } from "./storage";
import { printCityChoices, printCityList, printError, printInfo, printSuccess, printWeather } from "./ui";

async function fetchWeather(config: AppConfig, city: City): Promise<void> {
  try {
    const temperature = await getCurrentTemperature(
      city.latitude,
      city.longitude,
      config.unit,
    );

    printWeather({ city, temperature, unit: config.unit });
  } catch (error) {
    printError(
      error instanceof Error
        ? `No se pudo obtener el clima de ${city.name}: ${error.message}`
        : `No se pudo obtener el clima de ${city.name}`,
    );
  }
}

async function showDefaultCityWeather(config: AppConfig): Promise<void> {
  if (config.defaultCity === null) {
    printInfo("No hay ciudad default. Usa la opción 5 para establecer una.");
    return;
  }

  await fetchWeather(config, config.defaultCity);
}

async function showAllCitiesWeather(config: AppConfig): Promise<void> {
  if (config.cities.length === 0) {
    printInfo("No hay ciudades guardadas. Usa la opción 3 para agregar una.");
    return;
  }

  for (const city of config.cities) {
    await fetchWeather(config, city);
  }
}

function isAlreadySaved(cities: City[], city: City): boolean {
  return cities.some(
    (saved) =>
      saved.latitude === city.latitude && saved.longitude === city.longitude,
  );
}

async function searchAndAddCity(config: AppConfig): Promise<void> {
  const name = await readCityName();
  if (name === null || name === "") {
    printInfo("No se ingresó ningún nombre.");
    return;
  }

  try {
    const results = await searchCities(name);

    if (results.length === 0) {
      printError(`La ciudad "${name}" no fue encontrada.`);
      return;
    }

    let city: City;

    if (results.length === 1) {
      city = results[0]!;
    } else {
      printCityChoices(results);
      const choice = await readCityChoice(results.length);

      if (choice === null || choice === 0) {
        printInfo("Selección cancelada.");
        return;
      }

      city = results[choice - 1]!;
    }

    if (isAlreadySaved(config.cities, city)) {
      printInfo(`"${city.name}" ya está en tu lista de ciudades.`);
      return;
    }

    config.cities.push(city);

    // La primera ciudad agregada se convierte en la default.
    if (config.defaultCity === null) {
      config.defaultCity = city;
    }

    await saveConfig(config);
    printSuccess(`Ciudad agregada: ${city.name}, ${city.country}.`);
  } catch (error) {
    printError(
      error instanceof Error
        ? `Error al buscar la ciudad: ${error.message}`
        : "Error al buscar la ciudad",
    );
  }
}

function findCityIndex(config: AppConfig, name: string): number {
  const normalized = name.trim().toLowerCase();
  return config.cities.findIndex(
    (city) => city.name.toLowerCase() === normalized,
  );
}

async function removeCity(config: AppConfig): Promise<void> {
  if (config.cities.length === 0) {
    printInfo("No hay ciudades guardadas.");
    return;
  }

  printCityList(config.cities, config.defaultCity);
  const name = await readCityName();

  const index = name !== null ? findCityIndex(config, name) : -1;
  if (name === null || index === -1) {
    printError(`"${name ?? ""}" no está en tu lista de ciudades.`);
    return;
  }

  const [removed] = config.cities.splice(index, 1);

  if (removed !== undefined) {
    if (
      config.defaultCity !== null &&
      config.defaultCity.name === removed.name
    ) {
      config.defaultCity = config.cities[0] ?? null;
      printInfo(
        config.defaultCity !== null
          ? `La ciudad default ahora es: ${config.defaultCity.name}.`
          : "Ya no hay ciudad default.",
      );
    }

    await saveConfig(config);
    printSuccess(`Ciudad eliminada: ${removed.name}.`);
  }
}

async function setDefaultCity(config: AppConfig): Promise<void> {
  if (config.cities.length === 0) {
    printInfo("No hay ciudades guardadas.");
    return;
  }

  printCityList(config.cities, config.defaultCity);
  const name = await readCityName();

  const city =
    name !== null
      ? config.cities.find(
          (candidate) =>
            candidate.name.toLowerCase() === name.trim().toLowerCase(),
        )
      : undefined;

  if (city === undefined) {
    printError(`"${name ?? ""}" no está en tu lista de ciudades.`);
    return;
  }

  config.defaultCity = city;
  await saveConfig(config);
  printSuccess(`Ciudad default establecida: ${city.name}.`);
}

async function changeUnit(config: AppConfig): Promise<void> {
  config.unit = config.unit === "celsius" ? "fahrenheit" : "celsius";
  await saveConfig(config);
  printSuccess(
    `Unidad de temperatura: ${config.unit === "celsius" ? "°C (celsius)" : "°F (fahrenheit)"}.`,
  );
}

async function main(): Promise<void> {
  const config = await loadConfig();
  let running = true;

  console.log("¡Bienvenido a Weather CLI!");

  while (running) {
    renderMenu(config.cities.length, config.unit);
    const option = await readOption();

    if (option === null) {
      // EOF en stdin: salimos para evitar un bucle infinito.
      running = false;
      break;
    }

    switch (option) {
      case "1":
        await showDefaultCityWeather(config);
        break;
      case "2":
        await showAllCitiesWeather(config);
        break;
      case "3":
        await searchAndAddCity(config);
        break;
      case "4":
        await removeCity(config);
        break;
      case "5":
        await setDefaultCity(config);
        break;
      case "8":
        await changeUnit(config);
        break;
      case "9":
        running = false;
        break;
      default:
        printInfo(`La opción "${option}" no es válida.`);
    }
  }

  console.log("¡Hasta luego! 👋");
}

await main();

// Los listeners de stdin mantienen vivo el event loop de Bun;
// forzamos la salida para regresar al prompt de la consola.
process.exit(0);
