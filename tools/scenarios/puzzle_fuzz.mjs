// Fuzzes the Albañil (bricklayer) tile puzzle: random clicks, fast clicks, drags released outside the board, clicks on the empty cell and on the
// fixed tiles (they shake), interleaved with the fx animations. Asserts that no tile stays away from its grid cell for more than a second (a "frozen"
// tile) and that the puzzle can always be completed (BFS solution replayed with real clicks). SEEDS / ACTIONS tune the run.
import { newGame } from './lib.mjs';
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/** shortest list of cells to click (each slides the neighbour into the hole) to reach the solved board; null when unsolvable */
function solve(m) {
  const R = m.rows, C = m.cols, N = R * C;
  const start = []; let hole = -1;
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) { const p = m.grid[r][c]; start.push(p ? p.row * C + p.col : -1); if (!p) hole = r * C + c; }
  const goal = []; for (let i = 0; i < N - 1; i++) goal.push(i); goal.push(-1);
  const key = (s) => s.join(','), goalKey = key(goal);
  const prev = new Map([[key(start), null]]); let frontier = [[start, hole]];
  while (frontier.length && !prev.has(goalKey)) {
    const next = [];
    for (const [s, h] of frontier) {
      const hr = (h / C) | 0, hc = h % C;
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const r = hr + dr, c = hc + dc;
        if (r < m.from_row || c < m.from_col || r >= R || c >= C) continue;
        const t = s.slice(); t[h] = t[r * C + c]; t[r * C + c] = -1;
        const k = key(t); if (prev.has(k)) continue;
        prev.set(k, [key(s), r * C + c]); next.push([t, r * C + c]);
      }
    }
    frontier = next;
  }
  if (!prev.has(goalKey)) return null;
  const path = []; for (let k = goalKey; prev.get(k); k = prev.get(k)[0]) path.push(prev.get(k)[1]);
  return path.reverse();
}

export default async (dev) => {
  const seeds = Number(process.env.SEEDS || 3), actions = Number(process.env.ACTIONS || 1000);
  newGame(dev);
  const P0 = dev.mod('game/stages/phase0').Phase0Stage;
  dev.game.set_stage(new P0(dev.game, 1), true, 'p0_loading_slides_001.jpg');
  dev.go(800); dev.click(300, 400, 100); dev.go(300);
  const dm = dev.mod('game/data/datamodel');
  const failures = [];
  for (let seed = 1; seed <= seeds; seed++) {
    const rand = rng(seed * 7919), level = 1 + (seed % 3);
    const st = dev.game.stage, prog = st.game.datastore.user_character_progress;
    prog.range.minigame_level = level; prog.minigame_bricklayer_help_seen = true;
    const w = new dm.Witness('X', 'p1_witness_bricklayer.png'); w.city = prog.case.list_departments[0].city_pins[0]; w.department = prog.case.list_departments[0];
    w.witness_statement = prog.case.list_witness_statements[0];
    const m = new (dev.mod('game/stages/minigamebricklayer').MinigameBricklayer)(st, st.phase, w);
    m.show_witness_minigame(); dev.go(300);
    const tag = `seed ${seed} level ${level}`;
    const target = (p) => [114 + p.current_col * p.get_width(), 87 + p.current_row * p.get_height()];
    let reshuffles = 0;
    const since = new Map();   // piece -> time since it was last seen away from its cell
    const audit = () => {
      for (const p of m.puzzle_pieces) {
        const [x, y] = target(p), away = Math.abs(p.get_left() - x) > 4 || Math.abs(p.get_top() - y) > 4;
        if (!away) { since.delete(p); continue; }
        if (!since.has(p)) since.set(p, dev.now());
        else if (dev.now() - since.get(p) > 1000) { failures.push(`${tag}: tile ${p.row},${p.col} frozen at ${p.get_left()},${p.get_top()} (cell ${x},${y})`); since.delete(p); }
      }
    };
    const step = (n) => { for (let i = 0; i < n; i++) { dev.go(1); audit(); } };
    const cell = (r, c) => { const p = m.puzzle_pieces[0]; return [114 + c * p.get_width() + (p.get_width() >> 1), 87 + r * p.get_height() + (p.get_height() >> 1)]; };
    for (let i = 0; i < actions && !m.minigame_solved; i++) {
      const r = rand(), [x, y] = cell((rand() * m.rows) | 0, (rand() * m.cols) | 0), frames = [1, 1, 2, 3, 5, 10, 40][(rand() * 7) | 0];
      if (r < 0.7) { dev.down(x, y); dev.up(x, y); }
      else if (r < 0.85) { dev.down(x, y); dev.move(2 + ((rand() * 40) | 0), 440, 2); dev.up(2, 440); }   // dragged out of the board and released
      else if (r < 0.95) { dev.move(x, y, 1); dev.down(x, y); dev.move(x + 80, y + 60, 2); dev.up(x + 80, y + 60); }
      else if (r < 0.97) { dev.down(57, 270); dev.up(57, 270); reshuffles++; }   // the REORDENAR button (big, under the photo)
      else if (r < 0.99) { dev.key(114, 2, 'r'); reshuffles++; }             // the R key
      else { dev.move(x, y, 1); }
      step(frames);
      if (m.minigame_solved) break;
    }
    step(120);
    // the puzzle must be completable from whatever state the fuzz left it in
    if (!m.minigame_solved) {
      const path = solve(m);
      if (!path) failures.push(`${tag}: no solution from the reached state`);
      else {
        for (const cellIndex of path) {
          if (m.minigame_solved) break;
          const [x, y] = cell((cellIndex / m.cols) | 0, cellIndex % m.cols);
          dev.down(x, y); dev.up(x, y); step(40);
        }
        step(40);
        if (!m.minigame_solved) failures.push(`${tag}: replaying the solution did not complete the puzzle`);
      }
    }
    // after settling, every tile sits exactly in its cell
    for (const p of m.puzzle_pieces) { const [x, y] = target(p); if (p.get_left() !== x || p.get_top() !== y) failures.push(`${tag}: tile ${p.row},${p.col} settled at ${p.get_left()},${p.get_top()} instead of ${x},${y}`); }
    const b = m.reshuffle_item, pw = m.puzzle_pieces[0];
    if (b.get_left() + b.get_width() > 114 || b.get_width() < 80 || b.get_height() < 32) failures.push(`${tag}: REORDENAR button overlaps the board or is too small`);
    if (!reshuffles) failures.push(`${tag}: the fuzz never used the reshuffle`);
    console.log(tag, 'solved', !!m.minigame_solved, 'reshuffles', reshuffles);
    dev.key(dev.K.ESCAPE, 60); dev.key(dev.K.ESCAPE, 60); dev.go(100);
  }
  if (failures.length) throw new Error('puzzle fuzz failures:\n' + failures.slice(0, 15).join('\n'));
};
