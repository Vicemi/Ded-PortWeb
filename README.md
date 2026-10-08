# División Especial de Detectives — versión web

Port web (Astro + React + Canvas) de *División Especial de Detectives*, juego de **Trojan Chicken** para las laptops XO (Plan Ceibal / OLPC, actividad Sugar). Incluye los recursos originales (imágenes, sonidos, fuentes, datos). Funciona con mouse, teclado y táctil.

## Origen y honestidad
- El original es Python 2.6 + pygame con el código **ofuscado/cifrado** (`.me`) y la carrera de la fase 3 en un módulo nativo. Con permiso sobre el código, se descompiló para entender el juego; este port es una **reimplementación fiel** (motor en TypeScript, lógica transpilada y verificada contra el bytecode). La fase 3 se reconstruyó desde los datos YAML del juego, así que su sensación puede diferir del original.
- El código descompilado (`research/`) no se publica.
- Hecho con ayuda de IA (Claude, Anthropic).

## Uso
```bash
npm install
npm run dev      # desarrollo
npm run build    # dist/
npm test         # escenarios headless
```
`npm run assets` regenera `public/assets` desde `F:\Games\DED\Ded.activity` (requiere Python + pygame + PyYAML).
