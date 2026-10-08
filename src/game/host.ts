// The browser side of the game: loads the files, creates the Game on a canvas, feeds it keyboard / mouse / touch events as pygame events and runs the
// 40 frames per second loop.
import { initAssets } from '../engine/assets';
import type { Game } from '../engine/engine';
import { ACTIVEEVENT, KEYDOWN, KEYUP, K, KMOD_LALT, KMOD_LCTRL, KMOD_LSHIFT, MOUSEBUTTONDOWN, MOUSEBUTTONUP, MOUSEMOTION, event, input, setClock, time } from '../engine/pygame';
import { mixer } from '../engine/sounds';
import { createGame } from './main';

export const FPS = 40;

export interface Controller {
  game: Game | null;
  /** advances the game by n frames of 25 ms with a virtual clock (tests) */
  step(n: number): void;
  /** a pointer event in game coordinates (600x450) */
  pointer(type: 'move' | 'down' | 'up', x: number, y: number): void;
  key(code: number, down: boolean, unicode?: string): void;
  stop(): void;
  state: { loaded: boolean; progress: number; quit: boolean; error: string | null };
}

const KEY_NAMES: Record<string, number> = {
  Enter: K.RETURN, Escape: K.ESCAPE, Backspace: K.BACKSPACE, Tab: K.TAB, Delete: K.DELETE, ArrowUp: K.UP, ArrowDown: K.DOWN, ArrowLeft: K.LEFT, ArrowRight: K.RIGHT,
  Home: K.HOME, End: K.END, PageUp: K.PAGEUP, PageDown: K.PAGEDOWN, ' ': K.SPACE, F10: K.F10,
};

function pygameKey(e: KeyboardEvent): number {
  if (/^Numpad\d$/.test(e.code)) return K.KP0 + Number(e.code[6]);
  if (e.key in KEY_NAMES) return KEY_NAMES[e.key];
  if (e.key.length === 1) return e.key.toLowerCase().charCodeAt(0);
  return 0;
}

function modifiers(e: KeyboardEvent): number {
  return (e.shiftKey ? KMOD_LSHIFT : 0) | (e.ctrlKey ? KMOD_LCTRL : 0) | (e.altKey ? KMOD_LALT : 0);
}

export function startHost(canvas: HTMLCanvasElement, assetBase: string): Controller {
  const state = { loaded: false, progress: 0, quit: false, error: null as string | null };
  let virtual = false;
  let vnow = 0;
  let raf = 0;
  let stopped = false;
  let last = 0;
  let lastPos: [number, number] = [0, 0];

  const send = (type: 'move' | 'down' | 'up', x: number, y: number, button: number): void => {
    x = Math.max(0, Math.min(599, Math.floor(x))); y = Math.max(0, Math.min(449, Math.floor(y)));
    const rel: [number, number] = [x - lastPos[0], y - lastPos[1]];
    lastPos = [x, y];
    input.pos = [x, y];
    const buttons = (): [number, number, number] => [input.buttons[0], input.buttons[1], input.buttons[2]];
    if (type === 'move') event.post({ type: MOUSEMOTION, pos: [x, y], rel, buttons: buttons() });
    else if (type === 'down') {
      if (button === 0) input.buttons[0] = 1; else if (button === 2) input.buttons[2] = 1; else input.buttons[1] = 1;
      event.post({ type: MOUSEMOTION, pos: [x, y], rel, buttons: buttons() });
      event.post({ type: MOUSEBUTTONDOWN, pos: [x, y], button: button === 0 ? 1 : button === 2 ? 3 : 2 });
    } else {
      if (button === 0) input.buttons[0] = 0; else if (button === 2) input.buttons[2] = 0; else input.buttons[1] = 0;
      event.post({ type: MOUSEBUTTONUP, pos: [x, y], button: button === 0 ? 1 : button === 2 ? 3 : 2 });
    }
  };
  const sendKey = (code: number, down: boolean, unicode: string, mod: number): void => {
    if (down) input.pressed.add(code); else input.pressed.delete(code);
    input.mods = mod;
    event.post({ type: down ? KEYDOWN : KEYUP, key: code, mod, unicode });
  };

  const ctl: Controller = {
    game: null, state,
    step(n) {
      if (!ctl.game) return;
      if (!virtual) { virtual = true; vnow = performance.now(); setClock(() => vnow); }
      for (let i = 0; i < n; i++) { vnow += 1000 / FPS; ctl.game.tick(); }
    },
    pointer(type, x, y) { send(type, x, y, 0); },
    key(code, down, unicode = '') { sendKey(code, down, unicode, 0); },
    stop() { stopped = true; cancelAnimationFrame(raf); },
  };

  const toGame = (e: MouseEvent): [number, number] => {
    const r = canvas.getBoundingClientRect();
    return [((e.clientX - r.left) * 600) / r.width, ((e.clientY - r.top) * 450) / r.height];
  };

  canvas.addEventListener('pointerdown', (e) => {
    mixer.unlock();
    canvas.focus();
    try { canvas.setPointerCapture(e.pointerId); } catch { /* not capturable */ }
    const [x, y] = toGame(e);
    e.preventDefault();
    send('down', x, y, e.button);
  });
  canvas.addEventListener('pointermove', (e) => { const [x, y] = toGame(e); send('move', x, y, -1); });
  canvas.addEventListener('pointerup', (e) => { const [x, y] = toGame(e); send('up', x, y, e.button); });
  canvas.addEventListener('pointercancel', (e) => { const [x, y] = toGame(e); send('up', x, y, e.button); });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  const onKey = (down: boolean) => (e: KeyboardEvent): void => {
    const t = e.target;
    if (t !== canvas && !(t instanceof HTMLElement && t.dataset.gameInput)) return;
    if (down) mixer.unlock();
    if ((e.ctrlKey || e.metaKey) && !e.altKey) return; // browser shortcuts
    const code = pygameKey(e);
    if (code === 0) return;
    e.preventDefault();
    if (down && e.repeat) return;
    const uni = e.key.length === 1 ? e.key : '';
    sendKey(code, down, down ? uni : '', modifiers(e));
  };
  window.addEventListener('keydown', onKey(true));
  window.addEventListener('keyup', onKey(false));
  window.addEventListener('blur', () => { input.pressed.clear(); });

  const loop = (): void => {
    if (stopped) return;
    raf = requestAnimationFrame(loop);
    if (virtual || !ctl.game) return;
    const now = time.get_ticks();
    if (now - last >= 1000 / FPS - 2) {
      last = now;
      try { ctl.game.tick(); } catch (e) { console.error(e); state.error = String(e); }
    }
  };

  void (async () => {
    try {
      await initAssets(assetBase, (p) => { state.progress = p; });
      ctl.game = createGame(canvas);
      ctl.game.onQuit = () => { state.quit = true; };
      state.loaded = true;
      last = time.get_ticks();
      raf = requestAnimationFrame(loop);
    } catch (e) {
      console.error(e);
      state.error = String(e);
    }
  })();
  return ctl;
}
