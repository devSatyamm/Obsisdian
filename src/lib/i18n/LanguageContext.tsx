'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SUPPORTED_LANGUAGES, SupportedLanguageCode, LanguageOption } from './languages';
import { TRANSLATIONS } from './translations';

interface LanguageContextType {
  language: SupportedLanguageCode;
  setLanguage: (lang: SupportedLanguageCode) => void;
  t: (key: string, fallback?: string) => string;
  languagesList: LanguageOption[];
  currentLanguageObj: LanguageOption;
  voiceLang: string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string, fallback?: string) => fallback || key,
  languagesList: SUPPORTED_LANGUAGES,
  currentLanguageObj: SUPPORTED_LANGUAGES[0],
  voiceLang: 'en-IN'
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguageCode>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('verity_lang') as SupportedLanguageCode;
      if (saved && TRANSLATIONS[saved]) {
        setLanguageState(saved);
      }
    } catch {
      // ignore
    }

    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<SupportedLanguageCode>;
      if (customEvent.detail && TRANSLATIONS[customEvent.detail]) {
        setLanguageState(customEvent.detail);
      }
    };

    window.addEventListener('verity_language_changed', handler);
    return () => window.removeEventListener('verity_language_changed', handler);
  }, []);

  const setLanguage = (lang: SupportedLanguageCode) => {
    if (!TRANSLATIONS[lang]) return;
    setLanguageState(lang);
    try {
      localStorage.setItem('verity_lang', lang);
    } catch {
      // ignore
    }
    window.dispatchEvent(new CustomEvent('verity_language_changed', { detail: lang }));
  };

  const t = (key: string, fallback?: string): string => {
    const langDict = TRANSLATIONS[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    const defaultDict = TRANSLATIONS['en'];
    if (defaultDict && defaultDict[key]) {
      return defaultDict[key];
    }
    return fallback || key;
  };

  const currentLanguageObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const voiceLang = currentLanguageObj.voiceLang || 'en-IN';

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        languagesList: SUPPORTED_LANGUAGES,
        currentLanguageObj,
        voiceLang
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
