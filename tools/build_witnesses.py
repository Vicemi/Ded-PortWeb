"""Builds the pictures of a new kind of witness (phase 1) from its drawings made on a flat green background (#00ff00), in the style of the original ones:
  p1_minigame_<id>.png               the witness standing, ~170-200 x 300 (like the originals: soft shadow, the legs fade out at the bottom)
  p1_minigame_<id>_happy.png         the same witness happy (optional: art_inbox/witness_<id>_happy.png)
  p1_witness_<id>.png                54x50 card (the face on the card of the original witnesses)
  p1_minigame_flux_<id>_dialogue1.png   the paper of the dialogue, tinted
usage: python tools/build_witnesses.py <id> [r,g,b tint of the dialogue paper]
reads art_inbox/witness_<id>.png (and witness_<id>_happy.png); the output goes to tools/extra_images.
"""
import io, json, os, sys
import numpy as np
import cv2
from PIL import Image, ImageFilter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from make_mugshot import key, shade   # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, 'public', 'assets')
OUT = os.path.join(ROOT, 'tools', 'extra_images')
index = json.load(open(os.path.join(ASSETS, 'images.json')))
paks = [open(os.path.join(ASSETS, 'images_boot.pak'), 'rb').read(), open(os.path.join(ASSETS, 'images_rest.pak'), 'rb').read()]


def original(name):
    p, o, l = index[name]
    return Image.open(io.BytesIO(paks[p][o:o + l])).convert('RGBA')


def standing(fig, H=312, maxw=200):
    """the figure at the size of the originals, a soft shadow behind and the legs fading out"""
    s = min(H / fig.height, maxw / fig.width)
    f = fig.resize((int(fig.width * s), int(fig.height * s)), Image.LANCZOS)
    W = f.width + 24
    out = Image.new('RGBA', (W, f.height + 12), (0, 0, 0, 0))
    sh = Image.new('L', out.size, 0)
    sh.paste(f.split()[3], (14, 8))
    sh = sh.filter(ImageFilter.GaussianBlur(5)).point(lambda v: int(v * 0.35))
    out.paste(Image.new('RGBA', out.size, (20, 20, 25, 255)), (0, 0), sh)
    out.alpha_composite(f, (6, 2))
    a = np.array(out)
    h = a.shape[0]
    fade = np.clip((h - np.arange(h)) / (h * 0.16), 0, 1)[:, None]      # the last 16%: fades to nothing
    a[..., 3] = (a[..., 3] * fade).astype(np.uint8)
    return Image.fromarray(a, 'RGBA')


def card(face):
    """the card of the list: the median of the four original cards with the face in the window"""
    names = ['p1_witness_bricklayer.png', 'p1_witness_gardener.png', 'p1_witness_librarian.png', 'p1_witness_shoptender.png']
    A = np.stack([np.array(original(n)).astype(float) for n in names])
    std = A[..., :3].std(axis=0).mean(axis=-1)
    ys, xs = np.where(std > 28)
    x0, y0, x1, y1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
    med = np.median(A, axis=0)
    med[y0:y1, x0:x1, 3] = 0
    frame = Image.fromarray(med.astype(np.uint8), 'RGBA')
    ww, wh = x1 - x0, y1 - y0
    fw, fh = face.size
    bh = fh * 0.36
    bw = bh * ww / wh
    # the head is not always in the middle of the figure (a ponytail, a thermos under the arm): the centre of the skin of the top third
    a = np.array(face)
    top = a[:int(fh * 0.33)]
    r, g, b = top[..., 0].astype(int), top[..., 1].astype(int), top[..., 2].astype(int)
    skin = (top[..., 3] > 200) & (r > 150) & (g > 95) & (b > 60) & (r > g) & (g > b - 10) & (r - b > 35)
    cx = float(np.where(skin)[1].mean()) if skin.any() else fw / 2
    x0c = int(min(max(cx - bw / 2, 0), max(0, fw - bw)))
    crop = face.crop((x0c, 0, int(x0c + bw), int(bh)))
    bg = Image.new('RGBA', frame.size, (0, 0, 0, 0))
    plate = Image.new('RGBA', (ww, wh), (205, 200, 215, 255))
    plate.alpha_composite(crop.resize((ww, wh), Image.LANCZOS))
    bg.paste(plate, (x0, y0))
    bg.alpha_composite(frame)
    return bg


def tinted_dialogue(rgb):
    base = original('p1_minigame_flux_bricklayer_dialogue1.png')
    a = np.array(base).astype(np.float32)
    lum = (a[..., :3] * [0.3, 0.59, 0.11]).sum(axis=-1, keepdims=True) / 255.0
    paper = lum > 0.5                                     # the black outline stays black
    tint = np.array(rgb, np.float32)
    k = (a[..., :3] / np.maximum(a[..., :3].max(), 1))
    shade_ = lum / 0.93
    a[..., :3] = np.where(paper, np.clip(tint * shade_, 0, 255), a[..., :3])
    return Image.fromarray(a.clip(0, 255).astype(np.uint8), 'RGBA')


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    wid = sys.argv[1]
    tint = [int(v) for v in sys.argv[2].split(',')] if len(sys.argv) > 2 else [247, 216, 216]
    os.makedirs(OUT, exist_ok=True)
    fig = shade(key(os.path.join(ROOT, 'art_inbox', 'witness_%s.png' % wid), clear_big=2500))
    standing(fig).save(os.path.join(OUT, 'p1_minigame_%s.png' % wid))
    happy = os.path.join(ROOT, 'art_inbox', 'witness_%s_happy.png' % wid)
    if os.path.exists(happy):
        standing(shade(key(happy, clear_big=2500))).save(os.path.join(OUT, 'p1_minigame_%s_happy.png' % wid))
    card(fig).save(os.path.join(OUT, 'p1_witness_%s.png' % wid))
    tinted_dialogue(tint).save(os.path.join(OUT, 'p1_minigame_flux_%s_dialogue1.png' % wid))
    print('built witness', wid)


if __name__ == '__main__':
    main()
