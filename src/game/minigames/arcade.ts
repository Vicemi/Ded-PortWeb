// @ts-nocheck
// Base of the real-time canvas minigames (Mate cebado, Rambla): the board is one surface that is repainted by a timer (the frame cache treats a
// surface that changed as dynamic, same as the candombe), with the mouse / touch / keyboard input, particles, screen shake and a floating message.
import { NewMinigame } from './newgames';
import { ItemImage, pygame } from '../../runtime/prelude';
import * as assets from '../../engine/assets';
import { cell } from './mgart';

export const BX = 104, BY = 74, BW = 335, BH = 272;   // the inside of the board of the minigames (same as newgames.ts)

export const clamp = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, k: number): number => a + (b - a) * k;
export const easeOut = (k: number): number => 1 - (1 - k) * (1 - k) * (1 - k);
export const easeOutBack = (k: number): number => { const c = 1.70158; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };

export class ArcadeGame extends NewMinigame {
  build(): void {
    this.surface = new pygame.Surface([BW, BH], pygame.SRCALPHA, 32);
    this.view = new ItemImage(BX, BY, new assets.Image(this.surface));
    this.layer.add(this.view);
    this.t = 0; this.parts = []; this.shake = 0; this.flash = 0; this.flashColor = '255,255,255'; this.msg = ''; this.msg_t = -9; this.msg_color = '#fff';
    this.last = null; this.keys = {};
    this.setup();
    this.draw();
  }
  /** each game builds its state */
  setup(): void { /* */ }
  update(dt: number): void { /* */ }
  paint(c: any, W: number, H: number): void { /* */ }
  /** the action input went down (x, y = -1 for a key) / every input was released */
  onDown(x: number, y: number): void { /* */ }
  onUp(): void { /* */ }

  on_start(): void {
    this.last = pygame.time.get_ticks();
    this.stage.start_timer('new_minigame_tick', 20, () => this.frame(), null, true, false);
  }
  frame(): void {
    if (this.minigame_solved) return;
    const now = pygame.time.get_ticks(), dt = Math.min(50, now - (this.last ?? now)) / 1000;
    this.last = now;
    this.t += dt;
    this.update(dt);
    this.stepParticles(dt);
    this.shake = Math.max(0, this.shake - dt * 30); this.flash = Math.max(0, this.flash - dt * 2.4);
    this.draw();
  }
  draw(): void {
    const c = this.surface.ctx;
    c.save();
    c.clearRect(0, 0, BW, BH);
    c.beginPath(); c.rect(0, 0, BW, BH); c.clip();
    if (this.shake > 0.1) c.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);
    this.paint(c, BW, BH);
    this.drawParticles(c);
    c.restore();
    if (this.flash > 0.01) { c.fillStyle = `rgba(${this.flashColor},${0.35 * this.flash})`; c.fillRect(0, 0, BW, BH); }
    if (this.t - this.msg_t < 1.1 && this.msg) {
      const k = (this.t - this.msg_t) / 1.1, a = k < 0.75 ? 1 : 1 - (k - 0.75) / 0.25, sc = 0.6 + 0.4 * easeOutBack(Math.min(1, k * 5));
      c.save(); c.translate(BW / 2, 58 - k * 10); c.scale(sc, sc); c.globalAlpha = a;
      c.font = 'bold 24px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.lineWidth = 6; c.strokeStyle = 'rgba(30,16,6,0.85)'; c.strokeText(this.msg, 0, 0);
      c.fillStyle = this.msg_color; c.fillText(this.msg, 0, 0); c.restore();
    }
  }
  say(text: string, color = '#fff'): void { this.msg = text; this.msg_t = this.t; this.msg_color = color; }
  bump(shake: number, flash = 0, color = '255,60,40'): void { this.shake = Math.max(this.shake, shake); if (flash) { this.flash = flash; this.flashColor = color; } }

  // ---------------------------------------------------------------------------------------------------------------- particles
  /** a burst of `n` particles: o = { color, speed, life, size, grav, spread (rad), angle (rad), kind: 'dot' | 'ring' | 'steam' } */
  burst(x: number, y: number, n: number, o: any): void {
    for (let i = 0; i < n; i++) {
      const a = (o.angle ?? -Math.PI / 2) + (Math.random() - 0.5) * (o.spread ?? Math.PI * 2), v = (o.speed ?? 80) * (0.4 + Math.random() * 0.6);
      const life = (o.life ?? 0.6) * (0.6 + Math.random() * 0.6);
      this.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life, max: life, size: (o.size ?? 3) * (0.6 + Math.random() * 0.8), grav: o.grav ?? 0, color: o.color ?? '#fff', kind: o.kind ?? 'dot', drag: o.drag ?? 0, art: o.art, cell: (Math.random() * 6) | 0 });
    }
    if (this.parts.length > 260) this.parts.splice(0, this.parts.length - 260);
  }
  stepParticles(dt: number): void {
    for (const p of this.parts) { p.life -= dt; p.vy += p.grav * dt; if (p.drag) { p.vx *= 1 - p.drag * dt; p.vy *= 1 - p.drag * dt; } p.x += p.vx * dt; p.y += p.vy * dt; }
    this.parts = this.parts.filter((p) => p.life > 0);
  }
  drawParticles(c: any): void {
    for (const p of this.parts) {
      const k = p.life / p.max;
      // optional art (mg_*.png sheets); the procedural drawing below stays when it is missing
      if (p.art ? cell(c, p.art, 4, p.cell, p.x, p.y, p.size * 5, p.size * 5, p.life * 3, c.globalAlpha = Math.min(1, k * 1.5))
        : p.kind === 'steam' ? cell(c, 'mate_steam', 4, p.cell, p.x, p.y, p.size * (1.8 - k) * 3.2, p.size * (1.8 - k) * 3.2, 0, c.globalAlpha = 0.7 * k)
        : p.kind === 'star' && cell(c, 'ui_sparkles', 4, p.cell, p.x, p.y, p.size * 3.6, p.size * 3.6, p.life * 4, c.globalAlpha = Math.min(1, k * 1.6))) continue;
      if (p.kind === 'steam') {
        c.globalAlpha = 0.28 * k; c.fillStyle = p.color; c.beginPath(); c.arc(p.x, p.y, p.size * (1.8 - k), 0, 7); c.fill();
      } else if (p.kind === 'ring') {
        c.globalAlpha = k; c.strokeStyle = p.color; c.lineWidth = 2.5; c.beginPath(); c.arc(p.x, p.y, p.size * (2.6 - 1.6 * k), 0, 7); c.stroke();
      } else if (p.kind === 'star') {
        c.globalAlpha = Math.min(1, k * 1.6); c.fillStyle = p.color; c.save(); c.translate(p.x, p.y); c.rotate(p.life * 6);
        c.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? p.size * 0.45 : p.size * 1.4, a = i * Math.PI / 4; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); c.restore();
      } else { c.globalAlpha = Math.min(1, k * 1.5); c.fillStyle = p.color; c.beginPath(); c.arc(p.x, p.y, p.size * (0.4 + 0.6 * k), 0, 7); c.fill(); }
    }
    c.globalAlpha = 1;
  }

  // ---------------------------------------------------------------------------------------------------------------- input (mouse, touch, keyboard)
  minigame_handle_event(e: any): any {
    if (e.type === pygame.MOUSEBUTTONDOWN && e.button === 1) {
      const x = e.pos[0] - BX, y = e.pos[1] - BY;
      if (x >= 0 && y >= 0 && x < BW && y < BH && this.start_time !== null && !this.minigame_solved) { this.pointer = true; this.onDown(x, y); return true; }
    } else if (e.type === pygame.MOUSEBUTTONUP && e.button === 1) {
      if (this.pointer) { this.pointer = false; if (!this.held()) this.onUp(); return true; }
    } else if (e.type === pygame.KEYDOWN || e.type === pygame.KEYUP) {
      const k = e.key, down = e.type === pygame.KEYDOWN;
      const name = k === 32 || k === 13 || k === 273 || k === 274 ? 'act' : '';   // space, enter, up, down
      if (name && !this.minigame_solved && this.start_time !== null) {
        if (down === !!this.keys[k]) return true;   // key repeat
        this.keys[k] = down; if (down) this.onDown(-1, -1); else if (!this.held()) this.onUp(); return true;
      }
    }
    return null;
  }
  /** the action input (mouse, touch or a key) is being held */
  held(): boolean { return !!this.pointer || Object.values(this.keys).some(Boolean); }
  /** the board stops: nothing can stay pressed */
  stop_minigame(solved: any): any {
    const was = this.held();
    this.keys = {}; this.pointer = false;
    if (was) this.onUp();
    return super.stop_minigame(solved);
  }
}
