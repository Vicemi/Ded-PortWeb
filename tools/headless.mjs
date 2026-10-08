// node tools/headless.mjs <scenario.mjs> [outdir]
// Bundles the game with esbuild, gives it a canvas (napi) and a local file `fetch`, then runs a scenario module: export default async (dev) => { ... }
import { build } from 'esbuild';
import { createCanvas, ImageData } from '@napi-rs/canvas';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const scenario = process.argv[2];
const outdir = path.resolve(process.argv[3] || path.join(root, 'research', 'shots'));
fs.mkdirSync(outdir, { recursive: true });

const bundle = path.join(root, 'research', '.headless.mjs');
await build({
  entryPoints: [path.join(root, 'tools', 'headless_entry.ts')], bundle: true, platform: 'node', format: 'esm', outfile: bundle, sourcemap: 'inline', logLevel: 'error',
  define: { 'import.meta.env.DEV': 'false', 'import.meta.env.BASE_URL': '"/"' }, external: ['@napi-rs/canvas'],
  banner: { js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);" },
});

// ---- browser shims
const storage = new Map();
globalThis.localStorage = { getItem: (k) => (storage.has(k) ? storage.get(k) : null), setItem: (k, v) => storage.set(k, String(v)), removeItem: (k) => storage.delete(k), key: (i) => [...storage.keys()][i] ?? null, get length() { return storage.size; } };
globalThis.window = globalThis;
globalThis.addEventListener = () => undefined;
globalThis.ImageData = ImageData;
globalThis.document = { createElement: (t) => (t === 'canvas' ? createCanvas(1, 1) : {}) };
const assetsDir = path.join(root, 'public', 'assets');
globalThis.fetch = async (url) => {
  const file = path.join(assetsDir, String(url).replace(/^.*\/assets\//, ''));
  const buf = fs.readFileSync(file);
  return {
    json: async () => JSON.parse(buf.toString('utf8')),
    arrayBuffer: async () => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
    headers: { get: () => String(buf.length) },
    body: { getReader: () => { let done = false; return { read: async () => (done ? { done: true } : ((done = true), { done: false, value: new Uint8Array(buf) })) }; } },
  };
};

const { start } = await import(pathToFileURL(bundle).href);
const dev = await start('/assets', (name, b) => fs.writeFileSync(path.join(outdir, name + '.png'), b));
const mod = await import(pathToFileURL(path.resolve(scenario)).href);
try {
  await mod.default(dev);
  console.log('scenario finished, stage:', dev.stage());
} catch (e) {
  console.log('SCENARIO ERROR:', e && e.stack ? e.stack.split('\n').slice(0, 12).join('\n') : e);
  try { dev.save('error'); } catch { /* none */ }
  process.exitCode = 1;
}
