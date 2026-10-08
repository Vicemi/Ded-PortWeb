// framework/engine.py: the Game object. It owns the 600x450 window, the current stage and the loading curtain, and runs the 40 fps loop.
import { BlindDirection, blind_layer, cancel_blind_layer } from './animations';
import { CustomSound, Image_, load_font, load_image, load_sound } from './assets';
import { Font } from './font';
import { ItemImage, Layer } from './items';
import { Rect, Surface, draw, keyboard, time } from './pygame';
import { blindHook, type GameLike, Stage } from './stage';
import { mixer } from './sounds';

export const SCREEN_WIDTH = 600;
export const SCREEN_HEIGHT = 450;
export const FPS = 40;

/** a stage that stands for the next one: at the next tick it closes the old stage and opens the new one */
class ChangeStageDummy {
  constructor(private game: Game, private old_stage: Stage | ChangeStageDummy | null, private new_stage: Stage) {}
  notify_tick(): void {
    const old_stage = this.old_stage;
    this.game.set_current(this.new_stage);
    if (old_stage instanceof Stage) {
      old_stage.set_focus(null);
      const closed = old_stage.get_closed_handler();
      if (closed !== null) closed(old_stage);
      old_stage.close();
    }
    keyboard.set_repeat();
    if (old_stage instanceof Stage) { old_stage.stop_music(); old_stage.stop_sounds(); }
    if (this.game.loading_layer !== null) this.game.loading_layer.stage = null;
    this.new_stage.play_music();
    if (!this.new_stage.initialized) { this.new_stage.initialize(); this.new_stage.initialized = true; }
    if (this.game.loading_layer !== null) this.game.loading_layer.stage = this.new_stage;
    this.new_stage.redraw();
    this.new_stage.prepare();
    if (this.game.loading_layer !== null) this.game.hide_loading(this.game.hide_loading_callback);
  }
  set_focus(): void { /* nothing */ }
  close(): void { /* nothing */ }
  stop_music(): void { /* nothing */ }
  stop_sounds(): void { /* nothing */ }
  get_closed_handler(): null { return null; }
  /** (the real stage of a ChangeStageDummy is not drawn before the switch) */
  redraw_mouse(): void { /* nothing */ }
}

export class Game implements GameLike {
  window: Surface;
  display: HTMLCanvasElement | null = null;
  private displayCtx: CanvasRenderingContext2D | null = null;
  loading_layer: Layer | null = null;
  hide_loading_callback: ((layer: Layer | null) => void) | null = null;
  stats: { save_if_pending(): void } = { save_if_pending: () => undefined };

  private stage: Stage | ChangeStageDummy | null = null;
  private next_stage: ChangeStageDummy | null = null;
  private design_stage: Stage | null = null;
  private test_stage: Stage | null = null;
  private default_mouse_cursor: Image_ | null;
  private loading_image: string | null;
  private show_fps = false;
  private frame_delay = 0;
  private quit_game = false;
  private font: Font;
  private development_mode = false;
  private quit_on_escape = true;
  private loading_start: number | null = null;
  private empty_sound: CustomSound;
  private last_tick = 0;
  private fps_value = 0;
  private fps_times: number[] = [];
  /** the frames are not run until this time (pygame.time.wait of the original) */
  private blocked_until = 0;
  private pending_hide: { until: number; callback: ((l: Layer | null) => void) | null; blind: boolean } | null = null;
  onQuit: (() => void) | null = null;

  constructor(public title: string, default_mouse_cursor: string | null = null, loading_image: string | null = null) {
    this.empty_sound = load_sound('Silence.ogg');
    this.window = new Surface(SCREEN_WIDTH, SCREEN_HEIGHT, false);
    this.loading_image = loading_image;
    this.font = load_font('freesansbold.ttf', 13);
    this.default_mouse_cursor = default_mouse_cursor === null ? null : load_image(default_mouse_cursor);
    mixer.set_reserved(1);
    void blindHook;
  }

  /** attaches the visible canvas the window is copied to */
  attach(canvas: HTMLCanvasElement): void {
    this.display = canvas;
    canvas.width = SCREEN_WIDTH; canvas.height = SCREEN_HEIGHT;
    this.displayCtx = canvas.getContext('2d', { alpha: false });
  }

  /** Starts the game with its first stage (the loop itself is driven by `tick`). */
  run(initial_stage: Stage): void {
    this.set_stage(initial_stage);
    this.last_tick = time.get_ticks();
  }
  /** One iteration of the main loop (the original: `clock.tick(40)`, then `stage.notify_tick()`). */
  tick(): void {
    if (this.quit_game || this.stage === null) return;
    const now = time.get_ticks();
    if (now < this.blocked_until) { this.last_tick = now; return; }
    if (this.pending_hide) {
      if (now < this.pending_hide.until) { this.last_tick = now; return; }
      const p = this.pending_hide;
      this.pending_hide = null;
      this.finish_hide_loading(p.callback, p.blind);
    }
    this.frame_delay = Math.max(1, now - this.last_tick);
    this.last_tick = now;
    this.fps_times.push(now);
    while (this.fps_times.length > 40) this.fps_times.shift();
    if (this.fps_times.length > 1) this.fps_value = (this.fps_times.length - 1) * 1000 / (now - this.fps_times[0]);
    (this.stage as Stage).notify_tick();
  }
  /** pygame.time.wait: nothing runs (events pile up) for this long */
  block(ms: number): void { this.blocked_until = Math.max(this.blocked_until, time.get_ticks() + ms); }

  quit(): void {
    const s = this.stage;
    if (s instanceof Stage) {
      const closed = s.get_closed_handler();
      if (closed !== null) closed(s);
    }
    this.quit_game = true;
    this.stats.save_if_pending();
    this.onQuit?.();
  }
  is_quit(): boolean { return this.quit_game; }
  /** (the web version restarts the game after a quit) */
  resume(): void { this.quit_game = false; }

  get_show_fps(): boolean { return this.show_fps; }
  set_show_fps(value: boolean): void { this.show_fps = value; (this.stage as Stage).redraw(); }
  get_quit_on_escape(): boolean { return this.quit_on_escape; }
  set_quit_on_escape(v: boolean): void { this.quit_on_escape = v; }
  get_default_mouse_cursor(): Image_ | null { return this.default_mouse_cursor; }
  get_design_stage(): Stage | null { return this.design_stage; }
  set_design_stage(s: Stage | null): void { this.design_stage = s; }
  get_test_stage(): Stage | null { return this.test_stage; }
  set_test_stage(s: Stage | null): void { this.test_stage = s; }
  get_development_mode(): boolean { return this.development_mode; }
  set_development_mode(v: boolean): void { this.development_mode = v; }
  get_current_stage(): Stage | null { return this.stage instanceof Stage ? this.stage : null; }
  set_current(stage: Stage): void { this.stage = stage; }

  set_stage(stage: Stage, show_loading = false, loading_image: string | null = null): void {
    const next = new ChangeStageDummy(this, this.stage, stage);
    if (!show_loading) this.stage = next;
    else {
      this.next_stage = next;
      this.show_loading(bind(this.set_next_stage, this), loading_image);
    }
  }

  /** Curtain with the loading picture that comes down before a heavy stage is loaded. */
  show_loading(callback: ((l: Layer) => void) | null, loading_image: string | null = null): void {
    const cur = this.stage as Stage;
    cur.stop_music();
    if (this.loading_layer !== null) {
      const st = this.loading_layer.get_stage();
      if (st !== null) { cancel_blind_layer(st, this.loading_layer, false); st.remove_layer(this.loading_layer); }
    }
    this.loading_layer = new Layer();
    const image = load_image(loading_image ?? this.loading_image!);
    this.loading_layer.add(new ItemImage(0, 0, image));
    this.loading_layer.stage = cur;
    if (this.loading_start === null) this.loading_start = time.get_ticks();
    blind_layer(this.loading_layer, BlindDirection.SHOW_DOWN, null, 450, callback);
  }
  add_loading_to_stage(): Layer | null {
    const layer = this.loading_layer;
    if (layer !== null) { layer.stage = null; (this.stage as Stage).add_layer(layer); }
    this.loading_layer = null;
    return layer;
  }
  /** The curtain goes up; the picture stays for at least 1.5 seconds since it came down. */
  hide_loading(callback: ((l: Layer | null) => void) | null = null, blind = true): void {
    if (this.loading_layer !== null) {
      let until = time.get_ticks();
      if (this.loading_start !== null) {
        const elapsed = time.get_ticks() - this.loading_start;
        this.loading_start = null;
        if (elapsed < 1500) until += 1500 - elapsed;
      }
      this.hide_loading_callback = callback;
      this.pending_hide = { until, callback, blind };
      if (until <= time.get_ticks()) { const p = this.pending_hide; this.pending_hide = null; this.finish_hide_loading(p.callback, p.blind); }
    } else if (callback !== null) callback(null);
  }
  private finish_hide_loading(callback: ((l: Layer | null) => void) | null, blind: boolean): void {
    this.hide_loading_callback = callback;
    if (this.loading_layer === null) { if (callback) callback(null); return; }
    if (this.loading_layer.get_stage() !== null) {
      if (blind) blind_layer(this.loading_layer, BlindDirection.HIDE_UP, null, 450, bind(this.blind_hide_loading_callback, this));
      else this.blind_hide_loading_callback(this.loading_layer);
    }
  }
  private set_next_stage(): void { this.stage = this.next_stage; this.next_stage = null; }
  private blind_hide_loading_callback(layer: Layer): void {
    (this.stage as Stage).render();
    this.loading_layer = null;
    const cb = this.hide_loading_callback;
    this.hide_loading_callback = null;
    if (cb !== null) cb(layer);
  }

  get_window_size(): [number, number] { return this.window.get_size(); }
  get_frame_delay(): number { return this.frame_delay; }
  get_empty_sound(): CustomSound { return this.empty_sound; }

  draw_fps(): void {
    const text = this.font.render('FPS: ' + (Math.round(this.fps_value * 100) / 100), true, [0, 0, 0]);
    const w = text.get_width() + 10;
    const border = new Rect(0, 0, w, text.get_height() + 4);
    this.window.set_clip(border);
    draw.rect(this.window, [250, 250, 250], border);
    draw.rect(this.window, [20, 20, 20], border, 1);
    this.window.blit(text, [4, 2]);
    this.window.set_clip(null);
  }
  /** copies the window to the visible canvas */
  update_display(): void {
    if (this.displayCtx !== null && this.display !== null) this.displayCtx.drawImage(this.window.canvas, 0, 0);
  }
}

function bind<T extends (...a: any[]) => any>(fn: T, obj: object): T { return fn.bind(obj) as T; }
