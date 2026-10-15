// Several detectives: create, play (save), switch, delete. A deleted detective is gone for good (no backup brings it back, an id that is reused starts
// clean) and the others keep their progress.
import { newGame } from './lib.mjs';
const assert = (c, m) => { if (!c) throw new Error('ASSERT: ' + m); };
export default async (dev) => {
  const { py } = dev;
  newGame(dev, 'Ana');
  const ds = dev.game.datastore;
  const deps = ds.list_departments;
  ds.user_character_progress.score = 1234; ds.user_character_progress.resolved_cases = 2;
  ds.save_character('nc', true);
  const ana = ds.user_character.charinfo;
  const b = ds.create_character('Beto;$x', true, 3, deps[1].name, true);   // a name with the separators of the file
  ds.load_character(b);
  ds.user_character_progress.set_case(new (dev.mod('game/data/serialization').CaseGenerator)(ds).new_case());
  ds.user_character_progress.score = 99; ds.user_character_progress.resolved_cases = 1;
  ds.save_character('nc', true); ds.save_character('nc', true);
  ds.save_characters();
  py.forgetMemoryFiles();
  ds.load_characters();
  assert(ds.characters.length === 2, 'two detectives listed: ' + ds.characters.length);
  assert(ds.characters.some((c) => c.name === 'Beto;$x'), 'the name with separators survives');
  ds.load_character(ds.characters.find((c) => c.id === ana.id));
  assert(ds.user_character_progress.score === 1234, 'Ana keeps her score');
  // delete Beto: nothing of his is left, not even the backups
  const betoId = b.id;
  ds.delete_character(ds.characters.find((c) => c.id === betoId));
  py.forgetMemoryFiles();
  assert(!Object.keys(py.userFiles()).includes('data/c' + betoId + '.dat'), 'deleted detective file is gone');
  assert(!Object.keys(globalThis.localStorage.length ? Object.fromEntries([...Array(globalThis.localStorage.length).keys()].map((i) => [globalThis.localStorage.key(i), 1])) : {}).some((k) => k.endsWith('c' + betoId + '.dat')), 'no backup of it either');
  ds.load_characters();
  assert(ds.characters.length === 1, 'one detective left');
  // a new detective takes the freed id and starts clean
  const c = ds.create_character('Carla', false, 2, deps[2].name, true);
  ds.load_character(c);
  assert(ds.user_character_progress.score === 0 && ds.user_character_progress.resolved_cases === 0, 'the new detective is clean');
  ds.load_character(ds.characters.find((x) => x.id === ana.id));
  assert(ds.user_character_progress.score === 1234, 'Ana still has her score');
  console.log('ids', ds.characters.map((x) => x.id + ':' + x.name).join(' '));
};
