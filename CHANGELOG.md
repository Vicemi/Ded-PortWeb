# Registro de cambios

La descripción de cada release de GitHub es la sección de su versión; la versión de escritorio la muestra al jugador cuando hay una actualización.

## 1.0.5

### Novedades
- **Los objetos nuevos de la lupa también dan pistas**: 22 de los 24 pueden ser pistas reales del caso (el mate con el sticker de un club, la XO con el fondo de pantalla de un cerro, la radio, el libro de poemas, el telescopio...) y llevan al mismo lugar que las pistas de siempre; los demás dicen una frase graciosa en vez del mensaje genérico.
- **8 medallas nuevas** (30 logros en total): Cebador de Pistas, Contraseña Olvidada, Guitarra y Tambor, Rastro Gaucho, Paladar Oriental, Ojo de Lince, Tecnología de Época y Coleccionista de Rarezas. Se ganan al resolver un caso en el que encontraste esas pistas; los logros que ya tenías se conservan.

### Correcciones
- **Partidas más seguras**: el progreso se guarda ahora con copia de respaldo automática (la versión anterior y la de más progreso). Si un archivo de partida se daña, queda incompleto o aparece vacío, el juego lo repara solo con la copia en vez de perder el detective; si el navegador no deja guardar (almacenamiento lleno o bloqueado) avisa y la partida sigue en memoria hasta que la guardes con 💾.
- **Medallas y logros**: las medallas, los puntos y los logros ganados al resolver un caso se guardan en el momento de ver la pantalla final (antes se guardaban recién al cerrar las pantallas de puntaje: si se cerraba la página en el medio, se perdían aunque el juego los hubiera anunciado).
- **Guardado automático** al cambiar de aplicación en el celular, al ocultar o cerrar la pestaña: se conserva lo hecho desde el último punto de guardado del caso.
- **Escritorio**: al recargar el juego (volver a empezar tras cerrarlo, o cargar una partida desde el menú) ya no se pisaba el progreso reciente con la partida que había al abrir el programa.
- **Partidas viejas**: las partidas guardadas con versiones anteriores siguen cargando; si un caso guardado tiene datos que esta versión no conoce, se genera un caso nuevo y se conservan puntos, medallas y logros. Cargar un archivo de progreso dañado o vacío ahora se rechaza sin tocar lo que ya tenías.
- **Celular**: un toque que el sistema cancela (gesto del borde, llamada) ya no cuenta como un toque en el botón que estaba debajo del dedo. En la pantalla de logros el texto aclara que se puede tocar una medalla.
- **Medallas**: una medalla con un nombre desconocido en el archivo de progreso ya no rompe la pantalla de medallas.

### Rendimiento
- **Pantallas quietas casi gratis**: el juego ya no repinta lo que no cambió (menús, carpeta, mapa: de ~3-5 ms a menos de 0,1 ms por cuadro en la prueba), lo que ahorra batería y calor en el celular.
- **Lupa más liviana**: la habitación ampliada solo se dibuja en la ventana de la lupa.
- **Celulares lentos**: si pintar un cuadro tarda demasiado, se pinta uno de cada dos (o tres); la lógica del juego sigue a la misma velocidad.
- **Descarga**: todo lo necesario para arrancar se pide a la vez con una sola barra de progreso, el paquete grande de imágenes baja en 4 tramos en paralelo y se guarda en el navegador: las visitas siguientes no vuelven a descargar imágenes ni sonidos, y una actualización solo baja los archivos que cambiaron.
- **Sonido en celular**: se arranca también al soltar el dedo (iPhone), se pausa al ocultar la página y la música ya escuchada se libera de la memoria.

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
