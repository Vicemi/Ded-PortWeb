import { toHub } from './lib.mjs';
export default async (dev) => {
  toHub(dev);
  dev.game.set_development_mode(true);
  dev.key('a'.charCodeAt(0), 100, 'A', 1);
  dev.go(300);
  for (let i = 0; i < 4; i++) { dev.click(303, 326, 150); dev.go(250); }
  dev.save('f0');
  for (let i = 0; i < 8; i++) { dev.click(300, 416, 200); dev.go(500); dev.save('f' + (i + 1)); console.log(i, dev.stage()); }
};
