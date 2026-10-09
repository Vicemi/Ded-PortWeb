// the new thieves with rumors give them in the first words of the witnesses
import { newGame } from './lib.mjs';
export default async (dev) => {
  newGame(dev);
  const ds = dev.game.datastore;
  const ser = dev.mod('game/data/serialization');
  const gen = 'CaseGenerator';
  console.log('thieves', ds.list_thieves.length, ds.list_thieves.filter((t) => t.rumors).map((t) => t.name).join(', '));
  const g = new ser.CaseGenerator(ds);
  for (const t of ds.list_thieves.filter((t) => t.rumors)) {
    const ws = g.generate_witness_statements(t, ds);
    console.log(t.name, '->', ws.map((w) => JSON.stringify(w.intro_statement.text)).join(' | '));
    for (const w of ws) if (ds.list_statements.indexOf(w.intro_statement) < 0) throw new Error('statement not registered');
  }
};
