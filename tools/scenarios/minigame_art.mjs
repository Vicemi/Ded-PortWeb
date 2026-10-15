// Optional art of the new minigames (src/game/minigames/mgart.ts): plays Mate, Rambla, Cartero (trivia) and Banderas (flags) first WITHOUT any mg_*.png
// (the drawing by code, nothing may be drawn from images) and then with fake images registered through assets.register_image (flat colour, right size):
// nothing may throw and the art counter must grow in every game. Also checks that a real image wins over a registered one of the same name.
import { newGame } from './lib.mjs';
const ok = (cond, msg) => { if (!cond) throw new Error(msg); };
const BX = 104, BY = 74;
// [file, w, h] as the final sizes of tools/art_brief/GEMINI_ASSETS_MINIJUEGOS.md (the sheets as tools/build_minigame_art.py writes them)
const FAKES = [
  ['mate_bg', 600, 450], ['mate_termo', 110, 330], ['mate_termo_pour', 330, 200], ['mate_gourd', 220, 260], ['mate_steam', 400, 100], ['mate_splash', 400, 100],
  ['rambla_sky', 600, 450], ['rambla_skyline', 1200, 220], ['rambla_ground', 600, 120], ['rambla_runner', 576, 128], ['rambla_runner_jump', 288, 128], ['rambla_runner_fall', 384, 96],
  ['rambla_obstacles', 410, 80], ['rambla_meta', 520, 200],
  ['cartero_bg', 600, 450], ['cartero_envelope', 300, 200], ['cartero_stamp', 220, 120], ['cartero_bag', 200, 200], ['cartero_stamps', 320, 100],
  ['banderas_bg', 600, 450], ['banderas_cardback', 90, 120], ['banderas_frame', 110, 80],
  ['candombe_bg', 600, 450], ['candombe_chico', 120, 160], ['candombe_repique', 140, 170], ['candombe_piano', 160, 200], ['candombe_palmas', 120, 160], ['candombe_crowd', 1200, 180], ['candombe_spot', 200, 400],
  ['ui_stars', 128, 64], ['ui_sparkles', 192, 48], ['ui_confetti', 192, 32],
];
export default async (dev) => {
  const pg = dev.pygame, art = dev.mgart.artStats;
  const post = (type, o) => pg.event.post({ type, ...o });
  const kdown = (k) => { pg.input.pressed.add(k); post(pg.KEYDOWN, { key: k, mod: 0, unicode: '' }); };
  const kup = (k) => { pg.input.pressed.delete(k); post(pg.KEYUP, { key: k, mod: 0, unicode: '' }); };

  newGame(dev);
  const P0 = dev.mod('game/stages/phase0').Phase0Stage;
  dev.game.set_stage(new P0(dev.game, 1), true, 'p0_loading_slides_001.jpg');
  dev.go(800); dev.click(300, 400, 100); dev.go(300);
  const dm = dev.mod('game/data/datamodel');

  /** opens a minigame class as a witness, clicks through the dialogs and starts it */
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

  // each game: plays a little; returns when done
  const games = {
    mate(m) {
      for (let r = 0; r < 3; r++) { kdown(32); dev.go(40); kup(32); dev.go(40); }   // pours (and spills: the splash)
    },
    rambla(m) {
      for (let i = 0; i < 400; i++) { if (i % 37 === 0) { kdown(32); dev.go(3); kup(32); } else dev.go(1); }   // runs, jumps and trips
    },
    trivia(m) {
      for (let i = 0; i < 3 && !m.minigame_solved; i++) {
        const q = m.questions[m.index]; if (!q) break;
        { const [x, y] = m.screenPos((q.answer + 1) % 4); dev.click(x, y, 10); }
        { const [x, y] = m.screenPos(q.answer); dev.click(x, y, 40); }
      }
    },
    candombe(m) {   // plays a few seconds with the keys (the drums squash, the glow, the crowd scrolls)
      for (let i = 0; i < 160; i++) { if (i % 10 === 0) { const k = [97, 115, 100, 102][(i / 10) % 4]; kdown(k); dev.go(1); kup(k); } dev.go(1); }
    },
    flags(m) {
      for (let i = 0; i < 60 && !m.cards; i++) dev.go(5);   // the board is dealt a moment after the game opens
      const by = {};
      for (const c of m.cards) (by[c.flag] ||= []).push(c);
      for (const list of Object.values(by)) for (let i = 0; i + 1 < list.length; i += 2) {
        for (const c of [list[i], list[i + 1]]) { const [x, y] = m.screenPos(c); dev.click(x, y, 12); }
        dev.go(10);
      }
    },
  };
  const classes = { mate: [dev.extra.MinigameMate, 'matero'], rambla: [dev.extra.MinigameRambla, 'corredora'], trivia: [dev.newgames.MinigameTrivia, 'cartero'], flags: [dev.newgames.MinigameFlags, 'maestra'], candombe: [dev.newgames.MinigameCandombe, 'tamborilero'] };
  const run = (name) => {
    const before = art.drawn, [Cls, id] = classes[name];
    const stg = dev.game.stage;
    for (let i = 0; i < 4 && (stg.locks > 0 || stg.dialogs.length > 0); i++) { dev.go(150); if (stg.locks === 0 && stg.dialogs.length > 0) dev.key(dev.K.ESCAPE, 60); }   // a clean start: no lock or dialog left by the game before
    let m;
    try { m = open(Cls, id); } catch (e) { if (/Cannot load image/.test(String(e.message))) { console.log(name, 'skipped: the art of the witness is pending'); return null; } throw e; }
    games[name](m);
    close();
    return art.drawn - before;
  };

  // 1. no art: the drawing by code, nothing from images (only checked while the real art is not published: the game now ships it)
  const REAL = dev.assets.has_image('mg_mate_bg.png');
  const none = {};
  for (const name of Object.keys(classes)) { none[name] = run(name); if (!REAL && none[name] !== null) ok(none[name] === 0, `${name}: ${none[name]} images drawn without any art`); }

  // 2. fake art for every name
  for (const [name, w, h] of FAKES) {
    if (dev.assets.has_image(`mg_${name}.png`)) continue;   // real art already in the packs: the games draw it (counted below); only the missing names get a fake
    dev.assets.register_image(`mg_${name}.png`, () => { const s = new pg.Surface([w, h], pg.SRCALPHA, 32); s.fill([200, 120, 60, 255]); return s; });
  }
  const withArt = {};
  for (const name of Object.keys(classes)) {
    withArt[name] = run(name);
    if (withArt[name] !== null) ok(withArt[name] > 0, `${name}: the art was not drawn`);
  }

  // 3. a real image wins over a registered one of the same name (the witnesses: a real p1_minigame_<id>.png must replace the drawing by code)
  const real = 'p1_minigame_flux_bricklayer_dialogue1.png', before = dev.assets.load_surface(real).get_size();
  dev.assets.register_image(real, () => new pg.Surface([5, 5], pg.SRCALPHA, 32));
  const after = dev.assets.load_surface(real).get_size();
  ok(dev.assets.has_image(real) && after[0] === before[0] && after[1] === before[1] && before[0] > 5, 'a registered image replaced a real one');

  console.log('minigame_art', JSON.stringify({ none, withArt }));
};
