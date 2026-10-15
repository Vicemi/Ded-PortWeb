// "Incriminado": in some cases the person that the player arrests turns out to have been framed (or to have been with the real culprit), and the real culprit is
// another one of the suspects of the list. When the arrested thief is caught the game stops, shows the lab report and the player has to pick the real culprit again,
// going back over the clues. Objects of the rooms (see lupa_clues.ts) can carry the name of another suspect: in a twist case it is the real culprit, otherwise a red herring.
// Saved with the case (serialization.ts, line "twist"). case.twist_state: 0 none, 1 pending, 2 solved, 3 failed.
import { Layer, ItemImage, ItemText, ItemEvent } from '../../runtime/prelude';
import * as assets from '../../engine/assets';
import { random } from '../../runtime/py';
import { grantAchievements } from './achievements';

export const TWIST_CHANCE = 0.22;
export const PENDING = 1, SOLVED = 2, FAILED = 3;

/** called when a case is generated: sometimes makes it a twist case (never in the first cases, which teach the game) */
export function roll(case_: any, ds: any): any {
  case_.twist_state = 0; case_.twist_real = null; case_.twist_hint = false;
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
  if (case_.twist_state === PENDING) case_.twist_hint = true;
  return f(who.name);
}

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
  const label = new ItemText(106, 352, end.font_14_bold, 14, '', [102, 0, 0], null, 390, 20, 2, 1);
  layer.add(label);
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
