// Builds the images of the departmental flags for the game from the files in tools/flags (see tools/flags/SOURCES.json for origin and licences):
//   p0_flag_<dept>.png            the flag, 90x60
//   p0_merits_medals_big_ribbon_<dept>.png   the ribbon of the medal of that department: the flag turned sideways and shaded like the original ribbons
// node tools/build_flags.mjs   (output goes to tools/extra_images, which build_assets.py adds to the image pack)
import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'tools/extra_images';
fs.mkdirSync(OUT, { recursive: true });
const depts = ['artigas', 'canelones', 'cerrolargo', 'colonia', 'durazno', 'flores', 'florida', 'lavalleja', 'maldonado', 'montevideo', 'paysandu', 'rionegro', 'rivera', 'rocha', 'salto', 'sanjose', 'soriano', 'tacuarembo', 'treintaytres'];
const W = 90, H = 60;

const pak = JSON.parse(fs.readFileSync('public/assets/images.json', 'utf8'));
const paks = [fs.readFileSync('public/assets/images_boot.pak'), fs.readFileSync('public/assets/images_rest.pak')];
const original = async (name) => { const [p, o, l] = pak[name]; return loadImage(paks[p].subarray(o, o + l)); };

async function flagCanvas(d) {
  const file = fs.readdirSync('tools/flags').find((f) => f.startsWith(d + '.'));
  const im = await loadImage('tools/flags/' + file);
  const c = createCanvas(W * 2, H * 2), g = c.getContext('2d');
  g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
  g.imageSmoothingQuality = 'high';
  if (d === 'tacuarembo') { // no official flag: the coat of arms on white
    const s = (c.height * 0.86) / im.height; g.drawImage(im, (c.width - im.width * s) / 2, (c.height - im.height * s) / 2, im.width * s, im.height * s);
  } else g.drawImage(im, 0, 0, c.width, c.height);
  return c;
}

const tpl = await original('p0_merits_medals_big_ribbon_1.png');
const tc = createCanvas(tpl.width, tpl.height), tg = tc.getContext('2d'); tg.drawImage(tpl, 0, 0);
const tdata = tg.getImageData(0, 0, tc.width, tc.height).data;
let sum = 0, n = 0;
for (let i = 0; i < tdata.length; i += 4) if (tdata[i + 3] > 240) { sum += 0.3 * tdata[i] + 0.59 * tdata[i + 1] + 0.11 * tdata[i + 2]; n++; }
const mean = sum / n;

for (const d of depts) {
  const fc = await flagCanvas(d);
  const small = createCanvas(W, H), sg = small.getContext('2d'); sg.imageSmoothingQuality = 'high'; sg.drawImage(fc, 0, 0, W, H);
  // thin dark border so the flag reads on any background
  sg.strokeStyle = 'rgba(0,0,0,0.55)'; sg.lineWidth = 1; sg.strokeRect(0.5, 0.5, W - 1, H - 1);
  fs.writeFileSync(path.join(OUT, `p0_flag_${d}.png`), small.toBuffer('image/png'));
  const tiny = createCanvas(30, 20), tg2 = tiny.getContext('2d'); tg2.imageSmoothingQuality = 'high'; tg2.drawImage(fc, 0, 0, 30, 20);
  tg2.strokeStyle = 'rgba(0,0,0,0.6)'; tg2.lineWidth = 1; tg2.strokeRect(0.5, 0.5, 29, 19);
  fs.writeFileSync(path.join(OUT, `p0_flagsmall_${d}.png`), tiny.toBuffer('image/png'));
  // ribbon: the flag turned a quarter, stretched over the ribbon, shaded with the folds of the original ribbon
  const r = createCanvas(tpl.width, tpl.height), rg = r.getContext('2d');
  rg.imageSmoothingQuality = 'high';
  rg.save(); rg.translate(r.width / 2, r.height / 2); rg.rotate(Math.PI / 2);
  rg.drawImage(fc, -r.height / 2, -r.width / 2, r.height, r.width);
  rg.restore();
  const img = rg.getImageData(0, 0, r.width, r.height);
  for (let i = 0; i < img.data.length; i += 4) {
    const l = 0.3 * tdata[i] + 0.59 * tdata[i + 1] + 0.11 * tdata[i + 2];
    const k = Math.max(0.5, Math.min(1.0, l / mean));
    img.data[i] = Math.min(255, img.data[i] * k); img.data[i + 1] = Math.min(255, img.data[i + 1] * k); img.data[i + 2] = Math.min(255, img.data[i + 2] * k);
    img.data[i + 3] = tdata[i + 3];
  }
  rg.putImageData(img, 0, 0);
  fs.writeFileSync(path.join(OUT, `p0_merits_medals_big_ribbon_${d}.png`), r.toBuffer('image/png'));
}

// the small medals of the list: only the ribbon (the rows above the disc) takes the flag
const RIBBON_ROWS = 31;
for (const d of depts) {
  const orig = await original(`p0_merits_medals_tiny_${d}.png`);
  const c = createCanvas(orig.width, orig.height), g = c.getContext('2d'); g.drawImage(orig, 0, 0);
  const img = g.getImageData(0, 0, c.width, c.height);
  const fc = await flagCanvas(d);
  const rb = createCanvas(c.width, RIBBON_ROWS), rg = rb.getContext('2d'); rg.imageSmoothingQuality = 'high';
  rg.save(); rg.translate(rb.width / 2, rb.height / 2); rg.rotate(Math.PI / 2);
  rg.drawImage(fc, -rb.height / 2, -rb.width / 2, rb.height, rb.width);
  rg.restore();
  const flag = rg.getImageData(0, 0, rb.width, rb.height).data;
  let sum = 0, n = 0;
  for (let y = 4; y < RIBBON_ROWS; y++) for (let x = 0; x < c.width; x++) { const i = (y * c.width + x) * 4; if (img.data[i + 3] > 200) { sum += img.data[i] * 0.3 + img.data[i + 1] * 0.59 + img.data[i + 2] * 0.11; n++; } }
  const m = sum / n;
  for (let y = 4; y < RIBBON_ROWS; y++) for (let x = 0; x < c.width; x++) {
    const i = (y * c.width + x) * 4; if (img.data[i + 3] === 0) continue;
    const k = Math.max(0.5, Math.min(1.2, (img.data[i] * 0.3 + img.data[i + 1] * 0.59 + img.data[i + 2] * 0.11) / m));
    for (let j = 0; j < 3; j++) img.data[i + j] = Math.min(255, flag[i + j] * k);
  }
  g.putImageData(img, 0, 0);
  fs.writeFileSync(path.join(OUT, `p0_merits_medals_tiny_${d}.png`), c.toBuffer('image/png'));
}
console.log('flags built', depts.length);
