// The road of the car chase, built from the map file (data/p3_map_*.yaml): pieces of road (straights, corners, chicanes) chosen at random one after
// the other, plus the objects at the sides (lamp posts, signs, buildings, dunes...) that repeat along it.
//
// Distances are in metres along the road (s); `x` is the lateral position from the middle of the road (positive = right).

export interface BodyDef { w: number; x: number }
export interface ObjDef { x: number; from?: number; to?: number; h: number; w: number; dz: number; body?: BodyDef; texture: string }
interface RoadPart { segment?: { width: number; length: number }; corner?: { width: number; length: number; direction: 'left' | 'right'; radius: number } }
export interface PieceDef { road: RoadPart[]; objects?: ObjDef[] }
export interface RandomBlock { length: number; objects: ObjDef[] }
export interface MapDef {
  width: number; time: number; exit_time: number; lanes: number[];
  pieces: PieceDef[]; objects: ObjDef[]; random_objects: { left: RandomBlock[]; right: RandomBlock[] };
  [k: string]: any;
}

/** a billboard placed on the road */
export interface Placed { s: number; x: number; h: number; w: number; texture: string; body: { x0: number; x1: number } | null }

interface Seg { s0: number; len: number; k: number }
interface PlacedPiece { s0: number; len: number; objects: ObjDef[] }
interface Block { s0: number; len: number; objects: ObjDef[] }

/** deterministic random numbers (the same road every time for the same seed) */
export function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

export class Track {
  private segs: Seg[] = [];
  private placed: PlacedPiece[] = [];
  private blocks: { left: Block[]; right: Block[] } = { left: [], right: [] };
  private end = 0;
  private lastCorner = 0;
  private rng: () => number;
  private segCursor = 0;

  constructor(readonly map: MapDef, seed: number) {
    this.rng = makeRng(seed);
    // the road always starts with a straight
    this.addPiece(this.map.pieces[0]);
  }

  private addPiece(p: PieceDef): void {
    const s0 = this.end;
    let len = 0;
    for (const part of p.road) {
      if (part.segment) { this.segs.push({ s0: this.end, len: part.segment.length, k: 0 }); this.end += part.segment.length; len += part.segment.length; }
      else if (part.corner) {
        const c = part.corner;
        this.segs.push({ s0: this.end, len: c.length, k: (c.direction === 'right' ? 1 : -1) / c.radius });
        this.end += c.length; len += c.length;
      }
    }
    this.placed.push({ s0, len, objects: p.objects ?? [] });
  }

  private pickPiece(): PieceDef {
    const ps = this.map.pieces;
    const corners = ps.filter((p) => p.road.some((r) => r.corner));
    const straights = ps.filter((p) => !p.road.some((r) => r.corner));
    // about half of the road is straight; never three corners in a row
    const wantStraight = this.lastCorner >= 2 || this.rng() < 0.4;
    const list = wantStraight ? straights : corners;
    const piece = list[Math.floor(this.rng() * list.length)];
    this.lastCorner = piece.road.some((r) => r.corner) ? this.lastCorner + 1 : 0;
    return piece;
  }

  /** builds the road up to `s` metres */
  ensure(s: number): void {
    while (this.end < s) this.addPiece(this.pickPiece());
    for (const side of ['left', 'right'] as const) {
      const bl = this.blocks[side];
      let e = bl.length ? bl[bl.length - 1].s0 + bl[bl.length - 1].len : 0;
      const defs = this.map.random_objects[side];
      while (e < s && defs.length) {
        const d = defs[Math.floor(this.rng() * defs.length)];
        bl.push({ s0: e, len: d.length, objects: d.objects });
        e += d.length;
      }
    }
  }

  /** curvature (1/m) of the road at s */
  curvatureAt(s: number): number {
    this.ensure(s + 2000);
    let i = Math.min(this.segCursor, this.segs.length - 1);
    while (i > 0 && this.segs[i].s0 > s) i--;
    while (i < this.segs.length - 1 && this.segs[i].s0 + this.segs[i].len <= s) i++;
    this.segCursor = i;
    return this.segs[i].k;
  }

  /** Lateral shear of the road at distance z ahead of s0: ∫0..z (z - t) κ(s0 + t) dt (small-angle approximation of the bend). */
  shear(s0: number, z: number): number {
    let c = 0;
    for (let i = this.indexAt(s0); i < this.segs.length; i++) {
      const g = this.segs[i];
      const a = Math.max(g.s0 - s0, 0), b = Math.min(g.s0 + g.len - s0, z);
      if (a >= z) break;
      if (b > a && g.k !== 0) c += g.k * (z * (b - a) - (b * b - a * a) / 2);
    }
    return c;
  }
  /** heading of the road (rad) accumulated up to s (used to scroll the sky) */
  heading(s: number): number {
    this.ensure(s + 10);
    let h = 0;
    for (const g of this.segs) { if (g.s0 >= s) break; h += g.k * Math.min(g.len, s - g.s0); }
    return h;
  }
  private indexAt(s: number): number {
    let i = Math.min(this.segCursor, this.segs.length - 1);
    while (i > 0 && this.segs[i].s0 > s) i--;
    while (i < this.segs.length - 1 && this.segs[i].s0 + this.segs[i].len <= s) i++;
    return i;
  }

  private instances(d: ObjDef, from: number, to: number, w0: number, w1: number, out: Placed[]): void {
    // positions from + k * dz inside [w0, w1] and [from, to]
    const lo = Math.max(w0, from), hi = Math.min(w1, to);
    if (hi < lo) return;
    const k0 = Math.ceil((lo - from) / d.dz);
    for (let s = from + k0 * d.dz; s <= hi; s += d.dz) {
      const b = d.body ? { x0: d.x + d.body.x - d.body.w / 2, x1: d.x + d.body.x + d.body.w / 2 } : null;
      out.push({ s, x: d.x, h: d.h, w: d.w, texture: d.texture, body: b });
    }
  }

  /** every object whose position lies in [w0, w1] */
  objectsIn(w0: number, w1: number): Placed[] {
    this.ensure(w1 + 100);
    const out: Placed[] = [];
    for (const d of this.map.objects) this.instances(d, d.from ?? 0, d.to ?? 1e9, w0, w1, out);
    for (const p of this.placed) {
      if (p.s0 > w1) break;
      if (p.s0 + p.len < w0 || !p.objects.length) continue;
      for (const d of p.objects) this.instances(d, p.s0 + (d.from ?? 0), p.s0 + (d.to ?? p.len), w0, w1, out);
    }
    for (const side of ['left', 'right'] as const) {
      for (const b of this.blocks[side]) {
        if (b.s0 > w1) break;
        if (b.s0 + b.len < w0) continue;
        for (const d of b.objects) this.instances(d, b.s0, b.s0 + b.len - 0.001, w0, w1, out);
      }
    }
    return out;
  }
}
