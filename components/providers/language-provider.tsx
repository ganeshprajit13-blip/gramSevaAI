'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { translations, TranslationKey } from '@/utils/translations'

type Language = 'en' | 'ta' | 'hi'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    const saved = localStorage.getItem('gramseva_language') as Language
    if (saved === 'en' || saved === 'ta' || saved === 'hi') {
      setLanguageState(saved)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('gramseva_language', lang)
  }

  const t = (key: TranslationKey): string => {
    const dict = translations[language] || translations.en
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return dict[key] || translations.en[key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
