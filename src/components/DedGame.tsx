import { useEffect, useRef, useState } from 'react';
import { startHost, type Controller } from '../game/host';
import { mixer } from '../engine/sounds';
import { K } from '../engine/pygame';
import { storageFailed } from '../runtime/py';
import { isDesktop, restoreFromHost, startAutosave, toHost } from '../desktop';
import { installUpdateUi } from '../desktop-update';

/** a round button of the phone gamepad that keeps a game key pressed while the finger is on it */
function Pad({ ctl, code, label, cls }: { ctl: React.RefObject<Controller | null>; code: number; label: string; cls: string }) {
  return (
    <button className={'ded-pad ' + cls} aria-label={label}
      onPointerDown={(e) => { e.preventDefault(); (e.target as HTMLElement).setPointerCapture(e.pointerId); ctl.current?.hold(code, true); }}
      onPointerUp={() => ctl.current?.hold(code, false)} onPointerCancel={() => ctl.current?.hold(code, false)}
      onContextMenu={(e) => e.preventDefault()}>{label}</button>
  );
}

/** A 4:3 canvas (the 600x450 screen of the game) that fills the window, plus the loading bar and the sound / fullscreen / credits buttons. */
export default function DedGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const ctlRef = useRef<Controller | null>(null);
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mute, setMute] = useState(false);
  const [info, setInfo] = useState(false);
  const [full, setFull] = useState(false);
  const [quit, setQuit] = useState(false);
  const [racing, setRacing] = useState(false);
  const [touch, setTouch] = useState(false);
  const [portrait, setPortrait] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState<string | null>(null);
  const warned = useRef(false);
  const [zoom, setZoom] = useState({ s: 1, x: 0, y: 0 });
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const canFull = typeof document !== 'undefined' && (!!document.fullscreenEnabled || isDesktop());

  useEffect(() => {
    restoreFromHost();
    if (isDesktop()) installUpdateUi();
    const ctl = startHost(canvasRef.current!, import.meta.env.BASE_URL.replace(/\/$/, '') + '/assets');
    ctlRef.current = ctl;
    const stopAutosave = startAutosave(ctl);
    if (import.meta.env.DEV) { (window as unknown as { __ded: Controller }).__ded = ctl; (window as unknown as { __mixer: typeof mixer }).__mixer = mixer; }
    const id = window.setInterval(() => {
      setProgress(ctl.state.progress);
      setLoaded(ctl.state.loaded);
      setError(ctl.state.error);
      setQuit(ctl.state.quit);
      setRacing(ctl.state.racing);
      setTouch(ctl.state.touch);
      if (!warned.current && storageFailed()) { warned.current = true; setNote('El navegador no deja guardar (almacenamiento lleno o bloqueado). Usa el botón 💾 para guardar tu progreso en un archivo.'); }
    }, 100);
    canvasRef.current?.focus();
    const detach = ctl.attachTextInput(inputRef.current!);
    return () => { window.clearInterval(id); detach(); stopAutosave(); ctl.stop(); };
  }, []);

  useEffect(() => {
    const onChange = () => setFull(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  useEffect(() => {
    const q = window.matchMedia('(orientation: portrait) and (max-width: 900px)');
    const f = () => setPortrait(q.matches);
    f(); q.addEventListener('change', f);
    return () => q.removeEventListener('change', f);
  }, []);

  /** the hidden field of the phone keyboard: what is typed there goes to the game as key presses */
  const onBeforeInput = (e: React.FormEvent<HTMLInputElement>) => {
    const ne = e.nativeEvent as InputEvent;
    const ctl = ctlRef.current;
    if (!ctl) return;
    e.preventDefault();
    if (ne.inputType === 'deleteContentBackward') { ctl.tap(K.BACKSPACE); return; }
    if (ne.inputType === 'insertLineBreak' || ne.inputType === 'insertParagraph') { ctl.tap(K.RETURN); return; }
    for (const ch of ne.data ?? '') {
      const down = ch.toLowerCase().charCodeAt(0);
      ctl.key(down, true, ch); ctl.key(down, false);
    }
  };

  const saveProgress = () => {
    const ctl = ctlRef.current;
    if (!ctl) return;
    if (isDesktop()) { toHost('saveas', ctl.exportSave()); return; }
    const blob = new Blob([ctl.exportSave()], { type: 'application/json' });
    const a = document.createElement('a');
    const d = new Date();
    a.href = URL.createObjectURL(blob);
    a.download = `ded-progreso-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    setNote('Progreso guardado en el archivo ' + a.download);
  };
  const loadProgress = async (file: File | undefined) => {
    if (!file) return;
    try {
      const n = ctlRef.current!.importSave(await file.text());
      setNote(`Progreso cargado (${n} archivos). Reiniciando…`);
      setTimeout(() => location.reload(), 800);
    } catch (e) { setNote((e as Error).message); }
    if (fileRef.current) fileRef.current.value = '';
  };

  /** pinch with two fingers to zoom the game (the small buttons and lists are hard to hit on a phone), the same gesture pans it */
  useEffect(() => {
    const el = stageRef.current!;
    const pts = new Map<number, { x: number; y: number }>();
    let prev: { cx: number; cy: number; d: number } | null = null;
    const measure = () => {
      const [a, b] = [...pts.values()];
      return { cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2, d: Math.max(10, Math.hypot(a.x - b.x, a.y - b.y)) };
    };
    const down = (e: PointerEvent) => { if (e.pointerType !== 'touch') return; pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (pts.size === 2) prev = measure(); };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'touch' || !pts.has(e.pointerId)) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size !== 2 || !prev) return;
      const now = measure();
      const z = zoomRef.current;
      const r = el.getBoundingClientRect();
      const ox = r.left + r.width / 2, oy = r.top + r.height / 2;
      const s1 = Math.max(1, Math.min(4, z.s * now.d / prev.d));
      let x1 = now.cx - ox - s1 * (prev.cx - ox - z.x) / z.s, y1 = now.cy - oy - s1 * (prev.cy - oy - z.y) / z.s;
      const mx = (s1 - 1) * r.width / 2, my = (s1 - 1) * r.height / 2;
      x1 = Math.max(-mx, Math.min(mx, x1)); y1 = Math.max(-my, Math.min(my, y1));
      if (s1 === 1) { x1 = 0; y1 = 0; }
      prev = now;
      setZoom({ s: s1, x: x1, y: y1 });
    };
    const up = (e: PointerEvent) => { pts.delete(e.pointerId); prev = null; if (pts.size === 2) prev = measure(); };
    el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    return () => { el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); };
  }, []);

  const toggleFull = () => {
    if (isDesktop()) { toHost('fullscreen'); return; }
    if (document.fullscreenElement) { void document.exitFullscreen?.(); return; }
    void stageRef.current?.requestFullscreen?.();
    try { void (window.screen as unknown as { orientation?: { lock?: (o: string) => Promise<void> } }).orientation?.lock?.('landscape'); } catch { /* unsupported */ }
  };

  return (
    <div className="ded-stage" ref={stageRef}>
      <canvas ref={canvasRef} className="ded-canvas" tabIndex={0} aria-label="División Especial de Detectives" style={zoom.s > 1 ? { transform: `translate(${zoom.x}px, ${zoom.y}px) scale(${zoom.s})` } : undefined} />
      {!loaded && !error && (
        <div className="ded-loading">
          <span>Cargando… {Math.round(progress * 100)}%</span>
          <div className="ded-bar"><i style={{ width: `${progress * 100}%` }} /></div>
        </div>
      )}
      {error && <div className="ded-loading"><span>No se pudo cargar el juego.</span><small>{error}</small></div>}
      {quit && (
        <div className="ded-loading" onPointerDown={() => location.reload()}>
          <span>Juego cerrado</span><small>Toca o pulsa para volver a empezar</small>
        </div>
      )}
      <input ref={inputRef} className="ded-hidden-input" data-game-input="1" autoCapitalize="off" autoCorrect="off" spellCheck={false} aria-hidden="true" tabIndex={-1}
        value="" onChange={() => {}} onBeforeInput={onBeforeInput}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); ctlRef.current?.tap(K.RETURN); } }}
        onBlur={() => { if (ctlRef.current) ctlRef.current.state.typing = false; }} />
      {touch && racing && (
        <div className="ded-gamepad">
          <div className="ded-pad-group"><Pad ctl={ctlRef} code={K.LEFT} label="◀" cls="l" /><Pad ctl={ctlRef} code={K.RIGHT} label="▶" cls="r" /></div>
          <div className="ded-pad-group"><Pad ctl={ctlRef} code={K.DOWN} label="▼" cls="b" /><Pad ctl={ctlRef} code={K.UP} label="▲" cls="a" /></div>
        </div>
      )}
      {portrait && loaded && (
        <div className="ded-rotate" onPointerDown={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}>
          <div>↻<br />Gira el teléfono para jugar mejor<br /><small>(toca para continuar así)</small></div>
        </div>
      )}
      {!isDesktop() && <div className="ded-tools">
        {zoom.s > 1 && <button className="ded-btn" aria-label="Quitar el zoom" onClick={() => setZoom({ s: 1, x: 0, y: 0 })}>1×</button>}
        {touch && <button className="ded-btn" aria-label="Menú / Escape" onClick={() => ctlRef.current?.tap(K.ESCAPE)}>☰</button>}
        {canFull && <button className="ded-btn" aria-label="Pantalla completa" onClick={toggleFull}>{full ? '✕' : '⛶'}</button>}
        <button className="ded-btn" aria-label={mute ? 'Activar sonido' : 'Silenciar'} onClick={() => { mixer.setMuted(!mixer.muted); setMute(mixer.muted); }}>{mute ? '🔇' : '🔊'}</button>
        <button className="ded-btn" aria-label="Guardar progreso en un archivo" title="Guardar progreso en un archivo" onClick={saveProgress}>💾</button>
        <button className="ded-btn" aria-label="Cargar progreso desde un archivo" title="Cargar progreso desde un archivo" onClick={() => (isDesktop() ? toHost('load') : fileRef.current?.click())}>📂</button>
        <button className="ded-btn" aria-label="Créditos" onClick={() => setInfo(true)}>i</button>
      </div>}
      <input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={(e) => void loadProgress(e.target.files?.[0])} />
      {note && <div className="ded-note" role="status" onClick={() => setNote(null)}>{note}</div>}
      {info && (
        <div className="ded-modal" onClick={() => setInfo(false)}>
          <div className="ded-card" onClick={(e) => e.stopPropagation()}>
            <h1>División Especial de Detectives</h1>
            <p>Un juego de <b>Trojan Chicken</b> para las laptops XO del programa Plan Ceibal / One Laptop per Child (actividad Sugar).</p>
            <p>Tu progreso se guarda en este navegador. Con 💾 puedes bajarlo a un archivo y con 📂 volver a cargarlo (por si cambias de equipo o se borran los datos del navegador).</p>
            <p>Edición actualizada recreada por <b><a href="https://vicemi.dev" target="_blank" rel="noreferrer">Vicemi Dev (vicemi.dev)</a></b>, con nuevos personajes, minijuegos, medallas, música y contenido adicional sobre el Uruguay actual. Incluye todos los recursos originales del juego.</p>
            <button className="ded-close" onClick={() => setInfo(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}
