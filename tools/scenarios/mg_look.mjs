// opens a minigame directly (to look at it): MG=bricklayer|gardener|shoptender|librarian
import { newGame } from './lib.mjs';
export default async (dev) => {
  newGame(dev);
  const P0 = dev.mod('game/stages/phase0').Phase0Stage;
  dev.game.set_stage(new P0(dev.game, 1), true, 'p0_loading_slides_001.jpg');
  dev.go(800); dev.click(300, 400, 100); dev.go(300);
  const name = process.env.MG || 'bricklayer';
  const cls = { bricklayer: 'MinigameBricklayer', gardener: 'MinigameGardener', shoptender: 'MinigameShoptender', librarian: 'MinigameLibrarian' }[name];
  const M = dev.mod('game/stages/minigame' + name)[cls];
  const dm = dev.mod('game/data/datamodel');
  const st = dev.game.stage;
  const w = new dm.Witness('X', 'p1_witness_' + name + '.png'); w.city = { name: 'Melo' }; w.department = { name: 'Cerro Largo' };
  w.witness_statement = dev.game.datastore.user_character_progress.case.list_witness_statements[0];
  const m = new M(st, st.phase, w);
  m.show_opening_dialog(); dev.go(150); dev.save('mg_open');
  dev.click(278, 305, 120); dev.save('mg_2');
  dev.click(274, 255, 120); dev.save('mg_30');
  dev.click(274, 255, 120); dev.save('mg_31');
  dev.click(312, 388, 150); dev.save('mg_play');
  dev.go(60); dev.save('mg_play2');
  console.log(dev.stage());
};
