// Small synthesized sounds (no files): the drums of the candombe minigame and a few blips. They go through the same master volume (and mute) as the rest.
import { mixer } from './sounds';

type Drum = 'chico' | 'repique' | 'piano';
const DRUMS: Record<Drum, { f0: number; f1: number; len: number; noise: number }> = {
  chico: { f0: 420, f1: 300, len: 0.14, noise: 0.35 },       // the high one: dry slap
  repique: { f0: 260, f1: 190, len: 0.22, noise: 0.28 },
  piano: { f0: 150, f1: 85, len: 0.38, noise: 0.18 },        // the big low one
};

/** plays one hit of a candombe drum */
export function drum(kind: Drum, volume = 0.7): void {
  const ctx = mixer.ctx, master = mixer.master;
  if (!ctx || !master) return;
  const d = DRUMS[kind], t = ctx.currentTime;
  const osc = ctx.createOscillator(), g = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(d.f0, t);
  osc.frequency.exponentialRampToValueAtTime(d.f1, t + d.len);
  g.gain.setValueAtTime(volume, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + d.len);
  osc.connect(g); g.connect(master);
  osc.start(t); osc.stop(t + d.len + 0.02);
  // the skin: a burst of noise
  const n = Math.max(1, Math.floor(ctx.sampleRate * 0.05));
  const buf = ctx.createBuffer(1, n, ctx.sampleRate), ch = buf.getChannelData(0);
  for (let i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const src = ctx.createBufferSource(), ng = ctx.createGain();
  src.buffer = buf; ng.gain.value = d.noise * volume;
  src.connect(ng); ng.connect(master); src.start(t);
}

/** a short tone (a wrong answer, a miss) */
export function blip(freq: number, len = 0.12, volume = 0.25, type: OscillatorType = 'square'): void {
  const ctx = mixer.ctx, master = mixer.master;
  if (!ctx || !master) return;
  const t = ctx.currentTime, osc = ctx.createOscillator(), g = ctx.createGain();
  osc.type = type; osc.frequency.value = freq;
  g.gain.setValueAtTime(volume, t); g.gain.exponentialRampToValueAtTime(0.001, t + len);
  osc.connect(g); g.connect(master); osc.start(t); osc.stop(t + len + 0.02);
}
