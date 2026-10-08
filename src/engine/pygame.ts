// A tiny slice of pygame 1.9 (the library the original game used), just what the game and its framework need: rectangles, surfaces drawn on
// <canvas>, the event queue, the clock and the keyboard/mouse state. Names follow pygame so the rest of the port reads like the original.

export type Color = readonly number[];

const trunc = Math.trunc;

/** pygame.Rect: integer fields (floats are truncated toward zero like pygame 1.9 does) */
export class Rect {
  x: number; y: number; w: number; h: number;
  constructor(x = 0, y = 0, w = 0, h = 0) { this.x = trunc(x); this.y = trunc(y); this.w = trunc(w); this.h = trunc(h); }
  static from(r: Rect | readonly number[]): Rect { return r instanceof Rect ? r : new Rect(r[0], r[1], r[2], r[3]); }
  get left(): number { return this.x; }
  set left(v: number) { this.x = trunc(v); }
  get top(): number { return this.y; }
  set top(v: number) { this.y = trunc(v); }
  get width(): number { return this.w; }
  set width(v: number) { this.w = trunc(v); }
  get height(): number { return this.h; }
  set height(v: number) { this.h = trunc(v); }
  get right(): number { return this.x + this.w; }
  set right(v: number) { this.x = trunc(v) - this.w; }
  get bottom(): number { return this.y + this.h; }
  set bottom(v: number) { this.y = trunc(v) - this.h; }
  get size(): [number, number] { return [this.w, this.h]; }
  get topleft(): [number, number] { return [this.x, this.y]; }
  set topleft(v: readonly number[]) { this.x = trunc(v[0]); this.y = trunc(v[1]); }
  get centerx(): number { return this.x + trunc(this.w / 2); }
  get centery(): number { return this.y + trunc(this.h / 2); }
  get center(): [number, number] { return [this.centerx, this.centery]; }
  set center(v: readonly number[]) { this.x = trunc(v[0]) - trunc(this.w / 2); this.y = trunc(v[1]) - trunc(this.h / 2); }
  copy(): Rect { return new Rect(this.x, this.y, this.w, this.h); }
  move(dx: number, dy: number): Rect { return new Rect(this.x + dx, this.y + dy, this.w, this.h); }
  collidepoint(px: number, py: number): boolean { return px >= this.x && px < this.x + this.w && py >= this.y && py < this.y + this.h; }
  colliderect(o: Rect): boolean { return this.x < o.x + o.w && o.x < this.x + this.w && this.y < o.y + o.h && o.y < this.y + this.h; }
  union(o: Rect): Rect {
    const x = Math.min(this.x, o.x), y = Math.min(this.y, o.y);
    return new Rect(x, y, Math.max(this.x + this.w, o.x + o.w) - x, Math.max(this.y + this.h, o.y + o.h) - y);
  }
  clip(o: Rect): Rect {
    const x = Math.max(this.x, o.x), y = Math.max(this.y, o.y);
    const r = Math.min(this.x + this.w, o.x + o.w), b = Math.min(this.y + this.h, o.y + o.h);
    if (r <= x || b <= y) return new Rect(this.x, this.y, 0, 0);
    return new Rect(x, y, r - x, b - y);
  }
  equals(o: Rect | null): boolean { return !!o && o.x === this.x && o.y === this.y && o.w === this.w && o.h === this.h; }
}

// ------------------------------------------------------------------------------------------------------------------ clock
let clockOverride: (() => number) | null = null;
/** tests drive the game with a virtual clock */
export function setClock(fn: (() => number) | null): void { clockOverride = fn; }
export const time = {
  get_ticks(): number { return clockOverride ? clockOverride() : performance.now(); },
};

// ------------------------------------------------------------------------------------------------------------------ surfaces
type Canvas = HTMLCanvasElement;

function newCanvas(w: number, h: number): Canvas {
  const c = document.createElement('canvas');
  c.width = Math.max(0, w); c.height = Math.max(0, h);
  return c;
}

/** pygame.Surface on top of a canvas. `srcalpha` = pygame.SRCALPHA (per-pixel alpha); surfaces without it are opaque. */
export class Surface {
  canvas: Canvas;
  ctx: CanvasRenderingContext2D;
  readonly srcalpha: boolean;
  private clipRect: Rect | null = null;
  private clipOn = false;
  /** straight RGBA copy of the pixels, valid until the surface is drawn on */
  private pix: Uint8ClampedArray | null = null;
  /** alpha of the whole surface (Surface.set_alpha); 255 = opaque */
  alpha = 255;

  constructor(w: number, h: number, srcalpha = true, canvas?: Canvas) {
    this.srcalpha = srcalpha;
    this.canvas = canvas ?? newCanvas(w, h);
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true, alpha: true })!;
    this.ctx.imageSmoothingEnabled = false;
    if (!canvas && !srcalpha && w > 0 && h > 0) { this.ctx.fillStyle = '#000'; this.ctx.fillRect(0, 0, w, h); }
  }
  /** a surface that already has its pixels (images) */
  static fromRGBA(w: number, h: number, data: Uint8ClampedArray, srcalpha: boolean): Surface {
    const s = new Surface(w, h, srcalpha);
    if (w > 0 && h > 0) s.ctx.putImageData(new ImageData(data as Uint8ClampedArray<ArrayBuffer>, w, h), 0, 0);
    s.pix = data;
    return s;
  }
  get_width(): number { return this.canvas.width; }
  get_height(): number { return this.canvas.height; }
  get_size(): [number, number] { return [this.canvas.width, this.canvas.height]; }
  get_rect(): Rect { return new Rect(0, 0, this.canvas.width, this.canvas.height); }
  get_bitsize(): number { return this.srcalpha ? 32 : 24; }
  set_alpha(a: number): void { this.alpha = a; }

  // ---- clip
  set_clip(r: Rect | null): void {
    if (this.clipOn) { this.ctx.restore(); this.clipOn = false; }
    this.clipRect = r;
    if (r) {
      this.ctx.save(); this.ctx.beginPath(); this.ctx.rect(r.x, r.y, r.w, r.h); this.ctx.clip();
      this.clipOn = true;
    }
  }
  get_clip(): Rect | null { return this.clipRect; }

  // ---- drawing
  /** fill(color, rect): replaces the pixels (no blending), like SDL_FillRect */
  fill(color: Color, rect?: Rect | readonly number[] | null): void {
    const c = this.ctx;
    const r = rect ? Rect.from(rect as Rect | readonly number[]) : new Rect(0, 0, this.canvas.width, this.canvas.height);
    const a = this.srcalpha && color.length >= 4 ? color[3] : 255;
    this.pix = null;
    c.save();
    c.globalAlpha = 1;
    c.globalCompositeOperation = 'copy';
    // 'copy' clears everything outside of the shape inside the clip: confine it to the rectangle
    c.beginPath(); c.rect(r.x, r.y, r.w, r.h); c.clip();
    c.fillStyle = `rgba(${color[0] | 0},${color[1] | 0},${color[2] | 0},${a / 255})`;
    c.fillRect(r.x, r.y, r.w, r.h);
    c.restore();
  }
  /** blit(source, dest, area): dest is a position (x, y) or a Rect (only its top-left counts) */
  blit(src: Surface | Canvas, dest: readonly number[] | Rect, area?: Rect | readonly number[] | null): void {
    const sc = src instanceof Surface ? src.canvas : src;
    const dx = trunc(dest instanceof Rect ? dest.x : dest[0]), dy = trunc(dest instanceof Rect ? dest.y : dest[1]);
    this.pix = null;
    const c = this.ctx;
    const a = src instanceof Surface ? src.alpha : 255;
    if (a !== 255) c.globalAlpha = a / 255;
    if (area) {
      const ar = Rect.from(area as Rect | readonly number[]);
      // blit clips the area to the source like SDL does
      const sx = Math.max(0, ar.x), sy = Math.max(0, ar.y);
      const sw = Math.min(ar.x + ar.w, sc.width) - sx, sh = Math.min(ar.y + ar.h, sc.height) - sy;
      if (sw > 0 && sh > 0) c.drawImage(sc, sx, sy, sw, sh, dx + (sx - ar.x), dy + (sy - ar.y), sw, sh);
    } else if (sc.width > 0 && sc.height > 0) c.drawImage(sc, dx, dy);
    if (a !== 255) c.globalAlpha = 1;
  }
  /** blit with an extra alpha factor 0..255 multiplied in */
  blit_alpha(src: Surface, dest: readonly number[], alpha: number, area?: Rect | readonly number[] | null): void {
    const c = this.ctx;
    c.globalAlpha = Math.max(0, Math.min(1, alpha / 255));
    this.blit(src, dest, area);
    c.globalAlpha = 1;
  }
  copy(): Surface {
    const s = new Surface(this.canvas.width, this.canvas.height, this.srcalpha);
    if (this.canvas.width > 0 && this.canvas.height > 0) {
      s.ctx.globalCompositeOperation = 'copy';
      s.ctx.drawImage(this.canvas, 0, 0);
      s.ctx.globalCompositeOperation = 'source-over';
    }
    s.alpha = this.alpha;
    return s;
  }
  /** pygame.Surface.subsurface (a copy: the game never draws through a subsurface back into the parent) */
  subsurface(r: Rect): Surface {
    const s = new Surface(r.w, r.h, this.srcalpha);
    s.blit(this, [0, 0], r);
    return s;
  }
  /** Straight RGBA of the whole surface (cached until the next draw) */
  pixels(): Uint8ClampedArray {
    if (!this.pix) {
      const w = this.canvas.width, h = this.canvas.height;
      this.pix = w > 0 && h > 0 ? this.ctx.getImageData(0, 0, w, h).data : new Uint8ClampedArray(0);
    }
    return this.pix;
  }
  setPixels(data: Uint8ClampedArray): void {
    const w = this.canvas.width, h = this.canvas.height;
    if (w > 0 && h > 0) {
      this.ctx.save(); this.ctx.globalCompositeOperation = 'copy';
      this.ctx.putImageData(new ImageData(data as Uint8ClampedArray<ArrayBuffer>, w, h), 0, 0);
      this.ctx.restore();
    }
    this.pix = data;
  }
  /** get_at: [r, g, b, a]; throws outside of the surface like pygame ("pixel index out of range") */
  get_at(x: number, y: number): [number, number, number, number] {
    x = trunc(x); y = trunc(y);
    const w = this.canvas.width;
    if (x < 0 || y < 0 || x >= w || y >= this.canvas.height) throw new RangeError('pixel index out of range');
    const p = this.pixels(), i = (y * w + x) * 4;
    return [p[i], p[i + 1], p[i + 2], this.srcalpha ? p[i + 3] : 255];
  }
}

/** pygame.draw / pygame.transform */
export const draw = {
  rect(s: Surface, color: Color, r: Rect | readonly number[], width = 0): void {
    const rr = Rect.from(r as Rect | readonly number[]);
    const c = s.ctx;
    (s as unknown as { pix: null }).pix = null;
    c.save();
    const a = color.length >= 4 ? color[3] / 255 : 1;
    const col = `rgba(${color[0] | 0},${color[1] | 0},${color[2] | 0},${a})`;
    if (width === 0) { c.fillStyle = col; c.fillRect(rr.x, rr.y, rr.w, rr.h); }
    else {
      c.fillStyle = col; // pygame draws the outline inside the rectangle
      c.fillRect(rr.x, rr.y, rr.w, width); c.fillRect(rr.x, rr.y + rr.h - width, rr.w, width);
      c.fillRect(rr.x, rr.y, width, rr.h); c.fillRect(rr.x + rr.w - width, rr.y, width, rr.h);
    }
    c.restore();
  },
  line(s: Surface, color: Color, a: readonly number[], b: readonly number[], width = 1): void {
    const c = s.ctx;
    (s as unknown as { pix: null }).pix = null;
    c.save();
    c.strokeStyle = `rgb(${color[0] | 0},${color[1] | 0},${color[2] | 0})`;
    c.lineWidth = width;
    c.beginPath(); c.moveTo(a[0] + 0.5, a[1] + 0.5); c.lineTo(b[0] + 0.5, b[1] + 0.5); c.stroke();
    c.restore();
  },
};

export const transform = {
  flip(s: Surface, h: boolean, v: boolean): Surface {
    const o = new Surface(s.get_width(), s.get_height(), s.srcalpha);
    if (s.get_width() > 0 && s.get_height() > 0) {
      const c = o.ctx;
      c.save();
      c.globalCompositeOperation = 'copy';
      c.translate(h ? o.get_width() : 0, v ? o.get_height() : 0);
      c.scale(h ? -1 : 1, v ? -1 : 1);
      c.drawImage(s.canvas, 0, 0);
      c.restore();
    }
    return o;
  },
  /** nearest neighbour */
  scale(s: Surface, size: readonly number[]): Surface {
    const o = new Surface(Math.max(0, trunc(size[0])), Math.max(0, trunc(size[1])), s.srcalpha);
    if (o.get_width() > 0 && o.get_height() > 0 && s.get_width() > 0 && s.get_height() > 0) {
      o.ctx.imageSmoothingEnabled = false;
      o.ctx.drawImage(s.canvas, 0, 0, s.get_width(), s.get_height(), 0, 0, o.get_width(), o.get_height());
    }
    return o;
  },
  smoothscale(s: Surface, size: readonly number[]): Surface {
    const o = new Surface(Math.max(0, trunc(size[0])), Math.max(0, trunc(size[1])), s.srcalpha);
    if (o.get_width() > 0 && o.get_height() > 0 && s.get_width() > 0 && s.get_height() > 0) {
      o.ctx.imageSmoothingEnabled = true; o.ctx.imageSmoothingQuality = 'high';
      o.ctx.drawImage(s.canvas, 0, 0, s.get_width(), s.get_height(), 0, 0, o.get_width(), o.get_height());
    }
    return o;
  },
};

// ------------------------------------------------------------------------------------------------------------------ events
export const QUIT = 12, ACTIVEEVENT = 1, KEYDOWN = 2, KEYUP = 3, MOUSEMOTION = 4, MOUSEBUTTONDOWN = 5, MOUSEBUTTONUP = 6, USEREVENT = 24;

export const KMOD_NONE = 0, KMOD_LSHIFT = 1, KMOD_RSHIFT = 2, KMOD_LCTRL = 64, KMOD_RCTRL = 128, KMOD_LALT = 256, KMOD_RALT = 512;
export const KMOD_SHIFT = KMOD_LSHIFT | KMOD_RSHIFT, KMOD_CTRL = KMOD_LCTRL | KMOD_RCTRL, KMOD_ALT = KMOD_LALT | KMOD_RALT;

export const K = {
  BACKSPACE: 8, TAB: 9, RETURN: 13, ESCAPE: 27, SPACE: 32, DELETE: 127,
  KP0: 256, KP1: 257, KP2: 258, KP3: 259, KP4: 260, KP5: 261, KP6: 262, KP7: 263, KP8: 264, KP9: 265,
  UP: 273, DOWN: 274, RIGHT: 275, LEFT: 276, INSERT: 277, HOME: 278, END: 279, PAGEUP: 280, PAGEDOWN: 281,
  F1: 282, F2: 283, F3: 284, F4: 285, F5: 286, F6: 287, F7: 288, F8: 289, F9: 290, F10: 291, F11: 292, F12: 293,
} as const;
/** pygame key for a letter / digit: its lowercase ASCII code */
export const key = (c: string): number => c.toLowerCase().charCodeAt(0);

export interface PgEvent {
  type: number;
  key?: number; mod?: number; unicode?: string;
  pos?: [number, number]; rel?: [number, number]; buttons?: [number, number, number]; button?: number;
  gain?: number; state?: number;
}

class InputState {
  queue: PgEvent[] = [];
  pos: [number, number] = [0, 0];
  buttons: [number, number, number] = [0, 0, 0];
  pressed = new Set<number>();
  mods = 0;
  grab = false;
  repeat: [number, number] | null = null;
  /** the last pointer was a finger: no mouse cursor is drawn */
  touch = false;
}
export const input = new InputState();

export const event = {
  get(): PgEvent[] { const q = input.queue; input.queue = []; return q; },
  post(e: PgEvent): void { input.queue.push(e); },
  clear(type?: number): void { input.queue = type === undefined ? [] : input.queue.filter((e) => e.type !== type); },
  set_grab(v: boolean): void { input.grab = v; },
  get_grab(): boolean { return input.grab; },
};
export const mouse = {
  get_pos(): [number, number] { return [input.pos[0], input.pos[1]]; },
  get_pressed(): [number, number, number] { return [input.buttons[0], input.buttons[1], input.buttons[2]]; },
  set_pos(x: number, y: number): void { input.pos = [trunc(x), trunc(y)]; },
  set_visible(_v: boolean): void { /* the cursor is drawn by the game itself */ },
};
export const keyboard = {
  get_pressed(): { has(k: number): boolean } { return input.pressed; },
  get_mods(): number { return input.mods; },
  set_repeat(delay?: number, interval?: number): void { input.repeat = delay === undefined ? null : [delay, interval ?? delay]; },
};

/** Python 2 helpers used by the port */
export const py = {
  /** int() of a float: truncates toward zero */
  int: (v: number): number => trunc(v),
  /** Python 2 integer division of ints (floor) */
  idiv: (a: number, b: number): number => Math.floor(a / b),
  /** Python's % (result has the sign of the divisor) */
  mod: (a: number, b: number): number => ((a % b) + b) % b,
};
