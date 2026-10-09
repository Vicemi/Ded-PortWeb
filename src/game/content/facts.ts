// Updated facts of the game: current data of Uruguay for the notes of the detective, new museums and objects for the cases.
// Called by Datastore.set_up_data through content/extend.ts (hooks added by research/content_web.py).
import * as datamodel from '../data/datamodel';

// Indexes of ds.list_departments: 0 Artigas, 1 Canelones, 2 Cerro Largo, 3 Colonia, 4 Durazno, 5 Flores, 6 Florida, 7 Lavalleja, 8 Maldonado, 9 Montevideo,
// 10 Paysandú, 11 Río Negro, 12 Rivera, 13 Rocha, 14 Salto, 15 San José, 16 Soriano, 17 Tacuarembó, 18 Treinta y Tres.
const D = { ARTIGAS: 0, CANELONES: 1, CERRO_LARGO: 2, COLONIA: 3, DURAZNO: 4, FLORES: 5, FLORIDA: 6, LAVALLEJA: 7, MALDONADO: 8, MONTEVIDEO: 9, PAYSANDU: 10, RIO_NEGRO: 11, RIVERA: 12, ROCHA: 13, SALTO: 14, SAN_JOSE: 15, SORIANO: 16, TACUAREMBO: 17, TREINTA_Y_TRES: 18 };

/** [sentence start, article, name, departments, date, text, second text] */
const HISTORY: [string, string, string, number[], string, string, string | null][] = [
  ['se fundó', 'la', 'ciudad de Colonia del Sacramento', [D.COLONIA], '22 de enero de 1680', 'Fue fundada por el portugués Manuel Lobo, frente a Buenos Aires, al otro lado del Río de la Plata.', 'Su Barrio Histórico es Patrimonio de la Humanidad desde 1995.'],
  ['se fundó', 'la', 'ciudad de Montevideo', [D.MONTEVIDEO], '24 de diciembre de 1726', 'Fue fundada por Bruno Mauricio de Zabala con el nombre de San Felipe y Santiago de Montevideo.', 'En 2026 cumple 300 años.'],
  ['se inauguró', 'el', 'Estadio Centenario', [D.MONTEVIDEO], '18 de julio de 1930', 'Se construyó para el primer Campeonato Mundial de Fútbol y para recordar los cien años de la primera Constitución.', 'En 1983 la FIFA lo declaró Monumento Histórico del Fútbol Mundial.'],
  ['tuvo lugar', 'la', 'final del primer Mundial de Fútbol', [D.MONTEVIDEO], '30 de julio de 1930', 'Uruguay le ganó 4 a 2 a Argentina y fue el primer campeón del mundo.', null],
  ['se inauguró', 'el', 'Palacio Legislativo', [D.MONTEVIDEO], '25 de agosto de 1925', 'Es la sede del Parlamento: el Senado y la Cámara de Representantes.', null],
  ['se inauguró', 'el', 'Teatro Solís', [D.MONTEVIDEO], '25 de agosto de 1856', 'Es uno de los teatros más antiguos del país y su sala principal sigue recibiendo conciertos y obras.', null],
  ['se fundó', 'la', 'Universidad de la República', [D.MONTEVIDEO], '18 de julio de 1849', 'Es la universidad pública más importante de Uruguay y es gratuita.', null],
  ['tuvo lugar', 'el', 'primer voto femenino de Uruguay', [D.TREINTA_Y_TRES], '3 de julio de 1927', 'En Cerro Chato las mujeres votaron por primera vez, en un plebiscito local.', 'En 1932 se aprobó el voto femenino para todo el país.'],
  ['se creó', 'el', 'Plan Ceibal', [D.FLORIDA], '2007', 'Nació para que cada niño de la escuela pública tuviera su computadora XO, la misma de este juego.', 'Las primeras computadoras se entregaron en Villa Cardal, departamento de Florida.'],
  ['se declaró', 'el', 'Candombe Patrimonio Cultural Inmaterial de la Humanidad', [D.MONTEVIDEO], '2009', 'La UNESCO reconoció este ritmo de tambores, nacido en los barrios Sur y Palermo de Montevideo.', 'Se toca con tres tambores: chico, repique y piano.'],
  ['se declaró', 'el', 'Paisaje Industrial Fray Bentos Patrimonio de la Humanidad', [D.RIO_NEGRO], '2015', 'Es el antiguo frigorífico Anglo, que exportó el extracto de carne Liebig a todo el mundo.', null],
  ['se declaró', 'la', 'Iglesia de Atlántida, obra de Eladio Dieste, Patrimonio de la Humanidad', [D.CANELONES], '2021', 'Es una iglesia de ladrillo del ingeniero Eladio Dieste, famosa por sus muros ondulados.', null],
  ['se creó', 'la', 'Reserva de Biosfera Bañados del Este', [D.ROCHA, D.TREINTA_Y_TRES], '1976', 'La UNESCO protege este humedal de lagunas y bañados donde viven aves migratorias y carpinchos.', null],
  ['se inauguró', 'la', 'represa de Salto Grande', [D.SALTO], '1979', 'Se construyó sobre el río Uruguay entre Uruguay y Argentina y produce energía para los dos países.', null],
];

/** [name, sex, department, dates, description] */
const WRITERS: [string, string, number, string, string][] = [
  ['Idea Vilariño', 'F', D.MONTEVIDEO, '(1920 - 2009)', 'Poeta, ensayista y crítica nacida en Montevideo. Sus versos sobre el amor y la soledad se siguen leyendo y cantando.'],
  ['Ida Vitale', 'F', D.MONTEVIDEO, '(1923 - 2023)', 'Poeta nacida en Montevideo. Recibió el Premio Cervantes en 2018.'],
  ['Cristina Peri Rossi', 'F', D.MONTEVIDEO, '(1941)', 'Escritora nacida en Montevideo. Recibió el Premio Cervantes en 2021.'],
  ['Felisberto Hernández', 'M', D.MONTEVIDEO, '(1902 - 1964)', 'Narrador y pianista nacido en Montevideo, famoso por sus cuentos extraños y poéticos.'],
  ['Mario Levrero', 'M', D.MONTEVIDEO, '(1940 - 2004)', 'Escritor y humorista nacido en Montevideo, autor de novelas fantásticas y muy originales.'],
  ['Teresa Porzecanski', 'F', D.MONTEVIDEO, '(1945)', 'Novelista y antropóloga nacida en Montevideo.'],
  ['Alfredo Zitarrosa', 'M', D.MONTEVIDEO, '(1936 - 1989)', 'Cantautor y poeta nacido en Montevideo, una de las grandes voces de la música popular uruguaya.'],
  ['Daniel Viglietti', 'M', D.MONTEVIDEO, '(1939 - 2017)', 'Cantautor y guitarrista nacido en Montevideo.'],
  ['Jorge Drexler', 'M', D.MONTEVIDEO, '(1964)', 'Cantautor nacido en Montevideo. En 2005 ganó el Oscar a la mejor canción original.'],
  ['Marosa di Giorgio', 'F', D.SALTO, '(1932 - 2004)', 'Poeta nacida en Salto, conocida por su mundo de flores, animales y fantasías.'],
  ['Armonía Somers', 'F', D.CANELONES, '(1914 - 1994)', 'Narradora nacida en Pando, departamento de Canelones.'],
  ['Circe Maia', 'F', D.TACUAREMBO, '(1932 - 2023)', 'Poeta nacida en Tacuarembó.'],
];

/** museums: [article, name, department, type of objects] */
const MUSEUMS: [string, string, number, string][] = [
  ['el', 'Museo del Fútbol', D.MONTEVIDEO, 'Fútbol'], ['el', 'Museo del Carnaval', D.MONTEVIDEO, 'Carnaval'], ['el', 'Museo Nacional de Historia Natural', D.MONTEVIDEO, 'Naturaleza'],
  ['el', 'Museo del Mar', D.MALDONADO, 'Naturaleza'], ['el', 'Museo de la Revolución Industrial', D.RIO_NEGRO, 'Industria'],
  ['el', 'Museo Gurvich', D.MONTEVIDEO, 'Arte'], ['el', 'Museo Ralli', D.MALDONADO, 'Arte'],
];
/** what is stolen: [what it is (with article), the short name (with article), type] */
const OBJECTS: [string, string, string][] = [
  ['una camiseta celeste de la selección campeona', 'la camiseta', 'Fútbol'], ['una pelota antigua de un Mundial', 'la pelota', 'Fútbol'], ['unos botines históricos de un campeón', 'los botines', 'Fútbol'],
  ['un bombo de murga', 'el bombo', 'Carnaval'], ['un par de platillos de murga', 'los platillos', 'Carnaval'], ['un tambor chico de candombe', 'el tambor', 'Carnaval'], ['un estandarte de comparsa', 'el estandarte', 'Carnaval'],
  ['un esqueleto de ballena franca', 'el esqueleto', 'Naturaleza'], ['una colección de mariposas', 'la colección', 'Naturaleza'], ['un huevo de ñandú', 'el huevo', 'Naturaleza'],
  ['una lata antigua de extracto de carne', 'la lata', 'Industria'], ['una máquina de vapor en miniatura', 'la máquina', 'Industria'],
];

/** adds the museums and the objects to the case generator */
export function extendCases(ds: any): void {
  for (const [prep, name, dep, type] of MUSEUMS) ds.list_crime_locations.push(new datamodel.CrimeLocation(prep, name, ds.list_departments[dep], type, null));
  for (const [d1, d2, type] of OBJECTS) ds.list_stolen_objects.push(new datamodel.StolenObject('de', d1, d2, type));
}

/** adds facts and writers to the notes of the detective (called before the notes are indexed by department) and fixes data that is out of date */
export function extendNotes(ds: any): void {
  for (const [start, art, name, deps, date, d1, d2] of HISTORY) ds.list_history_facts.push(new datamodel.HistoryFactNote(start, art, name, deps.map((i) => ds.list_departments[i]), date, d1, d2));
  for (const [name, sex, dep, dates, desc] of WRITERS) ds.list_writers.push(new datamodel.WriterNote(name, sex, ds.list_departments[dep], dates, desc));
  // the rumors of the thieves that have them become opening statements of the witnesses (they are registered in the list of statements: saved cases refer to them by index)
  for (const t of ds.list_thieves) {
    if (!t.rumors) continue;
    const base: string = ds.list_statements[t.sex === 1 ? 1 : 2].text;
    t.rumor_statements = t.rumors.map((r: string) => { const st = new datamodel.Statement(base + '\n' + r); ds.list_statements.push(st); return st; });
  }
  const galeano = ds.list_writers.find((w: any) => w.name === 'Eduardo Galeano');
  if (galeano) galeano.dates = '(1940 - 2015)';
}
