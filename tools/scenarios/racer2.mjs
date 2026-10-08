import { newGame } from './lib.mjs';
export default async (dev) => {
  newGame(dev);
  const P0 = dev.mod('game/stages/phase0').Phase0Stage;
  dev.game.set_stage(new P0(dev.game, 3), true, 'p0_loading_slides_001.jpg');
  dev.go(500);
  dev.click(300, 400, 80);
  dev.go(5);
  dev.hold(dev.K.UP, true);
  const RS = Object.getPrototypeOf(dev.game.stage);
  for (const n of ['hardCrash', 'lightCrash']) { const f = RS[n]; RS[n] = function (...a) { console.log(n, 's', this.s.toFixed(0), 'x', this.x.toFixed(1), 'v', this.v.toFixed(0), 'traffic', this.traffic.filter((t) => Math.abs(t.s - this.s) < 12).map((t) => [(t.s - this.s).toFixed(1), t.x.toFixed(1), t.v.toFixed(0)].join('/')).join(' '), 'objs', this.track.objectsIn(this.s - 1, this.s + 4).filter((o) => o.body).map((o) => [o.texture, o.x, o.body.x0.toFixed(1), o.body.x1.toFixed(1)].join('/')).join(' ')); return f.apply(this, a); }; }
  const K = dev.K;
  for (let i = 0; i < 70; i++) {
    for (let j = 0; j < 8; j++) {
      const st = dev.game.stage;
      if (!st || st.phase === undefined) break;
      const err = st.x - 0;
      dev.hold(K.LEFT, err > 0.8); dev.hold(K.RIGHT, err < -0.8);
      dev.go(5);
    }
    const st = dev.game.stage;
    if (dev.stage() !== 'RacerStage') break;
    console.log(i * 40, st.phase, 'v', st.v.toFixed(0), 'dist', st.distance.toFixed(0), 'x', st.x.toFixed(1), 'thiefx', st.thief.x.toFixed(1), 'time', (st.timeLeft / 1000).toFixed(0));
    if (i % 4 === 0 || st.phase !== 'run') dev.save('g' + Math.floor(i / 4));
    if (st.phase === 'won') { dev.go(60); dev.save('gwon'); }
  }
  console.log(dev.stage());
};
