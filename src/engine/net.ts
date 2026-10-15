// Downloads for the assets: versioned URLs (?v=<hash of the file>, see astro.config.mjs) and a copy of every file in the browser's Cache API, so a
// returning visitor does not download the images and sounds again, and an update only fetches the files that changed.

declare const __ASSET_VERSIONS__: Record<string, string> | undefined;
const VERSIONS: Record<string, string> = typeof __ASSET_VERSIONS__ !== 'undefined' ? __ASSET_VERSIONS__ : {};

/** the URL of a file under /assets/ with its version (the same file name always has the same content for one version) */
export function assetUrl(url: string): string {
  const i = url.indexOf('/assets/');
  const v = VERSIONS[i >= 0 ? url.slice(i + 8) : url];
  return v ? `${url}?v=${v}` : url;
}

export async function download(url: string, onProgress?: (loaded: number, total: number) => void): Promise<Uint8Array> {
  const r = await fetch(url);
  if (r.status && r.status >= 400) throw new Error(`${url}: HTTP ${r.status}`);
  const total = Number(r.headers.get('content-length')) || 0;
  const reader = r.body!.getReader();
  const chunks: Uint8Array[] = [];
  let got = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value); got += value.length;
    onProgress?.(got, total || got);
  }
  const out = new Uint8Array(got);
  let o = 0;
  for (const c of chunks) { out.set(c, o); o += c.length; }
  onProgress?.(got, got);
  return out;
}

let store: Promise<Cache | null> | null = null;
/** (not in the desktop version: the files are local; not where the browser has no Cache API or the page is not a secure context) */
function cacheStore(): Promise<Cache | null> {
  if (!store) {
    const desktop = typeof window !== 'undefined' && !!(window as unknown as { __DED_DESKTOP__?: boolean }).__DED_DESKTOP__;
    store = !desktop && typeof caches !== 'undefined' ? caches.open('ded-assets').catch(() => null) : Promise.resolve(null);
  }
  return store;
}

export async function cacheGet(key: string): Promise<Uint8Array | null> {
  if (!key.includes('?v=')) return null;
  const c = await cacheStore();
  if (!c) return null;
  try { const hit = await c.match(key); return hit ? new Uint8Array(await hit.arrayBuffer()) : null; } catch { return null; }
}
/** keeps a file; older versions of the same file are dropped */
export async function cachePut(key: string, bytes: Uint8Array): Promise<void> {
  if (!key.includes('?v=')) return;
  const c = await cacheStore();
  if (!c) return;
  try {
    const abs = new URL(key, location.href).href;
    const path = abs.slice(0, abs.indexOf('?') + 1);
    for (const k of await c.keys()) if (k.url.startsWith(path) && k.url !== abs) await c.delete(k);
    await c.put(key, new Response(bytes as BufferSource));
  } catch { /* quota or private mode: just not cached */ }
}

/** the file from the cache, or downloaded (and kept for the next visit) */
export async function cachedGet(url: string, onProgress?: (loaded: number, total: number) => void): Promise<Uint8Array> {
  const key = assetUrl(url);
  const hit = await cacheGet(key);
  if (hit) { onProgress?.(hit.length, hit.length); return hit; }
  const bytes = await download(key, onProgress);
  void cachePut(key, bytes);
  return bytes;
}
