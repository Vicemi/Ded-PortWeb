// Time grace: when the time of the case runs out but the player is very advanced, the game gives ONE more night (8 turns) before declaring the case lost.
// Once per case; saved with the case (serialization.ts, line "grace"; the extended limit travels in "timelimit", old saves have no flag).
import { Layer, ItemImage, ItemText, ItemEvent } from '../../runtime/prelude';
import * as assets from '../../engine/assets';
import * as animations from '../../engine/animations';

/** a night and its day: 8 turns (the clock shows 8 hours per day, see Case.actual_days) */
export const GRACE_TURNS = 8;

/**
 * "very advanced": the arrest order is issued or the thief is caught, or the trail has reached the last or the second to last department of the chain
 * (the department where the thief's trail leads, case.last_department_lair, is one of the last two; never counts the first department of the chain).
 */
export function veryAdvanced(c: any): boolean {
  if (c.arrest_order_thief != null || c.caught_thief) return true;
  const deps = Array.from(c.list_departments ?? []) as any[], i = deps.indexOf(c.last_department_lair);
  return i >= 1 && i >= deps.length - 2;
}

/** the time is up: gives the extra night when the case deserves it (and has not got it before). Returns true when it was given */
export function grant(c: any): boolean {
  if (c.grace_used || !veryAdvanced(c)) return false;
  c.grace_used = true;
  c.time_limit += GRACE_TURNS;
  return true;
}

/** the message of the extra night (the paper of the twist dialog; the close button and the blind of the arrest order warning) */
export function showDialog(stage: any): void {
  const layer = new Layer();
  layer.add(new ItemImage(96, 48, assets.load_image('p0_endings_loose_d1_back.png')));
  layer.add(new ItemText(106, 96, assets.load_font('turkey.ttf', 24), 24, '¡UNA NOCHE MÁS!', [153, 0, 0], null, 390, 30, 2, 1));
  const body = 'Se acabó el tiempo, pero estás tan cerca del ladrón que el jefe te da una noche más para atraparlo. ¡Aprovechala bien: no habrá otra!';
  layer.add(new ItemText(122, 148, assets.load_font('evilgeniusbb_reg.ttf', 13), 20, body.toUpperCase(), [0, 0, 0], null, 356, 130, 1, 1));
  const close = new ItemImage(277, 335, assets.load_image('p0_button_close.png'));
  close.set_rollover_image(assets.load_image('p0_button_close_rollover.png'), stage.rollover_sound);
  close.add_event_handler(ItemEvent.CLICK, () => stage.close_arrest_order_warning_dialog());
  layer.add(close);
  stage.warning_dialog = layer;
  stage.show_dialog(layer, null);
  stage.blind_dialog(layer, animations.BlindDirection.SHOW_DOWN);
  assets.load_sound('p0_warning.ogg').play();
}
