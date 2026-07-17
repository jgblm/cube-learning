import { useRef } from 'react';
import CubeViewer from './CubeViewer.jsx';
import { OLL_2LOOK, PLL_COMMON } from '../cube/algorithms.js';
import { toSequence } from '../cube/moves.js';
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

function Card({ entry, onPlay, lang }) {
  return (
    <div className="formula-card">
      <div className="name">
        {tx(entry.name, lang)}
        {entry.hint && (
          <small>{tx(entry.hint, lang)}</small>
        )}
      </div>
      {entry.pattern && <FaceSVG pattern={entry.pattern} />}
      <code>{entry.algorithm}</code>
      <button className="play-btn" onClick={() => onPlay(entry)}>
        {tx({ zh: '播放', en: 'Play' }, lang)}
      </button>
    </div>
  );
}

export default function FormulaSheet() {
  const { lang } = useLang();
  const viewerRef = useRef(null);

  const play = (entry) => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.reset();
    // Play the explicit setup (the algorithm's real "before" case) from a solved
    // cube, hold so the pattern is visible, then play the algorithm to solve it.
    viewer.play(toSequence(entry.setup));
    viewer.pause(900);
    viewer.play(entry.algorithm);
  };

  return (
    <div>
      <h1 className="section-title">{tx({ zh: '公式速查表', en: 'Formula Cheat Sheet' }, lang)}</h1>
      <p className="section-sub">
        {tx(
          {
            zh: '点击「播放」在魔方上观看公式转动。配色：上白下黄，前绿后蓝，左橙右红。',
            en: 'Click "Play" to watch the algorithm on the cube. Scheme: white Up / yellow Down, green Front / blue Back, orange Left / red Right.',
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

      <CubeViewer ref={viewerRef} />

      <h2 className="section-title" style={{ fontSize: 18, marginTop: 22 }}>
        {tx({ zh: '两步 OLL（顶面翻黄）', en: 'Two-Look OLL (orient top)' }, lang)}
      </h2>
      <div className="formula-grid">
        {OLL_2LOOK.map((e) => (
          <Card key={e.id} entry={e} onPlay={play} lang={lang} />
        ))}
      </div>

      <h2 className="section-title" style={{ fontSize: 18, marginTop: 26 }}>
        {tx({ zh: '常用 PLL（顶层换位）', en: 'Common PLL (permute top)' }, lang)}
      </h2>
      <div className="formula-grid">
        {PLL_COMMON.map((e) => (
          <Card key={e.id} entry={e} onPlay={play} lang={lang} />
        ))}
      </div>
    </div>
  );
}
