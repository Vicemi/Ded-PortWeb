# División Especial de Detectives — versión web

Port web (Astro + React + Canvas) de *División Especial de Detectives*, juego de **Trojan Chicken** para las laptops XO (Plan Ceibal / OLPC, actividad Sugar). Incluye los recursos originales (imágenes, sonidos, fuentes, datos). Funciona con mouse, teclado y táctil.

**Jugar:** https://ded-portweb.vicemi.dev

## Origen y honestidad
- El original es Python 2.6 + pygame con el código **ofuscado/cifrado** (`.me`) y la carrera de la fase 3 en un módulo nativo. Con permiso sobre el código, se descompiló para entender el juego; este port es una **reimplementación fiel** (motor en TypeScript, lógica transpilada y verificada contra el bytecode). La fase 3 se reconstruyó desde los datos YAML del juego, así que su sensación puede diferir del original.
- El código descompilado (`research/`) no se publica.
- Hecho con ayuda de IA (Claude, Anthropic).

## Progreso
Se guarda en el navegador (localStorage). Los botones 💾 / 📂 descargan y cargan un archivo `.json` con todo el progreso (detectives, puntajes), para respaldarlo o pasarlo a otro equipo.

## Uso
```bash
npm install
npm run dev      # desarrollo
npm run build    # dist/
npm test         # escenarios headless
```
`npm run assets` regenera `public/assets` desde `F:\Games\DED\Ded.activity` (requiere Python + pygame + PyYAML).

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
