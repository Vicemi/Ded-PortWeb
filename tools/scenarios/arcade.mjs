// The real-time minigames (src/game/minigames/mate.ts, rambla.ts): NG=mate | rambla. Opens the minigame, plays a LOSING path first (the thermos runs
// dry / three tumbles: the board restarts), then plays it to the end with a scripted player (keyboard and mouse), and checks that the game goes on
// and the input still works afterwards. NG=mate+route starts it from the map as a witness of the investigation (the way the player gets it).
import { newGame } from './lib.mjs';
const BX = 104, BY = 74;
export default async (dev) => {
  const [NG, route] = (process.env.NG || 'mate').split('+');   // NG=mate | rambla, optionally '+route': start it from the map
  const pg = dev.pygame, id = { mate: 'matero', rambla: 'corredora' }[NG];
  const Cls = { mate: dev.extra.MinigameMate, rambla: dev.extra.MinigameRambla }[NG];
  const post = (type, o) => pg.event.post({ type, ...o });
  const kdown = (k) => { pg.input.pressed.add(k); post(pg.KEYDOWN, { key: k, mod: 0, unicode: '' }); };
  const kup = (k) => { pg.input.pressed.delete(k); post(pg.KEYUP, { key: k, mod: 0, unicode: '' }); };
  const mdown = (x = BX + 60, y = BY + 60) => { pg.input.pos = [x, y]; pg.input.buttons[0] = 1; post(pg.MOUSEBUTTONDOWN, { pos: [x, y], button: 1 }); };
  const mup = (x = BX + 60, y = BY + 60) => { pg.input.pos = [x, y]; pg.input.buttons[0] = 0; post(pg.MOUSEBUTTONUP, { pos: [x, y], button: 1 }); };
  const ok = (cond, msg) => { if (!cond) throw new Error(msg); };

  newGame(dev);
  const P0 = dev.mod('game/stages/phase0').Phase0Stage;
  let m;
  const grab = Cls.prototype.setup;
  Cls.prototype.setup = function () { m = this; return grab.call(this); };
  let st, before = 0, ph;
  if (route) {
    // from the map: the witness of the lair is of this kind
    { const c = dev.game.datastore.user_character_progress.case; c.last_department_visited = c.last_department_lair; }
    dev.game.set_stage(new P0(dev.game, 1), true, 'p0_loading_slides_001.jpg');
    dev.go(800); dev.click(300, 400, 100); dev.go(600); dev.click(300, 400, 100); dev.go(600); dev.go(400);
    st = dev.game.stage; ph = st.phase;
    const kind = NG === 'mate' ? 'Matero' : 'Corredora';
    const ds = dev.game.datastore;
    ok(ds.list_witnesses.some((w) => w.name === kind), kind + ' is not one of the witnesses of the datastore');
    const pin = (ph.active_pins && ph.active_pins[0]) || (ph.pins && ph.pins[0]);
    pin.witness.name = kind; pin.witness.image = `p1_witness_${id}.png`;
    before = ph.minigames_resolved;
    pin.department = dev.game.datastore.user_character_progress.case.last_department_lair;
    ph.pin_click(pin, {});                      // what clicking the pin does: the statement of the witness, then its minigame
  } else {
    dev.game.set_stage(new P0(dev.game, 1), true, 'p0_loading_slides_001.jpg');
    dev.go(800); dev.click(300, 400, 100); dev.go(300);
    st = dev.game.stage;
    const dm = dev.mod('game/data/datamodel');
    const w = new dm.Witness('X', `p1_witness_${id}.png`); w.city = { name: 'Melo' }; w.department = { name: 'Cerro Largo' };
    w.witness_statement = dev.game.datastore.user_character_progress.case.list_witness_statements[0];
    new Cls(st, st.phase, w).show_opening_dialog();
  }
  dev.go(150); dev.save(NG + '_1open');
  dev.click(278, 305, 120);                       // "Sí"
  dev.click(274, 255, 120); dev.save(NG + '_2request');
  dev.click(274, 255, 120); dev.save(NG + '_3help');
  dev.click(312, 388, 150);                       // "jugar"
  dev.go(30); dev.save(NG + '_4play');
  ok(m, 'the minigame did not start');
  ok(dev.game.stage.is_timer_started('new_minigame_tick'), 'the game loop is not running');

  if (NG === 'mate') {
    const pour = (until, { key = false, max = 400 } = {}) => {   // holds the input until the level reaches `until`
      if (key) kdown(32); else mdown();
      let i = 0;
      while (i++ < max && m.level_ < until && m.water > 0 && m.state === 'play') dev.go(1);
      if (key) kup(32); else mup();
    };
    // lose: pour until it spills, again and again, until the thermos is empty
    pour(2); ok(m.state === 'spill' && m.mistakes === 1, 'it did not spill');
    dev.go(8); dev.save('mate_5spill');
    for (let i = 0; i < 40 && m.fails === 0; i++) { dev.go(60); if (m.state === 'play') pour(2, { key: true }); }
    ok(m.fails >= 1, 'running out of water did not restart the game: ' + m.state + ' water ' + m.water);
    dev.go(120); ok(m.state === 'play' && m.round === 0 && m.level_ === 0, 'the restart did not reset the board');
    // win: stop inside the band every time (key and mouse alternate)
    let rounds = 0;
    for (let guard = 0; guard < 3000 && !m.minigame_solved; guard++) {
      if (m.state === 'play' && m.level_ < 0.01) {
        const [lo, hi] = m.band, target = (lo + hi) / 2 - 0.01;
        pour(target, { key: rounds % 2 === 0 }); rounds++;
        if (rounds === 2) dev.save('mate_6pour');
      }
      dev.go(1);
    }
    ok(m.minigame_solved, 'the mate was not filled; round ' + m.round + ' state ' + m.state);
    ok(m.rounds === rounds || rounds >= m.rounds, 'rounds ' + rounds);
  } else {
    // lose: stand still until the three tumbles
    for (let i = 0; i < 1400 && m.fails === 0; i++) dev.go(1);
    ok(m.fails >= 1, 'three tumbles did not restart the run (lives ' + m.lives + ')');
    dev.save('rambla_5fail');
    ok(m.state === 'play' && m.lives === 3 && m.d < 20, 'the restart did not reset the run');
    // win: jump every ground obstacle (the gulls fly over a runner on the ground), one with the keyboard and the rest with the mouse
    let n = 0, down = false;
    for (let i = 0; i < 4000 && !m.minigame_solved; i++) {
      if (m.state === 'play') {
        const speed = m.speedNow();
        const next = m.obstacles.find((o) => !o.fly && !o.hit && o.x + o.w > m.d - 6);
        if (!m.air && !down && next && next.x - m.d - 6 < speed * 0.2 && next.x - m.d > -4) { if (n % 5 === 0) kdown(32); else mdown(); down = true; n++; if (n === 3) dev.save('rambla_6jump'); }
      }
      dev.go(1);
      if (down && !m.air) { kup(32); mup(); down = false; }
      if (i === 300) dev.save('rambla_7run');
    }
    if (down) { kup(32); mup(); }
    ok(m.minigame_solved, 'the run was not finished; d ' + Math.round(m.d) + '/' + m.len + ' lives ' + m.lives + ' state ' + m.state);
    ok(m.lives >= 1 && n >= 5, 'jumps ' + n);
  }
  dev.save(NG + '_8won');
  ok(!dev.game.stage.is_timer_started('new_minigame_tick'), 'the game loop kept running after the win');
  dev.go(500); dev.save(NG + '_9after');
  if (route) {
    dev.click(295, 340, 200); dev.go(300); dev.save(NG + '_10route');   // "Continuar" on the score, then the thanks and the statement with the clue
    for (let i = 0; i < 8 && ph.minigames_resolved === before; i++) { dev.click(273, 255, 200); if (i === 1) dev.save(NG + '_11clue'); }
    dev.go(600);
    ok(ph.minigames_resolved === before + 1, 'the witness was not counted as solved: ' + ph.minigames_resolved);
  }
  // the input still works afterwards: keys and clicks reach the game and nothing throws
  kdown(32); kup(32); mdown(); mup(); dev.key(dev.K.ESCAPE, 20); dev.click(300, 220, 20); dev.go(60);
  console.log(NG, 'solved', m.minigame_solved, 'mistakes', m.mistakes, 'fails', m.fails, 'stage', dev.stage());
};
