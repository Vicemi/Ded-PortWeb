// framework/animations.py: fades, moves, resizes, image sequences, waits and the "blind" (curtain) effect. All of them are timers of the stage.
import { Image_ } from './assets';
import { ItemImage, Layer, type Item } from './items';
import { Rect, time, transform } from './pygame';
import { blindHook, type Stage, type TimerKey } from './stage';

export const BlindDirection = { SHOW_UP: 0, SHOW_DOWN: 1, HIDE_UP: 2, HIDE_DOWN: 3 } as const;

export class MoveMarks {
  constructor(public mark_image: Image_, public separation: number) {}
}

let WAIT_ORDINAL = 1;

function item_stage(item: Item): Stage {
  const layer = item.get_layer();
  if (layer === null) throw new Error('The item must be part of a layer');
  const stage = layer.get_stage();
  if (stage === null) throw new Error("The item's layer must be part of a stage");
  return stage;
}
function layer_stage(layer: Layer): Stage {
  const stage = layer.get_stage();
  if (stage === null) throw new Error('The layer must be part of a stage');
  return stage;
}

// ----------------------------------------------------------------------------------------------------------------------------- fades
/** Fades an item in. Returns the key that identifies the fade. */
export function fade_in_item(item: ItemImage, duration = 500, callback: ((i: any) => void) | null = null, to_alpha = 255): TimerKey {
  const stage = item_stage(item);
  const key = [item, 'fade'];
  if (item.get_alpha() === 255) item.set_alpha(0);
  stage.stop_timer(key);
  const data = [time.get_ticks(), null, duration, to_alpha, callback, stage];
  stage.start_timer(key, 20, timer_fade_in_item, data, true, true);
  return key;
}
/** `remove`: the item is removed from its layer at the end of the fade */
export function fade_out_item(item: ItemImage, remove: unknown, duration = 500, callback: ((i: any) => void) | null = null): TimerKey {
  const stage = item_stage(item);
  const key = [item, 'fade'];
  stage.stop_timer(key);
  item.hide_rollover();
  const data = [time.get_ticks(), null, duration, remove, callback, stage];
  stage.start_timer(key, 20, timer_fade_out_item, data, true, true);
  return key;
}
export function cancel_item_fade(key: TimerKey): void {
  const stage = item_stage((key as unknown[])[0] as Item);
  stage.stop_timer(key);
}
export function fade_in_layer(layer: Layer, duration = 500, callback: ((l: Layer) => void) | null = null): void {
  const stage = layer_stage(layer);
  if (layer.get_alpha() === 255) layer.set_alpha(0);
  const key = [layer, 'fade'];
  stage.stop_timer(key);
  stage.start_timer(key, 20, timer_fade_in_layer, [time.get_ticks(), null, duration, callback, stage], true, true);
}
export function fade_out_layer(layer: Layer, duration = 500, callback: ((l: Layer) => void) | null = null): void {
  const stage = layer_stage(layer);
  const key = [layer, 'fade'];
  stage.stop_timer(key);
  stage.start_timer(key, 20, timer_fade_out_layer, [time.get_ticks(), null, duration, callback, stage], true, true);
}

function timer_fade_in_item(key: TimerKey, data: any[]): void {
  const item = (key as any[])[0] as ItemImage;
  const now = time.get_ticks();
  const elapsed = data[1] === null ? Math.min(0, now - data[0]) : now - data[1];
  data[1] = now;
  const to_alpha = data[3];
  let alpha = item.get_alpha();
  alpha += to_alpha * (elapsed / data[2]);
  if (alpha < to_alpha) item.set_alpha(alpha);
  else {
    item.set_alpha(to_alpha);
    data[5].stop_timer(key);
    if (data[4] !== null) data[4](item);
  }
}
function timer_fade_out_item(key: TimerKey, data: any[]): void {
  const item = (key as any[])[0] as ItemImage;
  const now = time.get_ticks();
  const elapsed = data[1] === null ? Math.min(0, now - data[0]) : now - data[1];
  data[1] = now;
  let alpha = item.get_alpha();
  alpha -= 255 * (elapsed / data[2]);
  if (alpha >= 0) item.set_alpha(alpha);
  else {
    item.set_alpha(0);
    const layer = item.get_layer();
    if (data[3] && layer !== null) layer.remove(item);
    data[5].stop_timer(key);
    if (data[4] !== null) data[4](item);
  }
}
function timer_fade_in_layer(key: TimerKey, data: any[]): void {
  const layer = (key as any[])[0] as Layer;
  const now = time.get_ticks();
  const elapsed = data[1] === null ? Math.min(0, now - data[0]) : now - data[1];
  data[1] = now;
  let alpha = layer.get_alpha();
  alpha += 255 * (elapsed / data[2]);
  if (alpha < 255) layer.set_alpha(alpha);
  else {
    layer.set_alpha(255);
    data[4].stop_timer(key);
    if (data[3] !== null) data[3](layer);
  }
}
function timer_fade_out_layer(key: TimerKey, data: any[]): void {
  const layer = (key as any[])[0] as Layer;
  const now = time.get_ticks();
  const elapsed = data[1] === null ? Math.min(0, now - data[0]) : now - data[1];
  data[1] = now;
  let alpha = layer.get_alpha();
  alpha -= 255 * (elapsed / data[2]);
  if (alpha >= 0) layer.set_alpha(alpha);
  else {
    layer.set_alpha(0);
    data[4].stop_timer(key);
    if (data[3] !== null) data[3](layer);
  }
}

// ----------------------------------------------------------------------------------------------------------------------------- image sequence
/** Shows `images` one after the other through an ItemImage. loops: repetitions after the first pass (-1 = forever). */
export function start_image_sequence(item_image: ItemImage, images: Image_[], fps: number, loops = 0, callback: ((i: any) => void) | null = null): void {
  const stage = item_stage(item_image);
  const key = [item_image, 'image_sequence'];
  stage.stop_timer(key);
  const milliseconds = Number.isInteger(fps) ? Math.floor(1000 / fps) : 1000 / fps;
  stage.start_timer(key, milliseconds, timer_image_sequence, [0, images, loops, callback, stage]);
}
/** Stops the sequence; returns the index it had reached */
export function stop_image_sequence(item_image: ItemImage): number {
  const stage = item_stage(item_image);
  const d = stage.stop_timer([item_image, 'image_sequence']);
  return d === null ? 0 : d[0];
}
function timer_image_sequence(key: TimerKey, data: any[]): void {
  const item = (key as any[])[0] as ItemImage;
  const images = data[1] as Image_[];
  if (images.length > 0) item.set_image(images[data[0]]);
  data[0] += 1;
  if (data[0] >= images.length) {
    data[0] = 0;
    if (data[2] !== -1) {
      data[2] -= 1;
      if (data[2] < 0) {
        data[4].stop_timer(key);
        if (data[3] !== null) data[3](item);
      }
    }
  }
}

// ----------------------------------------------------------------------------------------------------------------------------- move
/**
 * Moves an item in a straight line. `acceleration` = [maxvel_t, maxvel_dist, tension] (sinusoidal easing) or null for a uniform move.
 */
export function start_move(item: Item, left: number, top: number, duration: number, acceleration: readonly number[] | null = null,
  move_marks: MoveMarks | null = null, callback: ((i: any) => void) | null = null): void {
  const stage = item_stage(item);
  const key = [item, 'move'];
  stage.stop_timer(key);
  const item_left = item.get_left(), item_top = item.get_top();
  let move_marks_data: number[] | null;
  if (move_marks === null) move_marks_data = null;
  else {
    const angle = Math.atan2(top - item_top, left - item_left);
    const dx = Math.cos(angle) * move_marks.separation, dy = Math.sin(angle) * move_marks.separation;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) move_marks_data = null;
    else {
      const mdx = Math.floor(item.get_width() / 2) - Math.floor(move_marks.mark_image.get_width() / 2);
      const mdy = Math.floor(item.get_height() / 2) - Math.floor(move_marks.mark_image.get_height() / 2);
      move_marks_data = [item_left - dx, item_top - dy, dx, dy, mdx, mdy];
    }
  }
  const data = [null, duration, item_left, item_top, left, top, acceleration, move_marks, move_marks_data, callback, stage];
  stage.start_timer(key, 20, timer_move, data, true, true);
}
export function remove_move_marks(item: Item): void {
  const layer = item.get_layer();
  if (layer !== null) {
    const rm: Item[] = [];
    for (const i of layer.items) if (i instanceof ItemImage && (i as any).move_mark_item === item) rm.push(i);
    for (const i of rm) layer.remove(i);
  }
}
export function stop_move(item: Item): void { item_stage(item).stop_timer([item, 'move']); }

function timer_move(key: TimerKey, data: any[]): void {
  const item = (key as any[])[0] as Item;
  const now = time.get_ticks();
  let elapsed: number;
  if (data[0] === null) { elapsed = 0; data[0] = now; } else elapsed = now - data[0];
  const duration = data[1];
  const [, , left_from, top_from, left_to, top_to, acceleration] = data;
  const percentage = Math.min(1, elapsed / duration);
  let dx: number, dy: number;
  if (acceleration === null) { dx = (left_to - left_from) * percentage; dy = (top_to - top_from) * percentage; }
  else {
    const [maxvel_t, maxvel_dist, tension] = acceleration as number[];
    let factor: number;
    if (percentage <= maxvel_t) {
      factor = Math.cos((percentage / maxvel_t) * Math.PI / 2 - Math.PI) + 1;
      factor = Math.pow(factor, tension) * maxvel_dist;
    } else {
      factor = Math.cos(((percentage - maxvel_t) / (1 - maxvel_t)) * Math.PI / 2 - Math.PI / 2) + 1 - 1;
      factor = Math.pow(factor, tension) * (1 - maxvel_dist) + maxvel_dist;
    }
    dx = (left_to - left_from) * factor; dy = (top_to - top_from) * factor;
  }
  const new_left = left_from + dx, new_top = top_from + dy;
  item.set_left(new_left);
  item.set_top(new_top);
  const move_marks = data[7] as MoveMarks | null;
  if (move_marks !== null) {
    const md = data[8] as number[];
    const dxm = md[2], dym = md[3];
    // (the original's condition: both axes must still be short of the target)
    while (((dxm > 0 && md[0] + dxm < new_left) || (dxm < 0 && md[0] + dxm > new_left)) && ((dym > 0 && md[1] + dym < new_top) || (dym < 0 && md[1] + dym > new_top))) {
      const mx = md[0] + dxm, my = md[1] + dym;
      const mark = new ItemImage(mx + md[4], my + md[5], move_marks.mark_image);
      (mark as any).move_mark_item = item;
      const layer = item.get_layer();
      if (layer !== null) layer.add(mark, layer.items.indexOf(item));
      md[0] = mx; md[1] = my;
    }
  }
  if (percentage >= 1) {
    data[10].stop_timer(key);
    if (data[9] !== null) data[9](item);
  }
}

// ----------------------------------------------------------------------------------------------------------------------------- resize
/** origin_type: 0 = from the top left corner, 1 = from the centre */
export function start_resize(item_image: ItemImage, image: Image_, from_size: readonly number[], to_size: readonly number[], duration: number, origin_type = 1,
  callback: ((i: any) => void) | null = null): void {
  const stage = item_stage(item_image);
  const key = [item_image, 'resize'];
  stage.stop_timer(key);
  const resized = new Image_(transform.smoothscale(image.surface, [Math.trunc(from_size[0]), Math.trunc(from_size[1])]));
  item_image.set_image(resized);
  const origin_pos = origin_type === 1 ? [item_image.get_left() + Math.floor(item_image.get_width() / 2), item_image.get_top() + Math.floor(item_image.get_height() / 2)] : null;
  const data = [null, image, duration, origin_type, origin_pos, from_size, to_size, callback, stage];
  stage.start_timer(key, 20, timer_resize, data, true, true);
}
export function stop_resize(item_image: ItemImage): void { item_stage(item_image).stop_timer([item_image, 'resize']); }
function timer_resize(key: TimerKey, data: any[]): void {
  const item_image = (key as any[])[0] as ItemImage;
  const now = time.get_ticks();
  let elapsed: number;
  if (data[0] === null) { elapsed = 0; data[0] = now; } else elapsed = now - data[0];
  const image = data[1] as Image_, duration = data[2], origin_type = data[3], origin_pos = data[4], from_size = data[5], to_size = data[6];
  const percentage = Math.min(1, elapsed / duration);
  const new_size = [Math.trunc(from_size[0] + (to_size[0] - from_size[0]) * percentage), Math.trunc(from_size[1] + (to_size[1] - from_size[1]) * percentage)];
  let new_left: number, new_top: number;
  if (origin_type === 1) { new_left = origin_pos[0] - Math.floor(new_size[0] / 2); new_top = origin_pos[1] - Math.floor(new_size[1] / 2); }
  else { new_left = item_image.get_left(); new_top = item_image.get_top(); }
  item_image.set_image(new Image_(transform.smoothscale(image.surface, new_size)));
  item_image.set_left(new_left);
  item_image.set_top(new_top);
  if (percentage >= 1) {
    data[8].stop_timer(key);
    if (data[7] !== null) data[7](item_image);
  }
}

// ----------------------------------------------------------------------------------------------------------------------------- waits
/** Calls `callback` after `milliseconds`. Returns the key to cancel it with cancel_wait. */
export function wait(stage: Stage, milliseconds: number, callback: () => void): TimerKey {
  const key = ['wait', WAIT_ORDINAL];
  stage.start_timer(key, milliseconds, timer_wait, [stage, callback]);
  WAIT_ORDINAL++;
  if (WAIT_ORDINAL === 99999) WAIT_ORDINAL = 1;
  return key;
}
/** Like wait, but the interface is locked (no mouse or key events) while waiting. */
export function wait_locked(stage: Stage, milliseconds: number, callback: ((data?: any) => void) | null, data: unknown = null): TimerKey {
  stage.lock_ui();
  const key = ['wait_locked', WAIT_ORDINAL];
  stage.start_timer(key, milliseconds, timer_wait_locked, [stage, callback, data]);
  WAIT_ORDINAL++;
  if (WAIT_ORDINAL === 99999) WAIT_ORDINAL = 1;
  return key;
}
export function cancel_wait(stage: Stage, key: TimerKey): void { stage.stop_timer(key); }
function timer_wait(key: TimerKey, data: any[]): void {
  data[0].stop_timer(key);
  data[1]();
}
function timer_wait_locked(key: TimerKey, data: any[]): void {
  const [stage, callback, cb_data] = data;
  stage.stop_timer(key);
  stage.unlock_ui();
  if (callback !== null) { if (cb_data === null) callback(); else callback(cb_data); }
}

// ----------------------------------------------------------------------------------------------------------------------------- blind
export function stop_blind_layer(layer: Layer): void {
  const stage = layer_stage(layer);
  const data = stage.stop_timer([layer, 'blind']);
  if (data !== null) {
    if (data[9]) stage.unlock_ui();
    const direction = data[1];
    if (direction === BlindDirection.SHOW_UP || direction === BlindDirection.SHOW_DOWN) layer.set_clip(null);
    else if (direction === BlindDirection.HIDE_UP || direction === BlindDirection.HIDE_DOWN) layer.set_clip(new Rect(0, data[5], data[3], data[6]));
  }
}
/**
 * Curtain effect that shows or hides a layer. `area`: zone crossed by the blind (null = the whole screen).
 * duration: time to cross the full screen. lock_ui: block the interface while it runs.
 */
export function blind_layer(layer: Layer, direction: number, area: Rect | null, duration = 450, callback: ((l: Layer) => void) | null = null, lock_ui = true): void {
  const stage = layer_stage(layer);
  const key = [layer, 'blind'];
  let data = stage.stop_timer(key) as any[] | null;
  const [window_width, window_height] = stage.game.get_window_size();
  const dy_factor = window_height / duration;
  if (data !== null && data[9]) stage.unlock_ui();
  if (data !== null && data[1] === direction && data[0] !== null) {
    data[7] = callback;
  } else {
    let current_top = 0, current_height = 0;
    if (direction === BlindDirection.SHOW_UP || direction === BlindDirection.SHOW_DOWN) {
      if (direction === BlindDirection.SHOW_DOWN) current_top = area === null ? 0 : area.top;
      else current_top = area === null ? window_height : area.top + area.height;
      current_height = 0;
      layer.set_clip(new Rect(0, current_top, window_width, 0));
    } else if (direction === BlindDirection.HIDE_UP || direction === BlindDirection.HIDE_DOWN) {
      let hidden = false;
      if (!layer.get_visible()) hidden = true;
      else {
        const clip = layer.get_clip();
        if (clip !== null && (clip.width === 0 || clip.height === 0)) hidden = true;
      }
      if (hidden) { if (callback !== null) callback(layer); return; }
      if (area === null) { current_top = 0; current_height = window_height; } else { current_top = area.top; current_height = area.height; }
      layer.set_clip(null);
    }
    data = [null, direction, dy_factor, window_width, window_height, current_top, current_height, callback, stage, lock_ui];
  }
  if (lock_ui) stage.lock_ui();
  stage.start_timer(key, 20, timer_blind_layer, data, true, true);
}
export function cancel_blind_layer(stage: Stage, layer: Layer, show: boolean): void {
  const data = stage.stop_timer([layer, 'blind']);
  if (data !== null && data[9]) stage.unlock_ui();
  layer.set_clip(show ? null : new Rect(0, 0, 0, 0));
}
export function is_applying_blind(stage: Stage, layer: Layer): boolean { return stage.is_timer_started([layer, 'blind']); }

function timer_blind_layer(key: TimerKey, data: any[]): void {
  const layer = (key as any[])[0] as Layer;
  const now = time.get_ticks();
  const elapsed = data[0] === null ? 0 : now - data[0];
  data[0] = now;
  const dy = elapsed * data[2];
  let end_of_blind = false;
  let show = false;
  const direction = data[1];
  if (direction === BlindDirection.SHOW_UP) {
    show = true;
    if (data[6] >= data[4]) end_of_blind = true;
    else if (data[6] + dy >= data[4]) { data[5] = 0; data[6] = data[4]; }
    else { data[5] -= dy; data[6] += dy; }
  } else if (direction === BlindDirection.SHOW_DOWN) {
    show = true;
    if (data[6] >= data[4]) end_of_blind = true;
    else if (data[6] + dy >= data[4]) data[6] = data[4];
    else data[6] += dy;
  } else if (direction === BlindDirection.HIDE_UP) {
    show = false;
    if (data[6] <= 0) end_of_blind = true;
    else if (data[6] - dy <= 0) { data[6] = 0; end_of_blind = true; }
    else data[6] -= dy;
  } else if (direction === BlindDirection.HIDE_DOWN) {
    show = false;
    if (data[6] <= 0) end_of_blind = true;
    else if (data[6] - dy <= 0) { data[5] = 0; data[6] = 0; end_of_blind = true; }
    else { data[5] += dy; data[6] -= dy; }
  }
  if (end_of_blind && show) layer.set_clip(null);
  else layer.set_clip(new Rect(0, data[5], data[3], data[6]));
  if (end_of_blind) {
    const stage = data[8], lock_ui = data[9];
    stage.stop_timer(key);
    stage.update_mouse();
    if (lock_ui) stage.unlock_ui();
    const callback = data[7];
    if (callback !== null) { stage.render(); callback(layer); }
  }
}

blindHook.blind_layer = (layer, direction, area, duration, callback) => blind_layer(layer, direction, area, duration, callback);
