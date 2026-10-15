// The storage under the game's virtual files (runtime/py.ts): every file lives in localStorage under 'ded.fs:<path>' and is protected by
//  - a write that is validated first (a truncated / empty character file is refused, the good one stays) and goes through a temp key
//  - a rolling backup of the previous good version ('ded.bak:') and a "best" copy ('ded.best:': the version with the most progress)
//  - a read that falls back to those copies when the file is missing, damaged or has LESS progress than the best copy (a wipe)
// Every storage access is wrapped: with no storage / a full quota the game keeps working from memory (py.ts) and `status.failed` tells the page.
export const FS_PREFIX = 'ded.fs:';
const BAK = 'ded.bak:', BEST = 'ded.best:', TMP = 'ded.tmp:', BAD = 'ded.bad:';

export const status = { failed: false, rejected: 0, recovered: [] as string[] };

const store = (): Storage | null => { try { return typeof localStorage === 'undefined' ? null : localStorage; } catch { return null; } };
const get = (k: string): string | null => { try { return store()?.getItem(k) ?? null; } catch { return null; } };
const set = (k: string, v: string): boolean => { try { const s = store(); if (!s) return false; s.setItem(k, v); return true; } catch { return false; } };
const del = (k: string): void => { try { store()?.removeItem(k); } catch { /* none */ } };
const keys = (prefix: string): string[] => {
  const out: string[] = [];
  try { const s = store(); if (s) for (let i = 0; i < s.length; i++) { const k = s.key(i); if (k !== null && k.startsWith(prefix)) out.push(k); } } catch { /* none */ }
  return out;
};

export const isCharFile = (p: string): boolean => /^data\/c\d+\.dat$/.test(p);

/** is this text a complete version of the file? */
export function validRead(p: string, t: string): boolean {
  // the writer ends every character file with the captured thieves: a cut file lacks that last line
  if (isCharFile(p)) return /^info;\d+/m.test(t) && /(^|\n)capturedthieves[^\n]*\s*$/.test(t);
  const lines = t.split('\n').map((l) => l.replace(/\r$/, '')).filter((l) => l !== '');
  if (p === 'data/characters.dat') return lines.every((l) => l.split(';').length >= 7);
  if (p === 'data/highscores.dat') return lines.every((l) => (l.split(';').length - 1) % 3 === 0);
  return true;
}
/** may the game's own writer have produced this text? (strict: refuses truncated / empty character files) */
export function validWrite(p: string, t: string): boolean {
  if (!validRead(p, t)) return false;
  return !isCharFile(p) || (/^score;-?\d+/m.test(t) &&/^medals(;|$)/m.test(t));
}

/** progress of a character file: [resolved cases, score, medals won]; it never goes down while playing */
export function rank(p: string, t: string): number[] {
  if (!isCharFile(p)) return [0, 0, 0];
  const num = (re: RegExp): number => Number(re.exec(t)?.[1] ?? 0) || 0;
  let medals = 0;
  const m = /^medals;(.*)$/m.exec(t);
  if (m) { const f = m[1].replace(/\r$/, '').split(';'); for (let i = 1; i < f.length; i += 2) medals += Number(f[i]) || 0; }
  return [num(/^resolvedcases;(\d+)/m), num(/^score;(-?\d+)/m), medals];
}
/** > 0 when a has more progress than b */
export function compare(p: string, a: string, b: string): number {
  const x = rank(p, a), y = rank(p, b);
  for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return x[i] - y[i];
  return 0;
}

function restore(p: string, text: string, damaged: string | null): string {
  if (damaged !== null) set(BAD + p, damaged);
  set(FS_PREFIX + p, text);
  status.recovered.push(p);
  return text;
}

/** the text of a file, repaired from its copies when needed; null when there is none */
export function read(p: string): string | null {
  const main = get(FS_PREFIX + p);
  if (main !== null && validRead(p, main)) {
    const best = get(BEST + p);
    if (best !== null && isCharFile(p) && validRead(p, best) && compare(p, main, best) < 0) return restore(p, best, main);
    return main;
  }
  const copies = [get(BAK + p), get(BEST + p)].filter((t): t is string => t !== null && validRead(p, t));
  if (!copies.length) return main;
  copies.sort((a, b) => compare(p, b, a));   // stable: on a tie the rolling backup (newer) wins
  return restore(p, copies[0], main);
}

/** frees space step by step; returns false when there was nothing left to free */
function makeRoom(p: string, step: number): boolean {
  const steps: (() => void)[] = [
    () => { for (const k of keys(TMP)) del(k); for (const k of keys(BAD)) del(k); },
    () => { for (const k of keys('ded.bag:')) del(k); },
    () => { for (const k of keys(BAK)) if (k !== BAK + p) del(k); },
    () => del(BAK + p),
    () => del(BEST + p),
  ];
  if (step >= steps.length) return false;
  steps[step]();
  return true;
}
function put(k: string, v: string, p: string): boolean {
  if (set(k, v)) return true;
  for (let s = 0; makeRoom(p, s); s++) if (set(k, v)) return true;
  return false;
}

/** stores a file; false when it could not be stored (invalid content or no room: the caller keeps it in memory) */
export function write(p: string, v: string, deliberate = false): boolean {
  if (!validWrite(p, v)) { status.rejected++; return false; }
  const prev = get(FS_PREFIX + p);
  if (prev === v) return true;
  if (prev !== null) {
    if (!validRead(p, prev)) set(BAD + p, prev);
    else {
      const best = get(BEST + p);
      if (!isCharFile(p) || best === null || !validRead(p, best) || compare(p, prev, best) >= 0) set(BEST + p, prev);
      set(BAK + p, prev);
    }
  }
  // temp key first: if it cannot be stored and read back, the file in place is left alone
  if (!set(TMP + p, v) || get(TMP + p) !== v) { del(TMP + p); status.failed = true; return false; }
  const ok = put(FS_PREFIX + p, v, p) && get(FS_PREFIX + p) === v;
  del(TMP + p);
  if (!ok) { status.failed = true; return false; }
  if (deliberate) { set(BEST + p, v); }
  status.failed = false;
  return true;
}

export function remove(p: string): void { for (const k of [FS_PREFIX, BAK, BEST, TMP, BAD]) del(k + p); }
/** paths of the stored files (the ones with a good copy only count too: they are repaired when read) */
export function names(): string[] {
  const out = new Set(keys(FS_PREFIX).map((k) => k.slice(FS_PREFIX.length)));
  for (const k of keys(BAK)) out.add(k.slice(BAK.length));
  return [...out];
}
