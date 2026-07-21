import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../i18n/LangContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const ICONS = {
  guest: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  ),
  library: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5.5A2 2 0 0 1 6 4h4a2 2 0 0 1 2 2v12.5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2z" />
      <path d="M10 6.5h4a2 2 0 0 1 2 2v10.5a2 2 0 0 0-2-2h-4" />
      <path d="M16 8.5h2a2 2 0 0 1 2 2v8.5" />
    </svg>
  ),
  lang: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18" />
      <path d="M12 3a14 14 0 0 0 0 18" />
    </svg>
  ),
  login: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <path d="M10 17l5-5-5-5M15 12H3" />
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  ),
};

export default function UserMenu() {
  const { lang, toggle } = useLang();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  const goLibrary = () => {
    close();
    navigate('/library');
  };

  const toggleLang = () => {
    toggle();
    close();
  };

  const onLogout = async () => {
    close();
    await logout();
  };

  const triggerLabel = user
    ? lang === 'zh' ? '设置' : 'Settings'
    : lang === 'zh' ? '未登录' : 'Guest';

  return (
    <div className={`user-menu ${user ? 'is-authed' : 'is-guest'}`} ref={ref}>
      <button
        className="user-menu-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="icon">{user ? ICONS.settings : ICONS.guest}</span>
        <span className="label">{triggerLabel}</span>
      </button>
      {open && (
        <div className="user-menu-dropdown" role="menu">
          {user && (
            <div className="user-menu-header" title={user.username}>
              {user.username}
            </div>
          )}
          <button className="user-menu-item" onClick={goLibrary} role="menuitem">
            <span className="mi-icon">{ICONS.library}</span>
            <span>{lang === 'zh' ? '公式库' : 'Library'}</span>
          </button>
          <button className="user-menu-item" onClick={toggleLang} role="menuitem">
            <span className="mi-icon">{ICONS.lang}</span>
            <span>{lang === 'zh' ? 'English' : '中文'}</span>
          </button>
          {user ? (
            <button className="user-menu-item" onClick={onLogout} role="menuitem">
              <span className="mi-icon">{ICONS.logout}</span>
              <span>{lang === 'zh' ? '退出登录' : 'Logout'}</span>
            </button>
          ) : (
            <button className="user-menu-item" onClick={goLibrary} role="menuitem">
              <span className="mi-icon">{ICONS.login}</span>
              <span>{lang === 'zh' ? '登录' : 'Login'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
