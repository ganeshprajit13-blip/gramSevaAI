'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

export interface UseVoiceSearchOptions {
  language?: 'en' | 'ta'
  onResult?: (transcript: string) => void
  onError?: (error: string) => void
}

export function useVoiceSearch({
  language = 'en',
  onResult,
  onError,
}: UseVoiceSearchOptions = {}) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(true)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)

  // Verify browser speech recognition support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      setIsSupported(!!SR)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch {
          // ignore
        }
      }
    }
  }, [])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        // ignore
      }
    }
    setIsListening(false)
  }, [])

  const startListening = useCallback(
    (overrideLang?: 'en-IN' | 'ta-IN') => {
      if (typeof window === 'undefined') return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

      if (!SpeechRecognition) {
        setIsSupported(false)
        const msg =
          language === 'ta'
            ? 'இந்த உலாவியில் குரல் அங்கீகாரம் ஆதரிக்கப்படவில்லை. Chrome அல்லது Edge-ஐப் பயன்படுத்தவும்.'
            : 'Speech recognition is not supported in this browser. Please use Chrome or Edge.'
        toast.error(msg)
        if (onError) onError(msg)
        return
      }

      // If already listening, stop it
      if (isListening && recognitionRef.current) {
        stopListening()
        return
      }

      try {
        if (recognitionRef.current) {
          recognitionRef.current.abort()
        }

        const recognition = new SpeechRecognition()
        recognitionRef.current = recognition

        const targetLang = overrideLang || (language === 'ta' ? 'ta-IN' : 'en-IN')
        recognition.lang = targetLang
        recognition.continuous = false
        recognition.interimResults = true
        recognition.maxAlternatives = 1

        recognition.onstart = () => {
          setIsListening(true)
          toast.info(
            targetLang === 'ta-IN'
              ? '🎙️ தமிழில் பேசுங்கள்... (Listening in Tamil ta-IN)'
              : '🎙️ Speak now... (Listening in English en-IN)',
            { id: 'voice-active', duration: 3500 }
          )
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
          let currentTranscript = ''
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript
          }
          if (currentTranscript.trim()) {
            setTranscript(currentTranscript)
            if (onResult) {
              onResult(currentTranscript)
            }
          }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onerror = (event: any) => {
          console.warn('Voice search recognition error:', event.error)
          setIsListening(false)

          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            const errorMsg =
              language === 'ta'
                ? 'மைக் அனுமதி மறுக்கப்பட்டது. பிரவுசரின் அமைப்புகளில் மைக் அனுமதியை இயக்கவும்.'
                : 'Microphone permission denied. Please allow microphone access in your browser settings.'
            toast.error(errorMsg)
            if (onError) onError(errorMsg)
          } else if (event.error === 'no-speech') {
            const errorMsg =
              language === 'ta'
                ? 'எந்தக் குரலும் கேட்கவில்லை. மீண்டும் மைக்கை அழுத்திப் பேசவும்.'
                : 'No speech was detected. Please try speaking again.'
            toast.info(errorMsg)
            if (onError) onError(errorMsg)
          } else if (event.error !== 'aborted') {
            const errorMsg =
              language === 'ta'
                ? `குரல் பிழை: ${event.error}`
                : `Voice recognition error: ${event.error}`
            toast.error(errorMsg)
            if (onError) onError(errorMsg)
          }
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognition.start()
      } catch (err) {
        console.error('Failed to start speech recognition:', err)
        setIsListening(false)
        const errorMsg =
          language === 'ta'
            ? 'மைக்கை இயக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.'
            : 'Could not access microphone. Please check permissions.'
        toast.error(errorMsg)
        if (onError) onError(errorMsg)
      }
    },
    [language, isListening, onResult, onError, stopListening]
  )

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, stopListening, startListening])

  return {
    isListening,
    transcript,
    setTranscript,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
  }
}

