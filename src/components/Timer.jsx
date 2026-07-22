import { useRef, useState, useEffect, useCallback } from 'react';
import CubeViewer from './CubeViewer.jsx';
import { useLang, tx } from '../i18n/LangContext.jsx';

const SCRAMBLE_LEN = 20;

function formatTime(ms) {
  const total = ms / 1000;
  if (total < 60) return total.toFixed(2) + 's';
  const m = Math.floor(total / 60);
  const s = (total % 60).toFixed(2).padStart(5, '0');
  return `${m}:${s}`;
}

export default function Timer() {
  const { lang } = useLang();
  const viewerRef = useRef(null);
  const [scramble, setScramble] = useState(null);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [times, setTimes] = useState([]);

  const runningRef = useRef(false);
  const startRef = useRef(0);
  const rafRef = useRef(0);

  const stopTimer = useCallback(() => {
    if (!runningRef.current) return;
    runningRef.current = false;
    cancelAnimationFrame(rafRef.current);
    const final = performance.now() - startRef.current;
    setElapsed(final);
    setRunning(false);
    setTimes((t) => [...t, final]);
  }, []);

  const tick = () => {
    setElapsed(performance.now() - startRef.current);
    rafRef.current = requestAnimationFrame(tick);
  };

  const startTimer = useCallback(() => {
    if (runningRef.current || !scramble) return;
    runningRef.current = true;
    setRunning(true);
    startRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
  }, [scramble]);

  const doScramble = () => {
    stopTimer();
    const seq = viewerRef.current?.scramble(SCRAMBLE_LEN);
    setScramble(seq ?? null);
    setElapsed(0);
  };

  const clearTimes = () => setTimes([]);

  const onKey = (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      if (runningRef.current) stopTimer();
      else startTimer();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      cancelAnimationFrame(rafRef.current);
    };
  }, [startTimer, stopTimer]);

  const best = times.length ? Math.min(...times) : null;

  return (
    <div>
      <h1 className="section-title">{tx({ zh: '计时挑战', en: 'Solve Timer' }, lang)}</h1>
      <p className="section-sub">
        {tx(
          {
            zh: '点击「打乱」生成随机公式，观察后按空格开始计时，复原完成再按空格停止。也可点击「开始/停止」按钮。',
            en: 'Click "Scramble" for a random sequence, press Space to start, and press Space again once solved. The Start/Stop button works too.',
          },
          lang,
        )}
      </p>

      <div className="timer-card">
        <CubeViewer ref={viewerRef}>
          {!scramble ? (
          <p style={{ textAlign: 'center', opacity: 0.7, marginTop: 12 }}>
            {tx({ zh: '请先打乱再开始计时', en: 'Scramble first to start the timer' }, lang)}
          </p>
        ) : (
          <div className="solver-scramble" style={{ textAlign: 'center', marginTop: 12 }}>
            <div>
              {tx({ zh: '打乱公式（', en: 'Scramble (' }, lang)}
              {scramble.length}
              {tx({ zh: '步）：', en: ' moves):' }, lang)}{' '}
              <code>{scramble.join(' ')}</code>
            </div>
          </div>
        )}

        <div className="cube-controls">
          <button className="ctrl-btn accent" onClick={doScramble}>
            {tx({ zh: '打乱', en: 'Scramble' }, lang)}
          </button>
          <button
            className="ctrl-btn primary"
            onClick={running ? stopTimer : startTimer}
            disabled={!scramble}
          >
            {running
              ? tx({ zh: '停止', en: 'Stop' }, lang)
              : tx({ zh: '开始计时', en: 'Start' }, lang)}
          </button>
          {times.length > 0 && (
            <button className="ctrl-btn" onClick={clearTimes}>
              {tx({ zh: '清空记录', en: 'Clear' }, lang)}
            </button>
          )}
        </div>

        <div
          className="timer-display"
          style={{
            fontSize: '3rem',
            fontWeight: 700,
            textAlign: 'center',
            margin: '18px 0',
            fontVariantNumeric: 'tabular-nums',
            color: running ? 'var(--accent)' : 'inherit',
          }}
        >
          {formatTime(elapsed)}
        </div>
        </CubeViewer>
      </div>

      {best != null && (
        <div style={{ textAlign: 'center', marginTop: 12, opacity: 0.9 }}>
          {tx({ zh: '本次记录', en: 'Session' }, lang)}：{times.length} ·{' '}
          {tx({ zh: '最佳', en: 'Best' }, lang)}：{formatTime(best)} ·{' '}
          {tx({ zh: '上次', en: 'Last' }, lang)}：{formatTime(times[times.length - 1])}
        </div>
      )}
    </div>
  );
}
