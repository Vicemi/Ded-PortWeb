// "Incriminado": the odd objects seen are remembered (and saved), and the lab report has a REPASAR PISTAS panel that lists clues, odd objects, witnesses and the framed one, then returns to the choice
import { toHub } from './lib.mjs';
export default async (dev) => {
  toHub(dev);
  dev.game.set_development_mode(true);
  const ds = dev.game.datastore, prog = ds.user_character_progress, c = prog.case;
  const tw = dev.twist;
  c.twist_real = c.list_thieves.find((t) => t !== c.thief); c.twist_state = 1; c.twist_hint = false; c.twist_seen = [];
  const real = c.twist_real;
  tw.hintFor('i623', c); tw.hintFor('i601', c); tw.hintFor('i623', c);
  if (c.twist_seen.length !== 2 || c.twist_seen[0].name !== real.name) throw new Error('odd objects not remembered once each: ' + JSON.stringify(c.twist_seen));
  // saves: new columns round-trip, and a save of the old format (4 columns) still loads
  ds.save_character('p1', false);
  dev.py.forgetMemoryFiles(); ds.load_characters(); ds.load_character(ds.characters.find((x) => x.active) || ds.characters[0]);
  const c2 = ds.user_character_progress.case;
  if (c2.twist_seen.length !== 2 || c2.twist_seen[1].id !== 'i601' || c2.twist_seen[1].name !== real.name) throw new Error('twist_seen lost in the save: ' + JSON.stringify(c2.twist_seen));
  // the case after the load is the one to play
  const cc = ds.user_character_progress.case, framed = cc.thief;
  cc.list_witnesses.slice(0, 2).forEach((w, i) => { w.witness_statement = cc.list_witness_statements[i]; if (!cc.list_visited_witnesses.includes(w)) cc.list_visited_witnesses.push(w); });
  dev.key('a'.charCodeAt(0), 100, 'A', 1);
  dev.go(300);
  for (let i = 0; i < 12; i++) { dev.click(303, 326, 150); dev.go(250); if (dev.game.stage.dialogs && dev.game.stage.dialogs.length > 1 && i > 1) break; }
  dev.save('twr_report');
  dev.click(418, 362, 60);
  dev.save('twr_p1');
  const pages = tw.reviewPages(cc, framed);
  console.log('review pages:', pages.map((p) => p[0] + ' (' + p[1].length + ')').join(' | '));
  console.log(JSON.stringify(pages[2][1]).slice(0, 300));
  for (const p of pages) if (/undefined|null|&#|\[object/.test(p[1])) throw new Error('bad review text ' + p[0] + ': ' + p[1]);
  for (let i = 1; i < pages.length; i++) { dev.click(445, 362, 40); dev.save('twr_p' + (i + 1)); }
  dev.click(310, 362, 60);   // VOLVER
  dev.save('twr_back');
  if (cc.twist_state !== 1) throw new Error('the review changed the case');
  const cands = cc.list_thieves.filter((t) => t !== framed), k = cands.indexOf(cc.twist_real);
  dev.click(116 + (k % 4) * 92 + 35, 204 + Math.floor(k / 4) * 74 + 28, 100);
  dev.go(300);
  if (cc.twist_state !== 2) throw new Error('could not choose after the review');
};
