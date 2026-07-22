import { NavLink } from 'react-router-dom';
import { useLang } from '../i18n/LangContext.jsx';
import UserMenu from './UserMenu.jsx';

const ICONS = {
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
  timer: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="13" r="8" />
      <path d="M12 13V9" />
      <path d="M9 2h6" />
      <path d="M19 6l1.5-1.5" />
    </svg>
  ),
};

const NAV = [
  { to: '/learn', key: 'learn', icon: 'learn', zh: '课程', en: 'Lessons' },
  { to: '/formulas', key: 'formulas', icon: 'formulas', zh: '公式', en: 'Formulas' },
  { to: '/timer', key: 'timer', icon: 'timer', zh: '计时', en: 'Timer' },
];

export default function Header() {
  const { lang } = useLang();

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
        <UserMenu />
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
        <UserMenu />
      </nav>
    </>
  );
}
