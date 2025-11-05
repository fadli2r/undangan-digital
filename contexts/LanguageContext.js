import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from 'react';
import { getDefaultLanguage, translate } from '../utils/translations';

// Default fallback context
const LanguageContext = createContext(null);

// Hook untuk mengakses context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Provider
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('id');

  useEffect(() => {
    // ⛔ localStorage tidak tersedia saat SSR
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('preferred-language');
      if (savedLang && (savedLang === 'id' || savedLang === 'en')) {
        setLanguage(savedLang);
      } else {
        const defaultLang = getDefaultLanguage();
        setLanguage(defaultLang);
        localStorage.setItem('preferred-language', defaultLang);
      }
    }
  }, []);

  const changeLanguage = (newLang) => {
    if (newLang === 'id' || newLang === 'en') {
      setLanguage(newLang);
      if (typeof window !== 'undefined') {
        localStorage.setItem('preferred-language', newLang);
      }
    }
  };

  const t = (key) => translate(key, language);

  const contextValue = useMemo(() => ({
    language,
    changeLanguage,
    t,
  }), [language]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};
