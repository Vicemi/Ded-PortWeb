"""Packs the original game's files for the browser (run once; the output goes to public/assets and is committed):

  images_boot.pak, images_rest.pak + images.json   every image of the game, byte-for-byte (the browser decodes them synchronously, see codecs.ts)
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
    """two packs: `boot` (what the first screens need: the game starts as soon as it is here) and `rest` (downloaded in the background)"""
    src = GAME + '/images'
    boot = set(json.load(open(os.path.join(ROOT, 'tools', 'boot_images.json'))))
    names = sorted(os.listdir(src))
    boot |= {n for n in names if n.split('_')[0].split('.')[0] in ('cursor', 'btn', 'black')}
    def phase(n):
        return (n[1] if len(n) > 2 and n[0] == 'p' and n[1].isdigit() and n[2] == '_' else '-', n)
    packs = {'boot': [n for n in names if n in boot], 'rest': sorted((n for n in names if n not in boot), key=phase)}
    index = {}
    for pack, items in packs.items():
        pos = 0
        with open(OUT + '/images_%s.pak' % pack, 'wb') as pak:
            for name in items:
                b = open(os.path.join(src, name), 'rb').read()
                index[name] = [0 if pack == 'boot' else 1, pos, len(b)]
                pak.write(b)
                pos += len(b)
        print('pack', pack, len(items), pos // 1024, 'KB')
    json.dump(index, open(OUT + '/images.json', 'w'), separators=(',', ':'))


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
        if name.endswith('.ogg'):  # fallback for browsers that cannot play Ogg Vorbis (older Safari)
            import subprocess
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', os.path.join(src, name), '-c:a', 'aac', '-b:a', '96k', os.path.join(dst, name[:-4] + '.m4a')], check=True)
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
