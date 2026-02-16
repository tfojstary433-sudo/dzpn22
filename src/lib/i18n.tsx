'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'pl' | 'en';

interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

export const translations: Translations = {
  // Navbar
  'nav.start': { pl: 'Start', en: 'Home' },
  'nav.news': { pl: 'Aktualności', en: 'News' },
  'nav.schedule': { pl: 'Terminarz', en: 'Schedule' },
  'nav.table': { pl: 'Tabela', en: 'Table' },
  'nav.stats': { pl: 'Statystyki', en: 'Stats' },
  'nav.transfers': { pl: 'Transfery', en: 'Transfers' },
  'nav.clubs': { pl: 'Kluby', en: 'Clubs' },
  'nav.tournaments': { pl: 'Turnieje', en: 'Tournaments' },
  'nav.shop': { pl: 'Sklep', en: 'Shop' },
  'nav.about': { pl: 'O nas', en: 'About us' },
  'nav.search_placeholder': { pl: 'Szukaj klubów i zawodników...', en: 'Search clubs and players...' },
  'nav.login_discord': { pl: 'Zaloguj przez Discord', en: 'Login with Discord' },
  'nav.logout': { pl: 'Wyloguj', en: 'Logout' },
  'nav.profile': { pl: 'Mój Profil', en: 'My Profile' },
  
  // Shop Maintenance
  'shop.maintenance_title': { pl: 'SKLEP TYMCZASOWO ZABLOKOWANY', en: 'SHOP TEMPORARILY CLOSED' },
  'shop.maintenance_desc': { 
    pl: 'Przepraszamy, ale sklep jest obecnie niedostępny z powodu prac technicznych. Zapraszamy ponownie wkrótce!', 
    en: 'Sorry, the shop is currently unavailable due to technical maintenance. Please come back soon!' 
  },
  'shop.back_home': { pl: 'Wróć do strony głównej', en: 'Back to home page' },
  'shop.maintenance_banner': { pl: 'Sklep podczas prac technicznych', en: 'Shop under maintenance' },
  
  // General
  'general.loading': { pl: 'Ładowanie...', en: 'Loading...' },
  'general.error': { pl: 'Błąd', en: 'Error' },
  'general.success': { pl: 'Sukces', en: 'Success' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('pl');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && (savedLang === 'pl' || savedLang === 'en')) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation key missing: ${key}`);
      return key;
    }
    return translations[key][language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
