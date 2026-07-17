import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import CubeEngine from '../cube/CubeEngine.js';
import { useLang } from '../i18n/LangContext.jsx';

const MOVE_GROUPS = [
  ['U', "U'", 'U2'],
  ['D', "D'", 'D2'],
  ['L', "L'", 'L2'],
  ['R', "R'", 'R2'],
  ['F', "F'", 'F2'],
  ['B', "B'", 'B2'],
];

/**
 * Interactive 3D cube. Wraps CubeEngine and exposes an imperative API via
 * ref: { play(seq), scramble(n), reset(), setSpeed(mult) }.
 *
 * Drag to orbit the camera, scroll to zoom, or use the on-screen buttons /
 * keyboard (letter = clockwise, Shift+letter = prime).
 */
const CubeViewer = forwardRef(function CubeViewer(_props, ref) {
  const containerRef = useRef(null);
  const engineRef = useRef(null);
  const [speed, setSpeedState] = useState(1);
  const { lang } = useLang();

  useEffect(() => {
    const engine = new CubeEngine(containerRef.current);
    engineRef.current = engine;
    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  useImperativeHandle(ref, () => ({
    play: (seq) => engineRef.current?.enqueue(seq),
    scramble: (n = 20) => engineRef.current?.scramble(n),
    reset: () => engineRef.current?.reset(),
    setSpeed: (m) => engineRef.current?.setSpeed(m),
  }));

  const onKey = (e) => {
    const k = e.key.toLowerCase();
    if ('udlrfb'.includes(k)) {
      e.preventDefault();
      const move = k.toUpperCase() + (e.shiftKey ? "'" : '');
      engineRef.current?.enqueue(move);
    }
  };

  const changeSpeed = (e) => {
    const v = Number(e.target.value);
    setSpeedState(v);
    engineRef.current?.setSpeed(v);
  };

  return (
    <div>
      <div
        className="cube-stage"
        ref={containerRef}
        tabIndex={0}
        onKeyDown={onKey}
        aria-label="3D cube"
      />
      <div className="cube-controls">
        {MOVE_GROUPS.flat().map((m) => (
          <button
            key={m}
            className="move-btn"
            onClick={() => engineRef.current?.enqueue(m)}
            title={m}
          >
            {m}
          </button>
        ))}
        <button className="ctrl-btn accent" onClick={() => engineRef.current?.scramble(20)}>
          打乱 Scramble
        </button>
        <button className="ctrl-btn" onClick={() => engineRef.current?.reset()}>
          复位 Reset
        </button>
        <label className="speed">
          {lang === 'zh' ? '速度' : 'Speed'}
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={speed}
            onChange={changeSpeed}
          />
          {speed.toFixed(1)}×
        </label>
      </div>
    </div>
  );
});

export default CubeViewer;
