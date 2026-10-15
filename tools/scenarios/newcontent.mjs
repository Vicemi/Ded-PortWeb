// A player with an OLD save must get the new content: the new thieves, witnesses (minigames), clue objects and medals show up in the cases generated after loading it
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const assert = (c, m) => { if (!c) throw new Error('ASSERT: ' + m); };
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');
export default async (dev) => {
  const { py } = dev;
  const ds = dev.game.datastore;
  const ser = dev.mod('game/data/serialization');
  const NEW_THIEVES = ['Facundo Clickbait', 'Churrito Tussy', 'Nicolás Directo', 'Gladys Plena', 'Ubaldo Rapidín', 'Florencia Rambla', 'Crespo Bitcoin', 'Hugo Garra', 'Joaco Piedrablanca', 'Benito Espuma'];
  for (const f of ['save_midcase.json', 'save_medals.json']) {
    const o = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    for (const k of Object.keys(py.userFiles())) py.os.remove(k);
    py.restoreUserFiles(o.files);
    py.forgetMemoryFiles();
    ds.load_characters();
    ds.load_character(ds.characters.find((c) => c.active) || ds.characters[0]);
    const prog = ds.user_character_progress;
    prog.resolved_cases = Math.max(prog.resolved_cases, 3);   // (the twist and the other late content need a few solved cases)
    const names = new Set(ds.list_thieves.map((t) => t.name));
    for (const n of NEW_THIEVES) assert(names.has(n), f + ': thief missing from the roster: ' + n);
    const seenThief = new Set(), seenWit = new Set(), seenClue = new Set(); let twists = 0;
    const gen = new ser.CaseGenerator(ds);
    for (let i = 0; i < 400; i++) {
      const c = gen.new_case();
      for (const t of c.list_thieves) seenThief.add(t.name);
      for (const w of c.list_witnesses) seenWit.add(String(w.name));
      for (const sc of c.list_stage_clues) seenClue.add(sc.clue.id);
      if (c.twist_state === 1) twists++;
    }
    const missingT = NEW_THIEVES.filter((n) => !seenThief.has(n));
    assert(missingT.length === 0, f + ': new thieves never appear in new cases: ' + missingT);
    assert(['Matero', 'Corredora'].every((n) => seenWit.has(n)), f + ': new witnesses (minigames) never appear: ' + [...seenWit].join(','));
    assert([...seenClue].some((id) => /^i6\d\d$/.test(id)), f + ': no clue object in new cases');
    assert(twists > 10, f + ': the twist is too rare: ' + twists + ' of 400');
    // the achievements of the thieves that the old save already caught or the new ones given when the panel opens
    const ex = dev.achievements;
    const news = ex.grantAchievements(prog, ds);
    console.log(f, 'new achievements on opening the panel:', news.length, '| thieves', seenThief.size, '| witnesses', [...seenWit].filter((n) => ['Matero', 'Corredora'].includes(n)).join('+'), '| twists', twists + '/400');
  }
};
