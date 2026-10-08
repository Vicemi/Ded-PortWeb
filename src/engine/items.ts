// framework/stage.py: the scene graph. A Stage holds Layers, a Layer holds Items. Items: images, text, rectangles, hit masks, custom drawing and
// iso cells. The original keeps lists of dirty rectangles to redraw only what changed; the port redraws the whole frame (the result is the same).
import type { Image_ } from './assets';
import type { Font } from './font';
import { Rect, Surface, draw as pgdraw, type Color } from './pygame';
import { hittest_text, render_text } from './textrender';
import type { AdditionalFonts } from './textlayout';
import type { Stage } from './stage';

// ------------------------------------------------------------------------------------------------------------------------------ events
export const ItemEvent = { CLICK: 0, DBLCLICK: 1, MOUSE_ENTER: 2, MOUSE_LEAVE: 3, MOUSE_MOVE: 4, GOT_FOCUS: 5, LOST_FOCUS: 6, STATE_CHANGED: 7 } as const;
export class ItemEventArgs {}
export class ItemEventArgsMouse extends ItemEventArgs { constructor(public x: number, public y: number) { super(); } }
export class ItemEventArgsStateChanged extends ItemEventArgs { constructor(public previous_state: unknown) { super(); } }

/** a handler returns false to let the event reach the items below; nothing (None) or true means handled */
export type Handler = (item: any, args: any) => unknown;

/** the Python bound method `self.f` is the same object each time; this gives the same stability in TypeScript */
const boundCache = new WeakMap<object, Map<Function, Function>>();
export function bound<T extends Function>(obj: object, fn: T): T {
  let m = boundCache.get(obj);
  if (!m) { m = new Map(); boundCache.set(obj, m); }
  let b = m.get(fn);
  if (!b) { b = fn.bind(obj) as Function; m.set(fn, b); }
  return b as unknown as T;
}

// ------------------------------------------------------------------------------------------------------------------------------ Item
export class CustomDraw {
  surface: Surface | null;
  constructor(width = 0, height = 0) { this.surface = width === 0 ? null : new Surface(width, height, true); }
  blit_surface(surface: Surface, pos: readonly number[], area?: Rect | readonly number[] | null): void { this.surface!.blit(surface, pos, area ?? undefined); }
  blit_image(image: Image_, pos: readonly number[], area?: Rect | readonly number[] | null): void { this.surface!.blit(image.surface, pos, area ?? undefined); }
  blit_stage(stage: Stage, pos: readonly number[], area?: Rect | readonly number[] | null): void {
    const surface = stage.target_surface ?? stage.game.window;
    this.surface!.blit(surface, pos, area ?? undefined);
  }
  clear(color: Color): void { this.surface!.fill(color); }
  fill(color: Color, rect: Rect | readonly number[]): void { this.surface!.fill(color, rect); }
  draw_line(color: Color, start: readonly number[], end: readonly number[], width = 1): void { pgdraw.line(this.surface!, color, start, end, width); }
  draw_rect(color: Color, rect: Rect | readonly number[], width = 1): void { pgdraw.rect(this.surface!, color, rect, width); }
}
/** draws into a surface shifted by (dx, dy) */
export class CustomDrawDelta extends CustomDraw {
  constructor(surface: Surface, public dx: number, public dy: number) { super(); this.surface = surface; }
  draw_line(color: Color, s: readonly number[], e: readonly number[], width = 1): void { pgdraw.line(this.surface!, color, [s[0] + this.dx, s[1] + this.dy], [e[0] + this.dx, e[1] + this.dy], width); }
  draw_rect(color: Color, rect: Rect | readonly number[], width = 1): void { const r = Rect.from(rect); pgdraw.rect(this.surface!, color, [r.x + this.dx, r.y + this.dy, r.w, r.h], width); }
}

export class Item {
  protected _layer: Layer | null = null;
  protected _left: number;
  protected _top: number;
  protected _width: number;
  protected _height: number;
  visible = true;
  rect: Rect;
  image: unknown = null;
  draw_function: ((item: any, target: CustomDraw) => void) | null = null;
  area: Rect | readonly number[] | null = null;
  surface!: Surface;
  private _events = new Map<number, Handler[]>();
  private _rollover: [ItemImage, { play(): void; stop(): void } | null, number | null, number | null] | null = null;

  constructor(left: number, top: number, width: number, height: number) {
    this._left = left; this._top = top; this._width = width; this._height = height;
    this.rect = new Rect(left, top, width, height);
  }
  get_visible(): boolean { return this.visible; }
  set_visible(visible: boolean): void { if (this.visible !== visible) { this.visible = visible; this.set_dirty(); } }
  get_left(): number { return this._left; }
  set_left(v: number): void { if (this._left !== v) { this._left = v; this.set_dirty(); } }
  get_top(): number { return this._top; }
  set_top(v: number): void { if (this._top !== v) { this._top = v; this.set_dirty(); } }
  set_lefttop(left: number, top: number): void { if (this._left !== left || this._top !== top) { this._left = left; this._top = top; this.set_dirty(); } }
  get_width(): number { return this._width; }
  set_width(v: number): void { if (this._width !== v) { this._width = v; this.set_dirty(); } }
  get_height(): number { return this._height; }
  set_height(v: number): void { if (this._height !== v) { this._height = v; this.set_dirty(); } }
  get_bounds(): Rect { return new Rect(this._left, this._top, this._width, this._height); }
  get_size(): [number, number] { return [this._width, this._height]; }
  set_dirty(): void { if (this._rollover) this.update_rollover_position(); }
  get_layer(): Layer | null { return this._layer; }
  set_layer(layer: Layer | null): void {
    if (layer === null) this._layer = null;
    else if (this._layer !== null) throw new Error('The item is already part of a layer');
    else this._layer = layer;
  }
  get_stage(): Stage | null { return this._layer ? this._layer.get_stage() : null; }
  /** (called every frame before drawing) */
  update(_frame_delay: number): Rect {
    const w = this.visible ? this._width : 0, h = this.visible ? this._height : 0;
    this.rect = new Rect(this._left, this._top, w, h);
    return this.rect;
  }
  is_over(x: number, y: number, _ignore_clip = false): boolean {
    return this._left <= x && x < this._left + this._width && this._top <= y && y < this._top + this._height;
  }

  add_event_handler(event: number, handler: Handler): void {
    const l = this._events.get(event);
    if (l) l.push(handler); else this._events.set(event, [handler]);
  }
  remove_event_handler(event: number, handler: Handler): void {
    const l = this._events.get(event);
    if (l) {
      const i = l.indexOf(handler);
      if (i >= 0) { l.splice(i, 1); if (l.length === 0) this._events.delete(event); }
    }
  }
  fire_event(event: number, args: unknown): boolean {
    const handlers = this._events.get(event);
    if (!handlers) return false;
    let handled = false;
    for (const h of handlers.slice()) {
      const ret = h(this, args);
      if (ret || ret === undefined || ret === null) handled = true;
    }
    return handled;
  }
  has_event_handler(event: number): boolean { const l = this._events.get(event); return !!l && l.length > 0; }

  // rollover: another image shown over the item while the mouse is on it
  set_rollover(image: Image_ | null, sound: { play(): void; stop(): void } | null, x: number | null = null, y: number | null = null): void {
    const enter = bound(this, this.rolloverEnter), leave = bound(this, this.rolloverLeave);
    if (image === null) {
      this._rollover = null;
      this.remove_event_handler(ItemEvent.MOUSE_ENTER, enter); this.remove_event_handler(ItemEvent.MOUSE_LEAVE, leave);
    } else {
      this._rollover = [new ItemImage(0, 0, image), sound, x, y];
      this.remove_event_handler(ItemEvent.MOUSE_ENTER, enter); this.remove_event_handler(ItemEvent.MOUSE_LEAVE, leave);
      this.add_event_handler(ItemEvent.MOUSE_ENTER, enter); this.add_event_handler(ItemEvent.MOUSE_LEAVE, leave);
    }
  }
  show_rollover(play_sound: boolean): void {
    if (!this._rollover) return;
    const layer = this.get_layer();
    if (!layer) return;
    const stage = layer.get_stage();
    if (stage && !stage.is_timer_started([this, 'fade'])) {
      const item_image = this.update_rollover_position();
      layer.add(item_image, layer.index_of(this));
      const snd = this._rollover[1];
      if (play_sound && snd) { snd.stop(); snd.play(); }
    }
  }
  hide_rollover(): void {
    if (!this._rollover) return;
    const image = this._rollover[0];
    const layer = image.get_layer();
    if (layer) layer.remove(image);
  }
  private rolloverEnter(): void { this.show_rollover(true); }
  private rolloverLeave(): void { this.hide_rollover(); }
  private update_rollover_position(): ItemImage {
    const [item_image, , x, y] = this._rollover!;
    const dx = x === null ? Math.floor((this.get_width() - item_image.get_width()) / 2) : x;
    const dy = y === null ? Math.floor((this.get_height() - item_image.get_height()) / 2) : y;
    item_image.set_left(this._left + dx);
    item_image.set_top(this._top + dy);
    return item_image;
  }

  // text items override these
  on_got_focus(_data: unknown): unknown { return null; }
  on_lost_focus(_stage: Stage, _data: unknown): void { /* nothing */ }
  handle_event_focused(_event: unknown, _data: unknown): boolean { return false; }
}

// ------------------------------------------------------------------------------------------------------------------------------ ItemImage
export class ItemImage extends Item {
  private _alpha = 255;
  private hit_over_transparent: boolean;
  private _image: Image_ | null = null;
  private source_surface!: Surface;
  private surface_noclip!: Surface;
  private _roll: [Image_, Image_ | null, { play(): void; stop(): void } | null] | null = null;
  private _pressed: [Image_, Image_ | null] | null = null;

  constructor(left: number, top: number, image: Image_ | null, area: Rect | readonly number[] | null = null, hit_over_transparent = false) {
    super(left, top, 0, 0);
    this.hit_over_transparent = hit_over_transparent;
    this.set_image(image, area);
  }
  get_alpha(): number { return this._alpha; }
  set_alpha(alpha: number): void { this._alpha = alpha; this.set_dirty(); }
  is_over(x: number, y: number, ignore_clip = false): boolean {
    const bounds = this.get_bounds();
    if (bounds.collidepoint(x, y)) {
      if (this.hit_over_transparent) return true;
      const test_surface = ignore_clip ? this.source_surface : this.surface;
      let c: [number, number, number, number];
      try { c = test_surface.get_at(Math.trunc(x - this.get_left()), Math.trunc(y - this.get_top())); } catch { return false; }
      // the alpha of a 32-bit image is scaled by the item's alpha; the test is "more than 40"
      const a = ignore_clip || this._alpha === 255 || !test_surface.srcalpha ? c[3] : Math.trunc(c[3] * (this._alpha / 255));
      if (a > 40) return true;
    }
    return false;
  }
  get_image(): Image_ | null { return this._image; }
  set_image(image: Image_ | null, area: Rect | readonly number[] | null = null): void {
    if (this._roll && this._roll[1] !== null) this._roll[1] = image;
    else if (this._pressed && this._pressed[1] !== null) this._pressed[1] = image;
    else this.set_image_internal(image, area);
  }
  /** clip the image with the alpha of a mask image placed at `image_pos` (the iso items that hide behind others) */
  set_clip_mask(image_mask: Image_ | null, image_pos: readonly number[] | null): void {
    if (image_mask === null) {
      this.source_surface = this.surface_noclip;
      if (this.surface !== this.surface_noclip) { this.surface = this.surface_noclip; this.set_dirty(); }
      return;
    }
    const left = this.get_left(), top = this.get_top();
    let x: number, area_x: number, y: number, area_y: number;
    if (image_pos![0] < left) { x = 0; area_x = left - image_pos![0]; } else { x = image_pos![0] - left; area_x = 0; }
    if (image_pos![1] < top) { y = 0; area_y = top - image_pos![1]; } else { y = image_pos![1] - top; area_y = 0; }
    const area_width = Math.min(image_mask.get_width() - area_x, this.get_width());
    const area_height = Math.min(image_mask.get_height() - area_y, this.get_height());
    const src = this.source_surface;
    const w = src.get_width();
    const px = new Uint8ClampedArray(src.pixels());
    const mp = image_mask.surface.pixels(), mw = image_mask.surface.get_width();
    for (let i = 0; i < area_width; i++) {
      for (let j = 0; j < area_height; j++) {
        const d = ((y + j) * w + (x + i)) * 4 + 3, m = ((area_y + j) * mw + (area_x + i)) * 4 + 3;
        if (d < px.length) px[d] &= mp[m];
      }
    }
    const s = Surface.fromRGBA(w, src.get_height(), px, true);
    this.surface = s;
    this.source_surface = s;
    this.set_dirty();
  }
  set_rollover_image(image: Image_ | null, sound: { play(): void; stop(): void } | null): void {
    const enter = bound(this, this.rollEnter), leave = bound(this, this.rollLeave);
    if (this._roll) {
      const old = this._roll[1];
      this._roll = null;
      if (old) this.set_image(old);
      this.remove_event_handler(ItemEvent.MOUSE_ENTER, enter); this.remove_event_handler(ItemEvent.MOUSE_LEAVE, leave);
    }
    if (image !== null) {
      this._roll = [image, null, sound];
      this.add_event_handler(ItemEvent.MOUSE_ENTER, enter); this.add_event_handler(ItemEvent.MOUSE_LEAVE, leave);
    }
  }
  set_pressed_image(image: Image_ | null): void {
    const click = bound(this, this.pressedClick);
    if (this._pressed) {
      const old = this._pressed[1];
      this._pressed = null;
      if (old) this.set_image(old);
      this.remove_event_handler(ItemEvent.CLICK, click);
    }
    if (image !== null) {
      this._pressed = [image, null];
      this.add_event_handler(ItemEvent.CLICK, click);
    }
  }
  private set_image_internal(image: Image_ | null, area: Rect | readonly number[] | null = null): void {
    this._image = image;
    if (image === null) {
      this.area = [0, 0, 0, 0];
      this.surface = new Surface(0, 0, true);
      this.source_surface = this.surface;
      this.surface_noclip = this.surface;
      this.set_width(0);
      this.set_height(0);
    } else {
      this.set_width(image.get_width());
      this.set_height(image.get_height());
      this.surface = image.surface;
      this.source_surface = this.surface;
      this.surface_noclip = this.surface;
      this.area = area;
      this.set_dirty();
    }
  }
  private rollEnter(item: ItemImage): void {
    if (!this._roll) return;
    if (this._pressed && this._pressed[1] !== null) {
      this._roll[1] = this._pressed[1];
      this._pressed[1] = this._roll[0];
    } else {
      const current = this.get_image();
      this.set_image_internal(this._roll[0]);
      this._roll[1] = current;
    }
    const snd = this._roll[2];
    if (snd && item.get_layer()?.get_stage()) { snd.stop(); snd.play(); }
  }
  private rollLeave(item: ItemImage): void {
    if (!this._roll) return;
    if (this._pressed && this._pressed[1] !== null) {
      this._pressed[1] = this._roll[1];
      this._roll[1] = null;
    } else {
      const old = this._roll[1];
      if (old) { this._roll[1] = null; (item as ItemImage).set_image_internal(old); }
    }
  }
  private pressedClick(): void {
    if (!this._pressed) return;
    const stage = this.get_stage();
    if (stage) {
      const current = this.get_image();
      this.set_image_internal(this._pressed[0]);
      this._pressed[1] = current;
      stage.capture_leftmousedown(this, bound(this, this.pressedMouseCapture));
    }
  }
  private pressedMouseCapture(_args: unknown, released: boolean): void {
    if (released && this._pressed) {
      const old = this._pressed[1];
      if (old) { this._pressed[1] = null; this.set_image_internal(old); }
    }
  }
}

// ------------------------------------------------------------------------------------------------------------------------------ custom draw / mask
export class ItemCustomDraw extends Item {
  mask: Surface | ((item: ItemCustomDraw, x: number, y: number) => boolean) | null;
  constructor(left: number, top: number, width: number, height: number, draw_function: (item: ItemCustomDraw, target: CustomDraw) => void,
    mask: Surface | ((item: ItemCustomDraw, x: number, y: number) => boolean) | null = null) {
    super(left, top, width, height);
    this.draw_function = draw_function;
    this.mask = mask;
  }
  is_over(x: number, y: number, _ignore_clip = false): boolean {
    const bounds = this.get_bounds();
    if (bounds.collidepoint(x, y)) {
      if (this.mask === null) return true;
      if (typeof this.mask === 'function') return this.mask(this, x, y);
      try {
        const c = this.mask.get_at(x - this.get_left(), y - this.get_top());
        if (c[0] !== 255 || c[1] !== 255 || c[2] !== 255) return true;
      } catch { return false; }
    }
    return false;
  }
}

/** an invisible rectangle for the mouse: where the mask is not white, or the whole rectangle when there is no mask */
export class ItemMask extends Item {
  mask: Surface | null;
  constructor(left: number, top: number, mask: Surface | Image_ | readonly number[]) {
    let width: number, height: number, surf: Surface | null;
    if (mask instanceof Surface) { width = mask.get_width(); height = mask.get_height(); surf = mask; }
    else if (!Array.isArray(mask) && (mask as Image_).surface) { width = (mask as Image_).get_width(); height = (mask as Image_).get_height(); surf = (mask as Image_).surface; }
    else { width = (mask as readonly number[])[0]; height = (mask as readonly number[])[1]; surf = null; }
    super(left, top, width, height);
    this.mask = surf;
    this.draw_function = () => undefined;
  }
  is_over(x: number, y: number, _ignore_clip = false): boolean {
    const bounds = this.get_bounds();
    if (bounds.collidepoint(x, y)) {
      if (this.mask === null) return true;
      try {
        const c = this.mask.get_at(x - this.get_left(), y - this.get_top());
        if (c[0] !== 255 || c[1] !== 255 || c[2] !== 255) return true;
      } catch { return false; }
    }
    return false;
  }
  update(_frame_delay: number): Rect { return this.rect; }
  get_at(x: number, y: number): [number, number, number, number] { return this.mask!.get_at(x, y); }
}

// ------------------------------------------------------------------------------------------------------------------------------ ItemText
const VALID_CHARS = ['\xe1', '\xe9', '\xed', '\xf3', '\xfa', '\xc1', '\xc9', '\xcd', '\xd3', '\xda', '\xf1', '\xd1'];

export class ItemText extends Item {
  private _text_width: number;
  private _text_height: number;
  private h_align: number;
  private v_align: number;
  private font: Font;
  private additional_fonts: AdditionalFonts;
  private line_height: number;
  private color: Color;
  private background: Color | null;
  private _alpha = 255;
  private break_into: ItemText | null = null;
  private rollover_color: [Color, Color | null, { play(): void; stop(): void } | null] | null = null;
  private edit_mode: boolean | null = null;
  private max_chars = -1;
  private text: string;
  private text_surface: Surface | null = null;
  private dx = 0;
  private dy = 0;
  private edit_key_pressed: ((key: number) => void) | null = null;
  private edit_click_callback: ((item: Item, args: ItemEventArgsMouse) => void) | null = null;
  private watermark: [string, Color] | null = null;

  constructor(left: number, top: number, font: Font, line_height: number, text: string, color: Color = [255, 255, 255], background: Color | null = null,
    width = -1, height = -1, h_align = 1, v_align = 1, additional_fonts: AdditionalFonts = {}) {
    super(left, top, 0, 0);
    this._text_width = width; this._text_height = height;
    this.h_align = h_align; this.v_align = v_align;
    this.font = font; this.additional_fonts = additional_fonts;
    this.line_height = line_height === 0 ? Math.max(1, font.get_linesize()) : line_height;
    this.color = color; this.background = background;
    this.text = text;
    this.update_text();
    if (this._text_width !== -1) this.set_width(this._text_width); else this.dx = 0;
    if (this._text_height !== -1) this.set_height(this._text_height); else this.dy = 0;
    this.draw_function = (_item, target) => this.draw_item(target);
  }
  set_editable(editable: boolean, key_pressed: ((key: number) => void) | null = null): void {
    if (editable) {
      if (this.edit_mode === null) { this.edit_mode = false; this.edit_key_pressed = key_pressed; this.update_text(); }
    } else this.edit_mode = null;
  }
  get_alpha(): number { return this._alpha; }
  set_alpha(alpha: number): void { this._alpha = alpha; this.set_dirty(); }
  get_color(): Color { return this.color; }
  set_color(color: Color): void {
    if (this.rollover_color && this.rollover_color[1] !== null) this.rollover_color[1] = color;
    else if (!sameColor(this.color, color)) { this.color = color; this.mark_text_to_update(); }
  }
  set_rollover_color(rollover_color: Color | null, sound: { play(): void; stop(): void } | null): void {
    const enter = bound(this, this.rcEnter), leave = bound(this, this.rcLeave);
    if (this.rollover_color) {
      const old = this.rollover_color[1];
      this.rollover_color = null;
      if (old) { this.color = old; this.mark_text_to_update(); }
      this.remove_event_handler(ItemEvent.MOUSE_ENTER, enter); this.remove_event_handler(ItemEvent.MOUSE_LEAVE, leave);
    }
    if (rollover_color !== null) {
      this.rollover_color = [rollover_color, null, sound];
      this.add_event_handler(ItemEvent.MOUSE_ENTER, enter); this.add_event_handler(ItemEvent.MOUSE_LEAVE, leave);
    }
  }
  get_background(): Color | null { return this.background; }
  set_background(background: Color | null): void {
    if (!(this.background === background || (this.background && background && sameColor(this.background, background)))) { this.background = background; this.mark_text_to_update(); }
  }
  set_dimensions(width: number, height: number): void {
    this._text_width = width; this._text_height = height;
    if (width !== -1) this.set_width(width); else this.dx = 0;
    if (height !== -1) this.set_height(height); else this.dy = 0;
    this.update_text();
  }
  get_text(): string { return this.text; }
  set_text(text: string): void { if (this.text !== text) { this.text = text; this.update_text(); } }
  break_text_into(item_text: ItemText | null): void { this.break_into = item_text; }
  update(frame_delay: number): Rect {
    if (this.text_surface === null) this.render_text_();
    return super.update(frame_delay);
  }
  hit_test(x: number, y: number): number {
    const adjust = Math.floor(this.font.get_linesize() / 4);
    return hittest_text(this.text, x - this.get_left() + adjust, y - this.get_top(), this.font, this.additional_fonts, this.line_height, this.get_width(), this.get_height(), true, this.h_align, this.edit_mode !== null, this.break_into);
  }
  set_edit_on_click(item: Item | null = null, click_callback: ((item: Item, args: ItemEventArgsMouse) => void) | null = null): void {
    const target = item ?? this;
    this.edit_click_callback = click_callback;
    target.add_event_handler(ItemEvent.CLICK, bound(this, this.beginEditOnClick));
  }
  set_watermark_text(text: string, color: Color = [155, 125, 112]): void { this.watermark = [text, color]; }
  set_max_chars(max_chars: number): void { this.max_chars = max_chars; }
  begin_edit(x = 1000, y = 1000): void {
    if (this.edit_mode === null) throw new Error('The ItemText is not editable.');
    const index = this.hit_test(x, y);
    const stage = this.get_stage();
    if (stage) {
      if (stage.get_focus() === this) {
        const d = stage.get_focus_data() as [number, boolean];
        d[0] = index; d[1] = true;
        this.start_cursor_timer();
      } else stage.set_focus(this, index);
      this.update_text();
    }
  }
  end_edit(): void {
    const stage = this.get_stage();
    if (stage && stage.get_focus() === this) { stage.set_focus(null); this.update_text(); }
  }
  on_got_focus(set_focus_data: unknown): unknown {
    this.edit_mode = true;
    this.start_cursor_timer();
    return [set_focus_data, true];
  }
  on_lost_focus(stage: Stage, _data: unknown): void {
    stage.stop_timer([this, 'key_repeat']);
    this.edit_mode = false;
    this.update_text();
  }
  handle_event_focused(event: { type: number; key?: number; unicode?: string }, data: unknown): boolean {
    const KEYDOWN = 2, KEYUP = 3;
    if (event.type === KEYDOWN) {
      const key = event.key!, unicode = event.unicode ?? '';
      const stage = this.get_stage();
      if (stage) {
        const timer_key = [this, 'key_repeat'];
        if (this.can_repeat(unicode)) stage.start_timer(timer_key, 600, bound(this, this.handle_key_repeat), [key, unicode, data, true], true, false);
        if (this.handle_key(key, unicode, data as [number, boolean])) return true;
      }
    } else if (event.type === KEYUP) {
      const stage = this.get_stage();
      if (stage) stage.stop_timer([this, 'key_repeat']);
    }
    return false;
  }
  private can_repeat(unicode: string): boolean {
    // accented vowels come from dead keys: they are not repeated
    return !(unicode !== '' && unicode.charCodeAt(0) < 255 && 'áéíóúÁÉÍÓÚ'.includes(unicode.slice(0, 1)));
  }
  private handle_key_repeat(_key: unknown, args: [number, string, unknown, boolean]): void {
    const timer_key = [this, 'key_repeat'];
    if (args[3]) {
      const stage = this.get_stage();
      if (stage) {
        stage.stop_timer(timer_key);
        stage.start_timer(timer_key, 50, bound(this, this.handle_key_repeat), [args[0], args[1], args[2], false], true, false);
      }
    }
    this.handle_key(args[0], args[1], args[2] as [number, boolean]);
  }
  private handle_key(key: number, unicode: string, data: [number, boolean]): boolean {
    let updated = false, handled = false;
    const old_cursor = data[0], old_text = this.text;
    const RETURN = 13, BACKSPACE = 8, DELETE = 127, RIGHT = 275, LEFT = 276, HOME = 278, UP = 273, END = 279, DOWN = 274;
    if (key === RETURN) { this.end_edit(); handled = true; }
    else if (key === BACKSPACE) {
      if (data[0] > 0) { this.text = this.text.slice(0, data[0] - 1) + this.text.slice(data[0]); data[0] -= 1; updated = true; }
      handled = true;
    } else if (key === DELETE) {
      if (data[0] < this.text.length) { this.text = this.text.slice(0, data[0]) + this.text.slice(data[0] + 1); updated = true; }
      handled = true;
    } else if (key === RIGHT) { if (data[0] < this.text.length) { data[0] += 1; updated = true; } handled = true; }
    else if (key === LEFT) { if (data[0] > 0) { data[0] -= 1; updated = true; } handled = true; }
    else if (key === HOME || key === UP) { if (data[0] > 0) { data[0] = 0; updated = true; } handled = true; }
    else if (key === END || key === DOWN) { if (data[0] < this.text.length) { data[0] = this.text.length; updated = true; } handled = true; }
    else if (unicode !== '' && ((unicode.charCodeAt(0) > 31 && unicode.charCodeAt(0) < 126) || (unicode.charCodeAt(0) < 255 && VALID_CHARS.includes(unicode)))
      && (this.text.length < this.max_chars || this.max_chars === -1)) {
      this.text = this.text.slice(0, data[0]) + unicode + this.text.slice(data[0]);
      data[0] += 1; updated = true; handled = true;
    }
    if (updated) {
      data[1] = true;
      if (!this.update_text()) { this.text = old_text; data[0] = old_cursor; this.update_text(); }
      else this.start_cursor_timer();
    }
    if (this.edit_key_pressed) this.edit_key_pressed(key);
    return handled;
  }
  private start_cursor_timer(): void {
    const stage = this.get_stage();
    if (stage) stage.start_timer([this, 'text_cursor'], 500, bound(this, this.update_cursor_timer), stage);
  }
  private beginEditOnClick(item: Item, args: ItemEventArgsMouse): void {
    const stage = item.get_stage();
    const focused = stage ? stage.get_focus() : null;
    if (focused === this) this.begin_edit(args.x, args.y); else this.begin_edit();
    if (this.edit_click_callback) this.edit_click_callback(item, args);
  }
  private update_text(): boolean {
    const fit = this.render_text_();
    this.set_dirty();
    return fit;
  }
  private render_text_(): boolean {
    let cursor_index = -1;
    let editable = false;
    if (this.edit_mode !== null) {
      editable = true;
      const stage = this.get_stage();
      if (stage && this.edit_mode) {
        const fd = stage.get_focus_data() as [number, boolean] | null;
        if (fd && fd[1]) cursor_index = fd[0];
      }
    }
    let text = this.text, color = this.color;
    if (text === '' && this.watermark) { text = this.watermark[0]; color = this.watermark[1]; }
    const [surface, fit] = render_text(text, this.font, this.additional_fonts, this.line_height, this._text_width, this._text_height, true, color, this.background,
      this.h_align, this.break_into, cursor_index, editable);
    this.text_surface = surface;
    const tw = surface.get_width(), th = surface.get_height();
    if (this._text_width === -1) this.set_width(tw);
    else if (this.h_align === 1) this.dx = 0;
    else if (this.h_align === 2) this.dx = Math.floor((this._text_width - tw) / 2);
    else if (this.h_align === 3) this.dx = this._text_width - tw;
    if (this._text_height === -1) this.set_height(th);
    else if (this.v_align === 1) this.dy = 0;
    else if (this.v_align === 2) this.dy = Math.floor((this._text_height - th) / 2);
    else if (this.v_align === 3) this.dy = this._text_height - th;
    return fit;
  }
  private mark_text_to_update(): void { this.text_surface = null; this.set_dirty(); }
  private draw_item(target: CustomDraw): void {
    if (this.text_surface === null) this.render_text_();
    const s = this.text_surface!;
    if (this._alpha !== 255) target.surface!.blit_alpha(s, [this.get_left() + this.dx, this.get_top() + this.dy], this._alpha);
    else target.blit_surface(s, [this.get_left() + this.dx, this.get_top() + this.dy]);
  }
  private rcEnter(): void {
    if (!this.rollover_color) return;
    this.rollover_color[1] = this.color;
    this.color = this.rollover_color[0];
    this.mark_text_to_update();
    const snd = this.rollover_color[2];
    if (snd && this.get_layer()?.get_stage()) { snd.stop(); snd.play(); }
  }
  private rcLeave(): void {
    if (!this.rollover_color) return;
    const old = this.rollover_color[1];
    if (old) { this.color = old; this.mark_text_to_update(); this.rollover_color[1] = null; }
  }
  private update_cursor_timer(key: unknown, data: Stage): void {
    const stage = data;
    if (stage.get_focus() !== this) stage.stop_timer(key);
    else {
      const fd = stage.get_focus_data() as [number, boolean];
      fd[1] = !fd[1];
      this.update_text();
    }
  }
}

export function sameColor(a: Color, b: Color): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

// ------------------------------------------------------------------------------------------------------------------------------ ItemRect
export class ItemRect extends Item {
  private font: Font | null;
  private additional_fonts: AdditionalFonts;
  private line_height: number;
  private color: Color;
  private background: Color | null;
  private border: Color | null;
  private text_h_align: number;
  private text: string;
  private text_surface: Surface | null = null;
  private text_w = 0;
  private text_h = 0;

  constructor(left: number, top: number, width: number, height: number, font: Font | null = null, line_height = 0, text = '', color: Color = [0, 0, 0],
    background: Color | null = [0, 0, 0], border: Color | null = null, text_h_align = 1, additional_fonts: AdditionalFonts = {}) {
    super(left, top, width, height);
    this.font = font; this.additional_fonts = additional_fonts;
    this.line_height = line_height === 0 && font ? font.get_linesize() : line_height;
    this.color = color; this.background = background; this.border = border; this.text_h_align = text_h_align;
    this.text = text;
    this.update_text();
    this.draw_function = (_i, target) => this.draw_item(target);
  }
  get_color(): Color { return this.color; }
  set_color(color: Color): void { if (!sameColor(this.color, color)) { this.color = color; this.text_surface = null; this.set_dirty(); } }
  get_background(): Color | null { return this.background; }
  set_background(background: Color | null): void {
    if (!(this.background === background || (this.background && background && sameColor(this.background, background)))) { this.background = background; this.text_surface = null; this.set_dirty(); }
  }
  get_font(): Font | null { return this.font; }
  set_font(font: Font): void { if (this.font !== font) { this.font = font; this.update_text(); } }
  get_text(): string { return this.text; }
  set_text(text: string): void { if (this.text !== text) { this.text = text; this.update_text(); } }
  update(frame_delay: number): Rect {
    if (this.text_surface === null && this.text !== '') this.render_text_();
    return super.update(frame_delay);
  }
  private update_text(): void { this.render_text_(); this.set_dirty(); }
  is_over(x: number, y: number, _ignore_clip = false): boolean {
    const b = this.get_bounds();
    if (this.background !== null) return b.x <= x && x < b.x + b.w && b.y <= y && y < b.y + b.h;
    // (the border only: the original's expression, which compares the edges)
    return b.x === x || (x === b.x + b.w - 1 && b.y === y) || y === b.y + b.h - 1;
  }
  private render_text_(): boolean {
    const width = this.get_width(), height = this.get_height();
    let fit = true;
    if (this.text === '') {
      this.text_surface = null; this.text_w = width; this.text_h = height;
    } else {
      const text_background = this.background === null || (this.background.length >= 4 && this.background[3] !== 255) ? null : this.background;
      const r = render_text(this.text, this.font!, this.additional_fonts, this.line_height, width, height, true, this.color, text_background, this.text_h_align, null);
      this.text_surface = r[0]; fit = r[1];
      this.text_w = width; this.text_h = height;
    }
    this.set_dirty();
    return fit;
  }
  private draw_item(target: CustomDraw): void {
    const dr = this.get_bounds();
    if (this.text_w !== dr.w || this.text_h !== dr.h) this.update_text();
    if (this.background !== null) target.fill(this.background, dr);
    if (this.text_surface !== null) {
      const tx = dr.left + Math.floor((dr.width - this.text_surface.get_width()) / 2);
      const ty = dr.top + Math.floor((dr.height - this.text_surface.get_height()) / 2);
      target.blit_surface(this.text_surface, [tx, ty]);
    }
    if (this.border !== null) target.draw_rect(this.border, dr);
  }
}

// ------------------------------------------------------------------------------------------------------------------------------ Layer
export class Layer {
  items: Item[] = [];
  stage: Stage | null = null;
  private _visible = true;
  custom_draw = new CustomDraw();
  private _alpha = 255;
  private _clip: Rect | null = null;

  contains(item: Item | null): boolean { return item !== null && this.items.includes(item); }
  empty(): void { while (this.items.length > 0) this.remove(this.items[0]); }
  add(item: Item, index = -1): void {
    const layer = item.get_layer();
    if (layer !== null) layer.remove(item);
    item.set_layer(this);
    if (index === -1) this.items.push(item); else this.items.splice(index, 0, item);
    item.set_dirty();
    if (this.stage) this.stage.update_mouse();
  }
  remove(item: Item): void {
    const focused = this.stage ? this.stage.get_focus() : null;
    const i = this.items.indexOf(item);
    if (i >= 0) {
      if (focused === item) this.stage!.set_focus(null);
      this.items.splice(i, 1);
      item.set_layer(null);
    }
    if (this.stage) this.stage.update_mouse();
  }
  index_of(item: Item): number {
    const i = this.items.indexOf(item);
    if (i < 0) throw new Error('item is not in the layer');
    return i;
  }
  get_count(): number { return this.items.length; }
  get_visible(): boolean { return this._visible; }
  set_visible(visible: boolean): void { this._visible = visible; }
  get_alpha(): number { return this._alpha; }
  set_alpha(alpha: number): void { this._alpha = alpha; }
  get_stage(): Stage | null { return this.stage; }
  set_stage(stage: Stage | null): void {
    if (stage === null) this.stage = null;
    else if (this.stage !== null) throw new Error('The layer is already part of a stage');
    else this.stage = stage;
  }
  /** union of the bounds of the visible items */
  get_bounds(): Rect {
    let r: Rect | null = null;
    for (const item of this.items) if (item.get_visible()) { const b = item.get_bounds(); r = r ? r.union(b) : b; }
    return r ?? new Rect(0, 0, 0, 0);
  }
  set_dirty(): void { /* the whole frame is redrawn */ }
  get_clip(): Rect | null { return this._clip; }
  set_clip(clip: Rect | null): void {
    if (clip !== null && clip.height === 0 && this._clip !== null) clip = new Rect(this._clip.x, this._clip.y, clip.width, 0);
    this._clip = clip;
  }
  is_inside_clip(x: number, y: number): boolean { return this._clip === null || this._clip.collidepoint(x, y); }

  update(frame_delay: number): void { for (const item of this.items) item.update(frame_delay); }

  /** draws the items; with a layer alpha the layer is first rendered on its own surface */
  draw(surface: Surface): void {
    const clip = this._clip;
    if (clip !== null && (clip.width === 0 || clip.height === 0)) return;
    if (this._alpha !== 255) {
      if (this._alpha <= 0) return;
      const [buffer, bounds] = this.render_into_surface();
      if (bounds.w === 0 || bounds.h === 0) return;
      surface.set_clip(clip);
      surface.blit_alpha(buffer, [bounds.left, bounds.top], this._alpha);
      surface.set_clip(null);
      return;
    }
    surface.set_clip(clip);
    this.custom_draw.surface = surface;
    for (const item of this.items) {
      if (!item.visible) continue;
      this.draw_item(item, surface, this.custom_draw);
    }
    surface.set_clip(null);
  }
  private draw_item(item: Item, surface: Surface, cd: CustomDraw): void {
    const df = item.draw_function;
    if (df === null) {
      const alpha = (item as ItemImage).get_alpha ? (item as ItemImage).get_alpha() : 255;
      const pos = [Math.trunc(item.get_left()), Math.trunc(item.get_top())];
      if (alpha !== 255) surface.blit_alpha(item.surface, pos, alpha, item.area);
      else surface.blit(item.surface, pos, item.area);
    } else df(item, cd);
  }
  render_into_surface(): [Surface, Rect] {
    const bounds = this.get_bounds();
    const buffer = new Surface(bounds.w, bounds.h, true);
    const cd = new CustomDrawDelta(buffer, -bounds.left, -bounds.top);
    for (const item of this.items) {
      if (!item.visible) continue;
      const df = item.draw_function;
      if (df === null) {
        const alpha = (item as ItemImage).get_alpha ? (item as ItemImage).get_alpha() : 255;
        const pos = [Math.trunc(item.get_left()) - bounds.left, Math.trunc(item.get_top()) - bounds.top];
        if (alpha !== 255) buffer.blit_alpha(item.surface, pos, alpha, item.area); else buffer.blit(item.surface, pos, item.area);
      } else {
        // custom draw functions draw in absolute coordinates: shift them into the buffer
        const shifted = new ShiftedDraw(buffer, -bounds.left, -bounds.top);
        df(item, shifted);
        void cd;
      }
    }
    return [buffer, bounds];
  }
}

/** a CustomDraw whose every operation is displaced (draw functions work in screen coordinates) */
class ShiftedDraw extends CustomDraw {
  constructor(surface: Surface, private ox: number, private oy: number) { super(); this.surface = surface; }
  blit_surface(surface: Surface, pos: readonly number[], area?: Rect | readonly number[] | null): void { this.surface!.blit(surface, [pos[0] + this.ox, pos[1] + this.oy], area ?? undefined); }
  blit_image(image: Image_, pos: readonly number[], area?: Rect | readonly number[] | null): void { this.blit_surface(image.surface, pos, area); }
  fill(color: Color, rect: Rect | readonly number[]): void { const r = Rect.from(rect); this.surface!.fill(color, new Rect(r.x + this.ox, r.y + this.oy, r.w, r.h)); }
  draw_line(color: Color, s: readonly number[], e: readonly number[], width = 1): void { pgdraw.line(this.surface!, color, [s[0] + this.ox, s[1] + this.oy], [e[0] + this.ox, e[1] + this.oy], width); }
  draw_rect(color: Color, rect: Rect | readonly number[], width = 1): void { const r = Rect.from(rect); pgdraw.rect(this.surface!, color, [r.x + this.ox, r.y + this.oy, r.w, r.h], width); }
}
