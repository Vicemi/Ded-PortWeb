// A "shuffle bag": picks at random but without long streaks of the same choice. The bag (what is left to play) is kept in localStorage, so the
// variety also holds between runs of the game. Used for the music variants (the original is put in the bag several times so it comes up more often).
export function pickFromBag<T extends string>(key: string, items: readonly T[]): T {
  const k = 'ded.bag:' + key;
  let left: T[] = [];
  try { const raw = localStorage.getItem(k); if (raw) left = (JSON.parse(raw) as T[]).filter((x) => items.includes(x)); } catch { left = []; }
  if (!left.length) left = [...items];
  const i = Math.floor(Math.random() * left.length);
  const [pick] = left.splice(i, 1);
  try { localStorage.setItem(k, JSON.stringify(left)); } catch { /* storage unavailable: still random */ }
  return pick;
}
