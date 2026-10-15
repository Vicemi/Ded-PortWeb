# Objetos nuevos para el juego de la lupa (fase 2) — encargo para Gemini

El juego esconde objetos en las habitaciones; con la lupa se ven "iluminados" y al tocarlos se recogen. Cada objeto necesita **dos imágenes PNG con fondo transparente**:

- `p2s01iNNN.png` — el objeto normal (como se ve sin la lupa)
- `p2s01iNNNl.png` — el mismo objeto "iluminado" (borde brillante amarillo, un poco más saturado), mismo tamaño

Tamaño: entre 40x40 y 70x70 px, vista 3/4 isométrica desde arriba-derecha, mismo estilo que los objetos originales (dibujo animado con contorno oscuro grueso, colores planos con sombreado simple, luz desde arriba a la izquierda). Fondo verde #00FF00 para recortar.

## Lista (24 objetos, temática uruguaya)
1. Termo con mate y bombilla  2. Mate (calabaza) con yerba  3. Pelota de fútbol celeste  4. Guitarra criolla  5. Tambor de candombe (chico)
6. Alfajor  7. Chivito al plato en una mini-bandeja  8. Dulce de leche (frasco)  9. Boina gris  10. Poncho chico doblado
11. Gaucho: cuchillo con funda  12. Lazo enrollado  13. Botella de tannat  14. Copa de vino  15. Cámara de fotos antigua
16. Telescopio chico  17. Libro de poemas con marcapáginas  18. Llavero con muchas llaves  19. Lupa vieja  20. Reloj de bolsillo
21. Radio a válvulas  22. Auricular + celular viejo  23. Taza con humo (café)  24. Mochila escolar con la laptop XO (verde y blanca)

## Prompt sugerido (uno por objeto, o en una hoja con varios)
"Create an image: a hoja de sprites 4x6 de pequeños objetos de juego en estilo cartoon (contorno oscuro grueso, colores planos, sombreado simple, vista 3/4 isométrica), cada objeto centrado en su casilla de 80x80 px y separado por un margen, sobre fondo verde #00FF00 uniforme: [lista de objetos]. Sin texto, sin sombras proyectadas sobre el suelo."
Después pedir la misma hoja con cada objeto "con un contorno amarillo brillante y un resplandor suave" (versión iluminada).

## Cómo se usan
Dejar las imágenes en `tools/extra_images` con esos nombres (ids i600–i623). Los objetos ya están enganchados en el juego (ids i600–i623): `python tools/make_objects.py <hoja.jpg>` los corta y les aplica el tono de los originales. Además pueden ser pistas reales del caso (textos en `src/game/content/lupa_clues.ts`).
