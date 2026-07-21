import { useRef, useState } from 'react';
import CubeViewer from './CubeViewer.jsx';
import F2L_DATA from '../content/f2l_data.json';
import { useLang, tx } from '../i18n/LangContext.jsx';

/** Flatten the built-in F2L library (the data that seeds the formula library)
 *  into playable cards — one per algorithm. Display and playback mirror the
 *  library exactly: the case is shown by painting the dataFl sticker map
 *  directly (no setup/scramble), and the algorithm is played as-is. */
const F2L_ENTRIES = F2L_DATA.flatMap((c) =>
  c.algorithms.map((alg, i) => ({
    id: `f2l-${c.case}-${i}`,
    name: { zh: `F2L ${c.case}`, en: `F2L ${c.case}` },
    hint: { zh: c.subgroup, en: c.subgroup },
    dataFl: c.dataFl,
    algorithm: alg,
  })),
);

function Card({ entry, lang, isSelected, onSelect }) {
  return (
    <div
      className={`formula-card${isSelected ? ' selected' : ''}`}
      onClick={() => onSelect(entry)}
    >
      <div className="name">
        {tx(entry.name, lang)}
        {entry.hint && <small>{tx(entry.hint, lang)}</small>}
      </div>
      <code>{entry.algorithm}</code>
    </div>
  );
}

export default function FormulaSheet() {
  const { lang } = useLang();
  const viewerRef = useRef(null);
  const [selectedId, setSelectedId] = useState(null);

  /** Select a formula: reset the cube, then paint the case state directly
   *  from its dataFl sticker map — same as the formula library. */
  const selectFormula = (entry) => {
    setSelectedId(entry.id);
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.reset();
    viewer.applyDataFl(entry.dataFl);
  };

  /** Play the solving algorithm. If the card wasn't selected yet, select it
   *  first (which paints the case state), then animate the algorithm. */
  const playAlgorithm = (entry) => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    if (selectedId !== entry.id) {
      selectFormula(entry);
    }
    viewer.play(entry.algorithm);
  };

  return (
    <div>
      <h1 className="section-title">{tx({ zh: '公式速查表', en: 'Formula Cheat Sheet' }, lang)}</h1>
      <p className="section-sub">
        {tx(
          {
            zh: '点击卡片选中公式，魔方将直接按 dataFl 预置该公式的初始状态；再点击「播放」观看复原过程。配色：上黄下白，前红后橙，左蓝右绿。',
            en: 'Click a card to select it — the cube is preset to the case state directly via its dataFl colour map. Then click "Play" to watch the solution. Scheme: yellow Up / white Down, red Front / orange Back, blue Left / green Right.',
          },
          lang,
        )}
      </p>

      <CubeViewer ref={viewerRef}>
        {selectedId && (() => {
          const entry = F2L_ENTRIES.find((e) => e.id === selectedId);
          return entry && (
            <>
              <code className="cube-label-overlay">{entry.algorithm}</code>
              <button
                className="cube-play-overlay"
                onClick={() => playAlgorithm(entry)}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                  <polygon points="3,1 12,7 3,13" />
                </svg>
                {tx({ zh: '播放', en: 'Play' }, lang)}
              </button>
            </>
          );
        })()}
      </CubeViewer>

      <div className="formula-grid">
        {F2L_ENTRIES.map((e) => (
          <Card
            key={e.id}
            entry={e}
            lang={lang}
            isSelected={selectedId === e.id}
            onSelect={selectFormula}
          />
        ))}
      </div>
    </div>
  );
}
