# Objetos de broma para la lupa (i624 a i629): guía para Gemini

Seis objetos nuevos para el juego de la lupa (fase 2). **No dan pistas**: son señuelos graciosos que aparecen mezclados en las habitaciones y, al tocarlos, muestran un mensaje.
El juego ya los tiene registrados (nombres, mensajes y tamaños); **solo se usan cuando existen sus dos imágenes**, así que mientras no haya arte no pasa nada (no se rompe, simplemente no aparecen).

| Id | Objeto | Mensaje al encontrarlo | Lado largo en el juego |
|---|---|---|---|
| `i624` | Empanada | EMPANADAS | 20 px |
| `i625` | Martillo azul | Oh no hermano, es el martillo, es real | 24 px |
| `i626` | Bolsa de leche | Una bolsa de leche. Se rompe antes de que la abras, como siempre. | 20 px |
| `i627` | Torta frita | Una torta frita. Llueve afuera: ya se sabe que es obligatoria. | 18 px |
| `i628` | Chancleta suelta | Una chancleta suelta. La otra nunca aparece. No es una pista. | 20 px |
| `i629` | Paraguas roto | Un paraguas roto por el viento de la rambla. Ni él aguantó. | 26 px |

Los tamaños son diminutos (el objeto original más grande mide 36 px), por eso el dibujo tiene que ser **simple, de silueta clara y con pocos detalles**.

## Cómo hacerlos

**Un objeto por imagen** (así cada uno queda del tamaño justo). Subí a Gemini una imagen de referencia de estilo (la hoja de los 24 objetos que se usó con `make_objects.py`, o algunos objetos originales) y pegá cada prompt. Cada prompt ya trae el estilo completo.

### i624 — Empanada
```
Cartoon game item in the style of the attached reference objects: thick dark-brown outline, flat colors with simple soft shading, slightly dusty warm palette, 3/4 isometric view from above and to the right, light from the top left. ONE single object: a baked half-moon empanada, golden brown and a bit shiny, with the typical braided (repulgue) edge along the curved side. Centered, with a generous margin around it, large and simple (it will be shrunk to about 20 px wide, so the silhouette must read clearly and have few details). Background: flat pure green #00FF00, no gradient, no ground shadow, no text, no frame. Do not use green anywhere in the object.
```
Guardar como `art_inbox/obj_i624.png`.

### i625 — Martillo azul
```
Cartoon game item in the style of the attached reference objects: thick dark-brown outline, flat colors with simple soft shading, slightly dusty warm palette, 3/4 isometric view from above and to the right, light from the top left. ONE single object: a chunky claw hammer with a bright blue metal head and a short wooden handle, lying diagonally. Centered, with a generous margin around it, large and simple (it will be shrunk to about 24 px, so the silhouette must read clearly and have few details). Background: flat pure green #00FF00, no gradient, no ground shadow, no text, no frame. Do not use green anywhere in the object.
```
Guardar como `art_inbox/obj_i625.png`.

### i626 — Bolsa de leche
```
Cartoon game item in the style of the attached reference objects: thick dark-brown outline, flat colors with simple soft shading, slightly dusty warm palette, 3/4 isometric view from above and to the right, light from the top left. ONE single object: a soft plastic milk bag (the pillow-shaped sachet of one litre of milk sold in Uruguay), white-bluish with a plain blue band and a simple cartoon cow head on it, sealed at the top and bottom with small crimped edges. No brand, no real logo, no text. Centered, with a generous margin around it, large and simple (it will be shrunk to about 20 px tall, so the silhouette must read clearly and have few details). Background: flat pure green #00FF00, no gradient, no ground shadow, no text, no frame. Do not use green anywhere in the object.
```
Guardar como `art_inbox/obj_i626.png`.

### i627 — Torta frita
```
Cartoon game item in the style of the attached reference objects: thick dark-brown outline, flat colors with simple soft shading, slightly dusty warm palette, 3/4 isometric view from above and to the right, light from the top left. ONE single object: a torta frita, a round flat fried dough disc, golden with darker blistered spots and a small slit in the middle, a few sugar grains on top. Centered, with a generous margin around it, large and simple (it will be shrunk to about 18 px, so the silhouette must read clearly and have few details). Background: flat pure green #00FF00, no gradient, no ground shadow, no text, no frame. Do not use green anywhere in the object.
```
Guardar como `art_inbox/obj_i627.png`.

### i628 — Chancleta suelta
```
Cartoon game item in the style of the attached reference objects: thick dark-brown outline, flat colors with simple soft shading, slightly dusty warm palette, 3/4 isometric view from above and to the right, light from the top left. ONE single object: a single worn flip-flop sandal (only one, left foot), faded red sole with a white strap, slightly bent. Centered, with a generous margin around it, large and simple (it will be shrunk to about 20 px long, so the silhouette must read clearly and have few details). Background: flat pure green #00FF00, no gradient, no ground shadow, no text, no frame. Do not use green anywhere in the object.
```
Guardar como `art_inbox/obj_i628.png`.

### i629 — Paraguas roto
```
Cartoon game item in the style of the attached reference objects: thick dark-brown outline, flat colors with simple soft shading, slightly dusty warm palette, 3/4 isometric view from above and to the right, light from the top left. ONE single object: an umbrella broken by the wind, turned inside out with a couple of bent metal ribs sticking out and torn dark blue fabric, a curved wooden handle, lying diagonally. Centered, with a generous margin around it, large and simple (it will be shrunk to about 26 px long, so the silhouette must read clearly and have few details). Background: flat pure green #00FF00, no gradient, no ground shadow, no text, no frame. Do not use green anywhere in the object.
```
Guardar como `art_inbox/obj_i629.png`.

## Qué guardar y cómo procesarlo

1. Guardá cada imagen como `art_inbox/obj_<id>.png` (por ejemplo `art_inbox/obj_i624.png`), fondo verde plano. No hace falta que estén todos: se procesan los que existan.
2. Corré, desde la raíz del proyecto:
   ```
   python tools/make_objects.py
   ```
   Sin argumentos procesa **solo los archivos sueltos** `art_inbox/obj_<id>.png` (ids `i624` en adelante). Genera `tools/extra_images/p2s01<id>.png` (objeto chico) y `p2s01<id>l.png` (el mismo al doble de tamaño, el que muestra la lupa), con el tono y el contorno de los objetos originales, y deja el tamaño real en `src/game/content/lupa_objects_data.ts` y `tools/objects.json`. La vista de control queda en `research/shots/new_objects_singles.png`.
3. El flujo de la hoja de 24 objetos sigue igual: `python tools/make_objects.py <hoja.jpg>` procesa la hoja (i600 a i623) **y además** los archivos sueltos que haya.
4. Reconstruí los paquetes de imágenes con `python tools/build_assets.py` (toma `tools/extra_images`) y probá con `node tools/headless.mjs tools/scenarios/lupa_objects.mjs research/shots`.

## Para agregar más objetos después
Agregá una fila a la lista `OBJECTS` de `tools/make_objects.py` (después de las de `i624`), su tamaño estimado en `GUESS`, y su mensaje en `OBJECT_JOKES` de `src/game/content/lupa_clues.ts`; corré el script una vez para regenerar `lupa_objects_data.ts`. Los ids nunca se reordenan ni se reutilizan.
