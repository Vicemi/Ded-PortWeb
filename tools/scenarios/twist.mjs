// "Incriminado": the arrested thief was framed; the lab report asks for the real culprit (picked right: the case is solved with him, and the medals are given)
import { toHub } from './lib.mjs';
export default async (dev) => {
  toHub(dev);
  dev.game.set_development_mode(true);
  const ds = dev.game.datastore, prog = ds.user_character_progress, c = prog.case;
  const tw = dev.twist;
  // a twist case is made by the generator and survives a save
  c.twist_real = c.list_thieves.find((t) => t !== c.thief); c.twist_state = 1; c.twist_hint = false;
  const framed = c.thief, real = c.twist_real;
  const hint = tw.hintFor('i623', c);
  if (!hint.includes(real.name) || !c.twist_hint) throw new Error('the object does not name the real culprit: ' + hint);
  c.twist_state = 0; c.twist_hint = false;
  if (tw.hintFor('i623', c).includes(real.name) && c.list_thieves.filter((t) => t !== framed).length > 1 && tw.namedSuspect(c) === real) console.log('note: the innocent named is the same one (possible)');
  c.twist_state = 1;
  dev.key('a'.charCodeAt(0), 100, 'A', 1);
  dev.go(300);
  let shown = false;
  for (let i = 0; i < 12 && !shown; i++) {
    dev.click(303, 326, 150); dev.go(250);
    // the report is on screen when the final screen has not started and the case still has the twist pending after the clicks
    dev.save('tw' + i);
    if (dev.game.stage.dialogs && dev.game.stage.dialogs.length > 1 && c.twist_state === 1 && i > 1) shown = true;
  }
  console.log('state before the pick', c.twist_state, dev.stage());
  const cands = c.list_thieves.filter((t) => t !== framed), k = cands.indexOf(real);
  dev.click(116 + (k % 4) * 92 + 35, 204 + Math.floor(k / 4) * 74 + 28, 100);
  dev.go(300);
  dev.save('tw_after');
  console.log('state after the pick', c.twist_state, 'thief is the real one:', c.thief === real);
  if (c.twist_state !== 2 || c.thief !== real) throw new Error('the twist was not solved');
  if (!prog.medals.some((m) => m.name === 'ach_incriminado') || !prog.medals.some((m) => m.name === 'ach_falso_criminal')) throw new Error('twist medals missing');
  // the twist of the case is saved and loaded back
  ds.save_character('p1', false);
  dev.py.forgetMemoryFiles(); ds.load_characters(); ds.load_character(ds.characters.find((x) => x.active) || ds.characters[0]);
  const c2 = ds.user_character_progress.case;
  if (c2.twist_state !== 2 || c2.twist_real.name !== real.name) throw new Error('twist lost in the save: ' + c2.twist_state);
};
