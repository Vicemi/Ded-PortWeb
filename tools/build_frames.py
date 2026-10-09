"""Extracts from the 16 original thieves the parts that all their pictures share, so the new thieves can be given exactly the same frame:
  tools/frames/frame_front.png, frame_side.png   the ring of the police photo (cream paper edge + rough black frame), the inside is transparent
  tools/frames/icon_frame.png                    the card of the suspects list (paper, pin, black frame) with the window of the photo transparent
usage: python tools/build_frames.py [path to the images pak folder: public/assets]
"""
import io, json, os, sys
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'public', 'assets')
OUT = os.path.join(ROOT, 'tools', 'frames')
IDS = ['ana', 'andrea', 'estela', 'giacommo', 'grace', 'helga', 'langostino', 'roberta', 'roberto', 'ruffo', 'steal', 'sven', 'teresa', 'timoteo', 'tomas', 'vanessa']
RING = 6          # pixels of frame around the photo
WINDOW = (13, 14, 50, 47)   # x0, y0, x1, y1 of the photo window of the list icon

index = json.load(open(os.path.join(ASSETS, 'images.json')))
paks = [open(os.path.join(ASSETS, 'images_boot.pak'), 'rb').read(), open(os.path.join(ASSETS, 'images_rest.pak'), 'rb').read()]


def original(name):
    p, o, l = index[name]
    return Image.open(io.BytesIO(paks[p][o:o + l])).convert('RGBA')


def ring(suffix, size):
    imgs = np.stack([np.array(original('p0_thief_big_%s_%s.jpg' % (i, suffix)).resize(size, Image.NEAREST)).astype(float) for i in IDS])
    med = np.median(imgs, axis=0)
    h, w = med.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    d = np.minimum(np.minimum(xx, w - 1 - xx), np.minimum(yy, h - 1 - yy))
    med[..., 3] = np.where(d < RING, 255, 0)
    return Image.fromarray(med.astype(np.uint8), 'RGBA')


os.makedirs(OUT, exist_ok=True)
ring('1', (127, 171)).save(os.path.join(OUT, 'frame_front.png'))
ring('2', (128, 171)).save(os.path.join(OUT, 'frame_side.png'))
icons = np.stack([np.array(original('p0_thief_small_%s.png' % i)).astype(float) for i in IDS])
med = np.median(icons, axis=0)
x0, y0, x1, y1 = WINDOW
med[y0:y1, x0:x1, 3] = 0
Image.fromarray(med.astype(np.uint8), 'RGBA').save(os.path.join(OUT, 'icon_frame.png'))
print('frames written to', OUT)
