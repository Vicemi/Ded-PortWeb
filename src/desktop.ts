// The bridge with the desktop version (desktop/ : a Rust program that shows the game in its own window). It is only active inside that window, where the
// host sets window.__DED_DESKTOP__ and gives window.ipc. The saves live in the installation folder: the host hands the last one to the page before the game
// starts (restoreFromHost) and the page sends every change back (startAutosave). On the web nothing here does anything.
import { restoreUserFiles, validUserFile } from './runtime/py';
import type { Controller } from './game/host';

declare global {
  interface Window {
    ipc?: { postMessage(message: string): void };
    __DED_DESKTOP__?: boolean;
    __DED_SAVE__?: string | null;
    __dedSaveNow?: () => void;
    __dedSaveAs?: () => void;
    __dedImport?: (text: string) => void;
  }
}

export const isDesktop = (): boolean => typeof window !== 'undefined' && !!window.__DED_DESKTOP__ && !!window.ipc;
export const toHost = (t: string, data?: unknown): void => { try { window.ipc?.postMessage(JSON.stringify({ t, data })); } catch { /* none */ } };

function parseSave(text: string): Record<string, string> {
  const o = JSON.parse(text) as { game?: string; format?: number; files?: Record<string, unknown> };
  if (o.game !== 'ded' || o.format !== 1 || !o.files || typeof o.files !== 'object') throw new Error('not a save');
  const files: Record<string, string> = {};
  for (const [k, v] of Object.entries(o.files)) if (typeof v === 'string' && /^[\w.\- ]+(\/[\w.\- ]+)*$/.test(k) && !k.includes('..') && validUserFile(k, v)) files[k] = v;
  return files;
}

/**
 * The save of the installation folder goes into the storage of the page (before the game reads its files).
 * window.__DED_SAVE__ is the file as it was when the program started, so it is used once per run (a reload keeps the sessionStorage) and never over
 * newer progress: the host copy only fills what the page lacks or has less progress than it.
 */
export function restoreFromHost(): void {
  if (!isDesktop() || !window.__DED_SAVE__) return;
  try { if (sessionStorage.getItem('ded.restored')) return; sessionStorage.setItem('ded.restored', '1'); } catch { /* no sessionStorage: restore anyway */ }
  try {
    restoreUserFiles(parseSave(window.__DED_SAVE__), 'newer');
  } catch { /* damaged file: the game starts with what the page has */ }
}

/** sends the save to the host every time it changes, when the window hides and on demand; returns a function that stops it */
export function startAutosave(ctl: Controller): () => void {
  if (!isDesktop()) return () => {};
  let last = '';
  const snapshot = (): string => { const o = JSON.parse(ctl.exportSave()); delete o.saved; return JSON.stringify(o); };
  const send = (force: boolean): void => {
    const now = snapshot();
    if (!force && now === last) return;
    last = now;
    toHost('save', ctl.exportSave());
  };
  last = snapshot();
  const id = window.setInterval(() => send(false), 10000);
  const onHide = (): void => { if (document.visibilityState === 'hidden') send(false); };
  const onUnload = (): void => send(false);
  document.addEventListener('visibilitychange', onHide);
  window.addEventListener('beforeunload', onUnload);
  window.__dedSaveNow = () => send(true);
  window.__dedSaveAs = () => toHost('saveas', ctl.exportSave());
  window.__dedImport = (text: string) => { ctl.importSave(text); location.reload(); };
  const onKey = (e: KeyboardEvent): void => { if (e.key === 'F11') { e.preventDefault(); toHost('fullscreen'); } };
  window.addEventListener('keydown', onKey);
  return () => { window.clearInterval(id); document.removeEventListener('visibilitychange', onHide); window.removeEventListener('beforeunload', onUnload); window.removeEventListener('keydown', onKey); };
}
