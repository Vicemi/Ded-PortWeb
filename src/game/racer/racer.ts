// The car chase of phase 3. In the original game it was a native module (racer.so) that ran its own loop; this is a new implementation of it for the
// browser that reads the same data files (car, thief, traffic, gui, camera and the maps): a pseudo-3D road drawn row by row from the floor texture of
// the map, billboards for the objects and the cars, the HUD (fuel / distance bars, odometer, avatars, warning signs) and the sounds.
//
// The controls are the original ones: arrows (or Re Pág / Av Pág / Inicio / Fin) to accelerate, brake and steer. Overtake the thief to arrest him.
import { Image_, load_image, racerData } from '../../engine/assets';
import type { GameLike } from '../../engine/stage';
import { Stage } from '../../engine/stage';
import { K, KEYDOWN, MOUSEBUTTONDOWN, MOUSEMOTION, Rect, event as pgevent, input, time } from '../../engine/pygame';
import { mixer, type Channel } from '../../engine/sounds';
import { Track, makeRng, type MapDef, type Placed } from './track';

// ---- the camera (see camera.yaml: y_translation 50 -> camera height 5 m, z_near 7 m)
const SCREEN_W = 600, SCREEN_H = 450;
const HORIZON = 225;                     // screen row of the horizon: the floor texture fills the 225 rows below it
const CAM_H = 5;                         // metres above the road
const FOCAL = 315;                       // px: 600 px of screen = 87 degrees
const TEX_W_M = 86, TEX_H_M = 10;        // the floor texture covers 86 x 10 metres
const ROAD_HALF = 7;                     // asphalt half width (the materials start there)
const VIEW_M = 700;                      // billboards farther than this are not drawn

const SOUNDS = 'sounds/';
const nameOf = (p: string): string => p.replace(/^.*\//, '');
const hex = (c: string | number): [number, number, number] => { const s = String(c).padStart(6, '0'); return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)]; };
const clamp = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));

interface Frame { texture: string; duration: number; dy?: number }
interface CarKind { width: number; textures: any[]; sound?: { sound: string; volume?: number } }
interface Vehicle { s: number; x: number; v: number; kind: CarKind; targetX: number }

type Phase = 'run' | 'catch' | 'won' | 'lost' | 'quit';

export class RacerStage extends Stage {
  private data = racerData();
  private map: MapDef;
  private track: Track;
  private rng: () => number;

  // images
  private img = new Map<string, Image_>();
  private floor!: Uint8ClampedArray;
  private floorLeft: [number, number, number];
  private floorRight: [number, number, number];
  private floorImage!: ImageData;
  private floorSurface: HTMLCanvasElement;
  private sky: Image_;
  private horizon: Image_ | null;
  private carSprites: any[];

  // state
  private phase: Phase = 'run';
  private s = 0; private x = 0; private v = 0;
  private steer = 0;
  private timeLeft: number;
  private maxTime: number;
  private thief: Vehicle;
  private traffic: Vehicle[] = [];
  private catchGap0: number | null = null;
  private crashT = 0; private crashDir = 1; private crashKind: 'hard' | 'light' | '' = '';
  private catchT = 0; private catchSide = 1;
  private endAt = 0;
  private clock = 0;
  private lastTick = 0;
  private dialog = false; private overYes = false; private overNo = false;
  private signs = { lowFuel: 0, thiefNear: 0, nearShown: false, lowFuelShown: false };
  private wheelT = 0;
  private distance = 1e9;

  // sound
  private engine: Channel | null = null;
  private tires: Channel | null = null;
  private rough: Channel | null = null;
  private siren: Channel | null = null;
  private warningNext = 0; private warningLeft = 0;

  constructor(game: GameLike, private prev: Stage, private o: { thiefImage: string; avatarImage: string; timeOfDay: string; map: string; color: string; done: (result: number) => void }) {
    super(game, null, null);
    this.map = this.data.maps[o.map] ?? this.data.maps.beach;
    this.rng = makeRng((Date.now() ^ 0x9e3779b9) >>> 0);
    this.track = new Track(this.map, Math.floor(this.rng() * 1e9));
    this.maxTime = this.timeLeft = this.map.time;
    const terrain = this.map.terrain[0];
    const tex = load_image(nameOf(terrain.texture.image));
    this.floor = tex.surface.pixels();
    this.floorLeft = hex(terrain.left_fill); this.floorRight = hex(terrain.right_fill);
    this.floorSurface = document.createElement('canvas');
    this.floorSurface.width = SCREEN_W; this.floorSurface.height = SCREEN_H - HORIZON;
    this.floorImage = this.floorSurface.getContext('2d')!.createImageData(SCREEN_W, SCREEN_H - HORIZON);
    const sky = this.map.sky;
    this.sky = load_image(nameOf((sky.backgrounds[o.timeOfDay] ?? sky.backgrounds.noon).texture));
    this.horizon = sky.layers?.length ? load_image(nameOf(sky.layers[0].texture)) : null;
    this.carSprites = this.data.car.sprites;
    // the thief starts ahead of the player
    const thiefKinds = this.data.thief.textures[o.color] ?? this.data.thief.textures.violet;
    this.thief = { s: 90 + this.rng() * 40, x: this.map.lanes[this.rng() < 0.5 ? 0 : 1], v: 0, kind: { width: this.data.thief.width, textures: thiefKinds }, targetX: 0 };
    this.thief.targetX = this.thief.x;
  }

  // ---------------------------------------------------------------------------------------------------------------------------- assets
  private image(name: string): Image_ {
    const n = nameOf(name);
    let i = this.img.get(n);
    if (!i) { i = load_image(n); this.img.set(n, i); }
    return i;
  }

  // ---------------------------------------------------------------------------------------------------------------------------- stage hooks
  initialize(): void { /* everything is loaded in the constructor */ }
  close(): void { this.stopSounds(); }

  prepare(): void {
    this.lastTick = time.get_ticks();
    this.clock = 0;
    const e = this.sound('p3_Car_Engine.wav');
    this.engine = e.play(-1, 0, 0);
    if (this.engine) { this.engine.set_volume(this.data.car.sounds.engine.volume ?? 0.5); this.engine.set_rate(0.5); }
    const music = this.map.music.loop;
    const ch = mixer.Channel(0);
    ch.set_volume(music.volume ?? 0.6);
    ch.play(mixer.sound(nameOf(music.sound)), -1, 0, 0, { loopStart: music.loop_start ?? 0 });
  }

  private sound(file: string) { return mixer.sound(nameOf(file)); }
  private stopSounds(): void {
    for (const c of [this.engine, this.tires, this.rough, this.siren]) c?.stop();
    this.engine = this.tires = this.rough = this.siren = null;
    mixer.Channel(0).stop();
  }

  // ---------------------------------------------------------------------------------------------------------------------------- the frame
  notify_tick(): void {
    const now = time.get_ticks();
    const dt = clamp((now - this.lastTick) / 1000, 0.001, 0.08);
    this.lastTick = now;
    this.handleEvents();
    if (!this.dialog && this.phase !== 'quit') { this.clock += dt; this.update(dt); }
    this.draw();
    this.game.update_display();
  }

  private handleEvents(): void {
    for (const e of pgevent.get()) {
      if (e.type === KEYDOWN && e.key === K.ESCAPE) {
        if (this.phase === 'run') { this.dialog = !this.dialog; this.audioPause(this.dialog); }
      } else if (e.type === MOUSEMOTION && this.dialog) {
        const [x, y] = e.pos!;
        this.overYes = this.inButton('yes', x, y); this.overNo = this.inButton('no', x, y);
      } else if (e.type === MOUSEBUTTONDOWN && this.dialog) {
        const [x, y] = e.pos!;
        if (this.inButton('yes', x, y)) { this.dialog = false; this.finish(0); }
        else if (this.inButton('no', x, y)) { this.dialog = false; this.audioPause(false); }
      }
    }
  }
  private inButton(which: 'yes' | 'no', x: number, y: number): boolean {
    const d = this.data.gui.exit_dialog[which];
    const im = this.image(d.src);
    return x >= d.pos.x && x < d.pos.x + im.get_width() && y >= d.pos.y && y < d.pos.y + im.get_height();
  }
  private audioPause(p: boolean): void {
    for (const c of [this.engine, this.rough, this.tires, this.siren]) if (c) c.set_volume(p ? 0 : this.baseVol(c));
    mixer.Channel(0).set_volume(p ? 0.15 : (this.map.music.loop.volume ?? 0.6));
  }
  private baseVol(c: Channel): number {
    return c === this.engine ? this.data.car.sounds.engine.volume ?? 0.5 : c === this.siren ? this.data.car.sounds.siren.volume ?? 0.6 : 1;
  }

  // ---------------------------------------------------------------------------------------------------------------------------- simulation
  private pressed(...codes: number[]): boolean { return codes.some((c) => input.pressed.has(c)); }

  private update(dt: number): void {
    const car = this.data.car;
    const lowFuelAt = this.data.gui.fuel_warning_time * 1000;
    let accel = false, brake = false, steerTarget = 0;
    const control = (this.phase === 'run' && this.crashT <= 0 && this.timeLeft > 0);
    if (control) {
      accel = this.pressed(K.UP, K.PAGEUP, 119);
      brake = this.pressed(K.DOWN, K.PAGEDOWN, 115, K.SPACE);
      steerTarget = (this.pressed(K.RIGHT, K.END, 100) ? 1 : 0) - (this.pressed(K.LEFT, K.HOME, 97) ? 1 : 0);
    }
    // ---- time (the fuel)
    if (this.phase === 'run') {
      const before = this.timeLeft;
      this.timeLeft = Math.max(0, this.timeLeft - dt * 1000);
      if (before > lowFuelAt && this.timeLeft <= lowFuelAt && this.timeLeft > 0) this.startLowFuelWarning();
      if (this.timeLeft <= 0 && before > 0) this.lose();
    }
    // ---- speed
    const vmax = 178;
    const offroad = Math.abs(this.x) > ROAD_HALF + 0.4;
    let a = 0;
    if (accel) {
      // strong pull at low speed that fades as the speed approaches the top speed (the gears of car.yaml set the feel: power 14)
      a = (car.acceleration.power * 1.43) * (1 - Math.pow(this.v / vmax, 2)) * (this.v < 25 ? 1.3 : 1);
    } else a = -(5 + this.v * this.v * 0.0006);
    if (brake && this.v > 0) a -= 62;
    if (offroad) a -= (this.v > 12 ? 28 + this.v * 0.35 : 0);
    if (this.phase === 'catch' || this.phase === 'won') a = -this.data.car.finishing.deacceleration;
    if (this.timeLeft <= 0) a = -(14 + this.v * 0.25);
    if (this.crashT > 0) a = -this.v * 2.4;
    this.v = Math.max(0, this.v + a * dt);
    if (offroad && this.v > 85) this.v = Math.max(85, this.v - 120 * dt);
    // ---- steering and position
    this.steer += clamp(steerTarget - this.steer, -5 * dt, 5 * dt);
    const grip = 0.085;
    const kappa = this.track.curvatureAt(this.s);
    if (this.phase === 'run' || this.phase === 'lost') {
      const slip = Math.min(1, this.v / 45);
      this.x += (this.steer * grip * this.v * slip - kappa * this.v * this.v * 0.052) * dt;
      this.x = clamp(this.x, -42, 42);
    }
    this.s += this.v * dt;
    this.track.ensure(this.s + 2200);
    // ---- the crash that spins the car
    if (this.crashT > 0) {
      this.crashT -= dt;
      if (this.crashT <= 0) { this.crashKind = ''; this.x = clamp(this.x, -ROAD_HALF + 1.5, ROAD_HALF - 1.5); this.v = Math.max(this.v, 8); }
    } else if (this.phase === 'run') this.collisions();
    // ---- the others
    this.moveTraffic(dt);
    this.moveThief(dt);
    if (this.phase === 'run') this.checkCatch();
    else this.advanceEnding(dt);
    this.distance = this.thief.s - this.s;
    this.signsAndSirens();
    this.updateSounds(offroad, brake);
  }

  private hardCrash(): void {
    if (this.crashT > 0) return;
    this.crashKind = 'hard'; this.crashT = this.data.car.hard_crash.duration + 0.15; this.crashDir = this.x > 0 ? -1 : 1;
    this.play('P3_Car_Crash2.wav', 1);
  }
  private lightCrash(dir: number): void {
    this.v *= this.data.car.restitution;
    this.x += dir * 1.2;
    this.play('P3_Car_Crash1.wav', 1);
  }
  private play(file: string, volume = 1): void {
    const ch = mixer.sound(nameOf(file)).play(0, 0);
    if (ch) ch.set_volume(volume);
  }

  private collisions(): void {
    const half = this.data.car.width / 2;
    // traffic
    for (const t of this.traffic) {
      const ds = t.s - this.s;
      if (ds > 6 || ds < -6) continue;
      const w = (t.kind.width + this.data.car.width) / 2;
      if (Math.abs(t.x - this.x) < w && ds > -4) {
        const rel = this.v - t.v;
        if (rel > 55) { this.hardCrash(); return; }
        this.lightCrash(this.x >= t.x ? 1 : -1);
        this.s = Math.min(this.s, t.s - 5.5);
        this.v = Math.min(this.v, t.v * 0.9);
        return;
      }
    }
    // the objects at the sides of the road
    const near = this.track.objectsIn(this.s - 1, this.s + 4);
    for (const o of near) {
      if (!o.body) continue;
      if (this.x + half > o.body.x0 && this.x - half < o.body.x1) {
        if (this.v > 70) this.hardCrash(); else this.lightCrash(this.x >= (o.body.x0 + o.body.x1) / 2 ? 1 : -1);
        this.s = o.s - 2;
        return;
      }
    }
  }

  private moveTraffic(dt: number): void {
    const tr = this.data.traffic;
    for (const t of this.traffic) t.s += t.v * dt;
    this.traffic = this.traffic.filter((t) => t.s > this.s - 80 && t.s < this.s + tr.max_distance + 300);
    let guard = 0;
    while (this.traffic.length < 7 && guard++ < 10) {
      const lane = this.map.lanes[Math.floor(this.rng() * this.map.lanes.length)];
      const s = this.s + tr.min_distance + this.rng() * (tr.max_distance - tr.min_distance) + 120;
      if (this.traffic.some((t) => Math.abs(t.s - s) < 45 && Math.abs(t.x - lane) < 3)) continue;
      if (Math.abs(s - this.thief.s) < 40 && Math.abs(lane - this.thief.x) < 4) continue;
      const kind = tr.cars[Math.floor(this.rng() * tr.cars.length)];
      this.traffic.push({ s, x: lane, v: tr.min_speed + this.rng() * 32, kind, targetX: lane });
    }
  }

  private moveThief(dt: number): void {
    const th = this.thief;
    if (this.phase === 'run' || this.phase === 'lost') {
      th.v = Math.min(this.data.thief.speed, th.v + 17 * dt);   // the thief pulls away from a standing start too
      th.s += th.v * dt;
      // dodge the traffic ahead: change lane when a car is in the way
      const ahead = this.traffic.find((t) => t.s > th.s && t.s - th.s < 110 && Math.abs(t.x - th.x) < 3.5 && t.v < th.v);
      if (ahead) {
        const other = this.map.lanes.find((l) => Math.abs(l - ahead.x) > 3);
        if (other !== undefined) th.targetX = other;
      } else if (Math.abs(th.targetX) > this.map.lanes[0] + 0.1) th.targetX = th.targetX > 0 ? this.map.lanes[0] : this.map.lanes[1];
      const dx = th.targetX - th.x, step = this.data.thief.sideways_speed * dt;
      th.x += clamp(dx, -step, step);
    } else if (this.phase === 'catch' || this.phase === 'won') {
      th.v = Math.max(0, th.v - this.data.car.finishing.deacceleration * dt);
      th.s += th.v * dt;
    }
  }

  private checkCatch(): void {
    const th = this.thief;
    const ds = this.s - th.s, dx = this.x - th.x;
    const touching = (th.kind.width + this.data.car.width) / 2;
    if (Math.abs(dx) < touching && ds > -5 && ds < 0.5) {
      // the front of the car touches the back of the thief: no arrest, just a bump
      this.lightCrash(dx >= 0 ? 1 : -1);
      this.s = th.s - 5.5;
      this.v = Math.min(this.v, th.v * 0.85);
      return;
    }
    // overtaken: the car is side by side with the thief (or just ahead)
    if (ds >= 0.5 && ds < 12 && Math.abs(dx) < 9 && this.v >= th.v * 0.8 && Math.abs(this.x) < 12) {
      this.phase = 'catch';
      this.catchT = 0;
      this.catchGap0 = null;
      this.catchSide = th.x >= this.x ? 1 : -1;
      this.play('p3_car_tires.wav', 1);
    }
  }

  private advanceEnding(dt: number): void {
    const f = this.data.car.finishing;
    const th = this.thief;
    if (this.phase === 'catch') {
      // the car cuts in front of the thief in `maneuver_time` seconds
      this.catchT += dt;
      const k = clamp(this.catchT / f.maneuver_time, 0, 1);
      const tx = th.x - this.catchSide * f.maneuver_side_distance;
      this.x += (tx - this.x) * Math.min(1, dt / Math.max(0.02, f.maneuver_time - this.catchT + 0.02));
      // the police car eases in behind the thief, which brakes in front of it (so the arrest is seen)
      if (this.catchGap0 === null) this.catchGap0 = th.s - this.s;
      const e = clamp(this.catchT / 0.6, 0, 1), ease = e * e * (3 - 2 * e);
      const gap = this.catchGap0 + (f.close_distance + f.maneuver_front_distance + 0.5 - this.catchGap0) * ease;
      this.s = th.s - gap;
      this.v = th.v;
      if (k >= 1 && th.v < 5) {
        this.phase = 'won';
        this.endAt = this.clock + this.map.exit_time / 1000;
        this.signs.thiefNear = 0;
        this.stopLoops();
        const ch = mixer.Channel(0);
        ch.set_volume(this.map.music.win.volume ?? 0.6);
        ch.play(mixer.sound(nameOf(this.map.music.win.sound)), 0, 0);
      }
    } else if (this.phase === 'won' || this.phase === 'lost') {
      if (this.clock >= this.endAt) this.finish(this.phase === 'won' ? 1 : 0);
    }
  }

  private lose(): void {
    this.phase = 'lost';
    this.endAt = this.clock + this.map.exit_time / 1000;
    this.stopLoops();
    const ch = mixer.Channel(0);
    ch.set_volume(this.map.music.lose.volume ?? 0.6);
    ch.play(mixer.sound(nameOf(this.map.music.lose.sound)), 0, 0);
  }
  private stopLoops(): void {
    for (const c of [this.engine, this.tires, this.rough, this.siren]) c?.stop();
    this.engine = this.tires = this.rough = this.siren = null;
  }

  private finished = false;
  private finish(result: number): void {
    if (this.finished) return;
    this.finished = true;
    this.phase = 'quit';
    this.stopSounds();
    const prev = this.prev, done = this.o.done;
    this.game.set_stage(prev);
    // the previous stage runs again at the next frame: hand the result over from there
    prev.start_timer('racer_done', 1, (key: unknown) => { prev.stop_timer(key); done(result); });
  }

  // ---------------------------------------------------------------------------------------------------------------------------- signs & sounds
  private startLowFuelWarning(): void {
    const w = this.data.gui.low_fuel_warning;
    this.signs.lowFuel = this.clock; this.signs.lowFuelShown = true;
    this.warningLeft = w.times; this.warningNext = this.clock;
  }
  private signsAndSirens(): void {
    const g = this.data.gui;
    if (!this.signs.nearShown && this.distance < g.thief_warning_distance && this.phase === 'run') { this.signs.nearShown = true; this.signs.thiefNear = this.clock; }
    // the siren sounds while the thief is close
    const near = this.distance < this.data.car.siren.start_distance && this.phase === 'run';
    if (near && !this.siren) {
      this.siren = this.sound('p3_car_siren.wav').play(-1, 0, 0);
      this.siren?.set_volume(this.data.car.sounds.siren.volume ?? 0.6);
    } else if (!near && this.siren) { this.siren.stop(); this.siren = null; }
    // the warning beep of the low fuel sign
    if (this.warningLeft > 0 && this.clock >= this.warningNext && this.phase === 'run') {
      const w = g.low_fuel_sound;
      this.play('p3_warning.wav', 1);
      this.warningLeft--;
      this.warningNext = this.clock + (w.available + w.unavailable) / 1000;
    }
  }
  private updateSounds(offroad: boolean, braking: boolean): void {
    if (this.engine) this.engine.set_rate(0.45 + (this.v / 178) * 1.35);
    const wantRough = offroad && this.v > 10 && this.phase === 'run';
    if (wantRough && !this.rough) { this.rough = this.sound('p3_car_rough_terrain.wav').play(-1, 0, 0); }
    else if (!wantRough && this.rough) { this.rough.stop(); this.rough = null; }
    const wantTires = braking && this.v > 35 && this.phase === 'run';
    if (wantTires && !this.tires) { this.tires = this.sound('p3_car_tires.wav').play(-1, 0, 0); this.tires?.set_volume(0.7); }
    else if (!wantTires && this.tires) { this.tires.stop(); this.tires = null; }
  }

  // ---------------------------------------------------------------------------------------------------------------------------- drawing
  private draw(): void {
    const win = this.game.window;
    const g = win.ctx;
    win.set_clip(null);
    g.globalAlpha = 1;
    g.fillStyle = '#' + String(this.map.sky.color).padStart(6, '0');
    g.fillRect(0, 0, SCREEN_W, SCREEN_H);
    this.drawSky(g);
    this.drawFloor(g);
    this.drawObjects(g);
    this.drawPlayer(g);
    this.drawGui(g);
    if (this.dialog) this.drawDialog(g);
  }

  private drawSky(g: CanvasRenderingContext2D): void {
    const h = this.track.heading(this.s) + (this.phase === 'run' ? this.x * 0.0 : 0);
    const bgSpeed = this.map.sky.backgrounds[this.o.timeOfDay]?.speed ?? 120;
    const sky = this.sky.surface.canvas;
    const sw = sky.width;
    let ox = Math.floor((-h * bgSpeed * 2.2) % sw);
    if (ox > 0) ox -= sw;
    for (let x = ox; x < SCREEN_W; x += sw) g.drawImage(sky, x, HORIZON - sky.height);
    if (this.horizon) {
      const layer = this.map.sky.layers[0];
      const hz = this.horizon.surface.canvas, hw = hz.width;
      let hx = Math.floor((-h * (layer.speed ?? 200) * 2.2) % hw);
      if (hx > 0) hx -= hw;
      for (let x = hx; x < SCREEN_W; x += hw) g.drawImage(hz, x, HORIZON - hz.height);
    }
  }

  private drawFloor(g: CanvasRenderingContext2D): void {
    const data = this.floorImage.data;
    const tex = this.floor;
    const [lr, lg, lb] = this.floorLeft, [rr, rg, rb] = this.floorRight;
    const pxPerM = 3000 / TEX_W_M, rowsPerM = 225 / TEX_H_M;
    const rows = SCREEN_H - HORIZON;
    for (let r = 0; r < rows; r++) {
      const dy = r + 1;                                  // rows below the horizon
      const z = CAM_H * FOCAL / dy;
      const c = this.track.shear(this.s, z);
      const perPx = z / FOCAL;
      let u = 1500 + (this.x - c - SCREEN_W / 2 * perPx) * pxPerM;
      const du = perPx * pxPerM;
      let v = ((this.s + z) % TEX_H_M);
      if (v < 0) v += TEX_H_M;
      const trow = Math.min(224, Math.floor(v * rowsPerM)) * 3000;
      let o = r * SCREEN_W * 4;
      for (let px = 0; px < SCREEN_W; px++, u += du, o += 4) {
        const ui = u | 0;
        if (ui < 0) { data[o] = lr; data[o + 1] = lg; data[o + 2] = lb; }
        else if (ui >= 3000) { data[o] = rr; data[o + 1] = rg; data[o + 2] = rb; }
        else { const t = (trow + ui) * 4; data[o] = tex[t]; data[o + 1] = tex[t + 1]; data[o + 2] = tex[t + 2]; }
        data[o + 3] = 255;
      }
    }
    this.floorSurface.getContext('2d')!.putImageData(this.floorImage, 0, 0);
    g.drawImage(this.floorSurface, 0, HORIZON);
  }

  private project(s: number, x: number): { sx: number; sy: number; k: number; z: number } | null {
    const z = s - this.s;
    if (z < 2.5 || z > VIEW_M) return null;
    const k = FOCAL / z;
    const c = this.track.shear(this.s, z);
    return { sx: SCREEN_W / 2 + (x - this.x + c) * k, sy: HORIZON + CAM_H * k, k, z };
  }

  private drawObjects(g: CanvasRenderingContext2D): void {
    const list: { z: number; draw: () => void }[] = [];
    const objs = this.track.objectsIn(this.s + 2.5, this.s + VIEW_M);
    for (const o of objs) {
      const p = this.project(o.s, o.x);
      if (!p) continue;
      list.push({ z: p.z, draw: () => this.drawBillboard(g, this.image(o.texture).surface.canvas, p, o.w, o.h) });
    }
    for (const t of this.traffic) {
      const p = this.project(t.s, t.x);
      if (!p) continue;
      list.push({ z: p.z, draw: () => this.drawVehicle(g, t, p) });
    }
    const tp = this.project(this.thief.s, this.thief.x);
    if (tp) list.push({ z: tp.z, draw: () => { this.drawVehicle(g, this.thief, tp); this.drawArrow(g, tp); } });
    list.sort((a, b) => b.z - a.z);
    for (const l of list) l.draw();
  }

  private drawBillboard(g: CanvasRenderingContext2D, img: CanvasImageSource, p: { sx: number; sy: number; k: number }, w: number, h: number): void {
    const dw = w * p.k, dh = h * p.k;
    if (dw < 1 || dh < 1) return;
    const sx = p.sx - dw / 2, sy = p.sy - dh;
    if (sx > SCREEN_W || sx + dw < 0 || sy > SCREEN_H) return;
    g.drawImage(img, sx, sy, dw, dh);
  }

  /** a car seen from behind: the texture depends on the angle between the view direction and the car */
  private drawVehicle(g: CanvasRenderingContext2D, v: Vehicle, p: { sx: number; sy: number; k: number; z: number }): void {
    const lateral = (p.sx - SCREEN_W / 2) / p.k;
    const angle = Math.abs(Math.atan2(lateral, p.z)) * 180 / Math.PI;
    const side = p.sx < SCREEN_W / 2 ? 'left' : 'right';
    const entry = v.kind.textures.find((t: any) => angle < t.to) ?? v.kind.textures[v.kind.textures.length - 1];
    const tex = entry.both ?? entry[side] ?? entry.left ?? entry.right;
    if (!tex) return;
    this.drawBillboard(g, this.image(tex.texture).surface.canvas, p, tex.width, tex.height);
  }

  /** the bouncing arrow over the thief */
  private drawArrow(g: CanvasRenderingContext2D, p: { sx: number; sy: number; k: number }): void {
    const arrow = this.data.thief.arrow;
    const frames: Frame[] = arrow.animation.map((f: any) => ({ texture: f.texture, duration: f.duration, dy: f.pixel_translation?.y ?? 0 }));
    const total = frames.reduce((a, f) => a + f.duration, 0);
    let t = (this.clock * 1000) % total, f = frames[0];
    for (const fr of frames) { if (t < fr.duration) { f = fr; break; } t -= fr.duration; }
    const img = this.image(f.texture).surface.canvas;
    const h = 2.5 * p.k;
    g.drawImage(img, p.sx - img.width / 2, p.sy - h - arrow.y * p.k - img.height + (f.dy ?? 0));
  }

  private drawPlayer(g: CanvasRenderingContext2D): void {
    const car = this.data.car;
    let sprite: any;
    const st = Math.abs(this.steer);
    const idx = st <= this.carSprites[0].to ? 0 : st <= this.carSprites[1].to ? 1 : 2;
    const spec = this.carSprites[idx];
    let entry = spec.both ?? (this.steer < 0 ? spec.left : spec.right);
    let yOff = 0;
    if (this.crashT > 0 && this.crashKind === 'hard') {
      // the spinning animation of the hard crash
      const anim = (this.crashDir < 0 ? car.hard_crash.left : car.hard_crash.right).animation;
      const dur = anim.reduce((a: number, f: any) => a + f.duration, 0) / 1000;
      const t = clamp((this.data.car.hard_crash.duration + 0.15 - this.crashT) / dur, 0, 0.999) * dur * 1000;
      let acc = 0, fr = anim[anim.length - 1];
      for (const f of anim) { acc += f.duration; if (t < acc) { fr = f; break; } }
      const im = this.image(fr.texture.image).surface.canvas;
      g.drawImage(im, 20, SCREEN_H - im.height + (fr.texture.y_translation ?? 13));
      return;
    }
    if (this.phase === 'catch' || this.phase === 'won') {
      const anim = (this.catchSide > 0 ? car.caught_thief.left : car.caught_thief.right).animation;
      const i = Math.min(anim.length - 1, Math.floor(this.catchT / 0.12));
      const im = this.image(anim[i].texture).surface.canvas;
      g.drawImage(im, (SCREEN_W - im.width) / 2, SCREEN_H - im.height + 13);
      return;
    }
    sprite = entry.car;
    // a rough road shakes the car a little
    if (Math.abs(this.x) > ROAD_HALF + 0.4 && this.v > 10) yOff = Math.sin(this.clock * 55) * 2.2 + 3;
    const body = this.image(sprite.image).surface.canvas;
    const by = SCREEN_H - body.height + (sprite.y_translation ?? 13) + yOff;
    g.drawImage(body, (SCREEN_W - body.width) / 2, by);
    // the wheels
    const wheels = entry.wheels;
    this.wheelT += this.v * 0.016;
    const wi = Math.floor(this.wheelT / 1.4) % wheels.length;
    const wimg = this.image(wheels[wi].texture.image).surface.canvas;
    g.drawImage(wimg, (SCREEN_W - wimg.width) / 2, SCREEN_H - wimg.height + (wheels[wi].texture.y_translation ?? 13) + yOff);
    // the siren
    if (this.distance < car.siren.start_distance && this.phase === 'run') {
      const frames = car.siren.animation as { texture: string; duration: number }[];
      const total = frames.reduce((a, f) => a + f.duration, 0);
      let t = (this.clock * 1000) % total, fr = frames[0];
      for (const f of frames) { if (t < f.duration) { fr = f; break; } t -= f.duration; }
      const si = this.image(fr.texture).surface.canvas;
      g.drawImage(si, SCREEN_W / 2 + entry.siren.x - si.width / 2, SCREEN_H + entry.siren.y - si.height / 2 + yOff);
    }
    // sand / grass / mud thrown by the wheels off the road
    if (Math.abs(this.x) > ROAD_HALF + 0.4 && this.v > 10) {
      const side = this.x < 0 ? 'left' : 'right';
      const mats = this.map.terrain[0].materials[side] as any[];
      const m = mats.find((q) => Math.abs(this.x) >= q.from && Math.abs(this.x) < q.to) ?? mats[mats.length - 1];
      if (m) {
        const fi = Math.floor(this.clock * 1000 / (m.animation[0].duration)) % m.animation.length;
        const fx = this.image(m.animation[fi].texture).surface.canvas;
        g.drawImage(fx, SCREEN_W / 2 - 120 - fx.width / 2, SCREEN_H - fx.height - 4);
        g.drawImage(fx, SCREEN_W / 2 + 120 - fx.width / 2, SCREEN_H - fx.height - 4);
      }
    }
  }

  private drawGui(g: CanvasRenderingContext2D): void {
    const gui = this.data.gui;
    const avatar = this.image(this.o.avatarImage).surface.canvas;
    g.drawImage(avatar, gui.player_avatar.pos.x, gui.player_avatar.pos.y);
    const thief = this.image(this.o.thiefImage).surface.canvas;
    g.drawImage(thief, gui.thief_avatar.pos.x, gui.thief_avatar.pos.y);
    g.drawImage(this.image(gui.statics[0].texture).surface.canvas, 0, 0);
    // fuel bar
    const fb = gui.fuel_bar;
    const frac = clamp(this.timeLeft / this.maxTime, 0, 1);
    const [fr, fg, fbl] = hex(fb.color);
    g.fillStyle = `rgb(${fr},${fg},${fbl})`;
    const fw = Math.round(fb.w * frac);
    g.fillRect(fb.pos.x, fb.pos.y, fw, fb.h);
    g.drawImage(this.image(fb.end).surface.canvas, fb.pos.x + fw, fb.pos.y);
    // distance bar
    const db = gui.distance_bar;
    const filler = this.image(db.filler).surface.canvas;
    const dfrac = clamp(this.distance / db.max_distance, 0, 1);
    const dw = Math.round(filler.width * dfrac);
    if (dw > 0) g.drawImage(filler, 0, 0, dw, filler.height, db.pos.x, db.pos.y, dw, filler.height);
    g.drawImage(this.image(db.end.texture).surface.canvas, db.pos.x + dw + db.end.diff_x, db.end.pos.y);
    // odometer
    const mo = gui.mileometer;
    const kmh = Math.floor(this.v * mo.speed_ratio);
    const digits = String(kmh).split('').reverse();
    for (let i = 0; i < digits.length && i < mo.pos.length; i++) g.drawImage(this.image(mo.numbers[Number(digits[i])]).surface.canvas, mo.pos[i].x, mo.pos[i].y);
    g.drawImage(this.image(gui.statics[1].texture).surface.canvas, gui.statics[1].pos.x, gui.statics[1].pos.y);
    // warning signs
    this.drawBlinkingSign(g, gui.low_fuel_warning, this.signs.lowFuelShown ? this.signs.lowFuel : -1, gui.low_fuel_warning.available, gui.low_fuel_warning.unavailable, gui.low_fuel_warning.times, this.phase === 'run');
    this.drawBlinkingSign(g, gui.thief_near_sign, this.signs.nearShown ? this.signs.thiefNear : -1, gui.thief_near_sign.available, gui.thief_near_sign.unavailable, gui.thief_near_sign.times, this.phase === 'run');
    if (this.phase === 'lost') g.drawImage(this.image(gui.no_fuel_sign.texture).surface.canvas, gui.no_fuel_sign.x, gui.no_fuel_sign.y);
    if (this.phase === 'won') g.drawImage(this.image(gui.win_sign.texture).surface.canvas, gui.win_sign.x, gui.win_sign.y);
  }

  private drawBlinkingSign(g: CanvasRenderingContext2D, sign: any, start: number, on: number, off: number, times: number, active: boolean): void {
    if (start < 0 || !active) return;
    const t = (this.clock - start) * 1000;
    const cycle = on + off;
    if (t < 0 || t >= cycle * times) return;
    if (t % cycle < on) g.drawImage(this.image(sign.texture).surface.canvas, sign.x, sign.y);
  }

  private drawDialog(g: CanvasRenderingContext2D): void {
    const d = this.data.gui.exit_dialog;
    g.drawImage(this.image(d.background.src).surface.canvas, d.background.pos.x, d.background.pos.y);
    if (this.overYes) g.drawImage(this.image(d.yes.src).surface.canvas, d.yes.pos.x, d.yes.pos.y);
    if (this.overNo) g.drawImage(this.image(d.no.src).surface.canvas, d.no.pos.x, d.no.pos.y);
    const cur = this.game.get_default_mouse_cursor();
    if (cur) g.drawImage(cur.surface.canvas, input.pos[0], input.pos[1]);
  }
}

void Rect;

/** start(stage, thief picture, avatar picture, time of day, map file, thief car colour, callback): the callback receives 1 when the thief is arrested */
export function start(stage: Stage, thiefImage: string, avatarImage: string, timeOfDay: string, mapPath: string, color: string, done: (result: number) => void): void {
  const m = /p3_map_(\w+)\.yaml/.exec(mapPath);
  const racer = new RacerStage(stage.game, stage, { thiefImage: nameOf(thiefImage), avatarImage: nameOf(avatarImage), timeOfDay, map: m ? m[1] : 'beach', color, done });
  stage.game.set_stage(racer);
}
