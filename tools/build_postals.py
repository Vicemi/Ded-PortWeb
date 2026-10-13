"""New pictures for the puzzle of the bricklayer (the picture of a place of Uruguay cut in pieces, with its small framed photo):
  p1_minigame_bricklayer_postal_0NN.jpg   348x252, the picture of the puzzle
  p1_minigame_bricklayer_photo_0NN.png    115x93, the same picture in the tilted frame of the original photos (frame = photo_000 of the original game)
usage: python tools/build_postals.py          (reads art_inbox/postal_<n>.png, n = the numbers of tools/postals.json)
The output goes to tools/extra_images. The names and departments are in tools/postals.json (and in src/game/content/extend.ts via content_web.py).
"""
import io, json, os
import numpy as np
import cv2
from PIL import Image
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, 'public', 'assets')
OUT = os.path.join(ROOT, 'tools', 'extra_images')
index = json.load(open(os.path.join(ASSETS, 'images.json')))
paks = [open(os.path.join(ASSETS, 'images_boot.pak'), 'rb').read(), open(os.path.join(ASSETS, 'images_rest.pak'), 'rb').read()]


def original(name):
    p, o, l = index[name]
    return Image.open(io.BytesIO(paks[p][o:o + l])).convert('RGBA')


def cover(im, w, h):
    s = max(w / im.width, h / im.height)
    r = im.resize((int(im.width * s + 0.5), int(im.height * s + 0.5)), Image.LANCZOS)
    x, y = (r.width - w) // 2, (r.height - h) // 2
    return r.crop((x, y, x + w, y + h))


def painterly(im):
    """a little more saturation and a soft glow, like the originals"""
    a = np.array(im.convert('RGB')).astype(np.float32) / 255
    hsv = cv2.cvtColor(a, cv2.COLOR_RGB2HSV)
    hsv[..., 1] = np.clip(hsv[..., 1] * 1.08, 0, 1)
    return Image.fromarray((cv2.cvtColor(hsv, cv2.COLOR_HSV2RGB) * 255).astype(np.uint8))


def main():
    os.makedirs(OUT, exist_ok=True)
    meta = json.load(open(os.path.join(ROOT, 'tools', 'postals.json'), encoding='utf-8'))
    frame = original('p1_minigame_bricklayer_photo_000.png')
    alpha = np.array(frame)[..., 3]
    # the window of the frame: the transparent area that does not touch the border
    hole = alpha < 30
    lab, n = ndimage.label(hole)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]])))
    inner = np.isin(lab, [i for i in range(1, n + 1) if i not in border])
    ys, xs = np.where(inner)
    pts = np.stack([xs, ys], axis=1).astype(np.float32)
    (cx, cy), (rw, rh), ang = cv2.minAreaRect(pts)
    box = cv2.boxPoints(((cx, cy), (rw, rh), ang)).astype(np.float32)
    # order: top-left, top-right, bottom-right, bottom-left
    s = box.sum(axis=1); d = np.diff(box, axis=1).ravel()
    quad = np.array([box[np.argmin(s)], box[np.argmin(d)], box[np.argmax(s)], box[np.argmax(d)]], np.float32)
    for m in meta:
        src = os.path.join(ROOT, 'art_inbox', 'postal_%d.png' % m['number'])
        if not os.path.exists(src):
            print('missing', src)
            continue
        im = painterly(Image.open(src).convert('RGB'))
        cover(im, 348, 252).save(os.path.join(OUT, 'p1_minigame_bricklayer_postal_%03d.jpg' % m['number']), quality=92)
        big = np.array(cover(im, 460, 372))
        M = cv2.getPerspectiveTransform(np.float32([[0, 0], [459, 0], [459, 371], [0, 371]]), quad)
        warped = cv2.warpPerspective(big, M, (frame.width, frame.height), flags=cv2.INTER_AREA)
        base = Image.fromarray(warped).convert('RGBA')
        # the picture only inside the window, then the frame on top
        mask = Image.fromarray((ndimage.binary_dilation(inner, iterations=2) * 255).astype(np.uint8))
        out = Image.new('RGBA', frame.size, (0, 0, 0, 0))
        out.paste(base, (0, 0), mask)
        out.alpha_composite(frame)
        out.save(os.path.join(OUT, 'p1_minigame_bricklayer_photo_%03d.png' % m['number']))
        print('built', m['number'], m['name'])


if __name__ == '__main__':
    main()
