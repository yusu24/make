import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import en from '../locales/en.json';
import id from '../locales/id.json';

const I18nContext = createContext();

const dictionaries = {
  en,
  id
};

export const I18nProvider = ({ children }) => {
  // Try to load language from localStorage, default to 'id' (Indonesian)
  const [language, setLanguage] = useState(() => {
    const savedLang = localStorage.getItem('kd_language');
    return savedLang === 'en' || savedLang === 'id' ? savedLang : 'id';
  });

  // Update localStorage when language changes
  useEffect(() => {
    localStorage.setItem('kd_language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'id' ? 'en' : 'id');
  };

  // Helper to get nested object property via dot notation (e.g., 'sidebar.dashboard')
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  // Translation function
  const t = useCallback((key) => {
    const dict = dictionaries[language];
    const value = getNestedValue(dict, key);
    // If not found in current language, fallback to key itself
    return value || key;
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};
