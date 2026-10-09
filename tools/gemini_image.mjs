// Generates an image with Gemini ("Nano Banana") from a prompt and optional reference images.
// usage: node tools/gemini_image.mjs "<prompt>" <out.png> [ref1.png ref2.png ...]
// The key is read from GEMINI_API_KEY (environment) or from .env.local in the project folder; it is never printed.
import fs from 'node:fs';

function key() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  try {
    for (const l of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) { const m = /^\s*GEMINI_API_KEY\s*=\s*(.+?)\s*$/.exec(l); if (m) return m[1].replace(/^["']|["']$/g, ''); }
  } catch { /* none */ }
  return null;
}
const [prompt, out, ...refs] = process.argv.slice(2);
if (!prompt || !out) { console.error('usage: node tools/gemini_image.mjs "<prompt>" <out.png> [refs...]'); process.exit(1); }
const k = key();
if (!k) { console.error('No GEMINI_API_KEY (environment variable or .env.local)'); process.exit(2); }
const model = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
const parts = [{ text: prompt }, ...refs.map((f) => ({ inlineData: { mimeType: f.endsWith('.jpg') ? 'image/jpeg' : 'image/png', data: fs.readFileSync(f).toString('base64') } }))];
const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
  method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': k },
  body: JSON.stringify({ contents: [{ parts }], generationConfig: { responseModalities: ['TEXT', 'IMAGE'] } }),
});
const j = await res.json();
if (!res.ok) { console.error('Gemini error', res.status, JSON.stringify(j.error ?? j).slice(0, 500)); process.exit(3); }
const img = (j.candidates?.[0]?.content?.parts ?? []).find((p) => p.inlineData);
if (!img) { console.error('No image in the answer:', JSON.stringify(j).slice(0, 500)); process.exit(4); }
fs.writeFileSync(out, Buffer.from(img.inlineData.data, 'base64'));
console.log('saved', out);
