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
  if (process.env.ACH_ALL) { prog.resolved_cases = 60; prog.score = 30000; prog.captured_thieves = ds.list_thieves.slice(); prog.medals = ds.list_departments.map((d) => new dm.Medal(d.image, 3)).concat([new dm.Medal('uy', 1)]); }
  const news = ex.grantAchievements(prog, ds);
  if (news.length < 5) throw new Error('few achievements: ' + news);
  if (ex.grantAchievements(prog, ds).length) throw new Error('granted twice');
  if (!prog.medals.some((m) => m.name === 'ach_victor')) throw new Error('victor not granted');
  // the medals of the clue objects come from the clues found in the solved case (and never from the panel)
  prog.case.clues_found = ['i601', 'i623', 'i620'];
  if (ex.grantAchievements(prog, ds).some((t) => /Cebador|Contraseña|Tecnología/.test(t))) throw new Error('object medals given without a solved case');
  const objs = ex.grantAchievements(prog, ds, prog.case);
  if (objs.length !== 4 || !prog.medals.some((m) => m.name === 'ach_xo')) throw new Error('object medals: ' + objs);
  if (process.env.ACH_ALL) prog.case.clues_found = ['i603', 'i609', 'i605', 'i614'], ex.grantAchievements(prog, ds, prog.case);
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
