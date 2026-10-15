// @ts-nocheck
// Pictures of the new witnesses drawn by code (no image files): the Matero ("mate cebado") and the Corredora ("rambla runner").
// Same pieces as the originals: the standing figure (p1_minigame_<id>.png), its happy version and the 54x50 card of the map pin (p1_witness_<id>.png).
import * as assets from '../../engine/assets';
import { pygame } from '../../runtime/prelude';

const INK = '#1b1410';

function surf(w: number, h: number): any { return new pygame.Surface([w, h], pygame.SRCALPHA, 32); }
/** a filled shape with the dark cartoon outline of the originals */
function shape(c: any, fill: string, path: () => void, lw = 3): void {
  c.beginPath(); path(); c.fillStyle = fill; c.fill(); c.lineWidth = lw; c.lineJoin = 'round'; c.lineCap = 'round'; c.strokeStyle = INK; c.stroke();
}
const rr = (c: any, x: number, y: number, w: number, h: number, r: number) => () => { c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };

/** the head (centre cx, cy; radius about 32 * s) */
function head(c: any, kind: string, cx: number, cy: number, s: number, happy: boolean): void {
  c.save(); c.translate(cx, cy); c.scale(s, s);
  const skin = kind === 'matero' ? '#dba070' : '#e8b58a';
  if (kind === 'corredora') {   // the ponytail, behind the head
    shape(c, '#5a3420', () => { c.moveTo(14, -30); c.quadraticCurveTo(52, -34, 46, 4); c.quadraticCurveTo(44, 26, 30, 30); c.quadraticCurveTo(36, 4, 26, -16); c.closePath(); });
  }
  shape(c, skin, () => c.ellipse(-31, 4, 6, 8, 0, 0, 7)); shape(c, skin, () => c.ellipse(31, 4, 6, 8, 0, 0, 7));   // ears
  shape(c, skin, () => c.ellipse(0, 2, 31, 34, 0, 0, 7));
  c.fillStyle = 'rgba(214,90,80,0.35)'; c.beginPath(); c.ellipse(-19, 14, 7, 4.5, 0, 0, 7); c.ellipse(19, 14, 7, 4.5, 0, 0, 7); c.fill();
  // eyes
  for (const sx of [-1, 1]) {
    c.fillStyle = '#fff'; c.beginPath(); c.ellipse(sx * 12, 0, 7.5, happy ? 6 : 8, 0, 0, 7); c.fill(); c.lineWidth = 2.5; c.strokeStyle = INK; c.stroke();
    c.fillStyle = kind === 'matero' ? '#3b2412' : '#1f5a7a'; c.beginPath(); c.arc(sx * 12 + 1, 1, 3.8, 0, 7); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(sx * 12 + 2.4, -0.6, 1.3, 0, 7); c.fill();
    c.lineWidth = 3.2; c.strokeStyle = kind === 'matero' ? '#4a4a4a' : '#5a3420';
    c.beginPath(); c.moveTo(sx * 12 - 8, happy ? -12 : -11); c.quadraticCurveTo(sx * 12, -17, sx * 12 + 8, happy ? -12 : -9 + sx * 1); c.stroke();
  }
  c.strokeStyle = INK; c.lineWidth = 2.5; c.beginPath(); c.moveTo(0, 6); c.quadraticCurveTo(4, 13, -1, 15); c.stroke();   // nose
  if (kind === 'matero') {
    c.fillStyle = '#7d7d7d';   // white-ish moustache
    shape(c, '#8a8a8a', () => { c.moveTo(0, 17); c.quadraticCurveTo(-14, 11, -25, 22); c.quadraticCurveTo(-14, 25, 0, 22); c.quadraticCurveTo(14, 25, 25, 22); c.quadraticCurveTo(14, 11, 0, 17); c.closePath(); }, 2.5);
  }
  // mouth
  c.lineWidth = 2.6; c.strokeStyle = INK;
  if (happy) { shape(c, '#7a2a2a', () => { c.moveTo(-11, 24); c.quadraticCurveTo(0, 42, 11, 24); c.closePath(); }, 2.5); c.fillStyle = '#fff'; c.fillRect(-7, 25.5, 14, 4); }
  else { c.beginPath(); c.moveTo(-9, 26); c.quadraticCurveTo(0, 33, 9, 26); c.stroke(); }
  if (kind === 'matero') {   // beret
    shape(c, '#252c3a', () => { c.moveTo(-34, -14); c.quadraticCurveTo(-36, -44, -4, -46); c.quadraticCurveTo(34, -48, 36, -22); c.quadraticCurveTo(20, -16, -34, -14); c.closePath(); });
    shape(c, '#252c3a', () => c.ellipse(1, -46, 4, 3, 0, 0, 7), 2);
    c.strokeStyle = '#8890a0'; c.lineWidth = 2; c.beginPath(); c.moveTo(-26, -22); c.quadraticCurveTo(0, -17, 28, -24); c.stroke();
  } else {   // hair and headband
    shape(c, '#5a3420', () => { c.moveTo(-33, -4); c.quadraticCurveTo(-38, -44, 0, -42); c.quadraticCurveTo(38, -44, 33, -4); c.quadraticCurveTo(20, -22, 0, -18); c.quadraticCurveTo(-20, -22, -33, -4); c.closePath(); });
    shape(c, '#3fa7e0', rr(c, -33, -26, 66, 10, 4), 2.5);
    c.fillStyle = '#fff'; c.fillRect(-4, -25, 8, 8);
  }
  c.restore();
}

/** the standing figure, 126 x 324 */
function figure(kind: string, happy: boolean): any {
  const W = 126, H = 324, s = surf(W, H), c = s.ctx;
  c.save();
  // soft shadow on the floor
  const g = c.createRadialGradient(63, 312, 4, 63, 312, 52); g.addColorStop(0, 'rgba(0,0,0,0.35)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g; c.fillRect(0, 280, W, 44);
  if (kind === 'matero') {
    // legs: baggy "bombachas" and espadrilles
    shape(c, '#6f7f92', rr(c, 34, 196, 28, 100, 10)); shape(c, '#6f7f92', rr(c, 64, 196, 28, 100, 10));
    shape(c, '#3a2c20', () => c.ellipse(46, 301, 19, 9, 0, 0, 7)); shape(c, '#3a2c20', () => c.ellipse(80, 301, 19, 9, 0, 0, 7));
    // thermos under the left arm
    shape(c, '#c9d1d8', rr(c, 6, 146, 24, 78, 8)); shape(c, '#c8312b', rr(c, 5, 136, 26, 16, 5));
    c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 3; c.beginPath(); c.moveTo(11, 160); c.lineTo(11, 214); c.stroke();
    // shirt, neckerchief, belt
    shape(c, '#6b8f4e', () => { c.moveTo(34, 112); c.quadraticCurveTo(63, 104, 92, 112); c.lineTo(100, 210); c.lineTo(26, 210); c.closePath(); });
    shape(c, '#c8312b', () => { c.moveTo(48, 108); c.lineTo(78, 108); c.lineTo(63, 134); c.closePath(); }, 2.5);
    shape(c, '#5a3a20', rr(c, 24, 196, 78, 18, 4)); shape(c, '#d8d8d8', rr(c, 55, 198, 16, 14, 2), 2);
    // left arm (hugging the thermos) and right arm lifting the mate
    shape(c, '#6b8f4e', () => { c.moveTo(34, 116); c.quadraticCurveTo(14, 150, 22, 196); c.lineTo(38, 196); c.quadraticCurveTo(34, 150, 48, 122); c.closePath(); });
    shape(c, '#dba070', () => c.ellipse(30, 200, 9, 8, 0, 0, 7), 2.5);
    const hy = happy ? 96 : 130;
    shape(c, '#6b8f4e', () => { c.moveTo(88, 116); c.quadraticCurveTo(118, 150, 108, hy + 24); c.lineTo(94, hy + 28); c.quadraticCurveTo(100, 150, 80, 122); c.closePath(); });
    shape(c, '#dba070', () => c.ellipse(101, hy + 24, 9, 8, 0, 0, 7), 2.5);
    // the mate with its straw
    c.strokeStyle = '#c9d1d8'; c.lineWidth = 4; c.beginPath(); c.moveTo(103, hy + 6); c.lineTo(114, hy - 22); c.stroke(); c.strokeStyle = INK; c.lineWidth = 1.4; c.stroke();
    shape(c, '#7a4a22', () => c.ellipse(101, hy + 8, 15, 14, 0, 0, 7)); shape(c, '#9fd05a', () => c.ellipse(101, hy + 1, 11, 4.5, 0, 0, 7), 2); shape(c, '#c9d1d8', () => c.ellipse(101, hy, 13, 5, 0, 0, 7), 2.5);
    head(c, 'matero', 63, 70, 1, happy);
  } else {
    // black leggings with a sky-blue stripe and running shoes
    shape(c, '#2a2d38', rr(c, 36, 196, 25, 100, 10)); shape(c, '#2a2d38', rr(c, 65, 196, 25, 100, 10));
    c.strokeStyle = '#6cb4ee'; c.lineWidth = 4; c.beginPath(); c.moveTo(39, 206); c.lineTo(39, 290); c.moveTo(87, 206); c.lineTo(87, 290); c.stroke();
    shape(c, '#fff', () => c.ellipse(46, 301, 20, 9, 0, 0, 7)); shape(c, '#fff', () => c.ellipse(80, 301, 20, 9, 0, 0, 7));
    c.fillStyle = '#ff7a2b'; c.fillRect(28, 303, 40, 4); c.fillRect(62, 303, 40, 4);
    // jacket in the colours of Uruguay
    shape(c, '#6cb4ee', () => { c.moveTo(34, 112); c.quadraticCurveTo(63, 104, 92, 112); c.lineTo(98, 210); c.lineTo(28, 210); c.closePath(); });
    c.fillStyle = '#fff'; c.fillRect(60, 118, 6, 90);
    shape(c, '#fff', () => { c.moveTo(34, 112); c.quadraticCurveTo(63, 104, 92, 112); c.lineTo(90, 124); c.quadraticCurveTo(63, 118, 36, 124); c.closePath(); }, 2.5);
    shape(c, '#2a2d38', rr(c, 26, 200, 74, 14, 4), 2.5);
    // arms: one holds a bottle, the other waves when happy
    shape(c, '#6cb4ee', () => { c.moveTo(34, 116); c.quadraticCurveTo(14, 150, 22, 190); c.lineTo(38, 190); c.quadraticCurveTo(34, 150, 48, 122); c.closePath(); });
    shape(c, '#e8b58a', () => c.ellipse(30, 194, 9, 8, 0, 0, 7), 2.5);
    shape(c, '#3fa7e0', rr(c, 20, 172, 14, 34, 5), 2.5); shape(c, '#fff', rr(c, 22, 166, 10, 9, 3), 2);
    const hy = happy ? 92 : 168;
    shape(c, '#6cb4ee', () => { c.moveTo(88, 116); c.quadraticCurveTo(118, hy, 112, hy + 6); c.lineTo(98, hy + 12); c.quadraticCurveTo(100, 150, 80, 122); c.closePath(); });
    shape(c, '#e8b58a', () => c.ellipse(105, hy + 4, 9, 8, 0, 0, 7), 2.5);
    head(c, 'corredora', 63, 70, 1, happy);
  }
  c.restore();
  // the legs fade out at the bottom, like the originals
  c.globalCompositeOperation = 'destination-out';
  const f = c.createLinearGradient(0, 272, 0, H); f.addColorStop(0, 'rgba(0,0,0,0)'); f.addColorStop(1, 'rgba(0,0,0,0.85)');
  c.fillStyle = f; c.fillRect(0, 272, W, H - 272);
  return s;
}

/** the card of the pin on the map: the face on a cream paper with a rough black border */
function card(kind: string): any {
  const s = surf(54, 50), c = s.ctx;
  shape(c, '#f4e6b8', rr(c, 2, 2, 50, 46, 3), 2.5);
  c.save(); c.beginPath(); c.rect(4, 4, 46, 42); c.clip();
  c.fillStyle = kind === 'matero' ? '#c9a45c' : '#8fc7ee'; c.fillRect(4, 4, 46, 42);
  head(c, kind, 27, 30, 0.56, false);
  c.restore();
  c.strokeStyle = INK; c.lineWidth = 2.5; c.strokeRect(3.5, 3.5, 47, 43);
  return s;
}

/** registers the pictures of a witness (called when the module is loaded: the canvases are only drawn the first time they are used) */
export function registerWitnessArt(id: string, kind: string): void {
  assets.register_image(`p1_minigame_${id}.png`, () => figure(kind, false));
  assets.register_image(`p1_minigame_${id}_happy.png`, () => figure(kind, true));
  assets.register_image(`p1_witness_${id}.png`, () => card(kind));
}
