// Synchronous image decoders (PNG, GIF, JPEG). pygame loads images synchronously and the game relies on it (it asks for the size of an image
// right after load_image), and the browser decoders are asynchronous; these return raw straight RGBA pixels without any colour management.
import { unzlibSync } from 'fflate';
import jpeg from 'jpeg-js';

/** straight (non-premultiplied) RGBA. `bits32` = pygame loads it as a 32-bit surface with per-pixel alpha (RGBA / gray+alpha PNGs); the other
 *  formats (JPEG, GIF, RGB / paletted PNG) are 8 or 24 bit and their transparency is a colorkey: get_at() reports alpha 255 for them. */
export interface Raster { w: number; h: number; data: Uint8ClampedArray; bits32: boolean }

const u32 = (b: Uint8Array, i: number): number => ((b[i] << 24) | (b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3]) >>> 0;

export function decodePng(buf: Uint8Array): Raster {
  if (buf[0] !== 0x89 || buf[1] !== 0x50 || buf[2] !== 0x4e || buf[3] !== 0x47) throw new Error('not a PNG');
  let w = 0, h = 0, depth = 0, ctype = 0, interlace = 0;
  let plte: Uint8Array | null = null, trns: Uint8Array | null = null;
  const idat: Uint8Array[] = [];
  let i = 8;
  while (i < buf.length) {
    const len = u32(buf, i);
    const type = String.fromCharCode(buf[i + 4], buf[i + 5], buf[i + 6], buf[i + 7]);
    const body = buf.subarray(i + 8, i + 8 + len);
    if (type === 'IHDR') { w = u32(body, 0); h = u32(body, 4); depth = body[8]; ctype = body[9]; interlace = body[12]; }
    else if (type === 'PLTE') plte = body;
    else if (type === 'tRNS') trns = body;
    else if (type === 'IDAT') idat.push(body);
    else if (type === 'IEND') break;
    i += 12 + len;
  }
  if (interlace !== 0 || (depth !== 8 && ctype !== 3)) throw new Error(`unsupported PNG (depth ${depth}, type ${ctype}, interlace ${interlace})`);
  const channels = ctype === 0 ? 1 : ctype === 2 ? 3 : ctype === 3 ? 1 : ctype === 4 ? 2 : 4;
  let total = 0;
  for (const c of idat) total += c.length;
  const z = new Uint8Array(total);
  let o = 0;
  for (const c of idat) { z.set(c, o); o += c.length; }
  const raw = unzlibSync(z);
  const bits = channels * depth;
  const stride = (w * bits + 7) >> 3;
  const bpp = Math.max(1, bits >> 3);
  const out = new Uint8Array(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)];
    const src = y * (stride + 1) + 1, dst = y * stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? out[dst + x - bpp] : 0;
      const b = y > 0 ? out[dst - stride + x] : 0;
      const c = x >= bpp && y > 0 ? out[dst - stride + x - bpp] : 0;
      let v = raw[src + x];
      if (f === 1) v += a;
      else if (f === 2) v += b;
      else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) {
        const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      out[dst + x] = v & 255;
    }
  }
  const data = new Uint8ClampedArray(w * h * 4);
  let bits32 = ctype === 4 || ctype === 6;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x, d = p * 4;
      if (ctype === 6) {
        const s = y * stride + x * 4;
        data[d] = out[s]; data[d + 1] = out[s + 1]; data[d + 2] = out[s + 2]; data[d + 3] = out[s + 3];
      } else if (ctype === 2) {
        const s = y * stride + x * 3;
        data[d] = out[s]; data[d + 1] = out[s + 1]; data[d + 2] = out[s + 2]; data[d + 3] = 255;
        if (trns && trns.length >= 6 && out[s] === trns[1] && out[s + 1] === trns[3] && out[s + 2] === trns[5]) data[d + 3] = 0;
      } else if (ctype === 0) {
        const g = out[y * stride + x];
        data[d] = data[d + 1] = data[d + 2] = g;
        data[d + 3] = trns && trns.length >= 2 && g === trns[1] ? 0 : 255;
      } else if (ctype === 4) {
        const s = y * stride + x * 2;
        const g = out[s]; data[d] = data[d + 1] = data[d + 2] = g; data[d + 3] = out[s + 1];
      } else if (ctype === 3 && plte) {
        let k: number;
        if (depth === 8) k = out[y * stride + x];
        else { const per = 8 / depth, byte = out[y * stride + Math.floor(x / per)]; const shift = 8 - depth * ((x % per) + 1); k = (byte >> shift) & ((1 << depth) - 1); }
        data[d] = plte[k * 3]; data[d + 1] = plte[k * 3 + 1]; data[d + 2] = plte[k * 3 + 2];
        const al = trns && k < trns.length ? trns[k] : 255;
        data[d + 3] = al;
      }
    }
  }
  if (ctype === 3 && trns) {
    // SDL_image: a single fully transparent entry becomes a colorkey, anything more elaborate becomes a 32-bit RGBA surface
    let transparent = 0, partial = false;
    for (let k = 0; k < trns.length; k++) { if (trns[k] === 0) transparent++; else if (trns[k] !== 255) partial = true; }
    bits32 = partial || transparent > 1;
  }
  return { w, h, data, bits32 };
}

/** First frame of a GIF; the transparent colour of the Graphic Control Extension becomes alpha 0 (pygame: colorkey) */
export function decodeGif(buf: Uint8Array): Raster {
  const sig = String.fromCharCode(...buf.subarray(0, 6));
  if (sig !== 'GIF87a' && sig !== 'GIF89a') throw new Error('not a GIF');
  const W = buf[6] | (buf[7] << 8), H = buf[8] | (buf[9] << 8);
  const flags = buf[10];
  let p = 13;
  let gct: Uint8Array | null = null;
  if (flags & 0x80) { const n = 3 * (1 << ((flags & 7) + 1)); gct = buf.subarray(p, p + n); p += n; }
  const bgIndex = buf[11];
  let transparent = -1;
  const data = new Uint8ClampedArray(W * H * 4);
  while (p < buf.length) {
    const b = buf[p++];
    if (b === 0x21) {
      const label = buf[p++];
      if (label === 0xf9) { const sz = buf[p]; if (buf[p + 1] & 1) transparent = buf[p + 4]; p += sz + 1; }
      for (;;) { const sz = buf[p++]; if (sz === 0) break; p += sz; if (p >= buf.length) break; }
      if (label === 0xf9) continue;
    } else if (b === 0x2c) {
      const ix = buf[p] | (buf[p + 1] << 8), iy = buf[p + 2] | (buf[p + 3] << 8), iw = buf[p + 4] | (buf[p + 5] << 8), ih = buf[p + 6] | (buf[p + 7] << 8);
      const lf = buf[p + 8]; p += 9;
      let ct = gct;
      if (lf & 0x80) { const n = 3 * (1 << ((lf & 7) + 1)); ct = buf.subarray(p, p + n); p += n; }
      const interlaced = (lf & 0x40) !== 0;
      const minCode = buf[p++];
      const chunks: Uint8Array[] = [];
      for (;;) { const sz = buf[p++]; if (sz === 0) break; chunks.push(buf.subarray(p, p + sz)); p += sz; }
      let tot = 0; for (const c of chunks) tot += c.length;
      const bytes = new Uint8Array(tot); let o = 0; for (const c of chunks) { bytes.set(c, o); o += c.length; }
      const idx = lzw(bytes, minCode, iw * ih);
      const rows: number[] = [];
      if (interlaced) { for (const [s, st] of [[0, 8], [4, 8], [2, 4], [1, 2]]) for (let y = s; y < ih; y += st) rows.push(y); } else for (let y = 0; y < ih; y++) rows.push(y);
      for (let r = 0; r < ih; r++) {
        const y = rows[r] + iy;
        for (let x = 0; x < iw; x++) {
          const k = idx[r * iw + x];
          const X = x + ix;
          if (X >= W || y >= H) continue;
          const d = (y * W + X) * 4;
          const c = ct ? k * 3 : 0;
          data[d] = ct ? ct[c] : 0; data[d + 1] = ct ? ct[c + 1] : 0; data[d + 2] = ct ? ct[c + 2] : 0; data[d + 3] = k === transparent ? 0 : 255;
        }
      }
      void bgIndex;
      return { w: W, h: H, data, bits32: false };
    } else if (b === 0x3b) break;
  }
  return { w: W, h: H, data, bits32: false };
}

function lzw(bytes: Uint8Array, minCode: number, count: number): Uint8Array {
  const out = new Uint8Array(count);
  const clear = 1 << minCode, eoi = clear + 1;
  let size = minCode + 1, next = eoi + 1;
  const prefix = new Int16Array(4096), suffix = new Uint8Array(4096), stack = new Uint8Array(4097);
  let bitBuf = 0, bits = 0, pos = 0, prev = -1, first = 0, o = 0;
  for (let i = 0; i < clear; i++) suffix[i] = i;
  while (o < count) {
    while (bits < size && pos < bytes.length) { bitBuf |= bytes[pos++] << bits; bits += 8; }
    if (bits < size) break;
    const code = bitBuf & ((1 << size) - 1);
    bitBuf >>= size; bits -= size;
    if (code === clear) { size = minCode + 1; next = eoi + 1; prev = -1; continue; }
    if (code === eoi) break;
    if (prev === -1) { out[o++] = suffix[code]; prev = code; first = suffix[code]; continue; }
    let sp = 0, cur = code;
    if (code >= next) { stack[sp++] = first; cur = prev; }
    while (cur >= clear) { stack[sp++] = suffix[cur]; cur = prefix[cur]; }
    first = suffix[cur]; stack[sp++] = first;
    if (next < 4096) { prefix[next] = prev; suffix[next] = first; next++; if (next === (1 << size) && size < 12) size++; }
    prev = code;
    while (sp > 0 && o < count) out[o++] = stack[--sp];
  }
  return out;
}

export function decodeJpeg(buf: Uint8Array): Raster {
  const r = jpeg.decode(buf, { useTArray: true, formatAsRGBA: true });
  const src = r.data as Uint8Array;
  const data = new Uint8ClampedArray(src.length);
  data.set(src);
  for (let i = 3; i < data.length; i += 4) data[i] = 255;
  return { w: r.width, h: r.height, data, bits32: false };
}

export function decodeImage(name: string, buf: Uint8Array): Raster {
  const ext = name.slice(name.lastIndexOf('.') + 1).toLowerCase();
  if (ext === 'png') return decodePng(buf);
  if (ext === 'gif') return decodeGif(buf);
  return decodeJpeg(buf);
}
