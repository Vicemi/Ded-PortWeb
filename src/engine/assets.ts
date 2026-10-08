// framework/assets.py: loading images, data files, fonts and sounds. The original reads them synchronously from disk; here everything is
// downloaded once at start (init) and decoded synchronously on demand, so the rest of the port can call load_image() exactly like the game did.
import { decodeImage } from './codecs';
import { Font, type FontEntry } from './font';
import { Surface, transform, type Rect } from './pygame';
import { mixer, Sound, Channel } from './sounds';

export let SOUND_VOLUME = 1;

interface Store {
  pak: Uint8Array | null;
  index: Record<string, [number, number]>;
  data: Record<string, { kind: string; text: string }>;
  fonts: Record<string, FontEntry>;
  atlas: Surface | null;
}
const store: Store = { pak: null, index: {}, data: {}, fonts: {}, atlas: null };
const decoded = new Map<string, WeakRef<Surface>>();
const registry = typeof FinalizationRegistry !== 'undefined' ? new FinalizationRegistry<string>((k) => { const r = decoded.get(k); if (r && !r.deref()) decoded.delete(k); }) : null;

/** Downloads the packed game files. `base` = URL of public/assets. */
export async function initAssets(base: string, onProgress?: (fraction: number) => void): Promise<void> {
  const get = async <T,>(file: string): Promise<T> => (await fetch(`${base}/${file}`)).json() as Promise<T>;
  const [index, data, fonts, sounds] = await Promise.all([
    get<Record<string, [number, number]>>('images.json'), get<Store['data']>('data.json'),
    get<Record<string, FontEntry>>('fonts.json'), get<Record<string, number>>('sounds.json'),
  ]);
  store.index = index; store.data = data; store.fonts = fonts;
  mixer.init(`${base}/sounds`, sounds);
  // the atlas of the glyphs
  const img = new Image();
  img.src = `${base}/fonts.png`;
  await img.decode();
  const atlas = new Surface(img.width, img.height, true);
  atlas.ctx.drawImage(img, 0, 0);
  store.atlas = atlas;
  // the images: one file, with progress
  const r = await fetch(`${base}/images.pak`);
  const total = Number(r.headers.get('content-length')) || 16_000_000;
  const reader = r.body!.getReader();
  const chunks: Uint8Array[] = [];
  let got = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value); got += value.length;
    onProgress?.(Math.min(1, got / total));
  }
  const pak = new Uint8Array(got);
  let o = 0;
  for (const c of chunks) { pak.set(c, o); o += c.length; }
  store.pak = pak;
}

// ---------------------------------------------------------------------------------------------------------------------------------- data
/** load_data: the lines of a data file, each one split in its fields. `compressed` files are the `DAT!` ones (already inflated by the packer). */
export function load_data(file_name: string, field_sep = ';', throw_exception = true, _compressed = true, _from_dynamic_path = false): string[][] {
  const f = store.data[file_name];
  if (!f) {
    if (throw_exception) throw new Error(`Cannot load data file: data/${file_name}`);
    return [];
  }
  const lines = f.text.split('\n');
  return lines.map((l) => l.replace(/\r$/, '').split(field_sep));
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
  if (!e || !store.pak) throw new Error(`Cannot load image: images/${file_name}`);
  const r = decodeImage(file_name, store.pak.subarray(e[0], e[0] + e[1]));
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
