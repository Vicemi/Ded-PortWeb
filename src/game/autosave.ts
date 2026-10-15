// Saves the progress of the open case when the page is hidden / closed (phone app switch, tab close, window close). The game itself only saves at
// checkpoints (phase changes, folder, notes), so this keeps what happened since. Only while a phase is on screen and no end screen has started:
// the end screens add medals / score in memory before they save, and saving then with the phase stage would let the player win the same case twice.

let blocked = false;
/** an import is about to reload the page: do not write the old in-memory state over the imported files */
export function blockAutosave(): void { blocked = true; }

/** true when something was saved */
export function flushProgress(game: any): boolean {
  if (blocked || !game) return false;
  try {
    const st = game.stage, ds = game.datastore;
    if (!st || !ds || !ds.user_character || !ds.user_character_progress?.case) return false;
    if (typeof st.phase_number !== 'number' || !st.initialized || st.loading_phase || st.ending_started || st.phase == null) return false;
    ds.save_character('p' + st.phase_number, false);
    ds.save_highscores();
    return true;
  } catch (e) { console.error('autosave:', e); return false; }
}

/** What counts as progress inside the open case: when this text changes something meaningful happened (clue, witness, minigame, travel, notes, arrest, medal). */
export function progressFingerprint(game: any): string | null {
  try {
    const ds = game?.datastore, p = ds?.user_character_progress, c = p?.case;
    if (!ds?.user_character || !c) return null;
    const st = game.stage;
    const dep = c.last_department_visited == null ? -1 : ds.list_departments.indexOf(c.last_department_visited);
    const medals = (p.medals ?? []).reduce((n: number, m: any) => n + (m.count || 0), 0);
    return [st?.phase_number, String(c.clues_found), c.list_visited_witnesses?.length, c.list_folder_witnesses?.length, c.list_stage_clues?.length, dep,
      c.arrest_order_thief ? 1 : 0, c.caught_thief, c.clues_identified ? 1 : 0, c.wrong_witness_visited ? 1 : 0, c.twist_state, p.notes?.length, p.new_notes?.length,
      medals, p.score, p.resolved_cases, p.list_departments_solved?.length, p.captured_thieves?.length].join('|');
  } catch { return null; }
}

/**
 * Checkpoint saver, polled by the host loop. Saves (1) shortly after the progress fingerprint changes (debounced, so a burst of events is one write) and
 * (2) every `every` ms while a case is open. flushProgress itself refuses to save at unsafe moments (minigame / race / end screens), so a pending
 * checkpoint just waits for the next phase screen. `saves` counts the successful writes (the page shows its "guardado" tick when it grows).
 */
export class Autosaver {
  saves = 0;
  private fp: string | null = null;
  private dueAt = 0;
  private lastSave: number;
  private lastPoll = 0;
  constructor(private getGame: () => any, private now: () => number, private every = 15000, private debounce = 600, private pollEvery = 250) { this.lastSave = now(); }
  poll(): void {
    const n = this.now();
    if (n - this.lastPoll < this.pollEvery) return;
    this.lastPoll = n;
    const fp = progressFingerprint(this.getGame());
    if (fp === null) { this.fp = null; this.dueAt = 0; this.lastSave = n; return; }
    if (this.fp !== null && fp !== this.fp && !this.dueAt) this.dueAt = n + this.debounce;
    this.fp = fp;
    if ((this.dueAt && n >= this.dueAt) || n - this.lastSave >= this.every) this.save(n);
  }
  /** an unsaved change is waiting */
  get pending(): boolean { return this.dueAt !== 0; }
  save(n = this.now()): boolean {
    if (flushProgress(this.getGame())) { this.saves++; this.dueAt = 0; this.lastSave = n; return true; }
    // not a safe moment: try again at the next poll (the periodic timer is also retried, not postponed)
    return false;
  }
}
