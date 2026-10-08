import { toHub } from './lib.mjs';
export default async (dev) => {
  toHub(dev);
  dev.save('h1');
  console.log(dev.stage());
};
