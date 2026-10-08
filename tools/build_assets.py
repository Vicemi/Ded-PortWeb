"""Packs the original game's files for the browser (run once; the output goes to public/assets and is committed):

  images.pak + images.json   every image of the game, byte-for-byte, one download (the browser decodes them synchronously, see codecs.ts)
  data.json                  data/ files as text (the `DAT!` ones are zlib-decompressed here; strings are latin-1 like the original's `str`)
  sounds/ + sounds.json      the original sounds + their length in seconds (pygame's Sound.get_length())
  (fonts: see build_fonts.py)

usage: python tools/build_assets.py [path to Ded.activity/game]
"""
import json, os, shutil, sys, zlib, warnings
warnings.filterwarnings('ignore')
os.environ['PYGAME_HIDE_SUPPORT_PROMPT'] = '1'

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GAME = sys.argv[1] if len(sys.argv) > 1 else 'F:/Games/DED/Ded.activity/game'
OUT = os.path.join(ROOT, 'public', 'assets')


def images():
    src = GAME + '/images'
    index = {}
    pos = 0
    with open(OUT + '/images.pak', 'wb') as pak:
        for name in sorted(os.listdir(src)):
            b = open(os.path.join(src, name), 'rb').read()
            index[name] = [pos, len(b)]
            pak.write(b)
            pos += len(b)
    json.dump(index, open(OUT + '/images.json', 'w'), separators=(',', ':'))
    print('images', len(index), pos // 1024, 'KB')


def data():
    src = GAME + '/data'
    out = {}
    for name in sorted(os.listdir(src)):
        b = open(os.path.join(src, name), 'rb').read()
        if b[:4] == b'DAT!':
            b = zlib.decompress(b[4:])
            kind = 'dat'
        else:
            kind = 'raw'
        out[name] = {'kind': kind, 'text': b.decode('latin-1')}
    json.dump(out, open(OUT + '/data.json', 'w'), separators=(',', ':'))
    print('data', len(out), 'files')


def racer():
    import yaml
    def load(n):
        t = open(GAME + '/data/' + n, encoding='latin-1').read().replace('	', ' ')
        return yaml.safe_load(t)
    out = {k: load(k + '.yaml') for k in ('camera', 'car', 'thief', 'traffic', 'gui')}
    out['maps'] = {'beach': load('p3_map_beach.yaml'), 'field': load('p3_map_field.yaml')}
    json.dump(out, open(OUT + '/racer.json', 'w'), separators=(',', ':'))
    print('racer data written')


def sounds():
    import pygame
    pygame.mixer.init(44100, -16, 2, 512)
    src = GAME + '/sounds'
    dst = OUT + '/sounds'
    os.makedirs(dst, exist_ok=True)
    meta = {}
    for name in sorted(os.listdir(src)):
        shutil.copyfile(os.path.join(src, name), os.path.join(dst, name))
        try:
            meta[name] = round(pygame.mixer.Sound(os.path.join(src, name)).get_length(), 4)
        except Exception as e:  # noqa: BLE001
            print('cannot measure', name, e)
            meta[name] = 0
    json.dump(meta, open(OUT + '/sounds.json', 'w'), separators=(',', ':'))
    print('sounds', len(meta))


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    images()
    data()
    racer()
    sounds()
