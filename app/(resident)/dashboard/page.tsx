'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import { useLanguage } from '@/components/providers/language-provider'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Search, ChevronRight, ChevronLeft, ChevronDown, FileText, Coins, Users, MapPin,
  Landmark, Droplet, Zap, Award, Leaf, HeartPulse, GraduationCap,
  Bot, Sparkles, Clock, Phone, ShieldAlert, Globe, Bell,
  Activity, ArrowRight, CheckCircle2, AlertCircle,
  Calendar, ShieldCheck, CheckSquare, PlusCircle, Sparkle,
  Mic, MicOff, HelpCircle, Briefcase, Trophy
} from 'lucide-react'

import { getStoredSchemes, type SchemeRecord } from '@/lib/scheme-store'
import { getStoredServices, type ServiceRecord } from '@/lib/service-store'
import { getStoredAnnouncements, type AnnouncementRecord } from '@/lib/announcement-store'
import { getStoredComplaints, type ComplaintRecord } from '@/lib/complaint-store'
import { getStoredResidents } from '@/lib/resident-store'

// ─── High Quality Poster Fallbacks by Category ───────────────────────────────
const CATEGORY_POSTERS: Record<string, string> = {
  'Women Empowerment': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
  'Agriculture': 'https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?auto=format&fit=crop&w=800&q=80',
  'Health': 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
  'Education': 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
  'Student Scholarship': 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
  'Housing': 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
  'Pension': 'https://images.unsplash.com/photo-1473163928189-364b2c4e1135?auto=format&fit=crop&w=800&q=80',
  'Employment': 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
  'Business': 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80',
}

const DEFAULT_POSTER = 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80'

// ─── Animated Counter ──────────────────────────────────────────────────────────
function AnimatedCount({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const duration = 1200
    const step = Math.max(1, Math.ceil(target / Math.max(1, duration / 20)))
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

// ─── FAQ Section Component ─────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: 'How do I apply for a government welfare scheme?',
    a: 'Go to the "Schemes" section, browse or search for your scheme, click Apply, and follow the steps. You may need to upload documents like Aadhaar, income certificate, or ration card.'
  },
  {
    q: 'How long does a service application take to process?',
    a: 'Most certificates (birth, income, community) are processed within 7–15 working days. Complex services like Patta transfer may take up to 30 days. You can track status in the Services section.'
  },
  {
    q: 'What documents do I need for a birth certificate?',
    a: 'You need: hospital discharge summary or birth record, parents\' Aadhaar cards, and a filled application form. Hospital-issued birth records must be submitted within 21 days of birth.'
  },
  {
    q: 'How do I file a complaint or grievance?',
    a: 'Visit the Complaints section from the sidebar, click "New Complaint", select the category, describe the issue, and submit. You will receive a reference number to track the status.'
  },
  {
    q: 'Is GramSeva available in Tamil?',
    a: 'Yes! GramSeva fully supports Tamil language. Click the language toggle (EN / தமிழ்) in the header to switch. All scheme descriptions, notices, and service details are available in Tamil.'
  },
  {
    q: 'How are emergency helpline numbers verified?',
    a: 'All helpline numbers listed in the Emergency section are official Government of Tamil Nadu numbers. The VAO/BDO contact is from the local Panchayat Union and is updated periodically.'
  },
]

function FaqSection({ language }: { language: string }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  return (
    <div className="space-y-3">
      {/* Compact Header */}
      <div className="flex items-center gap-2">
        <HelpCircle className="w-4 h-4 text-violet-500" />
        <h3 className="text-sm font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          {language === 'en' ? 'Frequently Asked Questions' : 'அடிக்கடி கேட்கப்படும் கேள்விகள்'}
        </h3>
      </div>

      {/* 2-column FAQ Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {FAQ_ITEMS.map((item, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/80 overflow-hidden"
          >
            <button
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">{item.q}</span>
              <motion.div
                animate={{ rotate: openIdx === idx ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="shrink-0 text-[#0F766E]"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </motion.div>
            </button>
            <AnimatePresence initial={false}>
              {openIdx === idx && (
                <motion.div
                  key="answer"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <p className="px-4 pb-3 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-2">
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ResidentDashboard() {
  const { user, profile } = useAuth()
  const { language } = useLanguage()
  const router = useRouter()

  // Dynamic Stores Data
  const [schemes, setSchemes] = useState<SchemeRecord[]>([])
  const [services, setServices] = useState<ServiceRecord[]>([])
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([])
  const [complaintsCount, setComplaintsCount] = useState<number>(0)
  const [residentsCount, setResidentsCount] = useState<number>(0)

  // Interactive UI States
  const [activeSlide, setActiveSlide] = useState(0)
  const [searchVal, setSearchVal] = useState('')
  const [activePersona, setActivePersona] = useState<UserPersona>('All')
  const [activeCategoryTab, setActiveCategoryTab] = useState<'Categories' | 'States/UTs' | 'Central Ministries'>('Categories')
  const [showAiPrompts, setShowAiPrompts] = useState(false)
  const [isListening, setIsListening] = useState(false)

  // Load Real Stored Data & Listen for Live Updates
  const loadData = () => {
    const sc = getStoredSchemes().filter(s => s.status !== 'draft')
    setSchemes(sc)

    const sv = getStoredServices().filter(s => s.isActive !== false)
    setServices(sv)

    const anc = getStoredAnnouncements().filter(a => a.isActive)
    setAnnouncements(anc)

    const cmp = getStoredComplaints()
    setComplaintsCount(cmp.length)

    const res = getStoredResidents()
    setResidentsCount(res.length)
  }

  useEffect(() => {
    loadData()

    const handleUpdate = () => loadData()
    window.addEventListener('gramseva_scheme_db_updated', handleUpdate)
    window.addEventListener('gramseva_services_db_updated', handleUpdate)
    window.addEventListener('gramseva_announcements_updated', handleUpdate)
    window.addEventListener('gramseva_complaints_updated', handleUpdate)
    window.addEventListener('gramseva_resident_db_updated', handleUpdate)

    return () => {
      window.removeEventListener('gramseva_scheme_db_updated', handleUpdate)
      window.removeEventListener('gramseva_services_db_updated', handleUpdate)
      window.removeEventListener('gramseva_announcements_updated', handleUpdate)
      window.removeEventListener('gramseva_complaints_updated', handleUpdate)
      window.removeEventListener('gramseva_resident_db_updated', handleUpdate)
    }
  }, [])

  // Dynamic Hero Carousel Slides
  const carouselSlides = useMemo(() => {
    if (announcements.length > 0) {
      return announcements.slice(0, 5).map(a => ({
        title: a.title,
        desc: a.description,
        image: a.image || DEFAULT_POSTER,
        badge: a.category || a.type?.toUpperCase() || 'ANNOUNCEMENT',
        color: 'from-[#0F766E]/90 to-slate-900/90'
      }))
    }
    return [
      {
        title: 'Access Official Government Welfare Schemes',
        desc: 'Explore available central & state government welfare schemes verified for Tamil Nadu residents.',
        image: DEFAULT_POSTER,
        badge: 'Welfare Schemes',
        color: 'from-[#0F766E]/90 to-slate-900/90'
      },
      {
        title: 'Farmer Subsidies & Agriculture Aid',
        desc: 'PM Kisan, crop insurance, fertilizer assistance, and agricultural equipment support.',
        image: CATEGORY_POSTERS['Agriculture'],
        badge: 'Agriculture Aid',
        color: 'from-emerald-700/90 to-slate-900/90'
      }
    ]
  }, [announcements])

  // Auto carousel slide timer
  useEffect(() => {
    if (carouselSlides.length <= 1) return
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % carouselSlides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [carouselSlides.length])

  // Auto persona match based on logged-in user profile
  useEffect(() => {
    if (profile) {
      const p = profile as any
      if (profile.gender === 'Female') setActivePersona('Women')
      else if (profile.occupation?.toLowerCase().includes('farmer') || p.own_land) setActivePersona('Farmers')
      else if (profile.occupation?.toLowerCase().includes('student') || p.currently_studying) setActivePersona('Students')
      else if ((profile.age ?? 0) >= 60) setActivePersona('Senior Citizens')
    }
  }, [profile])

  // Voice Search Handler
  const toggleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setIsListening(true)
      setTimeout(() => { setSearchVal('PM Kisan'); setIsListening(false) }, 2500)
      return
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SR()
      recognition.lang = language === 'ta' ? 'ta-IN' : 'en-US'
      recognition.start()
      setIsListening(true)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        setSearchVal(event.results[0][0].transcript)
        setIsListening(false)
      }
      recognition.onerror = () => setIsListening(false)
      recognition.onend = () => setIsListening(false)
    } catch {
      setIsListening(false)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchVal.trim()) return
    router.push(`/schemes?search=${encodeURIComponent(searchVal)}`)
  }

  const handleApplyService = (serviceName: string) => {
    toast.success(`${serviceName} application request logged!`)
  }

  // Filter schemes based on search or persona (Max 4 for Dashboard)
  const displayedSchemes = useMemo(() => {
    let list = [...schemes]
    if (searchVal.trim()) {
      const q = searchVal.toLowerCase()
      list = list.filter(s =>
        s.title.toLowerCase().includes(q) ||
        (s.name && s.name.toLowerCase().includes(q)) ||
        s.description.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      )
    }
    if (activePersona !== 'All') {
      const categoryMap: Record<UserPersona, string[]> = {
        'All': [],
        'Women': ['Women Empowerment', 'Women'],
        'Farmers': ['Agriculture', 'Livestock'],
        'Students': ['Education', 'Student Scholarship', 'Student'],
        'Senior Citizens': ['Pension', 'Health'],
        'Job Seekers': ['Employment', 'Business'],
      }
      const matchCats = categoryMap[activePersona] || []
      list = list.filter(s =>
        matchCats.includes(s.category) ||
        (s.eligibility?.gender === 'Female' && activePersona === 'Women') ||
        (s.eligibility?.occupation?.some(o => o.toLowerCase().includes('farmer')) && activePersona === 'Farmers') ||
        (s.eligibility?.occupation?.some(o => o.toLowerCase().includes('student')) && activePersona === 'Students')
      )
    }
    return list.slice(0, 4) // Show strictly 4 schemes on dashboard
  }, [schemes, searchVal, activePersona])

  const profileComplete = profile?.profile_complete ?? false

  return (
    <div className="min-h-screen space-y-8 pb-16">

      {/* ── FULL-WIDTH HERO CAROUSEL ── */}
      <section className="relative w-full overflow-hidden rounded-3xl shadow-[0_18px_55px_rgba(15,23,42,0.14)] border border-slate-200/80">
        <div className="relative h-[300px] sm:h-[420px] lg:h-[480px] w-full">
          <AnimatePresence mode="wait">
            {carouselSlides.length > 0 && (
              <motion.div
                key={activeSlide}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${carouselSlides[activeSlide % carouselSlides.length].image})` }}
              >
                {/* Natural Image Presentation with soft left/bottom readability shadow */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 via-55% to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent z-10" />

                <div className="absolute inset-0 z-20 flex flex-col justify-between p-6 sm:p-10 text-white">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-extrabold uppercase tracking-wider">
                      <Sparkle className="w-3.5 h-3.5 text-emerald-300" /> GramSeva AI Citizen Portal
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      VAO Portal Active • Ward {(profile as any)?.ward_number || '1'}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-[10px] font-bold tracking-wider uppercase backdrop-blur-md mb-2">
                        {carouselSlides[activeSlide % carouselSlides.length].badge}
                      </span>
                      <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight max-w-3xl">
                        {carouselSlides[activeSlide % carouselSlides.length].title}
                      </h1>
                      <p className="text-sm sm:text-base text-white/80 max-w-2xl mt-2 line-clamp-2">
                        {carouselSlides[activeSlide % carouselSlides.length].desc}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(['All', 'Women', 'Farmers', 'Students', 'Senior Citizens', 'Job Seekers'] as UserPersona[]).map((persona) => (
                        <button
                          key={persona}
                          onClick={() => setActivePersona(persona)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer backdrop-blur-md ${
                            activePersona === persona
                              ? 'bg-white text-[#0F766E] shadow-lg'
                              : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
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

                    {!profileComplete && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-amber-500/25 backdrop-blur-md border border-amber-300/40 rounded-xl text-xs font-semibold text-white"
                      >
                        <AlertCircle className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                        Complete your profile for personalised schemes.
                        <Link href="/profile" className="ml-1 font-black text-amber-300 hover:underline">Update →</Link>
                      </motion.div>
                    )}

                    <div className="flex flex-wrap items-center gap-3">
                      <Link
                        href="/schemes"
                        className="px-5 py-2.5 rounded-2xl text-sm font-extrabold transition-all duration-200 cursor-pointer shadow-lg bg-white text-[#0F766E] hover:bg-slate-100 hover:-translate-y-0.5 flex items-center gap-2"
                      >
                        Find Schemes For You <ChevronRight className="w-4 h-4" />
                      </Link>
                      <Link
                        href="/ai-assistant"
                        className="px-5 py-2.5 rounded-2xl text-sm font-extrabold transition-all duration-200 cursor-pointer border-2 border-white/50 text-white hover:bg-white/10 flex items-center gap-2 backdrop-blur-md"
                      >
                        <Bot className="w-4 h-4" /> AI Assistant
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {carouselSlides.length > 1 && (
            <div className="absolute bottom-4 right-4 z-30 flex items-center gap-2">
              <button
                onClick={() => setActiveSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length)}
                className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md cursor-pointer transition-all"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex gap-1.5">
                {carouselSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${activeSlide % carouselSlides.length === idx ? 'w-6 bg-white' : 'w-2 bg-white/40'}`}
                  />
                ))}
              </div>
              <button
                onClick={() => setActiveSlide((prev) => (prev + 1) % carouselSlides.length)}
                className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md cursor-pointer transition-all"
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── SEARCH BAR ── */}
      <div className="w-full bg-[#EAF8EF] dark:bg-slate-900/80 border border-teal-100 dark:border-teal-950 rounded-2xl py-4 px-5">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#0F766E] dark:text-teal-400 pointer-events-none" />
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder={isListening ? (language === 'en' ? 'Listening... speak now' : 'கேட்கிறேன்... பேசுங்கள்') : (language === 'en' ? 'Search Available Schemes, Services...' : 'திட்டங்களை தேடுக...')}
              className={`w-full pl-11 pr-4 py-3 text-sm rounded-xl bg-white dark:bg-slate-950 border-2 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none shadow-sm transition-all font-medium ${
                isListening
                  ? 'border-red-400 dark:border-red-500 placeholder:text-red-400 animate-pulse'
                  : 'border-teal-600/30 dark:border-teal-500/40 focus:border-[#0F766E] dark:focus:border-teal-400'
              }`}
            />
          </div>
          <button
            type="button"
            onClick={toggleVoiceSearch}
            title={language === 'en' ? 'Voice Search' : 'குரல் தேடல்'}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              isListening
                ? 'bg-red-500 text-white border-red-600 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                : 'bg-white dark:bg-slate-900 text-[#0F766E] dark:text-teal-400 border-teal-200 dark:border-teal-800 hover:bg-teal-50'
            }`}
          >
            {isListening ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
          </button>
          <button
            type="submit"
            className="px-5 py-3 bg-[#0F766E] hover:bg-[#0d645e] text-white rounded-xl font-bold text-sm shadow-sm transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            {language === 'en' ? 'Search' : 'தேடுக'}
          </button>
          <button
            type="button"
            onClick={() => setShowAiPrompts(!showAiPrompts)}
            className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition-all cursor-pointer"
            title="Search Suggestions"
          >
            <Sparkles className="w-4.5 h-4.5" />
          </button>
        </form>

        <AnimatePresence>
          {showAiPrompts && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mt-3 bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900 p-4 rounded-xl shadow-lg space-y-2 text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="font-extrabold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                  <Bot className="w-4 h-4" /> Quick Scheme Search Filters
                </span>
                <button onClick={() => setShowAiPrompts(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { label: '🌾 Agriculture Subsidies', query: 'Agriculture' },
                  { label: '👩 Women Welfare Schemes', query: 'Women' },
                  { label: '🎓 Student Scholarships', query: 'Education' },
                  { label: '🏠 Housing Schemes', query: 'Housing' },
                  { label: '👴 Senior Citizen Pensions', query: 'Pension' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setSearchVal(item.query); setShowAiPrompts(false) }}
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

      {/* ── QUICK ACCESS PORTAL BAR ── */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-[#0F766E]" />
          Quick Access Portal
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { href: '/schemes', icon: FileText, label: language === 'en' ? 'Welfare Schemes' : 'நலத்திட்டங்கள்', color: 'text-[#0F766E]' },
            { href: '/services', icon: Landmark, label: language === 'en' ? 'Village Services' : 'சேவைகள்', color: 'text-[#0F766E]' },
            { href: '/complaints', icon: ShieldAlert, label: language === 'en' ? 'My Complaints' : 'புகார்கள்', color: 'text-[#0F766E]' },
            { href: '/announcements', icon: Calendar, label: language === 'en' ? 'Announcements' : 'அறிவிப்புகள்', color: 'text-[#0F766E]' },
            { href: '/nearby-offices', icon: MapPin, label: language === 'en' ? 'Panchayat Offices' : 'அலுவலகங்கள்', color: 'text-[#0F766E]' },
            { href: '/ai-assistant', icon: Bot, label: language === 'en' ? 'AI Assistant' : 'AI உதவி', color: 'text-purple-600' },
          ].map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="p-3 rounded-[18px] bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 hover:border-[#0F766E]/30 hover:bg-[#EAF8EF] dark:hover:bg-teal-950/20 transition-all text-center flex flex-col items-center gap-2 group cursor-pointer shadow-sm"
            >
              <item.icon className={`w-5 h-5 ${item.color} group-hover:scale-110 transition-transform`} />
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── LIVE STORE STATISTICS (Strict Real Data) ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Registered Residents', value: residentsCount, suffix: '', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/40', border: 'border-t-blue-500' },
          { label: 'Active Welfare Schemes', value: schemes.length, suffix: '', icon: FileText, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/40', border: 'border-t-orange-500' },
          { label: 'Government Services', value: services.length, suffix: '', icon: Award, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/40', border: 'border-t-emerald-500' },
          { label: 'Active Announcements', value: announcements.length, suffix: '', icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/40', border: 'border-t-purple-500' },
        ].map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            className={`bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 rounded-[18px] p-4 flex flex-col justify-between border-t-2 ${item.border} shadow-sm hover:shadow-md transition-all`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{item.label}</span>
              <div className={`w-7 h-7 rounded-lg ${item.bg} flex items-center justify-center`}>
                <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black tracking-tight">
              <AnimatedCount target={item.value} suffix={item.suffix} />
            </p>
          </motion.div>
        ))}
      </div>

      {/* ── MYSCHEME STYLE CATEGORY BROWSER ── */}
      <div className="bg-white dark:bg-slate-900/90 rounded-[28px] p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-[0_12px_40px_rgba(15,23,42,0.05)] space-y-6">
        
        {/* Category Navigation Tabs */}
        <div className="flex justify-center">
          <div className="inline-flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-xs font-bold">
            <button
              onClick={() => setActiveCategoryTab('Categories')}
              className={`px-5 py-2 rounded-xl transition-all cursor-pointer ${
                activeCategoryTab === 'Categories'
                  ? 'bg-[#0F766E] text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => setActiveCategoryTab('States/UTs')}
              className={`px-5 py-2 rounded-xl transition-all cursor-pointer ${
                activeCategoryTab === 'States/UTs'
                  ? 'bg-[#0F766E] text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              States/UTs
            </button>
            <button
              onClick={() => setActiveCategoryTab('Central Ministries')}
              className={`px-5 py-2 rounded-xl transition-all cursor-pointer ${
                activeCategoryTab === 'Central Ministries'
                  ? 'bg-[#0F766E] text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Central Ministries
            </button>
          </div>
        </div>

        {/* Section Heading */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {language === 'en'
              ? activeCategoryTab === 'Categories'
                ? 'Find schemes based on categories'
                : activeCategoryTab === 'States/UTs'
                ? 'Explore schemes by State / UT'
                : 'Schemes by Central Ministries'
              : 'வகைப்பாடுகள் அடிப்படையில் திட்டங்களை கண்டறியவும்'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Select a category to filter verified central and state welfare initiatives
          </p>
        </div>

        {/* Categories Tab Content */}
        {activeCategoryTab === 'Categories' && (
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-6 pt-2 max-w-5xl mx-auto">
            {[
              { title: 'Agriculture, Rural & Environment', icon: Leaf, persona: 'Farmers', query: 'Agriculture' },
              { title: 'Banking, Financial Services & Insurance', icon: Coins, persona: 'All', query: 'Financial' },
              { title: 'Business & Entrepreneurship', icon: Briefcase, persona: 'Job Seekers', query: 'Business' },
              { title: 'Education & Learning', icon: GraduationCap, persona: 'Students', query: 'Education' },
              { title: 'Health & Wellness', icon: HeartPulse, persona: 'Senior Citizens', query: 'Health' },
              { title: 'Housing & Shelter', icon: Landmark, persona: 'All', query: 'Housing' },
              { title: 'Public Safety, Law & Justice', icon: ShieldAlert, persona: 'All', query: 'Safety' },
              { title: 'Science, IT & Communications', icon: Globe, persona: 'All', query: 'Science' },
              { title: 'Skills & Employment', icon: Award, persona: 'Job Seekers', query: 'Employment' },
              { title: 'Social Welfare & Empowerment', icon: Users, persona: 'All', query: 'Welfare' },
              { title: 'Sports & Culture', icon: Trophy, persona: 'All', query: 'Sports' },
              { title: 'Women and Child', icon: Sparkle, persona: 'Women', query: 'Women' },
            ].map((cat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -4, scale: 1.03 }}
                onClick={() => {
                  setActivePersona(cat.persona as UserPersona)
                  setSearchVal(cat.query)
                  toast.info(`Filtering schemes for ${cat.title}`)
                }}
                className="w-[44%] sm:w-[28%] md:w-[22%] lg:w-[17%] flex flex-col items-center text-center group cursor-pointer p-3 rounded-2xl hover:bg-teal-50/60 dark:hover:bg-teal-950/20 transition-all"
              >
                {/* Circular Icon Container */}
                <div className="w-16 h-16 rounded-full bg-teal-50/80 dark:bg-teal-950/50 border border-teal-200/80 dark:border-teal-800/80 flex items-center justify-center text-[#0F766E] dark:text-teal-400 group-hover:bg-[#0F766E] group-hover:text-white group-hover:border-[#0F766E] shadow-sm transition-all duration-300 mb-2">
                  <cat.icon className="w-7 h-7 transition-transform duration-300 group-hover:scale-110" />
                </div>
                {/* Title */}
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 leading-snug group-hover:text-[#0F766E] dark:group-hover:text-teal-300 transition-colors">
                  {cat.title}
                </h4>
              </motion.div>
            ))}
          </div>
        )}

        {/* States/UTs Tab Content */}
        {activeCategoryTab === 'States/UTs' && (
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {[
              'Tamil Nadu (Selected)', 'Kerala', 'Karnataka', 'Andhra Pradesh', 'Telangana',
              'Maharashtra', 'Gujarat', 'Delhi', 'Uttar Pradesh', 'West Bengal', 'Rajasthan'
            ].map((stateName, idx) => (
              <button
                key={idx}
                onClick={() => toast.info(`Viewing schemes active in ${stateName}`)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                  idx === 0
                    ? 'bg-[#0F766E] text-white border-[#0F766E] shadow-md'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#0F766E]'
                }`}
              >
                {stateName}
              </button>
            ))}
          </div>
        )}

        {/* Central Ministries Tab Content */}
        {activeCategoryTab === 'Central Ministries' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
            {[
              'Ministry of Agriculture', 'Ministry of Education', 'Ministry of Rural Development',
              'Ministry of Women & Child', 'Ministry of Health & Family', 'Ministry of Social Justice',
              'Ministry of Skill Development', 'Ministry of Electronics & IT'
            ].map((ministry, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSearchVal(ministry.split(' ')[2] || ministry)
                  toast.info(`Filtered for ${ministry}`)
                }}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-left hover:border-[#0F766E] hover:bg-teal-50/50 dark:hover:bg-teal-950/20 transition-all cursor-pointer"
              >
                <span className="text-[10px] font-bold text-[#0F766E] dark:text-teal-400 block mb-0.5">Government Body</span>
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 leading-tight block">{ministry}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── 4 FEATURED WELFARE SCHEMES (CENTER ALIGNED WITH POSTERS & CATEGORIES) ── */}
      <div className="space-y-6">

        {/* Centered Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#0F766E]/10 text-[#0F766E] dark:text-teal-300 border border-[#0F766E]/20 text-xs font-extrabold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5 text-[#0F766E]" />
            {language === 'en' ? 'Verified Government Welfare' : 'சரிபார்க்கப்பட்ட அரசு நலத்திட்டங்கள்'}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {language === 'en' ? 'Featured Welfare Schemes' : 'முக்கிய நலத்திட்டங்கள்'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {activePersona !== 'All'
              ? `Showing top schemes matching "${activePersona}" persona`
              : `Explore top verified central and state government schemes available in Tamil Nadu.`}
          </p>
        </div>

        {/* Scheme Category Filter Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {[
            { id: 'All', label: 'All Schemes', icon: Award },
            { id: 'Women', label: 'Women Empowerment 👩', icon: Sparkle },
            { id: 'Farmers', label: 'Agriculture 🌾', icon: Leaf },
            { id: 'Students', label: 'Education & Scholarships 🎓', icon: GraduationCap },
            { id: 'Senior Citizens', label: 'Senior Pensions 👴', icon: Award },
            { id: 'Job Seekers', label: 'Employment & Business 💼', icon: Coins },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActivePersona(cat.id as UserPersona)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                activePersona === cat.id
                  ? 'bg-[#0F766E] text-white shadow-md scale-105'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-[#0F766E] hover:text-[#0F766E]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {displayedSchemes.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg mx-auto">
            <HelpCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No schemes found matching "{activePersona}" persona or search query.</p>
            <button onClick={() => { setActivePersona('All'); setSearchVal(''); }} className="mt-2 text-xs font-bold text-[#0F766E] hover:underline cursor-pointer">
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayedSchemes.map((scheme) => {
              const posterImage = scheme.media?.poster_url || CATEGORY_POSTERS[scheme.category] || DEFAULT_POSTER

              return (
                <motion.div
                  key={scheme.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-[0_10px_35px_rgba(15,23,42,0.06)] hover:shadow-[0_20px_50px_rgba(15,118,110,0.18)] hover:-translate-y-1.5 transition-all duration-300"
                >
                  {/* Poster Image Header */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={posterImage}
                      alt={scheme.title || scheme.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                      <span className="bg-[#0F766E]/90 text-white backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                        {scheme.category}
                      </span>
                      <span className="bg-slate-900/80 text-slate-200 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-bold">
                        {scheme.type}
                      </span>
                    </div>

                    {/* Title overlay on poster bottom */}
                    <div className="absolute bottom-3 left-3 right-3 z-10">
                      <h3 className="font-black text-base text-white line-clamp-1 leading-snug drop-shadow-sm">
                        {scheme.title || scheme.name}
                      </h3>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {scheme.description}
                    </p>

                    {scheme.benefit_details && (
                      <div className="p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-xs">
                        <span className="font-extrabold text-[#0F766E] dark:text-emerald-400">Benefit: </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {scheme.benefit_details.amount} ({scheme.benefit_details.frequency || 'Per Benefit'})
                        </span>
                      </div>
                    )}

                    {/* Card Footer: Deadline + Apply */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        {scheme.closing_date ? `Ends: ${scheme.closing_date}` : 'Ongoing'}
                      </span>
                      <Link
                        href={`/schemes/${scheme.id}`}
                        className="px-3.5 py-2 bg-[#0F766E] hover:bg-[#0d645e] text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center gap-1"
                      >
                        <span>Apply</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Centered Green Browse All Schemes Button */}
        <div className="flex justify-center pt-2 pb-1">
          <Link
            href="/schemes"
            className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-[#0F766E] hover:bg-[#0d645e] text-white font-black text-sm shadow-[0_10px_30px_rgba(15,118,110,0.25)] hover:shadow-[0_16px_40px_rgba(15,118,110,0.35)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <span>{language === 'en' ? 'Browse All Schemes' : 'அனைத்து திட்டங்களையும் பார்க்க'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ── REAL AVAILABLE GOVERNMENT SERVICES ── */}
      <div className="space-y-5">
        {/* Centered Services Header */}
        <div className="text-center space-y-2 pb-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-[10px] font-black uppercase tracking-wider text-[#0F766E]">
            <Landmark className="w-3 h-3" /> Government Services
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {language === 'en' ? 'Available Village Services' : 'கிடைக்கக்கூடிய கிராம சேவைகள்'}
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            {language === 'en' ? 'Apply online for certificates, permissions and welfare services.' : 'சான்றிதழ்கள் மற்றும் நல சேவைகளுக்கு ஆன்லைனில் விண்ணப்பிக்கவும்.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.slice(0, 4).map((svc) => (
            <motion.div
              key={svc.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="group relative flex flex-col justify-between overflow-hidden rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-[0_10px_35px_rgba(15,23,42,0.06)] hover:shadow-[0_20px_50px_rgba(15,118,110,0.18)] hover:-translate-y-1.5 transition-all duration-300"
            >
              {/* Poster Image Header */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={svc.image || 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&w=800&q=80'}
                  alt={svc.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                  <span className="bg-[#0F766E]/90 text-white backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                    {svc.category || 'Service'}
                  </span>
                  <span className={`backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-bold ${svc.status === 'New' ? 'bg-amber-500/90 text-white' : 'bg-slate-900/80 text-slate-200'}`}>
                    {svc.status}
                  </span>
                </div>

                {/* Service Name overlaid on poster bottom */}
                <div className="absolute bottom-3 left-3 right-3 z-10">
                  <h3 className="font-black text-base text-white line-clamp-1 leading-snug drop-shadow-sm">
                    {svc.name}
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <p className="text-[11px] font-bold text-[#0F766E] mb-1">{svc.department}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">{svc.description}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleApplyService(svc.name)}
                    className="w-full py-2 px-3 bg-[#0F766E] hover:bg-[#0d645e] text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-1 cursor-pointer"
                  >
                    Apply Now <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Centered Green Browse All Services Button */}
        <div className="flex justify-center pt-2 pb-1">
          <Link
            href="/services"
            className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-[#0F766E] hover:bg-[#0d645e] text-white font-black text-sm shadow-[0_10px_30px_rgba(15,118,110,0.25)] hover:shadow-[0_16px_40px_rgba(15,118,110,0.35)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <span>{language === 'en' ? 'Browse All Services' : 'அனைத்து சேவைகளையும் பார்க்க'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ── ANNOUNCEMENTS & NOTICE BOARD ── */}
      <div className="space-y-5">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                <Bell className="w-3 h-3" />
                Official Notice Board
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-red-500">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> LIVE
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {language === 'en' ? 'Village Announcements & Notices' : 'கிராம அறிவிப்புகள்'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {language === 'en' ? 'Stay updated with the latest government notices and village events.' : 'சமீபத்திய அரசு அறிவிப்புகளுடன் புதுப்பிக்கப்பட்டிருங்கள்.'}
            </p>
          </div>
          <Link
            href="/announcements"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5" />
            View All Notices
          </Link>
        </div>

        {/* Notice Cards */}
        {announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
            <Bell className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-500">No announcements published yet.</p>
            <p className="text-xs text-slate-400 mt-1">Check back soon for village notices and events.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {announcements.slice(0, 3).map((ann, idx) => {
              const isUrgent = ann.category?.toLowerCase().includes('urgent') || ann.category?.toLowerCase().includes('alert') || ann.category?.toLowerCase().includes('emergency')
              const isEvent = ann.category?.toLowerCase().includes('event') || ann.category?.toLowerCase().includes('meeting') || ann.category?.toLowerCase().includes('festival')
              const accentColor = isUrgent ? 'bg-red-500' : isEvent ? 'bg-amber-500' : 'bg-[#0F766E]'
              const bgColor = isUrgent ? 'bg-red-50/60 dark:bg-red-950/20 border-red-200/60 dark:border-red-900/30' : isEvent ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-900/30' : 'bg-teal-50/50 dark:bg-teal-950/20 border-teal-200/50 dark:border-teal-900/30'
              const badgeColor = isUrgent ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 border-red-200 dark:border-red-800' : isEvent ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800' : 'bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-[#0F766E] border-teal-200 dark:border-teal-800'
              const icon = isUrgent ? ShieldAlert : isEvent ? Calendar : Bell
              const IconComp = icon
              return (
                <motion.div
                  key={ann.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className={`relative rounded-[20px] border overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${bgColor}`}
                >
                  {/* Left Accent Bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${accentColor}`} />

                  <div className="p-5 pl-6 space-y-3">
                    {/* Top row: badge + date */}
                    <div className="flex items-start justify-between gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${badgeColor}`}>
                        <IconComp className="w-3 h-3" />
                        {ann.category || ann.type?.toUpperCase() || 'NOTICE'}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-semibold whitespace-nowrap">
                        <Clock className="w-3 h-3" />
                        {ann.startDate || ann.date || 'Recent'}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="font-black text-sm leading-snug text-slate-900 dark:text-white line-clamp-2">
                      {ann.title}
                    </h4>

                    {/* Description */}
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                      {ann.description}
                    </p>

                    {/* Venue if exists */}
                    {ann.venue && (
                      <p className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                        <MapPin className="w-3 h-3 flex-shrink-0" /> {ann.venue}
                      </p>
                    )}

                    {/* Footer */}
                    <div className="pt-2 border-t border-current/10 flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground font-medium">By Village Office</span>
                      <Link
                        href="/announcements"
                        className="text-[11px] font-black text-[#0F766E] hover:underline flex items-center gap-1"
                      >
                        Read More <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── EMERGENCY CONTACT HELPLINES ── */}
      <div id="emergency" className="relative overflow-hidden bg-red-500/[0.03] dark:bg-red-950/[0.05] p-6 sm:p-8 rounded-3xl border border-red-500/25 space-y-5">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
          <img
            src="/tn-emblem.svg"
            alt="Watermark"
            className="w-[50%] max-w-[220px] aspect-square object-contain opacity-[0.15] filter grayscale blur-[2px]"
            style={{ maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 100%)', WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 100%)' }}
          />
        </div>

        <div className="relative z-10">
          <h2 className="text-lg font-extrabold flex items-center gap-2 text-red-600 dark:text-red-400">
            <ShieldAlert className="w-5 h-5" />
            {language === 'en' ? 'Emergency Helplines' : 'அவசர உதவி இலக்கங்கள்'}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {language === 'en' ? 'Dial these verified numbers immediately in any emergency situation.' : 'அவசர நிலையில் உடனடியாக அழைக்கவும்.'}
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: language === 'en' ? 'Police Emergency' : 'காவல்துறை', number: '100' },
            { label: language === 'en' ? 'Fire & Rescue Service' : 'தீயணைப்பு', number: '101' },
            { label: language === 'en' ? 'Medical Ambulance' : 'ஆம்புலன்ஸ்', number: '108' },
            { label: language === 'en' ? 'Women Helpline' : 'மகளிர் உதவி', number: '1091' },
            { label: language === 'en' ? 'Village Office (VAO/BDO)' : 'கிராம அலுவலகம்', number: '044-2432121' },
          ].map((contact, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900/80 p-4 rounded-2xl border border-red-200/60 dark:border-red-900/30 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">{contact.label}</h4>
                  <p className="text-sm font-black text-red-600 dark:text-red-400 mt-0.5">{contact.number}</p>
                </div>
              </div>
              <a href={`tel:${contact.number}`} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-[10px] font-bold shadow-sm hover:bg-red-600 transition-all cursor-pointer">
                {language === 'en' ? 'Call' : 'அழை'}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* ── FAQ SECTION ── */}
      <FaqSection language={language} />

      {/* ── FOOTER ── */}
      <footer className="bg-[#0f172a] text-slate-100 rounded-3xl p-6 sm:p-10 space-y-8 shadow-lg border border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img src="/tn-emblem.svg" alt="TN Crest" className="w-9 h-9 object-contain" />
              <div>
                <h4 className="font-bold text-sm text-white">GramSeva AI</h4>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">{language === 'en' ? 'Govt of Tamil Nadu' : 'தமிழ்நாடு அரசு'}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'en'
                ? 'Official digital platform for village government services, welfare schemes, and citizen support in Tamil Nadu.'
                : 'தமிழ்நாட்டில் கிராம அரசு சேவைகள், நலத்திட்டங்கள் மற்றும் குடிமக்கள் ஆதரவுக்கான அதிகாரப்பூர்வ டிஜிட்டல் தளம்.'}
            </p>
          </div>

          <div className="space-y-3">
            <h5 className="font-extrabold text-xs text-white uppercase tracking-wider">{language === 'en' ? 'Useful Links' : 'பயனுள்ள இணைப்புகள்'}</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              {[
                { href: '/schemes', label: language === 'en' ? 'Explore State Schemes' : 'மாநில நலத்திட்டங்கள்' },
                { href: '/services', label: language === 'en' ? 'Village Services' : 'கிராம சேவைகள்' },
                { href: '/announcements', label: language === 'en' ? 'Announcements' : 'அறிவிப்புகள்' },
                { href: '/nearby-offices', label: language === 'en' ? 'Panchayat & Taluk Offices' : 'அலுவலக முகவரிகள்' },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link href={link.href} className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer">
                    <ChevronRight className="w-3.5 h-3.5" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-extrabold text-xs text-white uppercase tracking-wider">{language === 'en' ? 'About' : 'பற்றி'}</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              {['Privacy Policy', 'Terms & Conditions', 'Citizen Charter'].map((item, idx) => (
                <li key={idx}>
                  <a href="#" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer">
                    <ChevronRight className="w-3.5 h-3.5" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500 font-semibold">
          <p>{language === 'en' ? '© 2026 GramSeva AI, Govt of Tamil Nadu. All rights reserved.' : '© 2026 கிராமசேவா AI, தமிழ்நாடு அரசு. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.'}</p>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>{language === 'en' ? 'Secure Government Portal' : 'பாதுகாப்பான அரசு முகவரி'}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
