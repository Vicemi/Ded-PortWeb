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

const BX = 104, BY = 74, BW = 335, BH = 272;   // the inside of the board of the minigames (the witness stands over its right edge)
const helpSeen = new Set<string>();             // the help is shown the first time

/** the common part of the new minigames */
class NewMinigame extends Minigame {
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
    animations.wait_locked(this.stage, 1100, () => this.minigame_solved_callback());
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
  }
  build(): void {
    const level = this.level();
    const cols = level >= 3 ? 5 : 4, rows = level === 1 ? 3 : 4;
    const [cw, ch, gap] = cols === 5 ? [60, 40, 8] : rows === 3 ? [76, 51, 10] : [76, 51, 8];
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
    const totalW = cols * cw + (cols - 1) * gap, totalH = rows * ch + (rows - 1) * gap;
    const x0 = BX + Math.floor((BW - totalW) / 2), y0 = BY + 8 + Math.floor((BH - 40 - totalH) / 2);
    const back = this.cardImage(null, cw, ch);
    this.cards = []; this.open = []; this.found = 0; this.total_pairs = Math.floor(deck.length / 2);
    this.names = names;
    deck.forEach((id, i) => {
      const card = new ItemImage(x0 + (i % cols) * (cw + gap), y0 + Math.floor(i / cols) * (ch + gap), back);
      card.flag = id; card.face = this.cardImage(id, cw, ch); card.back = back; card.state = 0;   // 0 down, 1 up, 2 found
      card.add_event_handler(ItemEvent.CLICK, (item) => this.flip(item));
      this.layer.add(card); this.cards.push(card);
    });
    this.info = new ItemText(BX, BY + BH - 30, this.font_14_bld, 16, 'Busca las parejas', [244, 230, 184], null, BW, 24, 2, 2);
    this.layer.add(this.info);
    this.note_until = 0;
  }
  /** the line under the cards: a message for a moment, then the clock and the mistakes */
  status(): string {
    const t = Math.max(0, Math.floor(this.start_time === null ? 0 : this.elapsed()));
    return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}  ·  Parejas ${this.found}/${this.total_pairs}  ·  Errores ${this.mistakes}`;
  }
  note(text: string, ms = 1400): void { this.info.set_text(text); this.note_until = pygame.time.get_ticks() + ms; }
  on_start(): void {
    this.stage.start_timer('new_minigame_tick', 500, () => {
      if (this.minigame_solved || pygame.time.get_ticks() < this.note_until) return;
      this.info.set_text(this.status()); this.stage.render();
    }, null, true, false);
  }
  cardImage(id: string | null, w: number, h: number): any {
    const s = new pygame.Surface([w, h], pygame.SRCALPHA, 32), c = s.ctx;
    if (id === null) {
      c.fillStyle = '#2a4ea0'; c.fillRect(0, 0, w, h);
      c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 1;
      for (let k = -h; k < w; k += 8) { c.beginPath(); c.moveTo(k, h); c.lineTo(k + h, 0); c.stroke(); }
      c.fillStyle = '#f4e6b8'; c.font = `bold ${Math.floor(h * 0.6)}px sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', w / 2, h / 2 + 1);
    } else {
      c.fillStyle = '#fff'; c.fillRect(0, 0, w, h);
      c.imageSmoothingQuality = 'high';
      c.drawImage(assets.load_image(`p0_flag_${id}.png`).surface.canvas, 1, 1, w - 2, h - 2);
    }
    c.strokeStyle = '#1a140c'; c.lineWidth = 3; c.strokeRect(1.5, 1.5, w - 3, h - 3);
    return new assets.Image(s);
  }
  flip(card: any): any {
    if (this.minigame_solved || this.busy || card.state !== 0 || this.open.length >= 2) return null;
    card.state = 1; card.set_image(card.face); this.open.push(card);
    this.stage.render();
    if (this.names[card.flag]) this.note(this.names[card.flag].toUpperCase(), 1800);
    if (this.open.length === 2) {
      const [a, b] = this.open;
      if (a.flag === b.flag) {
        a.state = b.state = 2; this.open = []; this.found++;
        this.right_sound.play();
        this.note('¡PAREJA! ' + (this.names[a.flag] || '').toUpperCase(), 2000);
        if (this.found >= this.total_pairs) this.complete();
      } else {
        this.mistakes++; this.busy = true;
        animations.wait_locked(this.stage, 750, () => {
          for (const c of this.open) { c.state = 0; c.set_image(c.back); }
          this.open = []; this.busy = false; this.note('Busca las parejas', 300);
        });
      }
    }
    return null;
  }
}

// ============================================================================================================================ Ritmo de candombe
const LANES = [
  { key: 'chico', name: 'CHICO', color: [255, 196, 64], keys: ['a', 'j'], x: 56 },
  { key: 'repique', name: 'REPIQUE', color: [90, 200, 255], keys: ['s', 'k'], x: 167 },
  { key: 'piano', name: 'PIANO', color: [255, 110, 120], keys: ['d', 'l'], x: 278 },
] as const;
// the beats of each level (index of the drum, -1 = silence)
const SONGS = [
  { beat: 700, notes: [0, -1, 1, -1, 2, -1, 1, -1, 0, -1, 1, -1, 2, -1, 1, 1] },
  { beat: 560, notes: [0, 1, -1, 2, 0, -1, 1, 2, 0, 1, -1, 2, 0, 2, 1, -1, 0, 1, -1, 2, 1, -1, 2, 2] },
  { beat: 470, notes: [0, 1, 2, 1, 0, 2, -1, 1, 0, 1, 2, 1, 2, 0, -1, 1, 0, 1, 2, 1, 0, 2, 1, 1, 2, 0, 1, -1, 2, 1, 0, 0] },
];

export class MinigameCandombe extends NewMinigame {
  constructor(stage: any, phase1content: any, witness: any) {
    super(stage, phase1content, witness, {
      id: 'tamborilero', title: 'TAMBORILERO',
      question_intro: 'El Tamborilero está ensayando para\nlas Llamadas y no puede parar el ritmo.',
      question: '¿Te ofreces a ayudarlo?',
      request_text: 'Me falta un tambor en la cuerda\ny la comparsa sale en una hora.',
      request_question_text: '¿Me ayudas a llevar el ritmo\nde la llamada?',
      thanks_text: '¡Eso es candombe! Con vos al lado la cuerda suena redonda.',
      help: [
        { text: 'El candombe se toca con tres tambores: el chico, el repique y el piano.' },
        { text: 'Las notas bajan hacia los tambores. Cuando lleguen al círculo, toca el tambor: haz clic en él o usa las teclas A, S y D.' },
        { text: 'Si aciertas la mayoría de los golpes, la cuerda queda afinada. Si no, se repite.' },
      ],
    });
  }
  build(): void {
    this.song = SONGS[Math.min(2, this.level() - 1)];
    this.surface = new pygame.Surface([BW, BH], pygame.SRCALPHA, 32);
    this.view = new ItemImage(BX, BY, new assets.Image(this.surface));
    this.view.add_event_handler(ItemEvent.CLICK, (item, args) => this.clicked(args));
    this.layer.add(this.view);
    this.reset();
    this.draw();
  }
  reset(): void {
    const song = this.song, lead = 2200;
    this.notes = [];
    song.notes.forEach((lane, i) => { if (lane >= 0) this.notes.push({ t: lead + i * song.beat, lane, state: 0 }); });   // state 0 waiting, 1 hit, 2 missed
    this.end_time = lead + song.notes.length * song.beat + 600;
    this.t0 = null; this.hits = 0; this.fail = 0; this.combo = 0; this.best = 0; this.perfects = 0; this.rings = []; this.miss = [0, 0, 0]; this.flash = [0, 0, 0]; this.msg = ''; this.msg_t = 0; this.finished = false; this.counted = 0;
  }
  on_start(): void {
    this.t0 = pygame.time.get_ticks();
    this.stage.start_timer('new_minigame_tick', 20, () => this.tick(), null, true, false);
  }
  now(): number { return this.t0 === null ? -1000 : pygame.time.get_ticks() - this.t0; }
  tick(): void {
    if (this.minigame_solved || this.t0 === null) return;
    const now = this.now();
    for (const n of this.notes) if (n.state === 0 && now - n.t > 240) { n.state = 2; this.fail++; this.combo = 0; this.miss[n.lane] = now; this.say('Fallaste', now); }
    if (!this.finished && now > this.end_time) {
      this.finished = true;
      const total = this.notes.length, ratio = this.hits / Math.max(1, total);
      if (ratio >= 0.7) { this.mistakes = this.fail; this.say('¡Qué ritmo!', now); this.draw(); this.complete(); return; }
      this.say('¡Casi! Otra vez', now);
      animations.wait_locked(this.stage, 1500, () => { this.reset(); this.t0 = pygame.time.get_ticks(); });
    }
    this.draw();
  }
  say(text: string, now: number): void { this.msg = text; this.msg_t = now; }
  /** the drum of a lane is hit */
  hit(lane: number): void {
    if (this.minigame_solved || this.t0 === null || this.finished) return;
    const now = this.now();
    drum(LANES[lane].key);
    this.flash[lane] = now;
    let best = null;
    for (const n of this.notes) if (n.state === 0 && n.lane === lane && Math.abs(n.t - now) <= 240 && (best === null || Math.abs(n.t - now) < Math.abs(best.t - now))) best = n;
    if (best) {
      best.state = 1; this.hits++; this.combo++; this.best = Math.max(this.best, this.combo);
      const perfect = Math.abs(best.t - now) < 90;
      if (perfect) this.perfects++;
      this.rings.push({ lane, t: now, perfect });
      this.say(perfect ? '¡Perfecto!' : '¡Bien!', now);
    } else { this.fail++; this.combo = 0; this.miss[lane] = now; this.say('Fuera de tiempo', now); }
    this.draw();
  }
  clicked(args: any): any {
    const x = args.x - BX;
    let lane = 0, d = 1e9;
    LANES.forEach((l, i) => { if (Math.abs(x - l.x - 0) < d) { d = Math.abs(x - l.x); lane = i; } });
    this.hit(lane);
    return null;
  }
  minigame_handle_event(e: any): any {
    if (e.type === pygame.KEYDOWN) {
      const ch = String.fromCharCode(e.key).toLowerCase();
      const lane = LANES.findIndex((l) => l.keys.includes(ch));
      if (lane >= 0) { this.hit(lane); return true; }
      if (e.key === pygame.K_LEFT) { this.hit(0); return true; }
      if (e.key === pygame.K_DOWN) { this.hit(1); return true; }
      if (e.key === pygame.K_RIGHT) { this.hit(2); return true; }
    }
    return null;
  }
  draw(): void {
    const c = this.surface.ctx, now = this.now(), W = BW, H = BH, hitY = H - 72, travel = 1500;
    c.clearRect(0, 0, W, H);
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#3a2414'); g.addColorStop(1, '#1d1008');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    LANES.forEach((l, i) => {
      c.fillStyle = 'rgba(255,255,255,0.05)'; c.fillRect(l.x - 50, 0, 100, H);
      // the drum
      const f = Math.max(0, 1 - (now - this.flash[i]) / 160), r = 36 + f * 5;
      c.beginPath(); c.arc(l.x, hitY, r, 0, Math.PI * 2);
      c.fillStyle = `rgb(${l.color.map((v) => Math.min(255, v * (0.55 + f * 0.45))).join(',')})`; c.fill();
      c.lineWidth = 4; c.strokeStyle = '#1a0e06'; c.stroke();
      c.beginPath(); c.arc(l.x, hitY, r - 9, 0, Math.PI * 2); c.strokeStyle = 'rgba(255,255,255,0.45)'; c.lineWidth = 2; c.stroke();
      c.fillStyle = '#f4e6b8'; c.font = 'bold 12px sans-serif'; c.textAlign = 'center'; c.fillText(l.name, l.x, hitY + 58);
      c.font = '11px sans-serif'; c.fillStyle = 'rgba(244,230,184,0.7)'; c.fillText(l.keys[0].toUpperCase(), l.x, H - 4);
    });
    for (const n of this.notes) {
      const y = hitY - (n.t - now) / travel * (hitY + 20);
      if (y < -20 || y > H + 20 || n.state === 1) continue;
      const l = LANES[n.lane];
      c.beginPath(); c.arc(l.x, y, 15, 0, Math.PI * 2);
      c.fillStyle = n.state === 2 ? 'rgba(120,120,120,0.6)' : `rgb(${l.color.join(',')})`; c.fill();
      c.lineWidth = 3; c.strokeStyle = '#1a0e06'; c.stroke();
    }
    // progress and message
    const total = this.notes.length;
    c.fillStyle = '#f4e6b8'; c.font = 'bold 13px sans-serif'; c.textAlign = 'left'; c.fillText(`Aciertos: ${this.hits}/${total}`, 8, 18);
    if (this.combo >= 2) { c.textAlign = 'right'; c.fillStyle = '#ffd24a'; c.font = 'bold 15px sans-serif'; c.fillText(`Combo x${this.combo}`, W - 8, 18); }
    // rings that spread from the drum that was hit, and a red flash on the lane that was missed
    this.rings = this.rings.filter((r) => now - r.t < 320);
    for (const r of this.rings) {
      const k = (now - r.t) / 320;
      c.beginPath(); c.arc(LANES[r.lane].x, hitY, 36 + k * 26, 0, Math.PI * 2);
      c.strokeStyle = r.perfect ? `rgba(255,255,255,${1 - k})` : `rgba(255,214,120,${0.8 - k * 0.8})`; c.lineWidth = r.perfect ? 4 : 3; c.stroke();
    }
    LANES.forEach((l, i) => { const f = Math.max(0, 1 - (now - this.miss[i]) / 220); if (f > 0) { c.fillStyle = `rgba(220,40,40,${0.28 * f})`; c.fillRect(l.x - 50, 0, 100, H); } });
    if (now - this.msg_t < 700 && this.msg) { c.textAlign = 'center'; c.font = 'bold 22px sans-serif'; c.fillStyle = '#fff'; c.fillText(this.msg, W / 2, 46); }
    if (now < 0) { c.textAlign = 'center'; c.font = 'bold 18px sans-serif'; c.fillStyle = '#fff'; c.fillText('¡Prepárate!', W / 2, 90); }
  }
}

// ============================================================================================================================ Cartas de Uruguay (trivia)
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
  }
  build(): void {
    const level = this.level(), n = level === 1 ? 4 : level === 2 ? 5 : 6;
    this.maximum_time = 20 * n; this.maximum_time_score = 150;
    this.questions = this.makeQuestions(n);
    this.index = 0; this.streak = 0; this.clean = true;
    this.layer.add(new ItemRect(BX, BY, BW, BH, null, 0, '', [0, 0, 0], [238, 226, 188], [60, 40, 14]));   // the paper of the letters
    this.counter = new ItemText(BX, BY + 6, this.font_14_bld, 16, '', [100, 66, 12], null, BW, 20, 2);
    this.qtext = new ItemText(BX + 14, BY + 32, this.font_18, 22, '', [75, 47, 7], null, BW - 28, 78, 2, 2);
    this.layer.add(this.counter); this.layer.add(this.qtext);
    this.opts = [0, 1, 2, 3].map((i) => {
      const r = new ItemRect(BX + 28, BY + 124 + i * 36, BW - 56, 30, this.font_14_bld, 16, '', [35, 25, 10], [246, 235, 200], [60, 40, 14], 2);
      r.add_event_handler(ItemEvent.CLICK, () => this.pick(i));
      this.layer.add(r);
      return r;
    });
    this.show();
  }
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
  show(): void {
    const q = this.questions[this.index];
    this.counter.set_text(`Carta ${this.index + 1} de ${this.questions.length}` + (this.streak >= 2 ? `  ·  Racha de ${this.streak}` : '') + (this.mistakes ? `  ·  Errores ${this.mistakes}` : ''));
    this.qtext.set_text(q.text);
    this.opts.forEach((r, i) => { r.set_text(q.options[i]); r.set_background([246, 235, 200]); r.set_visible(true); });
  }
  pick(i: number): any {
    if (this.minigame_solved || this.locked) return null;
    const q = this.questions[this.index];
    if (i === q.answer) {
      this.opts[i].set_background([170, 220, 140]);
      if (this.clean) this.streak++; this.clean = true;
      this.counter.set_text('¡Correcto!' + (this.streak >= 2 ? `  ·  Racha de ${this.streak}` : ''));
      this.right_sound.play(); this.locked = true;
      animations.wait_locked(this.stage, 650, () => {
        this.locked = false; this.index++;
        if (this.index >= this.questions.length) this.complete(); else this.show();
      });
    } else {
      this.mistakes++; this.streak = 0; this.clean = false;
      this.opts[i].set_background([230, 140, 130]);
      blip(180, 0.18, 0.3);
    }
    return null;
  }
}

// ============================================================================================================================ the kinds of witness
export const NEW_WITNESSES: Record<string, { cls: any; image: string }> = {
  Maestra: { cls: MinigameFlags, image: 'p1_witness_maestra.png' },
  Tamborilero: { cls: MinigameCandombe, image: 'p1_witness_tamborilero.png' },
  Cartero: { cls: MinigameTrivia, image: 'p1_witness_cartero.png' },
};
