// pygame.font.Font replacement. The original game rasterised its TrueType fonts with SDL_ttf; tools/build_fonts.py already did that for every
// (font, size) pair the game uses and stored the metrics + the glyph bitmaps in an atlas, so text is laid out with the same advances and
// drawn with the same glyphs in the browser, with no dependence on the browser's own font rendering.
import { Surface, type Color } from './pygame';

export interface GlyphEntry { adv: number; minx: number; maxx: number; bw?: number; bh?: number; ox?: number; oy?: number; x?: number; y?: number }
export interface FontEntry {
  file: string; size: number; linesize: number; height: number; ascent: number; descent: number;
  glyphs: Record<string, GlyphEntry>;
  kern: Record<string, number>;
  block: [number, number, number, number] | null;
}

export class FontAtlas {
  entries: Record<string, FontEntry> = {};
  atlas: Surface | null = null;
}

const rgbKey = (c: Color): string => `${c[0] | 0},${c[1] | 0},${c[2] | 0}`;

export class Font {
  private tints = new Map<string, HTMLCanvasElement>();
  constructor(private e: FontEntry, private atlas: Surface) {}

  get_linesize(): number { return this.e.linesize; }
  get_height(): number { return this.e.height; }
  get_ascent(): number { return this.e.ascent; }
  get_descent(): number { return this.e.descent; }

  /** pen positions + total width, the way SDL_ttf's TTF_SizeText computes them */
  private layout(text: string): { xs: number[]; width: number; minx: number } {
    const xs: number[] = [];
    let x = 0, minx = 0, maxx = 0, prev = '';
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const g = this.e.glyphs[ch.charCodeAt(0)];
      if (!g) { xs.push(x); continue; }
      if (prev) x += this.e.kern[prev + ch] ?? 0;
      xs.push(x);
      minx = Math.min(minx, x + g.minx);
      maxx = Math.max(maxx, x + Math.max(g.adv, g.maxx));
      x += g.adv;
      prev = ch;
    }
    return { xs, width: maxx - minx, minx };
  }

  size(text: string): [number, number] {
    if (text === '') return [0, this.e.height];
    return [this.layout(text).width, this.e.height];
  }

  private tinted(color: Color): HTMLCanvasElement {
    const key = rgbKey(color);
    let c = this.tints.get(key);
    if (!c) {
      const b = this.e.block!;
      c = document.createElement('canvas');
      c.width = b[2]; c.height = b[3];
      const ctx = c.getContext('2d')!;
      ctx.drawImage(this.atlas.canvas, b[0], b[1], b[2], b[3], 0, 0, b[2], b[3]);
      ctx.globalCompositeOperation = 'source-in';
      ctx.fillStyle = `rgb(${key})`;
      ctx.fillRect(0, 0, b[2], b[3]);
      this.tints.set(key, c);
    }
    return c;
  }

  /** Font.render: antialiased text. With `background` the result is an opaque surface filled with that colour. */
  render(text: string, _antialias: boolean, color: Color, background?: Color | null): Surface {
    const h = this.e.height;
    if (text === '') {
      const s = new Surface(1, h, !background);
      if (background) s.fill(background);
      return s;
    }
    const L = this.layout(text);
    const s = new Surface(Math.max(1, L.width), h, !background);
    if (background) s.fill(background);
    if (!this.e.block) return s;
    const tint = this.tinted(color);
    const b = this.e.block;
    const ctx = s.ctx;
    if (!background) ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < text.length; i++) {
      const g = this.e.glyphs[text.charCodeAt(i)];
      if (!g || g.bw === undefined || !g.bw || !g.bh) continue;
      const left = -L.minx + L.xs[i] + Math.min(g.minx, 0) + (g.ox ?? 0);
      ctx.drawImage(tint, (g.x ?? 0) - b[0], (g.y ?? 0) - b[1], g.bw, g.bh, left, g.oy ?? 0, g.bw, g.bh);
    }
    ctx.globalCompositeOperation = 'source-over';
    return s;
  }
}
