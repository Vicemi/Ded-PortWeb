// Checkpoint saving: every meaningful event (witness visited, department travelled, medal, score, notes...) is saved shortly after it happens (debounced),
// a quiet case is saved every 15 s, unsafe moments wait, and after "killing the page" (dropping the in-memory state) the progress and the stage come back.
import { toHub } from './lib.mjs';
const assert = (c, m) => { if (!c) throw new Error('ASSERT: ' + m); };
export default async (dev) => {
  toHub(dev);
  const g = dev.game, ds = g.datastore, py = dev.py, LS = globalThis.localStorage;
  const A = new dev.autosave.Autosaver(() => g, dev.now);
  const run = (ms) => { for (let t = 0; t < ms; t += 25) { dev.go(1); A.poll(); } };
  const cp = () => ds.user_character_progress, cs = () => cp().case;
  const charFile = () => Object.keys(py.userFiles()).find((k) => /^data\/c\d+\.dat$/.test(k));
  /** the page dies: all the in-memory state goes, the files are read again */
  const kill = () => {
    py.forgetMemoryFiles(); ds.load_characters();
    ds.user_character_progress = null; ds.user_character_stage = null;
    const c = ds.characters.find((x) => x.active) || ds.characters[0]; ds.load_character(c);
  };

  run(1000);
  assert(A.saves === 0, 'no change -> no save yet: ' + A.saves);

  // 1. a witness is visited -> one save a moment later
  cs().update_visited_witnesses(cs().list_witnesses[0]);
  run(300); assert(A.saves === 0, 'debounced, not immediate'); assert(A.pending, 'pending');
  run(1000); assert(A.saves === 1 && !A.pending, 'witness saved: ' + A.saves);
  kill();
  assert(ds.user_character_stage === 'p1', 'stage stored: ' + ds.user_character_stage);
  assert(cs().list_visited_witnesses.length === 1, 'visited witness survives the kill');

  // 2. a burst of events (department travelled + medal + score) is a single write
  const before = A.saves;
  cs().last_department_visited = cs().list_departments[1];
  cp().add_medal('Test medal'); cp().score += 50;
  run(2000); assert(A.saves === before + 1, 'burst = one save: ' + (A.saves - before));
  const score = cp().score, dep = cs().list_departments.indexOf(cs().last_department_visited);
  kill();
  assert(cp().score === score, 'score survives'); assert(cp().medals.some((m) => m.name === 'Test medal'), 'medal survives');
  assert(cs().list_departments.indexOf(cs().last_department_visited) === dep, 'department survives');

  // 3. the fingerprint sees clues, arrest orders and notes (no reload needed here)
  const fp = () => dev.autosave.progressFingerprint(g);
  let f0 = fp(); cs().clues_found = [...cs().clues_found, 0]; assert(fp() !== f0, 'clue changes the fingerprint');
  f0 = fp(); cs().arrest_order_thief = cs().thief; assert(fp() !== f0, 'arrest order changes the fingerprint');
  f0 = fp(); cp().notes.push({}); assert(fp() !== f0, 'notes change the fingerprint'); cp().notes.pop();
  cs().clues_found = cs().clues_found.slice(0, -1); cs().arrest_order_thief = null;
  run(1000);     // settle (the changes above are saved or not, we only care about what follows)

  // 4. a quiet case is saved every 15 s
  const s4 = A.saves; run(16000); assert(A.saves === s4 + 1, 'periodic save: ' + (A.saves - s4));

  // 5. an unsafe moment (end screen started) saves nothing; the checkpoint is kept and written once it is safe again
  const st = g.stage; st.ending_started = true;
  const s5 = A.saves; cp().score += 7; run(3000);
  assert(A.saves === s5 && A.pending, 'nothing saved while the end screen starts');
  st.ending_started = false; run(500); assert(A.saves === s5 + 1 && !A.pending, 'saved when safe again');

  // 6. a failing storage never throws; the page is told
  const real = LS.setItem; LS.setItem = () => { throw new Error('QuotaExceededError'); };
  cp().score += 1; run(1500);
  LS.setItem = real;
  assert(py.storageFailed(), 'storage failure visible to the page');
  cp().score += 1; run(1500); assert(!py.storageFailed(), 'recovers once the storage works');
  const file = charFile(); assert(file && /^stage;p1$/m.test(py.userFiles()[file]), 'stage line in the file');
  console.log('autosave ok, saves:', A.saves);
};
