// framework/assets.py: loading images, data files, fonts and sounds. The original reads them synchronously from disk; here everything is
// downloaded once at start (init) and decoded synchronously on demand, so the rest of the port can call load_image() exactly like the game did.
import { decodeImage } from './codecs';
import { assetUrl, cacheGet, cachePut, cachedGet, download } from './net';
import { Font, type FontEntry } from './font';
import { Surface, transform, type Rect } from './pygame';
import { mixer, Sound, Channel } from './sounds';
import { os, open, setPackagedFiles } from '../runtime/py';
setPackagedFiles((p) => p.startsWith('data/') && p.slice(5) in store.data);

export let SOUND_VOLUME = 1;
const NL = String.fromCharCode(10);
const CR_END = new RegExp(String.fromCharCode(13) + '$');

interface Store {
  paks: (Uint8Array | null)[];
  base: string;
  index: Record<string, [number, number, number]>;
  data: Record<string, { kind: string; text: string }>;
  fonts: Record<string, FontEntry>;
  atlas: Surface | null;
  racer: any;
}
const store: Store = { paks: [null, null], base: '', index: {}, data: {}, fonts: {}, atlas: null, racer: null };
/** the data files of the car chase (camera, car, thief, traffic, gui and the maps), parsed from the original YAML */
export function racerData(): any { return store.racer; }
const decoded = new Map<string, WeakRef<Surface>>();
const registry = typeof FinalizationRegistry !== 'undefined' ? new FinalizationRegistry<string>((k) => { const r = decoded.get(k); if (r && !r.deref()) decoded.delete(k); }) : null;

let restLoading: Promise<void> = Promise.resolve();
/** resolves when every image is downloaded (the game does not wait for it: see decodeSurface) */
export function assetsComplete(): Promise<void> { return restLoading; }

/** the big pack of images being downloaded in 1 MB pieces (4 at a time, in file order); a piece that is here can be read already */
interface Partial_ { buf: Uint8Array; done: Uint8Array; piece: number }
const PIECE = 1 << 20;
const covered = (p: Partial_, off: number, len: number): boolean => {
  for (let i = Math.floor(off / p.piece), e = Math.floor((off + len - 1) / p.piece); i <= e; i++) if (!p.done[i]) return false;
  return true;
};
let partial: Partial_ | null = null;

async function downloadPieces(url: string, size: number): Promise<Uint8Array> {
  const n = Math.ceil(size / PIECE);
  const p: Partial_ = { buf: new Uint8Array(size), done: new Uint8Array(n), piece: PIECE };
  partial = p;
  let next = 0;
  const worker = async (): Promise<void> => {
    while (next < n) {
      const i = next++, start = i * PIECE, end = Math.min(size, start + PIECE) - 1;
      for (let attempt = 0; ; attempt++) {
        try {
          const r = await fetch(url, { headers: { Range: `bytes=${start}-${end}` } });
          if (r.status !== 206) throw new Error('no range support');
          const b = new Uint8Array(await r.arrayBuffer());
          if (b.length !== end - start + 1) throw new Error('short piece');
          p.buf.set(b, start); p.done[i] = 1;
          break;
        } catch (e) { if (attempt >= 3) throw e; await new Promise((res) => setTimeout(res, 400 * (attempt + 1))); }
      }
    }
  };
  await Promise.all([worker(), worker(), worker(), worker()]);
  return p.buf;
}

/** Downloads the packed game files: everything the game needs to start is requested at once, with one progress bar for all of it. The small `boot`
 *  pack of images is enough to start; the big one is downloaded in the background (or taken from the cache). `base` = URL of public/assets. */
export async function initAssets(base: string, onProgress?: (fraction: number) => void): Promise<void> {
  const parts = new Map<string, [number, number]>();
  let shown = 0;
  const report = (name: string) => (loaded: number, total: number): void => {
    parts.set(name, [loaded, total]);
    let l = 0, t = 0;
    for (const [a, b] of parts.values()) { l += a; t += b; }
    shown = Math.max(shown, t ? l / t : 0);
    onProgress?.(Math.min(shown, 0.99));
  };
  const text = new TextDecoder();
  const get = async <T,>(file: string): Promise<T> => JSON.parse(text.decode(await cachedGet(`${base}/${file}`, report(file)))) as T;
  const restUrl = assetUrl(`${base}/images_rest.pak`);
  // the big pack: from the cache, or by pieces when the server supports ranges (HEAD), else the game waits for it whole
  const restInfo = (async (): Promise<{ cached: Uint8Array | null; size: number }> => {
    const cached = await cacheGet(restUrl);
    if (cached) return { cached, size: cached.length };
    try {
      const h = await fetch(restUrl, { method: 'HEAD' });
      const size = Number(h.headers.get('content-length')) || 0;
      return { cached: null, size: h.headers.get('accept-ranges') === 'bytes' && size > PIECE ? size : 0 };
    } catch { return { cached: null, size: 0 }; }
  })();
  const [index, data, fonts, sounds, racer, atlasBytes, boot, rest] = await Promise.all([
    get<Store['index']>('images.json'), get<Store['data']>('data.json'),
    get<Record<string, FontEntry>>('fonts.json'), get<Record<string, number>>('sounds.json'), get<any>('racer.json'),
    cachedGet(`${base}/fonts.png`, report('fonts.png')), cachedGet(`${base}/images_boot.pak`, report('images_boot.pak')), restInfo,
  ]);
  store.base = base; store.index = index; store.data = data; store.fonts = fonts; store.racer = racer;
  mixer.init(`${base}/sounds`, sounds);
  // the atlas of the glyphs (decoded here: <img>.decode() can stall in background tabs)
  const png = decodeImage('fonts.png', atlasBytes);
  store.atlas = Surface.fromRGBA(png.w, png.h, png.data, true);
  store.paks[0] = boot;
  if (rest.cached) { store.paks[1] = rest.cached; return; }
  if (rest.size > 0) {
    // (the game does not wait: an image that is not here yet is read from the pieces already downloaded, or fetched on its own, see decodeSurface)
    restLoading = downloadPieces(restUrl, rest.size).then((b) => { store.paks[1] = b; partial = null; void cachePut(restUrl, b); })
      .catch((e) => { console.warn('background download failed, images are fetched one by one', e); });
    return;
  }
  // no ranges: wait for every image, there is no other way to read one
  const whole = await download(restUrl, report('images_rest.pak'));
  store.paks[1] = whole; void cachePut(restUrl, whole);
}

/** an image that is not downloaded yet (the player was faster than the background download): fetched on the spot with a synchronous range request */
function fetchNow(pak: number, off: number, len: number): Uint8Array | null {
  if (typeof XMLHttpRequest === 'undefined') return null;
  try {
    const x = new XMLHttpRequest();
    x.open('GET', assetUrl(`${store.base}/images_${pak === 0 ? 'boot' : 'rest'}.pak`), false);
    x.overrideMimeType('text/plain; charset=x-user-defined');
    x.setRequestHeader('Range', `bytes=${off}-${off + len - 1}`);
    x.send();
    if (x.status !== 206 && x.status !== 200) return null;
    const t = x.responseText;
    const start = x.status === 206 ? 0 : off;
    const out = new Uint8Array(len);
    for (let i = 0; i < len; i++) out[i] = t.charCodeAt(start + i) & 0xff;
    return out;
  } catch { return null; }
}

// ---------------------------------------------------------------------------------------------------------------------------------- data
/** load_data: the lines of a data file, each one split in its fields. `compressed` files are the `DAT!` ones (already inflated by the packer).
 *  Files the game wrote itself (characters, scores...) live in the virtual file system and are looked up first when `from_dynamic_path` is set. */
export function load_data(file_name: string, field_sep = ';', throw_exception = true, _compressed = true, from_dynamic_path = false): string[][] {
  let text: string | null = null;
  if (from_dynamic_path) text = readUserFile(file_name);
  if (text === null) {
    const f = store.data[file_name];
    if (f) text = f.text;
  }
  if (text === null) {
    if (throw_exception) throw new Error(`Cannot load data file: data/${file_name}`);
    return [];
  }
  return text.split(NL).map((l) => l.replace(CR_END, '').split(field_sep));
}
/** save_data: writes a data file (rows of fields) into the browser's storage */
export function save_data(file_name: string, data: unknown[][], field_sep = ';', _compress = true): void {
  const content = data.map((fields) => fields.map((f) => String(f)).join(field_sep)).join(NL);
  writeUserFile(file_name, content);
}
/** raw text of a data file (the YAML files) */
export function load_text(file_name: string): string {
  const f = store.data[file_name];
  if (!f) throw new Error(`Cannot load data file: data/${file_name}`);
  return f.text;
}
export function has_data(file_name: string): boolean { return file_name in store.data; }

// ---------------------------------------------------------------------------------------------------------------------------------- images
function decodeSurface(file_name: string): Surface {
  const cached = decoded.get(file_name)?.deref();
  if (cached) return cached;
  const e = store.index[file_name];
  if (!e) throw new Error(`Cannot load image: images/${file_name}`);
  const pak = store.paks[e[0]];
  const bytes = pak ? pak.subarray(e[1], e[1] + e[2]) : e[0] === 1 && partial && covered(partial, e[1], e[2]) ? partial.buf.subarray(e[1], e[1] + e[2]) : fetchNow(e[0], e[1], e[2]);
  if (!bytes) throw new Error(`Cannot load image: images/${file_name}`);
  const r = decodeImage(file_name, bytes);
  const s = Surface.fromRGBA(r.w, r.h, r.data, r.bits32);
  decoded.set(file_name, new WeakRef(s));
  registry?.register(s, file_name);
  return s;
}

/** load_surface: a fresh copy is not made (surfaces of images are never modified in place by the game: it copies before changing pixels) */
export function load_surface(file_name: string): Surface { return decodeSurface(file_name); }
export function load_mask(file_name: string): Surface { return decodeSurface(file_name); }
export function load_image(file_name: string): Image_ { return new Image_(load_surface(file_name), file_name); }
export function has_image(file_name: string): boolean { return file_name in store.index; }

export function load_font(file_name: string, size: number): Font {
  const e = store.fonts[`${file_name}@${size}`];
  if (!e || !store.atlas) throw new Error(`Cannot load font: ${file_name}@${size}`);
  return new Font(e, store.atlas);
}

// ---------------------------------------------------------------------------------------------------------------------------------- sounds
export class CustomSound {
  constructor(public sound: Sound) {}
  play(loops = 0, maxtime = 0): void {
    const channel = this.sound.play(loops, maxtime);
    if (channel) channel.set_volume(SOUND_VOLUME);
  }
  stop(): void { this.sound.stop(); }
  get_length(): number { return this.sound.get_length(); }
  fade_out(): void { this.sound.fadeout(0); }
  set_volume(v: number): void { this.sound.set_volume(v); }
  get_volume(): number { return this.sound.get_volume(); }
  get_num_channel(): number { return this.sound.get_num_channels(); }
}
export function load_sound(file_name: string): CustomSound { return new CustomSound(mixer.sound(file_name)); }
export const load_music = load_sound;
export type { Channel };

// ---------------------------------------------------------------------------------------------------------------------------------- Image
export class Image_ {
  surface: Surface;
  private file_name: string;
  constructor(surface: Surface, file_name = '') { this.surface = surface; this.file_name = file_name; }
  get_file_name(): string { return this.file_name; }
  get_width(): number { return this.surface.get_width(); }
  get_height(): number { return this.surface.get_height(); }
  get_size(): [number, number] { return [this.get_width(), this.get_height()]; }
  flip_h(): void { this.surface = transform.flip(this.surface, true, false); }
  flip_h_copy(): Image_ { return new Image_(transform.flip(this.surface, true, false), this.file_name); }
  flip_v(): void { this.surface = transform.flip(this.surface, false, true); }
  flip_v_copy(): Image_ { return new Image_(transform.flip(this.surface, false, true), this.file_name); }
  flip_hv(): void { this.surface = transform.flip(this.surface, true, true); }
  flip_hv_copy(): Image_ { return new Image_(transform.flip(this.surface, true, true), this.file_name); }
  get_real_rect(): Rect { return this.surface.get_rect(); }
  blit_over(target: Surface, pos: readonly number[], area?: Rect | null): void { target.blit(this.surface, pos, area ?? undefined); }
}
export { Image_ as Image };

export function setSoundVolume(v: number): void { SOUND_VOLUME = v; }

// ---------------------------------------------------------------------------------------------------------------------------------- user files
const userPath = (name: string): string => 'data/' + name;
function readUserFile(name: string): string | null {
  const p = userPath(name);
  if (!os.path.exists(p)) return null;
  const f = open(p, 'r');
  const t = f.read();
  f.close();
  return t;
}
function writeUserFile(name: string, content: string): void {
  const f = open(userPath(name), 'w');
  f.write(content);
  f.close();
}
