// Audit of the notes (rivers, lagoons, hills, history facts, localities, writers): prints every note with the department(s) it points to and its text.
// Fails when the text names a department that the note does not list (or lists none), or when a case can be ambiguous (see the checks below).
// Run alone with NOTES_DUMP=1 to print the full table: NOTES_DUMP=1 node tools/headless.mjs tools/scenarios/notes_audit.mjs research/shots
import { newGame } from './lib.mjs';

const strip = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default async (dev) => {
  newGame(dev);
  const ds = dev.game.datastore;
  const deps = ds.list_departments;
  const all = [...ds.list_rivers, ...ds.list_lagoons, ...ds.list_hills, ...ds.list_history_facts, ...ds.list_locations, ...ds.list_writers];
  const text = (n) => [n.description, n.description1, n.description2].filter(Boolean).join(' ');
  const problems = [];
  for (const n of all) {
    const own = n.get_departments();
    const names = own.map((d) => d.name);
    const t = strip(text(n));
    if (process.env.NOTES_DUMP) console.log(`${n.type.padEnd(12)} ${n.get_full_name().padEnd(34)} -> ${names.join(' + ').padEnd(30)} | ${text(n)}`);
    if (!own.length || own.some((d) => !deps.includes(d))) problems.push(`${n.type} ${n.name}: no valid department`);
    // the text names a department that the note does not list: the text and the data disagree
    for (const d of deps) {
      const re = new RegExp(`(departamento de|departamentos de|en el departamento)\\s+${strip(d.name)}\\b`);
      if (re.test(t) && !names.some((x) => strip(x) === strip(d.name))) problems.push(`${n.type} ${n.name} [${names.join(', ')}]: text says "${d.name}"`);
    }
    // a single-department note must have its department in the text when the text names any department
    if (n.name === 'Pablo Atchugarry') continue;   // born in Montevideo (checked); the text mentions his Maldonado museum
    const named = deps.filter((d) => t.includes(strip(d.name)));
    if (named.length && !named.some((d) => own.includes(d))) problems.push(`${n.type} ${n.name} [${names.join(', ')}]: text names only ${named.map((d) => d.name).join(', ')}`);
  }
  console.log('notes checked:', all.length);
  if (problems.length) { console.log(problems.join('\n')); if (!process.env.NOTES_DUMP) throw new Error('note data problems: ' + problems.length); }
};
