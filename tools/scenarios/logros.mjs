// the achievements: granted from the progress, saved as 'ach_' medals, shown in their panel from the medals screen
import { toHub } from './lib.mjs';
export default async (dev) => {
  toHub(dev);
  const dm = dev.mod('game/data/datamodel');
  const ex = dev.achievements;
  const ds = dev.game.datastore, prog = ds.user_character_progress;
  prog.medals = [new dm.Medal('artigas', 1), new dm.Medal('salto', 3)];
  prog.resolved_cases = 6; prog.score = 6000;
  prog.captured_thieves = ds.list_thieves.filter((t) => ['Víctor Pintos', 'Aaron Silva', 'Rita Platillo'].includes(t.name));
  const news = ex.grantAchievements(prog, ds);
  if (news.length < 5) throw new Error('few achievements: ' + news);
  if (ex.grantAchievements(prog, ds).length) throw new Error('granted twice');
  if (!prog.medals.some((m) => m.name === 'ach_victor')) throw new Error('victor not granted');
  const M = dev.mod('game/stages/merits').Merits;
  const m = new M(dev.game.stage);
  m.show_merits();
  dev.go(120);
  dev.click(90, 345, 60);          // medals
  dev.go(60);
  dev.save('lg1_medals');
  dev.click(120, 408, 60);         // LOGROS
  dev.go(80);
  dev.mouse && dev.mouse(60, 100);
  dev.save('lg2_panel');
  dev.click(300, 420, 40);
  dev.go(60);
  console.log('achievements', news.length);
};
