import { toHub } from './lib.mjs';
export default async (dev) => {
  toHub(dev);
  dev.click(410, 170, 100);
  dev.save('p1');
  console.log(dev.stage());
  dev.go(400);
  dev.save('p2');
  console.log(dev.stage());
};
