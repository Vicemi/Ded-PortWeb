// @ts-nocheck
// "Ritmo de candombe": the rhythm game of the Tamborilero. A note highway (4 lanes, A S D F / arrows / mouse or touch on the drums) over a backing
// track that is written as MIDI-like note sequences and synthesised with Web Audio (the sequencer and the voices are in this file, no audio files).
// The chart is derived from the percussion and the melody of the track. All the songs are original; the rhythms are the traditional patterns of the
// genres (public domain).
// Robustness: the game clock drives everything (the audio is scheduled ahead from it), the input state is released on blur / hide / end / restart,
// the listeners and the audio bus are released whenever the minigame stops, and a watchdog restarts a tick timer that was lost.
import { ItemEvent, ItemImage, pygame } from '../../runtime/prelude';
import * as assets from '../../engine/assets';
import { mixer } from '../../engine/sounds';
import { download } from '../../engine/net';
import { src as artSrc, scaled, put, artStats, aspect, note } from './mgart';
import { assets_base } from '../../engine/assets';

const BX = 104, BY = 74, BW = 335, BH = 272;   // the inside of the board of the minigames
const TOP = 44, HIT_Y = 190;                    // the highway: top of the perspective and the line where the notes are hit
const TRAVEL = 1700;                            // ms a note takes from the top to the line
const PERFECT = 65, GOOD = 130, MISS = 130;     // timing windows (ms)
const PASS_RATIO = 0.7;                         // hits needed to tune the drums

// ================================================================================================================================ the songs
type Pat = Record<string, string>;
interface Section { ch: string; mel?: string; dr: string; bass?: string; comp?: string }
interface Track {
  id: string; name: string; style: string; bpm: number; diff: 1 | 2 | 3; lanes: 3 | 4; minGap: number;
  lv: [string, string, string];                       // the voices of the percussion that the lanes 0..2 follow (lane 3 follows the melody)
  mel: string; bassT: string; compT: string; bassLen: number; compLen: number;
  dr: Record<string, Pat>; bass: Record<string, string>; comp: Record<string, string>;
  sec: Record<string, Section>; form: string[];
  build?: () => Song; credit?: string;                 // a track that is not made of patterns (a MIDI file) builds its own song
}

// the patterns have 16 steps (sixteenth notes) per bar
const CAND_DR: Record<string, Pat> = {
  lite: { chico: 'x.xxx.xxx.xxx.xx', piano: 'X..x..x...x.x...' },
  main: { chico: 'x.xxx.xxx.xxx.xx', piano: 'X..x..x...x.x...', repique: '..x...x...x.x..X' },
};
const TRACKS: Track[] = [
  {
    id: 'candombe', name: 'Candombe de Barrio', style: 'Cuerda de tambores y flauta', bpm: 108, diff: 1, lanes: 3, minGap: 3,
    lv: ['chico', 'repique', 'piano'], mel: 'flute', bassT: 'bass', compT: 'pluck', bassLen: 2, compLen: 2,
    dr: CAND_DR, bass: { a: 'r..r..5.r..r..5.' }, comp: { a: '..x...x...x...x.' },
    sec: {
      I: { ch: 'Am Am Dm E7', dr: 'lite' },
      A: { ch: 'Am Dm E7 Am', dr: 'main', bass: 'a', comp: 'a', mel: '0:E5:3 4:C5:2 6:D5:2 8:E5:4|0:F5:3 4:D5:2 6:E5:2 8:F5:4|0:E5:2 3:G#4:2 6:B4:2 8:E5:4 12:D5:2|0:C5:6 8:A4:8' },
      B: { ch: 'F Dm E7 Am', dr: 'main', bass: 'a', comp: 'a', mel: '0:A5:2 2:G5:2 4:F5:4 8:A5:4|0:F5:2 2:E5:2 4:D5:4 8:F5:4|0:E5:3 4:G#5:2 6:B5:2 8:E6:6|0:C6:4 4:A5:4 8:A5:8' },
    },
    form: ['I', 'A', 'A', 'B', 'A', 'B'],
  },
  {
    id: 'milonga', name: 'Milonga del Puerto', style: 'Milonga con bandoneón', bpm: 92, diff: 1, lanes: 3, minGap: 3,
    lv: ['chico', 'repique', 'piano'], mel: 'accordion', bassT: 'bass', compT: 'pluck', bassLen: 3, compLen: 1,
    dr: {
      lite: { piano: 'X..x..x.x..x..x.', chico: 'x.x.x.x.x.x.x.x.' },
      main: { piano: 'X..x..x.x..x..x.', chico: 'x.x.x.x.x.x.x.x.', repique: '....X.......X...' },
    },
    bass: { a: 'r..5..r.5..r..5.' }, comp: { a: 'x..x..x.x..x..x.' },
    sec: {
      I: { ch: 'Dm Dm A7 A7', dr: 'lite' },
      A: { ch: 'Dm Gm A7 Dm', dr: 'main', bass: 'a', comp: 'a', mel: '0:A4:4 4:D5:4 8:F5:4 12:E5:2 14:D5:2|0:Bb4:4 4:D5:4 8:G5:4 12:F5:4|0:E5:4 4:C#5:4 8:A4:4 12:C#5:4|0:D5:8 8:A4:8' },
      B: { ch: 'F C A7 Dm', dr: 'main', bass: 'a', comp: 'a', mel: '0:C6:4 4:A5:4 8:F5:4 12:A5:4|0:G5:4 4:E5:4 8:C5:4 12:E5:4|0:E5:2 2:F5:2 4:G5:4 8:A5:4 12:C#6:4|0:D6:8 8:A5:4 12:F5:4' },
    },
    form: ['I', 'A', 'B', 'A', 'B'],
  },
  {
    id: 'cumbia', name: 'Cumbia del Sábado', style: 'Cumbia con acordeón', bpm: 98, diff: 2, lanes: 4, minGap: 2,
    lv: ['hat', 'snare', 'kick'], mel: 'accordion', bassT: 'bass', compT: 'pluck', bassLen: 2, compLen: 1,
    dr: {
      lite: { kick: 'X.......x.x.....', hat: 'x.xxx.xxx.xxx.xx' },
      main: { kick: 'X.......x.x.....', hat: 'x.xxx.xxx.xxx.xx', snare: '....X.......X...', cow: 'x...x...x...x...' },
    },
    bass: { a: 'r..r..5.....r.5.' }, comp: { a: '.x..x..x.x..x...' },
    sec: {
      I: { ch: 'G Em C D', dr: 'lite' },
      A: { ch: 'G Em C D', dr: 'main', bass: 'a', comp: 'a', mel: '0:B5:2 2:D6:2 4:B5:2 6:G5:2 8:A5:4 12:B5:4|0:G5:2 2:B5:2 4:E5:6 12:G5:2 14:E5:2|0:E5:2 2:G5:2 4:C6:4 8:B5:2 10:A5:2 12:G5:4|0:A5:4 4:F#5:2 6:A5:2 8:D6:8' },
      B: { ch: 'C G D G', dr: 'main', bass: 'a', comp: 'a', mel: '0:E6:4 4:D6:2 6:C6:2 8:B5:4 12:G5:4|0:G5:2 2:B5:2 4:D6:4 8:B5:4 12:G5:4|0:A5:4 4:C6:4 8:F#5:4 12:A5:4|0:G5:2 2:B5:2 4:D6:2 6:G6:10' },
    },
    form: ['I', 'A', 'B', 'A', 'B'],
  },
  {
    id: 'rock', name: 'Rock del Río', style: 'Rock rioplatense', bpm: 128, diff: 2, lanes: 4, minGap: 2,
    lv: ['hat', 'snare', 'kick'], mel: 'lead', bassT: 'bass', compT: 'dist', bassLen: 2, compLen: 2,
    dr: {
      lite: { kick: 'X.......x.x.....', hat: 'x.x.x.x.x.x.x.x.' },
      main: { kick: 'X.......x.x.....', hat: 'X.x.x.x.X.x.x.x.', snare: '....X.......X...' },
    },
    bass: { a: 'r.r.r.r.r.r.r.r.' }, comp: { a: 'X.xx.xx.X.xx.x..' },
    sec: {
      I: { ch: 'Em Em C D', dr: 'lite' },
      A: { ch: 'Em C G D', dr: 'main', bass: 'a', comp: 'a', mel: '0:B4:2 2:E5:2 4:G5:4 8:F#5:2 10:E5:2 12:D5:4|0:E5:2 2:G5:2 4:C6:4 8:B5:2 10:G5:2 12:E5:4|0:D5:2 2:G5:2 4:B5:4 8:A5:2 10:G5:2 12:D5:4|0:F#5:2 2:A5:2 4:D6:6 12:A5:4' },
      B: { ch: 'C D Em B7', dr: 'main', bass: 'a', comp: 'a', mel: '0:G5:4 4:E5:2 6:G5:2 8:C6:8|0:A5:4 4:F#5:2 6:A5:2 8:D6:8|0:B5:2 2:G5:2 4:E5:4 8:G5:2 10:B5:2 12:E6:4|0:D#6:2 2:F#5:2 4:B5:4 8:A5:2 10:F#5:2 12:B4:4' },
    },
    form: ['I', 'A', 'A', 'B', 'A', 'B'],
  },
  {
    id: 'murga', name: 'Murga Sinfónica', style: 'Bombo, platillo y bronces', bpm: 144, diff: 3, lanes: 4, minGap: 2,
    lv: ['plat', 'redo', 'bombo'], mel: 'brass', bassT: 'bass', compT: 'brass', bassLen: 2, compLen: 2,
    dr: {
      lite: { bombo: 'X..x..x.x..x..x.', redo: '..x...x...x.x.xx' },
      main: { bombo: 'X..x..x.x..x..x.', redo: '..x...x...x.x.xx', plat: 'X...x...X...x...' },
    },
    bass: { a: 'r..r..r.5..r..r.' }, comp: { a: 'x..x..x.x..x..x.' },
    sec: {
      I: { ch: 'Am Am F E7', dr: 'lite' },
      A: { ch: 'Am F G E7', dr: 'main', bass: 'a', comp: 'a', mel: '0:A4:2 2:C5:2 4:E5:4 8:A5:4 12:G5:2 14:E5:2|0:F5:2 2:A5:2 4:C6:4 8:A5:4 12:F5:4|0:D5:2 2:G5:2 4:B5:4 8:D6:4 12:B5:4|0:E5:2 2:G#5:2 4:B5:4 8:E6:2 10:D6:2 12:B5:4' },
      B: { ch: 'F G Am E7', dr: 'main', bass: 'a', comp: 'a', mel: '0:C6:4 4:A5:2 6:C6:2 8:F6:8|0:D6:4 4:B5:2 6:D6:2 8:G6:8|0:E6:2 2:C6:2 4:A5:4 8:C6:2 10:E6:2 12:A6:4|0:G#5:2 2:B5:2 4:E6:4 8:D6:2 10:B5:2 12:G#5:4' },
    },
    form: ['I', 'A', 'A', 'B', 'A', 'B'],
  },
];

const SEMI: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const noteMidi = (n: string): number => { const m = /^([A-G])([#b]?)(\d)$/.exec(n); return 12 * (Number(m[3]) + 1) + SEMI[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0); };
const chordOf = (c: string) => {
  const m = /^([A-G][#b]?)(m7|m|7)?$/.exec(c);
  const root = SEMI[m[1][0]] + (m[1][1] === '#' ? 1 : m[1][1] === 'b' ? -1 : 0), q = m[2] || '';
  const minor = q === 'm' || q === 'm7';
  return { root, third: minor ? 3 : 4, tones: [0, minor ? 3 : 4, 7, ...(q === '7' ? [10] : q === 'm7' ? [10] : [])] };
};

interface Ev { t: number; k: 'd' | 'b' | 'c' | 'm'; v?: string; vel: number; n?: number[]; len?: number }
interface Song { events: Ev[]; notes: any[]; endMs: number; barMs: number; beatMs: number; stepMs: number; lead: number; bars: number }

/** the track as a list of timed events (for the sequencer) and the chart (what the player must hit). Pure: it can be tested without audio. */
export function buildSong(tr: Track): Song {
  if (tr.build) return tr.build();
  const stepMs = 60000 / tr.bpm / 4, beatMs = stepMs * 4, barMs = stepMs * 16, lead = beatMs * 4;
  const events: Ev[] = [];
  for (let i = 0; i < 4; i++) events.push({ t: -lead + i * beatMs, k: 'd', v: 'clave', vel: i === 0 ? 1 : 0.7 });   // the count-in
  const cands: { lane: number; pri: number }[][] = [];
  let bar = 0;
  for (const sid of tr.form) {
    const sec = tr.sec[sid], chords = sec.ch.split(' '), dr = tr.dr[sec.dr], mel = sec.mel ? sec.mel.split('|') : [];
    for (let b = 0; b < 4; b++, bar++) {
      const t0 = bar * barMs, ch = chordOf(chords[b]);
      for (const voice of Object.keys(dr)) {
        const pat = dr[voice], lane = tr.lv.indexOf(voice);
        for (let s = 0; s < 16; s++) {
          if (pat[s] === '.') continue;
          const acc = pat[s] === 'X';
          events.push({ t: t0 + s * stepMs, k: 'd', v: voice, vel: acc ? 1 : 0.7 });
          if (lane >= 0) (cands[bar * 16 + s] ||= []).push({ lane, pri: (lane === 2 ? 3 : lane === 1 ? 2 : 1) + (s % 4 === 0 ? 1 : 0) + (acc ? 1 : 0) });
        }
      }
      if (sec.bass) {
        const pat = tr.bass[sec.bass];
        for (let s = 0; s < 16; s++) {
          const c = pat[s]; if (c === '.') continue;
          const off = c === 'r' ? 0 : c === '5' ? 7 : c === '8' ? 12 : ch.third;
          events.push({ t: t0 + s * stepMs, k: 'b', vel: 0.9, n: [36 + ch.root + off], len: stepMs * tr.bassLen });
        }
      }
      if (sec.comp) {
        const pat = tr.comp[sec.comp];
        for (let s = 0; s < 16; s++) if (pat[s] !== '.') events.push({ t: t0 + s * stepMs, k: 'c', vel: pat[s] === 'X' ? 1 : 0.75, n: ch.tones.map((x) => 48 + ch.root + x), len: stepMs * tr.compLen });
      }
      if (mel[b]) {
        for (const tok of mel[b].split(' ')) {
          const [s, n, l] = tok.split(':'), step = Number(s);
          events.push({ t: t0 + step * stepMs, k: 'm', vel: 0.9, n: [noteMidi(n)], len: stepMs * Number(l) });
          if (tr.lanes === 4 && Number(l) >= 2) (cands[bar * 16 + step] ||= []).push({ lane: 3, pri: 2 + (step % 4 === 0 ? 1 : 0) });
        }
      }
    }
  }
  // the chart: at each step the strongest hit of the percussion / melody, with a minimum gap so that it stays playable
  const notes: any[] = [];
  let last: any = null, lastStep = -99;
  for (let st = 0; st < cands.length; st++) {
    const c = cands[st]; if (!c) continue;
    const best = c.reduce((a, b) => (b.pri > a.pri ? b : a));
    if (st - lastStep >= tr.minGap) { last = { t: st * stepMs, lane: best.lane, pri: best.pri, state: 0 }; notes.push(last); lastStep = st; }
    else if (last && best.pri > last.pri) { last.lane = best.lane; last.pri = best.pri; }
  }
  events.sort((a, b) => a.t - b.t);
  return { events, notes, endMs: bar * barMs + 600, barMs, beatMs, stepMs, lead, bars: bar };
}

// ================================================================================================================================ the voices
const TIMBRES: Record<string, any> = {
  bass: { t: 'triangle', cut: 700, a: 0.005, r: 0.1, g: 0.55 },
  pluck: { t: 'triangle', cut: 2400, a: 0.003, r: 0.18, g: 0.2 },
  flute: { t: 'sine', cut: 3200, a: 0.04, r: 0.12, g: 0.34, vib: 5.5 },
  accordion: { t: 'sawtooth', cut: 2200, a: 0.03, r: 0.1, g: 0.14, det: 8 },
  lead: { t: 'square', cut: 3000, a: 0.01, r: 0.08, g: 0.12, det: 6 },
  dist: { t: 'sawtooth', cut: 1700, a: 0.004, r: 0.08, g: 0.1, det: 10 },
  brass: { t: 'sawtooth', cut: 2300, a: 0.035, r: 0.08, g: 0.13, det: 4 },
};
let noiseBuf: AudioBuffer | null = null, noiseCtx: any = null;
function noise(ctx: any): AudioBuffer {
  if (noiseBuf && noiseCtx === ctx) return noiseBuf;
  const n = ctx.sampleRate, b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  noiseBuf = b; noiseCtx = ctx; return b;
}
function tone(ctx: any, out: any, when: number, midi: number, dur: number, name: string, vel: number): void {
  const T = TIMBRES[name], f = 440 * Math.pow(2, (midi - 69) / 12), g = ctx.createGain(), lp = ctx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = T.cut;
  const peak = T.g * vel, end = when + dur;
  g.gain.setValueAtTime(0.0001, when);
  g.gain.linearRampToValueAtTime(peak, when + T.a);
  g.gain.setValueAtTime(peak, Math.max(when + T.a, end));
  g.gain.exponentialRampToValueAtTime(0.0001, end + T.r);
  lp.connect(g); g.connect(out);
  const oscs: any[] = [];
  for (let i = 0; i < (T.det ? 2 : 1); i++) {
    const o = ctx.createOscillator(); o.type = T.t; o.frequency.value = f; if (T.det) o.detune.value = i ? T.det : -T.det;
    o.connect(lp); o.start(when); o.stop(end + T.r + 0.03); oscs.push(o);
  }
  if (T.vib) {   // a slow vibrato that fades in
    const l = ctx.createOscillator(), lg = ctx.createGain();
    l.frequency.value = T.vib; lg.gain.setValueAtTime(0, when); lg.gain.linearRampToValueAtTime(f * 0.006, when + 0.25);
    l.connect(lg); lg.connect(oscs[0].frequency); l.start(when); l.stop(end + T.r + 0.03);
  }
}
const DRUM_PITCH: Record<string, [number, number, number, number]> = {   // [f0, f1, length, noise]
  chico: [420, 300, 0.14, 0.35], repique: [260, 190, 0.22, 0.28], piano: [150, 85, 0.38, 0.18],
  kick: [130, 45, 0.2, 0.05], bombo: [95, 50, 0.4, 0.1], palmas: [900, 700, 0.05, 0.6],
};
function perc(ctx: any, out: any, when: number, voice: string, vel: number): void {
  const p = DRUM_PITCH[voice];
  if (p) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(p[0], when); o.frequency.exponentialRampToValueAtTime(p[1], when + p[2]);
    g.gain.setValueAtTime(0.75 * vel * (voice === 'kick' || voice === 'bombo' ? 1.4 : 1), when); g.gain.exponentialRampToValueAtTime(0.001, when + p[2]);
    o.connect(g); g.connect(out); o.start(when); o.stop(when + p[2] + 0.02);
    if (p[3] > 0.1) burst(ctx, out, when, 0.05, p[3] * vel, voice === 'palmas' ? 1800 : 600, 'bandpass');
    return;
  }
  if (voice === 'snare' || voice === 'redo') { burst(ctx, out, when, 0.16, 0.5 * vel, 1500, 'highpass'); tone2(ctx, out, when, 190, 0.07, 0.3 * vel); }
  else if (voice === 'hat') burst(ctx, out, when, 0.05, 0.22 * vel, 7000, 'highpass');
  else if (voice === 'plat') burst(ctx, out, when, 0.45, 0.28 * vel, 5000, 'highpass');
  else if (voice === 'cow') { tone2(ctx, out, when, 560, 0.12, 0.18 * vel, 'square'); tone2(ctx, out, when, 840, 0.1, 0.12 * vel, 'square'); }
  else if (voice === 'clave') tone2(ctx, out, when, 1700, 0.05, 0.35 * vel);
}
function burst(ctx: any, out: any, when: number, len: number, vol: number, freq: number, type: string): void {
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = noise(ctx); f.type = type; f.frequency.value = freq;
  g.gain.setValueAtTime(vol, when); g.gain.exponentialRampToValueAtTime(0.001, when + len);
  s.connect(f); f.connect(g); g.connect(out); s.start(when, Math.random() * 0.8); s.stop(when + len + 0.02);
}
function tone2(ctx: any, out: any, when: number, freq: number, len: number, vol: number, type = 'sine'): void {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.value = freq; g.gain.setValueAtTime(vol, when); g.gain.exponentialRampToValueAtTime(0.001, when + len);
  o.connect(g); g.connect(out); o.start(when); o.stop(when + len + 0.02);
}

/** schedules the events of a song a little ahead of the game clock (audio is only touched through here, so one try/catch can silence it) */
export class Sequencer {
  idx = 0; bus: any = null; broken = false;
  /** audio mode: the audio-clock time of song time -lead. Events are scheduled at anchor + (t + lead) / 1000 (absolute: no drift against the game clock). null: relative to the game clock */
  anchor: number | null = null;
  /** tests record the scheduled events here instead of synthesising them */
  static sink: ((e: Ev, when: number) => void) | null = null;
  constructor(private song: Song, private tr: Track) {}
  private ensureBus(): any {
    const ctx = mixer.ctx, master = mixer.master;
    if (!ctx || !master) return null;
    if (!this.bus) { this.bus = ctx.createGain(); this.bus.gain.value = 0.45; this.bus.connect(master); }
    return ctx;
  }
  seek(ms: number): void { const ev = this.song.events; this.idx = 0; while (this.idx < ev.length && ev[this.idx].t < ms - 30) this.idx++; }
  pump(ms: number): void {
    if (this.broken) return;
    const ev = this.song.events, horizon = ms + 350;
    try {
      const ctx = this.ensureBus();
      if (!ctx || ctx.state !== 'running') {   // nothing to play (no audio yet, or suspended): do not pile the notes up for later
        if (ctx && ctx.state === 'suspended') void ctx.resume().catch(() => undefined);
        while (this.idx < ev.length && ev[this.idx].t < ms) this.idx++;
        return;
      }
      while (this.idx < ev.length && ev[this.idx].t < horizon) {
        const e = ev[this.idx++], now = ctx.currentTime;
        const when = this.anchor !== null ? this.anchor + (e.t + this.song.lead) / 1000 : now + (e.t - ms) / 1000;
        if (when < now - 0.1) continue;   // too late to be useful
        if (Sequencer.sink) { Sequencer.sink(e, when); continue; }
        const w = Math.max(when, now);
        if (e.k === 'd') perc(ctx, this.bus, w, e.v, e.vel);
        else if (e.k === 'b') tone(ctx, this.bus, w, e.n[0], e.len / 1000, this.tr.bassT, e.vel);
        else if (e.k === 'c') for (const n of e.n) tone(ctx, this.bus, w, n, e.len / 1000, this.tr.compT, e.vel * 0.8);
        else tone(ctx, this.bus, w, e.n[0], e.len / 1000, this.tr.mel, e.vel);
      }
    } catch (er) { this.broken = true; console.error('candombe audio off:', er); }
  }
  /** fades the music out and lets go of the bus */
  stop(): void {
    const bus = this.bus; this.bus = null;
    if (!bus) return;
    try { bus.gain.setTargetAtTime(0, mixer.ctx.currentTime, 0.03); setTimeout(() => { try { bus.disconnect(); } catch { /* gone */ } }, 500); } catch { /* gone */ }
  }
}

/** the sound of a drum that the player hits */
function playerHit(lane: number, lanes: number): void {
  const ctx = mixer.ctx, master = mixer.master;
  if (!ctx || !master || ctx.state !== 'running' || Sequencer.sink) return;
  try { perc(ctx, master, ctx.currentTime, ['chico', 'repique', 'piano', 'palmas'][lane], 0.9); } catch { /* silent */ }
}

// ================================================================================================================================ MIDI files
// Standard MIDI Files (format 0 / 1, PPQ timing) put in public/assets/music/ and listed in credits.json become songs: the drum channel (10) or the most
// active melody track gives the chart, and the notes are played with the same voices as the built-in songs. See tools/art_brief/MUSICA_MIDI.md.
export interface MidiNote { tick: number; end: number; n: number; ch: number; vel: number; trk: number }
export interface MidiFile { ppq: number; tempos: { tick: number; us: number }[]; notes: MidiNote[] }
export function parseMidi(b: Uint8Array): MidiFile {
  let p = 0;
  const u32 = (): number => ((b[p++] << 24) | (b[p++] << 16) | (b[p++] << 8) | b[p++]) >>> 0, u16 = (): number => (b[p++] << 8) | b[p++];
  const tag = (): string => String.fromCharCode(b[p++], b[p++], b[p++], b[p++]);
  const vlq = (): number => { let v = 0, c: number; do { if (p >= b.length) throw new Error('MIDI cut short'); c = b[p++]; v = (v << 7) | (c & 127); } while (c & 128); return v; };
  if (b.length < 14 || tag() !== 'MThd') throw new Error('not a MIDI file');
  const hl = u32(); u16(); const ntr = u16(), div = u16();
  if (div & 0x8000) throw new Error('MIDI with SMPTE timing is not supported');
  p = 8 + hl;
  const tempos: { tick: number; us: number }[] = [], notes: MidiNote[] = [];
  for (let t = 0; t < ntr && p + 8 <= b.length; t++) {
    const id = tag(), len = u32(), end = Math.min(b.length, p + len);
    if (id !== 'MTrk') { p = end; continue; }
    let tick = 0, run = 0;
    const open = new Map<number, { tick: number; vel: number }>();
    const close = (ch: number, n: number): void => { const o = open.get(ch * 128 + n); if (o) { notes.push({ tick: o.tick, end: tick, n, ch, vel: o.vel, trk: t }); open.delete(ch * 128 + n); } };
    while (p < end) {
      tick += vlq();
      let st = b[p];
      if (st < 0x80) st = run; else { p++; if (st < 0xf0) run = st; }
      if (st === 0xff) { const type = b[p++], l = vlq(); if (type === 0x51 && l === 3) tempos.push({ tick, us: (b[p] << 16) | (b[p + 1] << 8) | b[p + 2] }); p += l; }
      else if (st === 0xf0 || st === 0xf7) p += vlq();
      else {
        const hi = st & 0xf0, ch = st & 15;
        if (hi === 0xc0 || hi === 0xd0) p += 1;
        else {
          const d1 = b[p++], d2 = b[p++];
          if (hi === 0x90 && d2 > 0) { close(ch, d1); open.set(ch * 128 + d1, { tick, vel: d2 }); }
          else if (hi === 0x80 || hi === 0x90) close(ch, d1);
        }
      }
    }
    for (const k of [...open.keys()]) close(k >> 7, k & 127);
    p = end;
  }
  tempos.sort((a, c) => a.tick - c.tick);
  return { ppq: div || 480, tempos, notes };
}
const GM_DRUM: Record<number, string> = { 35: 'kick', 36: 'kick', 37: 'clave', 38: 'snare', 39: 'palmas', 40: 'snare', 41: 'piano', 43: 'piano', 45: 'piano', 47: 'repique', 48: 'repique', 50: 'chico', 56: 'cow', 54: 'cow' };
const drumVoice = (n: number): string => GM_DRUM[n] || (n === 42 || n === 44 || n === 46 ? 'hat' : [49, 51, 52, 53, 55, 57, 59].includes(n) ? 'plat' : n >= 60 && n <= 77 ? 'clave' : 'hat');
const VOICE_LANE: Record<string, [number, number]> = { hat: [0, 1], plat: [0, 1], cow: [0, 1], clave: [0, 1], palmas: [0, 1], snare: [1, 3], redo: [1, 3], repique: [1, 3], kick: [2, 4], bombo: [2, 4], piano: [2, 4], chico: [0, 1] };   // [lane, priority]
const MAX_MIDI_MS = 150000, MIDI_GAP = 190;

/** the song (events + chart) of a MIDI file */
export function songFromMidi(m: MidiFile): Song {
  // ticks -> ms with the tempo map
  const seg: { tick: number; ms: number; us: number }[] = [{ tick: 0, ms: 0, us: 500000 }];
  for (const t of m.tempos) {
    const last = seg[seg.length - 1];
    if (t.tick === last.tick) last.us = t.us;
    else seg.push({ tick: t.tick, ms: last.ms + ((t.tick - last.tick) * last.us) / m.ppq / 1000, us: t.us });
  }
  const toMs = (tick: number): number => { let i = seg.length - 1; while (i > 0 && seg[i].tick > tick) i--; return seg[i].ms + ((tick - seg[i].tick) * seg[i].us) / m.ppq / 1000; };
  const beatMs = Math.max(250, Math.min(1000, seg[0].us / 1000));
  const lead = beatMs * 4 > 3200 ? 3200 : beatMs * 4 < 1600 ? 1600 : beatMs * 4;
  const all = m.notes.map((n) => ({ ...n, t: toMs(n.tick), len: Math.max(60, toMs(n.end) - toMs(n.tick)) })).sort((a, c) => a.t - c.t);
  if (!all.length) throw new Error('MIDI without notes');
  const shift = Math.max(0, all[0].t - 1200);
  const drums = all.filter((n) => n.ch === 9), pitched = all.filter((n) => n.ch !== 9);
  // roles of the pitched parts: bass = the lowest part, melody = the busiest of the others, the rest accompanies
  const groups = new Map<number, any[]>();
  for (const n of pitched) { const k = n.trk * 16 + n.ch; (groups.get(k) || groups.set(k, []).get(k)).push(n); }
  const parts = [...groups.values()].map((ns) => ({ ns, avg: ns.reduce((a, n) => a + n.n, 0) / ns.length }));
  const bass = parts.filter((p) => p.ns.length >= 8 && p.avg < 55).sort((a, c) => a.avg - c.avg)[0];
  const rest = parts.filter((p) => p !== bass);
  const mel = rest.slice().sort((a, c) => c.ns.length - a.ns.length)[0];
  const events: Ev[] = [];
  const spacing = lead / 4;
  for (let i = 0; i < 4; i++) events.push({ t: -lead + i * spacing, k: 'd', v: 'clave', vel: i === 0 ? 1 : 0.7 });
  const cands: { t: number; lane: number; pri: number }[] = [];
  for (const n of drums) {
    const v = drumVoice(n.n), t = n.t - shift; if (t > MAX_MIDI_MS) break;
    const vel = Math.min(1, 0.4 + n.vel / 200);
    events.push({ t, k: 'd', v, vel });
    const [lane, pri] = VOICE_LANE[v] || [0, 1];
    cands.push({ t, lane, pri: pri + (n.vel > 100 ? 1 : 0) });
  }
  const put = (p: any, kind: 'b' | 'm' | 'c', gain: number): void => {
    for (const n of p.ns) { const t = n.t - shift; if (t > MAX_MIDI_MS) break; events.push({ t, k: kind, vel: Math.min(1, (0.4 + n.vel / 200) * gain), n: [n.n], len: Math.min(n.len, 1500) }); }
  };
  if (bass) put(bass, 'b', 0.9);
  if (mel) put(mel, 'm', 0.9);
  let comp = 0;
  for (const p of rest) if (p !== mel) for (const n of p.ns) { const t = n.t - shift; if (t > MAX_MIDI_MS || comp++ > 4000) break; events.push({ t, k: 'c', vel: Math.min(1, (0.4 + n.vel / 200) * 0.6), n: [n.n], len: Math.min(n.len, 900) }); }
  // the chart: the drum channel (lanes 0..2 by role) plus the melody on lane 3; without drums the melody alone, split by pitch into the 4 lanes
  if (mel) {
    const melNs = mel.ns.filter((n) => n.t - shift <= MAX_MIDI_MS);
    if (drums.length) { for (const n of melNs) if (n.len >= 150) cands.push({ t: n.t - shift, lane: 3, pri: 2 }); }   // melody: above the hi-hat, below snare and kick
    else {
      const sorted = melNs.map((n) => n.n).sort((a, c) => a - c);
      const cut = [1, 2, 3].map((i) => sorted[Math.floor((sorted.length * i) / 4)]);
      for (const n of melNs) cands.push({ t: n.t - shift, lane: n.n < cut[0] ? 0 : n.n < cut[1] ? 1 : n.n < cut[2] ? 2 : 3, pri: 2 + (n.len >= 300 ? 1 : 0) });
    }
  }
  cands.sort((a, c) => a.t - c.t);
  const notes: any[] = [];
  let last: any = null;
  for (const c of cands) {
    if (last && c.t - last.t < MIDI_GAP) { if (c.pri > last.pri) { last.lane = c.lane; last.pri = c.pri; } continue; }   // too close: the stronger of the two stays
    last = { t: c.t, lane: c.lane, pri: c.pri, state: 0 }; notes.push(last);
  }
  if (!notes.length) throw new Error('MIDI without a chart');
  events.sort((a, c) => a.t - c.t);
  const endMs = Math.min(MAX_MIDI_MS, Math.max(events[events.length - 1].t + (events[events.length - 1].len || 0), notes[notes.length - 1].t) + 800);
  return { events: events.filter((e) => e.t <= endMs), notes, endMs, barMs: beatMs * 4, beatMs, stepMs: beatMs / 4, lead, bars: Math.round(endMs / (beatMs * 4)) };
}

interface MidiMeta { file?: string; title?: string; artist?: string; note?: string }
const midiTracks: Track[] = [];
let midiState = 0;   // 0 not asked, 1 loading, 2 done
/** adds a song from the bytes of a MIDI file (the library loader and the tests use it) */
export function registerMidi(bytes: Uint8Array, meta: MidiMeta): Track {
  const mid = parseMidi(bytes), first = songFromMidi(mid), title = String(meta.title || meta.file || 'Tema'), artist = String(meta.artist || '');
  const tr: Track = {
    id: 'midi:' + (meta.file || title), name: title, style: '', bpm: Math.round(60000 / first.beatMs), diff: 2, lanes: 4, minGap: 1, lv: ['hat', 'snare', 'kick'],
    mel: 'lead', bassT: 'bass', compT: 'pluck', bassLen: 2, compLen: 2, dr: {}, bass: {}, comp: {}, sec: {}, form: [],
    build: () => songFromMidi(mid), credit: 'Música: ' + title + (artist ? ' - ' + artist : '') + (meta.note ? ' (' + meta.note + ')' : ''),
  };
  midiTracks.push(tr);
  return tr;
}
/** loads public/assets/music/credits.json and the .mid files it lists, once (nothing happens when the folder does not exist) */
export function preloadMidi(): void {
  if (midiState !== 0) return;
  const base = assets_base();
  if (!base) return;   // the assets are not up yet: try again later
  midiState = 1;
  void (async () => {
    try {
      const list = JSON.parse(new TextDecoder().decode(await download(base + '/music/credits.json')));
      for (const meta of Array.isArray(list) ? list : []) {
        const file = String(meta && meta.file);
        if (!/^[\w.\- ]+\.midi?$/i.test(file) || file.includes('..')) continue;
        try { registerMidi(await download(base + '/music/' + encodeURIComponent(file)), { ...meta, file }); } catch (e) { console.warn('candombe: ' + file + ' skipped:', (e as Error).message); }
      }
    } catch { /* no music folder: the built-in songs are used */ }
    midiState = 2;
  })();
}
/** the lines for the credits of the game: the built-in songs and every MIDI file in use */
export function musicCredits(): string[] {
  return ['Música del minijuego «Ritmo de candombe»: composiciones originales de Vicemi Dev (' + TRACKS.map((t) => t.name).join(', ') + ').', ...midiTracks.map((t) => t.credit as string)];
}
const creditOf = (tr: Track): string => tr.credit || 'Música original de Vicemi Dev (estilo ' + tr.style.toLowerCase() + ')';

// ================================================================================================================================ the clock
// The chart is driven by the audio clock: the song time is "the time of the sound that is coming out of the speakers now" minus a calibration.
// The notes of the song are scheduled on that same clock, so the music and the notes cannot drift apart however irregular the frames are.
const DEFAULT_OFFSET_MS = 0;               // constant part of the calibration (sound that the output latency does not report)
const OFFSET_KEY = 'ded.candombe.offset';  // the part the player adjusts with [ and ]
let userOffset: number | null = null;
export function getOffset(): number {
  if (userOffset === null) {
    userOffset = 0;
    try { const v = Number(localStorage.getItem(OFFSET_KEY)); if (Number.isFinite(v)) userOffset = Math.max(-300, Math.min(300, Math.round(v))); } catch { /* no storage */ }
  }
  return userOffset;
}
export function setOffset(v: number): void {
  userOffset = Math.max(-300, Math.min(300, Math.round(v)));
  try { localStorage.setItem(OFFSET_KEY, String(userOffset)); } catch { /* no storage */ }
}
/** the audio-clock time (s) of the sound that is being heard now: getOutputTimestamp when the browser has it, else currentTime minus the output latency */
export function heardSec(ctx: any): number {
  try {
    if (typeof ctx.getOutputTimestamp === 'function' && typeof performance !== 'undefined') {
      const ts = ctx.getOutputTimestamp();
      if (ts && ts.contextTime > 0 && ts.performanceTime > 0) {
        const h = ts.contextTime + Math.max(0, performance.now() - ts.performanceTime) / 1000;
        if (h <= ctx.currentTime + 0.01 && h > ctx.currentTime - 0.6) return h;
      }
    }
  } catch { /* fall through */ }
  return ctx.currentTime - (ctx.outputLatency || ctx.baseLatency || 0);
}

// ================================================================================================================================ the minigame
const LANE_COL: number[][] = [[255, 196, 64], [90, 200, 255], [255, 110, 120], [140, 235, 130]];
const LANE_NAME = ['CHICO', 'REPIQUE', 'PIANO', 'PALMAS'];
// the keys of each lane (letters = ascii; arrows = pygame codes); 3 lanes use the first three
const LANE_KEYS: number[][] = [[97, 106, 276], [115, 107, 274], [100, 108, 273], [102, 59, 275]];
const laneOfKey = (k: number, lanes: number): number => {
  if (lanes === 3 && k === 275) return 2;   // with 3 lanes the right arrow is the third drum
  if (lanes === 3 && k === 273) return -1;
  for (let i = 0; i < lanes; i++) if (LANE_KEYS[i].includes(k)) return i;
  return -1;
};
const GRADES = [['S', 0.95, '#ffd24a'], ['A', 0.85, '#7be07b'], ['B', 0.7, '#6ec6ff'], ['C', 0.55, '#ffa64a'], ['D', 0, '#ff6b6b']] as const;
const ease = (x: number): number => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);

export function makeCandombe(Base: any): any {
  return class MinigameCandombe extends Base {
    static TRACKS = TRACKS;
    static buildSong = buildSong;
    static forceTrack: string | null = null;
    static Sequencer = Sequencer;
    static registerMidi = registerMidi;
    static parseMidi = parseMidi;
    static songFromMidi = songFromMidi;
    static midiTracks = midiTracks;
    static musicCredits = musicCredits;
    static heardSec = heardSec;

    constructor(stage: any, phase1content: any, witness: any) {
      super(stage, phase1content, witness, {
        id: 'tamborilero', title: 'TAMBORILERO',
        question_intro: 'El Tamborilero está ensayando para\nlas Llamadas y no puede parar el ritmo.',
        question: '¿Te ofreces a ayudarlo?',
        request_text: 'Me falta un tambor en la cuerda\ny la comparsa sale en una hora.',
        request_question_text: '¿Me ayudas a llevar el ritmo\nde la llamada?',
        thanks_text: '¡Eso es candombe! Con vos al lado la cuerda suena redonda.',
        help: [
          { text: 'Suena una canción y las notas bajan hacia los tambores. Golpea el tambor justo cuando la nota llega a la línea.' },
          { text: 'Usa las teclas A, S, D y F (o las flechas), o toca los tambores con el ratón o el dedo. ¡Acertar seguido hace crecer el combo!' },
          { text: 'Si aciertas el 70% de los golpes, la cuerda queda afinada. Si no, puedes volver a intentarlo. Con Esc sales.' },
          { text: 'Si la música y las notas no coinciden (por ejemplo con auriculares Bluetooth), ajusta el retraso con las teclas [ y ]. Se guarda.' },
        ],
      });
      preloadMidi();
      this.run = null; this.listening = false; this.offsetT = -99999; this.lastTick = 0; this.held = [false, false, false, false];
    }

    // ------------------------------------------------------------------------------------------------------------ build / lifecycle
    build(): void {
      preloadMidi();
      const all = [...TRACKS, ...midiTracks];
      const forced = MinigameCandombe.forceTrack ? all.find((t) => t.id === MinigameCandombe.forceTrack) : null;
      // with MIDI files installed they are the songs; otherwise the built-in song of the level of the case
      const pool = midiTracks.length ? midiTracks : TRACKS.filter((t) => t.diff === Math.min(3, Math.max(1, this.level())));
      this.track = forced || pool[Math.floor(Math.random() * pool.length)] || TRACKS[0];
      this.song = buildSong(this.track);
      this.surface = new pygame.Surface([BW, BH], pygame.SRCALPHA, 32);
      this.view = new ItemImage(BX, BY, new assets.Image(this.surface));
      this.layer.add(this.view);
      this.bg = this.paintBackdrop();
      this.notes = [];
      this.draw();
    }
    /** the music of the phase is replaced by the song of the minigame (the song is played by the sequencer) */
    play_music(): any {
      if (!this.playing_minigame_music) { try { this.stage.stop_music(); } catch { /* none */ } }
      this.playing_minigame_music = true;
      return null;
    }
    on_start(): void {
      this.attach();
      mixer.unlock();
      try { this.stage.game.window.canvas.focus?.(); } catch { /* headless */ }
      if (!this.run) this.newRun();
      else if (this.run.phase === 'paused') this.resume();
      this.armTimer();
    }
    /** the minigame stops (help, close, solved): nothing may keep running */
    stop_minigame(solved: any): any {
      const r = super.stop_minigame(solved);
      this.halt();
      return r;
    }
    halt(): void {
      if (this.run && this.run.phase === 'play') this.pause();
      this.run?.seq.stop();
      this.detach();
      this.releaseInput();
      this.stage.stop_timer('new_minigame_tick');
    }
    armTimer(): void {
      this.lastTick = pygame.time.get_ticks();
      this.stage.start_timer('new_minigame_tick', 20, () => this.tick(), null, true, false);
    }
    attach(): void {
      if (this.listening || typeof window === 'undefined' || typeof window.addEventListener !== 'function') return;
      this.listening = true;
      this.onLose = () => { if (this.run && this.run.phase === 'play') this.pause(); this.releaseInput(); };
      this.onVis = () => { if (typeof document !== 'undefined' && document.hidden) this.onLose(); };
      window.addEventListener('blur', this.onLose);
      if (typeof document !== 'undefined' && document.addEventListener) document.addEventListener('visibilitychange', this.onVis);
    }
    detach(): void {
      if (!this.listening) return;
      this.listening = false;
      if (typeof window.removeEventListener === 'function') window.removeEventListener('blur', this.onLose);
      if (typeof document !== 'undefined' && document.removeEventListener) document.removeEventListener('visibilitychange', this.onVis);
    }
    releaseInput(): void { this.held = [false, false, false, false]; }

    newRun(): void {
      this.run?.seq.stop();
      this.releaseInput();
      this.song = buildSong(this.track);   // fresh chart (the states of the notes are reset)
      const now = pygame.time.get_ticks();
      this.run = {
        seq: new Sequencer(this.song, this.track), phase: 'play', mode: 'tick', clock0: now, t0: 0, pausedSong: 0, miss: 0,
        score: 0, combo: 0, best: 0, perfect: 0, good: 0, missed: 0, stray: 0, shownScore: 0, pass: false, resT: 0,
        squash: [-9999, -9999, -9999, -9999], flash: [-9999, -9999, -9999, -9999], bad: [-9999, -9999, -9999, -9999],
        particles: [], popups: [], msg: '', msgT: -9999, comboT: -9999, doneT: 0, started: now,
      };
      this.notes = this.song.notes;
      this.anchorAt(-this.song.lead - 150);
    }
    /** puts the song clock at song time ms (right now): on the audio clock when the audio runs, else on the game clock */
    anchorAt(ms0: number): void {
      const r = this.run, ctx = mixer.ctx, off = DEFAULT_OFFSET_MS + getOffset();
      if (ctx && ctx.state === 'running') { r.mode = 'audio'; r.t0 = heardSec(ctx) - (ms0 + this.song.lead + off) / 1000; r.seq.anchor = r.t0; }
      else { r.mode = 'tick'; r.clock0 = pygame.time.get_ticks() - (ms0 + this.song.lead); r.seq.anchor = null; }
      r.seq.seek(ms0);
    }
    songMs(): number {
      const r = this.run;
      if (!r) return -this.song.lead;
      if (r.phase === 'paused') return r.pausedSong;
      if (r.mode === 'audio' && mixer.ctx) return (heardSec(mixer.ctx) - r.t0) * 1000 - this.song.lead - DEFAULT_OFFSET_MS - getOffset();
      return pygame.time.get_ticks() - r.clock0 - this.song.lead;
    }
    now(): number { return this.songMs(); }
    pause(): void {
      const r = this.run; if (!r || r.phase !== 'play') return;
      r.pausedSong = this.songMs(); r.phase = 'paused'; r.seq.stop(); this.releaseInput();
    }
    resume(): void {
      const r = this.run; if (!r || r.phase !== 'paused') return;
      r.phase = 'play'; this.anchorAt(r.pausedSong);   // shifts the clock by the time that was paused
    }

    // ------------------------------------------------------------------------------------------------------------ the frame
    tick(): void {
      this.lastTick = pygame.time.get_ticks();
      try {
        const r = this.run; if (!r) return;
        let ms = this.songMs();
        if (r.phase === 'play') {
          const ctx = mixer.ctx, running = !!ctx && ctx.state === 'running';
          if (r.mode === 'audio' && !running) { this.pause(); this.draw(); return; }   // the audio was suspended (tab hidden, phone call): wait for the player
          if (r.mode === 'tick' && running) { this.anchorAt(ms); ms = this.songMs(); }   // the audio came up after the start: follow its clock from now on
          r.seq.pump(ms);
          const notes = this.notes;
          while (r.miss < notes.length && notes[r.miss].t < ms - MISS) {
            const n = notes[r.miss++];
            if (n.state === 0) { n.state = 2; r.missed++; r.combo = 0; r.bad[n.lane] = ms; this.pop(n.lane, 'Fallaste', '#ff8a8a'); }
          }
          if (ms >= this.song.endMs) this.finish(ms);
        } else if (r.phase === 'results' && r.pass && !this.minigame_solved && pygame.time.get_ticks() - r.doneT > 2600) this.complete();
        this.draw();
      } catch (e) {
        // never let a drawing / audio problem take the keyboard down with it: go on without the song
        console.error('candombe tick:', e);
        if (this.run) this.run.seq.broken = true;
      }
    }
    finish(ms: number): void {
      const r = this.run, total = Math.max(1, this.notes.length);
      r.phase = 'results'; r.doneT = pygame.time.get_ticks(); r.seq.stop(); this.releaseInput();
      for (const n of this.notes) if (n.state === 0) { n.state = 2; r.missed++; }
      r.ratio = (r.perfect + r.good) / total;
      r.acc = Math.max(0, Math.min(1, (r.perfect + 0.6 * r.good - 0.25 * r.stray) / total));
      r.grade = GRADES.find((g) => r.acc >= g[1]);
      r.pass = r.ratio >= PASS_RATIO;
      this.mistakes = r.missed + r.stray;
    }
    calculate_solved_score(): any {
      const r = this.run;
      return [100, Math.max(0, Math.round(150 * (r ? r.acc : 0)))];
    }

    // ------------------------------------------------------------------------------------------------------------ input
    /** the drum of a lane is hit (keyboard, mouse or touch) */
    hit(lane: number): void {
      const r = this.run; if (!r || this.minigame_solved || r.phase !== 'play') return;
      const ms = this.songMs();
      r.squash[lane] = ms; playerHit(lane, this.track.lanes);
      if (ms < -300) return;   // the count-in
      let best: any = null, bd = 1e9;
      for (let i = r.miss; i < this.notes.length; i++) {
        const n = this.notes[i];
        if (n.t > ms + GOOD + 40) break;
        if (n.state !== 0 || n.lane !== lane) continue;
        const d = Math.abs(n.t - ms);
        if (d < bd) { bd = d; best = n; }
      }
      if (best && bd <= GOOD) {
        const perfect = bd <= PERFECT;
        best.state = 1; r.combo++; r.best = Math.max(r.best, r.combo);
        if (perfect) r.perfect++; else r.good++;
        const mult = 1 + Math.min(3, Math.floor(r.combo / 10)), pts = (perfect ? 300 : 150) * mult;
        r.score += pts; r.flash[lane] = ms; r.comboT = ms;
        this.pop(lane, perfect ? '¡PERFECTO!' : 'Bien', perfect ? '#fff2a8' : '#bfe3ff', '+' + pts);
        this.spark(lane, perfect ? 14 : 6, perfect);
      } else {
        r.stray++; r.combo = 0; r.bad[lane] = ms; this.pop(lane, 'Fuera', '#ff8a8a');
      }
    }
    laneAt(x: number): number {
      const L = this.track.lanes; let lane = 0, d = 1e9;
      for (let i = 0; i < L; i++) { const dx = Math.abs(x - this.laneX(i, 1)); if (dx < d) { d = dx; lane = i; } }
      return lane;
    }
    /** the input hook of the dialog: Esc is handled by the base class before this */
    minigame_handle_event(e: any): any {
      const r = this.run;
      if (!r) return null;
      // watchdog: the tick timer must run while the minigame is up; if it was lost, bring it back
      if (this.listening && pygame.time.get_ticks() - this.lastTick > 400 && !this.minigame_solved) this.armTimer();
      if (e.type === pygame.KEYUP) {
        const l = laneOfKey(e.key, this.track.lanes); if (l >= 0) this.held[l] = false;
        return null;
      }
      const press = e.type === pygame.KEYDOWN || (e.type === pygame.MOUSEBUTTONDOWN && e.button === 1 && e.pos && e.pos[0] >= BX && e.pos[0] < BX + BW && e.pos[1] >= BY + 36 && e.pos[1] < BY + BH);
      if (e.type === pygame.KEYDOWN && (e.key === 91 || e.key === 93)) {   // [ and ]: calibration of the audio delay
        setOffset(getOffset() + (e.key === 93 ? 10 : -10)); this.offsetT = pygame.time.get_ticks(); return true;
      }
      if (!press) return null;
      if (r.phase === 'paused') { this.resume(); return true; }
      if (r.phase === 'results') {
        if (!r.pass && pygame.time.get_ticks() - r.doneT > 500 && (e.type === pygame.MOUSEBUTTONDOWN || e.key === 13 || e.key === 32)) { this.newRun(); this.draw(); return true; }
        return e.type === pygame.KEYDOWN ? null : true;
      }
      if (e.type === pygame.MOUSEBUTTONDOWN) { const l = this.laneAt(e.pos[0] - BX); this.held[l] = true; this.hit(l); this.held[l] = false; return true; }
      const lane = laneOfKey(e.key, this.track.lanes);
      if (lane >= 0) { this.held[lane] = true; this.hit(lane); return true; }
      return null;
    }

    // ------------------------------------------------------------------------------------------------------------ effects
    pop(lane: number, text: string, col: string, sub?: string): void {
      const r = this.run;
      r.popups.push({ x: this.laneX(lane, 1), t: this.songMs(), text, col, sub });
      if (r.popups.length > 12) r.popups.shift();
      r.msg = text; r.msgT = this.songMs();
    }
    spark(lane: number, n: number, perfect: boolean): void {
      const r = this.run, x = this.laneX(lane, 1), c = LANE_COL[lane];
      for (let i = 0; i < n && r.particles.length < 90; i++) {
        const a = -Math.PI * (0.1 + 0.8 * Math.random()), v = 40 + Math.random() * 110;
        r.particles.push({ x, y: HIT_Y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0, max: 380 + Math.random() * 300, col: perfect && i % 2 ? [255, 255, 255] : c, s: 1.5 + Math.random() * 2 });
      }
    }

    // ------------------------------------------------------------------------------------------------------------ drawing
    laneX(i: number, k: number): number {
      const L = this.track.lanes, sb = L === 3 ? 96 : 76;
      return BW / 2 + (i - (L - 1) / 2) * sb * k;
    }
    paintBackdrop(): any {
      const s = new pygame.Surface([BW, BH], pygame.SRCALPHA, 32), c = s.ctx;
      const art = artSrc('candombe_bg');
      if (art) {   // the picture is the 600x450 screen: the board is the window BX, BY
        c.imageSmoothingEnabled = true;
        const sw = Math.round(BW * art.width / 600), sh = Math.round(BH * art.height / 450);   // the window of the board: same scale on both axes (the art is 4:3 like the screen)
        c.drawImage(art, Math.round(BX * art.width / 600), Math.round(BY * art.height / 450), sw, sh, 0, 0, BW, BH);
        note('candombe_bg', 'candombe_bg', sw, sh, BW, BH);
        s.art = true;
        return s;
      }
      let g = c.createLinearGradient(0, 0, 0, 120); g.addColorStop(0, '#1b0f2e'); g.addColorStop(1, '#4a2a3a');
      c.fillStyle = g; c.fillRect(0, 0, BW, 130);
      c.fillStyle = 'rgba(0,0,0,0.18)';
      for (let x = 0; x < BW; x += 22) c.fillRect(x, 0, 2, 130);   // the panels of the wall
      g = c.createLinearGradient(0, 120, 0, BH); g.addColorStop(0, '#6b3f22'); g.addColorStop(1, '#2a160b');
      c.fillStyle = g; c.fillRect(0, 120, BW, BH - 120);
      c.strokeStyle = 'rgba(0,0,0,0.3)'; c.lineWidth = 1;
      for (let i = -8; i <= 8; i++) { c.beginPath(); c.moveTo(BW / 2 + i * 6, 124); c.lineTo(BW / 2 + i * 44, BH); c.stroke(); }   // the planks of the stage
      c.fillStyle = '#12091c'; c.fillRect(0, 118, BW, 6);
      return s;
    }
    text(c: any, s: string, x: number, y: number, size: number, col: string, align = 'center', stroke = true): void {
      c.font = `bold ${size}px sans-serif`; c.textAlign = align;
      if (stroke) { c.lineWidth = 3; c.strokeStyle = 'rgba(10,5,15,0.85)'; c.strokeText(s, x, y); }
      c.fillStyle = col; c.fillText(s, x, y);
    }
    drum(c: any, lane: number, ms: number, held: boolean): void {
      const r = this.run || { squash: [], flash: [], bad: [] }, L = this.track.lanes, col = LANE_COL[lane], x = this.laneX(lane, 1), rad = L === 3 ? 34 : 29;
      const q = Math.max(0, 1 - (ms - (r.squash[lane] ?? -9999)) / 190), sq = q * q;
      const sy = 1 - 0.2 * sq, sx = 1 + 0.09 * sq, glow = Math.max(0, 1 - (ms - (r.flash[lane] ?? -9999)) / 260);
      c.save(); c.translate(x, HIT_Y + 14); c.scale(sx, sy); c.translate(-x, -(HIT_Y + 14));
      const rgb = (m: number) => `rgb(${col.map((v) => Math.min(255, Math.round(v * m))).join(',')})`;
      const asrc = artSrc('candombe_' + ['chico', 'repique', 'piano', 'palmas'][lane]);
      if (asrc) {   // the picture of the drum, scaled to the hit rectangle (the squash above still applies)
        const dw = Math.round(rad * 2 + 10), dh = Math.round(dw * asrc.height / asrc.width);
        put(c, scaled('candombe_' + ['chico', 'repique', 'piano', 'palmas'][lane], dw, dh), Math.round(x - dw / 2), Math.round(HIT_Y + 14 - dh / 2));
        if (held || glow > 0) { c.fillStyle = 'rgba(255,255,255,0.16)'; c.fillRect(Math.round(x - dw / 2), Math.round(HIT_Y + 14 - dh / 2), dw, dh); }
      } else {
      // the body, the hoops and the tension ropes
      c.fillStyle = rgb(0.55); c.beginPath(); c.moveTo(x - rad, HIT_Y); c.lineTo(x - rad + 3, HIT_Y + 30); c.quadraticCurveTo(x, HIT_Y + 38, x + rad - 3, HIT_Y + 30); c.lineTo(x + rad, HIT_Y); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(20,10,5,0.55)'; c.lineWidth = 1.5;
      for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(x + i * rad * 0.4, HIT_Y + 4); c.lineTo(x + i * rad * 0.34, HIT_Y + 32); c.stroke(); }
      c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(x - rad + 3, HIT_Y + 4, 5, 26);
      // the skin
      c.beginPath(); c.ellipse(x, HIT_Y, rad, rad * 0.4, 0, 0, Math.PI * 2);
      c.fillStyle = held || glow > 0 ? '#fff6d8' : '#e8d6a8'; c.fill();
      c.lineWidth = 3.5; c.strokeStyle = rgb(0.85); c.stroke();
      c.beginPath(); c.ellipse(x, HIT_Y, rad * 0.62, rad * 0.22, 0, 0, Math.PI * 2); c.strokeStyle = 'rgba(80,50,20,0.3)'; c.lineWidth = 1.5; c.stroke();
      }
      c.restore();
      if (glow > 0) {   // the glow of a hit
        const gr = c.createRadialGradient(x, HIT_Y, 2, x, HIT_Y, rad * 1.9);
        gr.addColorStop(0, `rgba(${col.join(',')},${0.85 * glow})`); gr.addColorStop(1, `rgba(${col.join(',')},0)`);
        c.globalCompositeOperation = 'lighter'; c.fillStyle = gr; c.fillRect(x - rad * 2, HIT_Y - rad * 2, rad * 4, rad * 3.2); c.globalCompositeOperation = 'source-over';
      }
      const bad = Math.max(0, 1 - (ms - (r.bad[lane] ?? -9999)) / 200);
      if (bad > 0) { c.fillStyle = `rgba(230,40,40,${0.28 * bad})`; c.beginPath(); c.ellipse(x, HIT_Y, rad, rad * 0.4, 0, 0, Math.PI * 2); c.fill(); }
      // the label: key and name
      const key = L === 3 ? 'ASD'[lane] : 'ASDF'[lane];
      c.fillStyle = held ? rgb(1) : 'rgba(20,10,30,0.8)'; c.beginPath(); c.arc(x, HIT_Y + 46, 10, 0, Math.PI * 2); c.fill();
      c.lineWidth = 2; c.strokeStyle = rgb(0.9); c.stroke();
      this.text(c, key, x, HIT_Y + 50, 12, held ? '#1a0e06' : '#f4e6b8', 'center', false);
      this.text(c, LANE_NAME[lane], x, HIT_Y + 24, 8, 'rgba(255,255,255,0.8)', 'center', false);
    }
    crowd(c: any, ms: number, beat: number, pulse: number, excited: boolean): void {
      const tw = Math.round(60 * aspect('candombe_crowd')), strip = scaled('candombe_crowd', tw, 60);   // seamless: two copies side by side scroll slowly, the heads bob on the beat
      if (strip) {
        const x = -(((ms * 0.012) % tw) + tw) % tw, y = BH - 60 + Math.round(pulse * (excited ? 3 : 1.5));
        for (let px = Math.round(x); px < BW; px += tw) put(c, strip, px, y);
        return;
      }
      const N = 15, y0 = BH + 4;
      for (let i = 0; i < N; i++) {
        const x = 10 + i * ((BW - 20) / (N - 1)), ph = i * 1.7, bob = Math.sin(beat * Math.PI * 2 + ph) * (1.5 + pulse * 2), h = 12 + (i * 7 % 7);
        const up = excited || (pulse > 0.6 && i % 3 === 0);
        c.fillStyle = `rgb(${14 + (i % 3) * 5},${8 + (i % 2) * 4},${24 + (i % 4) * 4})`;
        c.beginPath(); c.arc(x, y0 - h - 6 + bob, 6, 0, Math.PI * 2); c.fill();             // the head
        c.beginPath(); c.moveTo(x - 11, y0 + 4); c.quadraticCurveTo(x - 10, y0 - h + bob, x, y0 - h + 1 + bob); c.quadraticCurveTo(x + 10, y0 - h + bob, x + 11, y0 + 4); c.fill();   // the shoulders
        if (up) { c.strokeStyle = c.fillStyle; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(x + 8, y0 - h + 3 + bob); c.lineTo(x + 12 + Math.sin(ms / 130 + ph) * 3, y0 - h - 14 + bob); c.stroke(); }
        c.fillStyle = `rgba(255,214,150,${0.12 + pulse * 0.16})`; c.fillRect(x - 6, y0 - h - 12 + bob, 2, 5);   // rim light of the stage on the heads
      }
    }
    flame(c: any, x: number, y: number, combo: number, ms: number): void {
      const k = Math.min(1, combo / 50), h = 12 + 22 * k, w = 8 + 8 * k;
      const layers = [['rgba(255,70,20,0.95)', 1], ['rgba(255,160,30,0.95)', 0.72], ['rgba(255,240,150,0.95)', 0.42]];
      layers.forEach((L, i) => {
        const f = Math.sin(ms / 70 + i * 2) * 0.12 + 1, hh = h * L[1] * f, ww = w * L[1];
        c.fillStyle = L[0]; c.beginPath(); c.moveTo(x, y);
        c.bezierCurveTo(x - ww, y - hh * 0.3, x - ww * 0.6, y - hh * 0.8, x + Math.sin(ms / 90 + i) * 3, y - hh);
        c.bezierCurveTo(x + ww * 0.6, y - hh * 0.8, x + ww, y - hh * 0.3, x, y); c.fill();
      });
    }
    draw(): void {
      const r = this.run, tr = this.track, c = this.surface.ctx, L = tr.lanes;
      const ms = this.songMs(), beatMs = this.song.beatMs, beat = ms / beatMs, frac = ((beat % 1) + 1) % 1, pulse = Math.pow(1 - frac, 3);
      const combo = r ? r.combo : 0;
      c.clearRect(0, 0, BW, BH);
      c.drawImage(this.bg.canvas, 0, 0);
      if (this.bg.art) artStats.drawn++;
      // the spotlights (the picture of the cone when there is one)
      c.globalCompositeOperation = 'lighter';
      const spot = scaled('candombe_spot', 90, 180);
      if (spot) for (let i = 0; i < 3; i++) { c.globalAlpha = 0.45 + pulse * 0.3; put(c, spot, 50 + i * 118 - 45 + Math.sin(ms / 1500 + i * 2.1) * 30, 0); c.globalAlpha = 1; }
      else for (let i = 0; i < 3; i++) {
        const sx = 50 + i * 118, sw = Math.sin(ms / 1500 + i * 2.1) * 30, hue = (ms / 40 + i * 120) % 360;
        const g = c.createLinearGradient(sx, 0, sx + sw, 150); g.addColorStop(0, `hsla(${hue},80%,60%,${0.2 + pulse * 0.12})`); g.addColorStop(1, `hsla(${hue},80%,60%,0)`);
        c.fillStyle = g; c.beginPath(); c.moveTo(sx - 5, 0); c.lineTo(sx + 5, 0); c.lineTo(sx + sw + 45, 150); c.lineTo(sx + sw - 45, 150); c.fill();
      }
      c.globalCompositeOperation = 'source-over';
      // the string of bulbs
      for (let i = 0; i < 14; i++) { const on = (i + Math.floor(beat)) % 3; c.fillStyle = on === 0 ? `hsl(${i * 26},90%,${55 + pulse * 25}%)` : 'rgba(255,230,180,0.22)'; c.beginPath(); c.arc(12 + i * 24.5, 5, 2.5, 0, Math.PI * 2); c.fill(); }
      // the highway
      const topW = L === 3 ? 96 * 0.42 : 76 * 0.42, botW = L === 3 ? 96 : 76, tw = (L * topW) / 2 + 4, bw = (L * botW) / 2 + 4;
      c.fillStyle = 'rgba(12,6,22,0.62)'; c.beginPath(); c.moveTo(BW / 2 - tw, TOP); c.lineTo(BW / 2 + tw, TOP); c.lineTo(BW / 2 + bw, HIT_Y + 4); c.lineTo(BW / 2 - bw, HIT_Y + 4); c.fill();
      c.lineWidth = 1;
      for (let i = 0; i <= L; i++) {
        const o = i - L / 2; c.strokeStyle = `rgba(255,255,255,${0.12 + pulse * 0.1})`;
        c.beginPath(); c.moveTo(BW / 2 + o * topW, TOP); c.lineTo(BW / 2 + o * botW, HIT_Y + 4); c.stroke();
      }
      for (let i = 0; i < L; i++) if (this.held[i]) { const x0 = this.laneX(i, 1), x1 = this.laneX(i, 0.42), g = c.createLinearGradient(0, HIT_Y, 0, TOP); g.addColorStop(0, `rgba(${LANE_COL[i].join(',')},0.35)`); g.addColorStop(1, `rgba(${LANE_COL[i].join(',')},0)`); c.fillStyle = g; c.beginPath(); c.moveTo(x1 - topW / 2, TOP); c.lineTo(x1 + topW / 2, TOP); c.lineTo(x0 + botW / 2, HIT_Y); c.lineTo(x0 - botW / 2, HIT_Y); c.fill(); }
      c.strokeStyle = `rgba(255,236,180,${0.45 + pulse * 0.35})`; c.lineWidth = 2; c.beginPath(); c.moveTo(BW / 2 - bw, HIT_Y); c.lineTo(BW / 2 + bw, HIT_Y); c.stroke();
      // the notes
      if (r) {
        const notes = this.notes;
        for (let i = r.miss > 8 ? r.miss - 8 : 0; i < notes.length; i++) {
          const n = notes[i], p = (n.t - ms) / TRAVEL;
          if (p > 1) break;
          if (n.state === 1 || p < -0.22) continue;
          const y = HIT_Y - p * (HIT_Y - TOP), k = 0.42 + 0.58 * Math.max(0, (y - TOP) / (HIT_Y - TOP)), x = this.laneX(n.lane, k), rad = (L === 3 ? 17 : 14.5) * k;
          const col = n.state === 2 ? [110, 110, 120] : LANE_COL[n.lane];
          c.globalAlpha = n.state === 2 ? Math.max(0, 0.6 + p * 2.5) : Math.min(1, (1 - p) * 4);
          c.fillStyle = 'rgba(0,0,0,0.35)'; c.beginPath(); c.ellipse(x, y + rad * 0.5, rad, rad * 0.4, 0, 0, Math.PI * 2); c.fill();
          c.fillStyle = `rgb(${col.map((v) => Math.round(v * 0.6)).join(',')})`; c.fillRect(x - rad, y - 1, rad * 2, rad * 0.55);
          c.beginPath(); c.ellipse(x, y, rad, rad * 0.55, 0, 0, Math.PI * 2); c.fillStyle = `rgb(${col.join(',')})`; c.fill();
          c.lineWidth = 2; c.strokeStyle = n.state === 2 ? 'rgba(60,60,70,0.8)' : 'rgba(255,255,255,0.85)'; c.stroke();
          c.globalAlpha = 1;
        }
      }
      for (let i = 0; i < L; i++) this.drum(c, i, ms, this.held[i]);
      if (r) {
        // sparks and score popups
        const dt = 0.03;
        c.globalCompositeOperation = 'lighter';
        r.particles = r.particles.filter((p) => p.life < p.max);
        for (const p of r.particles) {
          p.life += 30; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 260 * dt;
          const a = 1 - p.life / p.max; c.fillStyle = `rgba(${p.col.join(',')},${a})`; c.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s);
        }
        c.globalCompositeOperation = 'source-over';
        r.popups = r.popups.filter((p) => ms - p.t < 700);
        for (const p of r.popups) {
          const k = (ms - p.t) / 700;
          c.globalAlpha = 1 - k * k; this.text(c, p.text, p.x, HIT_Y - 20 - 30 * ease(k), 11, p.col);
          if (p.sub) this.text(c, p.sub, p.x, HIT_Y - 8 - 30 * ease(k), 9, '#ffd24a', 'center', false);
          c.globalAlpha = 1;
        }
      }
      this.crowd(c, ms, beat, pulse, combo >= 10);
      // the HUD
      if (r) {
        r.shownScore += (r.score - r.shownScore) * 0.25;
        this.text(c, String(Math.round(r.shownScore)).padStart(6, '0'), 8, 28, 16, '#f4e6b8', 'left');
        const done = Math.max(0, Math.min(1, ms / this.song.endMs));
        c.fillStyle = 'rgba(0,0,0,0.5)'; c.fillRect(0, 11, BW, 3); c.fillStyle = '#ffd24a'; c.fillRect(0, 11, BW * done, 3);
        this.text(c, tr.name, BW / 2, 30, 9, 'rgba(244,230,184,0.7)', 'center', false);
        if (combo >= 2) {
          const pop = 1 + 0.35 * Math.max(0, 1 - (ms - r.comboT) / 160);
          c.save(); c.translate(BW - 10, 28); c.scale(pop, pop); this.text(c, combo + ' COMBO', 0, 0, 13, combo >= 10 ? '#ffb347' : '#f4e6b8', 'right'); c.restore();
          if (combo >= 10) this.flame(c, BW - 104, 30, combo, ms);
          if (combo >= 10) this.text(c, 'x' + (1 + Math.min(3, Math.floor(combo / 10))), BW - 10, 40, 9, '#ffd24a', 'right', false);
        }
        if (ms < 0 && r.phase === 'play') {   // the count-in
          const n = Math.ceil(-ms / beatMs), f = 1 - ((-ms / beatMs) % 1), s = 1 + 0.6 * (1 - ease(f * 1.6));
          c.save(); c.translate(BW / 2, 96); c.scale(s, s); this.text(c, n > 3 ? '¡Prepárate!' : String(n), 0, 0, n > 3 ? 20 : 34, '#fff'); c.restore();
          this.text(c, this.creditLine(), BW / 2, 124, 9, 'rgba(244,230,184,0.9)', 'center', false);
        } else if (ms >= 0 && ms < 700 && r.phase === 'play') { c.globalAlpha = 1 - ms / 700; this.text(c, '¡YA!', BW / 2, 96, 30, '#ffd24a'); c.globalAlpha = 1; }
        if (pygame.time.get_ticks() - this.offsetT < 1800) this.text(c, 'Ajuste de audio: ' + (getOffset() > 0 ? '+' : '') + getOffset() + ' ms  ( [ y ] )', 8, 42, 9, '#ffd24a', 'left');
        if (r.phase === 'paused') {
          c.fillStyle = 'rgba(10,5,20,0.75)'; c.fillRect(0, 0, BW, BH);
          this.text(c, 'PAUSA', BW / 2, 120, 26, '#fff'); this.text(c, 'Pulsa una tecla o haz clic', BW / 2, 146, 12, '#f4e6b8', 'center', false);
        }
        if (r.phase === 'results') this.drawResults(c, r);
      }
    }
    creditLine(): string { const s = creditOf(this.track); return s.length > 62 ? s.slice(0, 60) + '…' : s; }
    drawResults(c: any, r: any): void {
      const k = ease((pygame.time.get_ticks() - r.doneT) / 500), g = r.grade;
      c.fillStyle = `rgba(10,5,20,${0.86 * k})`; c.fillRect(0, 0, BW, BH);
      c.save(); c.translate(0, (1 - k) * 60); c.globalAlpha = k;
      this.text(c, r.pass ? '¡QUÉ RITMO!' : '¡CASI!', BW / 2, 50, 22, r.pass ? '#ffd24a' : '#ff9d7a');
      const pop = 1 + 0.4 * Math.max(0, 1 - (pygame.time.get_ticks() - r.doneT - 250) / 350);
      c.save(); c.translate(BW / 2, 122); c.scale(pop, pop); this.text(c, g[0], 0, 24, 78, g[2]); c.restore();
      this.text(c, String(r.score) + ' puntos', BW / 2, 156, 16, '#f4e6b8');
      this.text(c, `Perfectos ${r.perfect}   Bien ${r.good}   Fallos ${r.missed}`, BW / 2, 178, 12, '#fff', 'center', false);
      this.text(c, `Mejor combo ${r.best}   Aciertos ${Math.round(r.ratio * 100)}%`, BW / 2, 196, 12, '#fff', 'center', false);
      this.text(c, this.creditLine(), BW / 2, 252, 9, 'rgba(244,230,184,0.7)', 'center', false);
      this.text(c, r.pass ? 'La cuerda quedó afinada' : 'Hay que acertar el 70% · Enter o clic: otra vez', BW / 2, 228, 11, '#f4e6b8', 'center', false);
      c.restore();
    }
  };
}
