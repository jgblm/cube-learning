import { createContext, useContext, useState, useCallback } from 'react';

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState('zh');

  const toggle = useCallback(() => {
    setLang((prev) => (prev === 'zh' ? 'en' : 'zh'));
  }, []);

  return (
    <LangContext.Provider value={{ lang, setLang, toggle }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LangProvider');
  return ctx;
}

/**
 * Pick the right-language string from a `{ zh, en }` object.
 * Falls back to zh, then to the raw value if it isn't an object.
 */
export function tx(value, lang) {
  if (value && typeof value === 'object') {
    return value[lang] ?? value.zh ?? '';
  }
  return value ?? '';
}
