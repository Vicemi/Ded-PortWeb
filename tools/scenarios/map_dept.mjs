// Departments a clue points to must be selectable on the map (also the one you stand in), and a generated case must have exactly one department that fits its 3 clue notes.
import { toHub } from './lib.mjs';
export default async (dev) => {
  toHub(dev);
  const ds = dev.game.datastore;
  const ser = dev.mod('game/data/serialization');
  // 1) generation: the answer is unambiguous
  for (let i = 0; i < 150; i++) {
    const c = new ser.CaseGenerator(ds).new_case();
    const B = c.list_departments[1];
    const notes = c.list_stage_clues.slice(0, 3).map((s) => s.note_item);
    const fit = ds.list_departments.filter((d) => notes.every((n) => n.get_departments().includes(d)));
    if (fit.length !== 1 || fit[0] !== B) throw new Error(`case ${i}: clue notes fit ${fit.map((d) => d.name)} but the lair is ${B.name}`);
  }
  // 2) map: after the clues, the current department, the first lair and the departments of the notes are selectable
  const cp = ds.user_character_progress, c = cp.case;
  const A = c.list_departments[0], B = c.list_departments[1];
  const noteDeps = new Set(c.list_stage_clues.slice(0, 3).flatMap((s) => s.note_item.get_departments()));
  c.last_department_lair = B; c.clues_found = [c.list_stage_clues[0].clue.id];
  const other = ds.list_departments.find((d) => d !== A && d !== B && !c.list_posible_departments.includes(d));
  for (const here of [A, B, other]) {
    c.last_department_visited = here;
    const m = dev.game.stage.map;
    m.set_up(true, false);
    const open = (d) => !m.department_data.find((x) => x.department === d).inactive;
    for (const d of [here, A, B, ...noteDeps, ...c.list_posible_departments]) if (!open(d)) throw new Error(`in ${here.name}: ${d.name} is not selectable`);
  }
  console.log('map ok; note departments:', [...noteDeps].map((d) => d.name).join(', '));
};
