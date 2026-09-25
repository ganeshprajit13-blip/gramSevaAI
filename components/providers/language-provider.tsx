'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { translations, TranslationKey, getTranslatedContent } from '@/utils/translations'

export type Language = 'en' | 'ta'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey | string, fallback?: string) => string
  tDynamic: (item: any, field: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    try {
      const saved = (
        localStorage.getItem('gramseva_language') ||
        localStorage.getItem('gramseva-language')
      ) as Language | null

      if (saved === 'en' || saved === 'ta') {
        setLanguageState(saved)
        if (typeof document !== 'undefined') {
          document.documentElement.lang = saved
        }
      } else {
        if (typeof document !== 'undefined') {
          document.documentElement.lang = 'en'
        }
      }
    } catch {
      // ignore localStorage block
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    try {
      localStorage.setItem('gramseva_language', lang)
      localStorage.setItem('gramseva-language', lang)
    } catch {
      // ignore
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang
    }
    window.dispatchEvent(new CustomEvent('gramseva_language_changed', { detail: lang }))
  }

  const t = useCallback(
    (key: TranslationKey | string, fallback?: string): string => {
      const dict = translations[language] || translations.en
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const val = dict[key as TranslationKey] || translations.en[key as TranslationKey]
      if (val) return val
      return fallback || key
    },
    [language]
  )

  const tDynamic = useCallback(
    (item: any, field: string): string => {
      return getTranslatedContent(item, field, language)
    },
    [language]
  )

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tDynamic }}>
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
