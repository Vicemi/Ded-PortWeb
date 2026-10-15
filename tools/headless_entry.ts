// Runs the real game code in Node (no browser): canvas from @napi-rs/canvas, assets from public/assets. Used by the tests and for driving the game
// through its screens while developing (see tools/headless.mjs).
import { assetsComplete, initAssets } from '../src/engine/assets';
import * as assetsMod from '../src/engine/assets';
import * as mgart from '../src/game/minigames/mgart';
import { K, event, input, MOUSEBUTTONDOWN, MOUSEBUTTONUP, MOUSEMOTION, KEYDOWN, KEYUP, setClock } from '../src/engine/pygame';
import { createGame } from '../src/game/main';
import type { Game } from '../src/engine/engine';
import { lazy } from '../src/runtime/py';
import * as newgames from '../src/game/minigames/newgames';
import * as candombe from '../src/game/minigames/candombe';
import * as mgfx from '../src/game/minigames/fx';
import { mixer } from '../src/engine/sounds';
import * as extra from '../src/game/minigames/extra';
import * as achievements from '../src/game/content/achievements';
import * as twist from '../src/game/content/twist';
import * as grace from '../src/game/content/grace';
import * as py from '../src/runtime/py';
import * as safefs from '../src/runtime/safefs';
import * as autosave from '../src/game/autosave';
import * as pygame from '../src/engine/pygame';
import * as inputguard from '../src/game/inputguard';

export interface Dev {
  game: Game;
  canvas: any;
  go(n: number): void;
  click(x: number, y: number, frames?: number): void;
  down(x: number, y: number): void;
  up(x: number, y: number): void;
  move(x: number, y: number, frames?: number): void;
  key(code: number, frames?: number, unicode?: string, mod?: number): void;
  type(text: string): void;
  /** keep a key pressed (or release it) without generating a key event */
  hold(code: number, down: boolean): void;
  stage(): string;
  now(): number;
  save(name: string): void;
  K: typeof K;
  /** the new minigames (hand-written) */
  newgames: typeof newgames;
  candombe: typeof candombe;
  mixer: typeof mixer;
  /** the minigames of src/game/minigames/extra.ts (Matero, Corredora) */
  extra: typeof extra;
  achievements: typeof achievements;
  twist: typeof twist;
  grace: typeof grace;
  /** the file layer under the saves (see tools/scenarios/save_safety.mjs) */
  py: typeof py;
  safefs: typeof safefs;
  autosave: typeof autosave;
  inputguard: typeof inputguard;
  pygame: typeof pygame;
  /** image registry (register_image for fakes) and the optional minigame art helpers (artStats counts the images drawn) */
  assets: typeof assetsMod;
  mgart: typeof mgart;
  mgfx: typeof mgfx;
  /** a generated game module by path, e.g. mod('game/stages/phase0').Phase0Stage */
  mod(path: string): any;
}

export async function start(assetBase: string, save: (name: string, buf: Buffer) => void): Promise<Dev> {
  await initAssets(assetBase);
  await assetsComplete();
  let t = 1000;
  setClock(() => t);
  const canvas = (globalThis as any).document.createElement('canvas');
  const game = createGame(canvas);
  let last: [number, number] = [0, 0];
  const digest = (globalThis as any).__DED_DIGEST as number[] | undefined;
  const hash = (): number => { const p = game.window.pixels(); let h = 2166136261; for (let i = 0; i < p.length; i += 7) h = Math.imul(h ^ p[i], 16777619); return h >>> 0; };
  const go = (n: number): void => { for (let i = 0; i < n; i++) { t += 25; game.tick(); if (digest) digest.push(hash()); } };
  const post = (type: number, x: number, y: number, button = 1): void => {
    input.pos = [x, y];
    const rel: [number, number] = [x - last[0], y - last[1]];
    last = [x, y];
    if (type === MOUSEMOTION) event.post({ type, pos: [x, y], rel, buttons: [input.buttons[0], 0, 0] });
    else event.post({ type, pos: [x, y], button });
  };
  const dev: Dev = {
    game, canvas, K, newgames, candombe, mixer, extra, achievements, twist, grace, py, safefs, autosave, inputguard, pygame, assets: assetsMod, mgart, mgfx,
    mod: (path) => lazy(path),
    go,
    move(x, y, frames = 3) { post(MOUSEMOTION, x, y); go(frames); },
    down(x, y) { dev.move(x, y, 3); input.buttons[0] = 1; post(MOUSEMOTION, x, y); post(MOUSEBUTTONDOWN, x, y); go(2); },
    up(x, y) { input.buttons[0] = 0; post(MOUSEBUTTONUP, x, y); go(2); },
    click(x, y, frames = 20) { dev.down(x, y); dev.up(x, y); go(frames); },
    key(code, frames = 3, unicode = '', mod = 0) {
      input.pressed.add(code); input.mods = mod; event.post({ type: KEYDOWN, key: code, mod, unicode }); go(2);
      input.pressed.delete(code); input.mods = 0; event.post({ type: KEYUP, key: code, mod, unicode: '' }); go(frames);
    },
    hold(code, down) { if (down) input.pressed.add(code); else input.pressed.delete(code); },
    type(text) { for (const ch of text) dev.key(ch.toLowerCase().charCodeAt(0), 2, ch); },
    stage() { return (game as any).stage?.constructor?.name ?? '?'; },
    now() { return t; },
    save(name) { save(name, (game.window.canvas as any).toBuffer('image/png')); },
  };
  return dev;
}
