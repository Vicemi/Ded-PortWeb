import { newGame } from './lib.mjs';
export default async (dev) => {
  Date.now = () => 123456789;
  newGame(dev);
  const P0 = dev.mod('game/stages/phase0').Phase0Stage;
  dev.game.set_stage(new P0(dev.game, 3), true, 'p0_loading_slides_001.jpg');
  dev.go(500);
  dev.click(300, 400, 80);
  dev.go(5);
  const st = dev.game.stage; st.moveTraffic = () => { st.traffic = []; };
  dev.hold(dev.K.UP, true);
  dev.go(200);
  st.thief.s = st.s + 110; st.thief.x = 3.5; st.thief.targetX = 3.5; st.v = 120; st.thief.v = 100;
  for (let i = 0; i < 90; i++) {
    const err = st.x + 3.2;
    dev.hold(dev.K.LEFT, err > 0.8); dev.hold(dev.K.RIGHT, err < -0.8);
    dev.go(8);
    console.log(i * 8, st.phase, 'ths', (st.thief.s-st.s).toFixed(1), 'v', st.v.toFixed(0), 'dist', st.distance.toFixed(1), 'x', st.x.toFixed(1), 'tx', st.thief.x.toFixed(1));
    if (i % 3 === 0 || st.phase !== 'run') dev.save('h' + String(i).padStart(2, '0'));
    if (dev.stage() !== "RacerStage" || st.phase === "won") break;
  }
  dev.hold(dev.K.UP, false); dev.hold(dev.K.LEFT, false); dev.hold(dev.K.RIGHT, false);
  dev.go(250);
  console.log('after win:', dev.stage());
  dev.go(400); dev.save('after1');
  console.log('later:', dev.stage(), dev.game.stage.phase_number);
  dev.go(400); dev.save('after2');
};
