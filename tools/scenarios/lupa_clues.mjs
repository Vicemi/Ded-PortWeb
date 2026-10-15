// the new objects as clues: every text builds for every type it supports, and a case made only of them can be played (the clues are hidden in the rooms and open their text)
import { newGame } from './lib.mjs';
export default async (dev) => {
  newGame(dev);
  const dm = dev.mod('game/data/datamodel');
  const ds = dev.game.datastore;
  const notesOf = {};
  for (const byType of Object.values(ds.department_type_index.items ? Object.fromEntries(ds.department_type_index.items()) : ds.department_type_index)) {
    const entries = byType.items ? [...byType.items()] : Object.entries(byType);
    for (const [type, list] of entries) for (const n of list) (notesOf[type] ??= []).push(n);
  }
  const newClues = ds.list_clues.filter((c) => /^i6\d\d$/.test(c.id));
  if (newClues.length < 15) throw new Error('the clue objects are not in list_clues: ' + newClues.length);
  let n = 0, longest = null;
  for (const clue of newClues) {
    for (const t of clue.list_types) {
      for (const note of (notesOf[t.type] ?? []).slice(0, 12)) {
        const msg = new dm.StageClue(clue, note).build_item_message();
        n++;
        if (/undefined|null|\[object/.test(msg) || msg.length > 118 || !/Seguramente/.test(msg)) throw new Error('bad clue text ' + clue.id + ' ' + t.type + ': ' + msg);
        if (!longest || msg.length > longest.len) longest = { len: msg.length, clue, note, msg };
        if (n % 40 === 1) console.log(clue.id, t.type, '->', msg);
      }
    }
  }
  console.log('clue texts checked:', n, 'longest:', longest.len, longest.msg);

  // a case that has only the new objects as clues
  const P0 = dev.mod('game/stages/phase0').Phase0Stage;
  const cp = ds.user_character_progress;
  const picks = [];
  for (const clue of newClues) {
    const t = clue.list_types.find((x) => (notesOf[x.type] ?? []).length);
    if (t && picks.length < 3 && !picks.some((p) => p.clue.id === clue.id)) picks.push(new dm.StageClue(clue, notesOf[t.type][picks.length]));
  }
  picks[0] = new dm.StageClue(longest.clue, longest.note);   // the longest text must fit the dialog
  cp.case.list_stage_clues = picks;
  dev.game.set_stage(new P0(dev.game, 2), true, 'p0_loading_slides_001.jpg');
  dev.go(800);
  const st = dev.game.stage.phase;
  let found = 0;
  for (let attempt = 0; attempt < 6 && found < 3; attempt++) {
    cp.case.thief_lair_set[1] = null;
    st.build_stage();
    found = st.small_items_layer.items.filter((it) => it.is_clue).length;
  }
  console.log('real clues hidden in the room:', found);
  if (found < 3) throw new Error('the clue objects were not hidden as clues');
  const clueItem = st.large_items_layer.items.find((it) => it.is_clue && it.stage_clue.clue.id === longest.clue.id);
  st.show_item_found_message(clueItem, true);
  dev.go(60);
  dev.save('lupa_clue');
};
