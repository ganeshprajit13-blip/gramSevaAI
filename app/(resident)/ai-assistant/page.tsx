'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/components/providers/auth-provider'
import { useLanguage } from '@/components/providers/language-provider'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot, Send, User, Sparkles, RefreshCw, Lightbulb,
  Mic, MicOff, Volume2, VolumeX, Copy, Check, Trash2, Globe
} from 'lucide-react'
import { toast } from 'sonner'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const STARTER_PROMPTS = [
  'What schemes am I eligible for as a farmer in Kinathukadavu?',
  'How do I apply for Kalaignar Magalir Urimai Thittam?',
  'Are there scholarships for students from rural Tamil Nadu?',
  'What documents are needed for PM Kisan Samman Nidhi?',
]

export default function AIAssistantPage() {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const [activeTab, setActiveTab] = useState<'guidance' | 'recommend'>('guidance')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [recommendation, setRecommendation] = useState('')
  const [loadingRec, setLoadingRec] = useState(false)
  
  // Voice states
  const [isListening, setIsListening] = useState(false)
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [voiceLang, setVoiceLang] = useState<'ta-IN' | 'en-IN' | 'hi-IN'>('en-IN')

  const starterPrompts = [
    t('aiStarterPrompt1'),
    t('aiStarterPrompt2'),
    t('aiStarterPrompt3'),
    t('aiStarterPrompt4'),
  ]

  const bottomRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  // Sync voice language with app language
  useEffect(() => {
    if (language === 'ta') {
      setVoiceLang('ta-IN')
    } else {
      setVoiceLang('en-IN')
    }
  }, [language])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  // Stop speech recognition and synthesis on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch {
          // ignore
        }
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // ─── SPEECH RECOGNITION (MIC) ───────────────────────────────────────────────
  const startListening = () => {
    if (typeof window === 'undefined') return

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      toast.error(language === 'ta' ? 'இந்த உலாவியில் குரல் உள்ளீடு ஆதரிக்கப்படவில்லை. Chrome அல்லது Edge-ஐப் பயன்படுத்தவும்.' : 'Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.')
      return
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }

      const recognition = new SpeechRecognition()
      recognitionRef.current = recognition
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = voiceLang

      recognition.onstart = () => {
        setIsListening(true)
        toast.info(
          voiceLang === 'ta-IN'
            ? '🎙️ பேசத் தொடங்குங்கள் (Listening in Tamil)...'
            : '🎙️ Listening... Speak your question now',
          { id: 'mic-active', duration: 3000 }
        )
      }

      recognition.onresult = (event: any) => {
        let transcript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        setInput(transcript)
      }

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error)
        setIsListening(false)
        if (event.error === 'not-allowed') {
          toast.error(t('micPermissionDenied'))
        } else if (event.error !== 'no-speech') {
          toast.error(language === 'ta' ? `குரல் உள்ளீட்டுப் பிழை: ${event.error}` : `Voice error: ${event.error}`)
        }
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()
    } catch (err) {
      console.error('Failed to start speech recognition:', err)
      setIsListening(false)
      toast.error(language === 'ta' ? 'மைக்கை இயக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.' : 'Failed to start microphone. Please try again.')
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        // ignore
      }
      setIsListening(false)
    }
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  // ─── TEXT TO SPEECH (READ ALOUD) ───────────────────────────────────────────
  const speakText = (text: string, index: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast.error(language === 'ta' ? 'இந்த உலாவியில் குரல் வாசிப்பு ஆதரிக்கப்படவில்லை.' : 'Speech synthesis is not supported on this browser.')
      return
    }

    if (speakingIndex === index) {
      window.speechSynthesis.cancel()
      setSpeakingIndex(null)
      return
    }

    window.speechSynthesis.cancel()
    
    // Strip markdown formatting for cleaner speech output
    const cleanText = text
      .replace(/[*#_`>]/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .trim()

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = voiceLang
    utterance.rate = 0.95

    utterance.onend = () => setSpeakingIndex(null)
    utterance.onerror = () => setSpeakingIndex(null)

    setSpeakingIndex(index)
    window.speechSynthesis.speak(utterance)
  }

  // ─── COPY MESSAGE ──────────────────────────────────────────────────────────
  const copyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    toast.success(language === 'ta' ? 'பதில் நகலெடுக்கப்பட்டது' : 'Response copied to clipboard')
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  // ─── CLEAR CHAT ────────────────────────────────────────────────────────────
  const clearChat = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setSpeakingIndex(null)
    setMessages([])
    toast.success(language === 'ta' ? 'உரையாடல் மீட்டமைக்கப்பட்டது' : 'Conversation reset')
  }

  // ─── SEND MESSAGE ──────────────────────────────────────────────────────────
  const sendMessage = async (overridePrompt?: string) => {
    const textToSend = (overridePrompt ?? input).trim()
    if (!textToSend || streaming) return

    if (isListening) {
      stopListening()
    }

    const userMsg: Message = { role: 'user', content: textToSend }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setStreaming(true)

    try {
      const idToken = await user?.getIdToken()
      const res = await fetch('/api/ai/guidance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({ messages: [...messages, userMsg], language }),
      })

      if (!res.ok || !res.body) throw new Error('AI service error')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let aiText = ''
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        aiText += decoder.decode(value)
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: aiText }
          return updated
        })
      }
    } catch {
      toast.error(language === 'ta' ? 'AI சேவை தற்போது பிஸியாக உள்ளது. சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.' : 'AI service temporarily busy. Please retry in a moment.')
    } finally {
      setStreaming(false)
    }
  }

  // ─── RECOMMENDATIONS ───────────────────────────────────────────────────────
  const getRecommendations = async () => {
    setLoadingRec(true)
    setRecommendation('')
    try {
      const idToken = await user?.getIdToken()
      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({ language }),
      })
      if (!res.ok || !res.body) throw new Error()
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let text = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        text += decoder.decode(value)
        setRecommendation(text)
      }
    } catch {
      toast.error(language === 'ta' ? 'AI திட்டப் பரிந்துரை சேவை கிடைக்கவில்லை. மீண்டும் முயற்சிக்கவும்.' : 'AI recommendation service unavailable. Please retry.')
    } finally {
      setLoadingRec(false)
    }
  }

  return (
    <div className="space-y-6 pt-2 lg:pt-0 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="eyebrow flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> {t('aiAssistantTitle')}
          </div>
          <h1 className="page-title text-2xl sm:text-3xl font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Bot className="w-7 h-7 text-primary" /> {language === 'ta' ? 'குடிமக்கள் AI ஆலோசகர்' : 'Citizen AI Advisor'}
          </h1>
          <p className="page-subtitle text-sm text-muted-foreground">
            {t('aiAssistantSubtitle')}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Voice Language Toggle */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-sm text-xs">
            <Globe className="w-3.5 h-3.5 text-muted-foreground ml-1.5" />
            <button
              onClick={() => setVoiceLang('en-IN')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                voiceLang === 'en-IN' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setVoiceLang('ta-IN')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                voiceLang === 'ta-IN' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              தமிழ்
            </button>
          </div>

          {messages.length > 0 && activeTab === 'guidance' && (
            <button
              onClick={clearChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 text-xs font-medium text-slate-600 dark:text-slate-400 transition-all shadow-sm cursor-pointer"
              title={t('reset')}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('reset')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-[20px] border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-sm w-fit">
        {[
          { id: 'guidance', label: t('aiCitizenGuidance'), icon: Bot },
          { id: 'recommend', label: t('aiSchemeRecommender'), icon: Sparkles },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any)
              if (isListening) stopListening()
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'guidance' ? (
          <motion.div
            key="guidance"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="page-shell flex flex-col h-[calc(100vh-290px)] min-h-[540px] border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-sm p-4 sm:p-6"
          >
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
              {messages.length === 0 && (
                <div className="text-center py-8 sm:py-12">
                  <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary/20 to-teal-500/20 border border-primary/30 flex items-center justify-center mx-auto mb-4">
                    <Bot className="w-8 h-8 text-primary" />
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-teal-500 border-2 border-white"></span>
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-1">
                    {t('askMeAnything')}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
                    {t('aiWelcomeDesc')}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xl mx-auto">
                    {starterPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => sendMessage(prompt)}
                        className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:bg-primary/5 text-left text-xs sm:text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-all shadow-xs group cursor-pointer"
                      >
                        <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                        <span>{prompt}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}

                  <div className="max-w-[85%] sm:max-w-[75%] space-y-1.5">
                    <div
                      className={
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground px-4 py-3 rounded-2xl rounded-tr-xs text-sm shadow-sm'
                          : 'bg-slate-100/90 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 px-4 py-3.5 rounded-2xl rounded-tl-xs text-sm shadow-sm'
                      }
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      {msg.role === 'assistant' && streaming && i === messages.length - 1 && (
                        <span className="inline-block w-1.5 h-4 bg-primary animate-pulse ml-1 align-middle" />
                      )}
                    </div>

                    {/* AI Response Tools: Read Aloud & Copy */}
                    {msg.role === 'assistant' && msg.content && !streaming && (
                      <div className="flex items-center gap-2 pl-1">
                        <button
                          onClick={() => speakText(msg.content, i)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                            speakingIndex === i
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-700 dark:text-emerald-300'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50'
                          }`}
                          title={speakingIndex === i ? t('stopVoice') : t('readAloud')}
                        >
                          {speakingIndex === i ? (
                            <>
                              <VolumeX className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              <span>{t('stopVoice')}</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3 text-slate-500" />
                              <span>{t('readAloud')}</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => copyMessage(msg.content, i)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                          title={t('copy')}
                        >
                          {copiedIndex === i ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600">{t('copied')}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-500" />
                              <span>{t('copy')}</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Live Listening Banner */}
            <AnimatePresence>
              {isListening && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center justify-between text-xs text-red-700 dark:text-red-300"
                >
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <span className="font-medium">
                      {t('micListeningBanner')}
                    </span>
                  </div>
                  <button
                    onClick={stopListening}
                    className="font-semibold underline hover:text-red-900 dark:hover:text-red-200 cursor-pointer"
                  >
                    {t('micDoneSpeaking')}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Bar with Mic Button */}
            <div className="mt-3 flex items-center gap-2">
              <div className="relative flex-1 flex items-center">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder={
                    isListening
                      ? t('chatPlaceholderListening')
                      : t('chatPlaceholder')
                  }
                  disabled={streaming}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary disabled:opacity-50 transition-all pr-12 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                />

                {/* Microphone Button (Inside Input Bar) */}
                <button
                  type="button"
                  onClick={toggleListening}
                  disabled={streaming}
                  className={`absolute right-2 p-2 rounded-lg transition-all cursor-pointer ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse shadow-md'
                      : 'text-slate-500 hover:text-primary hover:bg-slate-200/60 dark:hover:bg-slate-700'
                  }`}
                  title={isListening ? t('micDoneSpeaking') : `${t('liveAssistant')} (${voiceLang === 'ta-IN' ? 'தமிழ்' : 'English'})`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>

              {/* Send Button */}
              <button
                onClick={() => sendMessage()}
                disabled={streaming || !input.trim()}
                className="btn-primary px-4 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm cursor-pointer"
                title={t('submit')}
              >
                {streaming ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="recommend"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <div className="page-shell p-6 border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-sm">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">{t('aiRecommendationsTitle')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ta'
                      ? 'உங்கள் சுயவிவரத்தின் அடிப்படையில் AI துல்லியமாக பகுப்பாய்வு செய்து அரசு நலத்திட்டங்களை பரிந்துரைக்கிறது.'
                      : 'Based on your profile — AI analyses your details and suggests matching schemes with actionable next steps'}
                  </p>
                </div>
              </div>
              <button
                onClick={getRecommendations}
                disabled={loadingRec}
                className="btn-primary px-5 py-2.5 rounded-xl disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {loadingRec ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loadingRec ? t('aiAnalysingProfile') : t('aiGetRecommendations')}
              </button>
            </div>

            {recommendation && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="page-shell p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    {t('aiRecommendationsTitle')}
                  </h3>
                  <button
                    onClick={() => speakText(recommendation, 999)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      speakingIndex === 999
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-700 dark:text-emerald-300'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    {speakingIndex === 999 ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{t('stopVoice')}</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>{t('readAloud')}</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="prose prose-sm max-w-none text-slate-800 dark:text-slate-200">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{recommendation}</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
