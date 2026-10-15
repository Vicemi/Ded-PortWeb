// Special medals ("Logros") of the updated edition. They are saved as medals named 'ach_<id>' in the medals list of the character progress (the save format
// already stores any medal name + count), so they travel with the save file. The department medals screen is full, so they have their own panel (a button
// "LOGROS" in the medals screen opens it). Granted when a case is solved (endgame.add_medal hook) and when the panel is opened (so old saves get them too).
import { Layer, ItemImage, ItemText, ItemRect, ItemEvent, pygame } from '../../runtime/prelude';
import * as assets from '../../engine/assets';
import * as animations from '../../engine/animations';

interface Progress { score: number; resolved_cases: number; medals: { name: string; count: number }[]; captured_thieves: { name: string }[]; list_departments_solved: any[] }
interface Ach { id: string; title: string; desc: string; glyph: string; tier: 0 | 1 | 2 | 3; check: (p: Progress, total: number) => boolean; /** the medals of the clue objects: given when a case is solved, from the clues that the player found in it */ solved?: (c: any) => boolean }
/** the ids of the clues found in a case */
const foundIds = (c: any): string[] => Array.from(c?.clues_found ?? []);
const withObject = (...ids: string[]) => (c: any) => foundIds(c).some((i) => ids.includes(i));
const never = () => false;

const caught = (p: Progress, name: string) => p.captured_thieves.some((t) => t.name === name);
const depCount = (p: Progress, n: number) => p.medals.filter((m) => !m.name.startsWith('ach_') && m.name !== 'uy' && m.name !== 'tut' && m.count > 0).length >= n;
const medalCount = (p: Progress, name: string) => (p.medals.find((m) => m.name === name) || { count: 0 }).count;

// tier: 0 bronze, 1 silver, 2 gold, 3 special (red)
export const ACHIEVEMENTS: Ach[] = [
  { id: 'primer_caso', title: 'Primer Expediente', desc: 'Resolviste tu primer caso. ¡Bienvenido a la División!', glyph: '1', tier: 0, check: (p) => p.resolved_cases >= 1 },
  { id: 'barrio', title: 'Detective de Barrio', desc: 'Resolviste 5 casos. Ya te saludan en la esquina.', glyph: '5', tier: 0, check: (p) => p.resolved_cases >= 5 },
  { id: 'seccional', title: 'Comisario de Seccional', desc: 'Resolviste 10 casos. Mate y bizcochos para todos.', glyph: '10', tier: 1, check: (p) => p.resolved_cases >= 10 },
  { id: 'inspector', title: 'Inspector General', desc: 'Resolviste 25 casos.', glyph: '25', tier: 2, check: (p) => p.resolved_cases >= 25 },
  { id: 'leyenda', title: 'Leyenda de la DED', desc: 'Resolviste 50 casos. Ya sos parte de la historia.', glyph: '50', tier: 3, check: (p) => p.resolved_cases >= 50 },
  { id: 'viajero', title: 'Rumbo al Interior', desc: 'Tenés medallas de 5 departamentos distintos.', glyph: '5D', tier: 0, check: (p) => depCount(p, 5) },
  { id: 'recorrido', title: 'Ruta 5 y Ruta 8', desc: 'Tenés medallas de 10 departamentos distintos.', glyph: '10D', tier: 1, check: (p) => depCount(p, 10) },
  { id: 'diecinueve', title: 'Los 19 Departamentos', desc: 'Resolviste un caso en cada departamento de Uruguay.', glyph: '19', tier: 3, check: (p) => depCount(p, 19) },
  { id: 'repetido', title: 'Hincha de Departamento', desc: 'Tenés 3 medallas del mismo departamento.', glyph: '3x', tier: 1, check: (p) => p.medals.some((m) => !m.name.startsWith('ach_') && m.name !== 'tut' && m.name !== 'uy' && m.count >= 3) },
  { id: 'uruguay', title: 'Medalla Uruguay', desc: 'Conseguiste la medalla de Uruguay: ¡todos los departamentos!', glyph: 'UY', tier: 3, check: (p) => medalCount(p, 'uy') >= 1 },
  { id: 'cinco_presos', title: 'Cinco Tras las Rejas', desc: 'Capturaste a 5 ladrones distintos.', glyph: '5', tier: 0, check: (p) => p.captured_thieves.length >= 5 },
  { id: 'diez_presos', title: 'Calabozo Lleno', desc: 'Capturaste a 10 ladrones distintos.', glyph: '10', tier: 1, check: (p) => p.captured_thieves.length >= 10 },
  { id: 'todos_presos', title: 'Colección Completa', desc: 'Capturaste a todos los ladrones de la lista.', glyph: '★', tier: 3, check: (p, total) => p.captured_thieves.length >= total },
  { id: 'victor', title: 'Operativo Tusi', desc: 'Atrapaste a Víctor Pintos, el conserje que vendía "tusi". No era azúcar.', glyph: 'T', tier: 2, check: (p) => caught(p, 'Víctor Pintos') },
  { id: 'aaron', title: 'Control + Alt + Supr', desc: 'Atrapaste a Aaron Silva, alias Elliot: encapuchado, café frío y polvo blanco en los ventiladores.', glyph: '>_', tier: 2, check: (p) => caught(p, 'Aaron Silva') },
  { id: 'fausto', title: 'Carne de Sospecha', desc: 'Atrapaste a Fausto Filete. Ya nadie compra en esa carnicería.', glyph: 'F', tier: 2, check: (p) => caught(p, 'Fausto Filete') },
  { id: 'vera', title: 'Doctora del Corral', desc: 'Atrapaste a Vera Pezuña, la veterinaria que cuidaba algo más que animales.', glyph: 'V', tier: 1, check: (p) => caught(p, 'Vera Pezuña') },
  { id: 'nana', title: 'Cuentos de la Noche', desc: 'Atrapaste a Nana Nochera, la niñera que nunca dormía.', glyph: 'N', tier: 1, check: (p) => caught(p, 'Nana Nochera') },
  { id: 'rita', title: 'Se Acabó el Carnaval', desc: 'Atrapaste a Rita Platillo, "La Murguista".', glyph: 'R', tier: 1, check: (p) => caught(p, 'Rita Platillo') },
  { id: 'byte', title: 'Conexión Perdida', desc: 'Atrapaste a Byte Ceibal, el que hackeaba las XO.', glyph: 'B', tier: 1, check: (p) => caught(p, 'Byte Ceibal') },
  { id: 'puntos_5k', title: 'Chivito al Plato', desc: 'Llegaste a 5.000 puntos.', glyph: '5K', tier: 0, check: (p) => p.score >= 5000 },
  { id: 'puntos_20k', title: 'Campeón del Centenario', desc: 'Llegaste a 20.000 puntos.', glyph: '20K', tier: 2, check: (p) => p.score >= 20000 },
  // the clue objects of the updated edition (a case solved with one of them among the clues found)
  { id: 'mate', title: 'Cebador de Pistas', desc: 'Resolviste un caso con el mate o el termo entre tus pistas.', glyph: 'M', tier: 0, check: never, solved: withObject('i600', 'i601') },
  { id: 'xo', title: 'Contraseña Olvidada', desc: 'Resolviste un caso con la XO entre tus pistas: el fondo de pantalla lo dijo todo.', glyph: 'XO', tier: 1, check: never, solved: withObject('i623') },
  { id: 'musica', title: 'Guitarra y Tambor', desc: 'Resolviste un caso con la guitarra o el tambor de candombe entre tus pistas.', glyph: 'G', tier: 0, check: never, solved: withObject('i603', 'i604') },
  { id: 'gaucho', title: 'Rastro Gaucho', desc: 'Resolviste un caso con el poncho, el lazo, el cuchillo o la boina entre tus pistas.', glyph: 'P', tier: 1, check: never, solved: withObject('i608', 'i609', 'i610', 'i611') },
  { id: 'paladar', title: 'Paladar Oriental', desc: 'Resolviste un caso con el alfajor, el chivito, el dulce de leche o el tannat entre tus pistas.', glyph: 'A', tier: 1, check: never, solved: withObject('i605', 'i606', 'i607', 'i612') },
  { id: 'ojo', title: 'Ojo de Lince', desc: 'Resolviste un caso con la cámara, el telescopio, la lupa vieja o el llavero entre tus pistas.', glyph: 'O', tier: 1, check: never, solved: withObject('i614', 'i615', 'i617', 'i618') },
  { id: 'retro', title: 'Tecnología de Época', desc: 'Resolviste un caso con la radio, el reloj o el celular entre tus pistas.', glyph: 'R', tier: 1, check: never, solved: withObject('i619', 'i620', 'i621') },
  { id: 'rarezas', title: 'Coleccionista de Rarezas', desc: 'Resolviste un caso donde las 3 pistas eran objetos nuevos.', glyph: '3', tier: 2, check: never, solved: (c) => foundIds(c).filter((i) => /^i6\d\d$/.test(i)).length >= 3 },
  // the twist cases (content/twist.ts): the arrested thief was framed
  { id: 'incriminado', title: 'Incriminado', desc: 'Detuviste a alguien que resultó incriminado: el verdadero culpable seguía suelto.', glyph: '?', tier: 0, check: never, solved: (c) => c.twist_state >= 2 },
  { id: 'falso_criminal', title: 'Falso Criminal', desc: 'Desenmascaraste al incriminado y atrapaste al verdadero culpable.', glyph: 'FC', tier: 1, check: never, solved: (c) => c.twist_state === 2 },
  { id: 'ojo_clinico', title: 'Ojo Clínico', desc: 'Leíste el nombre del verdadero culpable en un objeto y lo atrapaste.', glyph: 'OC', tier: 2, check: never, solved: (c) => c.twist_state === 2 && !!c.twist_hint },
  { id: 'tres_trampas', title: 'Nadie te Engaña', desc: 'Resolviste tres casos en los que habían incriminado a un inocente.', glyph: '3x', tier: 3, check: (p) => medalCount(p, 'ach_falso_criminal') >= 3 },
];

const TIERS = [
  { rim: '#8a4f1d', fill: '#cf8a45', hi: '#f0b878', ribbon: ['#ffffff', '#4aa3e0'] },     // bronze (white + celeste, like the flag)
  { rim: '#6c7480', fill: '#c4cad4', hi: '#f4f7fb', ribbon: ['#ffffff', '#4aa3e0'] },     // silver
  { rim: '#a67a00', fill: '#ffcf33', hi: '#fff0a6', ribbon: ['#ffffff', '#4aa3e0'] },     // gold
  { rim: '#6e0f10', fill: '#e23a2e', hi: '#ff9d8f', ribbon: ['#ffd23f', '#1d63c9'] },     // special
];

const iconCache = new Map<string, any>();
/** the picture of the medal (ach_<id>.png, drawn in the style of the original medals) or, if it is missing, a plain one drawn here; locked = dark silhouette with a ? */
function icon(a: Ach, got: boolean): any {
  const key = a.id + (got ? '+' : '-');
  const hit = iconCache.get(key);
  if (hit) return hit;
  const made = assets.has_image('ach_' + a.id + '.png') ? pictureIcon(a, got) : drawnIcon(a, got);
  iconCache.set(key, made);
  return made;
}

function pictureIcon(a: Ach, got: boolean): any {
  const src = assets.load_image('ach_' + a.id + '.png').surface.canvas;
  const s = new pygame.Surface([src.width, src.height], pygame.SRCALPHA, 32), c = s.ctx;
  c.drawImage(src, 0, 0);
  if (!got) {
    c.globalCompositeOperation = 'source-atop';
    c.fillStyle = 'rgba(48,6,6,0.82)'; c.fillRect(0, 0, src.width, src.height);
    c.globalCompositeOperation = 'source-over';
    c.fillStyle = '#c9b0a0'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = 'bold 22px sans-serif';
    c.fillText('?', src.width / 2, src.height * 0.62);
  }
  return new assets.Image(s);
}

function drawnIcon(a: Ach, got: boolean): any {
  const W = 56, H = 62, s = new pygame.Surface([W, H], pygame.SRCALPHA, 32), c = s.ctx, t = TIERS[a.tier];
  if (!got) c.globalAlpha = 0.9;
  // ribbon
  c.fillStyle = got ? t.ribbon[0] : '#5a1a1a'; c.beginPath(); c.moveTo(14, 0); c.lineTo(28, 0); c.lineTo(28, 30); c.lineTo(8, 30); c.closePath(); c.fill();
  c.fillStyle = got ? t.ribbon[1] : '#481414'; c.beginPath(); c.moveTo(28, 0); c.lineTo(42, 0); c.lineTo(48, 30); c.lineTo(28, 30); c.closePath(); c.fill();
  c.strokeStyle = '#1a140c'; c.lineWidth = 2; c.strokeRect(14, 0, 28, 1);
  // disc
  c.beginPath(); c.arc(28, 38, 21, 0, Math.PI * 2);
  c.fillStyle = got ? t.fill : '#3a1212'; c.fill();
  c.lineWidth = 4; c.strokeStyle = got ? t.rim : '#240a0a'; c.stroke();
  if (got) { c.beginPath(); c.arc(28, 38, 15, 0.75 * Math.PI, 1.75 * Math.PI); c.lineWidth = 3; c.strokeStyle = t.hi; c.stroke(); }
  c.beginPath(); c.arc(28, 38, 21, 0, Math.PI * 2); c.lineWidth = 1.5; c.strokeStyle = '#1a140c'; c.stroke();
  c.fillStyle = got ? '#2a1a05' : '#6a2a2a'; c.textAlign = 'center'; c.textBaseline = 'middle';
  const g = got ? a.glyph : '?';
  c.font = `bold ${g.length > 2 ? 14 : g.length > 1 ? 17 : 22}px sans-serif`; c.fillText(g, 28, 39);
  return new assets.Image(s);
}

/** gives the new achievements to the character; returns the titles of the new ones */
export function grantAchievements(progress: Progress, ds: any, solvedCase?: any): string[] {
  const total = ds && ds.list_thieves ? ds.list_thieves.length : 999;
  const news: string[] = [];
  for (const a of ACHIEVEMENTS) {
    const key = 'ach_' + a.id;
    if (progress.medals.some((m) => m.name === key)) continue;
    if (a.solved ? (solvedCase && a.solved(solvedCase)) : a.check(progress, total)) { (progress as any).add_medal(key); news.push(a.title); }
  }
  return news;
}

export function countAchievements(progress: Progress): [number, number] {
  return [progress.medals.filter((m) => m.name.startsWith('ach_')).length, ACHIEVEMENTS.length];
}

/** the panel of achievements; `merits` is the Merits dialog (it gives the stage, the sounds and the back button) */
export function achievementsLayer(merits: any): any {
  const ds = merits.stage.game.datastore, progress = ds.user_character_progress;
  grantAchievements(progress, ds);
  const have = new Set<string>(progress.medals.map((m: any) => m.name));
  const layer = new Layer();
  layer.add(new ItemImage(0, 0, assets.load_image('p0_merits_medals_background.jpg')));
  const font_14 = assets.load_font('turkey.ttf', 14), font_18 = assets.load_font('turkey.ttf', 18), font_24 = assets.load_font('turkey.ttf', 24);
  const [n, total] = countAchievements(progress);
  const back = new ItemImage(258, 399, merits.back_standby_image);
  back.set_rollover_image(merits.back_rollover_image, merits.rollover_sound);
  back.add_event_handler(ItemEvent.CLICK, (item: any, args: any) => merits.logros_back_click(item, args));
  layer.add(back);
  const name = merits.add_text_with_shadow(layer, 40, 316, font_18, '', [252, 193, 45], 520, 22, 2, 1, -1, 2);
  const text = merits.add_text_with_shadow(layer, 40, 340, font_14, 'LOGROS ' + n + ' DE ' + total + '. Pasá el mouse o tocá una medalla para ver cómo se consigue.', [255, 240, 220], 520, 48, 2, 1, -1, 2);
  const n30 = ACHIEVEMENTS.length, big = n30 > 24, cols = n30 > 30 ? 12 : big ? 10 : 8, x0 = n30 > 30 ? 18 : big ? 22 : 30, y0 = 84, dx = n30 > 30 ? 47 : big ? 56 : 67, dy = n30 > 30 ? 66 : big ? 80 : 86, k = n30 > 30 ? 0.7 : big ? 0.8 : 1;
  ACHIEVEMENTS.forEach((a, i) => {
    const got = have.has('ach_' + a.id), x = x0 + (i % cols) * dx, y = y0 + Math.floor(i / cols) * dy;
    const pic = k === 1 ? icon(a, got) : scaled(icon(a, got), k);
    const it = new ItemImage(x + Math.round((dx - 4 - pic.get_width()) / 2), y, pic);
    it.add_event_handler(ItemEvent.MOUSE_ENTER, () => {
      merits.stage.render(); merits.rollover_sound.stop(); merits.rollover_sound.play();
      for (const t of name) t.set_text(got ? a.title.toUpperCase() : '??? ' + a.title.toUpperCase());
      for (const t of text) t.set_text(got ? a.desc : 'Bloqueada: ' + a.desc);
    });
    layer.add(it);
  });
  return layer;
}

function scaled(img: any, k: number): any {
  const c = img.surface.canvas, w = Math.round(c.width * k), h = Math.round(c.height * k);
  const s = new pygame.Surface([w, h], pygame.SRCALPHA, 32);
  s.ctx.drawImage(c, 0, 0, w, h);
  return new assets.Image(s);
}

/** the button of the medals screen */
export function logrosButton(merits: any): any {
  const progress = merits.stage.game.datastore.user_character_progress, [n, total] = countAchievements(progress);
  const btn = new ItemRect(30, 392, 190, 34, assets.load_font('turkey.ttf', 18), 18, 'LOGROS  ' + n + ' DE ' + total, [255, 232, 130], [120, 16, 16], [255, 214, 90], 2);
  btn.add_event_handler(ItemEvent.CLICK, (item: any, args: any) => merits.logros_click(item, args));
  return btn;
}

/** the strip of the medals screen: a small picture of every achievement (earned ones in colour, the rest dark) and the button of the panel */
export function logrosItems(merits: any): any[] {
  const progress = merits.stage.game.datastore.user_character_progress;
  const have = new Set<string>(progress.medals.map((m: any) => m.name));
  const items: any[] = [];
  const total = ACHIEVEMENTS.length, size = Math.min(24, Math.floor(570 / total) - 2), gap = 2, x0 = Math.round((600 - (size + gap) * total) / 2);
  ACHIEVEMENTS.forEach((a, i) => {
    const got = have.has('ach_' + a.id);
    const big = icon(a, got).surface.canvas;
    const surf = new pygame.Surface([size, size], pygame.SRCALPHA, 32);
    const r = Math.min(size / big.width, size / big.height), w = big.width * r, h = big.height * r;
    surf.ctx.drawImage(big, (size - w) / 2, (size - h) / 2, w, h);
    const it = new ItemImage(x0 + i * (size + gap), 366, new assets.Image(surf));
    it.add_event_handler(ItemEvent.CLICK, (item: any, args: any) => merits.logros_click(item, args));
    items.push(it);
  });
  items.push(logrosButton(merits));
  return items;
}

/** scene of the score screens: the achievements won in this case */
export function showAchievements(end: any): void {
  const layer = end.score_layer, list: string[] = end.new_achievements;
  const rows = ACHIEVEMENTS.filter((a) => list.includes(a.title)).slice(0, 4);
  const font_24 = assets.load_font('turkey.ttf', 24);
  layer.add(new ItemText(100, 62, font_24, 24, rows.length > 1 ? '¡NUEVOS LOGROS!' : '¡NUEVO LOGRO!', [255, 212, 12], null, 400, 30, 2, 1));
  rows.forEach((a, i) => {
    const y = 108 + i * 70;
    layer.add(new ItemImage(110, y - 4, icon(a, true)));
    layer.add(new ItemText(180, y + 2, end.font_16, 16, a.title.toUpperCase(), [255, 212, 12], null, 330, 20, 1, 1));
    layer.add(new ItemText(180, y + 24, end.font_13_bold, 13, a.desc, [255, 255, 255], null, 330, 44, 1, 1));
  });
  if (list.length > rows.length) layer.add(new ItemText(100, 390, end.font_13_bold, 15, '…y ' + (list.length - rows.length) + ' más en la pantalla de medallas.', [255, 255, 255], null, 400, 18, 2, 1));
}
