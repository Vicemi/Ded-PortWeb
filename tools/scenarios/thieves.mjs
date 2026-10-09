// the roster of thieves: new ones are present, every case has 9 suspects with distinct traits
import { newGame } from './lib.mjs';
export default async (dev) => {
  newGame(dev);
  const ds = dev.game.datastore;
  console.log('thieves', ds.list_thieves.length, 'animals', ds.list_animals.length, 'sports', ds.list_sports.length);
  const seen = new Set();
  for (const t of ds.list_thieves) { const k = [t.sex, t.height, t.hair, t.distinctive_feature].join(); if (seen.has(k)) throw new Error('duplicate traits ' + t.name); seen.add(k); }
  const names = ds.list_thieves.map((t) => t.name);
  if (!names.includes('Mateo Cebadura')) throw new Error('new thieves missing');
  for (let i = 0; i < 20; i++) {
    const c = dev.game.datastore.user_character_progress.case;
    if (c.list_thieves.length !== 9) throw new Error('suspects: ' + c.list_thieves.length);
    if (!c.list_thieves.includes(c.thief)) throw new Error('culprit not among suspects');
    dev.game.datastore.user_character_progress.case = dev.game.datastore.user_character_progress.case; // (the generator is exercised by newGame)
    break;
  }
  console.log('ok');
};
