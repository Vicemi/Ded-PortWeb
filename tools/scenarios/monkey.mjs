// A "smart monkey": plays a new game by clicking random clickable items (items with a CLICK handler under the mouse), looking for exceptions.
// node tools/headless.mjs tools/scenarios/monkey.mjs [outdir]  (env: STEPS=400 SEED=1)
import { newGame } from './lib.mjs';

function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

export default async (dev) => {
  const steps = Number(process.env.STEPS || 400);
  const rand = rng(Number(process.env.SEED || 1));
  const errors = new Map();
  const log = [];
  const guard = (what, fn) => {
    try { fn(); } catch (e) {
      const key = String(e && e.message).slice(0, 120) + ' @ ' + String(e.stack || '').split('\n').slice(1, 3).join(' | ').slice(0, 200);
      if (!errors.has(key)) { errors.set(key, { count: 0, what, stage: dev.stage() }); try { dev.save('err_' + errors.size); } catch { /* none */ } }
      errors.get(key).count++;
    }
  };
  guard('newgame', () => newGame(dev));
  if (process.env.CHEATS) dev.game.set_development_mode(true);
  for (let i = 0; i < steps; i++) {
    const stage = dev.game.stage;
    const name = dev.stage();
    const r = rand();
    if (process.env.CHEATS && r < 0.05) { const letters = 'asdfxzvjtc2'; const ch = letters[Math.floor(rand() * letters.length)]; guard('cheat ' + ch, () => dev.key(ch.charCodeAt(0), 30, ch.toUpperCase(), 1)); log.push(`${i} ${name} cheat ${ch}`); continue; }
    if (r < 0.08) { const keys = [dev.K.ESCAPE, dev.K.RETURN, dev.K.SPACE, dev.K.UP, dev.K.DOWN, 97 + Math.floor(rand() * 26)]; const k = keys[Math.floor(rand() * keys.length)]; guard('key ' + k, () => dev.key(k, 10, String.fromCharCode(k))); log.push(`${i} ${name} key ${k}`); continue; }
    const cands = [];
    if (stage && stage.layers) {
      for (const l of stage.layers) if (l.get_visible()) for (const it of l.items) if (it.get_visible() && it.has_event_handler(0)) cands.push(it);
    }
    if (cands.length === 0 || r < 0.12) { const x = Math.floor(rand() * 600), y = Math.floor(rand() * 450); guard('click ' + x + ',' + y, () => dev.click(x, y, 10)); log.push(`${i} ${name} random click ${x},${y}`); continue; }
    const it = cands[Math.floor(rand() * cands.length)];
    const b = it.get_bounds();
    let pt = null;
    for (let t = 0; t < 12 && !pt; t++) {
      const x = b.x + Math.floor(rand() * Math.max(1, b.w)), y = b.y + Math.floor(rand() * Math.max(1, b.h));
      if (x >= 0 && y >= 0 && x < 600 && y < 450 && stage.hit_test_stack(x, y).includes(it)) pt = [x, y];
    }
    if (!pt) { const x = b.x + (b.w >> 1), y = b.y + (b.h >> 1); pt = [Math.max(0, Math.min(599, x)), Math.max(0, Math.min(449, y))]; }
    const frames = [5, 20, 40, 80][Math.floor(rand() * 4)];
    guard('click ' + it.constructor.name + ' ' + pt, () => dev.click(pt[0], pt[1], frames));
    log.push(`${i} ${name} click ${it.constructor.name} ${pt}`);
    if (i % 25 === 0) dev.save('monkey_' + i);
  }
  console.log('--- stages visited / last actions');
  console.log(log.slice(-8).join('\n'));
  console.log('--- errors:', errors.size);
  for (const [k, v] of errors) console.log(`x${v.count} [${v.stage}] ${v.what}\n    ${k}`);
};
