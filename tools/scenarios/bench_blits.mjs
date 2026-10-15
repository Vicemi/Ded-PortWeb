// Not part of npm test: where does a phase 2 frame spend its drawImage time (by source size)?
import { newGame } from './lib.mjs';
const hr = () => Number(process.hrtime.bigint()) / 1e6;
export default async (dev) => {
  newGame(dev);
  const P0 = dev.mod('game/stages/phase0').Phase0Stage;
  dev.game.set_stage(new P0(dev.game, 2), true, 'p0_loading_slides_001.jpg');
  dev.go(800); dev.click(300, 400, 100); dev.go(300);
  const win = dev.game.window;
  const S = win.constructor.prototype;
  const ob = S.blit, of = S.fill; const agg = {};
  const add = (k, t) => { const a = agg[k] || (agg[k] = [0, 0]); a[0]++; a[1] += t; };
  S.blit = function (src, dest, area) {
    const sc = src.canvas || src; const t = hr(); const r = ob.call(this, src, dest, area); 
    add((this === win ? 'WIN ' : (this.canvas.width + 'x' + this.canvas.height + ' ')) + (sc.width * sc.height > 100000 ? 'big' : 'small'), hr() - t); return r;
  };
  S.fill = function (...a) { const t = hr(); const r = of.apply(this, a); add('fill ' + this.canvas.width + 'x' + this.canvas.height, hr() - t); return r; };
  const t0 = hr(); dev.go(50); const tot = (hr() - t0) / 50;
  console.log('frame ms', tot.toFixed(2));
  for (const [k, [n, t]] of Object.entries(agg).sort((a, b) => b[1][1] - a[1][1])) console.log((t / 50).toFixed(2).padStart(7), 'ms', (n / 50).toFixed(1).padStart(6), 'calls', k);
};
