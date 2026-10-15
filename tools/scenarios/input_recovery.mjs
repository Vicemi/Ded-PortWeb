// The keyboard must come back by itself: keys held when the window loses focus are released, a key-up with a different `key` than the key-down does not
// leave the key stuck, only real text fields (not toolbar buttons / <body>) keep keys from the game, a throwing handler does not eat the next events,
// a stuck interface lock is released, and the watchdog notices a stalled loop or an event nobody reads.
import { toHub } from './lib.mjs';
const assert = (c, m) => { if (!c) throw new Error('ASSERT: ' + m); };
export default async (dev) => {
  const { KeyTracker, acceptsKey, releaseAllInput, Watchdog } = dev.inputguard;
  const { input, event, KEYUP, MOUSEBUTTONUP } = dev.pygame;
  toHub(dev);

  // 1. Shift+1: '!' goes down, '1' comes up -> the same game key
  const t = new KeyTracker();
  const d = t.press({ key: '!', code: 'Digit1' }), u = t.release({ key: '1', code: 'Digit1' });
  assert(d !== 0 && d === u, 'key-up matches key-down: ' + d + ' vs ' + u);
  assert(t.press({ key: 'a', code: 'KeyA', isComposing: true }) === 0, 'IME composition is not a game key');
  assert(t.press({ key: 'Process', code: 'KeyA' }) === 0 && t.press({ key: 'Dead', code: 'Quote' }) === 0, 'IME / dead keys ignored');

  // 2. who may feed keys to the game
  const el = (tagName, extra = {}) => ({ tagName, dataset: {}, ...extra });
  assert(acceptsKey(null, 'a') && acceptsKey(el('BODY'), 'a') && acceptsKey(el('CANVAS'), 'a'), 'body / canvas accepted');
  assert(acceptsKey(el('BUTTON'), 'ArrowLeft') && !acceptsKey(el('BUTTON'), 'Enter') && !acceptsKey(el('BUTTON'), ' '), 'a focused toolbar button keeps Enter / Space but not the arrows');
  assert(!acceptsKey(el('INPUT'), 'a') && !acceptsKey(el('TEXTAREA'), 'a') && !acceptsKey(el('DIV', { isContentEditable: true }), 'a'), 'text fields keep their keys');
  assert(acceptsKey(el('INPUT', { dataset: { gameInput: '1' } }), 'a'), 'the game input is accepted');

  // 3. blur / hide: held keys and buttons are released, the game receives the key-ups
  dev.hold(dev.K.LEFT, true); dev.hold(dev.K.UP, true); input.buttons[0] = 1; input.mods = 1;
  event.clear();
  releaseAllInput();
  const q = input.queue.map((e) => e.type + ':' + (e.key ?? e.button));
  assert(input.pressed.size === 0 && input.mods === 0 && input.buttons[0] === 0, 'state cleared');
  assert(q.filter((x) => x.startsWith(KEYUP + ':')).length === 2 && q.some((x) => x.startsWith(MOUSEBUTTONUP + ':')), 'key-ups and button-up posted: ' + q);
  dev.go(3);

  // 4. an exception inside an event handler: logged, the other events still run, the loop goes on
  const stage = dev.game.stage;
  const was = globalThis.__DED_STRICT; globalThis.__DED_STRICT = false;
  const realErr = console.error; let logged = 0; console.error = () => { logged++; };
  let seen = 0;
  stage.on_mouse_button_down = () => { seen++; if (seen === 1) throw new Error('boom'); };
  event.post({ type: dev.pygame.MOUSEBUTTONDOWN, pos: [5, 5], button: 1 });
  event.post({ type: dev.pygame.MOUSEBUTTONDOWN, pos: [5, 5], button: 1 });
  dev.go(3);
  console.error = realErr; globalThis.__DED_STRICT = was;
  assert(logged === 1 && seen === 2, 'second event handled after the first threw: seen=' + seen + ' logged=' + logged);
  delete stage.on_mouse_button_down;
  assert(stage.dialogs.length === 0, 'no dialog open in the hub');

  // 5. an interface lock nobody releases (exception in an animation) frees itself after 10 s
  stage.lock_ui(); stage.lock_ui();
  event.post({ type: dev.pygame.KEYDOWN, key: 99, mod: 0, unicode: 'c' });
  let got = 0; stage.handle_event = (ev) => { if (ev.type === dev.pygame.KEYDOWN && ev.key === 100) got++; };
  dev.go(200);                                   // 5 s
  assert(stage.locks === 2, 'locks are kept while recent');
  dev.go(260);                                   // > 10 s
  assert(stage.locks === 0, 'stuck lock released');
  event.post({ type: dev.pygame.KEYDOWN, key: 100, mod: 0, unicode: 'd' }); dev.go(3);
  assert(got === 1, 'keys reach the stage again');
  delete stage.handle_event;
  stage.unlock_ui(); assert(stage.locks === 0, 'unlock never goes negative');

  // 6. watchdog
  let now = 0; const w = new Watchdog(() => now, 2000);
  now = 1000; assert(w.check(true) === 'ok', 'fresh');
  w.tickSeen(); now = 2500; assert(w.check(true) === 'ok', 'recent tick');
  now = 4600; assert(w.check(true) === 'stalled', 'no tick for > 2 s while visible');
  now = 9000; assert(w.check(false) === 'ok', 'hidden pages are not judged');
  w.tickSeen(); event.clear(); event.post({ type: dev.pygame.KEYDOWN, key: 97, mod: 0, unicode: 'a' });
  now = 9500; assert(w.check(true) === 'ok', 'queue just filled'); w.tickSeen();
  now = 11000; w.tickSeen(); assert(w.check(true) === 'ok', 'not yet 2 s');
  now = 11600; w.tickSeen(); assert(w.check(true) === 'deaf', 'the same event waits for > 2 s: nobody reads the keys');
  event.clear(); now = 12000; w.tickSeen(); assert(w.check(true) === 'ok', 'cleared queue is fine');

  // 7. after all that the real game still answers the keyboard
  dev.key(dev.K.ESCAPE, 20);
  console.log('input recovery ok, stage:', dev.stage());
};
