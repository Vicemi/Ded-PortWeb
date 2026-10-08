// framework/stage.py: Stage (events, timers, dialogs, music, mouse cursor), StageIso (isometric grid of ItemCell) and the iso item definitions.
import { CustomSound, Image_, load_data, load_image, load_mask } from './assets';
import {
  ACTIVEEVENT, KEYDOWN, K, KMOD_ALT, KMOD_CTRL, KMOD_LSHIFT, MOUSEBUTTONDOWN, MOUSEBUTTONUP, MOUSEMOTION, QUIT, USEREVENT, Rect, Surface, event as pgevent, input,
  keyboard, key as pgkey, mouse, time, transform, type PgEvent,
} from './pygame';
import { mixer } from './sounds';
import {
  bound, Item, ItemEvent, ItemEventArgs, ItemEventArgsMouse, ItemEventArgsStateChanged, ItemImage, Layer, type Handler,
} from './items';

export const MUSIC_ENDSOUND_EVENT = USEREVENT;
export const DBLCLICK_DELAY = 500;

export type TimerKey = unknown;
type TimerFunc = (key: TimerKey, data: any) => void;

/** Python tuples compare by value: a timer key such as (item, 'fade') is an array here */
export function keyEq(a: TimerKey, b: TimerKey): boolean {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!keyEq(a[i], b[i])) return false;
    return true;
  }
  return false;
}

export interface GameLike {
  window: Surface;
  loading_layer: Layer | null;
  get_window_size(): [number, number];
  get_default_mouse_cursor(): Image_ | null;
  get_frame_delay(): number;
  get_show_fps(): boolean;
  set_show_fps(v: boolean): void;
  get_quit_on_escape(): boolean;
  quit(): void;
  get_design_stage(): Stage | null;
  get_test_stage(): Stage | null;
  get_development_mode(): boolean;
  set_stage(stage: Stage, show_loading?: boolean, loading_image?: string | null): void;
  draw_fps(): void;
  update_display(): void;
  get_empty_sound(): CustomSound;
}

class TimerData {
  tick: number;
  constructor(public key: TimerKey, public milliseconds: number, public func: TimerFunc, public data: unknown, public drop_ticks: boolean, public render_first: boolean) {
    this.tick = time.get_ticks() + milliseconds;
  }
}

type DialogData = [Layer, ((e: PgEvent) => unknown) | null, Layer | null, Layer | null, (() => void) | null];

export class Stage {
  game: GameLike;
  layers: Layer[] = [];
  initialized = false;
  target_surface: Surface | null;
  private dialogs: DialogData[] = [];
  private changed_handler: ((stage: Stage) => void) | null = null;
  private closed_handler: ((stage: Stage) => void) | null = null;
  private last_click: number | null = null;
  private locks = 0;
  private background: Image_ | null = null;
  private background_color: readonly number[] = [0, 0, 0];
  private timers: TimerData[] = [];
  private music: [CustomSound | null, CustomSound | null] | null = null;
  private music_data: [CustomSound | null, CustomSound | null] | null = null;
  private over_item: Item | null = null;
  private focused_item: [Item, any] | null = null;
  private mouse_layer: Layer | null = null;
  private mouse_cursor: Item | null = null;
  private mouse_snap_to_cursor = false;
  private mouse_update = false;
  private mouse_real_pos: [number, number] | null = null;
  private use_mouse_layer = false;
  private mouse_pointer: readonly number[] = [0, 0];
  private mouse_move_area: Rect | ((x: number, y: number) => [number, number]) | null = null;
  private leftmousedown_handlers: [Item, (args: ItemEventArgsMouse, released: boolean) => void][] = [];
  private default_mouse_cursor: ItemImage | null = null;
  private previous_active = true;
  private rendering = 0;

  constructor(game: GameLike, background_image: Image_ | null = null, target_surface: Surface | null = null) {
    this.game = game;
    this.target_surface = target_surface;
    this.load_background(background_image);
    if (target_surface === null) {
      const c = game.get_default_mouse_cursor();
      if (c !== null) {
        this.default_mouse_cursor = new ItemImage(0, 0, c);
        this.set_mouse_cursor(this.default_mouse_cursor);
      }
    }
  }

  /** Called before the stage is shown for the first time (after the memory of the previous stage was released). */
  initialize(): void { /* overridden */ }
  /** Called when the stage was the current stage and a new one will be shown. */
  close(): void { /* overridden */ }
  prepare(): void { /* overridden */ }
  handle_event(_e: PgEvent): unknown { return 0; }

  // ------------------------------------------------------------------------------------------------------------------------ layers
  /** (pre-rendering below dialogs is a drawing optimisation of the original; every frame is drawn in full here) */
  set_prerender_buffer(_to_layer: Layer | null): void { /* nothing */ }
  add_layer(layer: Layer, index = -1): void {
    layer.set_stage(this);
    if (index === -1) this.layers.push(layer); else this.layers.splice(index, 0, layer);
    this.mouse_update = true;
  }
  remove_layer(layer: Layer): void {
    const i = this.layers.indexOf(layer);
    if (i < 0) return;
    if (this.focused_item !== null && this.focused_item[0].get_layer() === layer) this.set_focus(null);
    layer.set_stage(null);
    this.layers.splice(i, 1);
    this.redraw();
    for (let k = 0; k < this.dialogs.length; k++) if (this.dialogs[k][0] === layer) { this.dialogs.splice(k, 1); break; }
    this.mouse_update = true;
  }
  empty_layers(except_layers: Layer[] | null = null): void {
    if (except_layers === null) {
      for (const l of this.layers) l.set_stage(null);
      this.layers.length = 0;
    } else {
      let k = this.layers.length - 1;
      while (k >= 0) {
        const l = this.layers[k];
        if (!except_layers.includes(l)) { l.set_stage(null); this.layers.splice(k, 1); }
        k--;
      }
    }
    // (in both cases)
    this.dialogs.length = 0;
    this.redraw();
  }
  contains_layer(layer: Layer): boolean { return this.layers.includes(layer); }

  // ------------------------------------------------------------------------------------------------------------------------ dialogs
  show_dialog(layer: Layer, event_handler: ((e: PgEvent) => unknown) | null, background_color: readonly number[] | null = [0, 0, 0, 180], _prerender_below = true,
    callback: (() => void) | null = null): void {
    if (this.layers.includes(layer)) throw new Error('The layer must be a layer of the stage if you want to use it as a dialog');
    let background_layer: Layer | null = null;
    if (background_color !== null) {
      const [w, h] = this.game.get_window_size();
      const surface = new Surface(Math.floor(w / 2), Math.floor(h / 2), true);
      surface.fill(background_color);
      const image = new Image_(surface);
      background_layer = new Layer();
      background_layer.add(new ItemImage(0, 0, image));
      background_layer.add(new ItemImage(Math.floor(w / 2), 0, image));
      background_layer.add(new ItemImage(0, Math.floor(h / 2), image));
      background_layer.add(new ItemImage(Math.floor(w / 2), Math.floor(h / 2), image));
      this.add_layer(background_layer);
    }
    if (event.get_grab()) event.set_grab(false);
    this.add_layer(layer);
    this.dialogs.push([layer, event_handler, background_layer, null, callback]);
    this.set_mouse_cursor(null);
  }
  close_dialog(layer: Layer): void {
    let callback: (() => void) | null = null;
    for (const dialog of this.dialogs.slice()) {
      if (dialog[0] === layer) {
        callback = dialog[4];
        this.dialogs.splice(this.dialogs.indexOf(dialog), 1);
        let k = 0;
        while (k < this.layers.length) {
          if (this.layers[k] === layer) {
            this.remove_layer(layer);
            while (k < this.layers.length) this.remove_layer(this.layers[k]);
          }
          k++;
        }
        const background_layer = dialog[2];
        if (background_layer !== null) this.remove_layer(background_layer);
      }
    }
    if (callback !== null) callback();
  }
  has_dialog_opened(): boolean { return this.dialogs.length > 0; }
  blind_dialog(layer: Layer, direction: number, background = true, ignore_layers: Layer[] = [], callback: ((l: Layer) => void) | null = null): void {
    const layers_to_blind: Layer[] = [];
    for (const dialog of this.dialogs) {
      if (dialog[0] === layer) {
        if (dialog[2] !== null && background) layers_to_blind.push(dialog[2]);
        if (!ignore_layers.includes(layer)) layers_to_blind.push(layer);
        const idx = this.layers.indexOf(layer);
        if (idx >= 0) for (let k = idx + 1; k < this.layers.length; k++) if (!ignore_layers.includes(this.layers[k])) layers_to_blind.push(this.layers[k]);
        break;
      }
    }
    let callback_assigned = false;
    for (let i = 0; i < layers_to_blind.length; i++) {
      let blind_callback: ((l: Layer) => void) | null = null;
      if (i === layers_to_blind.length - 1) { blind_callback = callback; callback_assigned = true; }
      blindHook.blind_layer(layers_to_blind[i], direction, null, 450, blind_callback);
    }
    if (!callback_assigned && callback !== null) callback(layer);
  }

  lock_ui(): void { this.locks++; this.mouse_update = true; }
  unlock_ui(): void { this.locks--; this.mouse_update = true; }
  update_mouse(): void { this.mouse_update = true; }

  // ------------------------------------------------------------------------------------------------------------------------ hit tests
  hit_test(x: number, y: number): Item | null {
    if (this.locks === 0) {
      let stop: Layer | null = null;
      if (this.dialogs.length > 0) stop = this.dialogs[this.dialogs.length - 1][0];
      for (let i = this.layers.length - 1; i >= 0; i--) {
        const layer = this.layers[i];
        if (layer.get_visible() && layer.is_inside_clip(x, y)) {
          for (let k = layer.items.length - 1; k >= 0; k--) {
            const item = layer.items[k];
            if (item.get_visible() && item.is_over(x, y)) return item;
          }
        }
        if (stop !== null && layer === stop) break;
      }
    }
    return null;
  }
  hit_test_stack(x: number, y: number, ignore_clip = false): Item[] {
    const stack: Item[] = [];
    const l = this.layers.length;
    let i: number;
    if (this.locks > 0) i = l;
    else if (this.dialogs.length === 0) i = 0;
    else {
      const dialog_layer = this.dialogs[this.dialogs.length - 1][0];
      i = l - 1;
      while (i > 0) { if (this.layers[i] === dialog_layer) break; i--; }
    }
    while (i < l) {
      const layer = this.layers[i];
      if (layer.get_visible() && (ignore_clip || layer.is_inside_clip(x, y))) {
        for (let k = layer.items.length - 1; k >= 0; k--) {
          const item = layer.items[k];
          if (item.get_visible() && item.is_over(x, y, ignore_clip)) stack.push(item);
        }
      }
      i++;
    }
    return stack;
  }

  // ------------------------------------------------------------------------------------------------------------------------ music
  set_music(intro: CustomSound | null, loop: CustomSound | null): void { this.music = intro === null && loop === null ? null : [intro, loop]; }
  get_music(): [CustomSound | null, CustomSound | null] | null { return this.music; }
  same_music(stage: Stage): boolean {
    const a = this.music, b = stage.music;
    if (a === null || b === null) return a === b;
    return a[0]?.sound === b[0]?.sound && a[1]?.sound === b[1]?.sound;
  }
  play_music(intro: CustomSound | null = null, loop: CustomSound | null = null): void {
    this.stop_music();
    if (intro === null && loop === null && this.music !== null) { intro = this.music[0]; loop = this.music[1]; }
    if (intro !== null || loop !== null) {
      this.music_data = [intro, loop];
      const ch = mixer.Channel(0);
      ch.set_volume(1);
      if (intro !== null) {
        ch.play(intro.sound, 0, 0);
        if (loop !== null) ch.queue(loop.sound);
        ch.set_endevent(MUSIC_ENDSOUND_EVENT);
      } else ch.play(loop!.sound, -1);
    }
  }
  set_music_volume(volume: number, fadems = 200, pause = false): void {
    this.stop_timer('set_music_volume');
    const current = mixer.Channel(0).get_volume();
    this.start_timer('set_music_volume', 1, bound(this, this.on_set_music_volume), [current, volume, fadems, time.get_ticks(), pause], true, false);
  }
  pause_music(fadems = 450): void { this.set_music_volume(0, fadems, true); }
  unpause_music(fadems = 450): void { mixer.Channel(0).unpause(); this.set_music_volume(1, fadems); }
  stop_music(): void {
    this.stop_timer('set_music_volume');
    if (this.music_data !== null) {
      this.music_data = null;
      const ch = mixer.Channel(0);
      ch.set_endevent();
      ch.queue(this.game.get_empty_sound().sound);
      ch.fadeout(200);
    }
  }
  stop_sounds(): void { mixer.stopAll(); }
  private on_set_music_volume(key: TimerKey, data: [number, number, number, number, boolean]): void {
    const [start_volume, target_volume, fadems, start_time, pause] = data;
    const elapsed = time.get_ticks() - start_time;
    let volume: number, end = false;
    if (elapsed >= fadems) { volume = target_volume; this.stop_timer(key); end = true; }
    else volume = start_volume + ((target_volume - start_volume) / fadems) * elapsed;
    const ch = mixer.Channel(0);
    ch.set_volume(volume);
    if (end && pause) ch.pause();
  }

  // ------------------------------------------------------------------------------------------------------------------------ mouse cursor
  get_mouse_cursor(): Item | null { return this.mouse_cursor; }
  set_mouse_cursor(cursor: Item | null, pointer: readonly number[] = [0, 0], use_mouse_layer = true, update_item_pos = true,
    move_area: Rect | ((x: number, y: number) => [number, number]) | null = null): void {
    if (this.mouse_cursor !== cursor) {
      if (use_mouse_layer) {
        if (this.mouse_layer === null) { this.mouse_layer = new Layer(); this.mouse_layer.set_stage(this); }
        if (cursor === null) this.mouse_layer.empty();
        else if (!this.mouse_layer.contains(cursor)) { this.mouse_layer.empty(); this.mouse_layer.add(cursor); }
      } else if (this.mouse_layer !== null) this.mouse_layer.empty();
      if (update_item_pos && cursor !== null) {
        if (this.mouse_snap_to_cursor) {
          if (this.mouse_cursor !== null) {
            const x = this.mouse_cursor.get_left() + this.mouse_pointer[0];
            const y = this.mouse_cursor.get_top() + this.mouse_pointer[1];
            cursor.set_lefttop(x - pointer[0], y - pointer[1]);
          }
        } else {
          const [x, y] = mouse.get_pos();
          cursor.set_lefttop(x - pointer[0], y - pointer[1]);
        }
      }
      this.mouse_cursor = cursor;
      this.use_mouse_layer = use_mouse_layer;
      this.mouse_move_area = move_area;
      this.mouse_pointer = pointer;
      this.mouse_update = true;
      if (cursor !== null && !update_item_pos) this.mouse_snap_to_cursor = true;
      if (cursor === null) {
        if (this.default_mouse_cursor !== null) {
          this.set_mouse_cursor(this.default_mouse_cursor);
          this.mouse_snap_to_cursor = false;
        }
      }
    }
  }
  set_mouse_pos(x: number, y: number): void {
    if (this.mouse_cursor !== null) {
      this.mouse_cursor.set_lefttop(x - this.mouse_pointer[0], y - this.mouse_pointer[1]);
      this.mouse_snap_to_cursor = true;
    }
  }
  redraw_mouse(): void { /* the mouse layer is drawn every frame */ }
  capture_leftmousedown(item: Item, handler: (args: ItemEventArgsMouse, released: boolean) => void): void {
    let button1 = !!mouse.get_pressed()[0];
    if (!button1) {
      const key = 'mouse_button_keys';
      if (this.is_timer_started(key)) {
        const data = this.get_timer_data(key) as [boolean[]] | null;
        if (data !== null && data[0]) button1 = true;
      }
    }
    if (!button1) {
      const [x, y] = mouse.get_pos();
      handler(new ItemEventArgsMouse(x, y), true);
    } else {
      let defined = false;
      for (const hd of this.leftmousedown_handlers) if (hd[0] === item && hd[1] === handler) { defined = true; break; }
      if (!defined) this.leftmousedown_handlers.push([item, handler]);
    }
  }

  // ------------------------------------------------------------------------------------------------------------------------ timers
  start_timer(key: TimerKey, milliseconds: number, func: TimerFunc, data: unknown = null, drop_ticks = false, render_first = false): void {
    for (let i = 0; i < this.timers.length; i++) if (keyEq(this.timers[i].key, key)) { this.stop_timer(key); break; }
    milliseconds = Math.max(1, milliseconds);
    this.timers.push(new TimerData(key, milliseconds, func, data, drop_ticks, render_first));
  }
  /** returns the data of the stopped timer (null when there was none) */
  stop_timer(key: TimerKey): any {
    for (let i = 0; i < this.timers.length; i++) {
      if (keyEq(this.timers[i].key, key)) { const d = this.timers[i].data; this.timers.splice(i, 1); return d; }
    }
    return null;
  }
  stop_timers(): void { this.timers.length = 0; }
  is_timer_started(key: TimerKey): boolean { return this.timers.some((t) => keyEq(t.key, key)); }
  get_timer_data(key: TimerKey): any { for (const t of this.timers) if (keyEq(t.key, key)) return t.data; return null; }
  get_key_repeat(): [number, number] | null { return null; }

  get_changed_handler(): ((stage: Stage) => void) | null { return this.changed_handler; }
  set_changed_handler(h: ((stage: Stage) => void) | null): void { this.changed_handler = h; }
  get_closed_handler(): ((stage: Stage) => void) | null { return this.closed_handler; }
  set_closed_handler(h: ((stage: Stage) => void) | null): void { this.closed_handler = h; }

  // ------------------------------------------------------------------------------------------------------------------------ focus
  set_focus(item: Item | null, set_focus_data: unknown = null): void {
    const old = this.focused_item;
    const old_item = old ? old[0] : null;
    const old_data = old ? old[1] : null;
    if (old_item !== item) {
      this.focused_item = null;
      if (old_item !== null) {
        old_item.on_lost_focus(this, old_data);
        old_item.fire_event(ItemEvent.LOST_FOCUS, new ItemEventArgs());
      }
      if (item === null) this.focused_item = null;
      else {
        const data = item.on_got_focus(set_focus_data);
        this.focused_item = [item, data];
        item.fire_event(ItemEvent.GOT_FOCUS, new ItemEventArgs());
      }
    }
  }
  get_focus(): Item | null { return this.focused_item === null ? null : this.focused_item[0]; }
  get_focus_data(): any { return this.focused_item === null ? null : this.focused_item[1]; }
  get_over_item(): Item | null { return this.over_item; }

  // ------------------------------------------------------------------------------------------------------------------------ the frame
  /** One tick of the game loop: input events, timers, drawing. */
  notify_tick(): void {
    let event_handler: ((e: PgEvent) => unknown) | null;
    if (this.locks > 0) event_handler = null;
    else if (this.dialogs.length === 0) event_handler = bound(this, this.handle_event);
    else event_handler = this.dialogs[this.dialogs.length - 1][1];
    const mouse_rel = [0, 0];
    let mouse_motion_args: [number, number, [number, number, number], number, number] | null = null;
    for (const ev of pgevent.get()) {
      let processed = false;
      if (ev.type === MOUSEMOTION) {
        mouse_rel[0] += ev.rel![0]; mouse_rel[1] += ev.rel![1];
        mouse_motion_args = [ev.pos![0], ev.pos![1], ev.buttons!, mouse_rel[0], mouse_rel[1]];
      } else if (ev.type === QUIT) {
        this.game.quit();
        processed = true;
      } else if (ev.type === KEYDOWN) {
        if (ev.key === pgkey('f') && ((ev.mod ?? 0) & (KMOD_CTRL | KMOD_ALT))) {
          this.game.set_show_fps(!this.game.get_show_fps());
          processed = true;
        } else if (ev.key === K.ESCAPE) {
          if (this.game.get_quit_on_escape()) { this.game.quit(); processed = true; }
        } else if (ev.key === K.F10 || (ev.mod === KMOD_LSHIFT && ev.key === pgkey('0'))) {
          const design = this.game.get_design_stage();
          if (design !== null && this.game.get_development_mode()) { this.game.set_stage(design); processed = true; }
        } else if (ev.mod === KMOD_LSHIFT && ev.key === pgkey('1')) {
          const test = this.game.get_test_stage();
          if (test !== null && this.game.get_development_mode()) { this.game.set_stage(test); processed = true; }
        }
      } else if (ev.type === MOUSEBUTTONDOWN) {
        this.on_mouse_button_down(ev.pos![0], ev.pos![1], ev.button!);
      } else if (ev.type === MOUSEBUTTONUP) {
        this.on_mouse_button_up(ev.pos![0], ev.pos![1], ev.button!);
      } else if (ev.type === ACTIVEEVENT) {
        if (ev.gain) {
          if (!this.previous_active) {
            if (this.use_mouse_layer && this.mouse_layer !== null && !this.mouse_layer.contains(this.mouse_cursor)) this.mouse_layer.add(this.mouse_cursor!);
            this.previous_active = true;
          }
        } else if (this.previous_active) {
          if (this.mouse_layer !== null) this.mouse_layer.empty();
          this.previous_active = false;
        }
      } else if (ev.type === MUSIC_ENDSOUND_EVENT) {
        if (this.music_data !== null && this.music_data[1] !== null) mixer.Channel(0).queue(this.music_data[1].sound);
      }
      if (!processed && this.focused_item !== null) {
        if (this.focused_item[0].handle_event_focused(ev, this.focused_item[1])) processed = true;
      }
      if (!processed && event_handler !== null) event_handler(ev);
      if (!processed) this.process_mouse_keys(ev);
    }
    if (mouse_motion_args) this.on_mouse_move(...mouse_motion_args);
    if (this.mouse_update) { this.mouse_update = false; this.render(true); } else this.render(false);
  }

  private on_mouse_move(x: number, y: number, buttons: [number, number, number], _rx: number, _ry: number): void {
    const data = this.get_timer_data('mouse_button_keys') as [number[]] | null;
    if (data !== null) buttons = data[0] as unknown as [number, number, number];
    if (this.use_mouse_layer && this.mouse_layer !== null && !this.mouse_layer.contains(this.mouse_cursor)) this.mouse_layer.add(this.mouse_cursor!);
    this.previous_active = true;
    const item_stack = this.update_over_item(x, y);
    this.fire_routed_event(item_stack, ItemEvent.MOUSE_MOVE, new ItemEventArgsMouse(x, y));
    if (buttons[0] === 1 && this.leftmousedown_handlers.length > 0) {
      const args = new ItemEventArgsMouse(x, y);
      for (const hd of this.leftmousedown_handlers.slice()) hd[1](args, false);
    }
  }
  private on_mouse_button_down(px: number, py: number, button: number): void {
    if (button !== 1) return;
    let x = px, y = py;
    let item_stack: Item[] | null = null;
    if (this.mouse_cursor !== null) {
      x = this.mouse_cursor.get_left() + this.mouse_pointer[0];
      y = this.mouse_cursor.get_top() + this.mouse_pointer[1];
      if (pgevent.get_grab()) item_stack = [this.mouse_cursor];
    }
    if (item_stack === null) item_stack = this.hit_test_stack(x, y);
    if (this.focused_item !== null && !item_stack.includes(this.focused_item[0])) this.set_focus(null);
    let dblclick = false;
    if (this.last_click !== null && time.get_ticks() - this.last_click < DBLCLICK_DELAY) dblclick = true;
    if (dblclick) this.last_click = null; else this.last_click = time.get_ticks();
    if (item_stack.length > 0) {
      this.fire_routed_event(item_stack, ItemEvent.CLICK, new ItemEventArgsMouse(x, y));
      if (dblclick) this.fire_routed_event(item_stack, ItemEvent.DBLCLICK, new ItemEventArgsMouse(x, y));
    }
  }
  private on_mouse_button_up(x: number, y: number, button: number): void {
    if (button === 1 && this.leftmousedown_handlers.length > 0) {
      const args = new ItemEventArgsMouse(x, y);
      for (const hd of this.leftmousedown_handlers.slice()) hd[1](args, true);
      this.leftmousedown_handlers = [];
      this.update_over_item(x, y);
    }
  }
  // keypad keys move the mouse and press its buttons (accessibility feature of the original)
  private process_mouse_keys(ev: PgEvent): void {
    if (ev.type !== KEYDOWN) return;
    const k = ev.key!;
    if (k === K.KP4 || k === K.KP6 || k === K.KP2 || k === K.KP8) {
      const key = 'mouse_pos_keys';
      let data = this.get_timer_data(key);
      if (data === null) data = [1];
      this.start_timer(key, 30, bound(this, this.update_mouse_position_keys), data);
      this.update_mouse_position_keys(key, data);
    } else if (k === K.KP7 || k === K.KP9 || k === K.KP1 || k === K.KP3) {
      const key = 'mouse_button_keys';
      let data = this.get_timer_data(key);
      if (data === null) data = [[false, false, false]];
      this.start_timer(key, 30, bound(this, this.update_mouse_button_keys), data);
      this.update_mouse_button_keys(key, data);
    }
  }
  private update_mouse_position_keys(key: TimerKey, data: [number]): void {
    const increment = data[0];
    if (increment < 30) data[0] += 1;
    const pressed = keyboard.get_pressed();
    let [x, y] = mouse.get_pos();
    let processed = false;
    if (pressed.has(K.KP4)) { x -= increment; processed = true; }
    if (pressed.has(K.KP6)) { x += increment; processed = true; }
    if (pressed.has(K.KP8)) { y -= increment; processed = true; }
    if (pressed.has(K.KP2)) { y += increment; processed = true; }
    if (!processed) this.stop_timer(key);
    else {
      if (x < 0) x = 0;
      if (y < 0) y = 0;
      if (x >= 600) x = 599;
      if (y >= 450) y = 449;
      mouse.set_pos(x, y);
      input.queue.push({ type: MOUSEMOTION, pos: [x, y], rel: [0, 0], buttons: input.buttons });
    }
  }
  private update_mouse_button_keys(key: TimerKey, data: [boolean[]]): void {
    const old_state = data[0];
    const new_state = [false, false, false];
    data[0] = new_state;
    const pressed = keyboard.get_pressed();
    let processed = false;
    if (pressed.has(K.KP3)) { new_state[0] = true; processed = true; }
    for (let i = 0; i < old_state.length; i++) {
      if (old_state[i] !== new_state[i]) {
        const [x, y] = mouse.get_pos();
        if (new_state[i]) this.on_mouse_button_down(x, y, i + 1); else this.on_mouse_button_up(x, y, i + 1);
      }
    }
    if (!processed) this.stop_timer(key);
  }
  private fire_routed_event(item_stack: Item[], event_type: number, args: ItemEventArgs): void {
    for (let k = item_stack.length - 1; k >= 0; k--) if (item_stack[k].fire_event(event_type, args)) break;
  }

  private update_over_item(x: number, y: number): Item[] {
    const item_stack = this.hit_test_stack(x, y);
    let new_over_item: Item | null;
    if (this.target_surface === null && this.game.loading_layer !== null) new_over_item = null;
    else if (this.mouse_cursor !== null && !this.use_mouse_layer) new_over_item = this.mouse_cursor;
    else {
      new_over_item = null;
      for (let k = item_stack.length - 1; k >= 0; k--) {
        const item = item_stack[k];
        if (item.has_event_handler(ItemEvent.MOUSE_ENTER) || item.has_event_handler(ItemEvent.MOUSE_LEAVE)) { new_over_item = item; break; }
      }
    }
    if (this.over_item !== new_over_item) {
      if (this.leftmousedown_handlers.length > 0) {
        let over_captured = false;
        for (const hd of this.leftmousedown_handlers) if (hd[0] === new_over_item) over_captured = true;
        if (!over_captured) new_over_item = null;
      }
      const old_over_item = this.over_item;
      this.over_item = new_over_item;
      if (old_over_item !== null) old_over_item.fire_event(ItemEvent.MOUSE_LEAVE, new ItemEventArgsMouse(x, y));
      if (this.over_item !== null) this.over_item.fire_event(ItemEvent.MOUSE_ENTER, new ItemEventArgsMouse(x, y));
    }
    return item_stack;
  }

  /** Runs the timers, updates the layers and draws the frame. Calls made while a frame is being drawn (from handlers) only redraw. */
  render(update_mouse = false): void {
    if (this.rendering > 0) { this.draw_frame(); return; }
    this.rendering++;
    try {
      const pos = mouse.get_pos();
      if (!this.mouse_real_pos || pos[0] !== this.mouse_real_pos[0] || pos[1] !== this.mouse_real_pos[1] || update_mouse) {
        this.mouse_real_pos = pos;
        const [x, y] = pos;
        this.update_over_item(x, y);
        if (this.mouse_cursor !== null) this.update_mouse_cursor_position(x, y);
      }
      const timers = this.timers;
      if (timers.length > 0) {
        const ticks = time.get_ticks();
        let i = 0;
        while (i < timers.length) {
          const timer = timers[i];
          if (timer.render_first) timer.render_first = false;
          else {
            while (ticks >= timer.tick) {
              timer.func(timer.key, timer.data);
              if (!timers.includes(timer)) { i--; break; }
              if (timer.drop_ticks) {
                while (ticks >= timer.tick) timer.tick += timer.milliseconds;
                break;
              } else timer.tick += timer.milliseconds;
            }
          }
          i++;
        }
      }
      this.draw_frame();
    } finally { this.rendering--; }
  }

  private draw_frame(): void {
    const target = this.target_surface ?? this.game.window;
    const frame_delay = this.game.get_frame_delay();
    for (const l of this.layers) l.update(frame_delay);
    const loading_layer = this.target_surface === null ? this.game.loading_layer : null;
    if (loading_layer) loading_layer.update(frame_delay);
    if (this.mouse_layer) this.mouse_layer.update(frame_delay);
    this.draw_background(target);
    for (const l of this.layers) if (l.get_visible()) l.draw(target);
    if (loading_layer) loading_layer.draw(target);
    else if (this.mouse_layer && !input.touch) this.mouse_layer.draw(target);
    if (this.target_surface === null) {
      if (this.game.get_show_fps()) this.game.draw_fps();
      this.game.update_display();
    }
  }
  private draw_background(surface: Surface): void {
    surface.set_clip(null);
    if (this.background === null) surface.fill(this.background_color);
    else surface.blit(this.background.surface, [0, 0]);
  }
  private load_background(image: Image_ | null): void {
    if (image === null) { this.background = null; return; }
    const rect = image.get_real_rect();
    const [sw, sh] = this.target_surface === null ? this.game.get_window_size() : this.target_surface.get_size();
    if (rect.width >= sw && rect.height >= sh) this.background = image;
    else {
      const surface = new Surface(sw, sh, false);
      for (let y = 0; y < sh; y += rect.height) for (let x = 0; x < sw; x += rect.width) surface.blit(image.surface, [x, y], rect);
      this.background = new Image_(surface);
    }
  }
  private update_mouse_cursor_position(x: number, y: number): void {
    const cur = this.mouse_cursor!;
    if (this.mouse_snap_to_cursor) {
      mouse.set_pos(cur.get_left() + this.mouse_pointer[0], cur.get_top() + this.mouse_pointer[1]);
      this.mouse_snap_to_cursor = false;
    } else if (this.mouse_move_area !== null) {
      let xx: number | null = x, yy: number | null = y;
      if (typeof this.mouse_move_area === 'function') [xx, yy] = this.mouse_move_area(x, y);
      else {
        const a = this.mouse_move_area, cw = cur.get_width(), ch = cur.get_height();
        if (x < a.left) xx = a.left; else if (x + cw > a.right) xx = a.right - cw;
        if (y < a.top) yy = a.top; else if (y + ch > a.bottom) yy = a.bottom - ch;
      }
      if (xx !== null && yy !== null) mouse.set_pos(xx, yy);
      x = xx as number; y = yy as number;
    }
    if (x !== null && y !== null) cur.set_lefttop(x - this.mouse_pointer[0], y - this.mouse_pointer[1]);
  }

  /** Marks the whole stage as changed. */
  redraw(): void {
    if (this.changed_handler !== null) this.changed_handler(this);
    this.mouse_update = true;
  }
}

/** animations.ts registers itself here (stage.ts cannot import it: they depend on each other) */
export const blindHook: { blind_layer: (layer: Layer, direction: number, area: Rect | null, duration: number, callback: ((l: Layer) => void) | null) => void } = {
  blind_layer: () => { throw new Error('animations not loaded'); },
};
const event = pgevent;

// ====================================================================================================================================
// isometric stage
// ====================================================================================================================================
export class IsoPlaceHolder { constructor(public tag: string, public x: number, public y: number) {} }
export class IsoDefState { constructor(public name: string, public center: [number, number], public clip: boolean) {} }
export class IsoState { constructor(public name: string, public suffix: string) {} }
export class IsoDefinition {
  private flipped: IsoDefinition | null = null;
  constructor(public center: [number, number], public size: [number, number], public place_holders: IsoPlaceHolder[], public tag: string, public states: IsoDefState[]) {}
  has_state(state: IsoState): boolean { return this.states.some((s) => s.name === state.name); }
  flip_h(_item?: unknown): IsoDefinition {
    if (this.flipped === null) {
      const phs = this.place_holders.map((p) => new IsoPlaceHolder(p.tag, -p.x, p.y));
      const states = this.states.map((s) => new IsoDefState(s.name, s.center, s.clip));
      this.flipped = new IsoDefinition(this.center, [this.size[1], this.size[0]], phs, this.tag, states);
      this.flipped.flipped = this;
    }
    return this.flipped;
  }
}

const idiv = (a: number, b: number): number => Math.floor(a / b);
const pyInt = (s: string): number => {
  const v = Number(s.trim());
  if (s.trim() === '' || !Number.isFinite(v)) throw new Error(`invalid literal for int(): '${s}'`);
  return Math.trunc(v);
};

export class StageIso extends Stage {
  private origin: [number, number] = [300, 200];
  private cell_width = 80;
  private cell_height = 40;
  private multiplier = 1;
  private item_definitions: Record<string, IsoDefinition> = {};
  private item_images_cache = new Map<string, Image_>();
  private item_masks_cache = new Map<string, Surface>();
  private set_name = '';
  private image_suffix = '';
  private tags: unknown;

  constructor(game: GameLike, tags: unknown, background_image: Image_ | null = null, target_surface: Surface | null = null) {
    super(game, background_image, target_surface);
    this.tags = tags;
  }
  get_rowcol(x: number, y: number): [number, number] {
    x -= this.origin[0] * this.multiplier;
    y -= this.origin[1] * this.multiplier;
    const m = -this.cell_height / this.cell_width;
    const t1 = y / (2 * m);
    const t2 = Number.isInteger(x) ? idiv(x, 2) : x / 2;
    const t3 = idiv(this.cell_width * this.multiplier, 2);
    const row = Math.trunc(Math.floor((-t1 - t2) / t3));
    const col = Math.trunc(Math.floor((-t1 + t2) / t3));
    return [row, col];
  }
  get_xy(row: number, col: number): [number, number] {
    const x = this.origin[0] * this.multiplier + idiv(this.cell_width, 2) * this.multiplier * (col - row);
    const y = this.origin[1] * this.multiplier + idiv(this.cell_height, 2) * this.multiplier * (row + col + 1);
    return [Math.trunc(x), Math.trunc(y)];
  }
  get_grid_origin(): [number, number] { return this.origin; }
  get_grid_cell_size(): [number, number] { return [this.cell_width, this.cell_height]; }
  get_grid_multiplier(): number { return this.multiplier; }
  get_grid_definition(): [[number, number], number, number, number] { return [this.origin, this.cell_width, this.cell_height, this.multiplier]; }
  set_grid_definition(origin: [number, number], cell_width: number, cell_height: number, multiplier: number): void {
    this.origin = origin; this.cell_width = cell_width; this.cell_height = cell_height; this.multiplier = multiplier;
  }
  get_tags(): unknown { return this.tags; }
  set_tags(tags: unknown): void { this.tags = tags; }
  get_set_name(): string { return this.set_name; }
  /** reads the definitions of the items of a set (file `<set>.tcs`) */
  set_items(set_name: string, image_suffix = '', item_definitions: Record<string, IsoDefinition> | null = null): void {
    this.set_name = set_name;
    this.image_suffix = image_suffix;
    this.item_images_cache = new Map();
    this.item_masks_cache = new Map();
    if (item_definitions !== null) this.item_definitions = item_definitions;
    else if (set_name !== '') {
      const file_name = set_name + '.tcs';
      this.item_definitions = {};
      const data = load_data(file_name);
      for (const fields of data) {
        if (fields.length === 0) continue;
        const type = fields[0];
        try {
          const center: [number, number] = [pyInt(fields[1]), pyInt(fields[2])];
          const size: [number, number] = [pyInt(fields[3]), pyInt(fields[4])];
          const place_holders: IsoPlaceHolder[] = [];
          for (const ph of fields[5].split('|')) {
            if (ph.length >= 3) { const p = ph.split(','); place_holders.push(new IsoPlaceHolder(p[0], pyInt(p[1]), pyInt(p[2]))); }
          }
          const tag = fields[6].trim();
          const states: IsoDefState[] = [];
          for (const st of fields[7].split('|')) {
            const s = st.split(',');
            if (s.length >= 3) {
              const clip = s.length >= 4 ? s[3].trim() === '1' : false;
              states.push(new IsoDefState(s[0], [pyInt(s[1]), pyInt(s[2])], clip));
            }
          }
          this.item_definitions[type] = new IsoDefinition(center, size, place_holders, tag, states);
        } catch (e) {
          console.error(`Invalid format for item '${type}' in file '${file_name}'`);
          throw e;
        }
      }
    }
  }
  get_item_definition(item_type: string, _flipped_h = false): IsoDefinition {
    const d = this.item_definitions[item_type];
    if (!d) throw new Error(`Missing definition for item '${item_type}'.`);
    return d;
  }
  get_item_definitions(): Record<string, IsoDefinition> { return this.item_definitions; }
  get_item_types_with_tag(tag: string): string[] {
    const out: string[] = [];
    for (const [t, d] of Object.entries(this.item_definitions)) if (d.tag === tag) out.push(t);
    return out;
  }
  load_item_image(type: string, state: IsoState, flip_h = false, suffix: string | null = null): Image_ {
    let key = type;
    let state_suffix = '';
    if (state.suffix !== '') { state_suffix = '_' + state.suffix; key += state_suffix; }
    if (suffix !== null) { key += suffix; state_suffix += suffix; }
    if (flip_h) key += '?H';
    const cached = this.item_images_cache.get(key);
    if (cached) return cached;
    let image: Image_;
    let file_name: string;
    if (flip_h) {
      image = this.load_item_image(type, state, false, suffix);
      file_name = key;
      image = new Image_(transform.flip(image.surface, true, false), file_name);
    } else {
      file_name = this.set_name + type + this.image_suffix + state_suffix + '.png';
      image = load_image(file_name);
    }
    this.item_images_cache.set(key, image);
    return image;
  }
  load_item_mask(type: string, state: IsoState, flip_h: boolean, mask_suffix: string): Surface {
    let key = type;
    let suffix = '';
    if (state.suffix !== '') { suffix = '_' + state.suffix; key += suffix; }
    suffix += '$' + mask_suffix;
    if (flip_h) key += '?H';
    let mask = this.item_masks_cache.get(key) ?? null;
    if (mask === null) {
      if (flip_h) mask = this.load_item_mask(type, state, false, mask_suffix);
      if (mask === null) mask = load_mask(this.set_name + type + this.image_suffix + suffix + '.gif');
      if (flip_h) mask = transform.flip(mask, true, false);
      this.item_masks_cache.set(key, mask);
    }
    return mask;
  }
  /** loads the cells of a level (file `<set><level>.tcl`) into a layer */
  load_level(level_name: string, layer: Layer, states: IsoState[], prepare_item: ((item: ItemCell) => void) | null = null): ItemCell[] {
    const file_name = this.set_name + level_name + '.tcl';
    const items: ItemCell[] = [];
    const data = load_data(file_name);
    for (const fields of data) {
      if (fields.length === 0) continue;
      let type = fields[0];
      let flip_h = false;
      if (type.endsWith('?H')) { type = type.slice(0, type.length - 2); flip_h = true; }
      let row: number, col: number, state_suffix: string;
      try {
        row = parseFloatStrict(fields[1]); col = parseFloatStrict(fields[2]); state_suffix = fields[3].trim();
      } catch (e) { console.error(`Invalid format for item '${type}' in file '${file_name}'`); throw e; }
      let item_state: IsoState | null = null;
      for (const s of states) if (s.suffix === state_suffix) { item_state = s; break; }
      if (item_state === null) throw new Error(`State suffix '${state_suffix}' is not defined, and item '${type}' has this state.`);
      const item = new ItemCell(this, type, item_state, flip_h, row, col);
      if (prepare_item) prepare_item(item);
      layer.add(item);
      items.push(item);
    }
    return items;
  }
  load_place_holders(layer: Layer, list: [ItemCell, IsoPlaceHolder, number][]): void {
    for (const item of layer.items) {
      if (item instanceof ItemCell) {
        const phs = item.get_definition().place_holders;
        for (let i = 0; i < phs.length; i++) list.push([item, phs[i], i]);
      }
    }
  }
  find_item(layer: Layer, position: [number, number], type: string): ItemCell | null {
    for (const item of layer.items) {
      if (item instanceof ItemCell && item.get_type() === type) {
        const p = item.get_position();
        if (p[0] === position[0] && p[1] === position[1]) return item;
      }
    }
    return null;
  }
}

function parseFloatStrict(s: string): number {
  const v = Number(s.trim());
  if (s.trim() === '' || Number.isNaN(v)) throw new Error(`could not convert string to float: ${s}`);
  return v;
}

// ====================================================================================================================================
// iso cell
// ====================================================================================================================================
export class ItemCell extends ItemImage {
  private stage_: StageIso;
  private state_: IsoState;
  private center_: [number, number] | null = null;
  private flip_h_: boolean;
  private type_: string | null = null;
  private definition_: IsoDefinition | null = null;
  private position_: [number, number] = [0, 0];
  private image_: Image_ | null = null;
  /** [container cell, states in which this cell is visible] */
  visible_in_states: [ItemCell, IsoState[]] | null | undefined = undefined;
  placeholder_items: ItemCell[] | undefined = undefined;
  placeholder_container: ItemCell | undefined = undefined;

  constructor(stage: StageIso, type: string, state: IsoState, flip_h = false, row = -999, col = -999) {
    super(0, 0, null);
    this.stage_ = stage;
    this.state_ = state;
    this.flip_h_ = flip_h;
    this.set_type(type);
    this.position_ = [0, 0];
    if (row !== -999) this.set_position(row, col);
  }
  clone(stage: StageIso): ItemCell {
    const [row, col] = this.get_position();
    const n = new ItemCell(stage, this.type_!, this.state_, this.flip_h_, -999, -999);
    n.center_ = this.center_;
    n.set_position(row, col);
    n.set_visible(this.get_visible());
    if (this.visible_in_states) n.visible_in_states = [this.visible_in_states[0], this.visible_in_states[1].slice()];
    if (this.placeholder_items) n.placeholder_items = this.placeholder_items.slice();
    return n;
  }
  get_type(): string { return this.type_!; }
  set_type(type: string): void {
    if (this.type_ !== type) {
      const position = this.type_ === null ? null : this.get_position();
      this.type_ = type;
      this.image_ = this.stage_.load_item_image(type, this.state_, this.flip_h_);
      this.set_image(this.image_, null);
      this.definition_ = this.stage_.get_item_definition(type);
      if (this.flip_h_) this.definition_ = this.definition_.flip_h(this);
      this.load_center();
      if (position !== null) this.set_position(position[0], position[1]);
    }
  }
  get_state(): IsoState { return this.state_; }
  set_state(state: IsoState): void {
    if (this.state_ !== state) {
      const position = this.get_position();
      const previous_state = this.state_;
      this.state_ = state;
      this.image_ = this.stage_.load_item_image(this.type_!, this.state_, this.flip_h_);
      this.set_image(this.image_, null);
      this.load_center();
      this.set_position(position[0], position[1]);
      if (this.placeholder_items !== undefined) {
        let clip_mask: Image_ | null = null;
        let clip_pos: [number, number] = [0, 0];
        for (const item_over of this.placeholder_items) {
          const vis = item_over.visible_in_states;
          if (vis && vis[0].get_type() === this.type_) {
            if (vis[1].includes(state)) {
              item_over.set_visible(true);
              let clip = false;
              for (const ds of this.definition_!.states) if (ds.name === state.name) { if (ds.clip) clip = true; break; }
              if (clip) {
                if (clip_mask === null) {
                  clip_mask = this.stage_.load_item_image(this.type_!, this.state_, this.flip_h_, '$x');
                  clip_pos = [this.get_left(), this.get_top()];
                }
                item_over.set_clip_mask(clip_mask, clip_pos);
              } else item_over.set_clip_mask(null, null);
            } else item_over.set_visible(false);
          }
        }
      }
      this.fire_event(ItemEvent.STATE_CHANGED, new ItemEventArgsStateChanged(previous_state));
    }
  }
  get_position(): [number, number] { return this.position_; }
  set_position(row: number, col: number): void {
    const [left, top] = this.from_grid_position(row, col);
    this.set_lefttop(left, top);
    this.position_ = [row, col];
  }
  get_mask(mask_suffix: string): Surface { return this.stage_.load_item_mask(this.type_!, this.state_, this.flip_h_, mask_suffix); }
  get_at_mask(x: number, y: number, mask_suffix: string): [number, number, number, number] {
    let mask: Surface | null = null;
    try { mask = this.stage_.load_item_mask(this.type_!, this.state_, false, mask_suffix); } catch { mask = null; }
    if (mask === null) return [255, 255, 255, 255];
    const mask_x = this.flip_h_ ? this.get_width() - (x - this.get_left()) : x - this.get_left();
    const mask_y = y - this.get_top();
    if (mask_x < 0 || mask_y < 0 || mask_x >= mask.get_width() || mask_y >= mask.get_height()) return [255, 255, 255, 255];
    return mask.get_at(mask_x, mask_y);
  }
  get_center(): [number, number] { return this.center_!; }
  set_to_place_holder(container_item: ItemCell, place_holder: IsoPlaceHolder, _below = false, only_visible_in_states: IsoState[] | null = null): void {
    const [row, col] = container_item.get_position();
    const [ph_row, ph_col] = container_item.get_place_holder_rowcol(place_holder);
    const drow = ph_row - row;
    const dcol = ph_col - col;
    this.load_center();
    const [cell_width, cell_height] = this.stage_.get_grid_cell_size();
    this.center_ = [this.center_![0] - place_holder.x + idiv((dcol - drow) * cell_width, 2), this.center_![1] - place_holder.y + idiv((dcol + drow) * cell_height, 2)];
    this.set_position(ph_row, ph_col);
    if (container_item.flip_h_) {
      this.image_ = this.stage_.load_item_image(this.type_!, this.state_, true);
      this.set_image(this.image_, null);
      this.flip_h_ = true;
    }
    if (only_visible_in_states !== null) {
      this.visible_in_states = [container_item, only_visible_in_states];
      this.set_visible(only_visible_in_states.includes(this.get_state()));
    } else if (this.visible_in_states !== undefined) this.visible_in_states = null;
    if (this.placeholder_container !== undefined) this.placeholder_container.unregister_placeholder_item(this);
    this.placeholder_container = container_item;
    container_item.register_placeholder_item(this);
  }
  get_place_holder_rowcol(place_holder: IsoPlaceHolder): [number, number] {
    const m = this.stage_.get_grid_multiplier();
    return this.stage_.get_rowcol(this.get_left() + (this.center_![0] + place_holder.x) * m, this.get_top() + (this.center_![1] + place_holder.y) * m);
  }
  get_place_holder_xy(place_holder: IsoPlaceHolder): [number, number] {
    const m = this.stage_.get_grid_multiplier();
    return [this.get_left() + (this.center_![0] + place_holder.x) * m, this.get_top() + (this.center_![1] + place_holder.y) * m];
  }
  get_flip_h(): boolean { return this.flip_h_; }
  set_flip_h(value: boolean): void {
    if (this.flip_h_ !== value) {
      const position = this.get_position();
      this.image_ = this.stage_.load_item_image(this.type_!, this.state_, value);
      this.set_image(this.image_, null);
      this.definition_ = this.definition_!.flip_h(this);
      this.flip_h_ = value;
      this.load_center();
      this.set_position(position[0], position[1]);
    }
  }
  get_definition(): IsoDefinition { return this.definition_!; }
  reload_definition(): void { const t = this.type_!; this.type_ = '???'; this.set_type(t); }
  /** first cell of the layer(s) that overlaps the footprint of this item placed at (row, col) */
  collision_test(row: number, col: number, only_item_layer: boolean): ItemCell | null {
    const layer = this.get_layer();
    if (layer !== null) {
      if (only_item_layer) return this.collide_test_layer(row, col, layer);
      const stage = layer.get_stage();
      if (stage) for (const _l of stage.layers) { const item = this.collide_test_layer(row, col, layer); if (item !== null) return item; }
    }
    return null;
  }
  register_placeholder_item(item: ItemCell): void {
    if (this.placeholder_items === undefined) this.placeholder_items = [item]; else this.placeholder_items.push(item);
  }
  unregister_placeholder_item(item: ItemCell): void {
    if (this.placeholder_items !== undefined) {
      const i = this.placeholder_items.indexOf(item);
      if (i < 0) throw new Error('list.remove(x): x not in list');
      this.placeholder_items.splice(i, 1);
    }
  }
  private load_center(): void {
    if (this.state_.suffix === '') this.center_ = this.definition_!.center;
    else {
      let state_center: [number, number] | null = null;
      for (const s of this.definition_!.states) if (s.name === this.state_.name) state_center = s.center;
      if (state_center === null) throw new Error(`State '${this.state_.name}' is not defined for item '${this.type_}'`);
      this.center_ = state_center;
    }
    if (this.flip_h_) this.center_ = [idiv(this.get_width(), this.stage_.get_grid_multiplier()) - this.center_[0], this.center_[1]];
  }
  private collide_test_layer(row: number, col: number, layer: Layer): ItemCell | null {
    const size = this.definition_!.size;
    for (const item of layer.items) {
      if (item instanceof ItemCell && item !== this) {
        const p = item.get_position();
        if (p[0] < row + size[0] && p[1] < col + size[1]) {
          const isz = item.get_definition().size;
          if (p[0] + isz[0] > row && p[1] + isz[1] > col) return item;
        }
      }
    }
    return null;
  }
  private from_grid_position(row: number, col: number): [number, number] {
    if (this.definition_ === null) return [row, col];
    const [origin, cell_width, cell_height, multiplier] = this.stage_.get_grid_definition();
    const center = this.center_!;
    const left = Math.trunc((origin[0] + ((col - row) * cell_width) / 2 - center[0]) * multiplier);
    const top = Math.trunc((origin[1] + ((col + row) * cell_height) / 2 - center[1] + idiv(cell_height, 2)) * multiplier);
    return [left, top];
  }
}

export type { Handler };
