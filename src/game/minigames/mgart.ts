// @ts-nocheck
// Optional art of the new minigames (art_inbox/mg_*.png -> tools/build_minigame_art.py -> images `mg_<name>.png`). Every drawing helper returns false / null when the
// image does not exist, so the caller keeps its procedural drawing, element by element. Decoded canvases and resized copies are cached (nothing is
// decoded or allocated per frame). `artStats.drawn` counts the images painted (the scenario minigame_art checks it).
import * as assets from '../../engine/assets';
import { pygame } from '../../runtime/prelude';

export const artStats = { drawn: 0 };
const srcs = new Map<string, any>();
const copies = new Map<string, any>();

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

/** a copy of the part (sx, sw wide, full height) of the image resized to w x h with smoothing, cached */
export function crop(name: string, sx: number, sw: number, w: number, h: number): any {
  const key = `${name}|${sx}|${sw}|${w}|${h}`;
  let cv = copies.get(key);
  if (cv) return cv;
  const s = src(name);
  if (!s) return null;
  const surf = new pygame.Surface([w, h], pygame.SRCALPHA, 32), c = surf.ctx;
  c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
  c.drawImage(s, sx, 0, sw, s.height, 0, 0, w, h);
  cv = surf.canvas;
  copies.set(key, cv);
  return cv;
}
/** the whole image resized to w x h */
export const scaled = (name: string, w: number, h: number): any => { const s = src(name); return s ? crop(name, 0, s.width, w, h) : null; };
/** cell i of a sheet of n equal cells, resized to w x h */
export const frame = (name: string, n: number, i: number, w: number, h: number): any => { const s = src(name); return s ? crop(name, Math.floor(s.width / n) * (i % n), Math.floor(s.width / n), w, h) : null; };

/** paints a cached copy at x, y (counts as an image drawn) */
export function put(c: any, cv: any, x: number, y: number): boolean {
  if (!cv) return false;
  c.drawImage(cv, x, y); artStats.drawn++;
  return true;
}
/** paints cell i of a sheet of n equal cells centred on cx, cy at w x h, directly from the source (for sizes that change every frame: particles) */
export function cell(c: any, name: string, n: number, i: number, cx: number, cy: number, w: number, h: number, rot = 0): boolean {
  const s = src(name);
  if (!s || w <= 0 || h <= 0) return false;
  const cw = Math.floor(s.width / n), sm = c.imageSmoothingEnabled;
  c.imageSmoothingEnabled = true;
  if (rot) { c.save(); c.translate(cx, cy); c.rotate(rot); c.drawImage(s, cw * (i % n), 0, cw, s.height, -w / 2, -h / 2, w, h); c.restore(); }
  else c.drawImage(s, cw * (i % n), 0, cw, s.height, cx - w / 2, cy - h / 2, w, h);
  c.imageSmoothingEnabled = sm; artStats.drawn++;
  return true;
}
/** an image stretched to w x h keeping its left and right caps (capDst wide on the screen, 18% of the picture in the source) */
export function slice3(c: any, name: string, x: number, y: number, w: number, h: number, capDst: number): boolean {
  const s = src(name);
  if (!s) return false;
  const cs = Math.floor(s.width * 0.18), sm = c.imageSmoothingEnabled;
  c.imageSmoothingEnabled = true;
  c.drawImage(s, 0, 0, cs, s.height, x, y, capDst, h);
  c.drawImage(s, cs, 0, s.width - 2 * cs, s.height, x + capDst, y, w - 2 * capDst, h);
  c.drawImage(s, s.width - cs, 0, cs, s.height, x + w - capDst, y, capDst, h);
  c.imageSmoothingEnabled = sm; artStats.drawn++;
  return true;
}
