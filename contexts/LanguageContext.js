import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDefaultLanguage, translate } from '../utils/translations';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('id');

  useEffect(() => {
    // Set default language based on browser/device
    const defaultLang = getDefaultLanguage();
    setLanguage(defaultLang);
    
    // Save to localStorage for persistence
    const savedLang = localStorage.getItem('preferred-language');
    if (savedLang && (savedLang === 'id' || savedLang === 'en')) {
      setLanguage(savedLang);
    }
  }, []);

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem('preferred-language', newLanguage);
  };

  const t = (key) => translate(key, language);

  const value = {
    language,
    changeLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
