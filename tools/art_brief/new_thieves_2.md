# 8 ladrones nuevos con la cultura uruguaya actual + sus medallas — encargo para Gemini

Todos son personajes INVENTADOS (nada de parecerse a personas reales). Flujo igual que `NEW_CHARACTERS.md`: frente y perfil derecho de cada uno en la misma conversación (fondo verde plano), referencias de estilo de `research/art_refs/`. Cuando estén guardados en `art_inbox/<id>_front.png` y `<id>_side.png`, el resto (fichas, datos, pistas, pruebas) lo hace el código.

Prompt base (completar {look}):
Cartoon illustration in the style of the attached police mugshots: bold black outlines, flat cel shading with soft shadows, slightly exaggerated caricature proportions, saturated but not neon colors. Head and shoulders bust, head centered with margin above, shoulders cut by the bottom edge, 3:4 portrait ratio. Character: {look}. FRONT VIEW, neutral police-photo expression. Background flat pure green #00FF00, no gradient, no shadows, no text, no frame. No green in clothes or hair.
Perfil: "Same character, same outfit and colors, now in RIGHT PROFILE VIEW (face turned to the right). Same style, framing and background."

| id | Nombre / apodo | look |
|---|---|---|
| humano | Ezequiel Pelado, "El Humano" | bald man about 40, perfectly serious face, plain grey suit and white shirt, says everything in third person; tiny name tag that reads "HUMANO" |
| tussy | Camila Rosada, "La Tussy Warrior" | young woman, long hair dyed pink, sparkly pink glitter makeup, night-out jacket with a pink warrior emblem, confident smirk |
| streamer | Nicolás Directo, "El Streamer" | thin guy about 25, gaming headset around the neck, ring-light reflection in round glasses, hoodie with a cartoon controller, energy drink can in hand |
| cumbia | Gladys Plena, "La Reina de la Cumbia" | woman about 45, voluminous curly dark hair, sequined top, big hoop earrings, microphone in hand, stage-light glow |
| delivery | Ubaldo Rapidín, "El Delivery" | man about 30, motorbike helmet on, square thermal delivery backpack, reflective vest, sweaty, in a hurry |
| influencer | Florencia Rambla, "La Influencer" | woman about 28, perfect wavy blond hair, selfie stick, sunglasses on head, mate in one hand and phone in the other, ring on every finger |
| cripto | Crespo Bitcoin, "El Cripto" | man about 35, slicked hair, hoodie with a golden coin logo, three phones in pockets, nervous grin, thin beard |
| tribunero | Hugo Garra, "El Tribunero" | stocky man about 50, thick mustache, football scarf (blue and white stripes, no real club), drum in hand, hoarse-voice look |

## Medallas por capturar a cada uno (hoja 2 filas x 4, fondo verde, `art_inbox/raw_medals_6.jpg`)
Mismo estilo que las medallas del juego (cinta corta blanca y celeste arriba, borde grueso oscuro). Orden: humano, tussy, streamer, cumbia, delivery, influencer, cripto, tribunero.
1 BRONCE: cara seria calva con un cartelito "HUMANO" · 2 PLATA: guerrera rosada con brillos y una corona · 3 BRONCE: auriculares gamer y un joystick · 4 ORO: micrófono y un tambor de cumbia · 5 BRONCE: mochila térmica de reparto con una moto · 6 PLATA: palo de selfie con corazones y un mate · 7 BRONCE: moneda dorada con rayo y una billetera rota · 8 PLATA: bufanda de rayas y un bombo.
Orden de corte en `tools/build_medals.py` (SHEETS 6): captura_humano, captura_tussy, captura_streamer, captura_cumbia, captura_delivery, captura_influencer, captura_cripto, captura_tribunero.
