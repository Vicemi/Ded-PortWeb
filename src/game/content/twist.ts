// "Incriminado": in some cases the person that the player arrests turns out to have been framed (or to have been with the real culprit), and the real culprit is
// another one of the suspects of the list. When the arrested thief is caught the game stops, shows the lab report and the player has to pick the real culprit again,
// going back over the clues. Objects of the rooms (see lupa_clues.ts) can carry the name of another suspect: in a twist case it is the real culprit, otherwise a red herring.
// Saved with the case (serialization.ts, line "twist"). case.twist_state: 0 none, 1 pending, 2 solved, 3 failed.
import { Layer, ItemImage, ItemText, ItemEvent, KEYDOWN, K_ESCAPE } from '../../runtime/prelude';
import { K_LEFT, K_RIGHT } from '../../runtime/keys';
import * as assets from '../../engine/assets';
import { random } from '../../runtime/py';
import { grantAchievements } from './achievements';

export const TWIST_CHANCE = 0.22;
export const PENDING = 1, SOLVED = 2, FAILED = 3;

/** called when a case is generated: sometimes makes it a twist case (never in the first cases, which teach the game) */
export function roll(case_: any, ds: any): any {
  case_.twist_state = 0; case_.twist_real = null; case_.twist_hint = false; case_.twist_seen = [];
  const done = ds?.user_character_progress?.resolved_cases ?? 0;
  if (done < 2 || random.random() >= TWIST_CHANCE) return case_;
  const others = Array.from(case_.list_thieves as any[]).filter((t) => t !== case_.thief);
  if (!others.length) return case_;
  // the real culprit must be told apart by his pet (the report names it)
  const unique = others.filter((t) => others.filter((o) => o.animal.name === t.animal.name).length === 1 && t.animal.name !== case_.thief.animal.name);
  const pool = unique.length ? unique : others;
  case_.twist_real = pool[Math.floor(random.random() * pool.length)];
  case_.twist_state = PENDING;
  return case_;
}

/** the suspect that the objects name: the real culprit in a twist case, in the others a fixed innocent one of the list */
export function namedSuspect(case_: any): any {
  if (case_.twist_state === PENDING && case_.twist_real) return case_.twist_real;
  const others = Array.from(case_.list_thieves as any[]).filter((t) => t !== case_.thief);
  if (!others.length) return null;
  let h = 0; for (const c of String(case_.number ?? '')) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return others[h % others.length];
}

const HINTS: Record<string, (n: string) => string> = {
  i601: (n) => `El mate tiene grabado el nombre ${n}.`,
  i602: (n) => `La pelota tiene una firma: ${n}.`,
  i603: (n) => `La guitarra tiene un nombre grabado: ${n}.`,
  i614: (n) => `La cámara tiene una etiqueta con el nombre ${n}.`,
  i616: (n) => `El libro de poemas tiene una dedicatoria para ${n}.`,
  i617: (n) => `El llavero tiene una chapita: ${n}.`,
  i619: (n) => `Dentro de la tapa del reloj se lee: ${n}.`,
  i622: (n) => `La taza tiene escrito el nombre ${n}.`,
  i623: (n) => `La XO tiene un pegotín: "Propiedad de ${n}".`,
};

/** the text of an object that names a suspect, or '' (it also remembers that the player read the real culprit's name) */
export function hintFor(type: string, case_: any): string {
  const f = HINTS[type], who = case_ && namedSuspect(case_);
  if (!f || !who) return '';
  if (case_.twist_state === PENDING) {
    case_.twist_hint = true;
    // the odd objects that the player saw are kept to review them (saved in the "twist" line)
    const seen: any[] = (case_.twist_seen ??= []);
    if (!seen.some((x) => x.id === type)) seen.push({ id: type, name: who.name });
  }
  return f(who.name);
}

/** the text that an odd object seen before said (the name is the one that it had) */
export function seenText(id: string, name: string): string { return HINTS[id] ? HINTS[id](name) : ''; }

/** the case of the end screen has a twist to show */
export function isPending(end: any): boolean {
  const c = end.stage.game.datastore.user_character_progress.case;
  return c.twist_state === PENDING && !!c.twist_real;
}

/** the lab report and the choice of the real culprit; `done` continues with the final screen. Returns false when the case has no twist to show */
export function showTwist(end: any, done: () => void): boolean {
  const case_ = end.stage.game.datastore.user_character_progress.case;
  if (case_.twist_state !== PENDING || !case_.twist_real) return false;
  const real = case_.twist_real, framed = case_.thief;
  const layer = new Layer();
  layer.add(new ItemImage(96, 48, assets.load_image('p0_endings_loose_d1_back.png')));
  const turkey = assets.load_font('turkey.ttf', 24);
  layer.add(new ItemText(106, 88, turkey, 24, '¡INCRIMINADO!', [153, 0, 0], null, 390, 30, 2, 1));
  const body = `Los peritos analizaron las huellas: ${framed.name} no es el culpable, lo incriminaron. Las huellas son de alguien de tu lista que tiene de mascota ${real.animal.name} y practica ${real.sport.name}. Repasá las pistas y elegí al verdadero culpable.`;
  layer.add(new ItemText(122, 122, end.font_13, 13, body.toUpperCase(), [0, 0, 0], null, 356, 78, 1, 1));
  const label = new ItemText(106, 352, end.font_14_bold, 14, '', [102, 0, 0], null, 250, 20, 2, 1);
  layer.add(label);
  const review = button(end, 340, 352, 'REPASAR PISTAS', 156, () => { end.continue_sound.play(); showReview(end, case_, framed); });
  layer.add(review);
  const cands = Array.from(case_.list_thieves as any[]).filter((t) => t !== framed);
  cands.forEach((t, i) => {
    const img = assets.load_image(t.identikit_image);
    const x = 116 + (i % 4) * 92 + Math.round((70 - img.get_width()) / 2), y = 204 + Math.floor(i / 4) * 74;
    const it = new ItemImage(x, y, img, null);
    it.add_event_handler(ItemEvent.MOUSE_ENTER, () => { end.stage.render(); end.rollover_sound.stop(); end.rollover_sound.play(); label.set_text(t.name.toUpperCase()); });
    it.add_event_handler(ItemEvent.CLICK, () => {
      end.continue_sound.play();
      end.stage.close_dialog(layer);
      resolve(end, case_, t === real);
      done();
    });
    layer.add(it);
  });
  end.stage.show_dialog(layer, null);
  return true;
}

/** a text button of the paper dialogs: red letters that light up under the mouse */
function button(end: any, x: number, y: number, text: string, width: number, click: () => void): any {
  const b = new ItemText(x, y, end.font_14_bold, 14, text, [102, 0, 0], null, width, 20, 2, 1);
  b.set_rollover_color([204, 0, 0], end.rollover_sound);
  b.add_event_handler(ItemEvent.CLICK, () => { click(); return true; });
  return b;
}

/** the markup of the statements (&#c144,22,22!, &#f:bold!, &#f!, &#c!) is not needed in plain text */
const plain = (t: any): string => String(t ?? '').replace(/&#[^!&]*!/g, '').replace(/\s*\n\s*/g, ' ').trim();

/** the pages of the review: what the player found out so far, to look for what was missed. Each one is [title, text] */
export function reviewPages(case_: any, framed: any): Array<[string, string]> {
  const pages: Array<[string, string]> = [];
  const clues = Array.from((case_.list_stage_clues ?? []).slice(0, 3) as any[]).filter((c) => (case_.clues_found ?? []).includes(c.clue.id));
  pages.push(['Pistas encontradas', clues.length ? clues.map((c, i) => `${i + 1}. ${plain(c.build_item_message())}`).join('\n\n') : 'Todavía no encontraste ninguna pista con la lupa.']);
  const seen: any[] = case_.twist_seen ?? [];
  pages.push(['Objetos con nombres', seen.length ? seen.map((x) => `- ${seenText(x.id, x.name)}`).join('\n\n') : 'No viste ningún objeto con un nombre escrito. Tal vez valga la pena volver a mirar las habitaciones.']);
  for (const w of case_.list_visited_witnesses ?? []) {
    const st = w.witness_statement;
    if (!st) continue;
    const parts = (st.intro_statement ? [st.intro_statement, st.janitor_statement, st.identikit_statement, st.location_statement] : [st]).filter(Boolean).map((x: any) => `"${plain(x.text)}"`);
    pages.push([`Testigo: ${w.name}`, parts.join('\n\n')]);
  }
  pages.push([`Ficha de ${framed.name}`, `El incriminado. Alias: ${framed.nickname ?? '-'}. Mascota: ${framed.animal?.name ?? '-'}. Deporte: ${framed.sport?.name ?? '-'}.\n\n${plain(framed.description)}\n\nLas huellas no son suyas.`]);
return pages;
}

/** the review panel over the lab report; closing it goes back to the choice */
function showReview(end: any, case_: any, framed: any): void {
  const pages = reviewPages(case_, framed);
  let n = 0;
  const layer = new Layer();
  layer.add(new ItemImage(96, 48, assets.load_image('p0_endings_loose_d1_back.png')));
  const turkey = assets.load_font('turkey.ttf', 24);
  layer.add(new ItemText(106, 82, turkey, 24, 'REPASAR PISTAS', [153, 0, 0], null, 390, 30, 2, 1));
  const sub = new ItemText(122, 118, end.font_14_bold, 14, '', [102, 0, 0], null, 356, 20, 1, 1);
  const body = new ItemText(122, 142, end.font_13, 13, '', [0, 0, 0], null, 356, 190, 1, 1);
  const count = new ItemText(106, 336, end.font_13, 13, '', [102, 0, 0], null, 390, 16, 2, 1);
  layer.add(sub); layer.add(body); layer.add(count);
  const close = (): void => { end.continue_sound.play(); end.stage.close_dialog(layer); end.stage.render(); };
  const show = (): void => {
    sub.set_text(pages[n][0].toUpperCase()); body.set_text(pages[n][1].toUpperCase()); count.set_text(`${n + 1} / ${pages.length}`);
    prev.set_visible(n > 0); next.set_visible(n < pages.length - 1);
    end.stage.render();
  };
  const prev = button(end, 122, 352, '< ANTERIOR', 110, () => { if (n > 0) { n--; show(); } });
  const next = button(end, 390, 352, 'SIGUIENTE >', 110, () => { if (n < pages.length - 1) { n++; show(); } });
  layer.add(prev); layer.add(next); layer.add(button(end, 246, 352, 'VOLVER', 130, close));
  show();
  end.stage.show_dialog(layer, (e: any) => { if (e.type === KEYDOWN && e.key === K_ESCAPE) { close(); return true; } if (e.type === KEYDOWN && e.key === K_LEFT && n > 0) { n--; show(); } if (e.type === KEYDOWN && e.key === K_RIGHT && n < pages.length - 1) { n++; show(); } return null; });
}

/** the player picked: the real culprit becomes the thief of the case (a wrong pick loses it) */
export function resolve(end: any, case_: any, right: boolean): void {
  const progress = end.stage.game.datastore.user_character_progress;
  end.caught_thief = right;
  if (right) {
    // the medal of the third solved twist counts the times of the medal of the first one
    if (progress.medals.some((m: any) => m.name === 'ach_falso_criminal')) progress.add_medal('ach_falso_criminal');
    case_.twist_state = SOLVED;
    case_.thief = case_.twist_real;
    case_.arrest_order_thief = case_.twist_real;
    end.case_solved = true;
  } else {
    case_.twist_state = FAILED;
    case_.caught_thief = false;
  }
  end.twist_news = grantAchievements(progress, end.stage.game.datastore, case_);
}
