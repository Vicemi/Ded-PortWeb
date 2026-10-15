// the new minigames: open each one, play it and solve it
import { newGame } from './lib.mjs';
export default async (dev) => {
  newGame(dev);
  const P0 = dev.mod('game/stages/phase0').Phase0Stage;
  dev.game.set_stage(new P0(dev.game, 1), true, 'p0_loading_slides_001.jpg');
  dev.go(800); dev.click(300, 400, 100); dev.go(300);
  const dm = dev.mod('game/data/datamodel');
  const st = dev.game.stage;
  const which = (process.env.NG || 'flags,candombe,trivia').split(',');
  for (const name of which) {
    const cls = { flags: dev.newgames.MinigameFlags, candombe: dev.newgames.MinigameCandombe, trivia: dev.newgames.MinigameTrivia }[name];
    const id = { flags: 'maestra', candombe: 'tamborilero', trivia: 'cartero' }[name];
    const w = new dm.Witness('X', 'p1_witness_' + id + '.png'); w.city = { name: 'Melo' }; w.department = { name: 'Cerro Largo' };
    w.witness_statement = dev.game.datastore.user_character_progress.case.list_witness_statements[0];
    let m;
    try { m = new cls(st, st.phase, w); } catch (e) { if (/Cannot load image/.test(String(e.message))) { console.log(name, 'skipped: the art of the witness is pending'); return; } throw e; }
    m.show_opening_dialog(); dev.go(150); dev.save(name + '_1open');
    dev.click(278, 305, 120);                       // "Sí"
    dev.click(274, 255, 120); dev.save(name + '_2request');
    dev.click(274, 255, 120);                       // the help
    dev.save(name + '_3help');
    dev.click(312, 388, 150);                       // "jugar"
    dev.go(30); dev.save(name + '_4play');
    if (name === 'flags') {
      // find the pairs
      const cards = m.cards;
      const by = {};
      for (const c of cards) (by[c.flag] ||= []).push(c);
      for (const list of Object.values(by)) {
        for (let i = 0; i + 1 < list.length; i += 2) {
          for (const c of [list[i], list[i + 1]]) { const [x, y] = m.screenPos(c); dev.click(x, y, 12); }
          dev.go(10);
        }
      }
      dev.save(name + '_5done');
    } else if (name === 'candombe') {
      // hit every note on time (the clock is virtual: 25 ms per frame)
      const t = () => m.now();
      m.newRun();   // the run may have started while the dialogs were clicked through
      for (let i = 0; i < 4000 && !m.minigame_solved; i++) {
        const now = t();
        for (const n of m.notes) if (n.state === 0 && Math.abs(n.t - now) < 30) m.hit(n.lane);
        dev.go(1);
        if (i === 120) dev.save(name + '_5mid');
      }
    } else {
      for (let i = 0; i < 12 && !m.minigame_solved; i++) {
        const q = m.questions[m.index]; if (!q) break;
        { const [x, y] = m.screenPos((q.answer + 1) % 4); dev.click(x, y, 10); }   // a wrong one first
        { const [x, y] = m.screenPos(q.answer); dev.click(x, y, 60); }
        if (i === 0) dev.save(name + '_5answer');
      }
    }
    dev.go(400); dev.save(name + '_6after');
    console.log(name, 'solved', m.minigame_solved, 'stage', dev.stage());
    if (!m.minigame_solved) throw new Error(name + ' was not solved');
    break;   // one per run: the dialogue stack of the stage stays open
  }
  function BX() { return 104; }
};
