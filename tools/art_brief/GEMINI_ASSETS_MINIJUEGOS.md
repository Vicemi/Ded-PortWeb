# Arte nuevo para los minijuegos y testigos (Gemini)

Hoy los minijuegos nuevos están dibujados por código y se ven más simples que el resto del juego. Con estas imágenes quedan al nivel de los originales. **Todo es opcional**: el juego usa tu imagen si existe y, si no, sigue usando el dibujo por código.

## Reglas generales (todas las imágenes)
- Estilo (pegalo al principio de CADA prompt, es el «STYLE»):
  `STYLE: cartoon illustration in the style of the 2D game "Ded" (División Especial de Detectives, Uruguay): thick dark-brown outlines, flat cel shading with soft shadows, warm saturated but not neon colors, slightly aged-paper feeling, light coming from the top left. No text, no logos, no real brands.`
- Subí como referencia de estilo `research/art_refs/REFERENCIA_ESTILO_originales.png` (y `REFERENCIA_TESTIGOS.jpg` para los testigos).
- **Sprites y objetos**: un solo objeto por imagen, centrado, con margen, sobre **verde plano #00FF00** (sin degradé ni sombra en el fondo, sin verde en el objeto). Si pido una «tira» o «hoja», todos los dibujos en la misma imagen, separados.
- **Fondos**: imagen completa, sin verde, formato horizontal 4:3 (el juego es 600x450). Dejá la zona central más limpia para que se lea el juego.
- Guardá todo en `art_inbox/` con el nombre exacto de la tabla. Después me avisás «ya están» y yo los recorto, los achico al tamaño del juego y los publico (script `tools/build_minigame_art.py`).
- Una conversación de Gemini por asset (o por familia, si querés que salgan parecidos: marcado abajo como «MISMA CONVERSACIÓN»).

---

## 1. Testigos nuevos (los que dan el minijuego en el mapa)
Cada testigo son 3 imágenes: figura de pie, figura contenta, y yo hago la ficha del mapa. Se procesan con `python tools/prep_witness.py art_inbox/witness_<id>.png` y `python tools/build_witnesses.py <id>`.

### 1.1 El Matero (`matero`) — minijuego «Mate cebado»
Hombre mayor, boina gris, bigote blanco, chaleco de lana, termo bajo el brazo y mate en la mano.
- `art_inbox/witness_matero.png` (MISMA CONVERSACIÓN que la siguiente), figura completa de pie, relación 2:5 aprox. (126x324 en el juego):
```
STYLE. Full-body standing character, front view, friendly old Uruguayan man in his 70s, grey beret, white bushy mustache, wool vest, rolled-up sleeves, a thermos under his left arm and a mate gourd with a metal straw in his right hand, calm half-smile. Standing straight, feet visible, whole figure inside the picture with margin. Flat pure green #00FF00 background, no floor shadow, no text.
```
- `art_inbox/witness_matero_happy.png`, en la misma conversación:
```
Same character, same outfit and same pose and framing, but very happy: wide smile, raised eyebrows, the hand with the mate lifted as if offering a drink. Same flat green #00FF00 background.
```

### 1.2 La Corredora (`corredora`) — minijuego «Rambla»
Mujer de unos 30, cola de caballo castaña, vincha celeste, ropa deportiva celeste y blanca, zapatillas, botellita de agua.
- `art_inbox/witness_corredora.png`:
```
STYLE. Full-body standing character, front view, athletic Uruguayan woman about 30, brown ponytail, sky-blue headband, white and sky-blue running outfit, running shoes, a small water bottle in one hand, slightly tired but smiling, a towel around the neck. Whole figure inside the picture with margin. Flat pure green #00FF00 background, no floor shadow, no text.
```
- `art_inbox/witness_corredora_happy.png` (misma conversación):
```
Same character, outfit, pose and framing, but celebrating: both arms up with the fists closed, open happy mouth, eyes closed with joy. Same flat green background.
```

### 1.3 Los testigos que ya existen no necesitan nada.

---

## 2. Minijuego «Mate cebado» (`mate`)
| Archivo | Tamaño final | Prompt (después del STYLE) |
|---|---|---|
| `mg_mate_bg.png` (fondo, sin verde) | 600x450 | `A cozy Uruguayan kitchen table seen slightly from above at sunset: wooden table, checkered tablecloth, a window with warm light, shelves with jars of yerba, a calefón on the wall. Horizontal 4:3, the center of the picture empty and calm so a game can be drawn on top. No characters, no text.` |
| `mg_mate_termo.png` | 110x330 (vertical) | `A classic stainless steel thermos with a black plastic cup lid and a carrying strap, upright, a little worn, seen from the front. Flat green background.` |
| `mg_mate_termo_pour.png` | 330x200 (horizontal) | `The same stainless thermos tilted about 60 degrees pouring a thin stream of hot water to the right, with a small trail of steam. Flat green background.` |
| `mg_mate_gourd.png` | 220x260 | `A cross-section view of a Uruguayan mate gourd (calabaza) with a metal bombilla straw, the inside visible as a transparent glass-like window showing the green yerba and the water level empty, simple and clear shapes, front view. Flat green background.` |
| `mg_mate_steam.png` | 400x100 (hoja de 4 nubes) | `A sheet of 4 different soft white steam puffs in a row with room between them, cartoon style. Flat green background.` |
| `mg_mate_splash.png` | 400x100 (hoja de 4) | `A sheet of 4 different water splash / spill shapes in a row (small drops and a puddle), cartoon style, light blue with dark outline. Flat green background.` |

## 3. Minijuego «Rambla» (`rambla`)
| Archivo | Tamaño final | Prompt |
|---|---|---|
| `mg_rambla_sky.png` (fondo, sin verde) | 600x450 | `Sunset sky over the Río de la Plata seen from the Montevideo rambla: big orange and pink gradient sky with a few clouds and a large low sun, the river as a flat band at the bottom third. No buildings, no characters. Horizontal 4:3.` |
| `mg_rambla_skyline.png` | 1200x220, **que empalme a izquierda y derecha** | `A seamless horizontally tileable skyline strip of Montevideo in silhouette-like cartoon style: the Palacio Salvo, the Torre de las Telecomunicaciones, apartment blocks, palm trees. Muted purple and orange tones, flat green background above the buildings. The left and right edges must match perfectly to repeat.` |
| `mg_rambla_ground.png` | 600x120, empalmable | `A seamless horizontally tileable strip of the Montevideo rambla pavement seen from the side: sidewalk with curb, wide stone-block wall (muro) with a few fishermen-style bollards, a bit of grass at the bottom. Flat green background above the wall.` |
| `mg_rambla_runner.png` | hoja 6 cuadros de 96x128 (todos en una fila, 576x128) | `A sprite sheet of 6 frames in a single row, same character in every frame: the athletic Uruguayan woman (brown ponytail, sky-blue headband, white and sky-blue running outfit) in a side-view RUN CYCLE facing right, evenly spaced frames with equal size and the feet at the same baseline. Flat green background.` (MISMA CONVERSACIÓN que la siguiente) |
| `mg_rambla_runner_jump.png` | hoja 3 cuadros de 96x128 (288x128) | `Same character, side view facing right, a sheet of 3 frames in a row: crouching to jump, in the air with knees up, landing. Same size and baseline. Flat green background.` |
| `mg_rambla_runner_fall.png` | hoja 3 cuadros de 128x96 (384x96) | `Same character, side view, a sheet of 3 frames in a row: tripping forward, sprawled on the ground with stars above the head, getting up dizzy. Flat green background.` |
| `mg_rambla_obstacles.png` | hoja de 4 objetos, una fila (cono 64x80, banco 140x80, perro 110x80, gaviota 96x64) | `A sheet of 4 separate obstacle sprites in a row with space between them, side view: 1) an orange traffic cone, 2) a wooden rambla bench, 3) a cute trotting street dog, 4) a seagull in flight with wings up. Flat green background.` |
| `mg_rambla_meta.png` | 520x200 | `A big finish-line arch over the road with a checkered banner and the word META in bold letters, tied with sky-blue and white flags, front view. Flat green background.` |

## 4. Minijuego «Ritmo de candombe» (`candombe`)
| Archivo | Tamaño final | Prompt |
|---|---|---|
| `mg_candombe_bg.png` (fondo, sin verde) | 600x450 | `A night street in Barrio Sur in Montevideo during the Llamadas: colorful old houses with balconies, string lights, a warm lit sky, painted walls with murals; the lower half dark and empty so the drums can be drawn on top. No characters.` |
| `mg_candombe_chico.png` | 120x160 | `A candombe "tambor chico" drum, upright, front view, sheepskin head, wooden body painted with a red and yellow stripe, rope tension. Flat green background.` (MISMA CONVERSACIÓN para los 3 tambores) |
| `mg_candombe_repique.png` | 140x170 | `Same style: a candombe "tambor repique", slightly bigger than the chico, with a blue band painted on the body. Flat green background.` |
| `mg_candombe_piano.png` | 160x200 | `Same style: a candombe "tambor piano", the biggest one, deep wooden body with a green band. Flat green background.` |
| `mg_candombe_palmas.png` | 120x160 | `A pair of hands clapping with colorful bracelets, front view, simple cartoon shape. Flat green background.` |
| `mg_candombe_crowd.png` | 1200x180, empalmable | `A seamless horizontally tileable crowd of dancing silhouettes seen from behind, dark blue-purple, with a few waving flags, dancers with long dresses (candombe style) and drummers. Flat green background above the heads.` |
| `mg_candombe_spot.png` | 200x400 | `A cone of stage spotlight light, soft yellow, semi-transparent look, vertical, wide at the bottom. Flat green background.` |

## 5. Minijuego «Cartero» (`cartero`)
| Archivo | Tamaño final | Prompt |
|---|---|---|
| `mg_cartero_bg.png` (fondo, sin verde) | 600x450 | `The inside of an old Uruguayan post office: wooden counter, a wall of pigeonholes full of letters, a brass scale, a clock, warm light, aged paper tones. The center empty and calm for a game on top. No characters.` |
| `mg_cartero_envelope.png` | 300x200 | `A closed airmail envelope with red and blue diagonal stripes at the border, a blank white center for a label, a small stamp in the corner, seen from the front, slightly rotated. Flat green background.` |
| `mg_cartero_stamp.png` | 220x120 | `A rubber ink stamp mark in red with the word ENTREGADA inside an oval border, as if stamped on paper, a bit uneven. Flat green background.` |
| `mg_cartero_bag.png` | 200x200 | `A leather postman bag with a flap and a buckle, a few letters sticking out, front view. Flat green background.` |
| `mg_cartero_stamps.png` | hoja de 4 sellos postales de 80x100 en una fila | `A sheet of 4 different postage stamps in a row with space between them: a hornero bird, a gaucho on a horse, the Palacio Salvo, a sun with a face (Sol de Mayo style). Perforated edges. Flat green background.` |

## 6. Minijuego «Banderas» (`banderas`)
| Archivo | Tamaño final | Prompt |
|---|---|---|
| `mg_banderas_bg.png` (fondo, sin verde) | 600x450 | `A school classroom blackboard in a wooden frame with chalk dust, a ledge with chalk and an eraser, a small world map pinned at a corner, warm light. The center of the board empty. No characters, no text.` |
| `mg_banderas_cardback.png` | 90x120 | `The back of a playing card for a memory game: sky-blue with a white sun with a face in the center and a thick white border, slightly worn. Flat green background.` |
| `mg_banderas_frame.png` | 110x80 | `A small wooden picture frame (empty, no picture inside, the inside is pure flat green #00FF00), front view. Flat green background outside as well.` |

## 7. Interfaz común a todos los minijuegos
| Archivo | Tamaño final | Prompt |
|---|---|---|
| `mg_ui_stars.png` | hoja de 2 estrellas de 64x64 (128x64): llena y vacía | `A sheet of 2 star icons in a row: a golden star with outline and highlight, and an empty grey star with outline. Flat green background.` |
| `mg_ui_sparkles.png` | hoja de 4 de 48x48 en una fila | `A sheet of 4 different sparkle / glint shapes in a row (4-point star, small circle glow, plus sign, tiny heart), golden yellow with a soft white center. Flat green background.` |
| `mg_ui_confetti.png` | hoja de 6 de 32x32 en una fila | `A sheet of 6 small confetti pieces in a row (rectangle, triangle, circle, streamer curl) in different bright colors. Flat green background.` |

---

## Orden recomendado (de lo que más se nota a lo que menos)
1. Testigos Matero y Corredora (los dos juegos nuevos hoy tienen cara dibujada por código).
2. Fondos de los 4 juegos (`mg_*_bg.png`, `mg_rambla_sky.png`).
3. Corredora animada y obstáculos de Rambla.
4. Tambores del candombe.
5. Resto.
Cuando tengas imágenes, guardalas en `art_inbox/` y avisame: yo las proceso y las publico en la siguiente versión. Puedo hacerlo por tandas (no hace falta que estén todas).

---

## Cómo se publican
Con las imágenes en `art_inbox/` (con los nombres exactos de las tablas; las que falten se saltan y el juego sigue con el dibujo por código):
```
python tools/build_minigame_art.py          # mg_*.png -> tools/extra_images/ (fondos recortados a 600x450, sprites sin el verde y a su tamaño, hojas re-armadas)
python tools/build_witnesses.py <id>        # por cada testigo nuevo (matero, corredora...): fichas y figuras
python tools/build_assets.py                # empaqueta todo en public/assets
```
Después se prueba con `npm test` (escenario `minigame_art`) y se mira en el navegador. Si una hoja sale con los dibujos muy desparejos, el script corta por los huecos verdes entre dibujos; si no los encuentra, en partes iguales.
