import { useEffect, useRef, useState } from 'react';
import { startHost, type Controller } from '../game/host';
import { mixer } from '../engine/sounds';
import { K } from '../engine/pygame';

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
  const canFull = typeof document !== 'undefined' && !!document.fullscreenEnabled;

  useEffect(() => {
    const ctl = startHost(canvasRef.current!, import.meta.env.BASE_URL.replace(/\/$/, '') + '/assets');
    ctlRef.current = ctl;
    if (import.meta.env.DEV) (window as unknown as { __ded: Controller }).__ded = ctl;
    const id = window.setInterval(() => {
      setProgress(ctl.state.progress);
      setLoaded(ctl.state.loaded);
      setError(ctl.state.error);
      setQuit(ctl.state.quit);
      setRacing(ctl.state.racing);
      setTouch(ctl.state.touch);
    }, 100);
    canvasRef.current?.focus();
    const detach = ctl.attachTextInput(inputRef.current!);
    return () => { window.clearInterval(id); detach(); ctl.stop(); };
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

  const toggleFull = () => {
    if (document.fullscreenElement) { void document.exitFullscreen?.(); return; }
    void stageRef.current?.requestFullscreen?.();
    try { void (window.screen as unknown as { orientation?: { lock?: (o: string) => Promise<void> } }).orientation?.lock?.('landscape'); } catch { /* unsupported */ }
  };

  return (
    <div className="ded-stage" ref={stageRef}>
      <canvas ref={canvasRef} className="ded-canvas" tabIndex={0} aria-label="División Especial de Detectives" />
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
      <div className="ded-tools">
        {touch && <button className="ded-btn" aria-label="Menú / Escape" onClick={() => ctlRef.current?.tap(K.ESCAPE)}>☰</button>}
        {canFull && <button className="ded-btn" aria-label="Pantalla completa" onClick={toggleFull}>{full ? '✕' : '⛶'}</button>}
        <button className="ded-btn" aria-label={mute ? 'Activar sonido' : 'Silenciar'} onClick={() => { mixer.setMuted(!mixer.muted); setMute(mixer.muted); }}>{mute ? '🔇' : '🔊'}</button>
        <button className="ded-btn" aria-label="Créditos" onClick={() => setInfo(true)}>i</button>
      </div>
      {info && (
        <div className="ded-modal" onClick={() => setInfo(false)}>
          <div className="ded-card" onClick={(e) => e.stopPropagation()}>
            <h1>División Especial de Detectives</h1>
            <p>Un juego de <b>Trojan Chicken</b> para las laptops XO del programa Plan Ceibal / One Laptop per Child (actividad Sugar).</p>
            <p>Versión web hecha por <b>Vicemi Dev</b> con todos los recursos originales del juego.</p>
            <button className="ded-close" onClick={() => setInfo(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}
