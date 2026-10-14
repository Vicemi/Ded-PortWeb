// builds the rooms of phase 2 a few times and counts the objects of the updated edition that were hidden
import { newGame } from './lib.mjs';
export default async (dev) => {
  newGame(dev);
  const P0 = dev.mod('game/stages/phase0').Phase0Stage;
  dev.game.set_stage(new P0(dev.game, 2), true, 'p0_loading_slides_001.jpg');
  dev.go(800);
  const st = dev.game.stage.phase;
  const types = {};
  for (let i = 0; i < 6; i++) {
    st.stage.game.datastore.user_character_progress.case.thief_lair_set[1] = null;
    st.build_stage();
    for (const it of st.small_items_layer.items) { const t = it.get_type && it.get_type(); if (t) types[t] = (types[t] || 0) + 1; }
  }
  const nw = Object.entries(types).filter(([t]) => /^i6\d\d$/.test(t));
  console.log('new object types hidden:', nw.length, JSON.stringify(nw));
  if (nw.length < 5) throw new Error('the new objects do not appear');
  dev.click(300, 398, 60); dev.go(120); dev.save('lupa_obj');
};
