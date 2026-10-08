// What `from framework.stage import *` gave to the original game modules: the stage framework, pygame constants and a few module namespaces.
import * as assets_ from '../engine/assets';
import * as engine_ from '../engine/engine';
import * as sounds_ from '../engine/sounds';
import * as py from './py';
import {
  KEYDOWN, KEYUP, MOUSEMOTION, MOUSEBUTTONDOWN, MOUSEBUTTONUP, QUIT, ACTIVEEVENT, USEREVENT, KMOD_NONE, KMOD_LSHIFT, KMOD_RSHIFT, KMOD_LCTRL, KMOD_RCTRL,
  KMOD_LALT, KMOD_RALT, KMOD_SHIFT, KMOD_CTRL, KMOD_ALT, Rect, Surface, event as pgevent, mouse as pgmouse, keyboard, time as pgtime, draw as pgdraw, transform as pgtransform,
} from '../engine/pygame';
import { mixer } from '../engine/sounds';
import * as keys from './keys';

export { Stage, StageIso, IsoDefinition, IsoDefState, IsoPlaceHolder, IsoState, ItemCell, MUSIC_ENDSOUND_EVENT, DBLCLICK_DELAY } from '../engine/stage';
export {
  Layer, Item, ItemEvent, ItemEventArgs, ItemEventArgsMouse, ItemEventArgsStateChanged, ItemImage, ItemCustomDraw, ItemMask, ItemText, ItemRect, CustomDraw, CustomDrawDelta,
} from '../engine/items';
export {
  KEYDOWN, KEYUP, MOUSEMOTION, MOUSEBUTTONDOWN, MOUSEBUTTONUP, QUIT, ACTIVEEVENT, USEREVENT, KMOD_NONE, KMOD_LSHIFT, KMOD_RSHIFT, KMOD_LCTRL, KMOD_RCTRL,
  KMOD_LALT, KMOD_RALT, KMOD_SHIFT, KMOD_CTRL, KMOD_ALT, Rect,
};
export * from './keys';
export const assets = assets_;
export const engine = engine_;
export const sounds = sounds_;
export const os = py.os;
export const math = py.math;
export const sys = py.sys;
export const gc = py.gc;

let currentGame: engine_.Game | null = null;
export function setCurrentGame(g: engine_.Game | null): void { currentGame = g; }
export function getCurrentGame(): engine_.Game | null { return currentGame; }

/** pygame.Surface((w, h), flags, depth) */
class PgSurface extends Surface {
  constructor(size: readonly number[], flags: number | Surface = 0, _depth = 0) { super(size[0], size[1], typeof flags === 'number' ? (flags & 0x10000) !== 0 : true); }
}

/** The subset of the pygame module that the game code touches directly */
export const pygame = {
  time: {
    get_ticks: pgtime.get_ticks,
    /** pygame.time.wait / delay: nothing runs for this long (see Game.block) */
    wait: (ms: number): void => { currentGame?.block(ms); },
    delay: (ms: number): void => { currentGame?.block(ms); },
  },
  Surface: PgSurface, Rect, SRCALPHA: 0x10000,
  event: pgevent, mouse: pgmouse, key: keyboard, draw: pgdraw, transform: pgtransform,
  mixer: { find_channel: () => mixer.find_channel(), Channel: (i: number) => mixer.Channel(i), get_num_channels: () => mixer.get_num_channels(), stop: () => mixer.stopAll() },
  display: { get_surface: () => currentGame!.window },
  error: Error,
  KEYDOWN, KEYUP, MOUSEMOTION, MOUSEBUTTONDOWN, MOUSEBUTTONUP, QUIT, USEREVENT,
  KMOD_NONE, KMOD_LSHIFT, KMOD_RSHIFT, KMOD_LCTRL, KMOD_RCTRL, KMOD_LALT, KMOD_RALT, KMOD_SHIFT, KMOD_CTRL, KMOD_ALT,
  ...Object.fromEntries(Object.entries(keys)),
};
