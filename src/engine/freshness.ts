// A page that was loaded from an older build (a cached script, or the Cache API copy of the images) must not keep showing old content: the build writes
// version.json (never cached) next to the page; when its id is not the one compiled into this script, the caches are cleared and the page reloads once.
declare const __BUILD_ID__: string | undefined;
declare const __APP_VERSION__: string | undefined;
export const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';

export async function ensureFresh(): Promise<void> {
  if (typeof __BUILD_ID__ === 'undefined' || typeof location === 'undefined' || (window as unknown as { __DED_DESKTOP__?: boolean }).__DED_DESKTOP__) return;
  try {
    const r = await fetch(new URL('version.json', location.href).href + '?t=' + Date.now(), { cache: 'no-store' });
    if (!r.ok) return;
    const live = (await r.json()) as { id?: string };
    if (!live.id || live.id === __BUILD_ID__) { try { sessionStorage.removeItem('ded:refreshed'); } catch { /* none */ } return; }
    if (sessionStorage.getItem('ded:refreshed') === live.id) return;   // once per version: no reload loops
    sessionStorage.setItem('ded:refreshed', live.id);
    if (typeof caches !== 'undefined') for (const k of await caches.keys()) await caches.delete(k);
    location.reload();
  } catch { /* offline or no version file: keep going */ }
}
