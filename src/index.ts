import { showAllCitiesWeather, showDefaultCityWeather } from "./actions/getWeather";
import { addCity } from "./actions/addCity";
import { removeCity } from "./actions/removeCity";
import { setDefaultCity } from "./actions/setDefaultCity";
import { changeUnit } from "./actions/changeUnit";
import { loadCitiesState } from "./storage/citiesStorage";
import { loadTemperatureUnit } from "./storage/settingsStorage";
import { readOption, toMenuOption } from "./presentation/input";
import { renderMenu } from "./presentation/menu";
import { printInfo } from "./presentation/output";
import type { MenuOption } from "./types/MenuOption";
import type { AppConfig } from "./types/Settings";

async function main(): Promise<void> {
  const [citiesState, unit] = await Promise.all([
    loadCitiesState(),
    loadTemperatureUnit(),
  ]);
  const config: AppConfig = { ...citiesState, unit };

  let running = true;


  
  console.log("¡Bienvenido a Weather CLI!");

  while (running) {
    renderMenu(config.cities.length, config.unit);
    const raw = await readOption();

    if (raw === null) {
      // EOF en stdin: salimos para evitar un bucle infinito.
      running = false;
      break;
    }

    const option: MenuOption | null = toMenuOption(raw);

    switch (option) {
      case "1":
        await showDefaultCityWeather(config);
        break;
      case "2":
        await showAllCitiesWeather(config);
        break;
      case "3":
        await addCity(config);
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
      case null:
        printInfo(`La opción "${raw}" no es válida.`);
    }
  }

  console.log("¡Hasta luego! 👋");
}

await main();

// Los listeners de stdin mantienen vivo el event loop de Bun;
// forzamos la salida para regresar al prompt de la consola.
process.exit(0);
