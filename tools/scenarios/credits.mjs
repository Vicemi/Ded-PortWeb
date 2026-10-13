// the credits of the menu: the first page is the one of the updated edition
import { toMenu } from './lib.mjs';
export default async (dev) => {
  toMenu(dev);
  dev.click(300, 410, 60);       // Créditos
  dev.go(500);
  dev.save('cr1');
  dev.click(380, 410, 40);       // next
  dev.go(500);
  dev.save('cr2');
};
