# AGENTS.md

Instrucciones para agentes de IA que trabajen en este proyecto.

## Descripción del proyecto

**Weather CLI App**: aplicación de consola que permite consultar el clima de ciudades usando la API de [Open-Meteo](https://open-meteo.com/). El usuario ingresa el nombre de una ciudad, y la app muestra el clima actual. Al final del desarrollo se genera un binario ejecutable.

Este es un proyecto de aprendizaje, por lo que la claridad del código y las buenas prácticas tienen prioridad sobre la complejidad.

## Stack

- **Runtime**: Bun.js (no usar Node.js ni npm/npx)
- **Lenguaje**: TypeScript (modo estricto)
- **API externa**: Open-Meteo (sin API key, sin autenticación)

## Comandos

```bash
# Instalar dependencias
bun install

# Ejecutar la aplicación
bun run index.ts

# Ejecutar en modo watch (recarga automática al guardar)
bun --watch run index.ts

# Verificación de tipos
bun run typecheck

# Compilar a binario ejecutable (objetivo final del proyecto)
bun build ./index.ts --compile --outfile weather
```

## Funcionalidad requerida

El menú de la CLI debe implementar estas opciones:

1. Clima de ciudad default
2. Clima de todas las ciudades guardadas
3. Buscar y agregar ciudad
4. Eliminar ciudad
5. Establecer ciudad default
6. Ajustes (unidad de temperatura: °C/°F)
7. Salir

Formato visual del menú:

```
════════════════════════════════════════
         WEATHER CLI
════════════════════════════════════════
  1. Clima de ciudad default
  2. Clima de todas las ciudades (1)
  3. Buscar y agregar ciudad
  4. Eliminar ciudad
  5. Establecer ciudad default
  6. Ajustes (°C)
  7. Salir
════════════════════════════════════════
  Selecciona una opción:
```

## APIs de Open-Meteo

El flujo es de dos pasos:

1. **Geocoding API**: convertir el nombre de la ciudad en coordenadas.

   ```
   https://geocoding-api.open-meteo.com/v1/search?name=Ottawa&count=1&language=es&format=json
   ```

2. **Forecast API**: obtener el clima con las coordenadas.

   ```
   https://api.open-meteo.com/v1/forecast?latitude=45.41117&longitude=-75.69812&current=temperature_2m
   ```

Notas:
- `count=1` devuelve solo el mejor resultado del geocoding.
- Si el geocoding no devuelve resultados, informar al usuario que la ciudad no fue encontrada.
- Manejar errores de red con `try/catch` y mostrar mensajes amigables.

## Persistencia

- Las ciudades guardadas (y la ciudad default) deben persistir entre ejecuciones.
- Usar un archivo JSON local (por ejemplo `cities.json` en la raíz del proyecto, o `~/.weather-cli/config.json`).
- Agregar el archivo de datos al `.gitignore` si se guarda dentro del proyecto.

## Estructura del código

Mantener el código organizado por responsabilidades (no escribir todo en `index.ts`):

```
src/
  index.ts        # punto de entrada: bucle del menú
  menu.ts         # render del menú y lectura de opciones
  api/
    geocoding.ts  # búsqueda de ciudades por nombre
    weather.ts    # consulta del clima
  models.ts       # tipos: City, WeatherData, Settings
  storage.ts      # lectura/escritura del JSON de configuración
  ui.ts           # helpers de salida en consola (tablas, colores)
```

## Convenciones de código

- TypeScript con `strict: true`; no desactivar las flags del `tsconfig.json`.
- Módulos ESM (`import/export`), no CommonJS.
- Usar `fetch` nativo de Bun para las peticiones HTTP.
- Usar `Bun.prompt()` o APIs de `node:readline` para la entrada del usuario.
- Nombres en inglés para código (variables, funciones, tipos); mensajes de UI al usuario en español.
- Comentar solo cuando el propósito no sea evidente.
- Preferir funciones puras para la lógica (parseo de respuestas, formateo) para facilitar tests.

## Errores comunes a evitar

- No usar `npm` o `npx`; este proyecto usa **Bun** (`bun install`, `bun run`, `bunx`).
- No agregar dependencias innecesarias; el proyecto funciona con Bun + fetch nativo.
- Recordar que `noUncheckedIndexedAccess` está activo: los índices de arrays pueden ser `undefined`, hay que validarlos.
- Con `verbatimModuleSyntax`, usar `import type` para importar solo tipos.
- Codificar correctamente los parámetros de query (usar `URLSearchParams`, no concatenar strings con nombres de ciudad).

## Estado actual

- [x] Proyecto inicializado con `bun init`
- [ ] Implementar menú interactivo
- [ ] Integrar Geocoding API
- [ ] Integrar Forecast API
- [ ] Persistencia de ciudades
- [ ] Ajustes de unidades (°C/°F)
- [ ] Compilar a binario ejecutable
