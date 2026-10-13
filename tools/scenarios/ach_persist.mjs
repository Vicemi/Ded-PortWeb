// solves a case, then checks that the achievements of the end screen are in the progress AND in the saved character
import { toHub } from './lib.mjs';
export default async (dev) => {
  toHub(dev);
  dev.game.set_development_mode(true);
  dev.key('a'.charCodeAt(0), 100, 'A', 1);
  dev.go(300);
  for (let i = 0; i < 14; i++) { dev.click(303, 326, 150); dev.go(250); }
  const ds = dev.game.datastore;
  const names = (p) => p.medals.map((m) => m.name + 'x' + m.count).join(',');
  console.log('stage', dev.stage(), 'in memory:', names(ds.user_character_progress));
  ds.save_character && ds.save_character('nc', true);
  const info = ds.user_character.charinfo ?? ds.user_character;
  ds.load_characters();
  const c = (ds.characters || []).find((x) => x.name === info.name) || (ds.characters || [])[0];
  ds.load_character(c);
  console.log('after reload:', names(ds.user_character_progress));
};
