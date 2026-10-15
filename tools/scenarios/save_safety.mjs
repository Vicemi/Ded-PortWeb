// The save path must never lose progress: save -> reload is identical, damaged / empty / partial files fall back to the backup, a full or blocked
// storage never throws or wipes the good file, saves with unknown indexes (older / newer content) degrade to a new case instead of throwing.
import { newGame } from './lib.mjs';
const assert = (c, m) => { if (!c) throw new Error('ASSERT: ' + m); };
export default async (dev) => {
  const { py, safefs } = dev;
  const ds = dev.game.datastore;
  const LS = globalThis.localStorage;
  const charFile = () => Object.keys(py.userFiles()).find((k) => /^data\/c\d+\.dat$/.test(k));
  const raw = (k) => LS.getItem('ded.fs:' + k);
  const reload = () => { py.forgetMemoryFiles(); ds.load_characters(); const c = ds.characters.find((x) => x.active) || ds.characters[0]; ds.load_character(c); return c; };

  newGame(dev);
  ds.save_character('p1', false);
  const name = charFile();
  assert(name, 'character file exists');
  const t1 = py.userFiles()[name];

  // 1. save -> reload -> save is identical
  reload();
  assert(ds.user_character_stage === 'p1', 'stage survives: ' + ds.user_character_stage);
  assert(ds.user_character_progress.case, 'case survives');
  ds.save_character(ds.user_character_stage, false);
  assert(py.userFiles()[name] === t1, 'save -> reload -> save changed the file');
  console.log('roundtrip ok', t1.length, 'bytes');

  // 2. a second save makes the rolling backup; damaging the main file (truncated / empty / garbage) is repaired from it
  ds.user_character_progress.score = 777;
  ds.save_character('p1', false);
  const t2 = py.userFiles()[name];
  assert(t2 !== t1 && LS.getItem('ded.bak:' + name) === t1, 'rolling backup holds the previous version');
  for (const [label, bad] of [['truncated', t2.slice(0, Math.floor(t2.length * 0.6))], ['empty', ''], ['garbage', 'x\u0000y;;;']]) {
    LS.setItem('ded.fs:' + name, bad);
    py.forgetMemoryFiles();
    const got = py.userFiles()[name];
    assert(got === t1 || got === t2, label + ': not repaired');
    reload();
    assert(ds.user_character_progress, label + ': character loads');
  }
  // the damaged copy is kept aside
  assert(LS.getItem('ded.bad:' + name) !== null, 'damaged file kept in ded.bad');
  // missing main file: restored from the copies
  LS.removeItem('ded.fs:' + name);
  py.forgetMemoryFiles();
  assert(py.userFiles()[name], 'missing file restored from backup');

  // 3. a write with invalid content (empty / half a file) is refused and the good file stays
  ds.save_character('p1', false);
  const good = py.userFiles()[name];
  py.forgetMemoryFiles();
  const before = safefs.status.rejected;
  const f = py.open(name, 'w'); f.write(''); f.close();
  const f2 = py.open(name, 'w'); f2.write('stage;p1\nscore;5'); f2.close();
  assert(safefs.status.rejected >= before + 1, 'invalid writes counted');
  assert(raw(name) === good, 'good file untouched by the refused writes');

  // 4. progress never goes back: a valid file with LESS progress than the best copy is replaced by the best copy when read
  ds.user_character_progress.score = 5000;
  ds.user_character_progress.resolved_cases = 4;
  ds.save_character('nc', true);
  const rich = py.userFiles()[name];
  ds.user_character_progress.score = 10;
  ds.user_character_progress.resolved_cases = 0;
  ds.save_character('nc', true);
  ds.save_character('nc', true);
  py.forgetMemoryFiles();
  assert(py.userFiles()[name] === rich, 'a wiped (lower progress) save is not served over the best copy');
  // ... except an explicit import, which wins
  py.restoreUserFiles({ [name]: good.replace(/^score;.*$/m, 'score;1') });
  py.forgetMemoryFiles();
  assert(/^score;1$/m.test(py.userFiles()[name]), 'an import may lower progress');
  py.restoreUserFiles({ [name]: rich });

  // 5. storage that throws (quota / blocked) never throws out of a save and never damages the stored file
  const stored = raw(name);
  const real = { set: LS.setItem, get: LS.getItem };
  LS.setItem = () => { throw new Error('QuotaExceededError'); };
  ds.user_character_progress.score = 99999;
  ds.user_character_progress.resolved_cases = 9;
  ds.save_character('p1', false);
  ds.save_characters();
  assert(safefs.status.failed, 'failure reported');
  assert(py.storageFailed(), 'failure visible to the page');
  LS.setItem = real.set;
  assert(raw(name) === stored, 'stored file intact after quota errors');
  LS.getItem = () => { throw new Error('SecurityError'); };
  py.userFiles(); ds.save_character('p1', false); ds.load_characters();
  LS.getItem = real.get;
  ds.save_character('p1', false);
  assert(!safefs.status.failed && /^score;99999$/m.test(raw(name)), 'saves again once the storage works');

  // 6. unknown indexes in an old / newer save: the case is regenerated, the progress (score, medals) stays
  const cur = py.userFiles()[name];
  const withBadClue = cur.replace(/^clues;(\d+)/m, 'clues;99999');
  assert(withBadClue !== cur, 'file has a clues line');
  for (const [label, text] of [
    ['unknown clue index', withBadClue],
    ['unknown thief index', cur.replace(/^thief;\d+/m, 'thief;99999')],
    ['unknown department', cur.replace(/^departments;\d+/m, 'departments;99999')],
    ['unknown stage', cur.replace(/^stage;.*/m, 'stage;zz')],
    ['old format (no captured thieves / help step)', cur.split('\n').filter((l) => !/^(capturedthieves|lasthelpstep|uuid|shownotesanimation)/.test(l)).join('\n')],
    ['garbage line', cur + '\nwitnesses;a;b;c;d\nmedals;x;y'],
  ]) {
    LS.setItem('ded.fs:' + name, text); LS.removeItem('ded.best:' + name); LS.removeItem('ded.bak:' + name);
    py.forgetMemoryFiles();
    reload();
    const p = ds.user_character_progress;
    assert(p, label + ': no progress');
    assert(p.score === 99999 || label.startsWith('garbage'), label + ': score lost ' + p.score);
    console.log(label, '-> stage', ds.user_character_stage, 'case', !!p.case);
    if (label.startsWith('unknown')) assert(ds.user_character_stage === null && p.case === null, label + ': case should be regenerated');
  }

  // 7. export / import
  LS.setItem('ded.fs:' + name, cur); py.forgetMemoryFiles();
  const files = py.userFiles();
  assert(files[name] === cur && files['data/characters.dat'], 'export has the files');
  assert(!Object.keys(files).some((k) => /^(ded\.|tmp)/.test(k)), 'export has no internals');
  console.log('files:', Object.keys(files).join(','));
};
