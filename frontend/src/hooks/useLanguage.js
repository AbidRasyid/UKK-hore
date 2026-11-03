import { useCallback, useState } from 'react';
import { dictionary } from '../utils/dictionary';

export const useLanguage = () => {
  const [lang, setLang] = useState(localStorage.getItem('app_lang') || 'en');

  const toggleLanguage = () => {
  console.log("SEBELUM:", lang);
  const newLang = lang === 'en' ? 'id' : 'en';
  console.log("SESUDAH:", newLang);
  
  setLang(newLang);
  localStorage.setItem('app_lang', newLang);
  window.location.reload();
};

  const t = useCallback(
    (key) => dictionary[lang]?.[key] || dictionary.en[key] || key,
    [lang]
  );

  return { lang, toggleLanguage, toogleLanguage: toggleLanguage, t };
};