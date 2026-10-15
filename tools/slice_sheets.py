"""Cuts the sheets with several assets each (art_inbox/Nuevos assets/Assets_<game>.png, made with Gemini with a caption under every picture) into the files that
tools/build_minigame_art.py expects: art_inbox/mg_<name>.png. The boxes are in the coordinates of the 1400-wide preview of each sheet (scaled to the real size);
a picture that Gemini drew on a light-blue box gets that colour turned into the chroma green (flood from the border), so the green key of the next step works.
usage: python tools/slice_sheets.py [folder with the sheets]   then: python tools/build_minigame_art.py && python tools/build_assets.py
"""
import os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'art_inbox', 'Nuevos assets')
OUT = os.path.join(ROOT, 'art_inbox')

# sheet -> [(file name, (x0, y0, x1, y1) in the 1400-wide preview, 'cyan' when the picture sits on a light-blue box)]
SHEETS = {
    'Assets_cartero.png': [
        ('mg_cartero_bg', (42, 15, 452, 324), ''), ('mg_cartero_stamps', (656, 58, 1352, 268), ''), ('mg_cartero_envelope', (40, 395, 327, 610), ''),
        ('mg_cartero_stamp', (368, 435, 634, 585), 'cyan_all'), ('mg_cartero_bag', (676, 397, 895, 610), 'cyan'),
    ],
    'Assets_bandera.png': [
        ('mg_banderas_bg', (42, 15, 672, 463), ''), ('mg_banderas_cardback', (806, 22, 1006, 303), ''), ('mg_banderas_frame', (766, 383, 1036, 606), ''),
    ],
    'Assets_corredora.png': [
        ('mg_rambla_sky', (42, 15, 453, 325), ''), ('mg_rambla_skyline', (510, 25, 1352, 200), ''), ('mg_rambla_ground', (510, 241, 1352, 349), ''),
        ('mg_rambla_runner', (42, 393, 453, 480), 'cyan'), ('mg_rambla_runner_jump', (536, 393, 881, 480), 'cyan'), ('mg_rambla_runner_fall', (42, 532, 449, 620), 'cyan'),
        ('mg_rambla_obstacles', (528, 545, 945, 620), ''), ('mg_rambla_meta', (1012, 514, 1368, 645), 'cyan_all'),
    ],
    'Assets_matero.png': [   # (this sheet is 1024 wide: preview scale 1)
        ('mg_mate_bg', (17, 16, 506, 316), ''), ('mg_mate_termo', (532, 20, 700, 314), ''), ('mg_mate_termo_pour', (742, 22, 1000, 205), ''),
        ('mg_mate_gourd', (790, 236, 1000, 472), ''), ('mg_mate_steam', (22, 358, 392, 470), ''), ('mg_mate_splash', (416, 358, 770, 470), 'cyan'),
    ],
    'Assets_candombe.png': [   # (1024 wide: preview scale 1; every picture is on a grey-green panel: it is flattened to the chroma green)
        ('mg_candombe_bg', (12, 12, 505, 148), ''), ('mg_candombe_chico', (537, 24, 616, 130), 'cyan'), ('mg_candombe_repique', (650, 24, 750, 130), 'cyan'),
        ('mg_candombe_piano', (775, 14, 890, 130), 'cyan'), ('mg_candombe_palmas', (910, 18, 1000, 134), 'cyan'),
        ('mg_candombe_crowd', (12, 176, 890, 266), 'cyan_all'), ('mg_candombe_spot', (912, 180, 998, 266), 'cyan'),
    ],
    'Assets_minijuegos.png': [
        ('mg_ui_stars', (500, 36, 900, 220), ''), ('mg_ui_sparkles', (440, 318, 950, 462), ''), ('mg_ui_confetti', (400, 570, 1005, 690), ''),
    ],
}


def to_green(im, everywhere=False):
    """the light-blue box around a picture becomes chroma green (only what touches the border)"""
    a = np.array(im.convert('RGB')).astype(int)
    ref = np.median(np.concatenate([a[:4].reshape(-1, 3), a[-4:].reshape(-1, 3), a[:, :4].reshape(-1, 3), a[:, -4:].reshape(-1, 3)]), axis=0)
    near = (np.abs(a - ref).sum(axis=2) < (80 if everywhere else 70))
    if everywhere:   # also the light-blue inside the drawing (the oval of the stamp, the sky of the arch)
        r, g, b = a[..., 0], a[..., 1], a[..., 2]
        near |= ((b - r > 14) & (b > 190) & (g > 170))   # light blues and greys-blue of the sky (white flags stay)
        a[near] = (0, 255, 0)
        return Image.fromarray(a.astype(np.uint8))
    lab, _ = ndimage.label(near)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    mask = np.isin(lab, list(edge))
    mask = ndimage.binary_dilation(mask, iterations=2)
    a[mask] = (0, 255, 0)
    return Image.fromarray(a.astype(np.uint8))


def main():
    for fname, items in SHEETS.items():
        p = os.path.join(SRC, fname)
        if not os.path.exists(p):
            print('missing', fname)
            continue
        im = Image.open(p).convert('RGB')
        k = im.width / min(1400, im.width)
        for name, (x0, y0, x1, y1), mode in items:
            c = im.crop((round(x0 * k), round(y0 * k), round(x1 * k), round(y1 * k)))
            if mode.startswith('cyan'):
                c = to_green(c, mode == 'cyan_all')
            c.save(os.path.join(OUT, name + '.png'))
            print(' ', name, c.size)


if __name__ == '__main__':
    main()
