# El Milanesero (Joaco Piedrablanca): guía paso a paso para Gemini

Ladrón nuevo de parodia, con nombre y delito inventados (no se parece a ninguna persona real): vendía milanesas "100% veganas" que, según el cliente, eran de carne... o de nada conocido. Nadie sabe de qué estaban hechas.

- **id:** `milanesero`
- **Nombre / apodo:** Joaco Piedrablanca, "El Milanesero", 33 años
- **Rasgos (ya cargados en el juego):** hombre, alto, pelo rubio, lentes (de aumento, para que se vean en la foto)
- **Mascota / deporte:** gallina / pelota paleta
- Hacé el personaje en UNA conversación (así frente y perfil salen iguales).

## Antes de empezar
- Referencias de estilo de los personajes: subí `research/art_refs/REFERENCIA_ESTILO_originales.png` y `research/art_refs/andrea_1.png`.
- Referencia de estilo de las medallas: subí `art_inbox/raw_medals_1.jpg`.

## Qué guardar y dónde (todo en `art_inbox/`)
- `milanesero_front.png` (frente), `milanesero_side.png` (perfil derecho) y `medal_milanesero.png` (medalla de captura).

---

**Paso 1 – frente.** Subí las 2 referencias de personajes y pegá:

```
Cartoon illustration in the style of the attached police mugshots: bold black outlines, flat cel shading with soft shadows, slightly exaggerated caricature proportions, saturated but not neon colors. Head and shoulders bust, the head centered with a margin above it and the shoulders cut by the bottom edge, 3:4 portrait ratio. Character: tall man about 33, wavy blond hair, thick-rimmed glasses, a clean white apron over a polo shirt, a flat paper chef hat slightly crooked, a very serious "trust me" face with raised eyebrows, holding up a breaded cutlet (milanesa) in one hand, golden and crispy, like a product demo. A cartoon parody of a shady food seller, fictional face. FRONT VIEW, neutral expression like a police photo, looking straight ahead. Background: flat pure green #00FF00, no gradient, no shadow on the background, no text. No frame, no height chart, no plate. Do not use green in the clothes or hair.
```
Guardá la imagen como `art_inbox/milanesero_front.png`.

**Paso 2 – perfil (en la MISMA conversación).** Pegá:

```
Same character, same outfit and colors, now in RIGHT PROFILE VIEW (the character's face turned to the right side of the image). Same style, framing and flat green background (#00FF00).
```
Guardá como `art_inbox/milanesero_side.png`.

**Paso 3 – medalla (conversación NUEVA).** Subí `raw_medals_1.jpg` y pegá:

```
One single game achievement medal in the exact style of the attached reference medals (cartoon, thick dark outline, flat colors with simple shading, round SILVER medal with a short striped ribbon in white and sky blue on top, light from the top left). In the center: a golden breaded cutlet (milanesa) with a big question mark and a tiny ghost-like wisp of steam above it. Centered, with a margin around it, on a uniform flat green #00FF00 background. No text, no ground shadow, no frame.
```
Guardá como `art_inbox/medal_milanesero.png`. Título de la medalla en el juego: «Milanesa Fantasma».

---

## Cuando estén guardadas las 3 imágenes
1. Ficha policial (4 imágenes: foto de frente, de perfil, primer plano y tarjeta de la lista):
   ```
   python tools/make_mugshot.py milanesero art_inbox/milanesero_front.png art_inbox/milanesero_side.png "S 733" 33071958 tall
   ```
   (el código y el número de serie van en la chapa de la foto; pueden ser otros). Deja las imágenes en `tools/extra_images`.
2. Medalla: `python tools/build_medals.py` (toma `art_inbox/medal_milanesero.png` y deja `tools/extra_images/ach_milanesero.png`).
3. Reconstruí los paquetes: `python tools/build_assets.py`.

El juego ya lo tiene cargado (`src/game/content/extend.ts` y `achievements.ts`): **solo aparece cuando existen sus 4 imágenes** `p0_thief_small_milanesero.png` y `p0_thief_big_milanesero_1/2/3.jpg`, y mientras no exista `ach_milanesero.png` la medalla se muestra con un dibujo provisorio (disco plateado con una M).
