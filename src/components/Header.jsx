import { NavLink } from 'react-router-dom';
import { useLang } from '../i18n/LangContext.jsx';

const NAV = [
  { to: '/', key: 'home', zh: '首页', en: 'Home' },
  { to: '/learn', key: 'learn', zh: '分步课程', en: 'Lessons' },
  { to: '/formulas', key: 'formulas', zh: '公式速查', en: 'Formulas' },
  { to: '/solver', key: 'solver', zh: '自动求解', en: 'Solver' },
];

export default function Header() {
  const { lang, toggle } = useLang();

  return (
    <header className="header">
      <div className="brand">
        <span className="dot" />
        <span>魔方入门到精通</span>
      </div>
      <nav>
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            {item[lang]}
          </NavLink>
        ))}
      </nav>
      <button className="lang-toggle" onClick={toggle} title="切换语言 / Switch language">
        {lang === 'zh' ? 'EN' : '中文'}
      </button>
    </header>
  );
}
