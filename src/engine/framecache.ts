// Skips the painting a stage would repeat: each frame the layers are summarised (Layer.drawSig) and compared with the previous frame.
// - nothing changed and nobody else drew on the target: the frame is not painted at all (and the canvas is not copied to the screen);
// - the lowest layers are the same for a while: they are painted once into `cache`, and the next frames paste it instead of repainting them.
// The pixels are the same as painting everything every frame (tools/scenarios/digest.mjs compares both).
import { DrawSig, type Layer } from './items';
import { Surface } from './pygame';

class Slot { layer: Layer | null = null; prev = new DrawSig(); cur = new DrawSig(); stable = 0; items = 0; }

export class FrameCache {
  /** off = paint everything every frame (tools/scenarios/digest.mjs compares both) */
  static disabled = typeof globalThis !== 'undefined' && !!(globalThis as { __DED_NOCACHE?: boolean }).__DED_NOCACHE;
  private slots: Slot[] = [];
  private count = 0;
  private bgPrev = new DrawSig();
  private bgCur = new DrawSig();
  private target: Surface | null = null;
  private targetVer = -1;
  private cache: Surface | null = null;
  /** number of layers (from the bottom) that `cache` holds together with the background; 0 = no cache */
  private cacheK = 0;
  private skips = 0;
  /** the result of compare() */
  firstChanged = 0;
  bgChanged = false;

  /** compares the layers to be painted with the previous frame; afterwards firstChanged = index of the first layer that differs (n = none) */
  compare(list: readonly Layer[], bg: DrawSig): void {
    const n = list.length;
    let first = n;
    let lengthChanged = this.count !== n;
    while (this.slots.length < n) this.slots.push(new Slot());
    for (let i = 0; i < n; i++) {
      const slot = this.slots[i];
      const layer = list[i];
      layer.drawSig(slot.cur);
      const same = slot.layer === layer && !slot.cur.dynamic && slot.prev.equals(slot.cur);
      const t = slot.prev; slot.prev = slot.cur; slot.cur = t;
      slot.layer = layer;
      if (same) slot.stable++;
      else { slot.stable = 0; if (i < first) first = i; }
      slot.items = slot.prev.o.length;
    }
    this.count = n;
    this.bgChanged = !this.bgPrev.equals(bg) || bg.dynamic;
    const t = this.bgPrev; this.bgPrev = bg; this.bgCur = t;
    if (lengthChanged) first = 0;
    this.firstChanged = this.bgChanged ? -1 : first;
  }

  /** the target still holds what was painted last time and nothing differs: no need to paint */
  canSkip(target: Surface, n: number): boolean {
    return this.firstChanged === n && this.target === target && this.targetVer === target.ver && ++this.skips < 80;
  }
  /** a stable prefix is worth caching: [number of layers, or 0] */
  prefixToCache(n: number): number {
    let k = 0, items = 0;
    while (k < n && this.slots[k].stable >= 2) { items += this.slots[k].items; k++; }
    return k > this.cacheK && items >= 12 ? k : 0;
  }
  /** paste the cache when it is valid; returns the first layer to paint (0 = paint everything, background included) */
  start(target: Surface): number {
    this.skips = 0;
    const k = this.cacheK;
    if (k > 0 && this.cache && k <= this.firstChanged && this.target === target && this.targetVer === target.ver && this.cache.get_width() === target.get_width()) {
      target.set_clip(null);
      target.paste(this.cache);
      return k;
    }
    this.cacheK = 0;
    return 0;
  }
  snapshot(target: Surface, k: number): void {
    if (!this.cache || this.cache.get_width() !== target.get_width() || this.cache.get_height() !== target.get_height()) this.cache = new Surface(target.get_width(), target.get_height(), true);
    target.set_clip(null);
    this.cache.paste(target);
    this.cacheK = k;
  }
  done(target: Surface): void { this.target = target; this.targetVer = target.ver; }
  /** bg signature scratch */
  bgScratch(): DrawSig { return this.bgCur; }
  /** the cache is not used while a limit or an overlay is on */
  drop(): void { this.cacheK = 0; this.target = null; }
}
