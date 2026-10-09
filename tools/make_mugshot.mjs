// Builds the four images of a thief of the game from two drawings (front and side) made on a flat green background (#00ff00):
//   p0_thief_big_<id>_1.jpg   front, 127x171      p0_thief_big_<id>_2.jpg   side, 128x171
//   p0_thief_big_<id>_3.jpg   close-up crop, 90x108   p0_thief_small_<id>.png   the icon of the suspects list, 64x61
// usage: node tools/make_mugshot.mjs <id> <front.png> <side.png> <S 123> <12345678>
// output goes to tools/extra_images (build_assets.py puts them in the pack)
import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'node:fs';
import path from 'node:path';

const [id, frontFile, sideFile, code = 'S 100', serial = '10000000'] = process.argv.slice(2);
if (!id || !frontFile || !sideFile) { console.error('usage: node tools/make_mugshot.mjs <id> <front.png> <side.png> <code> <serial>'); process.exit(1); }
const OUT = 'tools/extra_images';
fs.mkdirSync(OUT, { recursive: true });

/** the green background becomes transparent (flood from the borders, so green inside the drawing stays) */
async function keyed(file) {
  const im = await loadImage(file);
  const c = createCanvas(im.width, im.height), g = c.getContext('2d'); g.drawImage(im, 0, 0);
  const img = g.getImageData(0, 0, c.width, c.height), d = img.data, w = c.width, h = c.height;
  const isBg = (i) => d[i + 1] > 150 && d[i + 1] - d[i] > 70 && d[i + 1] - d[i + 2] > 70;
  const seen = new Uint8Array(w * h), stack = [];
  for (let x = 0; x < w; x++) { stack.push(x, (h - 1) * w + x); }
  for (let y = 0; y < h; y++) { stack.push(y * w, y * w + w - 1); }
  while (stack.length) {
    const p = stack.pop();
    if (seen[p] || !isBg(p * 4)) continue;
    seen[p] = 1;
    const x = p % w, y = (p / w) | 0;
    if (x > 0) stack.push(p - 1); if (x < w - 1) stack.push(p + 1); if (y > 0) stack.push(p - w); if (y < h - 1) stack.push(p + w);
  }
  for (let p = 0; p < w * h; p++) if (seen[p]) d[p * 4 + 3] = 0;
  // remove the green fringe of the edge pixels
  for (let p = 0; p < w * h; p++) {
    const i = p * 4; if (d[i + 3] === 0) continue;
    if (d[i + 1] > d[i] + 25 && d[i + 1] > d[i + 2] + 25) d[i + 1] = Math.min(d[i + 1], Math.max(d[i], d[i + 2]) + 10);
  }
  g.putImageData(img, 0, 0);
  // crop to the drawing
  let x0 = w, y0 = h, x1 = 0, y1 = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 0) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  const out = createCanvas(x1 - x0 + 1, y1 - y0 + 1); out.getContext('2d').drawImage(c, -x0, -y0);
  return out;
}

/** a police photo: grey wall with the height chart, the person (head and shoulders, filling the width), the plate, the black frame */
function photo(person, W, H, label) {
  const c = createCanvas(W * 4, H * 4), g = c.getContext('2d'); g.scale(4, 4); g.imageSmoothingQuality = 'high';
  const bg = g.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#e6e9ec'); bg.addColorStop(1, '#c9ced3');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(90,100,110,0.55)'; g.fillStyle = 'rgba(90,100,110,0.6)'; g.lineWidth = 0.8; g.font = 'bold 9px sans-serif';
  [['2.00m', 0.10], ['1.80m', 0.34], ['1.60m', 0.58], ['1.40m', 0.82]].forEach(([t, f]) => { g.beginPath(); g.moveTo(0, H * f); g.lineTo(W, H * f); g.stroke(); g.fillText(t, 3, H * f - 2); });
  // the person: width fills the photo, cut at the bottom edge
  const s = Math.min(W * 1.02 / person.width, (H * 0.97) / person.height);
  const pw = person.width * s, ph = person.height * s;
  g.shadowColor = 'rgba(0,0,0,0.35)'; g.shadowBlur = 6; g.shadowOffsetX = 4;
  g.drawImage(person, (W - pw) / 2, H - ph + 2, pw, ph);
  g.shadowColor = 'transparent';
  // the plate
  g.fillStyle = 'rgba(20,20,20,0.92)'; g.fillRect(W * 0.2, H - 31, W * 0.62, 25);
  g.fillStyle = '#fff'; g.font = 'bold 10px sans-serif'; g.fillText(label[0], W * 0.2 + 5, H - 20); g.fillText(label[1], W * 0.2 + 5, H - 9);
  // frame: black line, then the paper
  g.strokeStyle = '#0c0c0c'; g.lineWidth = 3; g.strokeRect(1.5, 1.5, W - 3, H - 3);
  return c;
}
function scaleTo(c, w, h) { const o = createCanvas(w, h), g = o.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(c, 0, 0, w, h); return o; }
const save = (c, name, type = 'image/png') => fs.writeFileSync(path.join(OUT, name), type === 'image/jpeg' ? c.toBuffer('image/jpeg', 92) : c.toBuffer('image/png'));

const front = await keyed(frontFile), side = await keyed(sideFile);
save(scaleTo(photo(front, 127, 171, [code, 'Nº- ' + serial]), 127, 171), `p0_thief_big_${id}_1.jpg`, 'image/jpeg');
save(scaleTo(photo(side, 128, 171, [code + '-s', 'Nº- ' + serial]), 128, 171), `p0_thief_big_${id}_2.jpg`, 'image/jpeg');
// close-up: the head of the front photo without the frame and plate
const big = photo(front, 127, 171, ['', '']);
const crop = createCanvas(90, 108), cg = crop.getContext('2d'); cg.imageSmoothingQuality = 'high'; cg.drawImage(big, 8 * 4, 6 * 4, 110 * 4, 132 * 4, 0, 0, 90, 108);
save(crop, `p0_thief_big_${id}_3.jpg`, 'image/jpeg');
// icon of the list: the face on a cream frame
const icon = createCanvas(64, 61), ig = icon.getContext('2d'); ig.imageSmoothingQuality = 'high';
ig.fillStyle = '#fff6c9'; ig.fillRect(0, 0, 64, 61);
ig.fillStyle = '#c8cdd2'; ig.fillRect(4, 4, 56, 53);
const fs2 = Math.min(56 / front.width, 53 / (front.height * 0.8));
ig.save(); ig.beginPath(); ig.rect(4, 4, 56, 53); ig.clip(); ig.drawImage(front, 32 - front.width * fs2 / 2, 4, front.width * fs2, front.height * fs2); ig.restore();
ig.strokeStyle = '#2a2418'; ig.lineWidth = 1.5; ig.strokeRect(0.75, 0.75, 62.5, 59.5);
save(icon, `p0_thief_small_${id}.png`);
console.log('built', id);
