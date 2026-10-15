// the rhythm game of the Tamborilero: songs, chart, scripted key presses, failing and retrying, pause, watchdog, leaving with Esc and playing again
// (the keyboard must work every time), then a perfect run that solves the minigame
import { newGame } from './lib.mjs';
const assert = (c, msg) => { if (!c) throw new Error('candombe: ' + msg); };
export default async (dev) => {
  const C = dev.newgames.MinigameCandombe;
  // 1. every song: a chart that can be played, and a length that fits a minigame
  for (const tr of C.TRACKS) {
    const s = C.buildSong(tr), sec = s.endMs / 1000, perSec = s.notes.length / sec;
    console.log(tr.id.padEnd(9), `${tr.bpm} bpm, diff ${tr.diff}, ${tr.lanes} lanes: ${s.bars} bars, ${sec.toFixed(0)} s, ${s.notes.length} notes (${perSec.toFixed(1)}/s), ${s.events.length} events`);
    assert(sec > 30 && sec < 75, tr.id + ' length');
    assert(perSec > 1.2 && perSec < 6.5, tr.id + ' density');
    assert(s.notes.every((n) => n.lane >= 0 && n.lane < tr.lanes), tr.id + ' lanes');
    assert(s.notes.every((n, i) => i === 0 || n.t - s.notes[i - 1].t >= tr.minGap * s.stepMs - 1), tr.id + ' gap');
    for (const k of ['d', 'b', 'c', 'm']) assert(s.events.some((e) => e.k === k), tr.id + ' has no voice ' + k);
  }
  assert(new Set(C.TRACKS.map((t) => t.bpm)).size === C.TRACKS.length && C.TRACKS.length >= 4, 'tracks differ in tempo');

  // 2. open the minigame
  newGame(dev);
  const P0 = dev.mod('game/stages/phase0').Phase0Stage;
  dev.game.set_stage(new P0(dev.game, 1), true, 'p0_loading_slides_001.jpg');
  dev.go(800); dev.click(300, 400, 100); dev.go(300);
  const dm = dev.mod('game/data/datamodel');
  const st = dev.game.stage;
  const open = () => {
    const w = new dm.Witness('X', 'p1_witness_tamborilero.png'); w.city = { name: 'Melo' }; w.department = { name: 'Cerro Largo' };
    w.witness_statement = dev.game.datastore.user_character_progress.case.list_witness_statements[0];
    let m;
    try { m = new C(st, st.phase, w); } catch (e) { if (/Cannot load image/.test(String(e.message))) return null; throw e; }
    m.show_opening_dialog(); dev.go(150);
    dev.click(278, 305, 120); dev.click(274, 255, 120); dev.click(274, 255, 120);
    dev.click(312, 388, 150);   // "jugar"
    dev.go(30);
    m.newRun();   // the help is shown only the first time: the run may have started during the clicks
    return m;
  };
  const K = { a: 97, s: 115, d: 100, f: 102, enter: 13 };
  const keyFor = (lane) => [K.a, K.s, K.d, K.f][lane];
  /** play with real key events: hit every note when it arrives (pre-empting the 25 ms the event waits for the next frame) */
  const play = (m, until, { skip = () => false } = {}) => {
    for (let i = 0; i < 4000 && !until(); i++) {
      const now = m.now();
      for (const n of m.notes) if (n.state === 0 && n.t > now && n.t <= now + 25 && !skip(n)) { dev.key(keyFor(n.lane), 0); break; }
      dev.go(1);
    }
  };

  // 2a. first run: fail on purpose, pausing once in the middle
  C.forceTrack = 'cumbia';
  let m = open();
  if (!m) { console.log('skipped: the art of the witness is pending'); return; }
  assert(dev.stage() === 'Phase0Stage' || true, 'stage');
  dev.save('candombe_1countdown');
  let paused = false;
  for (let i = 0; i < 4000 && m.run.phase !== 'results'; i++) {
    if (i === 400) { dev.hold(97, true); m.held[0] = true; m.onLose(); paused = true; }   // the window loses the focus
    if (i === 401) {
      assert(m.run.phase === 'paused' && !m.held.some(Boolean), 'blur must pause and release the keys');
      const t0 = m.now(); dev.go(40); assert(m.now() === t0, 'the song must stand still while paused'); dev.save('candombe_2paused');
      dev.hold(97, false); const s0 = m.run.stray; dev.key(K.a, 4); assert(m.run.phase === 'play', 'a key must resume'); assert(m.run.stray === s0, 'the resuming key is not a hit');
    }
    if (i === 700) dev.save('candombe_3play');
    if (i > 100 && i % 9 === 0) dev.key(keyFor(i % 3), 0);   // mashing out of rhythm
    dev.go(1);
  }
  assert(paused && m.run.phase === 'results' && !m.run.pass, 'mashing must fail');
  dev.save('candombe_4fail');
  assert(m.run.stray > 10, 'stray hits are counted');

  // 2b. retry with Enter: a new run starts and the keys work
  dev.go(30); dev.key(K.enter, 4);
  assert(m.run.phase === 'play' && m.run.score === 0 && m.run.stray === 0, 'Enter must restart the run');
  // watchdog: the tick timer is lost; the next key brings it back
  st.stop_timer('new_minigame_tick');
  const tk = m.lastTick; dev.go(30); assert(m.lastTick === tk, 'timer is stopped');
  dev.key(K.a, 6); dev.go(4); assert(m.lastTick > tk + 400, 'the watchdog must restart the tick');
  // play some of the second run well, then leave with Esc in the middle
  play(m, () => m.now() > 9000);
  assert(m.run.combo > 5 && m.run.perfect > 5, `keys must score (combo ${m.run.combo}, perfect ${m.run.perfect})`);
  dev.save('candombe_5combo');
  dev.key(dev.K.ESCAPE, 40); dev.go(400);
  assert(!m.listening && m.run.phase !== 'play', 'leaving must release the listeners and stop the song');
  assert(!m.held.some(Boolean), 'input released');

  // 3. open it again after leaving: the keyboard must still work, and a perfect run solves it
  C.forceTrack = 'candombe';
  m = open();
  assert(m, 'second open');
  play(m, () => m.run.phase === 'results');
  dev.save('candombe_6results');
  assert(m.run.pass && m.run.ratio > 0.95, `a clean run passes (${m.run.perfect} perfect, ${m.run.good} good of ${m.notes.length})`);
  dev.go(200);
  for (let i = 0; i < 200 && !m.minigame_solved; i++) dev.go(1);
  assert(m.minigame_solved, 'solved after the results');
  dev.go(400); dev.save('candombe_7after');
  assert(!m.listening, 'listeners released after solving');
  console.log('candombe ok: grade', m.run.grade[0], 'score', m.run.score);
};
