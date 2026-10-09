"""Builds the four pictures of a thief of the game from two drawings (front and side) made on a flat green background (#00ff00), in the style of
the original police photos: grey wall with the height chart, the figure with thick outlines and the colours of the original art, the black plate, and
the very frame of the original pictures (tools/frames, made by build_frames.py).

  p0_thief_big_<id>_1.jpg   front, 127x171     p0_thief_big_<id>_2.jpg   side, 128x171
  p0_thief_big_<id>_3.jpg   close-up, 90x108   p0_thief_small_<id>.png   the card of the suspects list, 64x61

usage: python tools/make_mugshot.py <id> <front.png> <side.png> "<S 123>" <12345678> [tall|short]
The output goes to tools/extra_images (build_assets.py puts it in the image pack).
"""
import os, sys
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'tools', 'extra_images')
FRAMES = os.path.join(ROOT, 'tools', 'frames')
SS = 3   # work at 3x and reduce: smooth edges like the original art
FONT = 'C:/Windows/Fonts/arialbd.ttf'


def key(path):
    """the green background becomes transparent (flood from the borders, so green inside the drawing stays); the result is cropped to the drawing"""
    im = np.array(Image.open(path).convert('RGB')).astype(int)
    r, g, b = im[..., 0], im[..., 1], im[..., 2]
    bg = (g > 140) & (g - r > 60) & (g - b > 60)
    lab, n = ndimage.label(bg)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    mask = np.isin(lab, list(edge))
    mask = ndimage.binary_dilation(mask, iterations=1)           # eat the fringe
    alpha = (~mask).astype(np.uint8) * 255
    # green spill on the remaining edge pixels
    spill = (g > r + 20) & (g > b + 20) & ndimage.binary_dilation(mask, iterations=3)
    im[..., 1] = np.where(spill, np.maximum(r, b) + 5, g)
    # green seen through glasses or between arm and body: a pale glass tint instead
    hole = (alpha > 0) & (g > 170) & (g - r > 90) & (g - b > 90)
    for c, v in enumerate((205, 215, 225)):
        im[..., c] = np.where(hole, v, im[..., c])
    rgba = np.dstack([im.clip(0, 255).astype(np.uint8), alpha])
    ys, xs = np.where(alpha > 0)
    return Image.fromarray(rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1], 'RGBA')


def shade(fig):
    """the look of the original art: a little more saturated, flatter colours, and thick dark outlines"""
    a = np.array(fig).astype(np.float32)
    rgb, alpha = a[..., :3] / 255.0, a[..., 3]
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)
    hsv[..., 1] = np.clip(hsv[..., 1] * 1.14, 0, 1)
    hsv[..., 2] = np.clip((hsv[..., 2] - 0.5) * 1.05 + 0.5, 0, 1)
    rgb = cv2.cvtColor(hsv, cv2.COLOR_HSV2RGB)
    rgb = np.round(rgb * 13) / 13.0                                   # fewer tones: flat cel colours
    lum = 0.3 * rgb[..., 0] + 0.59 * rgb[..., 1] + 0.11 * rgb[..., 2]
    line = (lum < 0.17).astype(np.uint8)
    k = max(3, int(SS * 0.9) | 1)
    thick = cv2.dilate(line, np.ones((k, k), np.uint8))
    thick = cv2.GaussianBlur(thick.astype(np.float32), (0, 0), 0.7)[..., None]
    rgb = rgb * (1 - thick * 0.92)
    out = np.dstack([(rgb * 255).clip(0, 255), alpha]).astype(np.uint8)
    return Image.fromarray(out, 'RGBA')


def wall(w, h, short):
    img = np.zeros((h, w, 3), np.float32)
    yy = np.linspace(0, 1, h)[:, None, None]
    img[:] = np.array([236, 240, 245]) * (1 - yy * 0.10) + np.array([205, 210, 218]) * (yy * 0.10)
    im = Image.fromarray(img.clip(0, 255).astype(np.uint8))
    d = ImageDraw.Draw(im)
    font = ImageFont.truetype(FONT, int(h * 0.085))
    top = ['1.80m', '1.60m', '1.40m', '1.20m'] if short else ['2.00m', '1.80m', '1.60m', '1.40m']
    for k, label in enumerate(top):
        y = int(h * (0.16 + 0.215 * k))
        d.line([(0, y), (w, y)], fill=(60, 62, 70), width=max(1, int(h * 0.006)))
        d.text((int(w * 0.015), y - int(h * 0.095)), label, font=font, fill=(172, 178, 186))
    return im


def photo(fig, w, h, short, plate=None, side=False):
    """the figure on the wall, w x h pixels, no frame"""
    W, H = w * SS, h * SS
    base = wall(W, H, short).convert('RGBA')
    fw, fh = fig.size
    s = (W * (1.0 if side else 1.2)) / fw
    f = fig.resize((int(fw * s), int(fh * s)), Image.LANCZOS)
    fx, fy = (int(W * 0.96) - f.width if side else (W - f.width) // 2), int(H * 0.03)
    # soft shadow of the figure on the wall
    sh = Image.new('L', base.size, 0)
    sh.paste(f.split()[3], (fx + int(W * 0.07), fy + int(H * 0.03)))
    sh = sh.filter(ImageFilter.GaussianBlur(W * 0.025)).point(lambda v: int(v * 0.30))
    base = Image.composite(Image.new('RGBA', base.size, (110, 116, 128, 255)), base, sh)
    base.alpha_composite(f, (fx, fy))
    if plate:
        d = ImageDraw.Draw(base, 'RGBA')
        px0, py0, px1, py1 = int(W * 0.205), int(H * 0.805), int(W * 0.78), int(H * 0.965)
        d.rounded_rectangle([px0, py0, px1, py1], radius=int(W * 0.015), fill=(18, 18, 18, 232))
        font = ImageFont.truetype(FONT, int(H * 0.066))
        d.text((px0 + int(W * 0.04), py0 + int(H * 0.012)), plate[0], font=font, fill=(250, 250, 250, 255))
        d.text((px0 + int(W * 0.04), py0 + int(H * 0.085)), plate[1], font=font, fill=(250, 250, 250, 255))
    return base


def reduce(img, w, h):
    return img.resize((w, h), Image.LANCZOS)


def framed(img, frame_file):
    fr = Image.open(os.path.join(FRAMES, frame_file)).convert('RGBA')
    out = img.convert('RGBA')
    out.alpha_composite(fr)
    return out.convert('RGB')


def main():
    if len(sys.argv) < 4:
        sys.exit(__doc__)
    tid, front_f, side_f = sys.argv[1:4]
    code = sys.argv[4] if len(sys.argv) > 4 else 'S 100'
    serial = sys.argv[5] if len(sys.argv) > 5 else '10000000'
    short = len(sys.argv) > 6 and sys.argv[6] == 'short'
    os.makedirs(OUT, exist_ok=True)
    front, side = shade(key(front_f)), shade(key(side_f))
    # the figures are shaded at their own size; the photo is then built at 3x and reduced
    front = front.resize((127 * SS, int(front.height * 127 * SS / front.width)), Image.LANCZOS)
    side = side.resize((128 * SS, int(side.height * 128 * SS / side.width)), Image.LANCZOS)
    pf = photo(front, 127, 171, short, (code, 'Nº- ' + serial))
    ps = photo(side, 128, 171, short, (code + '-s', 'Nº- ' + serial), side=True)
    framed(reduce(pf, 127, 171), 'frame_front.png').save(os.path.join(OUT, 'p0_thief_big_%s_1.jpg' % tid), quality=92)
    framed(reduce(ps, 128, 171), 'frame_side.png').save(os.path.join(OUT, 'p0_thief_big_%s_2.jpg' % tid), quality=92)
    # close-up: the head of the front picture at the same scale, without frame or plate
    clean = reduce(photo(front, 127, 171, short), 127, 171)
    clean.crop((19, 6, 109, 114)).convert('RGB').save(os.path.join(OUT, 'p0_thief_big_%s_3.jpg' % tid), quality=92)
    # card of the suspects list: the face in the window of the original card
    card = Image.open(os.path.join(FRAMES, 'icon_frame.png')).convert('RGBA')
    x0, y0, x1, y1 = 13, 14, 50, 47
    bg = Image.new('RGBA', card.size, (0, 0, 0, 0))
    ww, wh = x1 - x0, y1 - y0
    fw, fh = front.size
    bh = fh * 0.44                       # the head and the neck
    hw = bh * ww / wh
    box = (int((fw - hw) / 2), int(fh * 0.01), int((fw + hw) / 2), int(fh * 0.01 + bh))
    face = Image.new('RGBA', (box[2] - box[0], box[3] - box[1]), (214, 219, 226, 255))
    face.alpha_composite(front.crop(box))
    bg.paste(face.resize((ww, wh), Image.LANCZOS), (x0, y0))
    out = Image.new('RGBA', card.size, (0, 0, 0, 0))
    out.alpha_composite(bg)
    out.alpha_composite(card)
    out.save(os.path.join(OUT, 'p0_thief_small_%s.png' % tid))
    print('built', tid)


if __name__ == '__main__':
    main()
