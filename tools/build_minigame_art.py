"""Turns the pictures made with Gemini (art_inbox/mg_*.png, see tools/art_brief/GEMINI_ASSETS_MINIJUEGOS.md) into the final art of the minigames:
tools/extra_images/mg_<name>.png (build_assets.py packs that folder; the minigames use an image when it exists and draw by code when it does not).

  backgrounds   (mg_*_bg.png, mg_rambla_sky.png)  no key: cropped to the 4:3 and resized to 600x450
  sprites       green key (make_mugshot.key), cropped to the drawing, fitted (aspect kept) into the final size
  strips        green key, NOT cropped (they must tile left-right), resized to the final size
  sheets        green key; the sheet is cut into N pieces (the gaps between drawings, else N equal cells) and re-packed to exactly N cells:
                'anim' frames share one scale and the bottom line (run / jump / fall), 'items' are fitted one by one
Files that are missing are skipped. usage: python tools/build_minigame_art.py [inbox_dir] [out_dir]
"""
import os, sys
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from make_mugshot import key  # noqa: E402  (the same green key as the thieves)

INBOX = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'art_inbox')
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, 'tools', 'extra_images')
LANCZOS = Image.LANCZOS

# name -> (kind, size or cell sizes, options). Sheets: cells = list of (w, h) in one row.
BG = (600, 450)
SPECS = {
    'mate_bg': ('bg', BG), 'rambla_sky': ('bg', BG), 'candombe_bg': ('bg', BG), 'cartero_bg': ('bg', BG), 'banderas_bg': ('bg', BG),
    'mate_termo': ('sprite', (110, 330)), 'mate_termo_pour': ('sprite', (330, 200)), 'mate_gourd': ('sprite', (220, 260)),
    'mate_steam': ('items', [(100, 100)] * 4, 'center'), 'mate_splash': ('items', [(100, 100)] * 4, 'center'),
    'rambla_skyline': ('strip', (1200, 220)), 'rambla_ground': ('strip', (600, 120)),
    'rambla_runner': ('anim', [(96, 128)] * 6), 'rambla_runner_jump': ('anim', [(96, 128)] * 3), 'rambla_runner_fall': ('anim', [(128, 96)] * 3),
    'rambla_obstacles': ('items', [(64, 80), (140, 80), (110, 80), (96, 80)], 'bottom'),   # (the gull cell is 96x64 in the guide; 80 high here, the game expects one height)
    'rambla_meta': ('sprite', (520, 200)),
    'candombe_chico': ('sprite', (120, 160)), 'candombe_repique': ('sprite', (140, 170)), 'candombe_piano': ('sprite', (160, 200)), 'candombe_palmas': ('sprite', (120, 160)),
    'candombe_crowd': ('strip', (1200, 180)), 'candombe_spot': ('sprite', (200, 400)),
    'cartero_envelope': ('sprite', (300, 200)), 'cartero_stamp': ('sprite', (220, 120)), 'cartero_bag': ('sprite', (200, 200)),
    'cartero_stamps': ('items', [(80, 100)] * 4, 'center'),
    'banderas_cardback': ('fill', (90, 120)), 'banderas_frame': ('frame', (110, 80)),
    'ui_stars': ('items', [(64, 64)] * 2, 'center'), 'ui_sparkles': ('items', [(48, 48)] * 4, 'center'), 'ui_confetti': ('items', [(32, 32)] * 6, 'center'),
}


def cover(im, size):
    """cropped (centred) to the aspect of `size`, then resized"""
    w, h = im.size
    k = max(size[0] / w, size[1] / h)
    nw, nh = max(size[0], round(w * k)), max(size[1], round(h * k))
    im = im.resize((nw, nh), LANCZOS)
    x, y = (nw - size[0]) // 2, (nh - size[1]) // 2
    return im.crop((x, y, x + size[0], y + size[1]))


def bbox(im):
    return im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()


def fit(im, size, align='center'):
    """the drawing cropped to its content and fitted (aspect kept) into a transparent canvas of exactly `size`"""
    bb = bbox(im)
    if bb is None:
        return Image.new('RGBA', size, (0, 0, 0, 0))
    im = im.crop(bb)
    k = min((size[0] - 2) / im.width, (size[1] - 2) / im.height)
    im = im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), LANCZOS)
    out = Image.new('RGBA', size, (0, 0, 0, 0))
    out.paste(im, ((size[0] - im.width) // 2, size[1] - im.height - 1 if align == 'bottom' else (size[1] - im.height) // 2))
    return out


def split(img, n):
    """n pieces of a keyed sheet: the runs of columns that have drawing (merging the closest ones when there are more than n); n equal cells otherwise"""
    a = np.array(img.getchannel('A')) > 8
    cols = a.any(axis=0)
    runs, start = [], None
    for x, v in enumerate(cols):
        if v and start is None: start = x
        if not v and start is not None: runs.append([start, x]); start = None
    if start is not None: runs.append([start, len(cols)])
    while len(runs) > n:
        gaps = [runs[i + 1][0] - runs[i][1] for i in range(len(runs) - 1)]
        i = gaps.index(min(gaps))
        runs[i] = [runs[i][0], runs[i + 1][1]]; del runs[i + 1]
    if len(runs) != n:
        w = img.width / n
        return [img.crop((round(i * w), 0, round((i + 1) * w), img.height)) for i in range(n)]
    return [img.crop((r[0], 0, r[1], img.height)) for r in runs]


def build(name, spec, im_path):
    kind, size = spec[0], spec[1]
    if kind == 'bg':
        return cover(Image.open(im_path).convert('RGB'), size)
    if kind == 'strip':
        return key(im_path, crop=False).resize(size, LANCZOS)
    if kind == 'sprite':
        return fit(key(im_path), size)
    if kind == 'fill':      # a card: the drawing fills the whole size
        k = key(im_path)
        return k.crop(bbox(k)).resize(size, LANCZOS)
    if kind == 'frame':     # a picture frame: the inside is transparent too
        k = key(im_path, holes=True)
        return k.crop(bbox(k)).resize(size, LANCZOS)
    cells = size
    sheet = key(im_path, crop=False)
    parts = split(sheet, len(cells))
    out = Image.new('RGBA', (sum(c[0] for c in cells), max(c[1] for c in cells)), (0, 0, 0, 0))
    x = 0
    if kind == 'anim':      # one scale for every frame and the feet on the same line
        boxes = [bbox(p) for p in parts]
        crops = [p.crop(b) if b else Image.new('RGBA', (1, 1)) for p, b in zip(parts, boxes)]
        cw, ch = cells[0]
        s = min((cw - 4) / max(c.width for c in crops), (ch - 4) / max(c.height for c in crops))
        for c in crops:
            c = c.resize((max(1, round(c.width * s)), max(1, round(c.height * s))), LANCZOS)
            out.paste(c, (x + (cw - c.width) // 2, ch - c.height - 2))
            x += cw
        return out
    for p, cs in zip(parts, cells):   # items
        out.paste(fit(p, cs, spec[2] if len(spec) > 2 else 'center'), (x, 0))
        x += cs[0]
    return out


def main():
    os.makedirs(OUT, exist_ok=True)
    built, missing, failed = [], [], []
    for name, spec in SPECS.items():
        path = os.path.join(INBOX, f'mg_{name}.png')
        if not os.path.exists(path):
            missing.append(name); continue
        try:
            im = build(name, spec, path)
            im.save(os.path.join(OUT, f'mg_{name}.png'), optimize=True)
            built.append(f'{name} {im.width}x{im.height}')
        except Exception as e:  # one bad picture does not stop the others
            failed.append(f'{name}: {e}')
    print(f'built {len(built)}:', ', '.join(built) or '-')
    print(f'missing {len(missing)} (skipped):', ', '.join(missing) or '-')
    if failed:
        print('FAILED:', *failed, sep='\n  ')
        sys.exit(1)


if __name__ == '__main__':
    main()
