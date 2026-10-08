import { newGame } from './lib.mjs';
export default async (dev) => {
  newGame(dev);
  const prel = await import('../../src/runtime/prelude.ts').catch(() => null);
  const m = dev.mod('game/stages/phase2');
  const C = m.Phase2Content.prototype;
  const o = C.build_stage;
  const P0 = dev.mod('game/stages/phase0').Phase0Stage;
  const stage = new P0(dev.game, 2);
  const SI = Object.getPrototypeOf(Object.getPrototypeOf(stage));  // StageIso.prototype
  for (const n of ['load_place_holders', 'load_level', 'set_items']) { const f = SI[n]; SI[n] = function (...a) { const r = f.apply(this, a); console.log(n, a.length, Array.isArray(r) ? r.length : '', n === 'load_place_holders' ? a[1].length : ''); if (n === 'set_items') console.log('defs', Object.keys(this.item_definitions).length, JSON.stringify(Object.values(this.item_definitions).slice(0,2))); return r; }; }
  dev.game.set_stage(stage, true, 'p0_loading_slides_001.jpg');
  dev.go(100);
};
