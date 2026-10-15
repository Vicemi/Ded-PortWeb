// @ts-nocheck
// New minigames of the updated edition. They are the three new kinds of witness of the investigation (phase 1), built on the same Minigame class of the
// original game (opening dialog, help, scores, dialogues of the witness):
//   Maestra      "Memoria de banderas"   find the pairs of flags of the departments
//   Tamborilero  "Ritmo de candombe"     hit the drums with the beat
//   Cartero      "Cartas de Uruguay"     answer questions about the departments (the facts of the notes of the detective)
// A kind of witness only appears when its pictures exist (tools/build_witnesses.py), see content/facts.ts.
import { Minigame } from '../stages/minigame';
import { ItemEvent, ItemImage, ItemText, ItemRect, Rect, pygame } from '../../runtime/prelude';
import * as animations from '../../engine/animations';
import * as assets from '../../engine/assets';
import { drum, blip } from '../../engine/synth';
import * as statcodes from '../data/statcodes';
import { Fx, E, clamp01, heat, gtext, wrap, rr, sun, check, cross, drawFinale } from './fx';
import { makeCandombe } from './candombe';
import { scaled, put, frame, slice3 } from './mgart';

const BX = 104, BY = 74, BW = 335, BH = 272;   // the inside of the board of the minigames (the witness stands over its right edge)
const helpSeen = new Set<string>();             // the help is shown the first time

/** the common part of the new minigames */
export class NewMinigame extends Minigame {
  constructor(stage: any, phase1content: any, witness: any, cfg: any) {
    super(stage, phase1content, witness, statcodes.MG_BRICKLAYER, statcodes.MG_BRICKLAYER_SOLVED, statcodes.MG_BRICKLAYER_NOTSOLVED, 'bricklayer');
    this.id = cfg.id;
    const box = `p1_minigame_flux_${cfg.id}_dialogue1.png`;
    this.witness_minigame_box_image = assets.load_image(assets.has_image(box) ? box : 'p1_minigame_flux_bricklayer_dialogue1.png');
    this.right_sound = assets.load_sound('p1_minigame_right.ogg');
    this.wrong_sound = assets.load_sound('p1_minigame_wrong.ogg');
    this.witness_item = new ItemImage(cfg.x ?? 428, 66, assets.load_image(`p1_minigame_${cfg.id}.png`), null);
    this.happy_name = `p1_minigame_${cfg.id}_happy.png`;
    this.max_help_stages = cfg.help.length;
    this.help = cfg.help;
    this.minigame_solved = false;
    this.start_time = null; this.pause_start_time = null; this.pause_total_time = 0;
    this.title = cfg.title; this.question_intro = cfg.question_intro; this.question = cfg.question;
    this.request_text = cfg.request_text; this.request_question_text = cfg.request_question_text; this.thanks_text = cfg.thanks_text;
    this.maximum_time = 60; this.maximum_time_score = 150;
    this.mistakes = 0;
  }
  level(): number { return this.stage.game.datastore.user_character_progress.range.minigame_level || 1; }
  get_music(): any { return this.phase1content.music_minigame_2; }
  blind_show_minigame_callback(layer: any): any {
    if (!helpSeen.has(this.id)) {
      helpSeen.add(this.id);
      this.stop_minigame(false);
      this.show_help_dialog();
    } else this.start_minigame();
    return null;
  }
  load_help_data(): any {
    const h = this.help[this.help_stage - 1];
    if (this.help_stage === 1) this.help_previous_button.set_visible(false);
    const text = new ItemText(157, 92, this.font_14, 18, h.text, [183, 35, 35], null, 288, 70, 2);
    this.help_current_layer.add(text);
    if (h.draw) this.help_current_layer.add(h.draw(this));
    return null;
  }
  start_minigame(): any {
    this.play_music();
    this.start_play_stats_event();
    if (this.start_time === null) this.start_time = pygame.time.get_ticks();
    else { this.pause_total_time += pygame.time.get_ticks() - this.pause_start_time; this.pause_start_time = null; }
    this.on_start();
    return null;
  }
  stop_minigame(solved: any): any {
    this.end_play_stats_event(solved);
    this.pause_start_time = pygame.time.get_ticks();
    this.stage.stop_timer('new_minigame_tick');
    return null;
  }
  on_start(): void { /* the minigames start their timers here */ }
  set_up_minigame(): any {
    this.layer.add(new ItemImage(89, 62, assets.load_image('p1_minigame_bricklayer_background.png')));
    this.set_up_buttons();
    this.build();
    this.set_up_witness();
    return null;
  }
  build(): void { /* each minigame builds its board */ }
  set_up_buttons(): void {
    const close = new ItemImage(258, 43, assets.load_image('p1_minigames_btn_close_normal.png'));
    close.set_rollover_image(assets.load_image('p1_minigames_btn_close_active.png'), this.rollover_sound);
    close.add_event_handler(ItemEvent.CLICK, () => this.close_click());
    this.layer.add(close);
    const help = new ItemImage(293, 44, assets.load_image('p1_minigames_btn_help_normal.png'));
    help.set_rollover_image(assets.load_image('p1_minigames_btn_help_active.png'), this.rollover_sound);
    help.add_event_handler(ItemEvent.CLICK, (i, a) => this.help_click(i, a));
    this.layer.add(help);
  }
  close_click(): any {
    if (!this.escape_key_event()) {
      this.stop_minigame(false);
      this.phase1content.minigame_solved(false);
      this.close_minigame();
    }
    return null;
  }
  escape_key_event(): any { return null; }
  /** the player did it */
  complete(): void {
    if (this.minigame_solved) return;
    this.minigame_solved = true;
    this.stop_minigame(true);
    this.stage.render();
    this.right_sound.play();
    animations.wait_locked(this.stage, this.end_delay ?? 1100, () => this.minigame_solved_callback());
  }
  elapsed(): number {
    if (this.pause_start_time !== null) { this.pause_total_time += pygame.time.get_ticks() - this.pause_start_time; this.pause_start_time = null; }
    return ((pygame.time.get_ticks() - this.start_time) - this.pause_total_time) / 1000;
  }
  calculate_solved_score(): any {
    const t = this.elapsed();
    const timeScore = t <= this.maximum_time ? this.maximum_time_score * (this.maximum_time - t) / this.maximum_time : 0;
    return [100, Math.max(0, timeScore - this.mistakes * 10)];
  }
  create_character_happy_item(): any {
    const img = assets.has_image(this.happy_name) ? this.happy_name : `p1_minigame_${this.id}.png`;
    return new ItemImage(this.witness_item.get_left() + 5, 66, assets.load_image(img), null);
  }
  /** a rectangle with text on the board */
  box(x: number, y: number, w: number, h: number, text: string, color: number[], bg: number[], font?: any, border = [40, 30, 20]): any {
    const r = new ItemRect(x, y, w, h, font || this.font_14_bld, 16, text, color, bg, border, 2);
    this.layer.add(r);
    return r;
  }
}

// ============================================================================================================================ Memoria de banderas
const FLAG_IDS = ['artigas', 'canelones', 'cerrolargo', 'colonia', 'durazno', 'flores', 'florida', 'lavalleja', 'maldonado', 'montevideo', 'paysandu', 'rionegro', 'rivera', 'rocha', 'salto', 'sanjose', 'soriano', 'tacuarembo', 'treintaytres'];
const CREAM = [244, 236, 210];

/** The cards live on one canvas (the blackboard of the Maestra) that a timer repaints while something moves: deal-in, flips with perspective, hover and press,
 *  shake on a mistake, glow and sparks on a pair, a time bar that changes colour and a result banner with stars. The rules are the same as ever. */
export class MinigameFlags extends NewMinigame {
  constructor(stage: any, phase1content: any, witness: any) {
    super(stage, phase1content, witness, {
      id: 'maestra', title: 'MAESTRA',
      question_intro: 'La Maestra prepara una clase sobre\nlos departamentos de Uruguay y todavía\nno terminó de ordenar el material.',
      question: '¿Te ofreces a ayudarla?',
      request_text: 'Mis alumnos mezclaron las tarjetas\ncon las banderas de los departamentos\ny ahora no encuentro las parejas.',
      request_question_text: '¿Me ayudas a encontrar\nlas banderas que son iguales?',
      thanks_text: '¡Muchas gracias! Mañana los chicos van a aprender un montón.',
      help: [
        { text: 'Cada tarjeta esconde la bandera de un departamento de Uruguay.' },
        { text: 'Haz clic en dos tarjetas para darlas vuelta. Si las banderas son iguales, quedan descubiertas.' },
        { text: 'Si son distintas, se vuelven a tapar: ¡trata de recordar dónde estaba cada una!' },
        { text: 'Cuando encuentres todas las parejas terminas la tarea.' },
      ],
    });
    this.end_delay = 2600;   // the banner with the stars needs a moment
  }
  build(): void {
    const level = this.level();
    const cols = level >= 3 ? 5 : 4, rows = level === 1 ? 3 : 4, gap = rows === 3 ? 10 : 7;
    this.maximum_time = level === 1 ? 45 : level === 2 ? 70 : 100; this.maximum_time_score = level === 1 ? 150 : 200;
    const ds = this.stage.game.datastore;
    const names = {};
    for (const d of ds.list_departments) names[d.image] = d.name;
    const ids = FLAG_IDS.filter((id) => assets.has_image(`p0_flag_${id}.png`));
    for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
    const pairs = Math.floor(cols * rows / 2), deck = [];
    for (let i = 0; i < pairs; i++) deck.push(ids[i], ids[i]);
    if (deck.length < cols * rows) deck.push(ids[pairs]);   // (an odd board has one extra card that is a free pair of its own)
    for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
    // the grid: big cards (the hit area of a card also covers half of the gap around it, so a touch never falls between two cards)
    const GW = 307, GH = 184, GY = 40;
    const cw = Math.floor((GW - (cols - 1) * gap) / cols), ch = Math.floor((GH - (rows - 1) * gap) / rows);
    const x0 = Math.floor((BW - (cols * cw + (cols - 1) * gap)) / 2), y0 = GY + Math.floor((GH - (rows * ch + (rows - 1) * gap)) / 2);
    this.cw = cw; this.ch = ch; this.gap = gap; this.names = names;
    this.surface = new pygame.Surface([BW, BH], pygame.SRCALPHA, 32);
    this.view = new ItemImage(BX, BY, new assets.Image(this.surface));
    this.view.add_event_handler(ItemEvent.CLICK, (item, args) => this.clicked(args.x - BX, args.y - BY));
    this.layer.add(this.view);
    this.fx = new Fx();
    this.bg = this.makeBackground();
    const back = this.cardCanvas(null, cw, ch), faces = {};
    this.cards = []; this.open = []; this.found = 0; this.total_pairs = Math.floor(deck.length / 2);
    deck.forEach((id, i) => {
      faces[id] = faces[id] || this.cardCanvas(id, cw, ch);
      this.cards.push({ i, flag: id, x: x0 + (i % cols) * (cw + gap), y: y0 + Math.floor(i / cols) * (ch + gap), back, face: faces[id], state: 0, from: 0, to: 0, ft: -1e9, fv: 0, h: 0, press: 0, sk: -1e9, glow: -1e9, bad: -1e9 });
    });
    this.clock = 0; this.playing = false; this.dealAt = 1e12; this.busy = false; this.backAt = 0; this.fire = null; this.finish = null;
    this.msg = ''; this.msgT = -1e9; this.msgUntil = 0; this.msgGold = false; this.errT = -1e9; this.hover = -1; this.mx = -1; this.my = -1; this.sig = -1;
    this.last = pygame.time.get_ticks();
    this.stage.start_timer('new_minigame_anim', 33, () => this.tick(), null, true, false);
    this.draw(this.last);
  }
  on_start(): void { this.playing = true; if (this.dealAt > 1e11) this.dealAt = pygame.time.get_ticks(); }
  stop_minigame(solved: any): any { this.playing = false; return super.stop_minigame(solved); }
  note(text: string, ms = 1400, gold = false): void { this.msg = text; this.msgT = pygame.time.get_ticks(); this.msgUntil = this.msgT + ms; this.msgGold = gold; }

  // ---------------------------------------------------------------------------------------------------------------------------- pictures (made once)
  makeBackground(): any {
    const art = scaled('banderas_bg', BW, BH);
    if (art) return art;
    const s = new pygame.Surface([BW, BH], pygame.SRCALPHA, 32), c = s.ctx;
    let g = c.createLinearGradient(0, 0, 0, BH); g.addColorStop(0, '#8d5d2c'); g.addColorStop(1, '#5b3716');
    c.fillStyle = g; rr(c, 0, 0, BW, BH, 9); c.fill();
    c.strokeStyle = 'rgba(40,20,5,0.22)'; c.lineWidth = 1;
    for (let i = 0; i < 26; i++) { const y = (i * 13.7) % BH; c.beginPath(); c.moveTo(0, y); c.bezierCurveTo(BW * 0.3, y + 3, BW * 0.6, y - 3, BW, y + 1); c.stroke(); }
    g = c.createLinearGradient(0, 8, 0, BH - 8); g.addColorStop(0, '#316b53'); g.addColorStop(1, '#1d4838');
    c.fillStyle = g; rr(c, 7, 7, BW - 14, BH - 14, 4); c.fill();
    c.lineWidth = 3; c.strokeStyle = '#12302a'; c.stroke();
    // chalk dust (deterministic blots)
    for (let i = 0; i < 16; i++) {
      const x = (i * 97) % (BW - 30) + 15, y = (i * 53) % (BH - 60) + 14, r = 14 + (i * 7) % 22;
      c.fillStyle = `rgba(255,255,255,${0.025 + (i % 3) * 0.012})`; c.beginPath(); c.ellipse(x, y, r * 1.6, r * 0.7, (i % 5) * 0.4, 0, Math.PI * 2); c.fill();
    }
    // the ledge with a piece of chalk
    c.fillStyle = '#a56d33'; c.fillRect(7, BH - 22, BW - 14, 13); c.strokeStyle = '#3b2108'; c.lineWidth = 2; c.strokeRect(7, BH - 22, BW - 14, 13);
    c.fillStyle = 'rgba(255,230,170,0.35)'; c.fillRect(9, BH - 21, BW - 18, 3);
    c.fillStyle = '#f6f2e6'; rr(c, 30, BH - 27, 24, 6, 2); c.fill(); c.lineWidth = 1.5; c.strokeStyle = '#6b6252'; c.stroke();
    c.fillStyle = '#6b4a2a'; rr(c, BW - 78, BH - 30, 40, 9, 2); c.fill(); c.fillStyle = '#d9c9a2'; c.fillRect(BW - 78, BH - 26, 40, 5);
    return s.canvas;
  }
  /** the back (id = null) or the front of a card */
  cardCanvas(id: string | null, w: number, h: number): any {
    const art = id === null ? scaled('banderas_cardback', w, h) : null;
    if (art) return art;
    const s = new pygame.Surface([w, h], pygame.SRCALPHA, 32), c = s.ctx;
    if (id === null) {
      const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#3f6fd0'); g.addColorStop(1, '#25469a');
      c.fillStyle = g; rr(c, 0, 0, w, h, 5); c.fill();
      c.save(); rr(c, 1, 1, w - 2, h - 2, 4); c.clip();
      c.strokeStyle = 'rgba(255,255,255,0.22)'; c.lineWidth = 2;
      for (let k = -h; k < w; k += 9) { c.beginPath(); c.moveTo(k, h); c.lineTo(k + h, 0); c.stroke(); }
      c.restore();
      sun(c, w / 2, h / 2, Math.min(w, h) * 0.3);
      rr(c, 4, 4, w - 8, h - 8, 3); c.lineWidth = 1.5; c.strokeStyle = 'rgba(255,255,255,0.55)'; c.stroke();
    } else {
      c.fillStyle = '#fff'; rr(c, 0, 0, w, h, 5); c.fill();
      c.save(); rr(c, 2, 2, w - 4, h - 4, 3); c.clip();
      c.imageSmoothingQuality = 'high';
      c.drawImage(assets.load_image(`p0_flag_${id}.png`).surface.canvas, 2, 2, w - 4, h - 4);
      const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, 'rgba(255,255,255,0.28)'); g.addColorStop(0.45, 'rgba(255,255,255,0)');
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      c.restore();
    }
    if (id !== null && put(c, scaled('banderas_frame', w, h), 0, 0)) return s.canvas;   // the frame art replaces the outline
    rr(c, 1.5, 1.5, w - 3, h - 3, 5); c.lineWidth = 3; c.strokeStyle = '#1a140c'; c.stroke();
    return s.canvas;
  }

  // ---------------------------------------------------------------------------------------------------------------------------- play
  cardAt(x: number, y: number): number {
    const g = this.gap / 2;
    for (const k of this.cards) if (k.state === 0 && x >= k.x - g && x < k.x + this.cw + g && y >= k.y - g && y < k.y + this.ch + g) return k.i;
    return -1;
  }
  clicked(x: number, y: number): any {
    const i = this.cardAt(x, y);
    if (i >= 0) this.flip(this.cards[i]);
    return null;
  }
  /** where a card is on the screen (for the scenarios) */
  screenPos(card: any): [number, number] { return [BX + card.x + Math.floor(this.cw / 2), BY + card.y + Math.floor(this.ch / 2)]; }
  flipTo(card: any, to: number, now: number): void {
    const k = Math.min(1, (now - card.ft) / 300);
    card.from = card.from + (card.to - card.from) * E.inOut(k); card.to = to; card.ft = now;
  }
  flip(card: any): any {
    if (this.minigame_solved || this.busy || card.state !== 0 || this.open.length >= 2) return null;
    const now = pygame.time.get_ticks();
    card.state = 1; this.flipTo(card, 1, now); this.open.push(card);
    blip(540 + Math.random() * 120, 0.05, 0.1, 'triangle');
    if (this.names[card.flag]) this.note(this.names[card.flag].toUpperCase(), 1800);
    if (this.open.length === 2) {
      const [a, b] = this.open;
      if (a.flag === b.flag) {
        a.state = b.state = 2; this.open = []; this.found++;
        a.glow = b.glow = now + 280;
        this.fire = [now + 280, a, b];
        this.note('¡PAREJA! ' + (this.names[a.flag] || '').toUpperCase(), 2000, true);
        if (this.found >= this.total_pairs) { this.complete(); this.finish = { t: now + 700, sparked: [false, false, false] }; } else this.right_sound.play();
      } else {
        this.mistakes++; this.busy = true; this.backAt = now + 850; this.errT = now;
        a.bad = b.bad = now + 300; a.sk = b.sk = now + 300;
        blip(190, 0.18, 0.3);
        this.fx.flash('255,70,60', 0.45, 0.35);
      }
    }
    return null;
  }
  tick(): void {
    if (!this.layer.get_stage()) { this.stage.stop_timer('new_minigame_anim'); return; }   // the minigame was closed
    const now = pygame.time.get_ticks(), dt = Math.min(0.1, (now - this.last) / 1000); this.last = now;
    if (this.playing && !this.minigame_solved) this.clock += dt;
    this.fx.update(dt);
    if (this.busy && now >= this.backAt) {
      for (const c of this.open) { c.state = 0; this.flipTo(c, 0, now); }
      this.open = []; this.busy = false; this.note('Busca las parejas', 300);
    }
    if (this.fire && now >= this.fire[0]) {
      for (let i = 1; i < 3; i++) {
        const k = this.fire[i], x = k.x + this.cw / 2, y = k.y + this.ch / 2;
        this.fx.parts.burst(x, y, 12, ['#ffe27a', '#ffffff', '#7fe06a'], { speed: 120, kind: 1, size: 2.6, life: 0.8, up: 30 });
        this.fx.parts.burst(x, y, 1, ['#ffe27a'], { kind: 3, speed: 0, size: 8, life: 0.45, g: 0 });
      }
      this.fx.float('¡Pareja!', (this.fire[1].x + this.fire[2].x + this.cw) / 2, (this.fire[1].y + this.fire[2].y + this.ch) / 2, this.font_24, [255, 226, 120], { life: 1.0 });
      this.fire = null;
    }
    if (this.finish && !this.finish.boom && now >= this.finish.t) { this.finish.boom = true; this.fx.confetti(BW / 2, 70, 70); }
    // hover / press (the mouse; on a touch screen there is no hover, the press still shows)
    const [mx, my] = pygame.mouse.get_pos(), down = pygame.mouse.get_pressed()[0];
    const hv = this.playing && !this.busy && !this.minigame_solved && this.open.length < 2 ? this.cardAt(mx - BX, my - BY) : -1;
    if (hv !== this.hover && hv >= 0 && (mx !== this.mx || my !== this.my)) this.rollover_sound.play();
    this.hover = hv; this.mx = mx; this.my = my;
    let moving = this.fx.busy || this.finish !== null || this.busy || this.fire !== null || now - this.dealAt < 380 + this.cards.length * 40 || now - this.msgT < 450;
    const k1 = Math.min(1, dt * 14);
    for (const k of this.cards) {
      const th = k.i === hv ? 1 : 0, tp = k.i === hv && down ? 1 : 0;
      k.h += (th - k.h) * k1; k.press += (tp - k.press) * k1;
      if (Math.abs(th - k.h) < 0.02) k.h = th; if (Math.abs(tp - k.press) < 0.02) k.press = tp;
      if (k.h !== th || k.press !== tp || now - k.ft < 320 || now - k.sk < 480 || now - k.glow < 1000) moving = true;
    }
    const sig = Math.floor(this.clock * 4) * 64 + hv + 1;
    if (!moving && sig === this.sig) return;
    this.sig = sig;
    this.draw(now);
  }

  // ---------------------------------------------------------------------------------------------------------------------------- painting
  drawCard(c: any, k: any, now: number): void {
    const cw = this.cw, ch = this.ch;
    const ds = Math.min(1, Math.max(0, (now - this.dealAt - k.i * 40) / 380));
    if (ds <= 0) return;
    const fk = Math.min(1, Math.max(0, (now - k.ft) / 300)), fv = k.from + (k.to - k.from) * E.inOut(fk);
    const sf = Math.sin(fv * Math.PI), sx = Math.max(0.04, Math.abs(Math.cos(fv * Math.PI)));
    const sc = E.outBack(ds) * (1 + sf * 0.14 + k.h * 0.07 - k.press * 0.07);
    let lift = sf * 6 + k.h * 2.5, dx = 0;
    const sa = now - k.sk, ga = now - k.glow;
    if (sa >= 0 && sa < 480) dx = Math.sin(sa / 17) * 5 * (1 - sa / 480);
    if (ga >= 0 && ga < 500) lift += Math.sin(ga / 500 * Math.PI) * 5;
    c.save();
    c.translate(k.x + cw / 2 + dx, k.y + ch / 2 - lift - (1 - ds) * 26);
    c.scale(sc * sx, sc);
    c.fillStyle = 'rgba(0,0,0,0.32)'; rr(c, -cw / 2 + 2, -ch / 2 + 3 + lift * 0.5, cw, ch, 5); c.fill();
    c.drawImage(fv > 0.5 ? k.face : k.back, -cw / 2, -ch / 2);
    if (sx < 0.95) { c.fillStyle = `rgba(0,0,0,${((1 - sx) * 0.35).toFixed(3)})`; rr(c, -cw / 2, -ch / 2, cw, ch, 5); c.fill(); }
    const ba = now - k.bad;
    if (ba >= 0 && ba < 850) { c.fillStyle = `rgba(255,40,30,${(0.34 * (1 - ba / 850)).toFixed(3)})`; rr(c, -cw / 2, -ch / 2, cw, ch, 5); c.fill(); }
    if (k.h > 0.02 && k.state === 0) { rr(c, -cw / 2 + 1, -ch / 2 + 1, cw - 2, ch - 2, 5); c.lineWidth = 2.5; c.strokeStyle = `rgba(255,214,90,${k.h.toFixed(3)})`; c.stroke(); }
    if (k.state === 2 && ga >= 0) {
      if (ga < 900) { rr(c, -cw / 2 - 1, -ch / 2 - 1, cw + 2, ch + 2, 6); c.lineWidth = 3.5; c.strokeStyle = `rgba(255,226,110,${(1 - ga / 900).toFixed(3)})`; c.stroke(); }
      if (ga >= 500) {
        const e = E.outBack(Math.min(1, (ga - 500) / 250)), bx = cw / 2 - 6, by = -ch / 2 + 6;
        c.beginPath(); c.arc(bx, by, 7 * e, 0, Math.PI * 2); c.fillStyle = '#3fb54e'; c.fill(); c.lineWidth = 2; c.strokeStyle = '#143a18'; c.stroke();
        check(c, bx, by + 0.5, 3.2 * e, '#fff', 2);
      }
    }
    c.restore();
  }
  draw(now: number): void {
    const c = this.surface.ctx, W = BW;
    c.drawImage(this.bg, 0, 0);
    const fx = this.fx;
    c.save(); c.translate(fx.sx, fx.sy);
    // the strip of the chalk: pairs, time and mistakes
    const f14 = this.font_14_bld, sh = [10, 30, 22];
    gtext(c, f14, `Parejas ${this.found}/${this.total_pairs}`, 16, 19, CREAM, { shadow: sh, dx: 1, dy: 1 });
    const t = Math.floor(this.clock);
    gtext(c, f14, `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`, W / 2, 19, CREAM, { align: 'c', shadow: sh, dx: 1, dy: 1 });
    const eb = clamp01((now - this.errT) / 320);
    gtext(c, f14, `Errores ${this.mistakes}`, W - 16, 19, this.mistakes ? [255, 160, 140] : CREAM, { align: 'r', scale: 1 + 0.45 * (1 - E.out(eb)), shadow: sh, dx: 1, dy: 1 });
    // the time bar (the time score of the minigame goes down with the clock)
    const frac = clamp01(1 - this.clock / this.maximum_time);
    c.fillStyle = 'rgba(0,0,0,0.38)'; rr(c, 16, 29, 303, 5, 2.5); c.fill();
    if (frac > 0) { c.fillStyle = heat(frac); rr(c, 16, 29, Math.max(5, 303 * frac), 5, 2.5); c.fill(); }
    if (frac > 0 && frac < 0.2) { c.fillStyle = `rgba(255,80,60,${(0.15 + 0.15 * Math.sin(now / 120)).toFixed(3)})`; rr(c, 14, 27, 307, 9, 4); c.fill(); }
    // the cards: the ones that are quiet first, those that turn or are touched on top
    for (let pass = 0; pass < 2; pass++) {
      for (const k of this.cards) {
        const z = now - k.ft < 320 || k.h > 0.02 || k.press > 0.02 || now - k.glow < 520 || now - k.sk < 480;
        if ((pass === 1) === z) this.drawCard(c, k, now);
      }
    }
    // the line under the cards: the department that was turned over
    if (this.msg && now < this.msgUntil + 250) {
      const a = clamp01((this.msgUntil + 250 - now) / 250), pop = E.outBack(clamp01((now - this.msgT) / 220));
      gtext(c, this.font_18, this.msg, W / 2, BH - 33, this.msgGold ? [255, 220, 100] : CREAM, { align: 'c', scale: 0.7 + 0.3 * pop, alpha: a, shadow: [10, 30, 22] });
    }
    c.restore();
    if (this.finish) {
      const e = this.mistakes <= 1 ? 3 : this.mistakes <= Math.ceil(this.total_pairs * 0.6) ? 2 : 1;
      drawFinale(c, W, BH, fx, this.font_24, f14, this.finish, now, '¡CLASE LISTA!', e, this.mistakes ? `Errores: ${this.mistakes}` : '¡Sin errores!');
    }
    fx.draw(c);
    fx.drawFlash(c, 0, 0, W, BH);
  }
}

// ============================================================================================================================ Ritmo de candombe (src/game/minigames/candombe.ts)
export const MinigameCandombe = makeCandombe(NewMinigame);

// ============================================================================================================================ Cartas de Uruguay (trivia)
const OPT_COL = [[214, 72, 60], [58, 118, 210], [70, 164, 88], [226, 150, 36]];
const OX = 14, OY = 130, OW = 150, OH = 62, OG = 6;      // the four answers, two by two (big targets)
const CX = 14, CY = 52, CW = 307, CH = 70;                // the letter with the question
const PRAISE = ['¡Correcto!', '¡Así es!', '¡Muy bien!', '¡Entregada!'];

/** The letters live on one canvas (an airmail envelope) that a timer repaints while something moves: the letter flies in and out, the answers pop in, lift on
 *  hover and press, shake on a mistake, a stamp slams on a right answer, a time bar changes colour and a banner with stars closes the game. */
export class MinigameTrivia extends NewMinigame {
  constructor(stage: any, phase1content: any, witness: any) {
    super(stage, phase1content, witness, {
      id: 'cartero', title: 'CARTERO',
      question_intro: 'El Cartero tiene una pila de cartas y\nno sabe a qué departamento va cada una.',
      question: '¿Te ofreces a ayudarlo?',
      request_text: 'Se me mojaron los sobres y\nno se lee nada de las direcciones.',
      request_question_text: '¿Me ayudas a repartir las cartas\nrespondiendo unas preguntas?',
      thanks_text: '¡Gracias! Hoy todas las cartas llegan a su destino.',
      help: [
        { text: 'Cada carta trae una pregunta sobre Uruguay: sus lugares, su historia y su gente.' },
        { text: 'Elige el departamento correcto haciendo clic en una de las cuatro opciones.' },
        { text: 'Si te equivocas puedes probar otra vez, pero la tarea terminará más tarde.' },
      ],
    });
    this.end_delay = 2600;
  }
  build(): void {
    const level = this.level(), n = level === 1 ? 4 : level === 2 ? 5 : 6;
    this.maximum_time = 20 * n; this.maximum_time_score = 150;
    this.questions = this.makeQuestions(n);
    if (!this.questions.length) this.questions.push({ text: '¿En qué departamento queda Montevideo?', options: ['Montevideo', 'Salto', 'Rocha', 'Durazno'], answer: 0 });
    this.index = 0; this.streak = 0; this.clean = true;
    this.surface = new pygame.Surface([BW, BH], pygame.SRCALPHA, 32);
    this.view = new ItemImage(BX, BY, new assets.Image(this.surface));
    this.view.add_event_handler(ItemEvent.CLICK, (item, args) => this.clicked(args.x - BX, args.y - BY));
    this.layer.add(this.view);
    this.fx = new Fx();
    this.bg = this.makeBackground();
    this.clock = 0; this.playing = false; this.qT = 1e12; this.phase = 'ask'; this.phaseEnd = 0; this.finish = null;
    this.opt = [0, 1, 2, 3].map(() => ({ h: 0, press: 0, state: 0, t: -1e9 }));
    this.pipT = this.questions.map(() => -1e9);
    this.hover = -1; this.mx = -1; this.my = -1; this.sig = -1; this.streakT = -1e9; this.errT = -1e9; this.cardShake = -1e9; this.stampT = -1e9;
    this.last = pygame.time.get_ticks();
    this.prepare();
    this.stage.start_timer('new_minigame_anim', 33, () => this.tick(), null, true, false);
    this.draw(this.last);
  }
  on_start(): void { this.playing = true; if (this.qT > 1e11) this.qT = pygame.time.get_ticks(); }
  stop_minigame(solved: any): any { this.playing = false; return super.stop_minigame(solved); }
  /** questions from the notes of the detective: the department of a fact, a writer, a town, a river or a hill */
  makeQuestions(n: number): any[] {
    const ds = this.stage.game.datastore;
    const all = ds.list_departments.map((d) => d.name);
    const out = [];
    const add = (text: string, valid: string[]) => {
      const names = valid.filter((v) => v);
      if (!names.length) return;
      const wrong = all.filter((d) => !names.includes(d));
      for (let i = wrong.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [wrong[i], wrong[j]] = [wrong[j], wrong[i]]; }
      const right = names[Math.floor(Math.random() * names.length)];
      const opts = [right, ...wrong.slice(0, 3)];
      for (let i = opts.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [opts[i], opts[j]] = [opts[j], opts[i]]; }
      out.push({ text, options: opts, answer: opts.indexOf(right) });
    };
    const pool = [];
    for (const f of ds.list_history_facts) pool.push(() => add(`¿En qué departamento ${f.sentence_start} ${f.article} ${f.name}?`, f.get_departments().map((d) => d.name)));
    for (const w of ds.list_writers) pool.push(() => add(`¿De qué departamento es ${w.name} ${w.dates}?`, [w.department.name]));
    for (const l of ds.list_locations) pool.push(() => add(`¿En qué departamento queda ${l.name}?`, [l.department.name]));
    for (const r of ds.list_rivers) pool.push(() => add(`¿Por qué departamento pasa el ${r.name}?`, r.get_departments().map((d) => d.name)));
    for (const h of ds.list_hills) pool.push(() => add(`¿En qué departamento está el ${h.name}?`, [h.department.name]));
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    for (const make of pool) { if (out.length >= n) break; make(); }
    return out;
  }
  /** the lines of the question of this letter (the text is wrapped once per letter) */
  prepare(): void {
    const q = this.questions[this.index];
    let f = this.font_18, lines = wrap(f, q.text, 232);
    if (lines.length > 3) { f = this.font_14_bld; lines = wrap(f, q.text, 232); }
    this.qfont = f; this.qlines = lines;
  }
  show(): void {
    this.prepare();
    this.qT = pygame.time.get_ticks(); this.phase = 'ask';
    for (const o of this.opt) { o.state = 0; o.t = -1e9; o.h = 0; o.press = 0; }
  }
  optRect(i: number): [number, number] { return [OX + (i % 2) * (OW + OG), OY + (i >> 1) * (OH + OG)]; }
  /** the centre of an answer on the screen (for the scenarios) */
  screenPos(i: number): [number, number] { const [x, y] = this.optRect(i); return [BX + x + OW / 2, BY + y + OH / 2]; }
  /** the answer under a point of the board; the hit area also takes the gaps and a margin, so a touch never falls between two answers */
  hit(x: number, y: number): number {
    if (x < OX - 6 || x > OX + 2 * OW + OG + 6 || y < OY - 6 || y > OY + 2 * OH + OG + 6) return -1;
    return (y < OY + OH + OG / 2 ? 0 : 2) + (x < OX + OW + OG / 2 ? 0 : 1);
  }
  clicked(x: number, y: number): any {
    const i = this.hit(x, y);
    if (i >= 0) this.pick(i);
    return null;
  }
  minigame_handle_event(e: any): any {
    if (e.type === pygame.KEYDOWN) {
      const ch = String.fromCharCode(e.key).toLowerCase(), i = '1234'.indexOf(ch) >= 0 ? '1234'.indexOf(ch) : 'abcd'.indexOf(ch);
      if (i >= 0) { this.pick(i); return true; }
    }
    return null;
  }
  pick(i: number): any {
    if (this.minigame_solved || this.phase !== 'ask' || !this.playing) return null;
    const q = this.questions[this.index], o = this.opt[i];
    if (o.state === 2) return null;
    const now = pygame.time.get_ticks(), [rx, ry] = this.optRect(i), x = rx + OW / 2, y = ry + 6;
    o.t = now;
    if (i === q.answer) {
      o.state = 1;
      if (this.clean) { this.streak++; if (this.streak >= 2) this.streakT = now; }
      this.clean = true;
      this.phase = 'right'; this.phaseEnd = now + 600; this.stampT = now; this.pipT[this.index] = now;
      this.right_sound.play();
      this.fx.parts.burst(x, y + 20, 22, ['#ffd84a', '#7fe06a', '#ffffff', '#ffa83a'], { speed: 170, up: 60, size: 3, kind: 1, life: 0.9 });
      this.fx.parts.burst(x, y + 20, 1, ['#7fe06a'], { kind: 3, speed: 0, size: 8, life: 0.5, g: 0 });
      this.fx.float(this.streak >= 3 ? `¡Racha de ${this.streak}!` : PRAISE[this.index % PRAISE.length], x, y - 4, this.font_24, [255, 232, 120], { life: 1.1 });
    } else {
      o.state = 2;
      this.mistakes++; this.streak = 0; this.clean = false; this.errT = now; this.cardShake = now;
      blip(180, 0.18, 0.3);
      this.fx.flash('255,70,60', 0.45, 0.35); this.fx.shake(3, 0.3);
      this.fx.parts.burst(x, y + 20, 10, ['#ff5a4a', '#c43030', '#ffb0a0'], { speed: 110, size: 2.5, life: 0.5, g: 200 });
      this.fx.float('Otra vez', x, y - 4, this.font_14_bld, [255, 140, 120], { life: 0.9 });
    }
    return null;
  }
  tick(): void {
    if (!this.layer.get_stage()) { this.stage.stop_timer('new_minigame_anim'); return; }   // the minigame was closed
    const now = pygame.time.get_ticks(), dt = Math.min(0.1, (now - this.last) / 1000); this.last = now;
    if (this.playing && !this.minigame_solved) this.clock += dt;
    this.fx.update(dt);
    if (this.phase === 'right' && now >= this.phaseEnd) {
      if (this.index + 1 >= this.questions.length) {
        this.phase = 'done'; this.complete();
        this.finish = { t: now, sparked: [false, false, false] };
        this.fx.confetti(BW / 2, 60, 70);
      } else { this.phase = 'out'; this.phaseEnd = now + 260; }
    } else if (this.phase === 'out' && now >= this.phaseEnd) { this.index++; this.show(); }
    const [mx, my] = pygame.mouse.get_pos(), down = pygame.mouse.get_pressed()[0];
    const hv = this.playing && this.phase === 'ask' && now - this.qT > 300 ? this.hit(mx - BX, my - BY) : -1;
    if (hv !== this.hover && hv >= 0 && (mx !== this.mx || my !== this.my)) this.rollover_sound.play();
    this.hover = hv; this.mx = mx; this.my = my;
    let moving = this.fx.busy || this.finish !== null || this.phase !== 'ask' || now - this.qT < 1000 || now - this.cardShake < 400 || now - this.streakT < 500 || now - this.errT < 400;
    const k1 = Math.min(1, dt * 14);
    for (let i = 0; i < 4; i++) {
      const o = this.opt[i], th = i === hv ? 1 : 0, tp = i === hv && down ? 1 : 0;
      o.h += (th - o.h) * k1; o.press += (tp - o.press) * k1;
      if (Math.abs(th - o.h) < 0.02) o.h = th; if (Math.abs(tp - o.press) < 0.02) o.press = tp;
      if (o.h !== th || o.press !== tp || now - o.t < 450) moving = true;
    }
    const sig = Math.floor(this.clock * 4) * 8 + hv + 1;
    if (!moving && sig === this.sig) return;
    this.sig = sig;
    this.draw(now);
  }

  // ---------------------------------------------------------------------------------------------------------------------------- painting
  makeBackground(): any {
    const art = scaled('cartero_bg', BW, BH);
    if (art) return art;
    const s = new pygame.Surface([BW, BH], pygame.SRCALPHA, 32), c = s.ctx;
    const g = c.createLinearGradient(0, 0, 0, BH); g.addColorStop(0, '#f1e6c0'); g.addColorStop(1, '#e4d3a0');
    c.fillStyle = g; rr(c, 0, 0, BW, BH, 8); c.fill();
    // the airmail border: slanted red and blue stripes
    c.save();
    c.beginPath(); rr(c, 0, 0, BW, BH, 8, false); rr(c, 8, 8, BW - 16, BH - 16, 3, false); c.clip('evenodd');
    c.translate(BW / 2, BH / 2); c.rotate(0.6);
    for (let k = -30; k < 30; k++) { c.fillStyle = '#d23c3c'; c.fillRect(k * 24, -400, 8, 800); c.fillStyle = '#2e56b0'; c.fillRect(k * 24 + 12, -400, 8, 800); c.fillStyle = '#fbf4e0'; c.fillRect(k * 24 + 8, -400, 4, 800); c.fillRect(k * 24 + 20, -400, 4, 800); }
    c.restore();
    c.lineWidth = 3; c.strokeStyle = '#3b2610'; rr(c, 1.5, 1.5, BW - 3, BH - 3, 8); c.stroke(); rr(c, 8, 8, BW - 16, BH - 16, 3); c.lineWidth = 2; c.stroke();
    // faint rules of the paper
    c.strokeStyle = 'rgba(120,90,40,0.12)'; c.lineWidth = 1;
    for (let y = 30; y < BH - 10; y += 22) { c.beginPath(); c.moveTo(12, y); c.lineTo(BW - 12, y); c.stroke(); }
    return s.canvas;
  }
  drawOpt(c: any, i: number, now: number, ex: number): void {
    const q = this.questions[this.index], o = this.opt[i], [rx, ry] = this.optRect(i);
    const a = Math.min(1, Math.max(0, (now - this.qT - 140 - i * 70) / 380));
    if (a <= 0) return;
    const alpha = a * (1 - ex) * (this.phase !== 'ask' && o.state !== 1 ? 0.5 : 1);
    if (alpha <= 0) return;
    const e = E.outBack(a), sa = now - o.t;
    let dx = 0;
    if (o.state === 2 && sa < 450) dx = Math.sin(sa / 16) * 6 * (1 - sa / 450);
    const lift = o.h * 3 + (o.state === 1 ? Math.sin(Math.min(1, sa / 400) * Math.PI) * 5 : 0);
    const sc = (0.7 + 0.3 * e) * (1 + o.h * 0.03 - o.press * 0.05) * (o.state === 1 ? 1 + 0.05 * Math.sin(Math.min(1, sa / 400) * Math.PI) : 1);
    c.save(); c.globalAlpha = alpha;
    c.translate(rx + OW / 2 + dx, ry + OH / 2 - lift + (1 - a) * 14); c.scale(sc, sc);
    c.fillStyle = 'rgba(40,20,0,0.28)'; rr(c, -OW / 2 + 2, -OH / 2 + 4, OW, OH, 11); c.fill();
    const fill = o.state === 1 ? '#7ed070' : o.state === 2 ? '#ee8e82' : o.h > 0.5 ? '#fff7de' : '#f6ebc8';
    rr(c, -OW / 2, -OH / 2, OW, OH, 11); c.fillStyle = fill; c.fill();
    rr(c, -OW / 2 + 3, -OH / 2 + 3, OW - 6, OH * 0.42, 8); c.fillStyle = 'rgba(255,255,255,0.38)'; c.fill();
    rr(c, -OW / 2, -OH / 2, OW, OH, 11); c.lineWidth = 3; c.strokeStyle = o.state === 1 ? '#1c5a1c' : o.state === 2 ? '#6a1c14' : o.h > 0.02 ? `rgb(${(59 + o.h * 190) | 0},${(38 + o.h * 140) | 0},16)` : '#3b2610'; c.stroke();
    // the letter badge (a check or a cross once answered)
    const bx = -OW / 2 + 22;
    c.beginPath(); c.arc(bx, 0, 13, 0, Math.PI * 2); c.fillStyle = o.state === 1 ? '#2f9b3c' : o.state === 2 ? '#b8281c' : `rgb(${OPT_COL[i].join(',')})`; c.fill(); c.lineWidth = 2.5; c.strokeStyle = '#2a1608'; c.stroke();
    if (o.state === 1) check(c, bx, 0.5, 5.5, '#fff', 3); else if (o.state === 2) cross(c, bx, 0, 4.8, '#fff', 3);
    else gtext(c, this.font_14_bld, 'ABCD'[i], bx, 0, [255, 255, 255], { align: 'c', shadow: [40, 20, 0], dx: 1, dy: 1 });
    // the department (it shrinks to fit)
    const f = this.font_14_bld, txt = q.options[i], w = f.size(txt)[0], avail = OW - 52;
    gtext(c, f, txt, 18, 0, o.state === 1 ? [18, 70, 18] : o.state === 2 ? [110, 30, 20] : [48, 30, 10], { align: 'c', scale: w > avail ? avail / w : 1 });
    c.restore();
  }
  draw(now: number): void {
    const c = this.surface.ctx, W = BW, fx = this.fx, f13 = this.font_13_bld;
    c.drawImage(this.bg, 0, 0);
    const n = this.questions.length, ex = this.phase === 'out' ? Math.min(1, 1 - (this.phaseEnd - now) / 260) : 0;
    // header: which letter, the streak, the mistakes and a stamp for each letter delivered
    gtext(c, f13, `CARTA ${Math.min(this.index + 1, n)} DE ${n}`, 16, 20, [100, 62, 14]);
    if (this.streak >= 2) gtext(c, f13, `Racha x${this.streak}`, 118, 20, [214, 96, 20], { scale: 1 + 0.5 * (1 - E.out(Math.min(1, (now - this.streakT) / 400))) });
    if (this.mistakes) gtext(c, f13, `Errores ${this.mistakes}`, 184, 20, [176, 40, 30], { scale: 1 + 0.5 * (1 - E.out(Math.min(1, (now - this.errT) / 350))) });
    for (let k = 0; k < n; k++) {
      const px = 318 - (n - 1 - k) * 15, pt = (now - this.pipT[k]) / 320, done = this.pipT[k] > -1e8;
      c.beginPath(); c.arc(px, 20, 6, 0, Math.PI * 2); c.fillStyle = done ? '#3fb54e' : 'rgba(255,255,255,0.55)'; c.fill(); c.lineWidth = 2; c.strokeStyle = '#3b2610'; c.stroke();
      if (done && !put(c, frame('cartero_stamps', 4, k, 14, 17), px - 7, 11.5)) check(c, px, 20.5, 2.6 * E.outBack(Math.min(1, pt)), '#fff', 1.8);
    }
    // the time bar (the time score goes down with the clock)
    const frac = clamp01(1 - this.clock / this.maximum_time);
    if (!put(c, scaled('cartero_bag', 20, 20), 14, 28)) {
    c.beginPath(); c.arc(24, 38, 7, 0, Math.PI * 2); c.fillStyle = '#fff6dc'; c.fill(); c.lineWidth = 2; c.strokeStyle = '#3b2610'; c.stroke();
    c.beginPath(); c.moveTo(24, 38); c.lineTo(24, 33.5); c.moveTo(24, 38); c.lineTo(27.5, 39.5); c.lineWidth = 1.6; c.stroke();
    }
    c.fillStyle = 'rgba(59,38,16,0.3)'; rr(c, 38, 33, 281, 9, 4.5); c.fill();
    if (frac > 0) { c.fillStyle = heat(frac); rr(c, 38, 33, Math.max(9, 281 * frac), 9, 4.5); c.fill(); c.fillStyle = 'rgba(255,255,255,0.35)'; rr(c, 40, 34, Math.max(5, 281 * frac - 4), 3, 1.5); c.fill(); }
    c.lineWidth = 2; c.strokeStyle = '#3b2610'; rr(c, 38, 33, 281, 9, 4.5); c.stroke();
    if (frac <= 0) gtext(c, this.font_12, 'sin bonus de tiempo', 178, 38, [110, 76, 30], { align: 'c' });
    else if (frac < 0.2) { c.fillStyle = `rgba(255,60,40,${(0.12 + 0.12 * Math.sin(now / 110)).toFixed(3)})`; rr(c, 36, 31, 285, 13, 6); c.fill(); }
    // the letter
    c.save(); c.translate(fx.sx, fx.sy);
    const ek = Math.min(1, Math.max(0, (now - this.qT) / 450));
    let cx = (1 - E.outBack(ek)) * 340, ca = 1;
    if (this.phase === 'out') { cx = -(ex * ex) * 360; ca = 1 - ex * 0.8; }
    const sa = now - this.cardShake; if (sa >= 0 && sa < 400) cx += Math.sin(sa / 15) * 5 * (1 - sa / 400);
    if (ek > 0) {
      c.save(); c.globalAlpha = ca; c.translate(cx, 0);
      c.fillStyle = 'rgba(40,20,0,0.28)'; rr(c, CX + 3, CY + 5, CW, CH, 8); c.fill();
      if (!slice3(c, 'cartero_envelope', CX - 4, CY - 6, CW + 8, CH + 12, 46)) { rr(c, CX, CY, CW, CH, 8); c.fillStyle = '#fffaf0'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#3b2610'; c.stroke(); }
      // postmark and stamp
      c.save(); c.translate(CX + CW - 30, CY + 30); c.rotate(0.1);
      c.strokeStyle = 'rgba(80,60,40,0.35)'; c.lineWidth = 1.6; c.beginPath(); c.arc(-20, 4, 15, 0, Math.PI * 2); c.stroke();
      for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(-40, -2 + k * 5); c.bezierCurveTo(-30, -6 + k * 5, -22, 2 + k * 5, -12, -2 + k * 5); c.stroke(); }
      if (!put(c, frame('cartero_stamps', 4, this.index, 28, 36), -14, -20)) {
      c.fillStyle = '#fff6dc'; c.fillRect(-14, -20, 28, 36); c.fillStyle = '#6fa8e8'; c.fillRect(-11, -17, 22, 30);
      sun(c, 0, -2, 8); c.strokeStyle = '#3b2610'; c.lineWidth = 1.5; c.strokeRect(-11.5, -17.5, 23, 31);
      }
      c.restore();
      // the question
      const lh = this.qfont.get_linesize() - 2, y0 = CY + CH / 2 - (this.qlines.length - 1) * lh / 2;
      for (let k = 0; k < this.qlines.length; k++) gtext(c, this.qfont, this.qlines[k], CX + 12 + 116, y0 + k * lh, [75, 47, 7], { align: 'c' });
      // the stamp that slams on a right answer
      const st = (now - this.stampT) / 1000;
      if (st >= 0 && this.phase !== 'ask') {
        const k = Math.min(1, st / 0.22), s = 1 + (1 - E.out(k)) * 1.6;
        c.save(); c.translate(CX + CW / 2 - 20, CY + CH / 2 + 4); c.rotate(-0.2); c.scale(s, s); c.globalAlpha = ca * Math.min(1, k * 3);
        if (!put(c, scaled('cartero_stamp', 124, 68), -62, -34)) {
        rr(c, -62, -16, 124, 32, 6); c.fillStyle = 'rgba(255,250,240,0.92)'; c.fill(); c.lineWidth = 3.5; c.strokeStyle = '#c8281e'; c.stroke(); rr(c, -57, -11, 114, 22, 4); c.lineWidth = 1.5; c.stroke();
        gtext(c, this.font_18, 'ENTREGADA', 0, 0, [200, 40, 30], { align: 'c' });
        }
        c.restore();
      }
      c.restore();
    }
    for (let i = 0; i < 4; i++) this.drawOpt(c, i, now, ex);
    c.restore();
    if (this.finish) {
      const e = this.mistakes === 0 ? 3 : this.mistakes <= 2 ? 2 : 1;
      drawFinale(c, W, BH, fx, this.font_24, this.font_14_bld, this.finish, now, '¡TODAS ENTREGADAS!', e, this.mistakes ? `Errores: ${this.mistakes}` : '¡Sin errores!');
    }
    fx.draw(c);
    fx.drawFlash(c, 0, 0, W, BH);
  }
}

// ============================================================================================================================ the kinds of witness
export const NEW_WITNESSES: Record<string, { cls: any; image: string }> = {
  Maestra: { cls: MinigameFlags, image: 'p1_witness_maestra.png' },
  Tamborilero: { cls: MinigameCandombe, image: 'p1_witness_tamborilero.png' },
  Cartero: { cls: MinigameTrivia, image: 'p1_witness_cartero.png' },
};
