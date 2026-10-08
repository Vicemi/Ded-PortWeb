# MODLOG — División Especial de Detectives (DED), port web

Diario del port web de *División Especial de Detectives* (Trojan Chicken, actividad Sugar/OLPC). Mismo método que Xa, SVNZ, CazaPira y Tumble Boy: Astro + React + Canvas, recursos originales incluidos, móvil, pulido.

## Fuentes
- Juego: `F:\Games\DED\Ded.activity` — actividad Sugar: Python 2.6 + pygame, ventana de 600x450, 40 fps (`activity/activity.info`, `bin/main.sh`).
- El código del juego viene **cifrado/ofuscado** (`*.me`, cargados por `encimporter.so`, 32 bits) y la carrera de la fase 3 es un módulo nativo (`game/stages/racer.so`). El usuario confirmó que tiene permiso sobre el código ("Tengo permiso / el código").
- Datos: `data/*.yaml` (coche, tráfico, ladrón, mapas de la fase 3), archivos `DAT!` + zlib (`*.tcd/.tcs/.tcl/.sta`), 1522 imágenes (1094 png, 214 gif, 214 jpg), 79 sonidos (ogg + 2 wav), 9 fuentes ttf.

## Cómo se leyó el código (research/, NO se publica)
1. `research/py32.sh` ejecuta un Python 2.7 de 32 bits (`/opt/py32` + `ld-linux.so.2`, WSL) para poder cargar el propio `encimporter.so` del juego.
2. `research/dump_pyc.py` usa el importador del juego (`sys.meta_path[0].find_module(name,[sp]).get_code(name)`) y vuelca cada módulo a `.pyc` (47/47, 0 fallos) **sin ejecutar** el juego.
3. `uncompyle6` (Scripts/uncompyle6.exe) → `research/src` (27.942 líneas). Ojo: las comprensiones de lista salen mutiladas (`[_[1] for line in lines]`): comprobar con el contexto o desensamblar.
4. `research/strip.py` quita docstrings → `research/lite` (22.358 líneas) para leer más rápido.
5. `racer.so` no es decompilable a Python: la carrera de la fase 3 se reimplementa a partir de `car.yaml`, `traffic.yaml`, `thief.yaml`, `p3_map_*.yaml` y `gui.yaml` (ver más abajo).

`research/` está en `.gitignore`: ni el código descompilado ni la herramienta se publican, solo el port y los recursos del juego.

## Hechos del motor original (Python 2 → TS)
- `framework/`: Stage / Layer / Item* (ItemImage, ItemText, ItemRect, ItemMask, ItemCustomDraw, ItemCell iso), animations (fade, move, resize, blind, image sequence, wait), assets, sounds (VirtualChannel), engine (Game).
- Dibujo con *dirty rects* de pygame. En el port se redibuja el cuadro completo cada frame (equivalente visual; sin artefactos de rects).
- Temporizadores del stage (`start_timer(key, ms, func, data, drop_ticks, render_first)`) se ejecutan en `render()` según `pygame.time.get_ticks()`.
- Aritmética de Python 2: división entera con `/` entre enteros, `int()` trunca, cadenas latin-1 (`str` de bytes).
- Datos `DAT!`: `zlib.decompress(file[4:])`, líneas separadas por `\n`, campos por `;`.
- PNG: 1094 sin chunks de color (gAMA/iCCP) → se pueden usar tal cual en el navegador. Tipos: RGBA 982, gris+alfa 75, paleta 37.

## Texto / fuentes
- Fuentes usadas: ~50 combinaciones (archivo, tamaño). pygame 2.6.1 está instalado en Windows (Python 3.12) para generar métricas y atlas de glifos exactos de SDL_ttf (`tools/build_fonts.py`).

## Estado
(ver abajo, se actualiza mientras avanza el port)

## Estado final (actualizado)
- **Pipeline**: `research/build_game.sh` (descompilar → verificar por bytecode con Python 2.6.9 → parchear → transpilar a TS) genera `src/game/data|stages`. El motor (`src/engine`) y el runtime Python-2 (`src/runtime`) están hechos a mano.
- **Verificación**: el código descompilado se recompila con Python 2.6 y se compara el bytecode normalizado con el original; arnés headless (`npm test`: newgame, hub, phase2, racer, endgame, monkey) y navegador (`ded-web`).
- **Fase 3 (carrera)**: `racer.so` es nativo, se reimplementó (`src/game/racer`) con los YAML originales; sin oráculo de píxeles, afinado a mano.
- **Móvil**: puntero táctil (sin hover), teclado en pantalla vía `<input>` oculto, gamepad en la carrera, botón ☰ (Escape), aviso de girar el teléfono, manifest.
- **Pendiente / conocido**: ladrón no visible tras la maniobra de arresto; tráfico choca en el piloto automático de los tests; sin Safari-audio fallback.
