// Not part of npm test: phase 2 room only. PROF=1 writes research/prof/p2.cpuprofile for just the measured frames.
import { newGame } from './lib.mjs';
import inspector from 'node:inspector';
import fs from 'node:fs';
export default async (dev) => {
  newGame(dev);
  const P0 = dev.mod('game/stages/phase0').Phase0Stage;
  dev.game.set_stage(new P0(dev.game, 2), true, 'p0_loading_slides_001.jpg');
  dev.go(800); dev.click(300, 400, 100); dev.go(300);
  const N = Number(process.env.N || 400);
  let s = null;
  if (process.env.PROF) { s = new inspector.Session(); s.connect(); s.post('Profiler.enable'); s.post('Profiler.start'); }
  const t0 = Number(process.hrtime.bigint()) / 1e6;
  dev.go(N);
  console.log('BENCH p2 idle ms/tick', ((Number(process.hrtime.bigint()) / 1e6 - t0) / N).toFixed(2));
  if (s) s.post('Profiler.stop', (e, { profile }) => { fs.mkdirSync('research/prof', { recursive: true }); fs.writeFileSync('research/prof/p2.cpuprofile', JSON.stringify(profile)); });
};
