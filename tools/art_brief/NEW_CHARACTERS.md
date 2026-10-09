# Nuevos ladrones: guía para generar el arte (Nano Banana / Gemini)

Datos de los 10 personajes nuevos: `new_thieves.json` (nombre, apodo, rasgos, descripción, prompt de aspecto).
Cada ladrón necesita **dos dibujos**: frente y perfil. El resto (foto policial con la tabla de alturas, placa, recorte, icono de la lista) lo arma `tools/make_mugshot.py`.

## Cómo generarlos
1. En Gemini (Nano Banana) sube de **referencia de estilo** 2-3 fichas originales de `research/art_refs/` (por ejemplo `ruffo_1.png`, `helga_1.png`, `helga_2.png`; son las fotos policiales del juego) y escribe el prompt.
2. Pide **frente** y **perfil derecho** del mismo personaje, en la misma conversación para que se parezcan.
3. Guarda los archivos en `art_inbox/<id>_front.png` y `art_inbox/<id>_side.png` (el `id` es el de `new_thieves.json`).
4. Dime "ya están" y yo hago el resto: recorte, fichas, datos del juego, pistas y pruebas.

## Prompt base (copiar y completar con el campo `look`)
> Cartoon illustration in the style of the attached police mugshots: bold black outlines, flat cel shading with soft shadows, slightly exaggerated caricature proportions, saturated but not neon colors. **Head and shoulders bust**, the head centered with a margin above it and the shoulders cut by the bottom edge, 3:4 portrait ratio. Character: {look}. **FRONT VIEW**, neutral expression like a police photo, looking straight ahead. Background: **flat pure green (#00FF00), no gradient, no shadow on the background, no text**. Do not add frame, height chart or plate.

Para el perfil, en la misma conversación:
> Same character, same outfit and colors, now in **RIGHT PROFILE VIEW** (the character's face turned to the right side of the image). Same style, framing and flat green background.

## Reglas para que quede bien en el juego
- Fondo verde plano y sin sombras sobre el fondo (si no, el recorte deja bordes).
- No uses verde puro (#00FF00) en la ropa ni el pelo.
- Busto: la cabeza no debe tocar el borde superior; los hombros sí pueden cortarse abajo.
- Tamaño de entrada: cualquiera ≥ 600 px de alto; el script reduce.
- Que los rasgos del `look` se vean claros (pelo, anteojos, lunar, cicatriz, tatuaje): el jugador los identifica por lo que dicen los testigos.
- Personajes inventados: nada de parecerse a personas reales.

## Dibujos extra opcionales (te los puedo pedir después)
- Nuevos detectives jugables (`p0_detective_male_*` / `female_*`): 20 variantes por sexo en el original.
- Medallas nuevas (círculo de 66x66 con un símbolo): se generan por código, pero si prefieres arte propio me lo pasas en fondo verde.
