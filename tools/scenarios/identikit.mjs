// the suspects grid with the new thieves
import { toHub } from './lib.mjs';
export default async (dev) => {
  toHub(dev);
  const ds = dev.game.datastore, c = ds.user_character_progress.case;
  const males = ds.list_thieves.filter((t) => t.sex === 1);
  c.list_thieves = males.slice(-8).concat(ds.list_thieves.filter((t) => t.sex === 2).slice(-1));
  c.thief = males[males.length - 1];
  dev.click(470, 405, 80);     // case button
  dev.save('i1');
  dev.go(100);
  dev.click(572, 195, 80); dev.save('i2');
  
};
