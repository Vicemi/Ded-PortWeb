// Saves written by the released versions (1.0.x format, kept in fixtures/) must keep loading: the case resumes, medals / achievements / score are there.
// If the format ever changes, these files must still load (new fields are optional with a default).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const assert = (c, m) => { if (!c) throw new Error('ASSERT: ' + m); };
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');
export default async (dev) => {
  const { py } = dev;
  const ds = dev.game.datastore;
  const P0 = dev.mod('game/stages/phase0').Phase0Stage;
  for (const f of ['save_midcase.json', 'save_medals.json']) {
    const o = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    for (const k of Object.keys(py.userFiles())) py.os.remove(k);
    py.restoreUserFiles(o.files);
    py.forgetMemoryFiles();
    ds.load_characters();
    const info = ds.characters.find((c) => c.active) || ds.characters[0];
    assert(info, f + ': character list loads');
    ds.load_character(info);
    const p = ds.user_character_progress;
    console.log(f, info.name, 'stage', ds.user_character_stage, 'score', p.score, 'solved', p.resolved_cases, 'medals', p.medals.map((m) => m.name + 'x' + m.count).join(','));
    if (f === 'save_midcase.json') {
      assert(ds.user_character_stage === 'p1' && p.case, 'case in phase 1 resumes');
      dev.game.set_stage(new P0(dev.game, 1, false));
      dev.go(800);
      assert(dev.stage() === 'Phase0Stage', 'the phase starts: ' + dev.stage());
    } else {
      assert(p.resolved_cases === 1 && p.score > 0, 'score and solved cases');
      assert(p.medals.some((m) => m.name === 'ach_primer_caso'), 'achievement present');
      assert(p.medals.some((m) => !m.name.startsWith('ach_')), 'department medal present');
      assert(p.captured_thieves.length === 1, 'captured thief present');
      const M = dev.mod('game/stages/merits').Merits;
      // the solved case has clues found (lupa objects among them): a phase 1 resumed with it must build
      dev.game.set_stage(new P0(dev.game, 1, false));
      dev.go(800);
      new M(dev.game.stage).show_merits();
      dev.go(120);
    }
  }
};
