// npm test: runs the headless scenarios (no browser needed) and fails if any of them throws.
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const scenarios = ['reload', 'magnifier', 'thieves', 'witnessview', 'newgame', 'newgame', 'newgame', 'newgame', 'newgame', 'newgame', 'newgame', 'newgame', 'hub', 'phase2', 'witness_new', 'logros', 'credits', 'newgames@NG=flags', 'newgames@NG=candombe', 'newgames@NG=trivia', 'racer', 'racer4', 'racer4', 'endgame', 'monkey'];  // newgame is repeated: every run generates a random case
let failed = 0;
for (const entry of scenarios) {
  const [s, envs] = entry.split('@');           // 'name@VAR=value': the scenario with an environment variable
  const extra = envs ? Object.fromEntries([envs.split('=')]) : {};
  const r = spawnSync(process.execPath, [path.join(root, 'tools', 'headless.mjs'), path.join(root, 'tools', 'scenarios', s + '.mjs'), path.join(root, 'research', 'shots')],
    { encoding: 'utf8', env: { ...process.env, STEPS: '150', ...extra }, timeout: 600000 });
  const out = (r.stdout || '') + (r.stderr || '');
  const ok = r.status === 0 && !/SCENARIO ERROR/.test(out);
  console.log((ok ? 'ok   ' : 'FAIL ') + entry);
  if (!ok) { failed++; console.log(out.split('\n').slice(-15).join('\n')); }
}
process.exit(failed ? 1 : 0);
