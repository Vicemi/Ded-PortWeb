# Nuevo ladrón: Benito Espuma, "El Platanero" (el cervecero)

Es un personaje de parodia con nombre y cerveza inventados (**Cerveza Jolgorio**, no una marca real). El juego cuenta que ponía «contenido extra» en las cervezas de algunos clientes y usaba sus botellas para pasar polvo blanco. No usé el nombre real de nadie porque una acusación de narcotráfico sobre una persona real (aunque sea en un juego) puede ser una difamación; el chiste de la banana y de las botellas queda igual.

## Qué generar (3 imágenes) y dónde guardarlas (`art_inbox/`)
Uso Gemini, una conversación para frente + perfil (así salen iguales) y otra para la medalla. Subí de referencia `research/art_refs/REFERENCIA_ESTILO_originales.png` y `research/art_refs/andrea_1.png`.

### 1. Frente → `art_inbox/cervecero_front.png`
```
Cartoon illustration in the style of the attached police mugshots: bold black outlines, flat cel shading with soft shadows, slightly exaggerated caricature proportions, saturated but not neon colors. Head and shoulders bust, the head centered with a margin above it and the shoulders cut by the bottom edge, 3:4 portrait ratio. Character: stocky man about 45, big round belly hinted at the bottom, thick black beard, a brewer's flat cap, an apron over a loud banana-yellow shirt printed with small bananas, holding a beer bottle with a plain yellow label that reads JOLGORIO (an invented brand, no real logo), sly half-smile and one raised eyebrow. FRONT VIEW, expression like a police photo. Background: flat pure green #00FF00, no gradient, no shadow on the background, no text besides the invented label. No frame, no height chart, no plate. Do not use green in the clothes or hair.
```

### 2. Perfil derecho (misma conversación) → `art_inbox/cervecero_side.png`
```
Same character, same outfit and colors, now in RIGHT PROFILE VIEW (the character's face turned to the right side of the image). Same style, framing and flat green background (#00FF00).
```

### 3. Medalla de captura (conversación nueva, subí `art_inbox/raw_medals_1.jpg` de referencia) → `art_inbox/medal_cervecero.png`
```
One single game achievement medal in the exact style of the attached reference medals (cartoon, thick dark outline, flat colors with simple shading, round SILVER medal with a short striped ribbon in white and sky blue on top, light from the top left). In the center: a foamy beer bottle cap with a small banana on it and a tiny white powder trail on the foam. Centered, with a margin around it, on a uniform flat green #00FF00 background. No text, no ground shadow, no frame.
```

## Después
Avisame «ya están el cervecero» y yo hago el resto: ficha policial (`make_mugshot.py`), medalla «Espuma Turbia», datos del juego, rumores de testigos, pruebas y la release.

## Datos del juego (ya cargados en `src/game/content/extend.ts`)
- Nombre: Benito Espuma, `"El Platanero"`, 45 años. Se activa solo cuando existen sus 4 imágenes.
- Historia: dueño de la cervecería artesanal Jolgorio; ponía «contenido extra» en algunas botellas de clientes y las usaba para traficar polvo blanco. «Las burbujas escondían algo más que gas.»
- Medalla `ach_cervecero`: «Espuma Turbia».
