// phase 2: the magnifying glass is picked with a click, follows the mouse and is dropped with another click (a press-and-hold drag works too)
import { newGame } from './lib.mjs';
export default async (dev) => {
  newGame(dev);
  const P0 = dev.mod('game/stages/phase0').Phase0Stage;
  dev.game.set_stage(new P0(dev.game, 2), true, 'p0_loading_slides_001.jpg');
  dev.go(800);
  dev.click(300, 400, 100);
  dev.go(300);
  console.log(dev.stage());
  const st = dev.game.stage.phase;
  console.log('magnifier at', st.magnifier && st.magnifier.get_left(), st.magnifier && st.magnifier.get_top(), 'taken', st.magnifier_taken);
  const mx = Number(process.env.MX || 470), my = Number(process.env.MY || 335);
  dev.move(mx, my, 6);
  dev.down(mx, my); dev.go(2); dev.up(mx, my); dev.go(6);
  console.log('after click: taken', st.magnifier_taken);
  if (!st.magnifier_taken) throw new Error('the magnifying glass cannot be picked');
  dev.move(mx + 60, my + 40, 6); dev.move(mx + 120, my + 60, 6);
  dev.save('mag1');
  dev.click(mx + 120, my + 60, 10);
  console.log('after second click: taken', st.magnifier_taken);
  if (st.magnifier_taken) throw new Error('the magnifying glass cannot be dropped');
  // drag: press, move, release elsewhere
  dev.move(mx, my, 6); dev.down(mx, my); dev.go(2); dev.move(mx + 80, my + 50, 4); dev.up(mx + 80, my + 50); dev.go(6);
  console.log('after drag: taken', st.magnifier_taken, 'at', st.magnifier.get_left(), st.magnifier.get_top());
};
