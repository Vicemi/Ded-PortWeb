// node tools/digest_check.mjs <scenario> ... : runs each scenario with and without the frame cache and compares the pixels of every tick.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
let bad = 0;
for (const s of process.argv.slice(2)) {
  const [name, envs] = s.split('@');
  const extra = envs ? Object.fromEntries([envs.split('=')]) : {};
  const out = [0, 1].map((nocache) => {
    const f = path.join(os.tmpdir(), `ded-digest-${process.pid}-${nocache}.txt`);
    const env = { ...process.env, STEPS: '150', ...extra, DIGEST: f, ...(nocache ? { DED_NOCACHE: '1' } : {}) };
    const r = spawnSync(process.execPath, [path.join(root, 'tools', 'headless.mjs'), path.join(root, 'tools', 'scenarios', name + '.mjs'), path.join(root, 'research', 'shots')], { encoding: 'utf8', env, timeout: 900000 });
    if (r.status !== 0 || /SCENARIO ERROR/.test(r.stdout + r.stderr)) console.log((r.stdout + r.stderr).split('\n').slice(-8).join('\n'));
    return fs.readFileSync(f, 'utf8').split('\n');
  });
  const n = Math.min(out[0].length, out[1].length);
  let first = -1, diff = 0;
  for (let i = 0; i < n; i++) if (out[0][i] !== out[1][i]) { diff++; if (first < 0) first = i; }
  console.log(`${diff || out[0].length !== out[1].length ? 'DIFF' : 'same'} ${s}: ${n} ticks, ${diff} different${first >= 0 ? ', first at tick ' + first : ''}`);
  if (diff || out[0].length !== out[1].length) bad++;
}
process.exit(bad ? 1 : 0);
