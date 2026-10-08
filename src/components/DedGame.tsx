import { useEffect, useRef, useState } from 'react';
import { startHost, type Controller } from '../game/host';
import { mixer } from '../engine/sounds';

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
    }, 100);
    canvasRef.current?.focus();
    return () => { window.clearInterval(id); ctl.stop(); };
  }, []);

  useEffect(() => {
    const onChange = () => setFull(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

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
      <div className="ded-tools">
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
