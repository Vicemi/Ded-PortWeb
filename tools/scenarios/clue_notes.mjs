// an extra object (i6xx) that is a real clue of the case, found with the magnifier, goes to the clue strip ("pistas") like the original clue items and its note reaches the notes book
import { newGame } from './lib.mjs';
export default async (dev) => {
  newGame(dev);
  const dm = dev.mod('game/data/datamodel'), ds = dev.game.datastore, cp = ds.user_character_progress, c = cp.case;
  const notesOf = {};
  for (const byType of Object.values(ds.department_type_index.items ? Object.fromEntries(ds.department_type_index.items()) : ds.department_type_index)) {
    const entries = byType.items ? [...byType.items()] : Object.entries(byType);
    for (const [type, list] of entries) for (const n of list) (notesOf[type] ??= []).push(n);
  }
  const picks = [];
  for (const clue of ds.list_clues.filter((x) => /^i6\d\d$/.test(x.id))) {
    const t = clue.list_types.find((x) => (notesOf[x.type] ?? []).length);
    if (t && picks.length < 3) picks.push(new dm.StageClue(clue, notesOf[t.type][picks.length]));
  }
  c.list_stage_clues = picks;
  c.clues_found = [];
  const P0 = dev.mod('game/stages/phase0').Phase0Stage;
  dev.game.set_stage(new P0(dev.game, 2), true, 'p0_loading_slides_001.jpg');
  dev.go(800);
  const st = dev.game.stage, ph = st.phase;
  let found = 0;
  for (let a = 0; a < 6 && found < 3; a++) { c.thief_lair_set[1] = null; ph.build_stage(); found = ph.small_items_layer.items.filter((it) => it.is_clue).length; }
  if (found < 3) throw new Error('the clue objects were not hidden');
  const items = ph.large_items_layer.items.filter((it) => it.is_clue);
  for (const it of items) {
    ph.show_item_found_message(it, true);   // the dialog of the clue
    dev.go(30);
    ph.item_dialog_close_click();           // closing it moves the object to the strip
    dev.go(80);
  }
  console.log('items_found', st.items_found.length, 'clues_found', c.clues_found.join(','), 'strip', st.clue_items.length);
  if (st.items_found.length !== 3 || st.clue_items.length !== 3 || c.clues_found.length !== 3) throw new Error('the clues did not reach the strip');
  if (!picks.every((p) => st.items_found.includes(p) && c.clues_found.includes(p.clue.id))) throw new Error('not the same clues');
  dev.go(1100); dev.click(300, 400, 100);   // the help that comes with the third clue
  dev.save('cn_strip');
  // the strip item opens its text again
  dev.click(174, 422, 60);
  dev.save('cn_strip_click');
  console.log('strip clue text:', picks[0].build_item_message());
  dev.key(dev.K.ESCAPE, 40);
  // leaving the place with the clues puts the notes of the clues in the notes book (the same code of the original clues)
  c.last_department_lair = c.last_department_visited = c.list_departments[0];
  const P1 = dev.mod('game/stages/phase1').Phase1Content;
  const before = cp.notes.length;
  P1.prototype.update_notes.call({ game: dev.game, stage: st });
  console.log('notes before', before, 'after', cp.notes.length);
  if (!picks.every((p) => cp.notes.includes(p.note_item))) throw new Error('the notes of the clues are not in the notes book');
  // the book shows them
  dev.click(535, 405, 60);
  dev.save('cn_notes');
  const letter = (n) => String(n.name[0]).toUpperCase();
  const ln = st.notes.letters_data.find((l) => l[0] === letter(picks[0].note_item));
  st.notes.select_letter(ln); dev.go(10);
  dev.save('cn_notes_letter');
  console.log('notes of the first clue letter:', st.notes.letter_notes.map((n) => n.name).join(', '));
  if (!st.notes.letter_notes.includes(picks[0].note_item)) throw new Error('the clue note is not on its page');
};
