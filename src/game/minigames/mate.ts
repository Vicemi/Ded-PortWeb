// @ts-nocheck
// "Mate cebado": the Matero needs his mate filled to the marked level. Hold (mouse, touch or Space) to tilt the thermos and pour: the flow grows the
// longer you hold. Stop inside the green band. Too much spills it; the thermos only has so much water.
import { ArcadeGame, BW, BH, clamp, lerp, easeOut } from './arcade';
import { registerWitnessArt } from './witnessart';
import { blip } from '../../engine/synth';
import { scaled, put } from './mgart';

registerWitnessArt('matero', 'matero');

const CX = 182, TOP = 118, BOTTOM = 248;   // the mate: centre x and the y of the level 1 and of the level 0 inside it
const yOf = (level: number): number => BOTTOM - level * (BOTTOM - TOP);
// half widths of the gourd: [half width, y]
const OUT: [number, number][] = [[46, 104], [62, 134], [70, 172], [68, 212], [54, 242], [36, 262]];
const inset = (d: number): [number, number][] => OUT.map(([w, y], i) => [w - d, i === 0 ? y + d : i === OUT.length - 1 ? y - d : y]);

/** a smooth outline through the points on the right, mirrored on the left */
function gourd(c: any, pts: [number, number][]): void {
  const r = pts.map(([w, y]) => [CX + w, y]), l = pts.map(([w, y]) => [CX - w, y]).reverse();
  c.beginPath(); c.moveTo(r[0][0], r[0][1]);
  for (let i = 1; i < r.length - 1; i++) c.quadraticCurveTo(r[i][0], r[i][1], (r[i][0] + r[i + 1][0]) / 2, (r[i][1] + r[i + 1][1]) / 2);
  c.lineTo(r[r.length - 1][0], r[r.length - 1][1]); c.lineTo(l[0][0], l[0][1]);
  for (let i = 1; i < l.length - 1; i++) c.quadraticCurveTo(l[i][0], l[i][1], (l[i][0] + l[i + 1][0]) / 2, (l[i][1] + l[i + 1][1]) / 2);
  c.lineTo(l[l.length - 1][0], l[l.length - 1][1]); c.closePath();
}

export class MinigameMate extends ArcadeGame {
  constructor(stage: any, phase1content: any, witness: any) {
    super(stage, phase1content, witness, {
      id: 'matero', title: 'MATERO',
      question_intro: 'El Matero está por empezar la ronda\ny todavía no pudo cebar el primer mate.',
      question: '¿Te ofreces a ayudarlo?',
      request_text: 'Con el termo debajo del brazo\nnunca me sale el mate justo:\nsiempre se pasa o queda corto.',
      request_question_text: '¿Me ayudas a cebar\ncada mate hasta la marca?',
      thanks_text: '¡Ahora sí, un mate de campeonato! Te cuento lo que vi.',
      help: [
        { text: 'El Matero necesita varios mates cebados hasta la marca verde. Cada uno pide un nivel distinto.' },
        { text: 'Mantén apretado el botón del mouse (o el dedo, o la tecla ESPACIO) para volcar el agua del termo: cuanto más lo sostienes, más fuerte sale.' },
        { text: 'Suelta cuando el agua llegue a la franja verde. Si te pasas se derrama, y el termo tiene poca agua: ¡no la desperdicies!' },
      ],
    });
  }
  setup(): void {
    const level = this.level(), n = level === 1 ? 3 : level === 2 ? 4 : 5;
    this.rounds = n; this.width = level === 1 ? 0.17 : level === 2 ? 0.13 : 0.1;
    this.maximum_time = 35 + 10 * level; this.maximum_time_score = 150;
    this.centers = [];
    for (let i = 0; i < n; i++) {
      let c = 0.4 + Math.random() * 0.47;
      for (let k = 0; k < 8 && i > 0 && Math.abs(c - this.centers[i - 1]) < 0.14; k++) c = 0.4 + Math.random() * 0.47;
      this.centers.push(c);
    }
    this.budget = this.centers.reduce((a, b) => a + b, 0) * 1.7 + 0.3;
    this.fails = 0; this.pours = 0;
    this.restart();
  }
  restart(): void {
    this.round = 0; this.level_ = 0; this.shown = 0; this.water = this.budget; this.p = 0; this.tilt = 0; this.pouring = false; this.settle = 0; this.state = 'play'; this.st = 0; this.ding = 0;
  }
  get band(): [number, number] { const c = this.centers[Math.min(this.round, this.rounds - 1)]; return [c - this.width / 2, c + this.width / 2]; }

  // ---------------------------------------------------------------------------------------------------------------- rules
  onDown(): void { /* the pour is driven by held() */ }
  go(state: string): void { this.state = state; this.st = 0; }
  update(dt: number): void {
    this.st += dt;
    const holding = this.held() && this.state === 'play' && this.water > 0 && this.level_ < 1;
    if (holding) {
      if (!this.pouring) { this.pouring = true; this.p = Math.max(this.p, 0.15); this.pours++; }
      this.p = Math.min(1, this.p + dt / 1.1);
      const rate = 0.07 + 0.25 * this.p * this.p, amount = Math.min(rate * dt, this.water);
      this.level_ += amount; this.water -= amount; this.settle = 0;
      this.glug = (this.glug || 0) - dt;
      if (this.glug <= 0) { this.glug = 0.085; blip(260 + this.level_ * 420, 0.07, 0.05, 'sine'); }
    } else {
      if (this.pouring) { this.pouring = false; this.level_ = Math.min(1, this.level_ + this.p * 0.012); }   // the last drops
      this.p = Math.max(0, this.p - dt / 0.12);
      if (this.state === 'play') this.settle += dt;
    }
    this.tilt = lerp(this.tilt, this.pouring ? 1 : 0, Math.min(1, dt * (this.pouring ? 7 : 9)));
    this.shown = lerp(this.shown, this.level_, Math.min(1, dt * 16));
    const [lo, hi] = this.band;

    if (this.state === 'play') {
      if (this.level_ >= 1) {                          // it spills
        this.level_ = 1; this.mistakes++; this.pouring = false; this.go('spill');
        this.say('¡Se derramó!', '#ff7a5c'); this.bump(9, 0.7); this.wrong_sound.play();
        this.burst(CX + 60, 130, 26, { color: '#c98a3a', speed: 120, life: 0.8, size: 3.2, grav: 380, angle: 0.5, spread: 1.6, art: 'mate_splash' });
        this.burst(CX - 60, 130, 26, { color: '#c98a3a', speed: 120, life: 0.8, size: 3.2, grav: 380, angle: Math.PI - 0.5, spread: 1.6, art: 'mate_splash' });
      } else if (this.settle > 0.5 && this.level_ > 0.03) {
        if (this.level_ >= lo && this.level_ <= hi) this.success();
        else if (this.level_ > hi) { this.mistakes++; this.go('drain'); this.say('¡Muy lleno!', '#ffb454'); this.bump(4); this.wrong_sound.play(); }
        else if (this.water <= 0.0005) this.outOfWater();
      } else if (this.water <= 0.0005 && this.settle > 0.5) this.outOfWater();
    } else if (this.state === 'spill') {
      if (this.st > 1.1) this.go('drain');
    } else if (this.state === 'drain') {                // the mate is emptied (drunk or poured out)
      this.level_ = Math.max(0, this.level_ - dt * 1.5);
      if (this.level_ <= 0) { this.go('play'); this.settle = 0; this.p = 0; if (this.water <= 0.0005) this.outOfWater(); }
    } else if (this.state === 'ok') {
      if (this.st > 1.15) { this.round++; this.go('drain'); }
    } else if (this.state === 'won') {
      if (this.st > 1.3) this.complete();
    } else if (this.state === 'empty') {
      if (this.st > 1.9) { this.fails++; this.restart(); }
    }
    // steam from the mate and the thermos
    if (this.level_ > 0.05 && Math.random() < dt * (this.pouring ? 22 : 7)) this.burst(CX + (Math.random() - 0.5) * 60, yOf(this.shown) - 4, 1, { kind: 'steam', color: '#fff', speed: 22, life: 1.6, size: 6, angle: -Math.PI / 2, spread: 0.7 });
    if (Math.random() < dt * 5) this.burst(this.spout()[0], this.spout()[1] - 4, 1, { kind: 'steam', color: '#fff', speed: 16, life: 1.4, size: 5, angle: -Math.PI / 2, spread: 0.6 });
    if (this.pouring && this.level_ > 0) this.burst(CX - 6 + (Math.random() - 0.5) * 8, yOf(this.shown), 1, { color: '#e8c98a', speed: 40, life: 0.45, size: 2.4, grav: 160, angle: -Math.PI / 2, spread: 1.4 });
  }
  success(): void {
    this.go('ok'); this.ding = this.t;
    this.say('¡Justo!', '#b8ff7a'); this.right_sound.play(); this.bump(0, 0.35, '255,230,140');
    this.burst(CX, yOf(this.level_), 18, { kind: 'star', color: '#ffd24a', speed: 110, life: 0.9, size: 4, grav: 120, angle: -Math.PI / 2, spread: 2.6 });
    this.burst(CX, yOf(this.level_), 3, { kind: 'ring', color: '#fff7c0', speed: 0, life: 0.6, size: 18 });
    if (this.round + 1 >= this.rounds) { this.go('won'); this.say('¡Qué mate!', '#ffe27a'); this.burst(CX, 120, 40, { kind: 'star', color: '#fff', speed: 160, life: 1.2, size: 4.5, grav: 140, angle: -Math.PI / 2, spread: 3 }); }
  }
  outOfWater(): void {
    if (this.state === 'empty') return;
    this.go('empty'); this.say('¡Se acabó el agua!', '#ff7a5c'); this.wrong_sound.play(); this.bump(6, 0.4);
  }

  // ---------------------------------------------------------------------------------------------------------------- painting
  /** the tip of the spout of the thermos */
  spout(): [number, number] {
    const a = this.tilt * 0.72, px = 98, py = 98;
    return [px + 19 * Math.cos(a) + 46 * Math.sin(a), py + 19 * Math.sin(a) - 46 * Math.cos(a)];
  }
  paint(c: any, W: number, H: number): void {
    if (!put(c, scaled('mate_bg', W, H), 0, 0)) this.paintWall(c, W, H);   // art if it exists, else the drawing by code
    // shadow of the mate
    c.fillStyle = 'rgba(60,24,6,0.35)'; c.beginPath(); c.ellipse(CX, 262, 58, 9, 0, 0, 7); c.fill();
    this.paintMate(c);
    this.paintBand(c);
    this.paintStream(c);
    this.paintThermos(c);
    this.paintHud(c, W);
    if (this.state === 'empty') { c.fillStyle = 'rgba(20,10,4,0.35)'; c.fillRect(0, 0, W, H); }
    if (this.t < 0.9 || this.round === 0 && this.pours === 0) this.paintTip(c, W);
  }
  paintWall(c: any, W: number, H: number): void {
    // wall: a warm evening light with slow rays behind the mate
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#f7d79b'); g.addColorStop(0.62, '#ea9f68'); g.addColorStop(1, '#c9703f');
    c.fillStyle = g; c.fillRect(-10, -10, W + 20, H + 20);
    c.save(); c.translate(CX, 160); c.rotate(this.t * 0.06);
    for (let i = 0; i < 12; i++) { c.rotate(Math.PI / 6); c.fillStyle = 'rgba(255,246,214,0.13)'; c.beginPath(); c.moveTo(0, 0); c.lineTo(420, -48); c.lineTo(420, 48); c.closePath(); c.fill(); }
    c.restore();
    // shelf with the sun of the flag of Uruguay as a decoration
    c.fillStyle = 'rgba(120,60,20,0.18)'; c.beginPath(); c.arc(W - 38, 56, 22, 0, 7); c.fill();
    c.strokeStyle = 'rgba(120,60,20,0.2)'; c.lineWidth = 2; for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8; c.beginPath(); c.moveTo(W - 38 + Math.cos(a) * 26, 56 + Math.sin(a) * 26); c.lineTo(W - 38 + Math.cos(a) * 33, 56 + Math.sin(a) * 33); c.stroke(); }
    // table with a checked cloth
    c.fillStyle = '#7a4a28'; c.fillRect(0, 252, W, H - 252);
    for (let x = 0; x < W; x += 16) for (let y = 0; y < 2; y++) { c.fillStyle = (x / 16 + y) % 2 ? '#f2e3c4' : '#c8402f'; c.fillRect(x, 252 + y * 10, 16, 10); }
    c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(0, 272 - 6, W, 6);
  }
  paintTip(c: any, W: number): void {
    c.save(); c.globalAlpha = 0.75 + 0.25 * Math.sin(this.t * 5); c.font = 'bold 13px sans-serif'; c.textAlign = 'center'; c.lineWidth = 4; c.lineJoin = 'round';
    c.strokeStyle = 'rgba(30,16,6,0.8)'; c.strokeText('Mantén apretado para verter', W / 2, 262); c.fillStyle = '#fff3c9'; c.fillText('Mantén apretado para verter', W / 2, 262); c.restore();
  }
  paintMate(c: any): void {
    const wob = this.state === 'ok' ? Math.sin((this.t - this.ding) * 18) * Math.exp(-(this.t - this.ding) * 4) * 0.05 : 0;
    c.save(); c.translate(CX, 262); c.scale(1 + wob, 1 - wob); c.translate(-CX, -262);
    const art = scaled('mate_gourd', 144, 170);
    if (art) put(c, art, CX - 72, 92);   // the art is the whole gourd (body, rim and straw); the water is drawn inside it
    else {
    // outer body
    gourd(c, OUT); const gr = c.createLinearGradient(CX - 70, 0, CX + 70, 0); gr.addColorStop(0, '#8a5424'); gr.addColorStop(0.45, '#b9763a'); gr.addColorStop(1, '#6a3c18');
    c.fillStyle = gr; c.fill(); c.lineWidth = 4; c.lineJoin = 'round'; c.strokeStyle = '#1b1410'; c.stroke();
    }
    // the cutaway: the inside, the yerba, the water
    c.save(); gourd(c, inset(8)); c.clip();
    if (!art) {
    c.fillStyle = '#2f2010'; c.fillRect(0, 0, BW, BH);
    // yerba (a mound on the left)
    c.fillStyle = '#7c9230'; c.beginPath(); c.moveTo(CX - 80, 262); c.lineTo(CX - 80, 140); c.quadraticCurveTo(CX - 40, 128, CX - 6, 170); c.quadraticCurveTo(CX + 8, 200, CX + 14, 262); c.closePath(); c.fill();
    c.fillStyle = '#5f7424'; for (let i = 0; i < 46; i++) { const x = CX - 76 + ((i * 53) % 84), y = 150 + ((i * 37) % 100); c.fillRect(x, y, 2, 2); }
    c.fillStyle = '#a9c24a'; for (let i = 0; i < 24; i++) { const x = CX - 74 + ((i * 71) % 80), y = 146 + ((i * 29) % 96); c.fillRect(x, y, 2, 1); }
    }
    // water
    const wy = yOf(this.shown);
    if (this.shown > 0.004) {
      c.fillStyle = 'rgba(176,118,40,0.82)'; c.beginPath(); c.moveTo(CX - 90, 280); c.lineTo(CX - 90, wy);
      for (let x = -90; x <= 90; x += 6) c.lineTo(CX + x, wy + Math.sin(this.t * 6 + x * 0.12) * (1.2 + (this.pouring ? 2.2 : 0)));
      c.lineTo(CX + 90, 280); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(255,232,170,0.8)'; c.lineWidth = 2; c.beginPath();
      for (let x = -90; x <= 90; x += 6) { const y = wy + Math.sin(this.t * 6 + x * 0.12) * (1.2 + (this.pouring ? 2.2 : 0)); if (x === -90) c.moveTo(CX + x, y); else c.lineTo(CX + x, y); }
      c.stroke();
    }
    c.restore();
    if (!art) {
    // rim and the straw (bombilla)
    c.strokeStyle = '#1b1410'; c.lineWidth = 4; c.fillStyle = '#c9d1d8';
    c.beginPath(); c.ellipse(CX, 104, 52, 8, 0, 0, 7); c.fill(); c.stroke();
    c.fillStyle = '#2f2010'; c.beginPath(); c.ellipse(CX, 105, 44, 5, 0, 0, 7); c.fill();
    c.strokeStyle = '#1b1410'; c.lineWidth = 6.5; c.beginPath(); c.moveTo(CX + 16, 250); c.lineTo(CX + 46, 72); c.stroke();
    c.strokeStyle = '#dfe5ea'; c.lineWidth = 3.2; c.beginPath(); c.moveTo(CX + 16, 250); c.lineTo(CX + 46, 72); c.stroke();
    c.fillStyle = '#dfe5ea'; c.strokeStyle = '#1b1410'; c.lineWidth = 2.5; c.beginPath(); c.ellipse(CX + 46, 71, 5, 3.4, 0, 0, 7); c.fill(); c.stroke();
    }
    c.restore();
  }
  paintBand(c: any): void {
    const [lo, hi] = this.band, y1 = yOf(hi), y2 = yOf(lo), pulse = 0.5 + 0.5 * Math.sin(this.t * 5);
    c.save(); gourd(c, inset(8)); c.clip();
    c.fillStyle = `rgba(110,240,130,${0.2 + 0.08 * pulse})`; c.fillRect(0, y1, BW, y2 - y1);
    c.restore();
    c.save(); c.strokeStyle = '#d8ffb8'; c.lineWidth = 2; c.setLineDash([5, 4]); c.lineDashOffset = -this.t * 18;
    c.beginPath(); c.moveTo(CX - 62, y1); c.lineTo(CX + 62, y1); c.moveTo(CX - 62, y2); c.lineTo(CX + 62, y2); c.stroke(); c.restore();
    // a bracket on the right with the label
    const bx = CX + 82;
    c.strokeStyle = '#1b1410'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(bx - 6, y1); c.lineTo(bx, y1); c.lineTo(bx, y2); c.lineTo(bx - 6, y2); c.stroke();
    c.strokeStyle = '#8be36a'; c.lineWidth = 3; c.stroke();
    c.font = 'bold 12px sans-serif'; c.textAlign = 'left'; c.lineWidth = 4; c.lineJoin = 'round'; c.strokeStyle = 'rgba(30,16,6,0.85)'; c.strokeText('JUSTO', bx + 7, (y1 + y2) / 2 + 4);
    c.fillStyle = '#d8ffb8'; c.fillText('JUSTO', bx + 7, (y1 + y2) / 2 + 4);
  }
  paintStream(c: any): void {
    if (!(this.pouring && this.p > 0.05 && this.state === 'play')) return;
    const [sx, sy] = this.spout(), tx = CX - 8, ty = yOf(this.shown), w = 2.5 + this.p * 5.5;
    c.save(); c.lineCap = 'round';
    for (const [col, k] of [['#1b1410', 1.5], ['#e8c070', 1], ['#fff1c8', 0.35]]) {
      c.strokeStyle = col; c.lineWidth = w * k; c.beginPath(); c.moveTo(sx, sy);
      c.bezierCurveTo(sx + (tx - sx) * 0.7, sy - 2, tx + Math.sin(this.t * 40) * 1.2, ty - (ty - sy) * 0.4, tx, ty); c.stroke();
    }
    c.restore();
  }
  paintThermos(c: any): void {
    const a = this.tilt * 0.72, px = 98, py = 98;
    // the arm that holds it
    c.save(); c.strokeStyle = '#1b1410'; c.lineWidth = 3;
    c.fillStyle = '#6b8f4e'; c.beginPath(); c.moveTo(-6, 128); c.lineTo(64, 90 + this.tilt * 8); c.lineTo(74, 118 + this.tilt * 8); c.lineTo(-6, 176); c.closePath(); c.fill(); c.stroke();
    c.restore();
    const tc = scaled('mate_termo', 34, 102), pc = this.tilt > 0.6 ? scaled('mate_termo_pour', 110, 67) : null;
    if (pc) { const [sx, sy] = this.spout(); put(c, pc, sx - 84, sy - 22); }   // POUR art: tweak the offsets if the spout does not meet the stream
    else if (tc) { c.save(); c.translate(px, py); c.rotate(a); put(c, tc, -17, -52); c.restore(); }
    else {
    c.save(); c.translate(px, py); c.rotate(a);
    // body
    const g = c.createLinearGradient(-19, 0, 19, 0); g.addColorStop(0, '#9aa5ae'); g.addColorStop(0.35, '#eef2f5'); g.addColorStop(1, '#8a949d');
    c.fillStyle = g; c.strokeStyle = '#1b1410'; c.lineWidth = 3.5; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(-19, -34); c.lineTo(-19, 40); c.quadraticCurveTo(-19, 48, -11, 48); c.lineTo(11, 48); c.quadraticCurveTo(19, 48, 19, 40); c.lineTo(19, -34); c.closePath(); c.fill(); c.stroke();
    // red band and the cap with the spout
    c.fillStyle = '#c8312b'; c.fillRect(-18, 18, 36, 10); c.strokeRect(-18, 18, 36, 10);
    c.fillStyle = '#d8392f'; c.beginPath(); c.moveTo(-21, -34); c.lineTo(-21, -46); c.quadraticCurveTo(0, -52, 21, -46); c.lineTo(21, -34); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#9aa5ae'; c.beginPath(); c.moveTo(14, -46); c.lineTo(24, -52); c.lineTo(27, -46); c.lineTo(21, -42); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.7)'; c.fillRect(-13, -26, 4, 50);
    c.restore();
    }
    // the hand over it
    c.save(); c.translate(px, py); c.rotate(a); c.fillStyle = '#dba070'; c.strokeStyle = '#1b1410'; c.lineWidth = 3;
    c.beginPath(); c.ellipse(-8, 6, 14, 10, 0.2, 0, 7); c.fill(); c.stroke(); c.restore();
  }
  paintHud(c: any, W: number): void {
    // one pip per mate
    for (let i = 0; i < this.rounds; i++) {
      const x = 16 + i * 20, done = i < this.round || (this.state === 'won' && i === this.round), cur = i === this.round && !done;
      c.fillStyle = done ? '#7bd04a' : 'rgba(40,20,8,0.55)'; c.strokeStyle = '#1b1410'; c.lineWidth = 2.5;
      c.beginPath(); c.arc(x, 16, cur ? 7 + Math.sin(this.t * 6) : 6.5, 0, 7); c.fill(); c.stroke();
      if (done) { c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 3, 16); c.lineTo(x - 0.5, 19); c.lineTo(x + 4, 13); c.stroke(); }
    }
    // the water that is left in the thermos
    const k = clamp(this.water / this.budget, 0, 1), bw = 84, bx = W - bw - 12;
    c.fillStyle = 'rgba(40,20,8,0.6)'; c.strokeStyle = '#1b1410'; c.lineWidth = 2.5; c.beginPath(); c.roundRect ? c.roundRect(bx, 9, bw, 14, 5) : c.rect(bx, 9, bw, 14); c.fill(); c.stroke();
    c.fillStyle = k > 0.35 ? '#5cc7f2' : '#ff7a5c'; c.beginPath(); c.roundRect ? c.roundRect(bx + 2, 11, Math.max(0, (bw - 4) * k), 10, 4) : c.rect(bx + 2, 11, (bw - 4) * k, 10); c.fill();
    c.font = 'bold 10px sans-serif'; c.textAlign = 'right'; c.fillStyle = '#fff3c9'; c.lineWidth = 3; c.strokeStyle = 'rgba(30,16,6,0.8)'; c.strokeText('AGUA', bx - 5, 20); c.fillText('AGUA', bx - 5, 20);
  }
}
