// Keyboard robustness for the browser host (host.ts): key translation that survives a changed `key` between down and up, "let go of everything" for
// blur / hide / alt-tab, which element may feed keys to the game, and the watchdog that notices a dead loop or a queue nobody reads.
import { KEYUP, K, MOUSEBUTTONUP, event, input } from '../engine/pygame';

const KEY_NAMES: Record<string, number> = {
  Enter: K.RETURN, Escape: K.ESCAPE, Backspace: K.BACKSPACE, Tab: K.TAB, Delete: K.DELETE, ArrowUp: K.UP, ArrowDown: K.DOWN, ArrowLeft: K.LEFT, ArrowRight: K.RIGHT,
  Home: K.HOME, End: K.END, PageUp: K.PAGEUP, PageDown: K.PAGEDOWN, ' ': K.SPACE, F10: K.F10,
};

export interface KeyLike { key: string; code?: string; isComposing?: boolean }

export function pygameKey(e: KeyLike): number {
  if (e.code && /^Numpad\d$/.test(e.code)) return K.KP0 + Number(e.code[6]);
  if (e.key in KEY_NAMES) return KEY_NAMES[e.key];
  if (e.key.length === 1) return e.key.toLowerCase().charCodeAt(0);
  return 0;
}

/** Remembers which game key each physical key pressed: the `key` of the release can differ (Shift+1 -> '!' down, '1' up) and the key would stay stuck. */
export class KeyTracker {
  private down = new Map<string, number>();
  /** the game key for a key press (0 = not a game key / IME composition) */
  press(e: KeyLike): number {
    if (e.isComposing) return 0;
    const c = pygameKey(e);
    if (c) this.down.set(e.code || e.key, c);
    return c;
  }
  release(e: KeyLike): number {
    const id = e.code || e.key;
    const c = this.down.get(id) ?? pygameKey(e);
    this.down.delete(id);
    return c;
  }
  clear(): void { this.down.clear(); }
}

/**
 * Should a key event that targets `t` reach the game? Everything except real text fields (the game's own hidden phone field is allowed) and,
 * for Enter / Space, buttons (so a toolbar button focused with Tab still works): this way a click on a toolbar button / a closed dialog that left
 * the focus on <body> or on a button no longer kills the keyboard.
 */
export function acceptsKey(t: unknown, key: string): boolean {
  const el = t as { tagName?: string; dataset?: Record<string, string>; isContentEditable?: boolean } | null;
  if (!el || typeof el.tagName !== 'string') return true;
  if (el.dataset?.gameInput) return true;
  if (el.tagName === 'CANVAS') return true;
  if (el.isContentEditable || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') return false;
  if ((el.tagName === 'BUTTON' || el.tagName === 'A') && (key === 'Enter' || key === ' ')) return false;
  return true;
}

/** Lets go of every key and mouse button the game thinks is held (the page lost the focus / was hidden: the key-up will never arrive). */
export function releaseAllInput(): void {
  for (const k of [...input.pressed]) event.post({ type: KEYUP, key: k, mod: 0, unicode: '' });
  input.pressed.clear();
  input.mods = 0;
  if (input.buttons[0] || input.buttons[1] || input.buttons[2]) {
    input.buttons = [0, 0, 0];
    event.post({ type: MOUSEBUTTONUP, pos: [input.pos[0], input.pos[1]], button: 1 });
  }
}

export type WatchdogVerdict = 'ok' | 'stalled' | 'deaf';

/**
 * 'stalled': the loop has not ticked for `limit` ms while the page is visible. 'deaf': the same event has been waiting in the queue for `limit` ms
 * (keys arrive, nobody reads them). The clock is injected so tests can drive it.
 */
export class Watchdog {
  private lastTick: number;
  private head: unknown = undefined;
  private headSince = 0;
  constructor(private now: () => number, private limit = 2000) { this.lastTick = now(); }
  tickSeen(): void { this.lastTick = this.now(); }
  /** call about once a second */
  check(visible: boolean): WatchdogVerdict {
    const n = this.now();
    if (!visible) { this.lastTick = n; this.head = undefined; return 'ok'; }
    const head = input.queue[0];
    if (head !== this.head) { this.head = head; this.headSince = n; }
    if (n - this.lastTick > this.limit) { this.lastTick = n; return 'stalled'; }
    if (head !== undefined && n - this.headSince > this.limit) { this.headSince = n; return 'deaf'; }
    return 'ok';
  }
}
