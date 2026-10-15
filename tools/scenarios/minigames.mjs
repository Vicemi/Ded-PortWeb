// Plays each of the four classic minigames at random (clicks on whatever is clickable, Escape, Enter) looking for exceptions and softlocks:
// the game must keep running and the minigame must always have a way out (Escape / a button).
import { newGame } from './lib.mjs';
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
export default async (dev) => {
  const only = process.env.MG;
  const steps = Number(process.env.STEPS || 120);
  newGame(dev);
  const P0 = dev.mod('game/stages/phase0').Phase0Stage;
  dev.game.set_stage(new P0(dev.game, 1), true, 'p0_loading_slides_001.jpg');
  dev.go(800); dev.click(300, 400, 100); dev.go(300);
  const dm = dev.mod('game/data/datamodel');
  const kinds = { bricklayer: 'MinigameBricklayer', gardener: 'MinigameGardener', shoptender: 'MinigameShoptender', librarian: 'MinigameLibrarian' };
  const errors = [];
  for (const [name, cls] of Object.entries(kinds)) {
    if (only && only !== name) continue;
    const rand = rng(7 + name.length);
    const st = dev.game.stage;
    const w = new dm.Witness('X', 'p1_witness_' + name + '.png'); w.city = st.game.datastore.user_character_progress.case.list_departments[0].city_pins[0]; w.department = st.game.datastore.user_character_progress.case.list_departments[0];
    w.witness_statement = st.game.datastore.user_character_progress.case.list_witness_statements[0];
    const m = new (dev.mod('game/stages/minigame' + name)[cls])(st, st.phase, w);
    try { m.show_opening_dialog(); dev.go(150); dev.save('mg_open_' + name); } catch (e) { errors.push(name + ' open: ' + e.message); continue; }
    let acted = 0;
    for (let i = 0; i < steps; i++) {
      const stage = dev.game.stage;
      const cands = [];
      for (const l of stage.layers) if (l.get_visible()) for (const it of l.items) if (it.get_visible() && it.has_event_handler(0) && it !== m.option_text_no) cands.push(it);
      try {
        const r = rand();
        if (r < 0.06) dev.key(rand() < 0.5 ? dev.K.RETURN : 97 + Math.floor(rand() * 26), 10, 'a');
        else if (!cands.length || r < 0.1) dev.click(Math.floor(rand() * 600), Math.floor(rand() * 450), 10);
        else {
          const it = cands[Math.floor(rand() * cands.length)], b = it.get_bounds();
          dev.click(Math.max(0, Math.min(599, b.x + (b.w >> 1))), Math.max(0, Math.min(449, b.y + (b.h >> 1))), [5, 20, 60][Math.floor(rand() * 3)]);
        }
        acted++; if (i === 60) dev.save('mg_mid_' + name);
      } catch (e) { errors.push(name + ' step ' + i + ': ' + String(e.stack).split('\n').slice(0, 3).join(' | ')); break; }
    }
    console.log(name, 'steps', acted, 'solved', !!m.minigame_solved, 'stage', dev.stage());
    // the way out: Escape twice must leave the minigame and keep the phase usable
    try { dev.key(dev.K.ESCAPE, 60); dev.key(dev.K.ESCAPE, 60); dev.go(100); } catch (e) { errors.push(name + ' escape: ' + e.message); }
    dev.save('mg_' + name);
  }
  if (errors.length) throw new Error('minigame errors:\n' + errors.join('\n'));
};
