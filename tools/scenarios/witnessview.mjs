// the statement of a witness with the rumor of a thief (does it fit the box?)
import { toHub } from './lib.mjs';
export default async (dev) => {
  toHub(dev);
  const ds = dev.game.datastore;
  const ser = dev.mod('game/data/serialization'), dm = dev.mod('game/data/datamodel');
  const g = new ser.CaseGenerator(ds);
  const W = dev.mod('game/stages/witness').Witness;
  const stage = dev.game.stage;
  const thief = ds.list_thieves.find((t) => t.rumors);
  if (!thief) { console.log('no thief with rumors yet (their art is pending)'); return; }
  const ws = g.generate_witness_statements(thief, ds);
  const w = new dm.Witness('Jardinero', 'p1_witness_gardener.png');
  w.witness_statement = ws[2]; w.city = { name: 'Melo' }; w.department = { name: 'Cerro Largo' };
  const dlg = new W(stage);
  dlg.show_witness(w);
  dev.go(120);
  dev.save('w1');
};
