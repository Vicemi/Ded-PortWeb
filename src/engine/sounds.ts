// pygame.mixer on top of Web Audio: Sound objects, mixing channels, channel 0 reserved for the music (as the original game does), fades,
// queued sounds and the "end of sound" event.
import { event as pgEvent } from './pygame';

class MixerImpl {
  ctx: AudioContext | null = null;
  master: GainNode | null = null;
  channels: Channel[] = [];
  reserved = 0;
  muted = false;
  base = '';
  lengths: Record<string, number> = {};
  private sounds = new Map<string, Sound>();

  init(base: string, lengths: Record<string, number>, numChannels = 12): void {
    this.base = base;
    this.lengths = lengths;
    this.channels = Array.from({ length: numChannels }, (_, i) => new Channel(this, i));
  }
  /** Web Audio can only start from a user gesture: called on the first click / key press */
  unlock(): void {
    if (!this.ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 1;
      this.master.connect(this.ctx.destination);
      for (const c of this.channels) c.attach();
      this.decodeAll();
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }
  setMuted(m: boolean): void {
    this.muted = m;
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(m ? 0 : 1, this.ctx.currentTime, 0.02);
  }
  set_reserved(n: number): void { this.reserved = n; }
  get_num_channels(): number { return this.channels.length; }
  Channel(i: number): Channel { return this.channels[i]; }
  /** first idle channel that is not reserved (null when all are busy) */
  find_channel(): Channel | null {
    for (let i = this.reserved; i < this.channels.length; i++) if (!this.channels[i].get_busy()) return this.channels[i];
    return null;
  }
  stopAll(): void { for (let i = this.reserved; i < this.channels.length; i++) this.channels[i].stop(); }
  sound(name: string): Sound {
    let s = this.sounds.get(name);
    if (!s) { s = new Sound(this, name, this.lengths[name] ?? 0); this.sounds.set(name, s); if (this.ctx) void s.decode(); }
    return s;
  }
  decodeAll(): void { for (const s of this.sounds.values()) void s.decode(); }
}
export const mixer = new MixerImpl();

export class Sound {
  buffer: AudioBuffer | null = null;
  private loading: Promise<void> | null = null;
  volume = 1;
  constructor(private m: MixerImpl, readonly name: string, private length: number) {}
  decode(): Promise<void> {
    if (this.buffer) return Promise.resolve();
    if (!this.loading) {
      const ctx = this.m.ctx;
      if (!ctx) return Promise.resolve();
      this.loading = (async () => {
        try {
          const r = await fetch(`${this.m.base}/${this.name}`);
          this.buffer = await ctx.decodeAudioData(await r.arrayBuffer());
        } catch (e) { console.warn('cannot decode sound', this.name, e); this.loading = null; }
      })();
    }
    return this.loading;
  }
  get_length(): number { return this.buffer ? this.buffer.duration : this.length; }
  set_volume(v: number): void { this.volume = v; }
  get_volume(): number { return this.volume; }
  /** returns the channel used (null when every channel is busy) */
  play(loops = 0, maxtime = 0, fade_ms = 0): Channel | null {
    const ch = this.m.find_channel();
    if (!ch) return null;
    ch.set_volume(1);
    ch.play(this, loops, maxtime, fade_ms);
    return ch;
  }
  stop(): void { for (const c of this.m.channels) if (c.sound === this) c.stop(); }
  fadeout(ms: number): void { for (const c of this.m.channels) if (c.sound === this) c.fadeout(ms); }
  get_num_channels(): number { return this.m.channels.filter((c) => c.sound === this && c.get_busy()).length; }
}

interface Voice { sound: Sound; src: AudioBufferSourceNode; at: number; offset: number; loops: number; maxtime: number; end: number }

export class Channel {
  private gain: GainNode | null = null;
  private cur: Voice | null = null;
  private next: Voice | null = null;
  private vol = 1;
  private endEvent: number | null = null;
  private paused: { sound: Sound; offset: number; loops: number; nextSound: Sound | null } | null = null;
  private deferred: { sound: Sound; loops: number; queue: Sound | null } | null = null;
  private stopTimer = 0;
  private token = 0;
  constructor(private m: MixerImpl, readonly index: number) {}

  /** the Sound that is playing (or paused) on this channel */
  get sound(): Sound | null { return this.cur?.sound ?? this.paused?.sound ?? null; }
  attach(): void {
    const ctx = this.m.ctx;
    if (!ctx || !this.m.master) return;
    this.gain = ctx.createGain();
    this.gain.gain.value = this.vol;
    this.gain.connect(this.m.master);
    const d = this.deferred;
    this.deferred = null;
    if (d) { this.play(d.sound, d.loops); if (d.queue) this.queue(d.queue); }
  }
  get_busy(): boolean { return !!this.cur || !!this.paused || !!this.deferred || !!this.decoding; }
  get_sound(): Sound | null { return this.sound; }
  get_volume(): number { return this.vol; }
  set_volume(v: number): void {
    this.vol = Math.max(0, Math.min(1, v));
    if (this.gain && this.m.ctx) {
      this.gain.gain.cancelScheduledValues(this.m.ctx.currentTime);
      this.gain.gain.setTargetAtTime(this.vol, this.m.ctx.currentTime, 0.004);
    }
  }
  set_endevent(type?: number): void { this.endEvent = type ?? null; }

  play(sound: Sound, loops = 0, maxtime = 0, fade_ms = 0): void {
    this.stop();
    const ctx = this.m.ctx;
    if (!ctx || !this.gain) {
      // before the first user gesture only the music is remembered (a sound effect that would be heard late is dropped)
      if (this.index < this.m.reserved) this.deferred = { sound, loops, queue: null };
      return;
    }
    const token = this.token;
    const go = (): void => {
      if (token !== this.token || !sound.buffer) return;
      if (fade_ms > 0) {
        const g = this.gain!.gain, now = ctx.currentTime;
        g.cancelScheduledValues(now); g.setValueAtTime(0, now); g.linearRampToValueAtTime(this.vol, now + fade_ms / 1000);
      }
      this.cur = this.voice(sound, ctx.currentTime, 0, loops, maxtime);
    };
    if (sound.buffer) go(); else { this.cur = null; this.pendingDecode(sound, go); }
  }
  private pendingDecode(sound: Sound, go: () => void): void {
    // not decoded yet: the channel counts as busy until it is
    this.decoding = sound;
    void sound.decode().then(() => { if (this.decoding === sound) { this.decoding = null; go(); } });
  }
  private decoding: Sound | null = null;

  private voice(sound: Sound, at: number, offset: number, loops: number, maxtime: number): Voice {
    const ctx = this.m.ctx!, buf = sound.buffer!;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = loops !== 0;
    src.connect(this.gain!);
    let dur = loops < 0 ? Infinity : buf.duration * (loops + 1) - offset;
    if (maxtime > 0) dur = Math.min(dur, maxtime / 1000);
    const v: Voice = { sound, src, at, offset, loops, maxtime, end: at + dur };
    src.start(at, offset);
    if (Number.isFinite(dur)) src.stop(at + dur);
    src.onended = () => this.voiceEnded(v);
    return v;
  }

  private voiceEnded(v: Voice): void {
    if (this.cur !== v) return;
    this.cur = null;
    try { v.src.disconnect(); } catch { /* gone */ }
    if (this.next) { this.cur = this.next; this.next = null; }
    if (this.endEvent !== null) pgEvent.post({ type: this.endEvent });
  }

  /** Mixer queue: the sound starts when the current one ends. The music of a stage is an intro followed by the loop; the original game queues the
   *  loop again every time it ends, here the queued sound is scheduled at the exact end of the intro and keeps looping (seamless), so queueing the
   *  sound that is already playing is a no-op. */
  queue(sound: Sound): void {
    const ctx = this.m.ctx;
    if (this.deferred) { this.deferred.queue = sound; return; }
    if (!this.cur && !this.paused && !this.decoding) { this.play(sound, -1); return; }
    if (this.cur?.sound === sound && !this.next) return;
    if (this.next?.sound === sound) return;
    if (!ctx || !this.gain) return;
    const cur = this.cur;
    const schedule = (): void => {
      const c = this.cur;
      if (!c || !sound.buffer || this.next) return;
      if (Number.isFinite(c.end)) this.next = this.voice(sound, Math.max(c.end, ctx.currentTime), 0, -1, 0);
    };
    if (cur && sound.buffer) schedule();
    else void sound.decode().then(() => { if (this.cur === cur || this.decoding === null) schedule(); });
    if (this.paused) this.paused.nextSound = sound;
  }

  stop(): void {
    this.token++;
    this.decoding = null;
    this.deferred = null;
    this.paused = null;
    clearTimeout(this.stopTimer);
    for (const v of [this.cur, this.next]) {
      if (!v) continue;
      v.src.onended = null;
      try { v.src.stop(); } catch { /* not started */ }
      try { v.src.disconnect(); } catch { /* gone */ }
    }
    this.cur = null; this.next = null;
  }

  fadeout(ms: number): void {
    const ctx = this.m.ctx;
    if (!ctx || !this.gain || !this.cur) { this.stop(); return; }
    this.drop(this.next); this.next = null;
    const g = this.gain.gain, now = ctx.currentTime;
    g.cancelScheduledValues(now); g.setValueAtTime(g.value, now); g.linearRampToValueAtTime(0, now + ms / 1000);
    const token = this.token;
    clearTimeout(this.stopTimer);
    this.stopTimer = window.setTimeout(() => { if (token === this.token) { this.stop(); this.set_volume(this.vol); } }, ms + 15);
  }
  private drop(v: Voice | null): void {
    if (!v) return;
    v.src.onended = null;
    try { v.src.stop(); } catch { /* not started */ }
    try { v.src.disconnect(); } catch { /* gone */ }
  }

  pause(): void {
    const ctx = this.m.ctx, c = this.cur;
    if (!ctx || !c || this.paused) return;
    const buf = c.sound.buffer!;
    let off = c.offset + (ctx.currentTime - c.at);
    if (c.loops !== 0) off = off % buf.duration;
    this.paused = { sound: c.sound, offset: Math.max(0, off), loops: c.loops, nextSound: this.next?.sound ?? null };
    c.src.onended = null;
    try { c.src.stop(); } catch { /* ended */ }
    try { c.src.disconnect(); } catch { /* gone */ }
    this.drop(this.next);
    this.cur = null; this.next = null;
  }
  unpause(): void {
    const p = this.paused, ctx = this.m.ctx;
    if (!p || !ctx || !this.gain) { this.paused = null; return; }
    this.paused = null;
    this.cur = this.voice(p.sound, ctx.currentTime, p.offset, p.loops, 0);
    if (p.nextSound) this.queue(p.nextSound);
  }
}
