"""Turns the pictures made with Gemini (art_inbox/mg_*.png, see tools/art_brief/GEMINI_ASSETS_MINIJUEGOS.md) into the final art of the minigames:
tools/extra_images/mg_<name>.png (build_assets.py packs that folder; the minigames use an image when it exists and draw by code when it does not).

  backgrounds   (mg_*_bg.png, mg_rambla_sky.png)  no key: cropped to the 4:3 and resized to 600x450
  sprites       green key (make_mugshot.key), cropped to the drawing, fitted (aspect kept) into the final size
  strips        green key, NOT cropped (they must tile left-right); (None, h) = the final height h, the width follows the real aspect of the art (never stretched)
  card / frame  the Banderas card back and its frame are REBUILT at the aspect of the card (CARD): corners and edges are cut from the art and re-assembled at one uniform
                scale, the interior is re-filled, so nothing is stretched. envelope: the same for the Cartero letter (a wide banner built from the paper border)
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
CARD = (137, 100)                       # the Banderas card: back and frame share it (aspect 1.37)
HOLE = (15, 14.5, 107, 71)              # the window of the frame inside CARD (x, y, w, h): 107 / 71 = 1.507, the 3:2 of the flags
SPECS = {
    'mate_bg': ('bg', BG), 'rambla_sky': ('bg', BG), 'candombe_bg': ('bg', BG), 'cartero_bg': ('bg', BG), 'banderas_bg': ('bg', BG),
    'mate_termo': ('sprite', (110, 330), 'holes'), 'mate_termo_pour': ('sprite', (330, 200), 'holes'), 'mate_gourd': ('sprite', (220, 260)),
    'mate_steam': ('items', [(100, 100)] * 4, 'center'), 'mate_splash': ('items', [(100, 100)] * 4, 'center'),
    'rambla_skyline': ('strip', (None, 220)), 'rambla_ground': ('strip', (None, 188)),   # the game draws them 110 / 94 high; the width follows the art (mgart.aspect)
    'rambla_runner': ('anim', [(96, 128)] * 5), 'rambla_runner_jump': ('anim', [(96, 128)] * 3), 'rambla_runner_fall': ('anim', [(128, 96)] * 3),
    'rambla_obstacles': ('items', [(64, 80), (140, 80), (110, 80), (96, 80)], 'bottom'),   # (the gull cell is 96x64 in the guide; 80 high here, the game expects one height)
    'rambla_meta': ('sprite', (520, 200)),
    'candombe_chico': ('sprite', (120, 160)), 'candombe_repique': ('sprite', (140, 170)), 'candombe_piano': ('sprite', (160, 200)), 'candombe_palmas': ('sprite', (120, 160)),
    'candombe_crowd': ('strip', (None, 120)), 'candombe_spot': ('sprite', (200, 400)),
    'cartero_envelope': ('envelope', (315, 82)), 'cartero_stamp': ('sprite', (220, 120)), 'cartero_bag': ('sprite', (200, 200), 'holes'),
    'cartero_stamps': ('items', [(80, 100)] * 4, 'center'),
    'banderas_cardback': ('card', CARD), 'banderas_frame': ('frame', CARD),   # the window of the frame is 3:2 like the flags (HOLE; newgames.ts has the same numbers)
    'ui_stars': ('items', [(64, 64)] * 2, 'center'), 'ui_sparkles': ('items', [(48, 48)] * 4, 'center'), 'ui_confetti': ('items', [(32, 32)] * 6, 'center'),
}


def trim_green(im, pad=2):
    """the green key colour often frames the picture: drop the outer rows / columns that are mostly green (plus `pad` px of fringe)"""
    a = np.array(im.convert('RGB')).astype(int)
    g = (a[..., 1] - a[..., 0] > 40) & (a[..., 1] - a[..., 2] > 40) & (a[..., 1] > 120)
    t, b, l, r = 0, a.shape[0], 0, a.shape[1]
    while t < b - 1 and g[t, l:r].mean() > 0.3: t += 1
    while b - 1 > t and g[b - 1, l:r].mean() > 0.3: b -= 1
    while l < r - 1 and g[t:b, l].mean() > 0.3: l += 1
    while r - 1 > l and g[t:b, r - 1].mean() > 0.3: r -= 1
    if (t, b, l, r) == (0, a.shape[0], 0, a.shape[1]):
        return im
    return im.crop((l + pad, t + pad, r - pad, b - pad))


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


def rect(im, x0, y0, x1, y1):
    return im.crop((int(x0), int(y0), int(x1), int(y1)))


def build_frame(k, size, S=4, CK=90):
    """a wooden frame at the aspect of `size` with a window HOLE: four corners + four edges cut from the art (no resampling until the final uniform reduction by S)"""
    k = k.crop(bbox(k))
    W, H = k.size
    L, T = 60, 58                                  # the border of the art (measured on the window of the drawing: 60 left / right, 58 top / bottom)
    assert abs(L / S - HOLE[0]) < 1 and abs(T / S - HOLE[1]) < 1
    w, h = size[0] * S, size[1] * S
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    out.alpha_composite(rect(k, 0, 0, CK, CK), (0, 0)); out.alpha_composite(rect(k, W - CK, 0, W, CK), (w - CK, 0))
    out.alpha_composite(rect(k, 0, H - CK, CK, H), (0, h - CK)); out.alpha_composite(rect(k, W - CK, H - CK, W, H), (w - CK, h - CK))
    ex, ey = w - 2 * CK, h - 2 * CK                # an edge is the middle of the art's edge cut to the length that is needed (never resized)
    assert ex <= W - 2 * CK and ey <= H - 2 * CK, 'the art is too small for this card'
    x0, y0 = (W - ex) // 2, (H - ey) // 2
    out.alpha_composite(rect(k, x0, 0, x0 + ex, CK), (CK, 0)); out.alpha_composite(rect(k, x0, H - CK, x0 + ex, H), (CK, h - CK))
    out.alpha_composite(rect(k, 0, y0, CK, y0 + ey), (0, CK)); out.alpha_composite(rect(k, W - CK, y0, W, y0 + ey), (w - CK, CK))
    hx, hy, hw, hh = [round(v * S) for v in HOLE]  # the window is clear
    a = np.array(out); a[hy:hy + hh, hx:hx + hw, 3] = 0
    return Image.fromarray(a, 'RGBA').resize(size, LANCZOS)


def build_card(k, size, S=4, CK=70, B=33):
    """the portrait card back re-built landscape: cream border (corners + mirrored edges) around a blue field with the sun at the centre, all at one scale"""
    W, H = k.size
    w, h = size[0] * S, size[1] * S
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    # blue field: a clean patch of the art (above the sun), covered to the interior without distortion
    iw, ih = w - 2 * B, h - 2 * B
    patch = rect(k, B + 8, B + 8, W - B - 8, 180)
    kk = max(iw / patch.width, ih / patch.height)
    patch = patch.resize((round(patch.width * kk) + 1, round(patch.height * kk) + 1), LANCZOS)
    px, py = (patch.width - iw) // 2, (patch.height - ih) // 2
    out.paste(rect(patch, px, py, px + iw, py + ih), (B, B))
    # the sun (with a soft oval edge so that no seam shows), centred
    sw_, sh_ = 250, 250
    cx, cy = W // 2, H // 2
    sun = rect(k, cx - sw_ // 2, cy - sh_ // 2, cx + sw_ // 2, cy + sh_ // 2)
    yy, xx = np.mgrid[0:sh_, 0:sw_]
    d = np.hypot((xx - sw_ / 2) / (sw_ / 2), (yy - sh_ / 2) / (sh_ / 2))
    m = Image.fromarray((np.clip((1.0 - d) / 0.18, 0, 1) * 255).astype(np.uint8))
    out.paste(sun, ((w - sw_) // 2, (h - sh_) // 2), m)
    # the border: corners from the art, edges mirrored out of the art's edge (a plain cream band)
    for (sx, sy, dx, dy) in ((0, 0, 0, 0), (W - CK, 0, w - CK, 0), (0, H - CK, 0, h - CK), (W - CK, H - CK, w - CK, h - CK)):
        out.alpha_composite(rect(k, sx, sy, sx + CK, sy + CK), (dx, dy))
    seg = rect(k, CK, 0, W - CK, CK)                     # top edge piece, mirrored until it is long enough
    top = Image.new('RGBA', (w - 2 * CK, CK))
    x, flip = 0, False
    while x < top.width:
        p = seg.transpose(Image.FLIP_LEFT_RIGHT) if flip else seg
        top.paste(p, (x, 0)); x += p.width; flip = not flip
    out.alpha_composite(top, (CK, 0))
    out.alpha_composite(top.transpose(Image.FLIP_TOP_BOTTOM), (CK, h - CK))
    seg = rect(k, 0, CK, CK, H - CK)                      # left edge piece, cut from the middle
    ey = h - 2 * CK
    y0 = (seg.height - ey) // 2
    left = rect(seg, 0, y0, CK, y0 + ey)
    out.alpha_composite(left, (0, CK)); out.alpha_composite(left.transpose(Image.FLIP_LEFT_RIGHT), (w - CK, CK))
    return out.resize(size, LANCZOS)


def build_envelope(k, size):
    """the airmail envelope as a wide banner: the stripe bands of the art, the paper between them re-filled (without the stamp and the postmark: the game draws them)"""
    k = k.crop(bbox(k))
    W, H = k.size
    w = W
    h = round(size[1] * w / size[0])                      # the same scale on both axes
    BT, BS = 31, 28                                       # thickness of the stripe band: top / bottom, sides
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    patch = rect(k, 40, 60, 330, 400)
    kk = max(w / patch.width, h / patch.height)
    patch = patch.resize((round(patch.width * kk) + 1, round(patch.height * kk) + 1), LANCZOS)
    px, py = (patch.width - w) // 2, (patch.height - h) // 2
    out.paste(rect(patch, px, py, px + w, py + h), (0, 0))
    y0 = (H - (h - 2 * BT)) // 2                          # the side bands: a piece of the art's band, as long as the banner needs
    FE = 6                                                # the inner edge of every band fades into the new paper (the art's paper is greyer near its edge)

    def band(piece, dx, dy, axis, inner_first):
        a = np.array(piece)
        n = a.shape[axis]
        r = np.ones(n)
        k = np.arange(FE)
        if inner_first:   # the inner edge is the last rows / columns
            r[n - FE:] = 1 - (k + 1) / (FE + 1)
        else:             # the inner edge is the first rows / columns
            r[:FE] = (k + 1) / (FE + 1)
        a[..., 3] = (a[..., 3] * (r[:, None] if axis == 0 else r[None, :])).astype(np.uint8)
        out.alpha_composite(Image.fromarray(a, 'RGBA'), (dx, dy))
    band(rect(k, 0, y0, BS, y0 + h - 2 * BT), 0, BT, 1, True); band(rect(k, W - BS, y0, W, y0 + h - 2 * BT), w - BS, BT, 1, False)
    band(rect(k, 0, 0, W, BT), 0, 0, 0, True); band(rect(k, 0, H - BT, W, H), 0, h - BT, 0, False)
    return out.resize(size, LANCZOS)


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
        return cover(trim_green(Image.open(im_path).convert('RGB')), size)
    if kind == 'strip':
        k = key(im_path, crop=False)
        if size[0] is None:
            size = (round(k.width * size[1] / k.height), size[1])
        return k.resize(size, LANCZOS)
    if kind == 'sprite':
        return fit(key(im_path, holes=(len(spec) > 2 and spec[2] == 'holes')), size)
    if kind == 'card':
        return build_card(key(im_path), size)
    if kind == 'frame':
        return build_frame(key(im_path, holes=True), size)
    if kind == 'envelope':
        return build_envelope(key(im_path, crop=False), size)
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
