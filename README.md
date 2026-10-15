# División Especial de Detectives — versión web

Port web (Astro + React + Canvas) de *División Especial de Detectives*, juego de **Trojan Chicken** para las laptops XO (Plan Ceibal / OLPC, actividad Sugar). Incluye los recursos originales (imágenes, sonidos, fuentes, datos). Funciona con mouse, teclado y táctil.

**Jugar:** https://ded-portweb.vicemi.dev

## Origen y honestidad
- El original es Python 2.6 + pygame con el código **ofuscado/cifrado** (`.me`) y la carrera de la fase 3 en un módulo nativo. Con permiso sobre el código, se descompiló para entender el juego; este port es una **reimplementación fiel** (motor en TypeScript, lógica transpilada y verificada contra el bytecode). La fase 3 se reconstruyó desde los datos YAML del juego, así que su sensación puede diferir del original.
- El código descompilado (`research/`) no se publica.
- Hecho con ayuda de IA (Claude, Anthropic).

## Progreso
Se guarda en el navegador (localStorage). Los botones 💾 / 📂 descargan y cargan un archivo `.json` con todo el progreso (detectives, puntajes), para respaldarlo o pasarlo a otro equipo. Cada archivo del juego tiene copia de respaldo automática (ver `MODLOG.md`, *Guardado seguro*).

## Uso
```bash
npm install
npm run dev      # desarrollo
npm run build    # dist/
npm test         # escenarios headless
```
`npm run assets` regenera `public/assets` desde `F:\Games\DED\Ded.activity` (requiere Python + pygame + PyYAML).

## Versión de escritorio (offline, en Rust)

`desktop/` es un workspace de Rust con dos programas:

- **`ded.exe`** (`desktop/player`): abre el juego en su propia ventana (WebView2 con `wry` + `tao`) y lo sirve desde la carpeta `game/` de la instalación, sin internet. Trae menú de **Pantalla** (pantalla completa F11, resoluciones 800x600 … 1920x1440, maximizar), menú de **Juego** (guardar ahora, guardar copia, cargar partida, abrir carpeta de partidas) y **Ayuda** (créditos, vicemi.dev). Las partidas se guardan solas en `saves/progress.json` dentro de la carpeta de instalación (con `progress.bak.json` y copias con fecha en `saves/backups/`); el tamaño de la ventana se recuerda en `data/settings.json`.
- **`DED-Instalador.exe`** (`desktop/installer`): instalador por usuario (sin administrador) con interfaz propia, accesos directos, entrada en *Aplicaciones instaladas* y `uninstall.exe`. También acepta `--silent [--dir <carpeta>] [--no-shortcuts]` y `uninstall.exe --uninstall --silent [--remove-saves]`.

El motor del juego sigue siendo el de la versión web (TypeScript + Canvas); Rust aporta la ventana, el servidor de archivos, el guardado y el instalador. Para compilarlo: `python tools/build_desktop.py` (necesita Rust y el SDK de Windows) → `desktop/release/DED-Instalador.exe`.

### Actualizaciones de la versión de escritorio

`ded.exe` mira (unos segundos después de abrir, y desde *Ayuda > Buscar actualizaciones*) la última release de este repositorio. Si su versión es mayor que la instalada, muestra una ventana con el **registro de cambios** (la descripción de la release), con los botones *Descargar e instalar*, *Ver en GitHub*, *Más tarde* y *Omitir esta versión*. Al descargar, baja el instalador adjunto (`DED-Instalador-<versión>.exe`), lo abre y cierra el juego; las partidas no se tocan, y al primer arranque de la versión nueva se muestran sus novedades. La web no necesita nada de esto (siempre es la última al recargar).

Para publicar una versión: subir la versión en `desktop/Cargo.toml`, escribir su sección en `CHANGELOG.md`, `python tools/build_desktop.py` y `python tools/publish_release.py <versión>` (crea la release `v<versión>` con el instalador adjunto).

## Banderas departamentales
Las cintas de las medallas y las banderitas del mapa y de las medallas usan las banderas actuales de los 19 departamentos (Tacuarembó no tiene bandera oficial: se usa su escudo sobre blanco; la de Montevideo es una bandera no oficial). Archivos de Wikimedia Commons, adaptados al juego (`tools/build_flags.mjs`). Las licencias CC BY-SA (Cerro Largo, Colonia, Rocha) exigen atribución y compartir igual:

| Dpto. | Archivo | Licencia | Origen |
|---|---|---|---|
| artigas | Flag of Artigas Department.png | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:Flag_of_Artigas_Department.png) |
| canelones | Flag of Canelones Department.svg | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:Flag_of_Canelones_Department.svg) |
| cerrolargo | Flag of Cerro Largo Department.PNG | CC BY-SA 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Flag_of_Cerro_Largo_Department.PNG) |
| colonia | Official Flag of Colonia Department.png | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Official_Flag_of_Colonia_Department.png) |
| durazno | Flag of Durazno Department.png | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:Flag_of_Durazno_Department.png) |
| flores | Flag of Flores Department.png | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:Flag_of_Flores_Department.png) |
| florida | Flag of Florida Department.png | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:Flag_of_Florida_Department.png) |
| lavalleja | Flag of Lavalleja Department.png | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:Flag_of_Lavalleja_Department.png) |
| maldonado | Flag of Maldonado Department.png | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:Flag_of_Maldonado_Department.png) |
| montevideo | Bandera no-oficial de Montevideo.png | CC0 | [Commons](https://commons.wikimedia.org/wiki/File:Bandera_no-oficial_de_Montevideo.png) |
| paysandu | Flag of Paysandu Department.png | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:Flag_of_Paysandu_Department.png) |
| rionegro | Flag of Rio Negro Department.png | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:Flag_of_Rio_Negro_Department.png) |
| rivera | Flag of Rivera Department.png | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:Flag_of_Rivera_Department.png) |
| rocha | Flag of Rocha Department.svg | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Flag_of_Rocha_Department.svg) |
| salto | Flag of Salto Department.png | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:Flag_of_Salto_Department.png) |
| sanjose | Flag of San Jose Department.png | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:Flag_of_San_Jose_Department.png) |
| soriano | Flag of Soriano Department.png | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:Flag_of_Soriano_Department.png) |
| tacuarembo | Coat of arms of Tacuarembó Department.png | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:Coat_of_arms_of_Tacuarembó_Department.png) |
| treintaytres | Bandera TyTres.jpg | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:Bandera_TyTres.jpg) |
