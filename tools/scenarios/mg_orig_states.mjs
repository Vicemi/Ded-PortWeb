// screenshots of the classic minigames in the middle of their effects: MG=bricklayer|gardener|librarian|shoptender
import { newGame } from './lib.mjs';
export default async (dev) => {
  newGame(dev);
  const P0 = dev.mod('game/stages/phase0').Phase0Stage;
  dev.game.set_stage(new P0(dev.game, 1), true, 'p0_loading_slides_001.jpg');
  dev.go(800); dev.click(300, 400, 100); dev.go(300);
  const name = process.env.MG || 'shoptender';
  const cls = { bricklayer: 'MinigameBricklayer', gardener: 'MinigameGardener', shoptender: 'MinigameShoptender', librarian: 'MinigameLibrarian' }[name];
  const M = dev.mod('game/stages/minigame' + name)[cls];
  const dm = dev.mod('game/data/datamodel');
  const st = dev.game.stage;
  const w = new dm.Witness('X', 'p1_witness_' + name + '.png'); w.city = { name: 'Melo' }; w.department = { name: 'Cerro Largo' };
  w.witness_statement = dev.game.datastore.user_character_progress.case.list_witness_statements[0];
  const m = new M(st, st.phase, w);
  m.show_opening_dialog(); dev.go(150);
  dev.click(278, 305, 120); dev.click(274, 255, 120); dev.click(274, 255, 120); dev.click(312, 388, 150);
  dev.go(60); dev.save(name + '_a_idle');
  if (name === 'shoptender') {
    const right = m.operation_correct_answer, wrong = [0, 1, 2, 3].find((i) => !right.includes(i));
    dev.click(207 + 50 * wrong + 20, 330, 3); dev.save(name + '_b_wrong'); dev.go(8); dev.save(name + '_b2_wrong'); dev.go(30);
    for (let k = 0; k < 5; k++) {
      const r = m.operation_correct_answer[0];
      dev.click(207 + 50 * r + 20, 330, 4); if (k === 0) { dev.save(name + '_c_right'); dev.go(6); dev.save(name + '_c2_right'); }
      dev.go(60);
    }
    m.timer_line_item.set_height(40); dev.go(60); dev.save(name + '_d_lowtime');
    dev.go(200); dev.save(name + '_e_score1'); dev.go(400); dev.save(name + '_e_score2'); dev.go(300); dev.save(name + '_e_score3');
  } else if (name === 'librarian') {
    const words = m.get_matches(m.dictionary_full[0 ? 0 : 0] ? m.dictionary_full : m.dictionary_full);
    const typeWord = (wd) => { for (const ch of wd) dev.key(ch.charCodeAt(0), 2, ch); };
    typeWord(m.letters[0]); dev.key(dev.K.RETURN, 3); dev.save(name + '_b_wrong'); dev.go(8); dev.save(name + '_b2_wrong'); dev.go(30);
    for (let k = 0; k < 5 && k < words.length; k++) { typeWord(words[k]); dev.key(dev.K.RETURN, 3); if (k === 0) { dev.save(name + '_c_right'); dev.go(6); dev.save(name + '_c2_right'); } dev.go(40); }
    dev.go(200); dev.save(name + '_e_score1'); dev.go(600); dev.save(name + '_e_score2');
  } else if (name === 'bricklayer') {
    for (const p of m.puzzle_pieces) { const b = p.get_bounds(); dev.click(b.x + 10, b.y + 10, 4); dev.save(name + '_b_click'); dev.go(5); }
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) m.grid[r][c] = null;
    for (const p of m.puzzle_pieces) { m.grid[p.row][p.col] = p; p.current_row = p.row; p.current_col = p.col; m.set_piece_pos(p.row, p.col); }
    m.check_minigame_solved(); dev.go(6); dev.save(name + '_c_solved'); dev.go(20); dev.save(name + '_c2_solved'); dev.go(60); dev.save(name + '_c3_missing');
    dev.click(300, 420, 100); dev.go(400); dev.save(name + '_e_score1'); dev.go(400); dev.save(name + '_e_score2');
  } else {
    const opt = []; for (const l of st.layers) for (const it of l.items) if (it.list_item) opt.push(it);
    const o = opt[0]; dev.click(o.get_left() + 20, o.get_top() + 20, 5); dev.go(5);
    const [x, y] = st.get_xy(5, 5);
    dev.click(x, y, 3); dev.save(name + '_b_paint'); dev.go(6); dev.save(name + '_b2_paint');
    m.fx.confetti(300, 220, 60); m.fx.good(300, 250, '', 20); dev.go(8); dev.save(name + '_c_fx'); dev.go(30);
  }
  console.log(name, 'solved', !!m.minigame_solved, dev.stage());
};
