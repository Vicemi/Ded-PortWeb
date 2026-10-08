"""Builds the text rendering data of the port: for every (font file, size) pair the game uses, the metrics and the glyph bitmaps rendered by
pygame / SDL_ttf (the same library family as the original), packed in one atlas PNG + one JSON index. The browser then lays text out with
exactly the same advances and draws the same glyphs, instead of relying on the browser's own font rasteriser.

usage: python tools/build_fonts.py [--check]
"""
import json, os, re, sys, glob
os.environ['PYGAME_HIDE_SUPPORT_PROMPT'] = '1'
import warnings
warnings.filterwarnings('ignore')
import pygame
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GAME = 'F:/Games/DED/Ded.activity/game'
FONTS = GAME + '/fonts'
OUT = os.path.join(ROOT, 'public', 'assets')
SRC = os.path.join(ROOT, 'research', 'lite')

pygame.font.init()


def used_fonts():
    pairs = set()
    for p in glob.glob(SRC + '/**/*.py', recursive=True):
        if 'leveldesigner' in p:
            continue
        t = open(p, encoding='utf-8').read()
        for m in re.finditer(r"load_font\('([^']+)',\s*(\d+)\)", t):
            pairs.add((m.group(1), int(m.group(2))))
    return sorted(pairs)


CHARS = [chr(c) for c in range(32, 256)]


def glyph_data(font):
    """metrics of every char + trimmed bitmap of the single-char render"""
    res = {}
    for ch in CHARS:
        m = font.metrics(ch)
        if not m or m[0] is None:
            continue
        minx, maxx, miny, maxy, adv = m[0]
        try:
            s = font.render(ch, True, (255, 255, 255))
        except pygame.error:
            res[ch] = dict(adv=adv, minx=minx, maxx=maxx, bw=0, bh=0, ox=0, oy=0, img=None)
            continue
        w, h = s.get_size()
        alpha = pygame.surfarray.pixels_alpha(s)
        # trimmed bounding box of non-transparent pixels
        xs = [x for x in range(w) if any(alpha[x][y] for y in range(h))]
        if not xs:
            res[ch] = dict(adv=adv, minx=minx, maxx=maxx, bw=0, bh=0, ox=0, oy=0, img=None)
            continue
        ys = [y for y in range(h) if any(alpha[x][y] for x in range(w))]
        x0, x1, y0, y1 = min(xs), max(xs) + 1, min(ys), max(ys) + 1
        sub = Image.new('RGBA', (x1 - x0, y1 - y0), (255, 255, 255, 0))
        px = sub.load()
        for x in range(x0, x1):
            for y in range(y0, y1):
                px[x - x0, y - y0] = (255, 255, 255, int(alpha[x][y]))
        res[ch] = dict(adv=adv, minx=minx, maxx=maxx, bw=x1 - x0, bh=y1 - y0, ox=x0, oy=y0, img=sub, sw=w, sh=h)
    return res


def kerning(fname, size, glyphs):
    """Kerning pairs of the font's 'kern' table, in whole pixels (FT_Get_Kerning + `>> 6`, what the old SDL_ttf of the original game did).
    pygame 2's SDL_ttf shapes text with HarfBuzz instead, which gives other values: not what the original showed."""
    import freetype
    face = freetype.Face(FONTS + '/' + fname)
    face.set_pixel_sizes(0, size)
    k = {}
    idx = {ch: face.get_char_index(ord(ch)) for ch in glyphs}
    for a in glyphs:
        for b in glyphs:
            if idx[a] and idx[b]:
                v = face.get_kerning(idx[a], idx[b], freetype.FT_KERNING_DEFAULT).x >> 6
                if v:
                    k[a + b] = v
    return k


def main():
    pairs = used_fonts()
    print(len(pairs), 'font/size pairs')
    entries = {}
    tiles = []
    for fname, size in pairs:
        font = pygame.font.Font(FONTS + '/' + fname, size)
        gl = glyph_data(font)
        kern = kerning(fname, size, list(gl))
        entry = dict(file=fname, size=size, linesize=font.get_linesize(), height=font.get_height(), ascent=font.get_ascent(), descent=font.get_descent(), glyphs={}, kern=kern)
        for ch, g in gl.items():
            e = dict(adv=g['adv'], minx=g['minx'], maxx=g['maxx'])
            if g['img'] is not None:
                e.update(bw=g['bw'], bh=g['bh'], ox=g['ox'], oy=g['oy'])
                tiles.append((fname, size, ch, g['img']))
            entry['glyphs'][ord(ch)] = e
        entries['%s@%d' % (fname, size)] = entry
    # atlas: one block per font/size (so the browser can tint a font's glyphs on its own), shelf packing inside the block, 1px padding
    W = 512
    by_font = {}
    for fname, size, ch, img in tiles:
        by_font.setdefault((fname, size), []).append((ch, img))
    pos = {}
    block_y = 0
    blocks = {}
    for (fname, size), items in by_font.items():
        x = y = rowh = 0
        for ch, img in sorted(items, key=lambda t: -t[1].size[1]):
            w, h = img.size
            if x + w + 1 > W:
                x = 0
                y += rowh + 1
                rowh = 0
            pos[(fname, size, ch)] = (x, block_y + y)
            x += w + 1
            rowh = max(rowh, h)
        bh = y + rowh + 1
        blocks['%s@%d' % (fname, size)] = (0, block_y, W, bh)
        block_y += bh
    H = block_y
    atlas = Image.new('RGBA', (W, H), (255, 255, 255, 0))
    for fname, size, ch, img in tiles:
        atlas.paste(img, pos[(fname, size, ch)])
    for key, e in entries.items():
        e['block'] = blocks.get(key)
        for code, g in e['glyphs'].items():
            if 'bw' in g:
                g['x'], g['y'] = pos[(e['file'], e['size'], chr(code))]
    os.makedirs(OUT, exist_ok=True)
    atlas.save(OUT + '/fonts.png', optimize=True)
    json.dump(entries, open(OUT + '/fonts.json', 'w'), separators=(',', ':'))
    print('atlas', atlas.size, 'glyphs', len(tiles), 'json', os.path.getsize(OUT + '/fonts.json') // 1024, 'KB')


if __name__ == '__main__':
    main()
