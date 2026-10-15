// Not part of npm test. node tools/headless.mjs tools/scenarios/bench.mjs : ms per tick (logic + render) of the main screens.
import { toMenu, newGame } from './lib.mjs';
const now = () => Number(process.hrtime.bigint()) / 1e6;
function measure(dev, label, frames = 200, setup) {
  dev.go(5);
  if (setup) setup();
  const t0 = now();
  dev.go(frames);
  const ms = (now() - t0) / frames;
  console.log(`BENCH ${label.padEnd(28)} ${ms.toFixed(2)} ms/tick  (${dev.stage()})`);
}
export default async (dev) => {
  measure(dev, 'logo/intro', 100);
  for (let i = 0; i < 7; i++) dev.key(dev.K.ESCAPE, 120);
  dev.go(300);
  measure(dev, 'main menu idle');
  dev.move(300, 330, 3);
  measure(dev, 'main menu hover');
  newGame(dev);
  measure(dev, 'case report');
  dev.click(300, 418, 200);
  dev.go(700);
  dev.click(300, 400, 100);
  dev.go(200);
  measure(dev, 'phase0 hub idle');
  dev.move(150, 200, 3);
  measure(dev, 'phase0 hub mouse moving', 100, () => {});
  const P0 = dev.mod('game/stages/phase0').Phase0Stage;
  dev.game.set_stage(new P0(dev.game, 2), true, 'p0_loading_slides_001.jpg');
  dev.go(800);
  dev.click(300, 400, 100);
  dev.go(300);
  measure(dev, 'phase2 room idle');
  const st = dev.game.stage.phase;
  const mx = 470, my = 335;
  dev.move(mx, my, 6); dev.down(mx, my); dev.up(mx, my); dev.go(6);
  let k = 0;
  measure(dev, 'phase2 magnifier moving', 200, () => {});
  for (let i = 0; i < 100; i++) { dev.move(300 + Math.round(120 * Math.cos(i / 8)), 250 + Math.round(80 * Math.sin(i / 8)), 1); }
  const t0 = now();
  for (let i = 0; i < 200; i++) { dev.move(300 + Math.round(120 * Math.cos(i / 8)), 250 + Math.round(80 * Math.sin(i / 8)), 1); }
  console.log(`BENCH ${'phase2 magnifier circling'.padEnd(28)} ${((now() - t0) / 200).toFixed(2)} ms/tick`);
  dev.click(mx + 120, my + 60, 10);
  dev.game.set_stage(new P0(dev.game, 3), true, 'p0_loading_slides_001.jpg');
  dev.go(500);
  dev.click(300, 400, 80);
  dev.go(60);
  dev.hold(dev.K.UP, true);
  measure(dev, 'racer (UP held)', 300);
};
