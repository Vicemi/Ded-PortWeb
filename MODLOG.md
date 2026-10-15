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

## Edición actualizada (contenido nuevo)
- **Banderas**: las 19 banderas departamentales actuales (Wikimedia Commons, ver `tools/flags/SOURCES.json`) → cintas de las medallas (grande y de la lista), discos centrales de las medallas, bandera en el popup de medalla y colgando de la barra de ubicación del mapa. `tools/build_flags.mjs` → `tools/extra_images/` (el pack de imágenes las incluye; mismo nombre = reemplaza el original).
- **Ladrones nuevos** (`src/game/content/extend.ts`, briefs en `tools/art_brief/`): Mateo, Rita, Gambeta, Dulcinea, Doña Tannat, Rambla, Víctor, Fausto Filete (Carnicero), Vera Pezuña (Veterinaria) y Nana Nochera (Niñera) con arte armado por `tools/make_mugshot.py` e integrado al pack (`public/assets/images_rest.pak`); Byte, Tato, Telmo y Flor están definidos y se activan solos cuando existan sus 4 imágenes. Mascotas y deportes uruguayos nuevos. El identikit tiene 9 lugares: ahora los sospechosos son el culpable + 7 del mismo sexo + 1 del otro (antes eran todos). Total actual: 26 ladrones en el juego.
- **Flujo del arte**: Gemini web en el navegador integrado (la API gratis no genera imágenes). Las imágenes se capturan de pantalla (`tools/grab_shot.mjs`) porque las descargas y la red local están bloqueadas desde esa página. Gemini limita las imágenes por día (límite alcanzado el 8/10; se restablece a las 2:02 a.m.).
- **Pendiente**: 4 ladrones más (Byte, Tato, Telmo, Flor), más medallas/logros, datos actuales de Uruguay (escritores, hechos históricos, museos/objetos) y nuevos retos.
- **Mismo look que los originales**: `tools/build_frames.py` saca de los 16 ladrones originales el marco exacto de la foto (papel crema + borde negro irregular) y la ficha de la lista (con su chincheta); `tools/make_mugshot.py` aplica un "shader" a los dibujos nuevos (más saturación, colores planos, contornos gruesos), los pone sobre la pared con la tabla de alturas, sombra, chapa con código, y les pone esos marcos. Los 16 originales siguen en el juego junto a los nuevos.

## Desktop (Rust), música, logos y créditos
- **Logo de Vicemi Dev** antes de todo (`src/game/content/logovicemi.ts`, `p0_vicemi_logo.jpg`), menú nuevo (`p0_mainmenu_mainback.jpg` reemplazado desde `tools/extra_images`), líneas de crédito en el menú (`content/credit.ts`) y primera página de los créditos (`research/credits_page0.txt` + parche en `content_web.py`).
- **Música**: variantes del menú (`p1_music_menu_a/b/c`, 45 % entre las tres) y de la persecución (`p3_music_chase_a..d`, 40 % entre las cuatro); sonidos extra en `tools/extra_sounds/` (los toma `tools/build_assets.py`).
- **Logros** (`content/achievements.ts`): 22 medallas especiales guardadas como `ach_<id>` en la lista de medallas.
- **Escritorio**: `desktop/` (Rust: `wry`/`tao`/`muda`/`rfd`), puente `src/desktop.ts` (`window.ipc`): la partida de `saves/progress.json` entra al `localStorage` antes de arrancar el juego y la página manda cada cambio al host (cada 10 s, al ocultarse, al cerrar). WebView2 guarda su perfil en `data/webview` dentro de la instalación. El instalador lleva `payload.zip` (ded.exe + game/) y un `uninstall.exe` pequeño compilado con la característica `stub`.

## Guardado seguro (1.0.5)
- **Capa de archivos** (`src/runtime/safefs.ts`, usada por `src/runtime/py.ts`): cada archivo del juego (`data/characters.dat`, `data/highscores.dat`, `data/c<id>.dat`) vive en `localStorage` como `ded.fs:<ruta>`. Escribir valida el contenido (un `c<id>.dat` debe terminar en `capturedthieves` y tener `score`/`medals`), pasa por una clave temporal (`ded.tmp:`), guarda la versión anterior buena en `ded.bak:` y la de más progreso en `ded.best:`; los archivos dañados se apartan en `ded.bad:`. Leer repara desde esas copias si el archivo falta, está dañado o tiene MENOS progreso que `ded.best:` (el progreso solo sube: casos resueltos, puntos, medallas). Borrar un detective borra también sus copias. Sin espacio o sin almacenamiento el juego sigue en memoria y la página avisa (`storageFailed()`).
- **Importar** (`Controller.importSave`) valida cada archivo y es deliberado: puede bajar el progreso (la versión anterior queda en `ded.bak:`). En escritorio `restoreFromHost` (`src/desktop.ts`) corre una vez por ejecución (`sessionStorage`) y solo completa lo que falta o tiene más progreso: `window.__DED_SAVE__` es la partida de cuando abrió el programa y al recargar pisaba lo nuevo.
- **Cargar** (`serialization.open_character`): cada línea se lee con try/catch; una línea de caso ilegible (índice desconocido) regenera el caso, una de progreso se salta. Las listas guardadas por índice (`list_clues`, ladrones, departamentos, testigos, frases) solo se pueden AGREGAR al final.
- **Autosave** (`src/game/autosave.ts`): al ocultar/cerrar la página guarda el caso abierto si hay una fase en pantalla y no empezó una pantalla final (`stage.ending_started`). Las medallas/puntos/logros del caso ganado se guardan al mostrar la pantalla final (`EndGame.add_medal`).
- **Pruebas**: `save_safety`, `endgame_persist`, `oldsaves` (archivos de `tools/scenarios/fixtures/`, formato 1.0.x), `detectives`, `minigames`.
- **Escritorio (Rust)**: `saves.rs` no reemplaza una partida con archivos por una sin archivos y conserva `.bak` solo cuando el contenido cambia.
