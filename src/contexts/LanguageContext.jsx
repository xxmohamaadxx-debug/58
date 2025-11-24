
import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '@/lib/translations';

const LanguageContext = createContext(null);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [locale, setLocale] = useState(() => {
    return localStorage.getItem('locale') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('locale', locale);
    const root = document.documentElement;
    if (locale === 'ar') {
      root.classList.add('rtl');
      root.classList.remove('ltr');
      root.setAttribute('dir', 'rtl');
    } else {
      root.classList.add('ltr');
      root.classList.remove('rtl');
      root.setAttribute('dir', 'ltr');
    }
  }, [locale]);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[locale];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
