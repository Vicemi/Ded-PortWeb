import { toHub } from './lib.mjs';
export default async (dev) => {
  toHub(dev);
  dev.game.set_development_mode(true);
  const SHIFT = 1;
  dev.key('a'.charCodeAt(0), 100, 'A', SHIFT);   // Shift+A: arrest the thief with the clues and open the end screen
  dev.go(300);
  dev.save('e1');
  console.log(dev.stage());
  for (let i = 0; i < 12; i++) { dev.click(303, 326, 150); dev.go(250); dev.save('e' + (i + 2)); console.log(i, dev.stage()); }
};
