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
