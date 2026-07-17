import { useRef, useState } from 'react';
import CubeViewer from './CubeViewer.jsx';
import { LEVELS } from '../content/lessons.js';
import { invertSequence, toSequence } from '../cube/moves.js';
import { useLang, tx } from '../i18n/LangContext.jsx';

export default function LessonView() {
  const { lang } = useLang();
  const viewerRef = useRef(null);
  const [selectedId, setSelectedId] = useState(LEVELS[0].lessons[0].id);

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
          <CubeViewer ref={viewerRef} />

          <h2 style={{ marginTop: 22 }}>{tx(selected.title, lang)}</h2>
          <p className="lesson-summary">{tx(selected.summary, lang)}</p>

          {selected.steps.map((step, i) => (
            <div className="step" key={i}>
              <div className="step-num">{i + 1}</div>
              <div className="step-body">
                <p>{tx(step, lang)}</p>
                {step.algorithm && (
                  <div className="alg">
                    <code>{step.algorithm}</code>
                    <button className="play-btn" onClick={() => play(step.algorithm)}>
                      {tx({ zh: '播放', en: 'Play' }, lang)}
                    </button>
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
