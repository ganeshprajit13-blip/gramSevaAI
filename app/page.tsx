'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import { useLanguage } from '@/components/providers/language-provider'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, ChevronRight, ChevronLeft, FileText, Coins, Users, MapPin, 
  Landmark, Droplet, Zap, Award, Leaf, HeartPulse, GraduationCap, 
  Bot, Sparkles, Clock, Phone, ExternalLink, ShieldAlert, Globe, 
  Calendar, ShieldCheck, Volume2, Type, CircleUserRound, X, Mic, MicOff,
  ArrowRight, Sparkle, Heart, Layers, AlertCircle
} from 'lucide-react'
import { getStoredAnnouncements, type AnnouncementRecord } from '@/lib/announcement-store'
import { getLatestSchemes, type SchemeRecord } from '@/lib/scheme-store'
import { getLatestServices, type ServiceRecord } from '@/lib/service-store'

// ─── Quick Stats Data ─────────────────────────────────────────────────────────
const STAT_CARDS = [
  { labelKey: 'Govt Schemes', count: 128, suffix: '+', icon: FileText, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-950/40' },
  { labelKey: 'Women Beneficiaries', count: 850, suffix: '+', icon: Heart, color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-950/40' },
  { labelKey: 'Farmers Registered', count: 620, suffix: '+', icon: Leaf, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
  { labelKey: 'Certificates Issued', count: 1450, suffix: '+', icon: Award, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40' },
] as const

// ─── Animated Number Counter ───────────────────────────────────────────────────
function AnimatedCount({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const duration = 1400 // ms
    const step = Math.max(1, Math.ceil(target / (duration / 20)))
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, 20)
    return () => clearInterval(timer)
  }, [target])

  return <span>{count.toLocaleString()}{suffix}</span>
}

type UserPersona = 'All' | 'Women' | 'Farmers' | 'Students' | 'Senior Citizens' | 'Job Seekers'

export default function HomePage() {
  const { user, profile } = useAuth()
  const { t, language, setLanguage } = useLanguage()
  const router = useRouter()

  // Data Stores State
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([])
  const [latestSchemes, setLatestSchemes] = useState<SchemeRecord[]>([])
  const [latestServices, setLatestServices] = useState<ServiceRecord[]>([])

  // Loading States
  const [loadingPosters, setLoadingPosters] = useState(true)
  const [loadingSchemes, setLoadingSchemes] = useState(true)
  const [loadingServices, setLoadingServices] = useState(true)

  // Interactive UI States
  const [searchVal, setSearchVal] = useState('')
  const [activePersona, setActivePersona] = useState<UserPersona>('All')
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementRecord | null>(null)
  const [selectedSchemeModal, setSelectedSchemeModal] = useState<SchemeRecord | null>(null)
  const [selectedServiceModal, setSelectedServiceModal] = useState<ServiceRecord | null>(null)

  // Poster Carousel Controls
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Voice & AI Suggestions
  const [isListening, setIsListening] = useState(false)
  const [showAiPrompts, setShowAiPrompts] = useState(false)
  const [textSize, setTextSizeState] = useState<'sm' | 'md' | 'lg'>('md')
  const [profileOpen, setProfileOpen] = useState(false)

  // Load All Stores & Cache for Dashboard Preview
  useEffect(() => {
    const fetchAllData = () => {
      // Announcements
      const ancItems = getStoredAnnouncements().filter(i => i.isActive !== false && i.status !== 'Draft')
      ancItems.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
      setAnnouncements(ancItems)
      setLoadingPosters(false)

      // Latest 4 Schemes (createdAt DESC, isActive = true)
      const schemesData = getLatestSchemes(4)
      setLatestSchemes(schemesData)
      setLoadingSchemes(false)

      // Latest 4 Village Services (createdAt DESC, isActive = true)
      const servicesData = getLatestServices(4)
      setLatestServices(servicesData)
      setLoadingServices(false)
    }

    fetchAllData()

    const handleUpdate = () => fetchAllData()
    window.addEventListener('gramseva_announcements_updated', handleUpdate)
    window.addEventListener('gramseva_scheme_db_updated', handleUpdate)
    window.addEventListener('gramseva_services_db_updated', handleUpdate)
    return () => {
      window.removeEventListener('gramseva_announcements_updated', handleUpdate)
      window.removeEventListener('gramseva_scheme_db_updated', handleUpdate)
      window.removeEventListener('gramseva_services_db_updated', handleUpdate)
    }
  }, [])

  // Auto detect user profile persona
  useEffect(() => {
    if (profile) {
      if (profile.gender === 'Female') setActivePersona('Women')
      else if (profile.farmer_status) setActivePersona('Farmers')
      else if (profile.occupation?.toLowerCase().includes('student')) setActivePersona('Students')
      else if ((profile.age ?? 0) >= 60) setActivePersona('Senior Citizens')
    }
  }, [profile])

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedAnnouncement(null)
        setSelectedSchemeModal(null)
        setSelectedServiceModal(null)
        setShowAiPrompts(false)
        setIsListening(false)
        setProfileOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Font sizer
  const applyTextSize = (size: 'sm' | 'md' | 'lg') => {
    setTextSizeState(size)
    if (typeof window === 'undefined') return
    const root = document.documentElement
    if (size === 'sm') root.style.fontSize = '14px'
    else if (size === 'lg') root.style.fontSize = '18px'
    else root.style.fontSize = '16px'
  }

  // Filtered Announcements with AI Personalization
  const filteredAnnouncements = useMemo(() => {
    let items = [...announcements]

    if (searchVal.trim()) {
      const q = searchVal.toLowerCase()
      items = items.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          (a.type && a.type.toLowerCase().includes(q))
      )
    }

    if (activePersona !== 'All') {
      const targetTypeMap: Record<UserPersona, string[]> = {
        'All': [],
        'Women': ['women'],
        'Farmers': ['farmer'],
        'Students': ['scheme', 'general'],
        'Senior Citizens': ['health'],
        'Job Seekers': ['scheme', 'campaign'],
      }
      const matchTypes = targetTypeMap[activePersona] || []
      items.sort((a, b) => {
        const aMatch = matchTypes.includes(a.type) ? 1 : 0
        const bMatch = matchTypes.includes(b.type) ? 1 : 0
        if (aMatch !== bMatch) return bMatch - aMatch
        return (b.priority ?? 0) - (a.priority ?? 0)
      })
    }

    return items
  }, [announcements, searchVal, activePersona])

  const totalPages = Math.max(1, Math.ceil(filteredAnnouncements.length / 4))

  // Poster Grid Auto Slider (6-8s)
  useEffect(() => {
    if (isPaused || totalPages <= 1) return
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % totalPages)
    }, 7000)
    return () => clearInterval(timer)
  }, [isPaused, totalPages])

  const currentPosterGrid = useMemo(() => {
    const start = carouselIndex * 4
    const slice = filteredAnnouncements.slice(start, start + 4)
    if (slice.length < 4 && announcements.length > 0) {
      const pad = announcements.slice(0, 4 - slice.length)
      return [...slice, ...pad]
    }
    return slice
  }, [carouselIndex, filteredAnnouncements, announcements])

  // Voice Search Handler
  const toggleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice recognition listening active...')
      setIsListening(true)
      setTimeout(() => {
        setSearchVal('PM Kisan Subsidy')
        setIsListening(false)
      }, 2500)
      return
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.lang = language === 'ta' ? 'ta-IN' : 'en-US'
      recognition.start()
      setIsListening(true)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setSearchVal(transcript)
        setIsListening(false)
      }
      recognition.onerror = () => setIsListening(false)
      recognition.onend = () => setIsListening(false)
    } catch {
      setIsListening(false)
    }
  }

  // Filtered 4 Schemes for Search Override
  const displayedSchemes = useMemo(() => {
    if (!searchVal.trim()) return latestSchemes.slice(0, 4)
    const q = searchVal.toLowerCase()
    return latestSchemes.filter(s =>
      s.title.toLowerCase().includes(q) ||
      (s.name && s.name.toLowerCase().includes(q)) ||
      s.description.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    ).slice(0, 4)
  }, [latestSchemes, searchVal])

  // Filtered 4 Services for Search Override
  const displayedServices = useMemo(() => {
    if (!searchVal.trim()) return latestServices.slice(0, 4)
    const q = searchVal.toLowerCase()
    return latestServices.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q)
    ).slice(0, 4)
  }, [latestServices, searchVal])

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-[#0F766E] selection:text-white">
      
      {/* ── TOP TRICOLOR & ACCESSIBILITY HEADER ── */}
      <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-xs backdrop-blur-md">
        {/* Tricolor Strip */}
        <div className="w-full h-1 flex">
          <div className="flex-1 bg-[#FF9933]" />
          <div className="flex-1 bg-white dark:bg-slate-800" />
          <div className="flex-1 bg-[#138808]" />
        </div>

        {/* Accessibility Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
            <span className="uppercase tracking-wider font-bold hidden sm:inline text-slate-800 dark:text-slate-200">
              Government of Tamil Nadu • Rural Development &amp; Panchayat Raj
            </span>
            <span className="sm:hidden font-extrabold text-[#0F766E]">
              {language === 'en' ? 'Govt of TN • GramSeva AI' : 'தமிழ்நாடு அரசு • கிராமசேவா'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => alert('Screen reader utility active.')}
              className="h-8 hidden md:flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-[#0F766E] px-3 gap-1.5 transition-all text-xs font-semibold cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{t('screenReader')}</span>
            </button>

            {/* Font Sizer */}
            <div className="h-8 flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-1 border border-slate-200 dark:border-slate-700">
              <Type className="w-3.5 h-3.5 text-slate-400 mx-1.5" />
              <button onClick={() => applyTextSize('sm')} className={`h-6 px-2 rounded-full text-[10px] font-extrabold transition-all cursor-pointer ${textSize === 'sm' ? 'bg-[#0F766E] text-white' : 'text-slate-600 dark:text-slate-300'}`}>A-</button>
              <button onClick={() => applyTextSize('md')} className={`h-6 px-2 rounded-full text-[10px] font-extrabold transition-all cursor-pointer ${textSize === 'md' ? 'bg-[#0F766E] text-white' : 'text-slate-600 dark:text-slate-300'}`}>A</button>
              <button onClick={() => applyTextSize('lg')} className={`h-6 px-2 rounded-full text-[10px] font-extrabold transition-all cursor-pointer ${textSize === 'lg' ? 'bg-[#0F766E] text-white' : 'text-slate-600 dark:text-slate-300'}`}>A+</button>
            </div>

            {/* Language Selector */}
            <div className="h-8 flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-1 border border-slate-200 dark:border-slate-700">
              <button onClick={() => setLanguage('en')} className={`h-6 px-3 rounded-full text-[10px] font-extrabold transition-all cursor-pointer ${language === 'en' ? 'bg-[#0F766E] text-white' : 'text-slate-600 dark:text-slate-300'}`}>EN</button>
              <button onClick={() => setLanguage('ta')} className={`h-6 px-3 rounded-full text-[10px] font-extrabold transition-all cursor-pointer ${language === 'ta' ? 'bg-[#0F766E] text-white' : 'text-slate-600 dark:text-slate-300'}`}>தமிழ்</button>
            </div>
          </div>
        </div>

        {/* Main Branding Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/tn-emblem.svg" alt="TN Crest Emblem" className="w-10 h-10 object-contain transition-transform group-hover:scale-105" />
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-base text-[#0F766E] dark:text-teal-400 tracking-tight leading-none">
                  GramSeva <span className="text-[#16A34A]">AI</span>
                </h1>
                <span className="text-[9px] font-black uppercase bg-teal-100 dark:bg-teal-900/50 text-[#0F766E] dark:text-teal-300 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                  Govt Portal
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Digital India Citizen Services
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center gap-7 text-xs font-bold text-slate-600 dark:text-slate-300">
            <Link href="/" className="hover:text-[#0F766E] transition-colors">Home</Link>
            <a href="#schemes" className="hover:text-[#0F766E] transition-colors">Latest Schemes</a>
            <a href="#services" className="hover:text-[#0F766E] transition-colors">Village Services</a>
            <a href="#announcements" className="hover:text-[#0F766E] transition-colors">Announcements</a>
            <Link href={user ? "/ai-assistant" : "/login"} className="hover:text-[#0F766E] transition-colors flex items-center gap-1">
              <Bot className="w-3.5 h-3.5 text-purple-500" /> GramSeva AI
            </Link>
          </div>

          {/* User Profile & Action */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href={profile?.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                className="px-4 py-2 bg-[#0F766E] hover:bg-[#0d645e] text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>{profile?.role === 'admin' ? 'BDO Portal' : 'My Dashboard'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-[#0F766E] hover:bg-[#0d645e] text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                {language === 'en' ? 'Citizen Login' : 'உள்நுழை'}
              </Link>
            )}

            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-[#0F766E] flex items-center justify-center transition-all cursor-pointer"
              >
                <CircleUserRound className="w-5 h-5" />
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 text-xs font-semibold"
                  >
                    {user ? (
                      <>
                        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                          <p className="text-[10px] text-slate-400 uppercase font-bold">Logged In</p>
                          <p className="font-extrabold truncate">{profile?.name || user.email}</p>
                        </div>
                        <Link href={profile?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} onClick={() => setProfileOpen(false)} className="block px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">Dashboard</Link>
                        <Link href="/profile" onClick={() => setProfileOpen(false)} className="block px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">My Profile</Link>
                      </>
                    ) : (
                      <>
                        <Link href="/login" onClick={() => setProfileOpen(false)} className="block px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">Resident Login</Link>
                        <Link href="/login" onClick={() => setProfileOpen(false)} className="block px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">Register Account</Link>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* ── SEARCH BAR SECTION (PLACED ABOVE HERO SECTION) ── */}
      <div className="w-full bg-[#EAF8EF] dark:bg-slate-900/80 border-b border-teal-100 dark:border-teal-950 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-2">
          
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-[#0F766E] dark:text-teal-400 pointer-events-none" />
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search Government Schemes..."
              className="w-full pl-12 pr-28 py-3.5 text-sm sm:text-base rounded-2xl bg-white dark:bg-slate-950 border-2 border-teal-600/30 dark:border-teal-500/40 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#0F766E] dark:focus:border-teal-400 shadow-md transition-all font-medium"
            />

            <div className="absolute right-3 flex items-center gap-2">
              <button
                onClick={toggleVoiceSearch}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse border-red-600'
                    : 'bg-teal-50 dark:bg-teal-950 text-[#0F766E] dark:text-teal-300 border-teal-200 dark:border-teal-800 hover:bg-teal-100'
                }`}
                title="Voice Search"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setShowAiPrompts(!showAiPrompts)}
                className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition-all cursor-pointer flex items-center gap-1"
                title="AI Scheme Recommendations"
              >
                <Sparkles className="w-4 h-4 animate-pulse" />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showAiPrompts && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900 p-4 rounded-2xl shadow-xl space-y-2 text-xs"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="font-extrabold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                    <Bot className="w-4 h-4" /> GramSeva AI Quick Recommendations
                  </span>
                  <button onClick={() => setShowAiPrompts(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    { label: '🌾 Small Farmer Subsidies', query: 'PM Kisan' },
                    { label: '👩 Women SHG Aid & Direct Benefit', query: 'Women' },
                    { label: '🎓 Scholarships for 10th & 12th', query: 'Scholarship' },
                    { label: '🏠 PM Awas Yojana Housing', query: 'Awas' },
                    { label: '👴 Senior Citizen Pension', query: 'Pension' },
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setSearchVal(item.query); setShowAiPrompts(false); }}
                      className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300 font-semibold hover:bg-purple-600 hover:text-white transition-all cursor-pointer"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── HERO BANNER ── */}
      <section className="w-full relative overflow-hidden bg-gradient-to-br from-[#EAF8EF] via-[#F3FAF5] to-[#F9FCFA] dark:from-slate-900 dark:via-teal-950/40 dark:to-slate-950 border-b border-teal-100 dark:border-slate-800 py-10 sm:py-14">
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-stretch justify-between gap-8 lg:gap-12">
            
            {/* Left Side (55% Desktop) */}
            <div className="w-full lg:w-[55%] flex flex-col justify-between space-y-6">
              
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#0F766E]/10 dark:bg-teal-400/10 text-[#0F766E] dark:text-teal-300 border border-[#0F766E]/20 text-xs font-extrabold uppercase tracking-wider">
                    <Sparkle className="w-3.5 h-3.5 text-[#16A34A]" /> GramSeva AI Official Citizen Portal
                  </span>
                  {user && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
                      ✨ AI Personalized for {profile?.occupation || activePersona}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4.5xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
                  Welcome to <span className="text-[#0F766E] dark:text-teal-400">GramSeva</span> <span className="text-[#16A34A]">AI</span>
                </h1>

                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-xl">
                  One Platform for Every Government Scheme, Village Service &amp; Citizen Support
                </p>

                <div className="pt-2">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    AI Personalization Category:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(['All', 'Women', 'Farmers', 'Students', 'Senior Citizens', 'Job Seekers'] as UserPersona[]).map((persona) => (
                      <button
                        key={persona}
                        onClick={() => setActivePersona(persona)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          activePersona === persona
                            ? 'bg-[#0F766E] text-white shadow-md'
                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-[#0F766E]'
                        }`}
                      >
                        {persona === 'Women' && '👩 '}
                        {persona === 'Farmers' && '🌾 '}
                        {persona === 'Students' && '🎓 '}
                        {persona === 'Senior Citizens' && '👴 '}
                        {persona === 'Job Seekers' && '💼 '}
                        {persona}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Glass Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#schemes"
                  className="px-6 py-3.5 rounded-2xl text-sm font-extrabold transition-all duration-300 cursor-pointer shadow-lg backdrop-blur-md bg-white/40 dark:bg-slate-900/60 text-[#0F766E] dark:text-teal-300 border-2 border-white/60 dark:border-teal-500/40 hover:bg-white/70 dark:hover:bg-slate-900/90 hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <span>Find Schemes For You</span>
                  <ChevronRight className="w-4 h-4" />
                </a>

                <a
                  href="#services"
                  className="px-6 py-3.5 rounded-2xl text-sm font-extrabold transition-all duration-300 cursor-pointer shadow-md backdrop-blur-md bg-teal-900/10 dark:bg-white/10 text-slate-900 dark:text-white border border-teal-800/20 dark:border-white/20 hover:bg-teal-900/20 hover:shadow-lg flex items-center gap-2"
                >
                  <span>Explore Services</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Right Side (45% Desktop: 2x2 Grid Poster Carousel) */}
            <div className="w-full lg:w-[45%] flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-ping" />
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#0F766E] dark:text-teal-400">
                    Active Government Posters
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCarouselIndex((prev) => (prev - 1 + totalPages) % totalPages)}
                    className="p-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-[#0F766E] hover:text-white transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-slate-500">{carouselIndex + 1} / {totalPages}</span>
                  <button
                    onClick={() => setCarouselIndex((prev) => (prev + 1) % totalPages)}
                    className="p-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-[#0F766E] hover:text-white transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                className="relative min-h-[340px] w-full"
              >
                {loadingPosters ? (
                  <div className="grid grid-cols-2 gap-3.5">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-40 rounded-[18px] bg-slate-200 dark:bg-slate-800 animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={carouselIndex}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.4 }}
                      className="grid grid-cols-2 gap-3.5"
                    >
                      {currentPosterGrid.map((poster) => (
                        <motion.div
                          key={poster.id}
                          whileHover={{ y: -4 }}
                          onClick={() => setSelectedAnnouncement(poster)}
                          className="group relative h-40 sm:h-44 rounded-[18px] overflow-hidden shadow-md border border-slate-200 dark:border-slate-800 bg-slate-900 cursor-pointer"
                        >
                          <img
                            src={poster.image}
                            alt={poster.title}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent p-3 flex flex-col justify-between" />
                          <div className="relative z-10 flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded-md bg-[#0F766E] text-white text-[9px] font-extrabold uppercase tracking-wider shadow-xs">
                              {poster.type || 'Notice'}
                            </span>
                          </div>
                          <div className="relative z-10 space-y-0.5">
                            <h4 className="text-xs font-bold text-white leading-tight line-clamp-2 group-hover:text-teal-300 transition-colors">
                              {poster.title}
                            </h4>
                            <p className="text-[10px] text-slate-300 line-clamp-1 font-medium">
                              {poster.startDate || poster.date}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── QUICK STATS ── */}
      <section className="w-full py-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {STAT_CARDS.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="bg-white dark:bg-slate-950 p-5 rounded-[18px] border border-slate-200/80 dark:border-slate-800 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center gap-4"
              >
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    <AnimatedCount target={stat.count} suffix={stat.suffix} />
                  </p>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                    {stat.labelKey}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 1: LATEST GOVERNMENT SCHEMES (EXACTLY 4 CARDS, RESPONSIVE 4/2/1 GRID) ── */}
      <section id="schemes" className="w-full py-12 bg-[#F8FAFC] dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-[#0F766E]" />
                <h2 className="text-xl sm:text-2.5xl font-black text-slate-900 dark:text-white tracking-tight">
                  Latest Government Schemes
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Newly published welfare schemes, subsidies, and financial assistance programs
              </p>
            </div>
          </div>

          {/* Cards Grid / Skeleton / Empty State */}
          {loadingSchemes ? (
            /* Skeleton loaders */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-72 rounded-[18px] bg-slate-200 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : displayedSchemes.length === 0 ? (
            /* Empty State */
            <div className="py-14 text-center space-y-4 bg-white dark:bg-slate-900 rounded-[18px] border border-slate-200 dark:border-slate-800 shadow-sm">
              <Award className="w-12 h-12 text-slate-400 mx-auto" />
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">No Government Schemes Available</h3>
                <p className="text-xs text-slate-500 mt-1">Check back soon for new state &amp; central scheme publications.</p>
              </div>
              <button
                onClick={() => router.push('/schemes')}
                className="px-5 py-2.5 bg-[#0F766E] text-white text-xs font-extrabold rounded-xl shadow-md cursor-pointer"
              >
                Browse Schemes
              </button>
            </div>
          ) : (
            /* 4 Scheme Cards Grid (Desktop 4, Tablet 2, Mobile 1) */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayedSchemes.map((scheme) => (
                <motion.div
                  key={scheme.id}
                  whileHover={{ y: -6 }}
                  onClick={() => setSelectedSchemeModal(scheme)}
                  className="bg-white dark:bg-slate-900 rounded-[18px] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    {/* Large Scheme Poster Banner (16:9 aspect ratio) */}
                    <div className="aspect-[16/9] w-full relative overflow-hidden bg-slate-950">
                      <img
                        src={scheme.media?.poster_url || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80'}
                        alt={scheme.title || scheme.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-md bg-[#16A34A] text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                          {scheme.category}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                        <span className="uppercase">{scheme.type || 'Government Scheme'}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#0F766E]" />
                          {scheme.launch_date || 'Active'}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug line-clamp-1 group-hover:text-[#0F766E] transition-colors">
                        {scheme.title || scheme.name}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 font-medium">
                        {scheme.description}
                      </p>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="p-5 pt-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedSchemeModal(scheme)
                      }}
                      className="w-full py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-[#0F766E] hover:text-white text-slate-800 dark:text-slate-200 rounded-xl text-xs font-extrabold transition-all cursor-pointer text-center"
                    >
                      View Details
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Centered Bottom Button */}
          <div className="flex items-center justify-center pt-2">
            <button
              onClick={() => router.push('/schemes')}
              className="px-6 py-3 bg-[#0F766E] hover:bg-[#0d645e] text-white rounded-2xl text-xs font-extrabold shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 cursor-pointer"
            >
              <span>View All Government Schemes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: LATEST VILLAGE SERVICES (TITLE: VILLAGE SERVICES, EXACTLY 4 CARDS) ── */}
      <section id="services" className="w-full py-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Landmark className="w-6 h-6 text-[#0F766E]" />
                <h2 className="text-xl sm:text-2.5xl font-black text-slate-900 dark:text-white tracking-tight">
                  Village Services
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Official village certificates, revenue patta transfers, and household utility applications
              </p>
            </div>
          </div>

          {/* Cards Grid / Skeleton / Empty State */}
          {loadingServices ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-72 rounded-[18px] bg-slate-200 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : displayedServices.length === 0 ? (
            <div className="py-14 text-center space-y-4 bg-[#F8FAFC] dark:bg-slate-950 rounded-[18px] border border-slate-200 dark:border-slate-800 shadow-sm">
              <Landmark className="w-12 h-12 text-slate-400 mx-auto" />
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">No Village Services Available</h3>
                <p className="text-xs text-slate-500 mt-1">Explore our complete catalog of e-Sevai village digital services.</p>
              </div>
              <button
                onClick={() => router.push('/services')}
                className="px-5 py-2.5 bg-[#0F766E] text-white text-xs font-extrabold rounded-xl shadow-md cursor-pointer"
              >
                Explore Services
              </button>
            </div>
          ) : (
            /* 4 Service Cards Grid (Desktop 4, Tablet 2, Mobile 1) */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayedServices.map((svc) => (
                <motion.div
                  key={svc.id}
                  whileHover={{ y: -6 }}
                  onClick={() => setSelectedServiceModal(svc)}
                  className="bg-white dark:bg-slate-950 rounded-[18px] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    {/* Large Poster Image (16:9 aspect ratio) */}
                    <div className="aspect-[16/9] w-full relative overflow-hidden bg-slate-950">
                      <img
                        src={svc.image}
                        alt={svc.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider shadow-xs ${
                          svc.status === 'New' ? 'bg-[#16A34A] text-white' : 'bg-[#0F766E] text-white'
                        }`}>
                          {svc.status}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-2">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        {svc.department}
                      </span>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug line-clamp-1 group-hover:text-[#0F766E] transition-colors">
                        {svc.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 font-medium">
                        {svc.description}
                      </p>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="p-5 pt-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedServiceModal(svc)
                      }}
                      className="w-full py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-[#0F766E] hover:text-white text-slate-800 dark:text-slate-200 rounded-xl text-xs font-extrabold transition-all cursor-pointer text-center"
                    >
                      Learn More
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Centered Bottom Button */}
          <div className="flex items-center justify-center pt-2">
            <button
              onClick={() => router.push('/services')}
              className="px-6 py-3 bg-[#0F766E] hover:bg-[#0d645e] text-white rounded-2xl text-xs font-extrabold shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 cursor-pointer"
            >
              <span>View All Services</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ── ANNOUNCEMENTS CAROUSEL FEED ── */}
      <section id="announcements" className="w-full py-12 bg-[#F8FAFC] dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#0F766E]" />
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Village Announcements &amp; Circulars
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Gram Sabha meetings, health camps, and Panchayat notices
              </p>
            </div>
            
            <button
              onClick={() => setSelectedAnnouncement(announcements[0])}
              className="text-xs font-extrabold text-[#0F766E] hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <span>View All Circulars</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex gap-5 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x snap-mandatory">
            {announcements.map((anc) => (
              <motion.div
                key={anc.id}
                whileHover={{ y: -5 }}
                onClick={() => setSelectedAnnouncement(anc)}
                className="snap-start min-w-[280px] sm:min-w-[320px] max-w-[320px] bg-white dark:bg-slate-900 rounded-[18px] overflow-hidden shadow-md hover:shadow-xl border border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div className="h-40 relative overflow-hidden bg-slate-800">
                    <img
                      src={anc.image}
                      alt={anc.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-md bg-[#0F766E] text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                        {anc.type || 'Notice'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#16A34A]" />
                        {anc.startDate || anc.date}
                      </span>
                      <span>Priority #{anc.priority ?? 5}</span>
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-[#0F766E] transition-colors">
                      {anc.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {anc.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button className="w-full py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-[#0F766E] hover:text-white text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer text-center">
                    Read More &amp; Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI ASSISTANT SECTION ── */}
      <section className="w-full py-12 bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold">
                <Bot className="w-4 h-4 text-purple-400 animate-pulse" /> GramSeva AI Voice &amp; Chat Assistant
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Have Questions About Scheme Eligibility? Ask GramSeva AI!
              </h2>
              <p className="text-xs sm:text-sm text-purple-200 max-w-2xl leading-relaxed">
                Get instant multi-lingual guidance in Tamil or English regarding government subsidies, land patta documents, and pension criteria.
              </p>
            </div>

            <Link
              href={user ? "/ai-assistant" : "/login"}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap self-start md:self-auto"
            >
              <span>Start AI Conversation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── EMERGENCY CONTACT HELPLINES ── */}
      <section id="emergency" className="w-full py-10 bg-red-50 dark:bg-red-950/20 border-b border-red-200 dark:border-red-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-600 dark:text-red-400" />
            <div>
              <h2 className="text-lg font-black text-red-700 dark:text-red-300">
                24/7 Government Emergency Helplines
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Immediate toll-free contacts for police, medical, fire, and disaster assistance
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-[18px] border border-red-200 dark:border-red-900/60 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500">Police Emergency</p>
                <p className="text-xl font-black text-red-600">100</p>
              </div>
              <a href="tel:100" className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer">Call 100</a>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-[18px] border border-red-200 dark:border-red-900/60 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500">Fire &amp; Rescue</p>
                <p className="text-xl font-black text-red-600">101</p>
              </div>
              <a href="tel:101" className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer">Call 101</a>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-[18px] border border-red-200 dark:border-red-900/60 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500">Ambulance Service</p>
                <p className="text-xl font-black text-red-600">108</p>
              </div>
              <a href="tel:108" className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer">Call 108</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="w-full bg-slate-950 text-slate-300 py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img src="/tn-emblem.svg" alt="TN Crest" className="w-8 h-8 object-contain invert brightness-200" />
                <div>
                  <h4 className="font-extrabold text-sm text-white">GramSeva AI Citizen Portal</h4>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Govt of Tamil Nadu</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Empowering rural citizens with direct access to welfare schemes, e-Sevai certificates, and AI-driven eligibility verification.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <h5 className="font-extrabold text-white uppercase text-[11px] tracking-wider">Quick Navigation</h5>
              <div className="flex flex-col space-y-1.5 text-slate-400">
                <a href="#schemes" className="hover:text-white">Latest Government Schemes</a>
                <a href="#services" className="hover:text-white">Village Services</a>
                <a href="#announcements" className="hover:text-white">Village Announcements</a>
                <Link href={user ? "/dashboard" : "/login"} className="hover:text-white">Resident Portal</Link>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <h5 className="font-extrabold text-white uppercase text-[11px] tracking-wider">Nodal Administration</h5>
              <p className="text-slate-400">Block Development Office (BDO), Rural Development &amp; Panchayat Raj Department</p>
              <p className="text-slate-400 font-bold">Helpline: 1800-425-1000</p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
            <p>© 2026 GramSeva AI • Government of Tamil Nadu. All rights reserved.</p>
            <p>Designed with High Contrast Accessibility &amp; AI Integration</p>
          </div>
        </div>
      </footer>

      {/* ── SCHEME DETAILS MODAL ── */}
      <AnimatePresence>
        {selectedSchemeModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl my-8 space-y-4"
            >
              <div className="h-64 relative bg-slate-950 overflow-hidden">
                <img
                  src={selectedSchemeModal.media?.poster_url || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80'}
                  alt={selectedSchemeModal.title || selectedSchemeModal.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent p-6 flex flex-col justify-between" />
                <button
                  onClick={() => setSelectedSchemeModal(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-950/60 text-white flex items-center justify-center hover:bg-slate-950 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
                  <span className="px-3 py-1 rounded-md bg-[#16A34A] text-[10px] font-extrabold uppercase tracking-wider">
                    {selectedSchemeModal.category}
                  </span>
                  <h3 className="text-xl font-black leading-tight text-white">
                    {selectedSchemeModal.title || selectedSchemeModal.name}
                  </h3>
                </div>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">Department</span>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedSchemeModal.type || 'Government'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">Benefit Type</span>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedSchemeModal.benefit_details?.amount || 'Financial Subsidy'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">Launch Date</span>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedSchemeModal.launch_date || 'Active'}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Scheme Overview</h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {selectedSchemeModal.description}
                  </p>
                </div>

                {selectedSchemeModal.benefits_list && selectedSchemeModal.benefits_list.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 text-[#0F766E] dark:text-teal-300 space-y-1">
                    <span className="font-extrabold block uppercase text-[10px]">Key Benefits:</span>
                    <ul className="list-disc list-inside space-y-0.5">
                      {selectedSchemeModal.benefits_list.map((b, i) => (
                        <li key={i} className="font-semibold">{b}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setSelectedSchemeModal(null)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-100 cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setSelectedSchemeModal(null)
                      router.push('/schemes')
                    }}
                    className="px-5 py-2 bg-[#0F766E] hover:bg-[#0d645e] text-white font-extrabold rounded-xl shadow-md cursor-pointer"
                  >
                    Apply for Scheme
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── SERVICE DETAILS MODAL ── */}
      <AnimatePresence>
        {selectedServiceModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl my-8 space-y-4"
            >
              <div className="h-56 relative bg-slate-950 overflow-hidden">
                <img
                  src={selectedServiceModal.image}
                  alt={selectedServiceModal.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent p-6 flex flex-col justify-between" />
                <button
                  onClick={() => setSelectedServiceModal(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-950/60 text-white flex items-center justify-center hover:bg-slate-950 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
                  <span className="px-3 py-1 rounded-md bg-[#0F766E] text-[10px] font-extrabold uppercase tracking-wider">
                    {selectedServiceModal.status}
                  </span>
                  <h3 className="text-xl font-black leading-tight text-white">
                    {selectedServiceModal.name}
                  </h3>
                </div>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Department</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{selectedServiceModal.department}</span>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Service Description</h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {selectedServiceModal.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setSelectedServiceModal(null)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-100 cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setSelectedServiceModal(null)
                      router.push('/services')
                    }}
                    className="px-5 py-2 bg-[#0F766E] hover:bg-[#0d645e] text-white font-extrabold rounded-xl shadow-md cursor-pointer"
                  >
                    Apply Now Online
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── ANNOUNCEMENT DETAILS MODAL ── */}
      <AnimatePresence>
        {selectedAnnouncement && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl my-8 space-y-4"
            >
              <div className="h-64 relative bg-slate-950 overflow-hidden">
                <img
                  src={selectedAnnouncement.image}
                  alt={selectedAnnouncement.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent p-6 flex flex-col justify-between" />
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-950/60 text-white flex items-center justify-center hover:bg-slate-950 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
                  <span className="px-3 py-1 rounded-md bg-[#0F766E] text-[10px] font-extrabold uppercase tracking-wider">
                    {selectedAnnouncement.type || 'Government Announcement'}
                  </span>
                  <h3 className="text-xl font-black leading-tight text-white">
                    {selectedAnnouncement.title}
                  </h3>
                </div>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">Date</span>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedAnnouncement.startDate || selectedAnnouncement.date}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">Priority</span>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">Priority #{selectedAnnouncement.priority ?? 5}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">Organizer</span>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5 truncate">{selectedAnnouncement.createdBy || selectedAnnouncement.organizer || 'BDO Office'}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Details &amp; Agenda</h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {selectedAnnouncement.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setSelectedAnnouncement(null)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-100 cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAnnouncement(null)
                      router.push('/schemes')
                    }}
                    className="px-5 py-2 bg-[#0F766E] hover:bg-[#0d645e] text-white font-extrabold rounded-xl shadow-md cursor-pointer"
                  >
                    Explore Related Scheme
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
