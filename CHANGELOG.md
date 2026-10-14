# Registro de cambios

La descripción de cada release de GitHub es la sección de su versión; la versión de escritorio la muestra al jugador cuando hay una actualización.

## 1.0.4

### Novedades
- **Lupa**: 24 objetos nuevos para encontrar escondidos en las habitaciones (termo con mate, mate, pelota celeste, guitarra, tambor de candombe, alfajor, chivito, dulce de leche, boina, poncho, cuchillo gaucho, lazo, tannat, copa, cámara, telescopio, libro de poemas, llavero, lupa vieja, reloj de bolsillo, radio a válvulas, celular, taza de café y mochila con la XO). Sus colores están ajustados a los del juego y al encontrarlos dice qué son.

## 1.0.3

### Correcciones
- **Persecución en auto**: los vehículos ya no se amontonan ni se tapan la calle entre sí (siempre queda un carril libre; no se adelantan unos a otros), y se puede **atrapar al ladrón embistiéndolo** desde atrás con velocidad o **cerrándole el paso por delante**, además de ponerte a su lado.
- **Lupa**: hay más objetos escondidos en cada habitación (más pistas falsas y más objetos sueltos).
- **Logros**: ahora se ven en la pantalla de medallas (una fila con los 22 logros, en color los conseguidos) y al tocarlos se abre el panel completo.

## 1.0.2

### Correcciones
- **Celular**: al crear un detective, la lista de departamentos tiene botones grandes **SUBIR / BAJAR / ELEGIR** (las filas eran demasiado chicas para tocarlas).
- **Celular**: zoom con dos dedos (pellizcar) en todo el juego para tocar con precisión los botones y listas pequeños; el botón 1× vuelve al tamaño normal.
- Los toques con dos dedos ya no cuentan como clics del juego.

## 1.0.1

### Correcciones
- **Web en celular**: el juego ya no se congela después de la pantalla de Vicemi Dev y el prólogo (las imágenes que faltan se piden sin bloquear la página).
- **Táctil**: Continuar, Saltar y todos los botones ya responden al toque en el celular (el juego recibía el toque antes de saber dónde estaba el dedo). Ya no hay que esperar a que se descargue todo para jugar.
- Botones de la web más ordenados en celulares apaisados (van en la franja negra, no sobre el juego).
- Versión de escritorio: se quitaron los botones superiores adicionales (el menú de la ventana ya tiene esas opciones).

## 1.0.0

**Primera versión de escritorio (Windows, funciona sin internet) de la edición actualizada de División Especial de Detectives, recreada por Vicemi Dev (vicemi.dev).**

### Novedades
- **Versión de escritorio en Rust**: ventana propia con menú de pantalla (pantalla completa, resoluciones), partidas guardadas en la carpeta de instalación con guardado automático y copias de seguridad, e instalador con desinstalador.
- **Actualizaciones**: el juego busca solo las releases nuevas del repositorio y muestra su registro de cambios antes de descargarlas.
- **Personajes nuevos**: Mateo, Rita, Gambeta, Dulcinea, Doña Tannat, Rambla, Byte, Tato, Telmo, Flor, Víctor Pintos (conserje), Fausto Filete (carnicero), Vera Pezuña (veterinaria), Nana Nochera (niñera) y Aaron Silva "Elliot" (hacker).
- **Minijuegos nuevos**: memoria de banderas (la Maestra), ritmo de candombe (el Tamborilero) y trivia uruguaya (el Cartero); 8 postales nuevas para el puzzle.
- **Logros**: 22 medallas especiales con diseño propio y una pantalla nueva al terminar el caso cuando consigues alguna.
- **Cultura uruguaya actual**: datos nuevos sobre música (Cuarteto de Nos, La Vela Puerca), deporte, política y sociedad; pistas nuevas en los testigos.
- **Banderas** oficiales actuales de los 19 departamentos.
- **Música**: variantes nuevas del menú y de la persecución en auto (la original suena con más frecuencia).
- Logo de Vicemi Dev al inicio, menú nuevo y créditos de la edición.

### Correcciones
- La persecución en auto: la flecha sobre el ladrón tiene el tamaño correcto, el ladrón ya no se ve encima de tu auto y durante el arresto se mantiene a la vista; la cámara está detrás del auto como en el original.
- La lupa del puzzle de la fase 2 se puede tomar y soltar con el mouse.
- Al volver a una partida guardada ya no aparece el error `UUID is not a constructor`.
- Mejoras de guardado y de audio.
