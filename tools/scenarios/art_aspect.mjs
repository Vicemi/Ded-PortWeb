// No picture of the minigames may be stretched (src/game/minigames/mgart.ts). Plays every game with the REAL art (Banderas, Cartero, Mate, Rambla, Candombe, with the
// stars / sparkles / confetti of the result screens) while mgart records every picture it draws (artStats.audit: source size vs the size it lands at), and FAILS when
//   - a picture lands at another aspect than its own (|dest aspect / source aspect - 1| > 4%), except the documented animation squash (`flip`: confetti turning over), or
//   - a picture placed 'fit' goes into a box of another aspect (the sprite would shrink / float in its box: the box or the art has the wrong shape).
// 'cover' (backgrounds, card backs) crops on purpose and is only checked for the first rule. Screenshots of every game go to the shots folder (art_<game>_*).
import { newGame } from './lib.mjs';
const TOL = 0.04;
export default async (dev) => {
  const pg = dev.pygame, art = dev.mgart.artStats;
  if (!dev.assets.has_image('mg_mate_bg.png')) { console.log('art_aspect skipped: the real art is not in the packs'); return; }
  art.audit = [];
  const post = (type, o) => pg.event.post({ type, ...o });
  const kdown = (k) => { pg.input.pressed.add(k); post(pg.KEYDOWN, { key: k, mod: 0, unicode: '' }); };
  const kup = (k) => { pg.input.pressed.delete(k); post(pg.KEYUP, { key: k, mod: 0, unicode: '' }); };

  newGame(dev);
  const P0 = dev.mod('game/stages/phase0').Phase0Stage;
  dev.game.set_stage(new P0(dev.game, 1), true, 'p0_loading_slides_001.jpg');
  dev.go(800); dev.click(300, 400, 100); dev.go(300);
  const dm = dev.mod('game/data/datamodel');
  const open = (Cls, id) => {
    const st = dev.game.stage;
    const w = new dm.Witness('X', `p1_witness_${id}.png`); w.city = { name: 'Melo' }; w.department = { name: 'Cerro Largo' };
    w.witness_statement = dev.game.datastore.user_character_progress.case.list_witness_statements[0];
    const m = new Cls(st, st.phase, w);
    m.show_opening_dialog(); dev.go(150);
    dev.click(278, 305, 120); dev.click(274, 255, 120); dev.click(274, 255, 120); dev.click(312, 388, 150); dev.go(30);
    return m;
  };
  const close = () => { dev.key(dev.K.ESCAPE, 60); dev.key(dev.K.ESCAPE, 60); dev.go(100); };
  const solveFlags = (m) => {
    const by = {};
    for (const c of m.cards) (by[c.flag] ||= []).push(c);
    let n = 0;
    for (const list of Object.values(by)) for (let i = 0; i + 1 < list.length; i += 2) {
      for (const c of [list[i], list[i + 1]]) { const [x, y] = m.screenPos(c); dev.click(x, y, 12); }
      if (++n === 2) dev.save('art_flags_pairs');
      dev.go(10);
    }
  };
  const games = {
    flags(m) {
      for (let i = 0; i < 8 && !Array.isArray(m.cards); i++) { dev.go(30); if (!Array.isArray(m.cards)) { dev.click(278, 305, 60); dev.click(274, 255, 60); dev.click(312, 388, 90); } }
      dev.save('art_flags_deal'); dev.go(60);
      // a wrong pair: two cards turned over and back (the flip, the frame)
      const a = m.cards[0], b = m.cards.find((c) => c.flag !== a.flag);
      for (const c of [a, b]) { const [x, y] = m.screenPos(c); dev.click(x, y, 8); }
      dev.go(10); dev.save('art_flags_flip'); dev.go(30); dev.save('art_flags_two');
      dev.go(60);
      solveFlags(m); dev.go(30); dev.save('art_flags_done'); dev.go(120); dev.save('art_flags_stars');
    },
    trivia(m) {
      dev.save('art_trivia_ask');
      for (let i = 0; i < 12 && !m.minigame_solved; i++) {
        const q = m.questions[m.index]; if (!q) break;
        { const [x, y] = m.screenPos((q.answer + 1) % 4); dev.click(x, y, 10); }
        if (i === 0) dev.save('art_trivia_wrong');
        { const [x, y] = m.screenPos(q.answer); dev.click(x, y, 20); }
        if (i === 0) dev.save('art_trivia_right');
        dev.go(40);
      }
      dev.go(60); dev.save('art_trivia_done'); dev.go(120); dev.save('art_trivia_stars');
    },
    mate(m) {
      dev.save('art_mate_start');
      for (let r = 0; r < 3; r++) { kdown(32); dev.go(r === 0 ? 20 : r === 1 ? 150 : 40); if (r === 0) dev.save('art_mate_pour'); kup(32); dev.go(40); if (r === 1) dev.save('art_mate_spill'); }
      dev.go(30); dev.save('art_mate_after');
    },
    rambla(m) {
      for (let i = 0; i < 700; i++) { if (i % 37 === 0) { kdown(32); dev.go(3); kup(32); } else dev.go(1); if (i === 60) dev.save('art_rambla_run'); if (i === 210) dev.save('art_rambla_mid'); if (i === 400) dev.save('art_rambla_late'); }
      if (m.len) { m.d = Math.max(m.d, m.len - 150); dev.go(40); dev.save('art_rambla_meta'); }   // the finish arch
    },
    candombe(m) {
      m.newRun?.();
      for (let i = 0; i < 300; i++) { if (i % 10 === 0) { const k = [97, 115, 100, 102][(i / 10) % 4]; kdown(k); dev.go(1); kup(k); } dev.go(1); if (i === 100) dev.save('art_candombe_play'); }
      dev.save('art_candombe_late');
    },
  };
  const classes = { flags: [dev.newgames.MinigameFlags, 'maestra'], mate: [dev.extra.MinigameMate, 'matero'], rambla: [dev.extra.MinigameRambla, 'corredora'], trivia: [dev.newgames.MinigameTrivia, 'cartero'], candombe: [dev.newgames.MinigameCandombe, 'tamborilero'] };
  for (const name of ['flags', 'trivia', 'mate', 'rambla', 'candombe']) {
    const [Cls, id] = classes[name], stg = dev.game.stage;
    for (let i = 0; i < 4 && (stg.locks > 0 || stg.dialogs.length > 0); i++) { dev.go(150); if (stg.locks === 0 && stg.dialogs.length > 0) dev.key(dev.K.ESCAPE, 60); }
    let m;
    try { m = open(Cls, id); } catch (e) { if (/Cannot load image/.test(String(e.message))) { console.log(name, 'skipped: the art of the witness is pending'); continue; } throw e; }
    games[name](m);
    close();
  }
  // the stars of the result screens, directly (a few sizes and both states)
  {
    const fx = dev.mgfx, s = new pg.Surface([200, 100], pg.SRCALPHA, 32);
    for (const r of [6, 14, 22]) { fx.uiStar(s.ctx, 40, 40, r, true, 0.3, '#fc0', '#555', '#000'); fx.uiStar(s.ctx, 120, 40, r, false, -0.3, '#fc0', '#555', '#000'); }
  }

  const verdict = (e) => {
    const dist = (e.dw / e.dh) / (e.sw / e.sh) - 1, box = (e.bw / e.bh) / (e.sw / e.sh) - 1, issues = [];
    if (!e.flip && Math.abs(dist) > TOL) issues.push(`STRETCHED ${(dist * 100).toFixed(1)}%`);
    if (!e.flip && e.mode === 'fit' && Math.abs(box) > TOL) issues.push(`box ${e.bw.toFixed(0)}x${e.bh.toFixed(0)} is ${(box * 100).toFixed(1)}% off the art's aspect (the picture does not fill it)`);
    return issues;
  };
  if (!verdict({ sw: 90, sh: 120, dw: 69, dh: 54, bw: 69, bh: 54, mode: 'stretch' }).length || !verdict({ sw: 100, sh: 100, dw: 50, dh: 50, bw: 90, bh: 50, mode: 'fit' }).length || verdict({ sw: 32, sh: 32, dw: 9, dh: 3, bw: 9, bh: 3, mode: 'fit', flip: true }).length) throw new Error('art_aspect: the checker itself is broken');
  const rows = art.audit;
  const seen = new Map(), bad = [];
  for (const e of rows) {
    const issues = verdict(e), key = `${e.tag}:${e.name}:${e.mode}`;
    const line = `${key} src ${e.sw}x${e.sh} -> ${e.dw.toFixed(1)}x${e.dh.toFixed(1)} in ${e.bw.toFixed(1)}x${e.bh.toFixed(1)}${e.flip ? ' (flip)' : ''}`;
    if (!seen.has(key)) seen.set(key, line);
    if (issues.length) bad.push(`${line}: ${issues.join('; ')}`);
  }
  console.log(`art_aspect: ${rows.length} draws, ${seen.size} distinct pictures`);
  if (process.env.ART_LIST) console.log([...seen.values()].join('\n'));
  if (!rows.length) throw new Error('art_aspect: nothing was recorded (mgart.note is not called?)');
  if (bad.length) throw new Error('art_aspect: pictures with the wrong aspect:\n  ' + [...new Set(bad)].join('\n  '));
  art.audit = null;
};
