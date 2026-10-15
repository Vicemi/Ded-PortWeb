// @ts-nocheck
// "Rambla": the Corredora jogs along the Rambla of Montevideo at sunset and needs a hand: tap (mouse, touch, Space / Up) to jump the obstacles, hold for a
// higher jump. Three tumbles and you start again; reach the finish arch to win. Parallax sky, river, skyline, wall and street, all drawn by code.
import { ArcadeGame, BW, BH, clamp, easeOut } from './arcade';
import { registerWitnessArt } from './witnessart';
import { blip } from '../../engine/synth';
import { src, scaled, frame, crop, put } from './mgart';

registerWitnessArt('corredora', 'corredora');

const RX = 74, GY = 238;                       // x of the runner on the board and the y of the ground
const GRAV = 1900, JUMP = 640, CUT = 250;      // px/s^2, jump speed, the speed a short tap cuts the rise to
const INK = '#1b1410';

// the skyline of Montevideo: a repeating strip of buildings with the Palacio Salvo in the middle
const SKY_PERIOD = 760;
const SKYLINE = (() => {
  let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const out = []; let x = 0;
  while (x < SKY_PERIOD) { const w = 14 + rnd() * 20, h = 14 + rnd() * 34; out.push({ x, w, h, salvo: false }); x += w + rnd() * 4; }
  out.push({ x: 360, w: 22, h: 52, salvo: true });
  return out;
})();

const TYPES = {
  cono: { w: 16, h: 26, name: 'cono' },
  cono2: { w: 40, h: 26, name: 'cono2' },
  banco: { w: 48, h: 28, name: 'banco' },
  perro: { w: 34, h: 24, name: 'perro' },
  gaviota: { w: 26, h: 14, name: 'gaviota', fly: 84 },
};

export class MinigameRambla extends ArcadeGame {
  constructor(stage: any, phase1content: any, witness: any) {
    super(stage, phase1content, witness, {
      id: 'corredora', title: 'CORREDORA',
      question_intro: 'La Corredora se entrena en la Rambla\npero hoy hay obstáculos por todos lados.',
      question: '¿Te ofreces a ayudarla?',
      request_text: 'Quiero llegar a la meta antes\nde que caiga el sol y tropiezo\ncon todo lo que hay en el camino.',
      request_question_text: '¿Me ayudas a saltar\nlos obstáculos de la Rambla?',
      thanks_text: '¡Qué carrera! Gracias por la mano. Escucha lo que vi en la Rambla.',
      help: [
        { text: 'La Corredora trota por la Rambla al atardecer. Conos, bancos y perros se cruzan en su camino.' },
        { text: 'Toca la pantalla, haz clic o pulsa ESPACIO (o la flecha hacia arriba) para saltar. Si mantienes apretado, saltas más alto.' },
        { text: 'Las gaviotas vuelan alto: no saltes cuando pasan. Tres tropiezos y vuelves a empezar; llega al arco de la meta para ganar.' },
      ],
    });
  }
  setup(): void {
    const level = this.level();
    this.len = level === 1 ? 5200 : level === 2 ? 6200 : 7400;
    this.speed0 = level === 1 ? 180 : level === 2 ? 200 : 220;
    this.maximum_time = 40 + 5 * level; this.maximum_time_score = 150;
    this.fails = 0; this.jumps = 0;
    this.restart();
  }
  restart(): void {
    const level = this.level();
    this.d = 0; this.vy = 0; this.h = 0; this.air = false; this.lives = 3; this.invul = 0; this.slow = 0; this.squash = 0; this.buffer = 0; this.coyote = 0; this.phase = 0;
    this.state = 'play'; this.st = 0; this.speed = this.speed0; this.dust = 0;
    // the obstacles of the run, far enough from each other to be jumped
    this.obstacles = [];
    const kinds = level === 1 ? ['cono', 'cono', 'banco', 'perro'] : level === 2 ? ['cono', 'banco', 'perro', 'cono2', 'gaviota'] : ['cono', 'banco', 'perro', 'cono2', 'gaviota', 'gaviota'];
    let x = 420, last = '';
    while (x < this.len - 400) {
      let k = kinds[Math.floor(Math.random() * kinds.length)];
      if (k === last && k === 'gaviota') k = 'cono';
      const t = TYPES[k];
      this.obstacles.push({ k, x, w: t.w, h: t.h, fly: t.fly || 0, hit: false, ph: Math.random() * 6 });
      x += this.speed0 * 1.15 + t.w + (k === 'gaviota' ? 60 : 0) + Math.random() * this.speed0 * 0.9 + (level === 1 ? 70 : 0);
      last = k;
    }
    this.clouds = [0, 1, 2, 3].map((i) => ({ x: i * 120 + Math.random() * 60, y: 22 + Math.random() * 52, w: 60 + Math.random() * 50 }));
  }

  // ---------------------------------------------------------------------------------------------------------------- rules
  onDown(): void {
    if (this.state !== 'play') return;
    if (!this.air || this.coyote > 0) this.jump(); else this.buffer = 0.13;
  }
  onUp(): void { if (this.air && this.vy < -CUT) this.vy = -CUT; this.buffer = 0; }
  jump(): void {
    this.vy = -JUMP; this.air = true; this.coyote = 0; this.squash = -0.3; this.jumps++;
    this.burst(RX, GY, 6, { color: '#d8c8b0', speed: 50, life: 0.4, size: 3, grav: 60, angle: -Math.PI / 2, spread: 2.2 });
    blip(420, 0.09, 0.07, 'triangle');
  }
  speedNow(): number { return this.speed0 * (1 + 0.18 * clamp(this.d / this.len, 0, 1)) * (this.slow > 0 ? 0.35 + 0.65 * (1 - this.slow) : 1); }
  update(dt: number): void {
    this.st += dt;
    if (this.state === 'fail') { if (this.st > 1.7) { this.fails++; this.restart(); } this.bits(dt); return; }
    const run = this.state === 'play';
    this.speed = this.speedNow() * (this.state === 'won' ? clamp(1 - this.st * 0.9, 0.15, 1) : 1);
    this.d += this.speed * dt; this.phase += this.speed * dt * 0.075;
    this.slow = Math.max(0, this.slow - dt / 0.9); this.invul = Math.max(0, this.invul - dt); this.coyote = Math.max(0, this.coyote - dt); this.buffer = Math.max(0, this.buffer - dt);
    this.squash *= Math.max(0, 1 - dt * 9);
    // the jump
    if (this.air) {
      this.vy += GRAV * dt; this.h -= this.vy * dt;
      if (this.h <= 0) {
        this.h = 0; this.vy = 0; this.air = false; this.squash = 0.35;
        this.burst(RX, GY, 9, { color: '#d8c8b0', speed: 70, life: 0.45, size: 3, grav: 50, angle: -Math.PI / 2, spread: 2.9 });
        if (this.buffer > 0 && run) this.jump();
      }
    }
    if (!this.air && run && this.held() && this.buffer > 0) this.jump();
    if (!this.air && Math.random() < dt * 22) this.burst(RX - 6, GY, 1, { color: '#cdbca4', speed: 26, life: 0.4, size: 2.4, grav: 30, angle: Math.PI, spread: 0.8 });
    // the obstacles move; the dogs trot towards the runner once on the screen
    for (const o of this.obstacles) {
      if (o.k === 'perro' && o.x - this.d < BW - RX) o.x -= 44 * dt;
      if (run && !o.hit && this.invul <= 0) {
        const sx = RX + (o.x - this.d);
        const top = o.fly ? GY - o.fly - o.h / 2 : GY - o.h, bot = o.fly ? GY - o.fly + o.h / 2 : GY;
        const rl = RX - 6, rr = RX + 6, rt = GY - this.h - 52, rb = GY - this.h;
        if (rr > sx + 3 && rl < sx + o.w - 3 && rb > top + 2 && rt < bot - 2) this.crash(o);
      }
    }
    if (run && this.d >= this.len) {
      this.state = 'won'; this.st = 0; this.say('¡Llegaste!', '#ffe27a'); this.right_sound.play();
      for (let i = 0; i < 5; i++) this.burst(RX + 60 + i * 24, 110, 10, { kind: 'star', color: ['#ffd24a', '#6cb4ee', '#fff', '#ff7a5c', '#8be36a'][i], speed: 150, life: 1.3, size: 4, grav: 160, angle: -Math.PI / 2, spread: 2.6 });
    } else if (this.state === 'won' && this.st > 1.5) this.complete();
    this.bits(dt);
  }
  bits(dt: number): void { for (const cl of this.clouds) { cl.x -= dt * 6; if (cl.x < -cl.w) cl.x += BW + cl.w * 2; } }
  crash(o: any): void {
    o.hit = true; this.lives--; this.mistakes++; this.invul = 1.4; this.slow = 1; this.vy = Math.min(this.vy, -260); this.air = true; this.squash = -0.2;
    this.bump(9, 0.6); this.wrong_sound.play();
    this.burst(RX + 10, GY - 20 - this.h, 14, { kind: 'star', color: '#ffd24a', speed: 130, life: 0.6, size: 3.5, grav: 200, angle: -Math.PI / 2, spread: 2.8 });
    if (this.lives <= 0) { this.state = 'fail'; this.st = 0; this.say('¡Casi! Otra vez', '#ff9a7c'); }
    else this.say(this.lives === 1 ? '¡Última vida!' : '¡Ay!', '#ff9a7c');
  }

  // ---------------------------------------------------------------------------------------------------------------- painting
  paint(c: any, W: number, H: number): void {
    const d = this.d, t = this.t;
    // sky (art: the whole sky, sun and river in one picture)
    const sa = put(c, scaled('rambla_sky', W, 208), 0, 0);
    if (!sa) {
    const sk = c.createLinearGradient(0, 0, 0, 150); sk.addColorStop(0, '#3a2a6e'); sk.addColorStop(0.45, '#b84a78'); sk.addColorStop(0.8, '#ff9552'); sk.addColorStop(1, '#ffd48a');
    c.fillStyle = sk; c.fillRect(-10, -10, W + 20, 160);
    // sun with a glow
    const sg = c.createRadialGradient(236, 138, 6, 236, 138, 90); sg.addColorStop(0, 'rgba(255,240,180,0.9)'); sg.addColorStop(0.3, 'rgba(255,180,90,0.4)'); sg.addColorStop(1, 'rgba(255,150,80,0)');
    c.fillStyle = sg; c.fillRect(120, 40, 220, 120);
    c.fillStyle = '#fff1b8'; c.beginPath(); c.arc(236, 138, 25, 0, 7); c.fill();
    // clouds and gulls (slow)
    for (const cl of this.clouds) { c.fillStyle = 'rgba(255,214,200,0.5)'; c.beginPath(); c.ellipse(cl.x, cl.y, cl.w / 2, 6, 0, 0, 7); c.ellipse(cl.x + cl.w * 0.2, cl.y - 4, cl.w / 3, 6, 0, 0, 7); c.fill(); }
    }
    c.strokeStyle = 'rgba(60,30,60,0.55)'; c.lineWidth = 1.6;
    for (let i = 0; i < 3; i++) { const bx = ((i * 140 - d * 0.05 + 400) % (W + 40)) - 20, by = 50 + i * 16 + Math.sin(t * 2 + i) * 3, f = Math.sin(t * 9 + i * 2) * 3; c.beginPath(); c.moveTo(bx - 6, by + f); c.quadraticCurveTo(bx - 3, by - 3, bx, by); c.quadraticCurveTo(bx + 3, by - 3, bx + 6, by + f); c.stroke(); }
    // skyline (very slow)
    const sl = scaled('rambla_skyline', 600, 110);
    if (sl) { for (let x = -Math.floor((d * 0.06) % 600); x < W; x += 600) put(c, sl, x, 42); }
    else {
    c.fillStyle = '#5b3a6c';
    const off = (d * 0.06) % SKY_PERIOD;
    for (let rep = -1; rep < 2; rep++) for (const b of SKYLINE) {
      const x = b.x - off + rep * SKY_PERIOD; if (x > W + 10 || x + b.w < -10) continue;
      c.fillRect(x, 150 - b.h, b.w, b.h + 2);
      if (b.salvo) { c.fillRect(x + 6, 150 - b.h - 14, 10, 14); c.fillRect(x + 10, 150 - b.h - 30, 2, 18); c.fillStyle = '#ffd28a'; c.fillRect(x + 8, 150 - b.h - 10, 3, 3); c.fillStyle = '#5b3a6c'; }
    }
    c.fillStyle = 'rgba(255,214,140,0.5)'; for (let i = 0; i < 14; i++) { const x = ((i * 53 - d * 0.06 + 1200) % (W + 20)) , y = 128 + (i * 7) % 18; c.fillRect(x, y, 2, 2); }
    }
    // river
    if (!sa) {
    const rv = c.createLinearGradient(0, 148, 0, 200); rv.addColorStop(0, '#f08a5a'); rv.addColorStop(0.35, '#a85a8a'); rv.addColorStop(1, '#4a3a7a');
    c.fillStyle = rv; c.fillRect(-10, 148, W + 20, 56);
    for (let i = 0; i < 16; i++) {
      const y = 150 + i * 3.2, sp = 0.1 + i * 0.012, x0 = ((i * 91 - d * sp - t * 6) % 120 + 120) % 120;
      c.fillStyle = `rgba(255,230,170,${0.55 - i * 0.025})`;
      for (let x = x0 - 120; x < W + 40; x += 120) c.fillRect(x, y, 14 + (i % 4) * 5, 1.4);
    }
    for (let i = 0; i < 10; i++) { c.fillStyle = `rgba(255,236,170,${0.8 - i * 0.07})`; const w = 40 - i * 3 + Math.sin(t * 3 + i) * 6; c.fillRect(236 - w / 2, 150 + i * 4.5, w, 1.8); }
    }
    // the wall of the Rambla with its lamps (art: wall, pavement and grass in one strip)
    const gt = scaled('rambla_ground', 470, 94);
    if (gt) { for (let x = -Math.floor(d % 470); x < W; x += 470) put(c, gt, x, 178); }
    else {
    c.fillStyle = '#a8927a'; c.fillRect(-10, 182, W + 20, 26); c.fillStyle = '#d4bf9e'; c.fillRect(-10, 178, W + 20, 8); c.fillStyle = 'rgba(60,30,20,0.35)'; c.fillRect(-10, 186, W + 20, 3);
    c.strokeStyle = 'rgba(60,40,30,0.4)'; c.lineWidth = 1.5; for (let x = -((d * 0.55) % 46); x < W + 46; x += 46) { c.beginPath(); c.moveTo(x, 189); c.lineTo(x, 208); c.stroke(); }
    for (let x = -((d * 0.55) % 170) - 30; x < W + 60; x += 170) {
      c.fillStyle = '#2c2430'; c.fillRect(x - 1.5, 106, 3, 78);
      const lg = c.createRadialGradient(x, 104, 1, x, 104, 22); lg.addColorStop(0, 'rgba(255,226,150,0.9)'); lg.addColorStop(1, 'rgba(255,200,100,0)'); c.fillStyle = lg; c.fillRect(x - 24, 80, 48, 48);
      c.fillStyle = '#fff0b0'; c.beginPath(); c.arc(x, 104, 4.5, 0, 7); c.fill(); c.strokeStyle = '#2c2430'; c.lineWidth = 2; c.stroke();
    }
    // the street: tiles and the bike lane
    const st = c.createLinearGradient(0, 208, 0, H); st.addColorStop(0, '#8e7a72'); st.addColorStop(1, '#6d5a58');
    c.fillStyle = st; c.fillRect(-10, 208, W + 20, H - 208);
    c.strokeStyle = 'rgba(40,24,24,0.3)'; c.lineWidth = 1.5;
    for (let x = -((d) % 44); x < W + 44; x += 44) { c.beginPath(); c.moveTo(x, 208); c.lineTo(x - 18, H); c.stroke(); }
    for (const y of [226, 246]) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
    c.fillStyle = 'rgba(255,246,220,0.55)'; for (let x = -((d * 1) % 60); x < W + 60; x += 60) c.fillRect(x, 262, 30, 3);
    }
    // finish arch
    const fx = RX + (this.len - d);
    if (fx < W + 60 && fx > -60) this.paintArch(c, fx);
    // obstacles
    for (const o of this.obstacles) { const sx = RX + (o.x - d); if (sx > -60 && sx < W + 40) this.paintObstacle(c, o, sx); }
    // speed lines
    if (this.speed > this.speed0 * 1.05) { c.strokeStyle = 'rgba(255,255,255,0.18)'; c.lineWidth = 1.5; for (let i = 0; i < 6; i++) { const y = 216 + ((i * 37 + Math.floor(d / 40) * 13) % 50), x = ((i * 91 - d * 1.6) % (W + 80) + W + 80) % (W + 80) - 40; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 26, y); c.stroke(); } }
    this.paintRunner(c);
    this.paintHud(c, W);
    // the evening vignette
    const vg = c.createRadialGradient(W / 2, H / 2, 90, W / 2, H / 2, 240); vg.addColorStop(0, 'rgba(40,10,40,0)'); vg.addColorStop(1, 'rgba(40,10,40,0.28)'); c.fillStyle = vg; c.fillRect(0, 0, W, H);
    if (this.state === 'fail') { c.fillStyle = 'rgba(30,10,30,0.4)'; c.fillRect(0, 0, W, H); }
    if (this.d < 90 && this.jumps === 0) { c.save(); c.globalAlpha = 0.75 + 0.25 * Math.sin(this.t * 5); c.font = 'bold 13px sans-serif'; c.textAlign = 'center'; c.lineWidth = 4; c.lineJoin = 'round'; c.strokeStyle = 'rgba(30,16,30,0.8)'; c.strokeText('Toca o pulsa ESPACIO para saltar', W / 2, 264); c.fillStyle = '#fff3c9'; c.fillText('Toca o pulsa ESPACIO para saltar', W / 2, 264); c.restore(); }
  }
  paintArch(c: any, x: number): void {
    if (put(c, scaled('rambla_meta', 156, 60), x + 34 - 78, GY - 58)) return;
    c.fillStyle = INK; c.fillRect(x - 3, GY - 104, 8, 106); c.fillRect(x + 62, GY - 104, 8, 106);
    c.fillStyle = '#fff'; c.fillRect(x - 1, GY - 104, 4, 106); c.fillRect(x + 64, GY - 104, 4, 106);
    c.fillStyle = INK; c.fillRect(x - 8, GY - 112, 84, 26);
    c.fillStyle = '#6cb4ee'; c.fillRect(x - 5, GY - 109, 78, 20);
    c.fillStyle = '#fff'; c.font = 'bold 15px sans-serif'; c.textAlign = 'center'; c.fillText('META', x + 34, GY - 94);
    for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#fff' : '#ffd24a'; c.fillRect(x - 3 + i * 9, GY - 88, 9, 6); }
    // the tape
    if (this.state !== 'won') { c.strokeStyle = '#ff5a4a'; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 4, GY - 38); c.lineTo(x + 62, GY - 38); c.stroke(); }
  }
  paintObstacle(c: any, o: any, sx: number): void {
    const flick = o.hit ? 0.45 : 1;
    c.save(); c.globalAlpha = flick; c.lineJoin = 'round'; c.lineWidth = 3; c.strokeStyle = INK;
    // shadow
    if (!o.fly) { c.fillStyle = 'rgba(30,10,20,0.3)'; c.beginPath(); c.ellipse(sx + o.w / 2, GY + 1, o.w / 2 + 2, 3.5, 0, 0, 7); c.fill(); }
    if (this.paintObstacleArt(c, o, sx)) { c.restore(); return; }
    if (o.k === 'cono' || o.k === 'cono2') {
      for (let i = 0; i < (o.k === 'cono' ? 1 : 2); i++) {
        const x = sx + i * 24;
        c.fillStyle = '#ff7a1f'; c.beginPath(); c.moveTo(x + 8, GY - 26); c.lineTo(x + 15, GY); c.lineTo(x + 1, GY); c.closePath(); c.fill(); c.stroke();
        c.fillStyle = '#fff'; c.beginPath(); c.moveTo(x + 5.5, GY - 15); c.lineTo(x + 10.5, GY - 15); c.lineTo(x + 12, GY - 9); c.lineTo(x + 4, GY - 9); c.closePath(); c.fill();
        c.fillStyle = '#e5640f'; c.fillRect(x - 1, GY - 3, 18, 4); c.strokeRect(x - 1, GY - 3, 18, 4);
      }
    } else if (o.k === 'banco') {
      c.fillStyle = '#6b4a2a'; c.fillRect(sx + 4, GY - 12, 5, 12); c.fillRect(sx + o.w - 9, GY - 12, 5, 12); c.strokeRect(sx + 4, GY - 12, 5, 12); c.strokeRect(sx + o.w - 9, GY - 12, 5, 12);
      c.fillStyle = '#b87a3a'; c.fillRect(sx, GY - 17, o.w, 7); c.strokeRect(sx, GY - 17, o.w, 7);
      c.fillRect(sx + 2, GY - 29, o.w - 4, 6); c.strokeRect(sx + 2, GY - 29, o.w - 4, 6); c.fillStyle = '#6b4a2a'; c.fillRect(sx + 6, GY - 24, 4, 8); c.fillRect(sx + o.w - 10, GY - 24, 4, 8);
    } else if (o.k === 'perro') {
      const k = Math.sin(this.t * 16 + o.ph) * 5;
      c.fillStyle = '#8a5a30';
      for (const [lx, a] of [[5, k], [10, -k], [22, -k], [27, k]]) { c.beginPath(); c.moveTo(sx + lx, GY - 10); c.lineTo(sx + lx + a * 0.6, GY - 1); c.lineWidth = 4; c.stroke(); c.strokeStyle = '#8a5a30'; c.lineWidth = 2; c.stroke(); c.strokeStyle = INK; c.lineWidth = 3; }
      c.fillStyle = '#a5703a'; c.beginPath(); c.ellipse(sx + 16, GY - 15, 14, 7.5, 0, 0, 7); c.fill(); c.stroke();
      c.beginPath(); c.ellipse(sx + 4, GY - 20, 7, 6.5, 0, 0, 7); c.fill(); c.stroke();
      c.fillStyle = '#6b4220'; c.beginPath(); c.ellipse(sx + 7, GY - 24, 3, 5, -0.4, 0, 7); c.fill(); c.stroke();
      c.fillStyle = INK; c.beginPath(); c.arc(sx + 2, GY - 21, 1.3, 0, 7); c.arc(sx - 2, GY - 18, 1.8, 0, 7); c.fill();
      c.strokeStyle = '#a5703a'; c.lineWidth = 4; c.beginPath(); c.moveTo(sx + 29, GY - 18); c.quadraticCurveTo(sx + 36, GY - 28 + Math.sin(this.t * 14) * 3, sx + 33, GY - 31); c.stroke();
    } else {   // gull
      const y = GY - o.fly + Math.sin(this.t * 3 + o.ph) * 4, f = Math.sin(this.t * 12 + o.ph) * 8;
      c.fillStyle = '#fff'; c.beginPath(); c.moveTo(sx + 2, y); c.quadraticCurveTo(sx + 7, y - 10 - f, sx + 13, y - 2); c.quadraticCurveTo(sx + 19, y - 10 - f, sx + 25, y); c.quadraticCurveTo(sx + 20, y + 5, sx + 13, y + 6); c.quadraticCurveTo(sx + 6, y + 5, sx + 2, y); c.fill(); c.stroke();
      c.fillStyle = '#ffb02a'; c.beginPath(); c.moveTo(sx + 1, y + 1); c.lineTo(sx - 6, y + 3); c.lineTo(sx + 1, y + 4); c.closePath(); c.fill(); c.lineWidth = 2; c.stroke();
    }
    c.restore();
  }
  /** the obstacle from the sheet mg_rambla_obstacles (cono 64, banco 140, perro 110, gaviota 96 wide; 80 high), drawn in the size of its hitbox */
  paintObstacleArt(c: any, o: any, sx: number): boolean {
    if (!src('rambla_obstacles')) return false;
    const OFF = { cono: [0, 64], cono2: [0, 64], banco: [64, 140], perro: [204, 110], gaviota: [314, 96] }[o.k], hs = o.k === 'gaviota' ? 25 : o.h, w = Math.round(OFF[1] * hs / 80);   // all the cells are 80 high
    const cv = crop('rambla_obstacles', OFF[0], OFF[1], w, hs);
    if (o.k === 'gaviota') { return put(c, cv, sx + (o.w - w) / 2, GY - o.fly + Math.sin(this.t * 3 + o.ph) * 4 - hs / 2); }
    put(c, cv, sx + ((o.k === 'cono2' ? 16 : o.w) - w) / 2, GY - hs);
    if (o.k === 'cono2') put(c, cv, sx + 24 + (16 - w) / 2, GY - hs);
    return true;
  }
  /** the runner from the sheets (6 run, 3 jump, 3 fall frames); false = no art for this pose, the drawing by code is used */
  paintRunnerArt(c: any, x: number, y: number): boolean {
    if (!src('rambla_runner')) return false;
    const falling = this.slow > 0.15 || this.state === 'fail';
    if (falling) {
      if (!src('rambla_runner_fall')) return false;
      const k = 1 - this.slow, i = this.state === 'fail' ? (this.st < 0.25 ? 0 : 1) : k < 0.3 ? 0 : k < 0.7 ? 1 : 2;
      return put(c, frame('rambla_runner_fall', 3, i, 64, 48), x - 32, y - 48);
    }
    if (this.air || this.squash > 0.12) {
      if (!src('rambla_runner_jump')) return false;
      const i = this.air ? (this.squash < -0.12 ? 0 : 1) : 2;
      return put(c, frame('rambla_runner_jump', 3, i, 48, 64), x - 24, y - 64);
    }
    return put(c, frame('rambla_runner', 6, Math.floor((this.phase % (Math.PI * 2)) / (Math.PI * 2) * 6), 48, 64), x - 24, y - 64);
  }
  paintRunner(c: any): void {
    const x = RX, y = GY - this.h, air = this.air, ph = this.phase;
    // shadow shrinks with the height
    c.fillStyle = 'rgba(30,10,20,0.35)'; c.beginPath(); c.ellipse(x, GY + 1, 12 * (1 - Math.min(0.5, this.h / 200)), 3.4, 0, 0, 7); c.fill();
    if (this.invul > 0 && Math.floor(this.t * 14) % 2 === 0 && this.state !== 'won') return;   // blinks after a tumble
    if (this.paintRunnerArt(c, x, y)) return;
    c.save(); c.translate(x, y); c.scale(1 - this.squash * 0.35, 1 + this.squash * 0.35); c.translate(0, this.squash > 0 ? 0 : 0);
    const lim = (x0: number, y0: number, a: number, len: number): [number, number] => [x0 + Math.sin(a) * len, y0 + Math.cos(a) * len];
    const limb = (pts: [number, number][], col: string, w: number) => {
      c.lineCap = 'round'; c.lineJoin = 'round';
      c.strokeStyle = INK; c.lineWidth = w + 3; c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.stroke();
      c.strokeStyle = col; c.lineWidth = w; c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.stroke();
    };
    const stumble = this.slow > 0.4 ? 0.35 : 0;
    const legs = [0, 1].map((i) => {
      const s = Math.sin(ph + i * Math.PI);
      const a = air ? (i ? -0.7 : 0.9) : s * 0.95, bend = air ? (i ? 1.5 : 0.3) : 0.55 + 0.55 * Math.cos(ph + i * Math.PI + 0.8);
      const hip: [number, number] = [0, -22], knee = lim(hip[0], hip[1], a, 12), foot = lim(knee[0], knee[1], a - bend, 12);
      return { hip, knee, foot };
    });
    const sh: [number, number] = [0, -40];
    const arms = [0, 1].map((i) => {
      const s = Math.sin(ph + i * Math.PI + Math.PI), a = air ? (i ? -1.9 : -2.4) : -s * 0.9 + 0.1;
      const el = lim(sh[0], sh[1], a, 9), hand = lim(el[0], el[1], a + 1.5 - 0.5 * (air ? 1 : 0), 9);
      return { el, hand };
    });
    limb([legs[1].hip, legs[1].knee, legs[1].foot], '#22252f', 6.5);
    limb([sh, arms[1].el, arms[1].hand], '#e8b58a', 4.5);
    // ponytail
    const sw = Math.sin(ph * 1.3) * 3 + (air ? 5 : 0);
    c.strokeStyle = INK; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(-5, -53); c.quadraticCurveTo(-16, -52 + sw, -19, -44 + sw * 1.4); c.stroke();
    c.strokeStyle = '#5a3420'; c.lineWidth = 5; c.stroke();
    // torso
    c.fillStyle = '#6cb4ee'; c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(-6, -44); c.quadraticCurveTo(0, -48, 7, -44); c.lineTo(6, -22); c.lineTo(-5, -22); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#fff'; c.fillRect(-1, -42, 2.5, 19);
    // head
    c.fillStyle = '#e8b58a'; c.beginPath(); c.arc(1, -52, 8, 0, 7); c.fill(); c.stroke();
    c.fillStyle = '#5a3420'; c.beginPath(); c.arc(0, -54, 8.2, Math.PI * 1.05, Math.PI * 1.95); c.lineTo(0, -54); c.fill();
    c.fillStyle = '#3fa7e0'; c.fillRect(-7, -58, 16, 3.4); c.strokeRect(-7, -58, 16, 3.4);
    c.fillStyle = INK; c.beginPath(); c.arc(4.5, -51, 1.3, 0, 7); c.fill();
    if (this.slow > 0.4) { c.strokeStyle = INK; c.lineWidth = 1.6; c.beginPath(); c.arc(5.5, -47, 2, 0, Math.PI); c.stroke(); } else { c.strokeStyle = INK; c.lineWidth = 1.5; c.beginPath(); c.moveTo(4, -47); c.quadraticCurveTo(6.5, -45, 7.5, -48); c.stroke(); }
    limb([legs[0].hip, legs[0].knee, legs[0].foot], '#2a2d38', 6.5);
    for (const l of legs) { c.fillStyle = '#fff'; c.strokeStyle = INK; c.lineWidth = 2.4; c.beginPath(); c.ellipse(l.foot[0] + 2, l.foot[1] + 1, 5.5, 3.2, 0, 0, 7); c.fill(); c.stroke(); }
    limb([sh, arms[0].el, arms[0].hand], '#e8b58a', 4.5);
    c.restore();
  }
  paintHud(c: any, W: number): void {
    for (let i = 0; i < 3; i++) {
      const x = 18 + i * 22, alive = i < this.lives, pump = alive && this.invul > 1.0 ? 1 + (this.invul - 1) * 0.5 : 1;
      c.save(); c.translate(x, 17); c.scale(pump, pump); c.lineWidth = 2.6; c.strokeStyle = INK; c.fillStyle = alive ? '#ff5470' : 'rgba(40,20,40,0.55)';
      c.beginPath(); c.moveTo(0, 6); c.bezierCurveTo(-12, -2, -7, -11, 0, -5); c.bezierCurveTo(7, -11, 12, -2, 0, 6); c.closePath(); c.fill(); c.stroke(); c.restore();
    }
    // the progress to the finish
    const x0 = 92, x1 = W - 16, k = clamp(this.d / this.len, 0, 1);
    c.fillStyle = 'rgba(30,14,40,0.6)'; c.strokeStyle = INK; c.lineWidth = 2.5; c.beginPath(); c.roundRect ? c.roundRect(x0, 11, x1 - x0, 11, 5) : c.rect(x0, 11, x1 - x0, 11); c.fill(); c.stroke();
    c.fillStyle = '#6cb4ee'; c.beginPath(); c.roundRect ? c.roundRect(x0 + 1.5, 12.5, Math.max(4, (x1 - x0 - 3) * k), 8, 4) : c.rect(x0 + 1.5, 12.5, (x1 - x0 - 3) * k, 8); c.fill();
    c.fillStyle = '#fff'; c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.arc(x0 + 4 + (x1 - x0 - 8) * k, 16.5, 6, 0, 7); c.fill(); c.stroke();
    c.fillStyle = '#ffd24a'; c.font = 'bold 9px sans-serif'; c.textAlign = 'center'; c.fillText('★', x1 - 3, 36);
  }
}
