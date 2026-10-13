// coming back to the game in the same browser: the saved characters, scores and the open character must load without errors
import { newGame } from './lib.mjs';
export default async (dev) => {
  newGame(dev);
  const ds = dev.game.datastore;
  ds.save_character && ds.save_character(dev.game.stage, false);
  try { ds.add_score('total', ds.user_character, 123); ds.save_highscores(); } catch (e) { console.log('score:', e.message); }
  ds.load_characters();
  ds.load_highscores();
  const chars = ds.characters ?? ds.list_characters;
  console.log('characters after reload:', JSON.stringify(Object.keys(ds).filter((k) => /char|score/i.test(k))));
  const info = ds.get_active_character ? ds.get_active_character() : null;
  console.log('active', info && info.name);
  // the file of the character is read again
  const cinfo = (ds.characters || []).find?.((c) => c.active) || (ds.characters || [])[0];
  if (cinfo) { ds.load_character(cinfo); console.log('loaded', cinfo.name, ds.user_character_progress ? 'progress ok' : 'no progress'); }
};
