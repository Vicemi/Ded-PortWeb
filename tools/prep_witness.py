"""crops the white bars of a Gemini landscape capture and flattens the dark-green floor shadow into the chroma green: python tools/prep_witness.py art_inbox/witness_x.png"""
import sys
import numpy as np
from PIL import Image
p = sys.argv[1]
a = np.array(Image.open(p).convert('RGB')).astype(int)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
green = (g > r + 40) & (g > b + 40)
ys, xs = np.where(green)
y0, y1, x0, x1 = ys.min() + 3, ys.max() - 3, xs.min() + 3, xs.max() - 3
a = a[y0:y1, x0:x1]
r, g, b = a[..., 0], a[..., 1], a[..., 2]
shadow = (g > r + 15) & (g > b + 15) & (g < 200)      # darker greens: the floor shadow
a[shadow] = (0, 255, 0)
Image.fromarray(a.astype(np.uint8)).save(p)
print('prepped', a.shape)
