"""Turns the sheet of new objects for the magnifying glass game (24 objects on a flat green background, 6 x 4) into the item pictures of the game:

  p2s01i<NNN>.png    the small object (what the room shows)           p2s01i<NNN>l.png   the same at twice the size (what the magnifier shows)

The art is graded to sit next to the original items: the colours are desaturated and darkened to the level of the originals (measured on them), the outline is
made dark and 1 px thick (2 px in the large one), a little grain and a warm shadow are added. usage: python tools/make_objects.py <sheet.jpg>
The output goes to tools/extra_images; tools/objects.json has the ids, names and sizes (read by the game and by build_assets.py).
"""
import io, json, os, sys
import numpy as np
import cv2
from PIL import Image
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'tools', 'extra_images')

# id, name, longest side of the small picture in px (the originals are 8 to 36 px)
OBJECTS = [
    ('i600', 'termo con mate', 26), ('i601', 'mate', 17), ('i602', 'pelota celeste', 19), ('i603', 'guitarra criolla', 30), ('i604', 'tambor de candombe', 22), ('i605', 'alfajor', 16),
    ('i606', 'chivito al plato', 26), ('i607', 'dulce de leche', 17), ('i608', 'boina gris', 20), ('i609', 'poncho', 24), ('i610', 'cuchillo gaucho', 26), ('i611', 'lazo', 22),
    ('i612', 'botella de tannat', 26), ('i613', 'copa de vino', 20), ('i614', 'cámara de fotos', 24), ('i615', 'telescopio', 28), ('i616', 'libro de poemas', 22), ('i617', 'llavero', 22),
    ('i618', 'lupa vieja', 24), ('i619', 'reloj de bolsillo', 22), ('i620', 'radio a válvulas', 26), ('i621', 'auricular y celular', 24), ('i622', 'taza de café', 18), ('i623', 'mochila con la XO', 24),
]


def original_stats():
    """mean saturation / value of the pixels of the original small items (they are in the image packs)"""
    idx = json.load(open(os.path.join(ROOT, 'public', 'assets', 'images.json')))
    paks = [open(os.path.join(ROOT, 'public', 'assets', n), 'rb').read() for n in ('images_boot.pak', 'images_rest.pak')]
    S, V, n = [], [], 0
    for k in idx:
        if not (k.startswith('p2s01i5') and k.endswith('l.png')):
            continue
        p, o, l = idx[k]
        im = np.array(Image.open(io.BytesIO(paks[p][o:o + l])).convert('RGBA'))
        m = im[:, :, 3] > 200
        hsv = cv2.cvtColor(im[:, :, :3], cv2.COLOR_RGB2HSV)
        S.append(hsv[:, :, 1][m]); V.append(hsv[:, :, 2][m])
    return float(np.concatenate(S).mean()), float(np.concatenate(V).mean()), float(np.percentile(np.concatenate(V), 8))


def cut_cells(sheet):
    """the 24 objects of the sheet (keyed from the green), in reading order, each as an RGBA image cropped to the drawing"""
    a = np.array(sheet.convert('RGB')).astype(np.int16)
    g = (a[:, :, 1] > 150) & (a[:, :, 0] < 110) & (a[:, :, 2] < 110)
    fg = ~g
    fg = ndimage.binary_closing(fg, iterations=3)
    lab, n = ndimage.label(ndimage.binary_dilation(fg, iterations=6))
    boxes = []
    for i, sl in enumerate(ndimage.find_objects(lab)):
        h, w = sl[0].stop - sl[0].start, sl[1].stop - sl[1].start
        if h * w > 3000:
            boxes.append((sl, (sl[0].start + sl[0].stop) / 2, (sl[1].start + sl[1].stop) / 2))
    H, W = a.shape[:2]
    # reading order: by row of the 4 x 6 grid
    boxes.sort(key=lambda b: (int(b[1] / (H / 4)), b[2]))
    if len(boxes) != 24:
        raise SystemExit('expected 24 objects, found %d' % len(boxes))
    cells = []
    for sl, _, _ in boxes:
        sub = a[sl].astype(np.uint8)
        subg = g[sl]
        # background = the green connected to the border of the crop (so green inside an object survives)
        lab2, _ = ndimage.label(subg)
        border = set(np.unique(np.concatenate([lab2[0], lab2[-1], lab2[:, 0], lab2[:, -1]]))) - {0}
        bg = np.isin(lab2, list(border))
        # holes of the drawing (the inside of the lasso, the gap between keys...): green of the key colour that is not connected to the border
        pure = (sub[:, :, 1] > 200) & (sub[:, :, 0] < 90) & (sub[:, :, 2] < 90)
        labp, npure = ndimage.label(pure)
        for i in range(1, npure + 1):
            comp = labp == i
            if comp.sum() >= 12:
                bg |= ndimage.binary_dilation(comp, iterations=1)
        alpha = (~bg).astype(np.uint8) * 255
        alpha = cv2.GaussianBlur(alpha, (3, 3), 0)
        # remove the green fringe of the antialiased edge
        rgb = sub.copy().astype(np.float32)
        edge = (alpha > 0) & (alpha < 255)
        gch = rgb[:, :, 1]
        lim = np.maximum(rgb[:, :, 0], rgb[:, :, 2])
        rgb[:, :, 1] = np.where(edge, np.minimum(gch, lim), gch)
        im = np.dstack([np.clip(rgb, 0, 255).astype(np.uint8), alpha])
        ys, xs = np.where(alpha > 20)
        cells.append(Image.fromarray(im[ys.min():ys.max() + 1, xs.min():xs.max() + 1], 'RGBA'))
    return cells


def grade(im, stats, scale):
    """the picture (RGBA, any size) is brought to the look of the originals at size `scale` x the small one"""
    s_t, v_t, v_dark = stats
    a = np.array(im).astype(np.float32)
    rgb, alpha = a[:, :, :3].astype(np.uint8), a[:, :, 3]
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV).astype(np.float32)
    m = alpha > 200
    s_m, v_m = hsv[:, :, 1][m].mean(), hsv[:, :, 2][m].mean()
    gs = min(1.0, (s_t / max(1, s_m)) * 1.12)                    # desaturate towards the originals (never saturate more)
    gv = min(1.05, (v_t / max(1, v_m)) * 1.08)                   # and darken
    hsv[:, :, 1] = np.clip(hsv[:, :, 1] * gs, 0, 255)
    hsv[:, :, 2] = np.clip(hsv[:, :, 2] * gv, 0, 255)
    out = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2RGB).astype(np.float32)
    # a warm, dusty cast like the paint of the original items
    out *= np.array([1.03, 0.99, 0.92], dtype=np.float32)
    # darker shadows (a soft S curve) so the shapes have the same weight as the originals
    t = out / 255.0
    t = t * t * (3 - 2 * t) * 0.35 + t * 0.65
    out = t * 255.0
    # grain
    rng = np.random.default_rng(7)
    out += rng.normal(0, 3.0 * scale, out.shape[:2])[:, :, None]
    out = np.clip(out, 0, 255)
    # dark outline just inside the silhouette (the originals have a black-brown line around everything)
    solid = (alpha > 128)
    k = max(1, int(round(scale)))
    inner = ndimage.binary_erosion(solid, iterations=k)
    ring = solid & ~inner
    ring_col = np.array([22, 15, 10], dtype=np.float32)
    out[ring] = out[ring] * 0.25 + ring_col * 0.75
    res = np.dstack([out, alpha]).astype(np.uint8)
    return Image.fromarray(res, 'RGBA')


def main():
    sheet = Image.open(sys.argv[1])
    cells = cut_cells(sheet)
    stats = original_stats()
    print('original items: S %.0f V %.0f dark %.0f' % stats)
    os.makedirs(OUT, exist_ok=True)
    meta = []
    for (oid, name, side), im in zip(OBJECTS, cells):
        r = side / max(im.size)
        w, h = max(1, round(im.width * r)), max(1, round(im.height * r))
        for scale, suffix in ((1, ''), (2, 'l')):
            big = im.resize((w * scale, h * scale), Image.LANCZOS)
            # the work is done at the final size, so the outline has the final thickness
            g = grade(big, stats, scale)
            # alpha: crisp but with a little antialiasing, like the originals
            al = np.array(g)[:, :, 3]
            al = np.where(al > 140, 255, np.where(al > 60, 150, 0)).astype(np.uint8)
            arr = np.array(g); arr[:, :, 3] = al
            Image.fromarray(arr, 'RGBA').save(os.path.join(OUT, 'p2s01%s%s.png' % (oid, suffix)))
        meta.append({'id': oid, 'name': name, 'w': w, 'h': h})
    json.dump(meta, open(os.path.join(ROOT, 'tools', 'objects.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    rows = (',' + chr(10)).join("  { id: '%s', name: '%s', w: %d, h: %d }" % (o['id'], o['name'], o['w'], o['h']) for o in meta)
    head = "// generated by tools/make_objects.py (the new objects of the magnifying glass game)" + chr(10) + "export const LUPA_OBJECTS: { id: string; name: string; w: number; h: number }[] = [" + chr(10)
    open(os.path.join(ROOT, 'src', 'game', 'content', 'lupa_objects_data.ts'), 'w', encoding='utf-8').write(head + rows + chr(10) + "];" + chr(10))
    # a contact sheet to look at the result next to the original items
    S = Image.new('RGBA', (6 * 130, 4 * 130), (110, 110, 110, 255))
    for i, ((oid, _, _), _) in enumerate(zip(OBJECTS, cells)):
        a = Image.open(os.path.join(OUT, 'p2s01%sl.png' % oid)); b = Image.open(os.path.join(OUT, 'p2s01%s.png' % oid))
        x, y = (i % 6) * 130, (i // 6) * 130
        S.alpha_composite(a.resize((a.width * 2, a.height * 2), Image.NEAREST), (x + 4, y + 2))
        S.alpha_composite(b.resize((b.width * 2, b.height * 2), Image.NEAREST), (x + 4, y + 80))
    S.save(os.path.join(ROOT, 'research', 'shots', 'new_objects.png'))


if __name__ == '__main__':
    main()
