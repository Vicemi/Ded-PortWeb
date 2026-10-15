# Registro de cambios

La descripción de cada release de GitHub es la sección de su versión; la versión de escritorio la muestra al jugador cuando hay una actualización.

## 1.1.0

### Novedades
- **«Ritmo de candombe»: la música ya no se desfasa**: las notas siguen al reloj de audio del navegador (descontando la latencia de salida) y la música se programa por adelantado sobre ese mismo reloj, así que no se va de tiempo aunque los cuadros sean irregulares. Si se oculta la pestaña o el audio se suspende, el juego se pausa y retoma sin perder el compás. Con **[** y **]** ajustás el retraso del audio (por ejemplo con auriculares Bluetooth); se guarda.
- **Temas propios en MIDI para el minijuego de ritmo**: poné archivos `.mid` en `public/assets/music/` y listalos en `credits.json` (título, artista, nota); el juego los toca con sus propias voces y arma las notas desde la percusión (canal 10) o la melodía. Sin archivos, suenan las 5 canciones originales. El minijuego muestra «Música: título - artista» (o «Música original de Vicemi Dev (estilo ...)») y los créditos del juego (botón i) listan la música en uso. Ver `tools/art_brief/MUSICA_MIDI.md`.
- **«Ritmo de candombe» ahora es un juego de ritmo de verdad**: cae una pista de notas hacia 4 tambores (chico, repique, piano y palmas; teclas A S D F o flechas, o tocá los tambores con el mouse o el dedo) sobre una **canción de fondo** hecha en el navegador, con tempo y dificultad distintos según el nivel del caso: *Candombe de Barrio*, *Milonga del Puerto*, *Cumbia del Sábado*, *Rock del Río* y *Murga Sinfónica* (composiciones originales). Hay ventanas de acierto (perfecto / bien / fallo), combo con multiplicador, puntaje y nota final (S a D), tambores que se aplastan al golpear, chispas, luces de escenario y público. Con el 70% de aciertos la cuerda queda afinada; si no, reintentás con Enter o clic.
- **El teclado ya no se traba en «Ritmo de candombe»**: si la ventana pierde el foco o se oculta, el juego se pausa y suelta todas las teclas; al salir con Esc (o reintentar) se liberan los oyentes, el audio y los temporizadores, y un vigilante reactiva el juego si algún temporizador se pierde.
- **2 testigos y minijuegos nuevos en tiempo real**: el **Matero** («Mate cebado»: mantené apretado —mouse, dedo o ESPACIO— para volcar el agua del termo y soltá dentro de la franja verde; si te pasás se derrama y el termo tiene poca agua) y la **Corredora** («Rambla»: tocá, hacé clic o ESPACIO para saltar conos, bancos y perros de la Rambla al atardecer, saltá más alto manteniendo apretado; tres tropiezos y volvés a empezar). Con animaciones, partículas y niveles de dificultad; al ganar dan la pista como los demás testigos. Sus dibujos están hechos por código.
- **Los minijuegos nuevos aceptan arte nuevo**: Mate cebado, Rambla, Cartero y Banderas usan imágenes `mg_*.png` (fondos, termo, calabaza, corredora animada, obstáculos, meta, sobre, sellos, pizarrón, estrellas, destellos y confeti) cuando existen y, si falta alguna, siguen con el dibujo por código; también los testigos Matero y Corredora usan sus fichas reales (`p1_minigame_<id>.png`) si se publican. Se arma con `tools/build_minigame_art.py`.
- **¡Una noche más!**: si se te acaba el tiempo pero estás muy cerca del ladrón (ya tenés la orden de arresto, lo atrapaste, o la pista te llevó al último o al anteúltimo departamento), el jefe te da una noche más, una sola vez por caso. La segunda vez, el caso se da por perdido.
- **6 objetos de broma en la lupa**: una empanada ("EMPANADAS"), el martillo azul ("Oh no hermano, es el martillo, es real"), una bolsa de leche, una torta frita, una chancleta suelta y un paraguas roto. No dan pistas: aparecen al azar entre los demás objetos (cuando estén sus dibujos).
- **Nuevo ladrón: Joaco Piedrablanca, "El Milanesero"** (parodia, nombre inventado): vendía milanesas "100% veganas" y nadie sabe de qué estaban hechas. Con su ficha, rumores de testigos, mascota (gallina), deporte (pelota paleta) y la medalla "Milanesa Fantasma" (aparecen cuando estén sus dibujos).
- **«Incriminado»: botón REPASAR PISTAS** en el informe del laboratorio. Abre un panel (con páginas y flechas, también con las teclas ← →) que lista las pistas encontradas, los objetos con nombres que viste en las habitaciones (ahora el caso los recuerda y quedan guardados), lo que dijo cada testigo y la ficha del incriminado, y al cerrarlo vuelve a la elección del culpable.
- **Minijuegos con mucha más vida**: «Memoria de banderas» (la Maestra) pasa a un pizarrón con tarjetas grandes que se reparten, se dan vuelta con perspectiva, se levantan al pasar el mouse o apretar, tiemblan y se tiñen de rojo si te equivocás y brillan con chispas al formar una pareja, con barra de tiempo que cambia de color (verde, amarillo, rojo) y un cartel final con estrellas y confeti. «Cartas de Uruguay» (el Cartero) ahora es una carta aérea con la pregunta que entra volando, cuatro respuestas grandes en 2x2 (también con las teclas 1-4 o A-D) que se levantan, se aprietan y tiemblan si fallás, un sello «ENTREGADA» al acertar, racha, sellos de progreso, barra del bono de tiempo y cartel final con estrellas. Las zonas táctiles cubren también los huecos entre tarjetas y respuestas, así que en el celular no se pierde ningún toque.
- **Albañil, Jardinero, Bibliotecaria y Tendero con efectos nuevos** (las reglas y la dificultad no cambian): chispas, estrellas y texto flotante al acertar, destello rojo con sacudida al fallar, polvo al mover las piezas y confeti al terminar; las barras de tiempo de la Bibliotecaria y el Tendero cambian de verde a rojo y parpadean cuando queda poco. La pantalla de puntaje de todos los minijuegos muestra ahora de una a tres estrellas que aparecen una por una.

- **Nuevo ladrón: Benito Espuma, "El Platanero"** (parodia, nombre y cerveza inventados): cervecero que escondía "contenido extra" en las botellas de sus clientes. Medalla «Espuma Turbia». Aparece cuando su arte esté publicado.

### Correcciones
- **Libro de notas con muchas notas**: los nombres largos (3 líneas o más) se superponían con la nota de abajo; ahora cada entrada reserva su alto real, el resaltado del ratón la cubre entera y las páginas se pasan sin recortes. También se pueden pasar las páginas con las flechas del teclado.
- En el mapa, el departamento donde estás, el de la primera guarida y todos los que nombran las pistas (un río puede cruzar varios) ahora se pueden elegir; antes aparecían como activos pero no respondían al clic.
- Las pistas ya no son ambiguas: las tres pistas de un caso apuntan a un único departamento (antes tres ríos o lagunas podían servir para más de uno y "no estaba ahí").
- Las pistas con localidades de nombre repetido (Las Piedras, La Paloma, Florencio Sánchez, José Enrique Rodó, Ismael Cortinas) ahora indican cuál es: "Las Piedras (ciudad)" o "(centro poblado)".
- **El teclado ya no se "muere"**: antes dejaba de responder si hacías clic en un botón de la barra (sonido, pantalla completa, créditos...), cerrabas una ventana o volvías con Alt+Tab. Ahora el juego recibe las teclas siempre (salvo cuando escribís en un campo de texto), recupera el foco solo y, si una tecla quedó "pegada" porque la ventana perdió el foco, la suelta.
- Una tecla que se soltaba con otro símbolo que al pulsarla (por ejemplo Mayús+1) o con Ctrl apretado ya no queda trabada. Un error dentro de un evento ya no frena los siguientes ni deja la interfaz bloqueada, y un "vigilante" reinicia el bucle y limpia el teclado si el juego se queda sin responder más de 2 segundos.
- **Guardado mucho más frecuente**: el caso se guarda unos instantes después de cada acontecimiento (pista, testigo visitado, minijuego terminado, viaje a otro departamento, notas, orden de arresto, medalla) y cada 15 segundos mientras juegas, además de al ocultar o cerrar la página. Al volver, el juego retoma en la misma fase. Aparece un pequeño «guardado ✓» arriba a la derecha, y si el navegador no deja guardar avisa. En la versión de escritorio, la carpeta de partidas se actualiza cada 3 segundos y al cerrar la ventana.

## 1.0.8

### Novedades
- **8 ladrones nuevos de la cultura de hoy** (todos parodias, con nombres y delitos inventados): Facundo Clickbait "El Humanoide", Churrito Tussy "El Churrito", Nicolás Directo "El Streamer", Gladys Plena "La Reina de la Cumbia", Ubaldo Rapidín "El Delivery", Florencia Rambla "La Influencer", Crespo Bitcoin "El Cripto" y Hugo Garra "El Tribunero". Con sus fichas policiales, mascotas y deportes nuevos (gato, perro, loro, carancho) y rumores de los testigos.
- **12 medallas con dibujo propio**: una por cada ladrón nuevo (42 logros en total) y las 4 de la trampa «Incriminado», que antes tenían un dibujo provisorio.

## 1.0.7

### Correcciones
- El sticker del mate de Paysandú decía "IASA", pero ese club es de Montevideo: ahora dice Paysandú Bella Vista (los demás clubes —Tacuarembó FC, Deportivo Maldonado, Plaza Colonia, Rocha FC y Cerro Largo FC— están comprobados).

## 1.0.6

### Novedades
- **¡Incriminado!**: en algunos casos (al azar, a partir del tercer caso) el sospechoso que atrapás resulta haber sido incriminado: los peritos analizan las huellas y descubren que son de **otro de tu lista**. Con el informe (la mascota y el deporte del verdadero culpable) tenés que **repasar las pistas** y elegirlo; si acertás, el caso se resuelve con él, y si no, se pierde.
- **Los objetos de la lupa cuentan historias**: el mate, la XO, la guitarra, el libro, el llavero, la cámara, el reloj, la taza y la pelota pueden traer un nombre grabado o pegado de **otro sospechoso de la lista**. En un caso con incriminado es el verdadero culpable; en los demás, una pista falsa.
- **4 medallas nuevas** (34 logros): Incriminado, Falso Criminal, Ojo Clínico y Nadie te Engaña.

### Correcciones
- Las descripciones de las medallas ya no se cortan: la pantalla de logros y la de fin de caso dan lugar a varias líneas.

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
