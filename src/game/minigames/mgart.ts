// @ts-nocheck
// Optional art of the new minigames (art_inbox/mg_*.png -> tools/build_minigame_art.py -> images `mg_<name>.png`). Every drawing helper returns false / null when the
// image does not exist, so the caller keeps its procedural drawing, element by element. Decoded canvases and resized copies are cached (nothing is
// decoded or allocated per frame). `artStats.drawn` counts the images painted (the scenario minigame_art checks it).
// ASPECT RATIO: nothing is ever stretched. A picture goes into its box either 'fit' (contained, centred; ay = 1 sits it on the bottom edge) or 'cover'
// (centre-cropped to fill the box); 'fit' is the default. `artStats.audit` (an array, set by the scenario art_aspect) records every drawn picture.
import * as assets from '../../engine/assets';
import { pygame } from '../../runtime/prelude';

export const artStats: { drawn: number; audit: any[] | null } = { drawn: 0, audit: null };
const srcs = new Map<string, any>();
const copies = new Map<string, any>();
export type Fit = 'fit' | 'cover';

/** audit hook: the source rect (sw x sh) lands as dw x dh inside a box of bw x bh. `flip` = an animation that squashes on purpose (confetti turning over) */
export function note(tag: string, name: string, sw: number, sh: number, dw: number, dh: number, bw = dw, bh = dh, mode: string = 'fit', flip = false): void {
  const a = artStats.audit;
  if (a) a.push({ tag, name, sw, sh, dw, dh, bw, bh, mode, flip });
}

/** the decoded canvas of `mg_<name>.png`, or null when there is no such image */
export function src(name: string): any {
  let s = srcs.get(name);
  if (s) return s;
  const f = `mg_${name}.png`;
  if (!assets.has_image(f)) return null;
  s = assets.load_surface(f).canvas;
  srcs.set(name, s);
  return s;
}
export const has = (name: string): boolean => src(name) !== null;
/** width / height of the picture (1 when there is none): a strip derives its tile width from it */
export const aspect = (name: string): number => { const s = src(name); return s ? s.width / s.height : 1; };

/** where a sw x sh source lands in a w x h box: the scale and the offset (fit: all of it inside; cover: the box is filled, the overflow is cropped) */
export function place(sw: number, sh: number, w: number, h: number, mode: Fit = 'fit', ax = 0.5, ay = 0.5): { dw: number; dh: number; dx: number; dy: number } {
  const k = mode === 'cover' ? Math.max(w / sw, h / sh) : Math.min(w / sw, h / sh), dw = sw * k, dh = sh * k;
  return { dw, dh, dx: (w - dw) * ax, dy: (h - dh) * ay };
}

/** a copy of the part (sx, sw wide, full height) of the image placed in a w x h canvas with smoothing, cached */
export function crop(name: string, sx: number, sw: number, w: number, h: number, mode: Fit = 'fit', ay = 0.5, ax = 0.5): any {
  const key = `${name}|${sx}|${sw}|${w}|${h}|${mode}|${ay}|${ax}`;
  let cv = copies.get(key);
  if (cv) return cv;
  const s = src(name);
  if (!s) return null;
  const surf = new pygame.Surface([w, h], pygame.SRCALPHA, 32), c = surf.ctx, p = place(sw, s.height, w, h, mode, ax, ay);
  c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
  c.drawImage(s, sx, 0, sw, s.height, p.dx, p.dy, p.dw, p.dh);
  note('crop', name, sw, s.height, p.dw, p.dh, w, h, mode);
  cv = surf.canvas;
  copies.set(key, cv);
  return cv;
}
/** the whole image placed in a w x h canvas */
export const scaled = (name: string, w: number, h: number, mode: Fit = 'fit', ay = 0.5): any => { const s = src(name); return s ? crop(name, 0, s.width, w, h, mode, ay) : null; };
/** cell i of a sheet of n equal cells placed in a w x h canvas */
export const frame = (name: string, n: number, i: number, w: number, h: number, mode: Fit = 'fit', ay = 0.5): any => { const s = src(name); return s ? crop(name, Math.floor(s.width / n) * (i % n), Math.floor(s.width / n), w, h, mode, ay) : null; };

/** paints a cached copy at x, y (counts as an image drawn) */
export function put(c: any, cv: any, x: number, y: number): boolean {
  if (!cv) return false;
  c.drawImage(cv, x, y); artStats.drawn++;
  return true;
}
/** paints cell i of a sheet of n equal cells centred on cx, cy, contained in w x h (aspect kept), directly from the source (for sizes that change every frame: particles).
 *  flip = the height is squashed on purpose (a turning piece of confetti): the one place where the aspect changes. */
export function cell(c: any, name: string, n: number, i: number, cx: number, cy: number, w: number, h: number, rot = 0, flip = false): boolean {
  const s = src(name);
  if (!s || w <= 0 || h <= 0) return false;
  const cw = Math.floor(s.width / n), sm = c.imageSmoothingEnabled;
  const p = flip ? { dw: w, dh: h } : place(cw, s.height, w, h);
  c.imageSmoothingEnabled = true;
  c.save(); c.translate(cx, cy); if (rot) c.rotate(rot);
  c.drawImage(s, cw * (i % n), 0, cw, s.height, -p.dw / 2, -p.dh / 2, p.dw, p.dh);
  c.restore();
  c.imageSmoothingEnabled = sm; artStats.drawn++;
  note('cell', name, cw, s.height, p.dw, p.dh, w, h, 'fit', flip);
  return true;
}
/** any canvas / image drawn into x, y, w, h keeping its aspect (fit or cover); `tag` names the caller in the audit. Returns false when there is nothing to draw */
export function blit(c: any, img: any, x: number, y: number, w: number, h: number, mode: Fit = 'fit', tag = 'blit', ax = 0.5, ay = 0.5): boolean {
  if (!img || w <= 0 || h <= 0) return false;
  const iw = img.width, ih = img.height, p = place(iw, ih, w, h, mode, ax, ay);
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  c.drawImage(img, x + p.dx, y + p.dy, p.dw, p.dh);
  c.restore();
  note(tag, tag, iw, ih, p.dw, p.dh, w, h, mode);
  return true;
}
