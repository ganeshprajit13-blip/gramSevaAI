'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useLanguage } from '@/components/providers/language-provider'
import { toast } from 'sonner'
import { Volume2, VolumeX, Pause, Play, X } from 'lucide-react'

interface ScreenReaderContextType {
  isActive: boolean
  isSpeaking: boolean
  toggleScreenReader: () => void
  speakText: (text: string) => void
  stopSpeaking: () => void
}

const ScreenReaderContext = createContext<ScreenReaderContextType | undefined>(undefined)

export function ScreenReaderProvider({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage()
  const [isActive, setIsActive] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentSpokenText, setCurrentSpokenText] = useState('')
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Clean text for speech
  const cleanSpeechText = (text: string) => {
    return text
      .replace(/[*_#`~[\]()]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
    setCurrentSpokenText('')
  }, [])

  const speakText = useCallback(
    (rawText: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        toast.error(
          language === 'ta'
            ? 'உங்கள் உலாவியில் குரல் வாசிப்பு வசதி இல்லை.'
            : 'Speech synthesis is not supported in this browser.'
        )
        return
      }

      const text = cleanSpeechText(rawText)
      if (!text) return

      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = language === 'ta' ? 'ta-IN' : 'en-IN'
      utterance.rate = language === 'ta' ? 0.95 : 1.0
      utterance.pitch = 1.0

      // Select matching voice if available
      const voices = window.speechSynthesis.getVoices()
      if (language === 'ta') {
        const tamilVoice = voices.find((v) => v.lang.startsWith('ta'))
        if (tamilVoice) utterance.voice = tamilVoice
      } else {
        const enVoice = voices.find((v) => v.lang.startsWith('en-IN') || v.lang.startsWith('en'))
        if (enVoice) utterance.voice = enVoice
      }

      utterance.onstart = () => {
        setIsSpeaking(true)
        setCurrentSpokenText(text.length > 60 ? text.slice(0, 60) + '…' : text)
      }

      utterance.onend = () => {
        setIsSpeaking(false)
        setCurrentSpokenText('')
      }

      utterance.onerror = () => {
        setIsSpeaking(false)
        setCurrentSpokenText('')
      }

      speechRef.current = utterance
      window.speechSynthesis.speak(utterance)
    },
    [language]
  )

  // Read current page overview
  const readPageOverview = useCallback(() => {
    const pageTitle = document.title || 'GramSeva AI Portal'
    const mainHeading = document.querySelector('h1, h2')?.textContent?.trim() || ''

    let intro = ''
    if (language === 'ta') {
      intro = `திரை வாசிப்பு வசதி இயக்கப்பட்டது. நீங்கள் தற்போது இருக்கும் பக்கம்: ${pageTitle}. ${mainHeading ? `தலைப்பு: ${mainHeading}.` : ''} எந்தவொரு பகுதியையும் கிளிக் செய்தால் அது வாசிக்கப்படும்.`
    } else {
      intro = `Screen reader active. Current page: ${pageTitle}. ${mainHeading ? `Heading: ${mainHeading}.` : ''} Click on any text, card, or button to have it read aloud.`
    }

    speakText(intro)
  }, [language, speakText])

  const toggleScreenReader = useCallback(() => {
    if (isActive) {
      stopSpeaking()
      setIsActive(false)
      toast.info(
        language === 'ta'
          ? 'திரை வாசிப்பு வசதி நிறுத்தப்பட்டது.'
          : 'Screen reader mode disabled.'
      )
    } else {
      setIsActive(true)
      toast.success(
        language === 'ta'
          ? 'திரை வாசிப்பு வசதி தொடங்கப்பட்டது. வாசிக்க கிளிக் செய்யவும்.'
          : 'Screen reader enabled. Click or focus any element to hear it.'
      )
      // Announce after state transition
      setTimeout(() => {
        readPageOverview()
      }, 200)
    }
  }, [isActive, language, stopSpeaking, readPageOverview])

  // Global click & focus listener when screen reader mode is active
  useEffect(() => {
    if (!isActive) return

    const handleClickOrFocus = (e: MouseEvent | FocusEvent) => {
      const target = e.target as HTMLElement
      if (!target) return

      // Don't read the screen reader controls itself
      if (target.closest('#screen-reader-hud')) return

      // Find closest readable element
      const readable = target.closest('button, a, h1, h2, h3, h4, h5, p, label, li, [role="button"]') as HTMLElement
      if (readable) {
        const textToRead = readable.innerText || readable.getAttribute('aria-label') || readable.getAttribute('title')
        if (textToRead && textToRead.trim().length > 1) {
          speakText(textToRead)
        }
      }
    }

    document.addEventListener('click', handleClickOrFocus, true)
    document.addEventListener('focusin', handleClickOrFocus, true)

    return () => {
      document.removeEventListener('click', handleClickOrFocus, true)
      document.removeEventListener('focusin', handleClickOrFocus, true)
    }
  }, [isActive, speakText])

  // Stop on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSpeaking) {
        stopSpeaking()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSpeaking, stopSpeaking])

  return (
    <ScreenReaderContext.Provider
      value={{
        isActive,
        isSpeaking,
        toggleScreenReader,
        speakText,
        stopSpeaking,
      }}
    >
      {children}

      {/* Floating HUD when Screen Reader is Active */}
      {isActive && (
        <div
          id="screen-reader-hud"
          className="fixed bottom-5 left-5 z-50 flex items-center gap-3 bg-slate-950/95 text-white border border-teal-500/40 px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-300"
        >
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isSpeaking ? 'bg-emerald-400 animate-ping' : 'bg-teal-400'}`} />
            <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-emerald-400 animate-bounce' : 'text-teal-400'}`} />
            <div className="flex flex-col">
              <span className="text-xs font-black tracking-wide text-teal-300">
                {language === 'ta' ? 'திரை வாசிப்பு செயலில் உள்ளது' : 'Screen Reader Active'}
              </span>
              {currentSpokenText && (
                <span className="text-[10px] text-slate-300 max-w-[200px] sm:max-w-[280px] truncate">
                  {currentSpokenText}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 ml-2 border-l border-slate-700 pl-2">
            {isSpeaking ? (
              <button
                onClick={stopSpeaking}
                className="px-2.5 py-1 bg-red-600/90 hover:bg-red-600 text-white rounded-lg text-[11px] font-extrabold cursor-pointer transition-all flex items-center gap-1"
                title="Stop Audio"
              >
                <Pause className="w-3 h-3" />
                <span>{language === 'ta' ? 'நிறுத்து' : 'Pause'}</span>
              </button>
            ) : (
              <button
                onClick={readPageOverview}
                className="px-2.5 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-[11px] font-extrabold cursor-pointer transition-all flex items-center gap-1"
                title="Read Page Overview"
              >
                <Play className="w-3 h-3" />
                <span>{language === 'ta' ? 'பக்கத்தை வாசி' : 'Read Page'}</span>
              </button>
            )}

            <button
              onClick={toggleScreenReader}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Close Screen Reader"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </ScreenReaderContext.Provider>
  )
}

export function useScreenReader() {
  const context = useContext(ScreenReaderContext)
  if (!context) {
    throw new Error('useScreenReader must be used within a ScreenReaderProvider')
  }
  return context
}
