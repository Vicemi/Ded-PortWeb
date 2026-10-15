# Música del minijuego «Ritmo de candombe»: archivos MIDI propios

El minijuego del Tamborilero trae 5 canciones originales (Candombe de Barrio, Milonga del Puerto, Cumbia del Sábado, Rock del Río y Murga Sinfónica).
Si querés **temas con licencia o propios**, podés agregar archivos MIDI estándar (`.mid`): el juego los toca con sus propias voces (bajo, acordes, melodía y
percusión sintetizadas en el navegador) y arma las notas a golpear a partir de ellos. No hace falta ningún audio.

**Importante:** no incluyas ni transcribas melodías de canciones con derechos de autor sin la licencia o el permiso de quien las posee. En el repositorio solo
van archivos propios o con licencia que permita redistribuirlos, y con su crédito en `credits.json`.

## Cómo agregar un tema

1. Copiá el archivo a `public/assets/music/` (por ejemplo `mi_tema.mid`). Nombres: letras, números, punto, guion, guion bajo o espacio.
2. Creá o editá `public/assets/music/credits.json`. Es la **lista** de temas (el juego no explora la carpeta: solo carga lo que figura acá):

   ```json
   [
     { "file": "mi_tema.mid", "title": "Mi tema", "artist": "Nombre de quien lo compuso", "note": "licencia CC BY 4.0" }
   ]
   ```

   - `file` (obligatorio): nombre del archivo `.mid` / `.midi`.
   - `title` y `artist`: salen en el minijuego («Música: Mi tema - Nombre de quien lo compuso») y en los créditos del juego (botón `i`).
   - `note` (opcional): se agrega entre paréntesis (licencia, fuente, arreglo...).
3. Reconstruí el juego (`npx astro build`) o, en desarrollo, recargá la página.

Si la carpeta o `credits.json` no existen, o no hay temas válidos, el minijuego usa las 5 canciones originales. Si hay temas MIDI, se elige uno al azar
entre ellos (en vez de las originales).

## Qué entiende el juego

- Archivos MIDI estándar, formato 0 o 1, con tiempo en pulsos por negra (PPQ, lo habitual). No se admite el tiempo SMPTE.
- **Percusión:** el canal 10 (batería general GM). Bombo → carril piano; caja, palmas y toms agudos → carril repique; platillos, hi-hat, cencerro y
  claves → carril chico. Los mismos sonidos se tocan de fondo.
- **Melodía:** la parte con más notas (que no sea el bajo) va al 4.º carril (palmas) cuando hay percusión. Si el MIDI **no tiene percusión**, las notas
  de la melodía se reparten por altura entre los 4 carriles.
- **Bajo:** la parte grave (promedio por debajo de Mi3 con al menos 8 notas). El resto suena como acompañamiento.
- El tempo sale del MIDI (cambios de tempo incluidos). Se ignoran los silencios largos del principio y se corta a los 150 segundos.
- Las notas que quedan a menos de 190 ms se simplifican (gana la más fuerte: bombo > caja > melodía > hi-hat) para que se pueda tocar.
- Para una cuenta de entrada de 4 tiempos el juego agrega unos clics antes de empezar.

## Créditos

- En el minijuego: al empezar y en el resultado se ve «Música: <título> - <artista>» (MIDI) o «Música original de Vicemi Dev (estilo ...)» (canciones propias).
- En los créditos del juego (botón `i` y menú principal) se listan las canciones originales y todos los temas MIDI en uso.

## Sincronía y retraso del audio

El tiempo del juego sigue al reloj de audio del navegador (con la latencia de salida descontada), así que la música y las notas no se desfasan. Si con
auriculares Bluetooth o un equipo lento igual notás un retraso, ajustá con **]** (+10 ms) y **[** (−10 ms) dentro del minijuego; el valor queda guardado.
