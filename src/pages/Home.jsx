import { Link } from 'react-router-dom';
import CubeViewer from '../components/CubeViewer.jsx';
import { useLang, tx } from '../i18n/LangContext.jsx';

const PATHS = [
  {
    to: '/learn',
    badge: 'Lv.1-3',
    title: { zh: '分步课程', en: 'Step-by-Step Lessons' },
    desc: {
      zh: '从认识魔方、转动记号，到层先法、F2L、CFOP，循序渐进学会还原。',
      en: 'From cube anatomy and notation to LBL, F2L and CFOP — learn to solve progressively.',
    },
  },
  {
    to: '/formulas',
    badge: 'OLL/PLL',
    title: { zh: '公式速查', en: 'Formula Cheat Sheet' },
    desc: {
      zh: '两步 OLL 与常用 PLL 公式，带顶面图示，点击即可在魔方上播放。',
      en: 'Two-look OLL and common PLL with diagrams — click to play any algorithm on the cube.',
    },
  },
  {
    to: '/solver',
    badge: 'Demo',
    title: { zh: '自动求解', en: 'Auto-Solve Demo' },
    desc: {
      zh: '一键打乱、一键还原，直观感受魔方如何被「解开」。',
      en: 'Scramble and solve with one click — see the cube get untangled.',
    },
  },
];

export default function Home() {
  const { lang } = useLang();

  return (
    <div>
      <div className="hero">
        <h1>
          {tx({ zh: '魔方入门到精通', en: 'Rubik’s Cube: Beginner to Master' }, lang)}
        </h1>
        <p>
          {tx(
            {
              zh: '一个可交互的 3D 魔方学习站：拖拽旋转观察、分步跟练、公式速查与自动求解演示，带你从第一次还原走向 CFOP 竞速。',
              en: 'An interactive 3D cube learning site: orbit to inspect, follow lessons step by step, look up algorithms, and watch an auto-solve — from your first solve to CFOP speed.',
            },
            lang,
          )}
        </p>
      </div>

      <CubeViewer />

      <h2 className="section-title" style={{ fontSize: 18, marginTop: 26 }}>
        {tx({ zh: '学习路径', en: 'Learning Path' }, lang)}
      </h2>
      <div className="path-grid">
        {PATHS.map((p) => (
          <Link className="path-card" to={p.to} key={p.to}>
            <span className="badge">{p.badge}</span>
            <h3>{tx(p.title, lang)}</h3>
            <p>{tx(p.desc, lang)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
