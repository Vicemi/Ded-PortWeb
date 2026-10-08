import { toMenu } from './lib.mjs';
import fs from 'node:fs';
export default async (dev) => {
  globalThis.__imgLog = [];
  toMenu(dev);
  dev.click(300, 330, 150); dev.type('Ana'); dev.go(20); dev.click(340, 138, 40); dev.click(300, 139, 60); dev.click(248, 384, 150); dev.go(300);
  console.log('stage', dev.stage());
  fs.writeFileSync('research/bootimgs.json', JSON.stringify([...new Set(globalThis.__imgLog)]));
  console.log([...new Set(globalThis.__imgLog)].length);
};
