// the medals screen with every department medal earned (looks at the flag ribbons)
import { toHub } from './lib.mjs';
export default async (dev) => {
  toHub(dev);
  const dm = dev.mod('game/data/datamodel');
  const names = ['artigas', 'canelones', 'cerrolargo', 'colonia', 'durazno', 'flores', 'florida', 'lavalleja', 'maldonado', 'montevideo', 'paysandu', 'rionegro', 'rivera', 'rocha', 'salto', 'sanjose', 'soriano', 'tacuarembo', 'treintaytres'];
  const prog = dev.game.datastore.user_character_progress;
  prog.medals = names.map((n, i) => new dm.Medal(n, 1 + (i % 3))).concat([new dm.Medal('uy', 2)]);
  const M = dev.mod('game/stages/merits').Merits;
  const m = new M(dev.game.stage);
  m.show_merits();
  dev.go(120);
  dev.click(90, 345, 60);
  dev.save('m1_main');
  dev.go(60);
  dev.save('m2');
  dev.click(117, 150, 60);
  dev.go(80);
  dev.save('m3_popup');
  dev.click(300, 380, 40);

};
