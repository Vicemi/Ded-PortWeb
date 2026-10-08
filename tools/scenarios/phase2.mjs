import { newGame } from './lib.mjs';
export default async (dev) => {
  newGame(dev);
  const P0 = dev.mod('game/stages/phase0').Phase0Stage;
  dev.game.set_stage(new P0(dev.game, 2), true, 'p0_loading_slides_001.jpg');
  dev.go(800);
  dev.click(300, 400, 100);
  dev.go(300);
  dev.save('ph2_a');
  dev.click(300, 400, 100);
  dev.go(200);
  dev.save('ph2_b');
  console.log(dev.stage());
};
