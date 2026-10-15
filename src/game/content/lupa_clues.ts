// The objects of the updated edition (lupa_objects.ts) as clues of the case. A clue object is a Clue like the original ones (same notes, same checks); only its
// text is its own: it says what the object tells about the place the thief wants to visit. The objects that are not clues of the case say a short joke instead.
// Clue ids are appended to datastore.list_clues AFTER the original ones: saves store clues by index, so the order must never change.

export interface ClueObject { id: string; types: string[]; lead: (n: any, club: string) => string }

/** the club that a department is known for (checked on the web: Paysandú Bella Vista, Tacuarembó FC, Deportivo Maldonado, Plaza Colonia, Rocha FC, Cerro Largo FC; IASA is from Montevideo, not Paysandú); '' when unknown */
const CLUBS: Record<string, string> = {
  'Paysandú': 'Paysandú Bella Vista', 'Tacuarembó': 'Tacuarembó FC', 'Maldonado': 'Deportivo Maldonado', 'Colonia': 'Plaza Colonia',
  'Rocha': 'Rocha FC', 'Cerro Largo': 'Cerro Largo FC', 'Montevideo': 'Montevideo Wanderers',
};

// name shown in the text; the distinction ("(ciudad)") tells apart same-named places, dropped when the text would not fit the dialog
let fullNames = true;
const nm = (n: any): string => (fullNames ? n.get_full_name() : n.name);
const dep = (n: any): string => { try { return n.get_departments()[0].name; } catch { return ''; } };
/** "about" a note: what the object mentions */
const about = (n: any): string => {
  switch (n.type) {
    case 'HILL': return n.article + ' ' + nm(n);
    case 'LAGOON': return 'la ' + nm(n);
    case 'RIVER': return 'el ' + nm(n);
    case 'LOCATION': return 'la localidad de ' + nm(n);
    case 'HISTORY_FACT': return n.article + ' ' + nm(n);
    case 'WRITER': return nm(n);
    default: return nm(n);
  }
};
/** what the thief wants to do: the lead already names the place, so the ending only has to point at it */
const ending = (n: any): string => n.type === 'WRITER' ? 'Seguramente visitará su lugar natal.' : n.type === 'HISTORY_FACT' ? 'Seguramente irá a ese sitio.' : 'Seguramente irá allí.';
const GEO = ['HILL', 'LAGOON', 'RIVER'];

export const CLUE_OBJECTS: ClueObject[] = [
  { id: 'i600', types: ['LAGOON', 'RIVER'], lead: (n) => `El termo trae una calcomanía de ${about(n)}.` },
  { id: 'i601', types: ['LOCATION'], lead: (n, club) => `Un mate con sticker de ${club || 'un club de fútbol'}. El sospechoso era hincha y solía ir a verlos.` },
  { id: 'i602', types: ['LOCATION'], lead: (n) => `Pelota celeste con dedicatoria: "Para el hincha de ${nm(n)}".` },
  { id: 'i603', types: ['LOCATION', 'HISTORY_FACT', 'WRITER'], lead: (n) => `La guitarra tiene una milonga anotada sobre ${about(n)}.` },
  { id: 'i604', types: ['LOCATION'], lead: (n) => `El tambor tiene pintada una comparsa de ${nm(n)}.` },
  { id: 'i605', types: ['LOCATION'], lead: (n) => `El alfajor dice "Recuerdo de ${nm(n)}".` },
  { id: 'i606', types: ['LOCATION'], lead: (n) => `Servilleta de un restaurante de ${nm(n)}: "el mejor chivito".` },
  { id: 'i607', types: ['LOCATION'], lead: (n) => `Dulce de leche artesanal de ${nm(n)}.` },
  { id: 'i608', types: ['HISTORY_FACT', 'WRITER', 'HILL'], lead: (n) => `En la boina hay apuntes sobre ${about(n)}.` },
  { id: 'i609', types: GEO, lead: (n) => `En el poncho hay un papel sobre ${about(n)}.` },
  { id: 'i610', types: ['HISTORY_FACT'], lead: (n) => `El cuchillo tiene grabado: recuerdo de ${about(n)}.` },
  { id: 'i611', types: GEO, lead: (n) => `Al lazo hay atado un papel: "campamento en ${about(n)}".` },
  { id: 'i612', types: ['LOCATION'], lead: (n) => `Tannat de una bodega de ${nm(n)}.` },
  { id: 'i614', types: ['HILL', 'LAGOON', 'RIVER', 'LOCATION'], lead: (n) => `La cámara guarda fotos de ${about(n)}.` },
  { id: 'i615', types: GEO, lead: (n) => `El telescopio dice: "mirar ${about(n)}".` },
  { id: 'i616', types: ['WRITER'], lead: (n) => `Libro de poemas de ${nm(n)}, con páginas marcadas.` },
  { id: 'i617', types: ['LOCATION', 'HILL'], lead: (n) => `El llavero trae el nombre de ${nm(n)}.` },
  { id: 'i618', types: ['HISTORY_FACT', 'LOCATION'], lead: (n) => `La lupa vieja está sobre ${about(n)} en un mapa.` },
  { id: 'i619', types: ['HISTORY_FACT'], lead: (n) => `La tapa del reloj anota ${about(n)}.` },
  { id: 'i620', types: ['HISTORY_FACT', 'WRITER', 'LOCATION'], lead: (n) => `La radio habla sobre ${about(n)}.` },
  { id: 'i621', types: ['HILL', 'LAGOON', 'RIVER', 'LOCATION'], lead: (n) => `El celular marca en el mapa ${about(n)}.` },
  { id: 'i622', types: ['LOCATION'], lead: (n) => `Ticket de un bar de ${nm(n)} junto a la taza.` },
  { id: 'i623', types: ['HILL', 'LAGOON', 'RIVER', 'LOCATION'], lead: (n) => `La XO tiene contraseña, pero su fondo de pantalla es ${about(n)}.` },
];

/** the text of a clue object for a note of the case, or '' when the id is not one of them */
export function clueMessage(id: string, note: any): string {
  const o = CLUE_OBJECTS.find((x) => x.id === id);
  if (!o) return '';
  const build = () => `${o.lead(note, CLUBS[dep(note)] ?? '')} ${ending(note)}`;
  fullNames = true;
  let msg = build();
  if (msg.length > 118) { fullNames = false; msg = build(); fullNames = true; }
  return msg.replace(/\bde el\b/g, 'del').replace(/\ba el\b/g, 'al').replace(/\bcalcomania\b/g, 'calcoman\xeda');
}

/** what the player reads when an object that is not a clue is found */
export const OBJECT_JOKES: Record<string, string> = {
  i600: 'Un termo tibio. No dice nada del ladr\xf3n.', i601: 'Un mate lavado. De pistas, ni una gota.', i602: 'Una pelota celeste. Nada que ver con el caso.',
  i603: 'Una guitarra criolla desafinada. Ninguna pista.', i604: 'Un tambor de candombe. Solo hace ruido, no da pistas.', i605: 'Un alfajor sin abrir. No parece una pista.',
  i606: 'Un chivito al plato. Huele rico, pero no es una pista.', i607: 'Dulce de leche. Pegajoso, pero no es una pista.', i608: 'Una boina gris vieja. No parece una pista.',
  i609: 'Un poncho. No hay nada en los bolsillos.', i610: 'Un cuchillo gaucho de adorno. No es una pista.', i611: 'Un lazo enrollado. No parece una pista.',
  i612: 'Una botella de tannat vac\xeda. Ninguna pista.', i613: 'Una copa de vino. Sin huellas \xfatiles.', i614: 'Una c\xe1mara sin rollo. No parece una pista.',
  i615: 'Un telescopio. Mira lejos, pero no hay pistas.', i616: 'Un libro de poemas. Lindo, pero no es una pista.', i617: 'Un llavero sin llaves. No parece una pista.',
  i618: 'Una lupa vieja. \xa1Ni ella encuentra pistas!', i619: 'Un reloj de bolsillo parado. No es una pista.', i620: 'Una radio a v\xe1lvulas. Solo se oye est\xe1tica.',
  i621: 'Un celular sin bater\xeda. No parece una pista.', i622: 'Una taza de caf\xe9 fr\xedo. No es una pista.', i623: 'Una mochila con una XO bloqueada. No parece una pista.',
  // plain decoys of the updated edition (jokes: they do nothing)
  i624: 'EMPANADAS', i625: 'Oh no hermano, es el martillo, es real',
  i626: 'Una bolsa de leche. Se rompe antes de que la abras, como siempre.', i627: 'Una torta frita. Llueve afuera: ya se sabe que es obligatoria.',
  i628: 'Una chancleta suelta. La otra nunca aparece. No es una pista.', i629: 'Un paraguas roto por el viento de la rambla. Ni él aguantó.',
};
