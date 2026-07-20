import { NavLink } from 'react-router-dom';
import { useLang } from '../i18n/LangContext.jsx';

const ICONS = {
  home: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 4l9 6.5" />
      <path d="M5 9.5V20h14V9.5" />
    </svg>
  ),
  learn: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5.5A2 2 0 0 1 6 4h9a2 2 0 0 1 2 2v12.5" />
      <path d="M4 5.5A2 2 0 0 0 6 4h1v15H6a2 2 0 0 0-2 1.5z" />
      <path d="M15 6.5h3a2 2 0 0 1 2 2V20" />
    </svg>
  ),
  formulas: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </svg>
  ),
  solver: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 3v4M3 5h4" />
      <path d="M12 3l1.5 3.5L17 8l-3.5 1.5L12 13l-1.5-3.5L7 8l3.5-1.5z" />
      <path d="M18 14l1 2.5L21.5 17 19 18l-1 2.5L17 18l-2.5-1L17 15.5z" />
    </svg>
  ),
};

const NAV = [
  { to: '/', key: 'home', icon: 'home', zh: '首页', en: 'Home' },
  { to: '/learn', key: 'learn', icon: 'learn', zh: '课程', en: 'Lessons' },
  { to: '/formulas', key: 'formulas', icon: 'formulas', zh: '公式', en: 'Formulas' },
  { to: '/solver', key: 'solver', icon: 'solver', zh: '求解', en: 'Solver' },
];

export default function Header() {
  const { lang, toggle } = useLang();

  return (
    <>
      <header className="header">
        <div className="brand">
          <span className="dot" />
          <span>魔方入门到精通</span>
        </div>
        <nav className="top-nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className="nav-link"
            >
              {item[lang]}
            </NavLink>
          ))}
        </nav>
        <button className="lang-toggle" onClick={toggle} title="切换语言 / Switch language">
          {lang === 'zh' ? 'EN' : '中文'}
        </button>
      </header>

      <nav className="bottom-nav" aria-label="主导航">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className="nav-link"
          >
            <span className="icon">{ICONS[item.icon]}</span>
            <span className="label">{item[lang]}</span>
          </NavLink>
        ))}
        <button className="bottom-nav-lang" onClick={toggle} title="切换语言 / Switch language">
          <span className="label">{lang === 'zh' ? 'EN' : '中文'}</span>
        </button>
      </nav>
    </>
  );
}
