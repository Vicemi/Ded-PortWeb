"""Cuts the sheets of medals drawn by Gemini (flat green background, a grid of medals) into one picture per achievement: tools/extra_images/ach_<id>.png
usage: python tools/build_medals.py      (reads art_inbox/raw_medals_<n>.jpg; the order of every sheet is in SHEETS: row by row, None = not used)"""
import os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from make_mugshot import key  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'tools', 'extra_images')
H = 74                      # height of the pictures in the game (the original small medals are 67-84 px high)

SHEETS = {
    1: ['primer_caso', 'barrio', 'seccional', None, 'inspector', 'leyenda', None, 'viajero'],
    2: ['recorrido', 'diecinueve', 'uruguay', 'repetido', 'cinco_presos', 'diez_presos', 'todos_presos', 'victor'],
    4: ['mate', 'xo', 'musica', 'gaucho', 'paladar', 'ojo', 'retro', 'rarezas'],
    3: ['aaron', 'fausto', 'vera', 'nana', 'rita', 'byte', 'puntos_5k', 'puntos_20k'],
}


def cut(path):
    """the medals of a sheet, in reading order (rows of medals from top to bottom, left to right inside a row)"""
    full = key(path)
    a = np.array(full)
    lab, n = ndimage.label(a[..., 3] > 0)
    boxes = []
    for i, sl in enumerate(ndimage.find_objects(lab), 1):
        area = int((lab[sl] == i).sum())
        if area < 0.002 * a.shape[0] * a.shape[1] or area > 0.2 * a.shape[0] * a.shape[1]:   # (the white bars of a screenshot are one big piece)
            continue
        boxes.append((sl, i))
    # rows: group by vertical centre
    boxes.sort(key=lambda b: (b[0][0].start + b[0][0].stop) / 2)
    rows, cur = [], []
    for b in boxes:
        c = (b[0][0].start + b[0][0].stop) / 2
        if cur and c - np.mean([(x[0][0].start + x[0][0].stop) / 2 for x in cur]) > 60:
            rows.append(cur)
            cur = []
        cur.append(b)
    if cur:
        rows.append(cur)
    out = []
    for r in rows:
        for sl, i in sorted(r, key=lambda b: b[0][1].start):
            m = (lab[sl] == i)
            tile = a[sl].copy()
            tile[..., 3] = np.where(m, tile[..., 3], 0)
            out.append(Image.fromarray(tile, 'RGBA'))
    return out


SINGLES = {  # art_inbox/medal_<name>.png (one medal on green) -> achievement id
    'trampa_incriminado': 'incriminado', 'trampa_falso_criminal': 'falso_criminal', 'trampa_ojo_clinico': 'ojo_clinico', 'trampa_tres_trampas': 'tres_trampas',
    **{k: k for k in ('humanoide', 'churrito', 'streamer', 'cumbia', 'delivery', 'influencer', 'cripto', 'tribunero', 'milanesero', 'cervecero')},
}


def save(tile, mid):
    w = max(1, round(tile.width * H / tile.height))
    a = np.array(tile).astype(int)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    edge = ~ndimage.binary_erosion(a[..., 3] > 0, iterations=3)
    spill = (g > r + 12) & (g > b + 12) & edge   # green of the background left on the borders (only at the edge)
    a[..., 1] = np.where(spill, np.maximum(r, b), g)
    im = Image.fromarray(a.clip(0, 255).astype(np.uint8), 'RGBA').resize((w, H), Image.LANCZOS)
    im.save(os.path.join(OUT, 'ach_%s.png' % mid))
    print('  ach_%s.png' % mid, im.size)


def single(path, mid):
    a = np.array(key(path))
    lab, n = ndimage.label(a[..., 3] > 0)
    if n > 1:   # a bar of the screenshot next to the medal is not part of it: only the biggest piece stays
        big = 1 + int(np.argmax(ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))))
        a[..., 3] = np.where(lab == big, a[..., 3], 0)
    ys, xs = np.where(a[..., 3] > 0)
    save(Image.fromarray(a[ys.min():ys.max() + 1, xs.min():xs.max() + 1], 'RGBA'), mid)


def main():
    os.makedirs(OUT, exist_ok=True)
    for n, ids in SHEETS.items():
        p = os.path.join(ROOT, 'art_inbox', 'raw_medals_%d.jpg' % n)
        if not os.path.exists(p):
            continue
        tiles = cut(p)
        print('sheet', n, len(tiles), 'medals')
        for tile, mid in zip(tiles, ids):
            if not mid:
                continue
            save(tile, mid)

    for name, mid in SINGLES.items():
        p = os.path.join(ROOT, 'art_inbox', 'medal_%s.png' % name)
        if os.path.exists(p):
            single(p, mid)


if __name__ == '__main__':
    main()
