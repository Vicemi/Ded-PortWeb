// the investigation with a new kind of witness: its minigame starts from the map, is solved and the statement of the witness is given
import { newGame } from './lib.mjs';
export default async (dev) => {
  newGame(dev);
  const P0 = dev.mod('game/stages/phase0').Phase0Stage;
  { const c = dev.game.datastore.user_character_progress.case; c.last_department_visited = c.last_department_lair; }
  dev.game.set_stage(new P0(dev.game, 1), true, 'p0_loading_slides_001.jpg');
  dev.go(800); dev.click(300, 400, 100); dev.go(600); dev.click(300, 400, 100); dev.go(600); dev.go(400); dev.save('wn_0');
  const st = dev.game.stage, ph = st.phase;
  const ds = dev.game.datastore;
  if (!ds.list_witnesses.some((w) => w.name === 'Maestra')) { console.log('new witnesses not available (art pending)'); return; }
  console.log('witness kinds:', ds.list_witnesses.map((w) => w.name).join(', '));
  console.log(Object.keys(ph).filter((k) => /pin/.test(k)).join(',')); const pin = (ph.active_pins && ph.active_pins[0]) || (ph.pins && ph.pins[0]);
  pin.witness.name = 'Maestra'; pin.witness.image = 'p1_witness_maestra.png';
  const before = ph.minigames_resolved;
  ph.witness_pin = pin;
  ph.start_minigame('Maestra', pin);
  dev.go(200); dev.save('wn_open');
  dev.click(278, 305, 120); dev.click(274, 255, 120); dev.click(274, 255, 120); dev.click(312, 388, 150);
  const m = st.constructor.name;   // (the minigame object is not reachable from here: solve by playing the cards)
  console.log('stage', m);
};
