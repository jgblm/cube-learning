import { useRef, useState } from 'react';
import CubeViewer from './CubeViewer.jsx';
import { planInverseSolve } from '../cube/solver.js';
import { useLang, tx } from '../i18n/LangContext.jsx';

const SCRAMBLE_LEN = 20;

export default function SolverDemo() {
  const { lang } = useLang();
  const viewerRef = useRef(null);
  const [scrambleSeq, setScrambleSeq] = useState(null);
  const [solving, setSolving] = useState(false);

  const doScramble = () => {
    const seq = viewerRef.current?.scramble(SCRAMBLE_LEN);
    setScrambleSeq(seq ?? null);
    setSolving(false);
  };

  const doSolve = () => {
    if (!scrambleSeq) return;
    const solution = planInverseSolve(scrambleSeq);
    viewerRef.current?.play(solution);
    setSolving(true);
  };

  const solutionSeq = scrambleSeq ? planInverseSolve(scrambleSeq) : null;

  return (
    <div>
      <h1 className="section-title">{tx({ zh: '自动求解演示', en: 'Auto-Solve Demo' }, lang)}</h1>
      <p className="section-sub">
        {tx(
          {
            zh: '点击「打乱」随机转动魔方，再点「求解」让它按逆序还原。本演示通过逆序回放保证 100% 还原。',
            en: 'Click "Scramble" to shuffle, then "Solve" to restore it by replaying the moves in reverse. The inverse replay guarantees a perfect solve.',
          },
          lang,
        )}
      </p>

      <div className="note">
        {tx(
          {
            zh: '说明：演示使用「逆序还原」——把打乱序列反向、每步取逆即可回到原状，始终正确。真正的层先/二阶段求解器可作为后续扩展。',
            en: 'Note: the demo uses inverse replay — reversing the scramble and inverting each move always returns to solved. A true LBL / two-phase solver can be added later.',
          },
          lang,
        )}
      </div>

      <CubeViewer ref={viewerRef} />

      <div className="cube-controls">
        <button className="ctrl-btn accent" onClick={doScramble}>
          {tx({ zh: '打乱', en: 'Scramble' }, lang)}
        </button>
        <button className="ctrl-btn primary" onClick={doSolve} disabled={!scrambleSeq}>
          {tx({ zh: '求解', en: 'Solve' }, lang)}
        </button>
      </div>

      {scrambleSeq && (
        <div className="solver-scramble">
          <div>
            {tx({ zh: '打乱公式（', en: 'Scramble (' }, lang)}
            {scrambleSeq.length}
            {tx({ zh: '步）：', en: ' moves):' }, lang)}{' '}
            <code>{scrambleSeq.join(' ')}</code>
          </div>
          {solutionSeq && (
            <div style={{ marginTop: 8 }}>
              {tx({ zh: '还原公式（', en: 'Solution (' }, lang)}
              {solutionSeq.length}
              {tx({ zh: '步）：', en: ' moves):' }, lang)}{' '}
              <code>{solutionSeq.join(' ')}</code>
            </div>
          )}
          {solving && (
            <div style={{ marginTop: 8, color: 'var(--good)' }}>
              {tx(
                { zh: '正在还原…完成后魔方应恢复六面同色。', en: 'Solving… the cube should return to solved when finished.' },
                lang,
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
