// the arrest: the player is put close behind the thief and the pictures of the overtaking / maneuver are saved
import { newGame } from './lib.mjs';
export default async (dev) => {
  newGame(dev);
  const P0 = dev.mod('game/stages/phase0').Phase0Stage;
  dev.game.set_stage(new P0(dev.game, 3), true, 'p0_loading_slides_001.jpg');
  dev.go(500);
  dev.click(300, 400, 80);
  dev.go(5);
  const st = dev.game.stage;
  st.traffic = []; st.moveTraffic = function () {};
  st.v = 150; st.x = -st.thief.x; st.s = st.thief.s - 40; st.thief.v = 120; st.thief.targetX = st.thief.x;
  st.data.thief.speed = 120;
  dev.hold(dev.K.UP, true);
  let n = 0;
  for (let i = 0; i < 400 && dev.stage() === 'RacerStage'; i++) {
    dev.go(3);
    const gap = st.thief.s - st.s;
    if (i % 6 === 0 && st.phase === 'run' && gap < 30) dev.save('c' + String(n++).padStart(2, '0') + '_run');
    if (st.phase !== 'run') {
      if (i % 3 === 0 && n < 40) dev.save('c' + String(n++).padStart(2, '0') + '_' + st.phase);
      if (st.phase === 'won') { dev.go(30); dev.save('c_won'); break; }
    }
  }
  console.log('phase', st.phase, 'frames', n);
};
