'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/components/providers/auth-provider'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Send, User, Sparkles, RefreshCw, Lightbulb } from 'lucide-react'
import { toast } from 'sonner'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const STARTER_PROMPTS = [
  'What schemes am I eligible for as a farmer?',
  'Are there any scholarships for students from OBC community?',
  'What housing schemes are available for low-income families?',
  'Tell me about health insurance schemes for senior citizens.',
]

export default function AIAssistantPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'guidance' | 'recommend'>('guidance')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [recommendation, setRecommendation] = useState('')
  const [loadingRec, setLoadingRec] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  const sendMessage = async () => {
    if (!input.trim() || streaming) return
    const userMsg: Message = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setStreaming(true)

    try {
      const idToken = await user?.getIdToken()
      const res = await fetch('/api/ai/guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
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
      toast.error('AI service unavailable. Please add a GROQ_API_KEY to enable this feature.')
    } finally {
      setStreaming(false)
    }
  }

  const getRecommendations = async () => {
    setLoadingRec(true)
    setRecommendation('')
    try {
      const idToken = await user?.getIdToken()
      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
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
      toast.error('AI service unavailable. Please add a GROQ_API_KEY to enable this feature.')
    } finally {
      setLoadingRec(false)
    }
  }

  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      <div>
        <h1 className="page-title flex items-center gap-2">
          <Bot className="w-7 h-7 text-primary" /> AI Assistant
        </h1>
        <p className="page-subtitle">AI-powered guidance for government schemes and benefits</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-secondary rounded-xl w-fit">
        {[
          { id: 'guidance', label: 'Citizen Guidance', icon: Bot },
          { id: 'recommend', label: 'Scheme Recommender', icon: Sparkles },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-card text-foreground shadow-sm'
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
          <motion.div key="guidance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-[calc(100vh-280px)] min-h-[500px]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
                    <Bot className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Ask me anything</h3>
                  <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
                    Ask about government schemes, eligibility, documents, application process, or anything related to citizen benefits.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
                    {STARTER_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => setInput(prompt)}
                        className="flex items-start gap-2 p-3 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 text-left text-sm transition-all"
                      >
                        <Lightbulb className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-purple-400" />
                    </div>
                  )}
                  <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    {msg.role === 'assistant' && streaming && i === messages.length - 1 && (
                      <span className="inline-block w-1 h-4 bg-current animate-pulse ml-0.5" />
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="mt-4 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ask about any government scheme or benefit…"
                disabled={streaming}
                className="flex-1 px-4 py-3 rounded-xl bg-secondary border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={streaming || !input.trim()}
                className="px-4 py-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="recommend" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold">Personalised Recommendations</h3>
                  <p className="text-sm text-muted-foreground">Based on your profile — AI analyses your details and suggests matching schemes</p>
                </div>
              </div>
              <button
                onClick={getRecommendations}
                disabled={loadingRec}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all disabled:opacity-50 text-sm font-medium"
              >
                {loadingRec ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loadingRec ? 'Analysing your profile…' : 'Get My Recommendations'}
              </button>
            </div>

            {recommendation && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6"
              >
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  AI Recommendations
                </h3>
                <div className="prose prose-sm max-w-none text-foreground">
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
