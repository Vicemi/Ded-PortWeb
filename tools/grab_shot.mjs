// Crops a screenshot of the Gemini image overlay (800x928 with white side margins) to the picture itself.
// usage: node tools/grab_shot.mjs <shot.jpg> <out.png>
import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'node:fs';
const [src, out] = process.argv.slice(2);
const im = await loadImage(src);
// the picture is 3:4 and fills the height; find its width and centre
const h = im.height, w = Math.round(h * 765 / 1024), x0 = Math.round((im.width - w) / 2) + 2, cw = w - 4;
const c = createCanvas(cw, h - 4); c.getContext('2d').drawImage(im, x0, 2, cw, h - 4, 0, 0, cw, h - 4);
fs.writeFileSync(out, c.toBuffer('image/png'));
console.log('cropped', cw, 'x', h - 4);
