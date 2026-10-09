// Content of the updated edition that is added to the original data of the game (see MODLOG.md): new thieves with their pets and sports.
// Called once by Datastore.set_up_data (a hook added by research/content_web.py). A thief is only added when his four pictures are in the image
// packs, so the roster grows as the art is delivered (tools/make_mugshot.py builds the pictures, tools/art_brief/new_thieves.json has the briefs).
import * as datamodel from '../data/datamodel';
import { has_image } from '../../engine/assets';

// the codes of the original datastore.py
const MALE = 1, FEMALE = 2, TALL = 1, SHORT = 2, BRUNETTE = 1, BLONDE = 2, REDHEAD = 3, GREY_HAIRED = 4, SCAR = 1, TATOO = 2, GLASSES = 3, MOLE = 4;
const MAMMAL = 1, BIRD = 2, REPTILE = 3, HERBIVORE = 1, CARNIVORE = 2, WALK = 1, FLY = 2, SWIM = 3, AQUATIC = 1, TERRESTRIAL = 2;

/** pets of Uruguay (name, class, diet, movement) */
const ANIMALS: [string, number, number, number][] = [
  ['carpincho', MAMMAL, HERBIVORE, SWIM], ['hornero', BIRD, CARNIVORE, FLY], ['tero', BIRD, CARNIVORE, WALK], ['mulita', MAMMAL, CARNIVORE, WALK],
  ['zorro de monte', MAMMAL, CARNIVORE, WALK], ['lobo marino', MAMMAL, CARNIVORE, SWIM], ['tortuga de laguna', REPTILE, HERBIVORE, SWIM],
  ['ñandú', BIRD, HERBIVORE, WALK], ['ballena franca', MAMMAL, CARNIVORE, SWIM], ['benteveo', BIRD, CARNIVORE, FLY],
];
/** sports (name, category, team, ball) */
const SPORTS: [string, number, boolean, boolean][] = [
  ['rugby', TERRESTRIAL, true, true], ['básquetbol', TERRESTRIAL, true, true], ['baby fútbol', TERRESTRIAL, true, true], ['ciclismo', TERRESTRIAL, false, false],
  ['maratón', TERRESTRIAL, false, false], ['ajedrez', TERRESTRIAL, false, false], ['remo', AQUATIC, true, false], ['pesca', AQUATIC, false, false],
  ['equitación', TERRESTRIAL, false, false],
];

interface NewThief { id: string; sex: number; height: number; hair: number; feature: number; pet: string; sport: string; name: string; nick: string; age: string; desc: string }
const THIEVES: NewThief[] = [
  { id: 'mateo', sex: MALE, height: TALL, hair: BRUNETTE, feature: GLASSES, pet: 'carpincho', sport: 'rugby', name: 'Mateo Cebadura', nick: '"El Cebador"', age: '44 años',
    desc: 'Nunca sale sin su termo bajo el brazo y jura que el mate es el mejor testigo: escucha todo y no dice nada.\nSe dedicaba a vender yerba en las ferias, hasta que descubrió que robarla salía más barato.\nLe gustan los objetos que "se pasan de mano en mano".' },
  { id: 'rita', sex: FEMALE, height: TALL, hair: REDHEAD, feature: TATOO, pet: 'hornero', sport: 'básquetbol', name: 'Rita Platillo', nick: '"La Murguista"', age: '37 años',
    desc: 'Cantó diez carnavales en una murga y una noche se llevó, además de los aplausos, la recaudación del teatro.\nSe tatuó un platillo en el brazo y dice que cada robo "suena redondo".\nSu especialidad: desaparecer entre el público cuando termina el espectáculo.' },
  { id: 'gambeta', sex: MALE, height: SHORT, hair: BLONDE, feature: MOLE, pet: 'tero', sport: 'baby fútbol', name: 'Gambeta Garra', nick: '"El Diez"', age: '29 años',
    desc: 'Delantero de potrero, rápido para gambetear a los defensas y todavía más rápido para gambetear a la policía.\nDicen que su lunar tiene la forma de una pelota; él asegura que es de nacimiento.\nSiempre juega con la camiseta celeste puesta debajo de la ropa.' },
  { id: 'dulcinea', sex: FEMALE, height: SHORT, hair: BRUNETTE, feature: SCAR, pet: 'mulita', sport: 'ciclismo', name: 'Dulcinea Alfajor', nick: '"La Golosa"', age: '52 años',
    desc: 'Pastelera de oficio y ladrona por antojo: sus robos siempre empiezan donde hay algo dulce.\nLa cicatriz de la mejilla se la hizo con una tapa de lata de dulce de leche.\nDeja migas de alfajor en la escena del crimen, y nadie sabe si lo hace a propósito.' },
  { id: 'tannat', sex: FEMALE, height: TALL, hair: GREY_HAIRED, feature: SCAR, pet: 'zorro de monte', sport: 'golf', name: 'Doña Tannat', nick: '"La Sommelier"', age: '63 años',
    desc: 'Heredó una bodega de Canelones y la perdió en una sola cosecha; desde entonces cobra "impuestos" en botellas.\nHuele un tannat a cien metros y un descuido del guardia a doscientos.\nSe retira de cada robo con una reverencia y una copa vacía.' },
  { id: 'rambla', sex: MALE, height: TALL, hair: REDHEAD, feature: MOLE, pet: 'lobo marino', sport: 'maratón', name: 'Rambla Ramírez', nick: '"El Trotador"', age: '34 años',
    desc: 'Corre cada mañana por la rambla de punta a punta, y cada tanto se "olvida" de devolver lo que levanta en el camino.\nSu mejor coartada es una cinta en la cabeza y una remera de maratón.\nNunca lo atraparon corriendo, así que ahora hay que atraparlo parado.' },
  { id: 'byte', sex: FEMALE, height: SHORT, hair: BLONDE, feature: TATOO, pet: 'tortuga de laguna', sport: 'ajedrez', name: 'Byte Ceibal', nick: '"La Hacker"', age: '29 años',
    desc: 'Aprendió a programar a los diez años en una laptop verde y blanca que le entregaron en la escuela, y nunca la soltó.\nLleva tatuado un código binario en el cuello que, según ella, es la clave de su próxima jugada.\nPrefiere abrir cerraduras digitales; las comunes la aburren.' },
  { id: 'tato', sex: MALE, height: SHORT, hair: BRUNETTE, feature: MOLE, pet: 'ñandú', sport: 'remo', name: 'Tato Repique', nick: '"El Tamborilero"', age: '41 años',
    desc: 'Desfiló en las Llamadas desde chico y se sabe todos los toques de memoria; los usa para avisar a su banda cuando hay vía libre.\nSu coartada favorita es "estaba ensayando", y nadie ha querido comprobar cuánto ensaya.\nLleva siempre unas baquetas en el bolsillo.' },
  { id: 'telmo', sex: MALE, height: SHORT, hair: BLONDE, feature: GLASSES, pet: 'ballena franca', sport: 'pesca', name: 'Telmo Telescopio', nick: '"El Astrónomo"', age: '58 años',
    desc: 'Pasa las noches mirando estrellas desde el techo de los edificios y los días mirando vidrieras.\nSus lentes tienen tantos aumentos que jura ver el botín desde otro departamento.\nSolo roba cuando hay luna nueva, para que nadie lo vea.' },
  { id: 'flor', sex: FEMALE, height: TALL, hair: BLONDE, feature: SCAR, pet: 'benteveo', sport: 'equitación', name: 'Flor de Ceibo', nick: '"La Florista"', age: '46 años',
    desc: 'Vende flores de ceibo en la esquina y, mientras sonríe, memoriza por dónde se entra a cada edificio.\nSu cicatriz se la hizo con las espinas del arbusto más famoso del país y dice que fue el único robo que le salió mal.\nSiempre deja un pétalo rojo como firma.' },
];

/** adds the new pets, sports and thieves to the lists of the datastore (the thieves whose pictures exist) */
export function extend(ds: any): void {
  const animals = new Map<string, any>(), sports = new Map<string, any>();
  for (const [n, c, d, m] of ANIMALS) { const a = new datamodel.Animal(n, c, d, m); animals.set(n, a); ds.list_animals.push(a); }
  for (const [n, c, t, b] of SPORTS) { const s = new datamodel.Sport(n, c, t, b); sports.set(n, s); ds.list_sports.push(s); }
  for (const t of THIEVES) {
    const small = `p0_thief_small_${t.id}.png`, big = (k: number) => `p0_thief_big_${t.id}_${k}.jpg`;
    if (!has_image(small) || !has_image(big(1)) || !has_image(big(2)) || !has_image(big(3))) continue;
    ds.list_thieves.push(new datamodel.Thief(t.sex, t.height, t.hair, t.feature, animals.get(t.pet), sports.get(t.sport), t.name, t.nick, t.age, t.desc, small, big(1), big(2), big(3)));
  }
}
