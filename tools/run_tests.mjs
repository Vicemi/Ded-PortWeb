// npm test: runs the headless scenarios (no browser needed) and fails if any of them throws.
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const scenarios = ['newgame', 'hub', 'phase2', 'racer', 'endgame', 'monkey'];
let failed = 0;
for (const s of scenarios) {
  const r = spawnSync(process.execPath, [path.join(root, 'tools', 'headless.mjs'), path.join(root, 'tools', 'scenarios', s + '.mjs'), path.join(root, 'research', 'shots')],
    { encoding: 'utf8', env: { ...process.env, STEPS: '150' }, timeout: 600000 });
  const out = (r.stdout || '') + (r.stderr || '');
  const ok = r.status === 0 && !/SCENARIO ERROR/.test(out);
  console.log((ok ? 'ok   ' : 'FAIL ') + s);
  if (!ok) { failed++; console.log(out.split('\n').slice(-15).join('\n')); }
}
process.exit(failed ? 1 : 0);
