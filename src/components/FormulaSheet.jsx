import { useRef, useState } from 'react';
import CubeViewer from './CubeViewer.jsx';
import { OLL_2LOOK, PLL_COMMON } from '../cube/algorithms.js';
import { useLang, tx } from '../i18n/LangContext.jsx';

/** Small 3x3 top-face diagram; 1 = yellow sticker. */
function FaceSVG({ pattern }) {
  const cell = 26;
  const gap = 2;
  const size = cell * 3 + gap * 2;
  return (
    <svg className="face-svg" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect x="0" y="0" width={size} height={size} rx="6" fill="#0e1018" />
      {pattern.map((v, i) => {
        const r = Math.floor(i / 3);
        const c = i % 3;
        const x = gap + c * (cell + gap);
        const y = gap + r * (cell + gap);
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={cell}
            height={cell}
            rx="4"
            fill={v ? '#ffd500' : '#2a2f3d'}
            stroke="#0e1018"
            strokeWidth="1"
          />
        );
      })}
    </svg>
  );
}

function Card({ entry, onPlay, lang, isSelected, onSelect }) {
  return (
    <div
      className={`formula-card${isSelected ? ' selected' : ''}`}
      onClick={() => onSelect(entry)}
    >
      <div className="name">
        {tx(entry.name, lang)}
        {entry.hint && (
          <small>{tx(entry.hint, lang)}</small>
        )}
      </div>
      {entry.pattern && <FaceSVG pattern={entry.pattern} />}
      <code>{entry.algorithm}</code>
    </div>
  );
}

export default function FormulaSheet() {
  const { lang } = useLang();
  const viewerRef = useRef(null);
  const [selectedId, setSelectedId] = useState(null);

  /** Select a formula: reset cube, then instantly apply the setup so the cube
   *  shows the "before" case this formula solves — no animation, so the user's
   *  attention is reserved for the Play step. */
  const selectFormula = (entry) => {
    setSelectedId(entry.id);
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.reset();
    viewer.applyInstant(entry.setup);
  };

  /** Play the solving algorithm. If the card wasn't selected yet, select it
   *  first (which applies the setup), then animate the algorithm. */
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
            zh: '点击卡片选中公式，魔方将展示待复原状态；再点击「播放」观看复原过程。配色：上黄下白，前红后橙，左蓝右绿。',
            en: 'Click a card to select it — the cube shows the case to solve. Then click "Play" to watch the solution. Scheme: yellow Up / white Down, red Front / orange Back, blue Left / green Right.',
          },
          lang,
        )}
      </p>

      <div className="note">
        {tx(
          {
            zh: '本表为教学精选集：两步 OLL（约 8 例）+ 常用 PLL（17 例），并非完整 57 OLL / 21 PLL。公式为标准 CFOP，练习时请自行核对。',
            en: 'Curated teaching set: two-look OLL (~8) + common PLL (17), not the full 57 OLL / 21 PLL. Algorithms are standard CFOP — verify against your own practice.',
          },
          lang,
        )}
      </div>

      <CubeViewer ref={viewerRef}>
        {selectedId && (() => {
          const entry = [...OLL_2LOOK, ...PLL_COMMON].find((e) => e.id === selectedId);
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

      <h2 className="section-title" style={{ fontSize: 18, marginTop: 22 }}>
        {tx({ zh: '两步 OLL（顶面翻黄）', en: 'Two-Look OLL (orient top)' }, lang)}
      </h2>
      <div className="formula-grid">
        {OLL_2LOOK.map((e) => (
          <Card
            key={e.id}
            entry={e}
            onPlay={playAlgorithm}
            lang={lang}
            isSelected={selectedId === e.id}
            onSelect={selectFormula}
          />
        ))}
      </div>

      <h2 className="section-title" style={{ fontSize: 18, marginTop: 26 }}>
        {tx({ zh: '常用 PLL（顶层换位）', en: 'Common PLL (permute top)' }, lang)}
      </h2>
      <div className="formula-grid">
        {PLL_COMMON.map((e) => (
          <Card
            key={e.id}
            entry={e}
            onPlay={playAlgorithm}
            lang={lang}
            isSelected={selectedId === e.id}
            onSelect={selectFormula}
          />
        ))}
      </div>
    </div>
  );
}
