// Crops a screenshot of the Gemini image overlay (800x928 with white side margins) to the picture itself.
// usage: node tools/grab_shot.mjs <shot.jpg> <out.png>
import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'node:fs';
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const landscape = process.argv.includes('--landscape');   // a 4:3 picture shown across the width of the screenshot
const [src, out] = args;
const im = await loadImage(src);
if (landscape) {
  const w = im.width, h = Math.round(w * 3 / 4), y0 = Math.round((im.height - h) / 2) + 2;
  const c = createCanvas(w - 4, h - 4); c.getContext('2d').drawImage(im, 2, y0, w - 4, h - 4, 0, 0, w - 4, h - 4);
  fs.writeFileSync(out, c.toBuffer('image/png')); console.log('cropped (landscape)', w - 4, 'x', h - 4); process.exit(0);
}
// the picture is 3:4 and fills the height; find its width and centre
const h = im.height, w = Math.round(h * 765 / 1024), x0 = Math.round((im.width - w) / 2) + 2, cw = w - 4;
const c = createCanvas(cw, h - 4); c.getContext('2d').drawImage(im, x0, 2, cw, h - 4, 0, 0, cw, h - 4);
fs.writeFileSync(out, c.toBuffer('image/png'));
console.log('cropped', cw, 'x', h - 4);
