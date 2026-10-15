// Winning a case must store the score, medals and achievements AT the final screen (not when the score screens end): the page can be closed in
// between. Also: the autosave of a hidden page saves a case in a phase, but never once an end screen has started.
import { toHub } from './lib.mjs';
const assert = (c, m) => { if (!c) throw new Error('ASSERT: ' + m); };
export default async (dev) => {
  toHub(dev);
  const ds = dev.game.datastore;
  const name = () => Object.keys(dev.py.userFiles()).find((k) => /^data\/c\d+\.dat$/.test(k));
  const reload = () => { dev.py.forgetMemoryFiles(); ds.load_characters(); ds.load_character(ds.characters.find((c) => c.active) || ds.characters[0]); return ds.user_character_progress; };

  // autosave while a phase is on screen
  const before = dev.py.userFiles()[name()];
  ds.user_character_progress.case.time_spend += 1;
  assert(dev.autosave.flushProgress(dev.game), 'flush saved the open phase');
  assert(dev.py.userFiles()[name()] !== before, 'flush changed the file');
  assert(reload().case.time_spend >= 1, 'time spent survives a flush + reload');

  dev.game.set_development_mode(true);
  dev.key('a'.charCodeAt(0), 100, 'A', 1);   // Shift+A: arrest the thief and open the end screen
  dev.go(300);
  assert(dev.game.stage.ending_started, 'ending flagged');
  const snap = dev.py.userFiles()[name()];
  assert(!dev.autosave.flushProgress(dev.game), 'no autosave once the end screen started');
  assert(dev.py.userFiles()[name()] === snap, 'file untouched by the refused autosave');
  // click until the final screen shows the result, then pretend the page dies
  let p = null;
  for (let i = 0; i < 14 && !p; i++) {
    dev.click(303, 326, 150); dev.go(250);
    const f = dev.py.userFiles()[name()];
    if (/^resolvedcases;1$/m.test(f)) p = reload();
  }
  assert(p, 'the result was saved before the score screens ended');
  const names = p.medals.map((m) => m.name + 'x' + m.count);
  console.log('after reload:', names.join(','), 'score', p.score, 'resolved', p.resolved_cases, 'stage', ds.user_character_stage);
  assert(p.resolved_cases === 1 && p.score > 0, 'score and solved cases stored');
  assert(p.medals.some((m) => m.name === 'ach_primer_caso'), 'achievement stored');
  assert(p.medals.length >= 2, 'department medal stored');
  assert(ds.user_character_stage === null || ds.user_character_stage === 'nc', 'a reload starts the next case, it does not replay the won one');
};
