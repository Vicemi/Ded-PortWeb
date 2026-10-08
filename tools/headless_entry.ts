// Runs the real game code in Node (no browser): canvas from @napi-rs/canvas, assets from public/assets. Used by the tests and for driving the game
// through its screens while developing (see tools/headless.mjs).
import { initAssets } from '../src/engine/assets';
import { K, event, input, MOUSEBUTTONDOWN, MOUSEBUTTONUP, MOUSEMOTION, KEYDOWN, KEYUP, setClock } from '../src/engine/pygame';
import { createGame } from '../src/game/main';
import type { Game } from '../src/engine/engine';
import { lazy } from '../src/runtime/py';

export interface Dev {
  game: Game;
  canvas: any;
  go(n: number): void;
  click(x: number, y: number, frames?: number): void;
  down(x: number, y: number): void;
  up(x: number, y: number): void;
  move(x: number, y: number, frames?: number): void;
  key(code: number, frames?: number, unicode?: string): void;
  type(text: string): void;
  stage(): string;
  now(): number;
  save(name: string): void;
  K: typeof K;
  /** a generated game module by path, e.g. mod('game/stages/phase0').Phase0Stage */
  mod(path: string): any;
}

export async function start(assetBase: string, save: (name: string, buf: Buffer) => void): Promise<Dev> {
  await initAssets(assetBase);
  let t = 1000;
  setClock(() => t);
  const canvas = (globalThis as any).document.createElement('canvas');
  const game = createGame(canvas);
  let last: [number, number] = [0, 0];
  const go = (n: number): void => { for (let i = 0; i < n; i++) { t += 25; game.tick(); } };
  const post = (type: number, x: number, y: number, button = 1): void => {
    input.pos = [x, y];
    const rel: [number, number] = [x - last[0], y - last[1]];
    last = [x, y];
    if (type === MOUSEMOTION) event.post({ type, pos: [x, y], rel, buttons: [input.buttons[0], 0, 0] });
    else event.post({ type, pos: [x, y], button });
  };
  const dev: Dev = {
    game, canvas, K,
    mod: (path) => lazy(path),
    go,
    move(x, y, frames = 3) { post(MOUSEMOTION, x, y); go(frames); },
    down(x, y) { dev.move(x, y, 3); input.buttons[0] = 1; post(MOUSEMOTION, x, y); post(MOUSEBUTTONDOWN, x, y); go(2); },
    up(x, y) { input.buttons[0] = 0; post(MOUSEBUTTONUP, x, y); go(2); },
    click(x, y, frames = 20) { dev.down(x, y); dev.up(x, y); go(frames); },
    key(code, frames = 3, unicode = '') {
      input.pressed.add(code); event.post({ type: KEYDOWN, key: code, mod: 0, unicode }); go(2);
      input.pressed.delete(code); event.post({ type: KEYUP, key: code, mod: 0, unicode: '' }); go(frames);
    },
    type(text) { for (const ch of text) dev.key(ch.toLowerCase().charCodeAt(0), 2, ch); },
    stage() { return (game as any).stage?.constructor?.name ?? '?'; },
    now() { return t; },
    save(name) { save(name, (game.window.canvas as any).toBuffer('image/png')); },
  };
  return dev;
}
