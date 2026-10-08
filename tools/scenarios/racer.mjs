import { newGame } from './lib.mjs';
export default async (dev) => {
  newGame(dev);
  const P0 = dev.mod('game/stages/phase0').Phase0Stage;
  dev.game.set_stage(new P0(dev.game, 3), true, 'p0_loading_slides_001.jpg');
  dev.go(500);
  dev.click(300, 400, 80);   // close the help
  dev.go(60);
  const UP = dev.K.UP, LEFT = dev.K.LEFT, RIGHT = dev.K.RIGHT;
  dev.hold(UP, true);
  const t0 = Date.now();
  for (let i = 0; i < 6; i++) { dev.go(60); dev.save('d' + i); }
  console.log('ms per frame', ((Date.now() - t0) / 360).toFixed(1));
  dev.hold(RIGHT, true); dev.go(15); dev.hold(RIGHT, false); dev.go(60); dev.save('d6');
  dev.hold(LEFT, true); dev.go(25); dev.hold(LEFT, false); dev.go(100); dev.save('d7');
  dev.go(400); dev.save('d8');
  console.log(dev.stage());
};
