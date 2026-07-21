import { useEffect, useRef, useState } from 'react';
import CubeViewer from './CubeViewer.jsx';
import { LEVELS } from '../content/lessons.js';
import { invertSequence, toSequence } from '../cube/moves.js';
import { useLang, tx } from '../i18n/LangContext.jsx';

export default function LessonView() {
  const { lang } = useLang();
  const viewerRef = useRef(null);
  const [selectedId, setSelectedId] = useState(LEVELS[0].lessons[0].id);
  const [activeStepIdx, setActiveStepIdx] = useState(0);

  useEffect(() => {
    setActiveStepIdx(0);
  }, [selectedId]);

  const selected = LEVELS.flatMap((l) => l.lessons).find((ls) => ls.id === selectedId);

  const play = (algorithm) => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.reset();
    // Reach the algorithm's real "before" case by applying its inverse from
    // solved, hold so the pattern is visible, then play it forward.
    const setup = invertSequence(toSequence(algorithm));
    viewer.play(setup);
    viewer.pause(900);
    viewer.play(algorithm);
  };

  const activeStep = selected?.steps?.[activeStepIdx];

  return (
    <div>
      <h1 className="section-title">{tx({ zh: '分步课程', en: 'Step-by-Step Lessons' }, lang)}</h1>
      <p className="section-sub">
        {tx(
          {
            zh: '从层先法到 CFOP，每步都可点「播放」在魔方上观看转动。',
            en: 'From LBL to CFOP — click "Play" on any step to watch the turns on the cube.',
          },
          lang,
        )}
      </p>

      <div className="lesson-layout">
        <aside className="lesson-nav">
          {LEVELS.map((level) => (
            <div className="level-block" key={level.id}>
              <h4>
                {level.badge} · {tx(level.title, lang)}
              </h4>
              {level.lessons.map((lesson) => (
                <button
                  key={lesson.id}
                  className={lesson.id === selectedId ? 'active' : ''}
                  onClick={() => setSelectedId(lesson.id)}
                >
                  {tx(lesson.title, lang)}
                </button>
              ))}
            </div>
          ))}
        </aside>

        <section className="lesson-panel">
          <CubeViewer ref={viewerRef}>
            {activeStep?.algorithm && (
              <>
                <code className="cube-label-overlay">{activeStep.algorithm}</code>
                <button
                  className="cube-play-overlay"
                  onClick={() => play(activeStep.algorithm)}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                    <polygon points="3,1 12,7 3,13" />
                  </svg>
                  {tx({ zh: '播放', en: 'Play' }, lang)}
                </button>
              </>
            )}
          </CubeViewer>

          <h2 style={{ marginTop: 22 }}>{tx(selected.title, lang)}</h2>
          <p className="lesson-summary">{tx(selected.summary, lang)}</p>

          {selected.steps.map((step, i) => (
            <div
              className={`step${step.algorithm ? ' step-has-alg' : ''}${activeStepIdx === i && step.algorithm ? ' step-active' : ''}`}
              key={i}
              onClick={step.algorithm ? () => setActiveStepIdx(i) : undefined}
            >
              <div className="step-num">{i + 1}</div>
              <div className="step-body">
                <p>{tx(step, lang)}</p>
                {step.algorithm && (
                  <div className="alg">
                    <code>{step.algorithm}</code>
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
