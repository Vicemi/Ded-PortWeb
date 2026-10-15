// takes screenshots of the new minigames in the middle of their animations: NG=flags|trivia
import { newGame } from './lib.mjs';
export default async (dev) => {
  newGame(dev);
  const P0 = dev.mod('game/stages/phase0').Phase0Stage;
  dev.game.set_stage(new P0(dev.game, 1), true, 'p0_loading_slides_001.jpg');
  dev.go(800); dev.click(300, 400, 100); dev.go(300);
  const dm = dev.mod('game/data/datamodel');
  const st = dev.game.stage;
  const name = process.env.NG || 'trivia';
  const cls = { flags: dev.newgames.MinigameFlags, trivia: dev.newgames.MinigameTrivia }[name];
  const id = { flags: 'maestra', trivia: 'cartero' }[name];
  const w = new dm.Witness('X', 'p1_witness_' + id + '.png'); w.city = { name: 'Melo' }; w.department = { name: 'Cerro Largo' };
  w.witness_statement = dev.game.datastore.user_character_progress.case.list_witness_statements[0];
  const m = new cls(st, st.phase, w);
  m.show_opening_dialog(); dev.go(150);
  dev.click(278, 305, 120); dev.click(274, 255, 120); dev.click(274, 255, 120); dev.click(312, 388, 150);
  dev.go(4); dev.save(name + '_a_enter');
  dev.go(20); dev.save(name + '_b_ready');
  if (name === 'trivia') {
    let q = m.questions[m.index];
    { const [x, y] = m.screenPos((q.answer + 1) % 4); dev.click(x, y, 3); } dev.save(name + '_c_wrong');
    dev.go(6); dev.save(name + '_c2_wrong');
    { const [x, y] = m.screenPos(q.answer); dev.click(x, y, 3); } dev.save(name + '_d_right');
    dev.go(18); dev.save(name + '_e_out');
    dev.go(30); dev.save(name + '_f_next');
    while (!m.finish && !m.minigame_solved) { q = m.questions[m.index]; const [x, y] = m.screenPos(q.answer); dev.click(x, y, 40); }
    dev.go(30); dev.save(name + '_g_finale1');
    dev.go(30); dev.save(name + '_g_finale2');
    dev.go(120); dev.save(name + '_h_score1'); dev.go(300); dev.save(name + '_h_score2'); dev.go(300); dev.save(name + '_h_score3');
  } else {
    const cards = m.cards, by = {};
    for (const c of cards) (by[c.flag] ||= []).push(c);
    const L = Object.values(by);
    // a mismatch
    { const [x1, y1] = m.screenPos(L[0][0]); const [x2, y2] = m.screenPos(L[1][0]); dev.click(x1, y1, 3); dev.go(4); dev.save(name + '_c_flip'); dev.click(x2, y2, 14); dev.save(name + '_c2_bad'); dev.go(30); dev.save(name + '_c3_back'); }
    { const [x1, y1] = m.screenPos(L[0][0]); const [x2, y2] = m.screenPos(L[0][1]); dev.click(x1, y1, 14); dev.click(x2, y2, 14); dev.save(name + '_d_match'); dev.go(12); dev.save(name + '_d2_match'); dev.go(30); }
    for (const list of L.slice(1)) { for (const c of list.slice(0, 2)) { const [x, y] = m.screenPos(c); dev.click(x, y, 8); } dev.go(10); }
    dev.go(40); dev.save(name + '_e_done1'); dev.go(30); dev.save(name + '_e_done2');
  }
  console.log(name, 'solved', m.minigame_solved, dev.stage());
};
