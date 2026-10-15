// @ts-nocheck
// Presentation helpers shared by the minigames (nothing here touches the rules): easing, text drawn with the game's own fonts, a particle pool, floating
// texts, screen shake / flash, small canvas drawings (stars, stamps, sun), and an overlay for the classic minigames.
// Performance: pools are preallocated and the drawing code allocates nothing per frame. An overlay only touches its surface (Surface.ctx bumps `ver`,
// which is what makes the frame cache repaint) while something is moving, so an idle minigame is still skipped by the frame cache (src/engine/framecache.ts).
import { ItemImage } from '../../runtime/prelude';
import * as assets from '../../engine/assets';
import { pygame } from '../../runtime/prelude';
import { blip } from '../../engine/synth';
import { cell } from './mgart';

// ------------------------------------------------------------------------------------------------------------------------------ easing
export const clamp01 = (t: number): number => (t < 0 ? 0 : t > 1 ? 1 : t);
export const E = {
  out: (t: number) => 1 - Math.pow(1 - t, 3),
  inOut: (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  outBack: (t: number) => { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
  outElastic: (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * 2.0943951) + 1),
};
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
/** green (plenty) -> amber -> red (little) for a bar that goes from f = 1 to f = 0 */
export function heat(f: number): string {
  f = clamp01(f);
  const r = f > 0.5 ? lerp(240, 90, (f - 0.5) * 2) : 232, g = f > 0.5 ? lerp(200, 190, (f - 0.5) * 2) : lerp(40, 190, f * 2), b = f > 0.5 ? 70 : 40;
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}

/** the same colour as heat() as [r, g, b] (for ItemRect), quantised so that it only changes a few times */
export function heat_rgb(f: number): number[] {
  const q = Math.round(clamp01(f) * 12) / 12;
  return q > 0.5 ? [lerp(240, 90, (q - 0.5) * 2) | 0, lerp(200, 190, (q - 0.5) * 2) | 0, 70] : [232, lerp(40, 190, q * 2) | 0, 40];
}

// ------------------------------------------------------------------------------------------------------------------------------ text with the game's fonts
const texts = new WeakMap<object, Map<string, HTMLCanvasElement>>();
/** a canvas with `text` drawn by the game font (the fonts are bitmap atlases: only the sizes of the game exist); cached per font, text and colour */
export function textCanvas(font: any, text: string, color: number[]): HTMLCanvasElement {
  let m = texts.get(font);
  if (!m) { m = new Map(); texts.set(font, m); }
  const key = `${color[0]},${color[1]},${color[2]}|${text}`;
  let cv = m.get(key);
  if (!cv) {
    if (m.size > 160) m.clear();
    cv = font.render(text, true, color).canvas;
    m.set(key, cv);
  }
  return cv;
}
export interface TextOpts { align?: 'l' | 'c' | 'r'; scale?: number; alpha?: number; rot?: number; shadow?: number[] | null; dx?: number; dy?: number }
/** text centred vertically on y; shadow = colour of a drop shadow */
export function gtext(c: CanvasRenderingContext2D, font: any, text: string, x: number, y: number, color: number[], o: TextOpts = null): void {
  if (!text) return;
  const cv = textCanvas(font, text, color), w = cv.width, h = cv.height;
  const s = o && o.scale !== undefined ? o.scale : 1, a = o && o.alpha !== undefined ? o.alpha : 1, al = o && o.align ? o.align : 'l';
  if (a <= 0 || s <= 0) return;
  const ax = al === 'c' ? -w / 2 : al === 'r' ? -w : 0;
  const ga = c.globalAlpha;
  c.globalAlpha = ga * a;
  c.save();
  c.translate(x, y);
  if (o && o.rot) c.rotate(o.rot);
  if (s !== 1) c.scale(s, s);
  if (o && o.shadow) c.drawImage(textCanvas(font, text, o.shadow), ax + (o.dx ?? 1), -h / 2 + (o.dy ?? 2));
  c.drawImage(cv, ax, -h / 2);
  c.restore();
  c.globalAlpha = ga;
}
/** wraps `text` to `width` pixels with the font; returns the lines (a new array, call it when the text changes, not every frame) */
export function wrap(font: any, text: string, width: number): string[] {
  const lines: string[] = [];
  for (const para of text.split('\n')) {
    let line = '';
    for (const word of para.split(' ')) {
      const t = line ? line + ' ' + word : word;
      if (line && font.size(t)[0] > width) { lines.push(line); line = word; } else line = t;
    }
    lines.push(line);
  }
  return lines;
}

// ------------------------------------------------------------------------------------------------------------------------------ small drawings
export function rr(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, begin = true): void {
  r = Math.min(r, w / 2, h / 2);
  if (begin) c.beginPath();
  c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.arcTo(x + w, y, x + w, y + r, r);
  c.lineTo(x + w, y + h - r); c.arcTo(x + w, y + h, x + w - r, y + h, r);
  c.lineTo(x + r, y + h); c.arcTo(x, y + h, x, y + h - r, r);
  c.lineTo(x, y + r); c.arcTo(x, y, x + r, y, r);
  c.closePath();
}
export function star(c: CanvasRenderingContext2D, cx: number, cy: number, r: number, fill: string, line: string | null = '#3a2608', rot = 0): void {
  c.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + rot + i * Math.PI / 5, rad = i % 2 ? r * 0.45 : r;
    if (i) c.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad); else c.moveTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad);
  }
  c.closePath();
  c.fillStyle = fill; c.fill();
  if (line) { c.lineWidth = Math.max(1.5, r * 0.16); c.lineJoin = 'round'; c.strokeStyle = line; c.stroke(); }
}
/** a result star: the art (mg_ui_stars: full, empty) if it exists, else the drawn star */
export function uiStar(c: CanvasRenderingContext2D, x: number, y: number, r: number, gold: boolean, rot: number, fillOn: string, fillOff: string, line: string): void {
  if (r > 0 && cell(c, 'ui_stars', 2, gold ? 0 : 1, x, y, r * 2.3, r * 2.3, rot)) return;
  star(c, x, y, r, gold ? fillOn : fillOff, line, rot);
}
/** the sun of the flag of Uruguay (disc and sixteen rays) */
export function sun(c: CanvasRenderingContext2D, cx: number, cy: number, r: number, fill = '#f6c423', line = '#7a4a05', rot = 0): void {
  c.beginPath();
  for (let i = 0; i < 32; i++) {
    const a = rot + i * Math.PI / 16, rad = i % 2 ? r : r * 0.62;
    if (i) c.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad); else c.moveTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad);
  }
  c.closePath();
  c.fillStyle = fill; c.fill();
  c.lineWidth = Math.max(1, r * 0.1); c.lineJoin = 'round'; c.strokeStyle = line; c.stroke();
  c.beginPath(); c.arc(cx, cy, r * 0.42, 0, Math.PI * 2); c.fillStyle = '#ffe27a'; c.fill(); c.stroke();
}
export function check(c: CanvasRenderingContext2D, cx: number, cy: number, s: number, color = '#fff', lw = 3.2): void {
  c.beginPath(); c.moveTo(cx - s, cy); c.lineTo(cx - s * 0.3, cy + s * 0.7); c.lineTo(cx + s, cy - s * 0.7);
  c.lineWidth = lw; c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = color; c.stroke();
}
export function cross(c: CanvasRenderingContext2D, cx: number, cy: number, s: number, color = '#fff', lw = 3.2): void {
  c.beginPath(); c.moveTo(cx - s, cy - s); c.lineTo(cx + s, cy + s); c.moveTo(cx + s, cy - s); c.lineTo(cx - s, cy + s);
  c.lineWidth = lw; c.lineCap = 'round'; c.strokeStyle = color; c.stroke();
}
/** a postage stamp with perforated edges */
export function stamp(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, paper = '#fff6dc'): void {
  c.fillStyle = paper; c.fillRect(x, y, w, h);
  c.fillStyle = 'rgba(0,0,0,0.0)';
  c.globalCompositeOperation = 'destination-out';
  for (let i = 0; i <= w; i += 5) { c.beginPath(); c.arc(x + i, y, 1.7, 0, 7); c.fill(); c.beginPath(); c.arc(x + i, y + h, 1.7, 0, 7); c.fill(); }
  for (let j = 0; j <= h; j += 5) { c.beginPath(); c.arc(x, y + j, 1.7, 0, 7); c.fill(); c.beginPath(); c.arc(x + w, y + j, 1.7, 0, 7); c.fill(); }
  c.globalCompositeOperation = 'source-over';
}

// ------------------------------------------------------------------------------------------------------------------------------ particles
const TAU = Math.PI * 2;
export class Particles {
  n: number; alive = 0;
  x: Float32Array; y: Float32Array; vx: Float32Array; vy: Float32Array; life: Float32Array; max: Float32Array; size: Float32Array; rot: Float32Array; vr: Float32Array; g: Float32Array;
  kind: Uint8Array; col: string[]; on: Uint8Array;
  private cursor = 0;
  constructor(n = 160) {
    this.n = n;
    const f = () => new Float32Array(n);
    this.x = f(); this.y = f(); this.vx = f(); this.vy = f(); this.life = f(); this.max = f(); this.size = f(); this.rot = f(); this.vr = f(); this.g = f();
    this.kind = new Uint8Array(n); this.on = new Uint8Array(n); this.col = new Array(n).fill('#fff');
  }
  /** kind: 0 dot, 1 star, 2 confetti, 3 ring */
  emit(x: number, y: number, vx: number, vy: number, life: number, size: number, color: string, kind = 0, g = 260, vr = 0): void {
    let i = this.cursor;
    for (let k = 0; k < this.n; k++) { if (!this.on[i]) break; i = (i + 1) % this.n; }   // reuse a dead one, else overwrite the next (oldest-ish)
    this.cursor = (i + 1) % this.n;
    if (!this.on[i]) this.alive++;
    this.on[i] = 1; this.x[i] = x; this.y[i] = y; this.vx[i] = vx; this.vy[i] = vy; this.life[i] = life; this.max[i] = life; this.size[i] = size; this.col[i] = color; this.kind[i] = kind; this.g[i] = g;
    this.rot[i] = Math.random() * TAU; this.vr[i] = vr || (Math.random() - 0.5) * 12;
  }
  burst(x: number, y: number, count: number, colors: string[], o: { speed?: number; life?: number; size?: number; g?: number; kind?: number; up?: number; angle?: number; spread?: number } = {}): void {
    const sp = o.speed ?? 130, life = o.life ?? 0.8, size = o.size ?? 3, g = o.g ?? 260, up = o.up ?? 0, a0 = o.angle ?? 0, spread = o.spread ?? TAU;
    for (let i = 0; i < count; i++) {
      const a = a0 + (Math.random() - 0.5) * spread + (spread === TAU ? 0 : 0), v = sp * (0.35 + Math.random() * 0.65);
      this.emit(x, y, Math.cos(a) * v, Math.sin(a) * v - up, life * (0.7 + Math.random() * 0.5), size * (0.7 + Math.random() * 0.7), colors[(Math.random() * colors.length) | 0], o.kind ?? 0, g);
    }
  }
  update(dt: number): void {
    for (let i = 0; i < this.n; i++) {
      if (!this.on[i]) continue;
      this.life[i] -= dt;
      if (this.life[i] <= 0) { this.on[i] = 0; this.alive--; continue; }
      this.vy[i] += this.g[i] * dt;
      this.vx[i] *= 1 - 0.9 * dt;
      this.x[i] += this.vx[i] * dt; this.y[i] += this.vy[i] * dt; this.rot[i] += this.vr[i] * dt;
    }
  }
  draw(c: CanvasRenderingContext2D): void {
    const ga = c.globalAlpha;
    for (let i = 0; i < this.n; i++) {
      if (!this.on[i]) continue;
      const k = this.life[i] / this.max[i], s = this.size[i], kd = this.kind[i];
      c.globalAlpha = ga * (k > 0.35 ? 1 : k / 0.35);
      c.fillStyle = this.col[i];
      if (kd === 0) { c.beginPath(); c.arc(this.x[i], this.y[i], s * (0.5 + k * 0.5), 0, TAU); c.fill(); }
      else if (kd === 1 && cell(c, 'ui_sparkles', 4, i, this.x[i], this.y[i], s * 4.2 * (0.6 + k * 0.4), s * 4.2 * (0.6 + k * 0.4), this.rot[i])) { /* art */ }
      else if (kd === 1) { star(c, this.x[i], this.y[i], s * 1.7 * (0.6 + k * 0.4), this.col[i], null, this.rot[i]); }
      else if (kd === 2 && cell(c, 'ui_confetti', 6, i, this.x[i], this.y[i], s * 3.2, s * 3.2 * (Math.abs(Math.cos(this.rot[i] * 1.3)) * 0.8 + 0.2), this.rot[i])) { /* art */ }
      else if (kd === 2) {
        c.save(); c.translate(this.x[i], this.y[i]); c.rotate(this.rot[i]); c.scale(1, Math.abs(Math.cos(this.rot[i] * 1.3)) * 0.8 + 0.2);
        c.fillRect(-s, -s * 0.6, s * 2, s * 1.2); c.restore();
      } else { c.beginPath(); c.arc(this.x[i], this.y[i], s * (2 - k), 0, TAU); c.lineWidth = 2; c.strokeStyle = this.col[i]; c.stroke(); }
    }
    c.globalAlpha = ga;
  }
}

// ------------------------------------------------------------------------------------------------------------------------------ effects: particles + floating texts + shake + flash
class Floater { on = false; text = ''; x = 0; y = 0; t = 0; life = 1; color: number[] = [255, 255, 255]; font: any = null; scale = 1; shadow: number[] = [20, 10, 0]; rise = 30; }
export class Fx {
  parts = new Particles(170);
  floats: Floater[] = [];
  /** the shake offset of this frame (add it to what is being shaken) */
  sx = 0; sy = 0;
  private amp = 0; private ampT = 0;
  private flashT = 0; private flashDur = 0.4; private flashRGB = '255,40,40'; private flashMax = 0.4;
  time = 0;
  constructor() { for (let i = 0; i < 14; i++) this.floats.push(new Floater()); }
  get busy(): boolean {
    if (this.parts.alive > 0 || this.amp > 0.05 || this.flashT > 0) return true;
    for (const f of this.floats) if (f.on) return true;
    return false;
  }
  float(text: string, x: number, y: number, font: any, color: number[] = [255, 255, 255], o: { life?: number; scale?: number; shadow?: number[]; rise?: number } = {}): void {
    let f = this.floats.find((q) => !q.on);
    if (!f) { f = this.floats[0]; for (const q of this.floats) if (q.t > f.t) f = q; }
    f.on = true; f.text = text; f.x = x; f.y = y; f.t = 0; f.life = o.life ?? 1.0; f.color = color; f.font = font; f.scale = o.scale ?? 1; f.shadow = o.shadow ?? [30, 14, 0]; f.rise = o.rise ?? 30;
  }
  shake(amp: number, secs = 0.35): void { this.amp = Math.max(this.amp, amp); this.ampT = secs; this.ampMax = Math.max(this.amp, amp); }
  private ampMax = 0;
  flash(rgb = '255,40,40', secs = 0.4, max = 0.4): void { this.flashRGB = rgb; this.flashDur = secs; this.flashT = secs; this.flashMax = max; }
  update(dt: number): void {
    this.time += dt;
    this.parts.update(dt);
    for (const f of this.floats) if (f.on) { f.t += dt; if (f.t >= f.life) f.on = false; }
    if (this.flashT > 0) this.flashT = Math.max(0, this.flashT - dt);
    if (this.amp > 0.05) {
      this.ampT -= dt; if (this.ampT <= 0) this.amp = 0;
      else this.amp = this.ampMax * Math.min(1, this.ampT / 0.3);
      this.sx = Math.sin(this.time * 90) * this.amp; this.sy = Math.cos(this.time * 71) * this.amp * 0.6;
    } else { this.amp = 0; this.sx = 0; this.sy = 0; }
  }
  /** the vignette flash (a coloured frame around the area) */
  drawFlash(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
    if (this.flashT <= 0) return;
    const k = this.flashT / this.flashDur;
    c.lineWidth = 18; c.strokeStyle = `rgba(${this.flashRGB},${(this.flashMax * k).toFixed(3)})`;
    c.strokeRect(x + 3, y + 3, w - 6, h - 6);
    c.lineWidth = 8; c.strokeStyle = `rgba(${this.flashRGB},${(this.flashMax * k * 0.8).toFixed(3)})`;
    c.strokeRect(x + 8, y + 8, w - 16, h - 16);
  }
  drawFloats(c: CanvasRenderingContext2D): void {
    for (const f of this.floats) {
      if (!f.on) continue;
      const k = f.t / f.life, pop = k < 0.18 ? E.outBack(k / 0.18) : 1, a = k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1;
      gtext(c, f.font, f.text, f.x, f.y - E.out(k) * f.rise, f.color, { align: 'c', scale: f.scale * (0.4 + 0.6 * pop), alpha: a, shadow: f.shadow });
    }
  }
  draw(c: CanvasRenderingContext2D): void { this.parts.draw(c); this.drawFloats(c); }
  confetti(x: number, y: number, n = 60): void {
    this.parts.burst(x, y, n, ['#ff5a6a', '#ffd84a', '#5ad06a', '#4aa8ff', '#ffffff', '#ff9a3a'], { speed: 230, up: 120, size: 3, kind: 2, life: 1.6, g: 340 });
  }
}

// ------------------------------------------------------------------------------------------------------------------------------ result banner with stars
export interface Finale { t: number; sparked: boolean[] }
/** the end of a minigame drawn over its board: a ribbon with the title and three stars that pop one after the other (`earned` of them in gold) */
export function drawFinale(c: CanvasRenderingContext2D, W: number, H: number, fx: Fx, f24: any, f14: any, fin: Finale, now: number, title: string, earned: number, sub: string): void {
  const k = (now - fin.t) / 1000;
  if (k < 0) return;
  const y0 = H / 2;
  c.fillStyle = `rgba(24,14,4,${(0.72 * clamp01(k / 0.25)).toFixed(3)})`; c.fillRect(0, 0, W, H);
  const e = E.outBack(clamp01(k / 0.5)), bw = Math.min(W - 24, 280), bh = 46;
  c.save(); c.translate(W / 2, y0 - 40); c.scale(e, e);
  rr(c, -bw / 2 + 3, -bh / 2 + 5, bw, bh, 10); c.fillStyle = 'rgba(0,0,0,0.35)'; c.fill();
  rr(c, -bw / 2, -bh / 2, bw, bh, 10); c.fillStyle = '#d23c3c'; c.fill(); c.lineWidth = 3.5; c.strokeStyle = '#3a0c0c'; c.stroke();
  rr(c, -bw / 2 + 4, -bh / 2 + 4, bw - 8, bh * 0.4, 7); c.fillStyle = 'rgba(255,255,255,0.22)'; c.fill();
  c.restore();
  gtext(c, f24, title, W / 2, y0 - 40, [255, 244, 214], { align: 'c', scale: e, shadow: [60, 10, 10] });
  for (let i = 0; i < 3; i++) {
    const kk = (k - (0.45 + i * 0.28)) / 0.6;
    if (kk <= 0) continue;
    const s = E.outElastic(clamp01(kk)), x = W / 2 + (i - 1) * 62, y = y0 + 24, gold = i < earned;
    uiStar(c, x, y, 26 * s * (gold ? 1 : 0.85), gold, gold ? (1 - clamp01(kk)) * 0.6 : 0, '#ffcf2e', '#6b5a3c', '#3a2608');
    if (gold && !fin.sparked[i]) { fin.sparked[i] = true; fx.parts.burst(x, y, 14, ['#ffe680', '#ffffff', '#ffb030'], { speed: 120, kind: 1, size: 3, life: 0.8, up: 30 }); }
  }
  gtext(c, f14, sub, W / 2, y0 + 68, [244, 230, 184], { align: 'c', alpha: clamp01((k - 1) / 0.4), shadow: [20, 10, 0] });
}

// ------------------------------------------------------------------------------------------------------------------------------ overlay for the classic minigames
/** an invisible item for the mouse: the clicks pass through it */
class FxItem extends ItemImage { is_over(): boolean { return false; } }
const COLORS_OK = ['#ffd84a', '#7fe06a', '#ffffff', '#ffa83a'];
const COLORS_BAD = ['#ff5a4a', '#c43030', '#ffb0a0'];
export const FX_OK = COLORS_OK;
export const FX_BAD = COLORS_BAD;

/** A transparent surface over the minigame (600x450) where the particles, floating texts and flashes of the classic minigames are drawn. It repaints only
 *  while something moves. `shaken` items are moved by the shake of the overlay and put back afterwards. */
export class FxOverlay extends Fx {
  surface: any; item: any; stage: any; font: any;
  private last = 0; private dirty = false; private running = false;
  private shaken: [any, number, number][] = [];
  constructor(stage: any, layer: any, font: any) {
    super();
    this.stage = stage; this.font = font;
    this.surface = new pygame.Surface([600, 450], pygame.SRCALPHA, 32);
    this.item = new FxItem(0, 0, new assets.Image(this.surface));
    layer.add(this.item);
  }
  /** moves the overlay above what was added to the layer after it */
  top(): void { const l = this.item.get_layer(); if (l) { l.remove(this.item); l.add(this.item); } }
  /** items that jump with the shake (the offset is applied as a delta, so whatever else moves the item meanwhile is not undone) */
  shakeItems(items: any[]): void {
    this.restore();
    this.shaken = items.map((it) => [it, 0, 0]);
    this.wake();
  }
  /** lets an item go before something else moves it: its shake offset is taken off and it is not shaken any more */
  release(item: any): void {
    this.shaken = this.shaken.filter((s) => { if (s[0] !== item) return true; item.set_lefttop(item.get_left() - s[1], item.get_top() - s[2]); return false; });
  }
  shake(amp: number, secs = 0.35): void { super.shake(amp, secs); this.wake(); }
  private restore(): void { for (const s of this.shaken) { s[0].set_lefttop(s[0].get_left() - s[1], s[0].get_top() - s[2]); s[1] = s[2] = 0; } this.shaken = []; }
  private wake(): void {
    if (this.running) return;
    this.running = true; this.last = pygame.time.get_ticks();
    this.stage.start_timer('mgfx', 33, () => this.tick(), null, true, false);
  }
  burst(x: number, y: number, count: number, colors: string[] = COLORS_OK, o: any = {}): void { this.parts.burst(x, y, count, colors, o); this.wake(); }
  say(text: string, x: number, y: number, color: number[] = [255, 255, 255], o: any = {}): void { this.float(text, x, y, o.font || this.font, color, o); this.wake(); }
  good(x: number, y: number, text = '', n = 18): void { this.parts.burst(x, y, n, COLORS_OK, { speed: 150, up: 40, size: 3, kind: 1, life: 0.9 }); this.parts.burst(x, y, 8, COLORS_OK, { kind: 3, speed: 0, size: 6, life: 0.5, g: 0 }); if (text) this.float(text, x, y - 14, this.font, [255, 235, 120], { life: 1.1 }); this.wake(); }
  bad(x: number, y: number, text = '', amp = 5): void { this.parts.burst(x, y, 10, COLORS_BAD, { speed: 110, size: 2.5, life: 0.5, g: 200 }); this.flash('255,40,40', 0.45, 0.4); this.shake(amp, 0.35); if (text) this.float(text, x, y - 12, this.font, [255, 120, 100], { life: 0.9 }); this.wake(); }
  confetti(x: number, y: number, n = 60): void { super.confetti(x, y, n); this.wake(); }
  tick(): void {
    const now = pygame.time.get_ticks(), dt = Math.min(0.1, (now - this.last) / 1000); this.last = now;
    if (!this.item.get_layer() || !this.item.get_layer().get_stage()) { this.stage.stop_timer('mgfx'); this.running = false; return; }
    const was = this.busy;
    this.update(dt);
    if (this.custom) this.ct += dt;
    for (const s of this.shaken) { const nx = Math.round(this.sx), ny = Math.round(this.sy); s[0].set_lefttop(s[0].get_left() - s[1] + nx, s[0].get_top() - s[2] + ny); s[1] = nx; s[2] = ny; }
    if (this.busy || this.customLive) {
      const c = this.surface.ctx;
      c.clearRect(0, 0, 600, 450);
      this.drawFlash(c, 0, 0, 600, 450);
      if (this.custom) this.customLive = this.custom(c, this.ct);
      this.draw(c);
      this.dirty = true;
    } else {
      this.restore();
      // a drawing that is still on the surface (the stars of the result) stays until the overlay is thrown away
      if ((this.dirty || was) && !this.custom) { this.surface.ctx.clearRect(0, 0, 600, 450); this.dirty = false; }
      this.stage.stop_timer('mgfx'); this.running = false;
    }
  }
  /** a drawing of its own: `fn(ctx, seconds)` is called every frame and returns true while it is still animating (its last frame stays on the surface) */
  run(fn: (c: any, t: number) => boolean): void { this.custom = fn; this.ct = 0; this.customLive = true; this.wake(); }
  custom: ((c: any, t: number) => boolean) | null = null; private ct = 0; private customLive = false;
}

/** The result of a classic minigame: three stars pop up one after the other on the score screen (gold = earned). Returns the overlay. */
export function showStars(stage: any, layer: any, font: any, earned: number, cx: number, cy: number, r = 13): FxOverlay {
  const fx = new FxOverlay(stage, layer, font), spark = [false, false, false];
  fx.run((c, t) => {
    for (let i = 0; i < 3; i++) {
      const kk = (t - 0.2 - i * 0.3) / 0.6;
      if (kk <= 0) continue;
      const gold = i < earned, x = cx + (i - 1) * (r * 2.7), s = E.outElastic(clamp01(kk));
      uiStar(c, x, cy, r * s * (gold ? 1 : 0.8), gold, gold ? (1 - clamp01(kk)) * 0.7 : 0, '#ffcf2e', '#6b5a3c', '#2a1a06');
      if (gold && !spark[i]) {
        spark[i] = true; blip(620 + i * 150, 0.14, 0.18, 'triangle');
        fx.parts.burst(x, cy, 12, ['#ffe680', '#ffffff', '#ffb030'], { speed: 110, kind: 1, size: 2.6, life: 0.8, up: 30 });
        if (i === 2 && earned === 3) fx.confetti(cx, cy - 20, 40);
      }
    }
    return t < 0.2 + 2 * 0.3 + 0.7;
  });
  return fx;
}
