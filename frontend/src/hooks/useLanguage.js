import { createContext, createElement, useCallback, useContext, useRef, useState } from 'react';
import { dictionary } from '../utils/dictionary';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'en');
  const langRef = useRef(lang);
  langRef.current = lang;

  const toggleLanguage = useCallback(() => {
    setLang((currentLanguage) => {
      const newLanguage = currentLanguage === 'en' ? 'id' : 'en';
      localStorage.setItem('app_lang', newLanguage);
      return newLanguage;
    });
  }, []);

  const t = useCallback(
    (key) => dictionary[langRef.current]?.[key] || dictionary.en[key] || key,
    []
  );

  return createElement(
    LanguageContext.Provider,
    { value: { lang, toggleLanguage, toogleLanguage: toggleLanguage, t } },
    children
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider.');
  return context;
};