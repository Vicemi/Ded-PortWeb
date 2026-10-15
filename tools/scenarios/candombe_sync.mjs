// the rhythm minigame on the AUDIO clock: the notes of the chart and the audio events that the sequencer schedules must agree within a millisecond, even
// when the audio clock runs faster than the game clock, across pause / resume and a suspended audio context; the calibration keys [ and ]; and a MIDI
// file (generated here) that becomes a song with its credits
import { newGame } from './lib.mjs';
const assert = (c, msg) => { if (!c) throw new Error('candombe_sync: ' + msg); };

// ---- a tiny Standard MIDI File: 8 bars at 120 bpm, drums on channel 10, a melody on channel 1 and a bass on channel 2
const u16 = (v) => [(v >> 8) & 255, v & 255], u32 = (v) => [(v >>> 24) & 255, (v >> 16) & 255, (v >> 8) & 255, v & 255];
const vlq = (v) => { const o = [v & 127]; while ((v >>= 7)) o.unshift((v & 127) | 128); return o; };
const trk = (evs) => {
  evs.sort((a, b) => a[0] - b[0]);
  let t = 0; const d = [];
  for (const [tk, ...bytes] of evs) { d.push(...vlq(tk - t), ...bytes); t = tk; }
  d.push(0, 0xff, 0x2f, 0);
  return [...'MTrk'].map((c) => c.charCodeAt(0)).concat(u32(d.length), d);
};
const note = (evs, tick, ch, n, len, vel = 100) => { evs.push([tick, 0x90 | ch, n, vel], [tick + len, 0x80 | ch, n, 0]); };
function tinyMidi() {
  const tempo = [[0, 0xff, 0x51, 3, 0x07, 0xa1, 0x20]], drums = [], mel = [], bass = [];
  for (let bar = 0; bar < 8; bar++) {
    const b = bar * 1920;
    for (let i = 0; i < 8; i++) note(drums, b + i * 240, 9, 42, 60, 70);
    note(drums, b, 9, 36, 100); note(drums, b + 960, 9, 36, 100); note(drums, b + 480, 9, 38, 100); note(drums, b + 1440, 9, 38, 100);
    [72, 74, 76, 79].forEach((n, i) => note(mel, b + i * 480 + 240, 0, n, 200));
    note(bass, b, 1, 36, 900); note(bass, b + 960, 1, 43, 900);
  }
  const tracks = [tempo, drums, mel, bass].map(trk);
  return new Uint8Array([...'MThd'].map((c) => c.charCodeAt(0)).concat(u32(6), u16(1), u16(tracks.length), u16(480), ...tracks));
}

export default async (dev) => {
  const cand = dev.candombe, C = dev.newgames.MinigameCandombe, mixer = dev.mixer;

  // 1. the MIDI file
  const bytes = tinyMidi(), mid = C.parseMidi(bytes);
  assert(mid.ppq === 480 && mid.tempos.length === 1 && mid.notes.length === 8 * (8 + 4 + 4 + 2), 'parse: ' + mid.notes.length + ' notes');
  const song = C.songFromMidi(mid);
  const lanes = new Set(song.notes.map((n) => n.lane));
  assert([1, 2, 3].every((l) => lanes.has(l)), 'the chart uses kick, snare and melody lanes: ' + [...lanes]);
  assert(song.notes.every((n, i) => i === 0 || n.t - song.notes[i - 1].t >= 189), 'the chart keeps a minimum gap');
  assert(song.events.filter((e) => e.k === 'd' && e.v === 'kick').every((e) => Math.abs(((e.t % 1000) + 1000) % 1000) < 0.5), 'kicks on the beat (120 bpm)');
  assert(['b', 'm'].every((k) => song.events.some((e) => e.k === k)), 'bass and melody events');
  assert(Math.abs(song.endMs - 16758) < 10 && Math.abs(song.beatMs - 500) < 0.01, 'length and tempo: ' + song.endMs);
  const tr = C.registerMidi(bytes, { file: 'prueba.mid', title: 'Tema de prueba', artist: 'Artista Libre' });
  assert(tr.credit === 'Música: Tema de prueba - Artista Libre', 'credit line: ' + tr.credit);
  assert(C.musicCredits().some((l) => l.includes('Tema de prueba - Artista Libre')) && C.musicCredits()[0].includes('Vicemi Dev'), 'credits list');

  // 2. a fake audio context whose clock we control (the audio clock runs 0.3% faster than the game clock and has 40 ms of output latency)
  let fixed = null;
  const node = () => ({ gain: { value: 1, setTargetAtTime() {}, setValueAtTime() {} }, connect() {}, disconnect() {} });
  const ctx = { state: 'running', outputLatency: 0.04, get currentTime() { return fixed ?? (dev.now() * 1.003) / 1000; }, createGain: node, resume() { ctx.state = 'running'; return Promise.resolve(); } };
  const rec = [];
  let m;
  C.forceTrack = 'midi:prueba.mid';

  newGame(dev);
  const P0 = dev.mod('game/stages/phase0').Phase0Stage;
  dev.game.set_stage(new P0(dev.game, 1), true, 'p0_loading_slides_001.jpg');
  dev.go(800); dev.click(300, 400, 100); dev.go(300);
  const dm = dev.mod('game/data/datamodel'), st = dev.game.stage;
  const w = new dm.Witness('X', 'p1_witness_tamborilero.png'); w.city = { name: 'Melo' }; w.department = { name: 'Cerro Largo' };
  w.witness_statement = dev.game.datastore.user_character_progress.case.list_witness_statements[0];
  try { m = new C(st, st.phase, w); } catch (e) { if (/Cannot load image/.test(String(e.message))) { console.log('skipped: the art of the witness is pending'); return; } throw e; }
  m.show_opening_dialog(); dev.go(150);
  dev.click(278, 305, 120); dev.click(274, 255, 120); dev.click(274, 255, 120); dev.click(312, 388, 150); dev.go(30);
  assert(m.track.id === 'midi:prueba.mid', 'the MIDI song is chosen when MIDI files are installed');
  mixer.ctx = ctx; mixer.master = node();   // the fake audio goes in only for the song (the dialogs of the game play real sounds)
  C.Sequencer.sink = (e, when) => rec.push({ e, when, t0: m.run.t0 });
  rec.length = 0; m.newRun();
  assert(m.run.mode === 'audio', 'the run follows the audio clock');
  const lead = m.song.lead;

  // 3. play 8 s of the song with real key presses
  const K = [97, 115, 100, 102];
  for (let i = 0; i < 800 && m.now() < 8000; i++) {
    const now = m.now();
    for (const n of m.notes) if (n.state === 0 && n.t > now && n.t <= now + 25) { dev.key(K[n.lane], 0); break; }
    dev.go(1);
    if (i === 150) dev.save('candombe_sync_play');
  }
  assert(m.run.combo > 5, 'hits score with the audio clock (combo ' + m.run.combo + ')');
  assert(rec.length > 50, 'events were scheduled: ' + rec.length);

  // 4. the note times against the audio events: when the sound of an event is heard, the song time is the time of that event
  const check = (from) => {
    let worst = 0, n = 0;
    for (const r of rec.slice(from)) {
      assert(Math.abs((r.when - r.t0) * 1000 - lead - r.e.t) < 0.01, 'event scheduled off its time');
      fixed = r.when + 0.04;                    // the ctx time at which this event comes out of the speakers
      const d = Math.abs(m.songMs() - r.e.t);
      worst = Math.max(worst, d); n++;
    }
    fixed = null;
    return { worst, n };
  };
  let res = check(0);
  console.log(`before pause: ${res.n} events, worst error ${res.worst.toFixed(3)} ms`);
  assert(res.worst < 1, 'notes and audio agree within 1 ms: ' + res.worst);
  const drift = m.songMs() - (dev.now() - m.run.started - lead - 150);
  console.log(`audio clock vs game clock after ${(m.now() / 1000).toFixed(1)} s: ${drift.toFixed(1)} ms apart (the chart follows the audio)`);

  // 5. pause / resume shift the clock; the events after the resume are on the new anchor
  const before = m.songMs(), mark = rec.length;
  m.pause(); dev.go(40);
  assert(Math.abs(m.songMs() - before) < 0.001, 'the song stands still while paused');
  dev.key(97, 4);   // any key resumes
  assert(m.run.phase === 'play' && m.run.mode === 'audio', 'resumed on the audio clock');
  assert(Math.abs(m.songMs() - before) < 150, 'the clock was shifted by the paused time: ' + (m.songMs() - before));
  dev.go(60);
  res = check(mark);
  assert(res.n > 5 && res.worst < 1, 'after resume: ' + res.n + ' events, worst ' + res.worst);

  // 6. a suspended audio context (tab hidden / phone call) pauses the run; the next key brings it back
  ctx.state = 'suspended'; dev.go(3);
  assert(m.run.phase === 'paused', 'a suspended audio context pauses the run');
  ctx.state = 'running'; dev.key(115, 4);
  assert(m.run.phase === 'play' && m.run.mode === 'audio', 'resume after suspension');

  // 7. calibration keys: [ and ]
  cand.setOffset(0);
  fixed = ctx.currentTime; const at0 = m.songMs();
  dev.key(93, 2); dev.key(93, 2);
  assert(cand.getOffset() === 20, 'the ] key adds 10 ms: ' + cand.getOffset());
  assert(Math.abs(at0 - m.songMs() - 20) < 0.5, 'the offset moves the song clock: ' + (at0 - m.songMs()));
  dev.key(91, 2); dev.key(91, 2); dev.key(91, 2);
  assert(cand.getOffset() === -10, 'the [ key subtracts 10 ms: ' + cand.getOffset());
  fixed = null; cand.setOffset(0);

  // 8. leave: nothing keeps running
  mixer.ctx = null; mixer.master = null;
  dev.key(dev.K.ESCAPE, 40); dev.go(300);
  assert(!m.listening && !m.run.seq.bus, 'listeners and audio bus released');
  const n0 = rec.length; dev.go(40);
  assert(rec.length === n0, 'no events are scheduled after leaving');
  C.Sequencer.sink = null; C.forceTrack = null;
  console.log('candombe_sync ok');
};
