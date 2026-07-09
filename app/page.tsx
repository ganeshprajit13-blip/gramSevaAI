'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import { useLanguage } from '@/components/providers/language-provider'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, ChevronRight, ChevronLeft, FileText, Coins, Users, MapPin, 
  Landmark, Droplet, Zap, Award, Leaf, HeartPulse, GraduationCap, 
  Bot, Sparkles, Clock, Phone, ExternalLink, ShieldAlert, Globe, 
  Activity, ArrowRight, CheckCircle2, AlertCircle, Calendar, 
  ShieldCheck, Volume2, Type, Menu, CircleUserRound, Share2, X
} from 'lucide-react'
import { FaYoutube, FaInstagram, FaFacebookF } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'


// Live data counts for stats cards
const STATS_ITEMS = [
  { translationKey: 'citizensRegistered', value: 1080, suffix: '+', icon: Users, color: 'text-blue-500 font-black' },
  { translationKey: 'schemesAvailable', value: 92, suffix: '', icon: FileText, color: 'text-orange-500 font-black' },
  { translationKey: 'certificatesIssued', value: 450, suffix: '+', icon: Award, color: 'text-emerald-500' },
  { translationKey: 'complaintsResolved', value: 210, suffix: '+', icon: CheckCircle2, color: 'text-teal-500' },
  { translationKey: 'aiQueriesToday', value: 120, suffix: '+', icon: Bot, color: 'text-purple-500' },
  { translationKey: 'villagePopulation', value: 4200, suffix: '', icon: Globe, color: 'text-indigo-500' },
] as const

// Government services grid definition
const GOV_SERVICES = [
  { translationKey: 'birthCert', descKey: 'birthCertDesc', icon: FileText },
  { translationKey: 'deathCert', descKey: 'deathCertDesc', icon: FileText },
  { translationKey: 'incomeCert', descKey: 'incomeCertDesc', icon: Coins },
  { translationKey: 'communityCert', descKey: 'communityCertDesc', icon: Users },
  { translationKey: 'nativityCert', descKey: 'nativityCertDesc', icon: MapPin },
  { translationKey: 'pattaTransfer', descKey: 'pattaTransferDesc', icon: Landmark },
  { translationKey: 'waterConn', descKey: 'waterConnDesc', icon: Droplet },
  { translationKey: 'electricitySvc', descKey: 'electricitySvcDesc', icon: Zap },
  { translationKey: 'pensionSvc', descKey: 'pensionSvcDesc', icon: Award },
  { translationKey: 'agriSvc', descKey: 'agriSvcDesc', icon: Leaf },
  { translationKey: 'healthSvc', descKey: 'healthSvcDesc', icon: HeartPulse },
  { translationKey: 'eduSupport', descKey: 'eduSupportDesc', icon: GraduationCap },
] as const

// Featured government schemes
const FEATURED_SCHEMES = [
  {
    name: 'PM Kisan Samman Nidhi',
    dept: 'Agriculture Department',
    eligibility: 'Farmers with landholding ≤ 2 hectares',
    benefits: '₹6,000 per year directly to bank account',
    deadline: '2026-08-31',
    category: 'Agriculture',
  },
  {
    name: 'Pradhan Mantri Awas Yojana',
    dept: 'Rural Development Department',
    eligibility: 'Houseless families / BPL Status',
    benefits: '₹1.20 Lakh financial aid for construction',
    deadline: '2026-09-30',
    category: 'Housing',
  },
  {
    name: 'Ayushman Bharat PM-JAY',
    dept: 'Health Department',
    eligibility: 'Vulnerable/BPL families',
    benefits: '₹5 Lakh free health cover per family/year',
    deadline: '2026-12-31',
    category: 'Health',
  },
  {
    name: 'National Scholarship Portal',
    dept: 'Minority Affairs Department',
    eligibility: 'Minority students, income ≤ ₹2 Lakh',
    benefits: 'Scholarships up to ₹20,000 per year',
    deadline: '2026-10-15',
    category: 'Student',
  },
  {
    name: 'Old Age Pension Scheme',
    dept: 'Social Justice Department',
    eligibility: 'BPL Residents aged 60 years or above',
    benefits: 'Monthly pension of ₹1,000 via DBT',
    deadline: 'Ongoing',
    category: 'Senior Citizen',
  },
  {
    name: 'Free Skill Development Training',
    dept: 'Employment & Training Dept',
    eligibility: 'Unemployed youths aged 18-35',
    benefits: 'Free computer/vocational certification',
    deadline: '2026-08-15',
    category: 'Employment',
  },
]

// Village Announcements Feed
const VILLAGE_ANNOUNCEMENTS = [
  { titleKey: 'not1Title', descKey: 'not1Desc', category: 'Water Supply', date: 'Wednesday' },
  { titleKey: 'not2Title', descKey: 'not2Desc', category: 'Power Utility', date: 'Thursday' },
  { titleKey: 'not3Title', descKey: 'not3Desc', category: 'Public Works', date: 'Monday' },
]

export default function HomePage() {
  const { user, profile, logout } = useAuth()
  const { t, language, setLanguage } = useLanguage()
  const router = useRouter()

  const [activeSlide, setActiveSlide] = useState(0)
  const [searchVal, setSearchVal] = useState('')
  const [textSize, setTextSizeState] = useState<'sm' | 'md' | 'lg'>('md')
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [socialOpen, setSocialOpen] = useState(false)

  // Listeners to close menus on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        setProfileOpen(false)
        setSocialOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const CAROUSEL_SLIDES = [
    {
      title: t('slide1Title'),
      desc: t('slide1Desc'),
      image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1200&auto=format&fit=crop&q=80',
      badge: t('welfareSchemes'),
      color: 'from-blue-600/90 to-slate-900/90',
    },
    {
      title: t('slide2Title'),
      desc: t('slide2Desc'),
      image: 'https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?w=1200&auto=format&fit=crop&q=80',
      badge: t('agriUpdates'),
      color: 'from-emerald-600/90 to-slate-900/90',
    },
    {
      title: t('slide3Title'),
      desc: t('slide3Desc'),
      image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=1200&auto=format&fit=crop&q=80',
      badge: t('healthCamps'),
      color: 'from-teal-600/90 to-slate-900/90',
    },
    {
      title: t('slide4Title'),
      desc: t('slide4Desc'),
      image: 'https://images.unsplash.com/photo-1473163928189-364b2c4e1135?w=1200&auto=format&fit=crop&q=80',
      badge: t('devProjects'),
      color: 'from-cyan-600/90 to-slate-900/90',
    },
    {
      title: t('slide5Title'),
      desc: t('slide5Desc'),
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
      badge: t('announcements'),
      color: 'from-orange-600/90 to-slate-900/90',
    },
    {
      title: t('slide6Title'),
      desc: t('slide6Desc'),
      image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&auto=format&fit=crop&q=80',
      badge: t('emergencyNotices'),
      color: 'from-red-600/90 to-slate-900/90',
    },
  ]

  useEffect(() => {
    const savedSize = localStorage.getItem('gramseva_text_size') as 'sm' | 'md' | 'lg'
    if (savedSize === 'sm' || savedSize === 'md' || savedSize === 'lg') {
      applyTextSize(savedSize)
    }

    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [CAROUSEL_SLIDES.length])

  const applyTextSize = (size: 'sm' | 'md' | 'lg') => {
    setTextSizeState(size)
    localStorage.setItem('gramseva_text_size', size)
    if (typeof window === 'undefined') return
    const root = document.documentElement
    if (size === 'sm') root.style.fontSize = '14px'
    else if (size === 'lg') root.style.fontSize = '18px'
    else root.style.fontSize = '16px'
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchVal.trim()) return
    router.push(user ? `/schemes?search=${encodeURIComponent(searchVal)}` : `/login`)
  }

  const handleApplyClick = () => {
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-background relative flex flex-col">
      {/* ── GOVERNMENT BANNER & PUBLIC HEADER ── */}
      <header className="w-full border-b border-border/80 bg-white/95 dark:bg-slate-900/95 sticky top-0 z-50 shadow-xs backdrop-blur-md">
        {/* Tricolor flag strip */}
        <div className="w-full h-1 flex">
          <div className="flex-1 bg-[#FF9933]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#138808]" />
        </div>

        {/* Micro accessibility bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 border-b border-border/40">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
            <span className="uppercase tracking-wider hidden sm:inline text-slate-800 dark:text-slate-300 font-bold">{t('govOfTN')} • {t('ruralDevDept')}</span>
            <span className="sm:hidden font-extrabold text-emerald-600 dark:text-emerald-500">
              {language === 'en' ? 'Govt of TN' : 'தமிழ்நாடு அரசு'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Screen Reader Access */}
            <button
              onClick={() => alert('Screen reader utility active')}
              className="h-9 hidden md:flex items-center justify-center rounded-full bg-white dark:bg-slate-900 border border-border text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500/30 px-3.5 gap-1.5 shadow-xs hover:scale-105 active:scale-95 transition-all duration-200 text-xs font-semibold cursor-pointer"
              title="Screen Reader Access"
            >
              <Volume2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span className="hidden md:inline">{t('screenReader')}</span>
            </button>

            {/* Font Sizer Pill */}
            <div className="h-9 flex items-center bg-white dark:bg-slate-900 rounded-full px-1 border border-border shadow-xs">
              <Type className="w-3.5 h-3.5 text-slate-400 mx-2" />
              <button
                onClick={() => applyTextSize('sm')}
                className={`h-7 px-2.5 rounded-full text-[10px] font-extrabold transition-all duration-200 cursor-pointer ${
                  textSize === 'sm' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
                }`}
                title="Decrease Text Size"
              >
                A-
              </button>
              <button
                onClick={() => applyTextSize('md')}
                className={`h-7 px-2.5 rounded-full text-[10px] font-extrabold transition-all duration-200 cursor-pointer ${
                  textSize === 'md' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
                }`}
                title="Normal Text Size"
              >
                A
              </button>
              <button
                onClick={() => applyTextSize('lg')}
                className={`h-7 px-2.5 rounded-full text-[10px] font-extrabold transition-all duration-200 cursor-pointer ${
                  textSize === 'lg' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
                }`}
                title="Increase Text Size"
              >
                A+
              </button>
            </div>

            {/* Language Selector Pill */}
            <div className="h-9 flex items-center bg-white dark:bg-slate-900 rounded-full px-1 border border-border shadow-xs">
              <button
                onClick={() => setLanguage('en')}
                className={`h-7 px-3.5 rounded-full text-[10px] font-extrabold transition-all duration-200 cursor-pointer ${
                  language === 'en' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('ta')}
                className={`h-7 px-3.5 rounded-full text-[10px] font-extrabold transition-all duration-200 cursor-pointer ${
                  language === 'ta' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
                }`}
              >
                தமிழ்
              </button>
            </div>
          </div>
        </div>

        {/* Main Public navigation Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <img src="/tn-emblem.svg" alt="TN Crest Logo" className="w-9 h-9 object-contain" />
            <div>
              <h1 className="font-extrabold text-sm text-foreground tracking-tight leading-none">{t('gramSevaAI')}</h1>
              <p className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase mt-1">{t('citizenPortal')}</p>
            </div>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="w-full max-w-md relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-secondary/80 border border-border focus:outline-none focus:ring-2 focus:ring-primary/45 transition-all"
            />
          </form>

          {/* Nav links */}
          <div className="hidden lg:flex items-center gap-6 text-xs font-bold text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-all">Home</Link>
            <Link href="/login" className="hover:text-primary transition-all">Schemes</Link>
            <Link href="/login" className="hover:text-primary transition-all">Services</Link>
            <a href="#news" className="hover:text-primary transition-all">News</a>
            <Link href="/login" className="hover:text-primary transition-all flex items-center gap-1">
              <Bot className="w-3.5 h-3.5 text-purple-500" /> AI Assistant
            </Link>
          </div>

          {/* Dynamic Action Buttons Row */}
          <div className="flex items-center gap-3 relative">
            {/* Dynamic auth trigger button */}
            {user ? (
              <Link
                href={profile?.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {language === 'en' ? 'Portal' : 'போர்ட்டல்'} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                {language === 'en' ? 'Login' : 'உள்நுழை'}
              </Link>
            )}

            {/* Hamburger Menu Button */}
            <div className="relative">
              <button
                onClick={() => { setMenuOpen(!menuOpen); setProfileOpen(false); }}
                className="w-9 h-9 rounded-full bg-white dark:bg-slate-900 border border-border text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500/30 flex items-center justify-center shadow-xs hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                title="Main Menu"
              >
                <Menu className="w-4.5 h-4.5" />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-2xl shadow-lg py-2.5 z-50 font-semibold text-xs text-foreground"
                  >
                    <Link href="/" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-secondary hover:text-primary transition-all">Home</Link>
                    <Link href={user ? "/schemes" : "/login"} onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-secondary hover:text-primary transition-all">Government Schemes</Link>
                    <Link href={user ? "/dashboard" : "/login"} onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-secondary hover:text-primary transition-all">Public Services</Link>
                    <a href="#news" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-secondary hover:text-primary transition-all">Village Announcements</a>
                    <a href="#news" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-secondary hover:text-primary transition-all">News & Updates</a>
                    <Link href={user ? "/ai-assistant" : "/login"} onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-secondary hover:text-primary transition-all flex items-center gap-1.5"><Bot className="w-4 h-4 text-purple-500" /> AI Assistant</Link>
                    <a href="#emergency" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-secondary hover:text-primary transition-all">Emergency Contacts</a>
                    <Link href={user ? "/nearby-offices" : "/login"} onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-secondary hover:text-primary transition-all">Help Center</Link>
                    <a href="#emergency" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-secondary hover:text-primary transition-all font-bold border-t border-border mt-1 pt-2">Contact Us</a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => { setProfileOpen(!profileOpen); setMenuOpen(false); }}
                className="w-9 h-9 rounded-full bg-white dark:bg-slate-900 border border-border text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500/30 flex items-center justify-center shadow-xs hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                title="Profile Account"
              >
                <CircleUserRound className="w-5 h-5" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-2xl shadow-lg py-2.5 z-50 font-semibold text-xs text-foreground"
                  >
                    {user ? (
                      <>
                        <div className="px-4 py-1.5 border-b border-border/80 mb-1.5">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">Logged In As</p>
                          <p className="font-black text-foreground truncate">{profile?.name || user.email}</p>
                        </div>
                        <Link href={profile?.role === 'admin' ? "/admin/dashboard" : "/dashboard"} onClick={() => setProfileOpen(false)} className="block px-4 py-2 hover:bg-secondary hover:text-primary transition-all">Dashboard</Link>
                        <Link href={profile?.role === 'admin' ? "/admin/dashboard?tab=settings" : "/profile"} onClick={() => setProfileOpen(false)} className="block px-4 py-2 hover:bg-secondary hover:text-primary transition-all">Profile</Link>
                        <Link href={profile?.role === 'admin' ? "/admin/dashboard?tab=settings" : "/profile"} onClick={() => setProfileOpen(false)} className="block px-4 py-2 hover:bg-secondary hover:text-primary transition-all">Settings</Link>
                        <button
                          onClick={() => { setProfileOpen(false); logout(); }}
                          className="w-full text-left px-4 py-2 hover:bg-secondary text-red-600 dark:text-red-400 hover:text-red-700 font-bold border-t border-border mt-1.5 pt-2 transition-all cursor-pointer"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link href="/login" onClick={() => setProfileOpen(false)} className="block px-4 py-2 hover:bg-secondary hover:text-primary transition-all">Login</Link>
                        <Link href="/login" onClick={() => setProfileOpen(false)} className="block px-4 py-2 hover:bg-secondary hover:text-primary transition-all">Register</Link>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Social Media Popup Trigger */}
            <button
              onClick={() => setSocialOpen(true)}
              className="w-9 h-9 rounded-full bg-white dark:bg-slate-900 border border-border text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500/30 flex items-center justify-center shadow-xs hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              title="Share & Social Channels"
            >
              <Share2 className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── PUBLIC HERO CAROUSEL ── */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 flex-1">
        
        {/* Dynamic Carousel */}
        <div className="relative h-[250px] sm:h-[380px] w-full overflow-hidden rounded-3xl shadow-xl border border-border">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${CAROUSEL_SLIDES[activeSlide].image})` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-tr ${CAROUSEL_SLIDES[activeSlide].color} z-10`} />
              
              <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 sm:p-12 text-white space-y-3 sm:space-y-4">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-[10px] sm:text-xs font-bold tracking-wider uppercase backdrop-blur-md mb-2">
                    {CAROUSEL_SLIDES[activeSlide].badge}
                  </span>
                  <h2 className="text-xl sm:text-3.5xl font-extrabold tracking-tight leading-tight max-w-2xl">
                    {CAROUSEL_SLIDES[activeSlide].title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-200 max-w-xl line-clamp-2 mt-1 leading-relaxed">
                    {CAROUSEL_SLIDES[activeSlide].desc}
                  </p>
                </div>
                
                <div>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-slate-900 rounded-xl font-bold text-xs hover:bg-slate-100 transition-all cursor-pointer shadow-md"
                  >
                    {t('learnMore')} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots and arrows */}
          <div className="absolute bottom-4 right-4 z-30 flex items-center gap-2">
            <button
              onClick={() => setActiveSlide((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length)}
              className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-1.5">
              {CAROUSEL_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${activeSlide === idx ? 'w-5 bg-white' : 'w-2 bg-white/40'}`}
                />
              ))}
            </div>
            <button
              onClick={() => setActiveSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length)}
              className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── KEY PORTAL STATISTICS ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {STATS_ITEMS.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card p-4 flex flex-col justify-between border-t-2 border-t-primary/35 shadow-xs"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t(item.translationKey)}</span>
                <item.icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black tracking-tight mt-1">{item.value.toLocaleString()}{item.suffix}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── PUBLIC SERVICES SECTION ── */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Landmark className="w-5 h-5 text-primary" />
              {t('govServices')}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">{t('servicesDesc')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {GOV_SERVICES.map((svc, idx) => (
              <div key={idx} className="glass-card p-5 flex flex-col justify-between hover:border-primary/35 hover:shadow-md transition-all group">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <svc.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm leading-snug">{t(svc.translationKey)}</h4>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">{t(svc.descKey)}</p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-border/40">
                  <button
                    onClick={handleApplyClick}
                    className="w-full text-center py-2 px-3 bg-secondary hover:bg-primary hover:text-primary-foreground text-foreground border border-border hover:border-transparent rounded-xl text-[11px] font-bold transition-all cursor-pointer"
                  >
                    {t('applyNow')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── AI ASSISTANT PREVIEW SECTION ── */}
        <div className="glass-card p-6 border-t-4 border-t-purple-500 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="font-bold text-base">{t('askAiTitle')}</h3>
              </div>
              <span className="badge bg-purple-500/10 text-purple-400 border-transparent font-semibold text-[10px] flex items-center gap-1">
                <Sparkles className="w-3 h-3 animate-pulse" /> {t('liveAssistant')}
              </span>
            </div>
            
            <p className="text-xs text-muted-foreground leading-relaxed">{t('askAiDesc')}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              <Link href="/login" className="p-3 rounded-xl border border-border hover:border-purple-500/40 hover:bg-purple-500/5 transition-all text-[11px] text-left text-muted-foreground hover:text-foreground flex items-center gap-2 cursor-pointer">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                "{t('sugFarmers')}"
              </Link>
              <Link href="/login" className="p-3 rounded-xl border border-border hover:border-purple-500/40 hover:bg-purple-500/5 transition-all text-[11px] text-left text-muted-foreground hover:text-foreground flex items-center gap-2 cursor-pointer">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                "{t('sugIncome')}"
              </Link>
              <Link href="/login" className="p-3 rounded-xl border border-border hover:border-purple-500/40 hover:bg-purple-500/5 transition-all text-[11px] text-left text-muted-foreground hover:text-foreground flex items-center gap-2 cursor-pointer">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                "{t('sugPatta')}"
              </Link>
              <Link href="/login" className="p-3 rounded-xl border border-border hover:border-purple-500/40 hover:bg-purple-500/5 transition-all text-[11px] text-left text-muted-foreground hover:text-foreground flex items-center gap-2 cursor-pointer">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                "{t('sugStudent')}"
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t border-border/50 flex items-center justify-between mt-4">
            <span className="text-[10px] text-muted-foreground">{t('poweredByGroq')}</span>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md transition-all cursor-pointer"
            >
              {t('startChatting')} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* ── FEATURED GOVERNMENT SCHEMES ── */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                {t('welfareSchemes')}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Browse through key rural & state welfare schemes.</p>
            </div>
            <Link href="/login" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
              {t('allSchemes')} <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURED_SCHEMES.map((scheme, idx) => (
              <div key={idx} className="glass-card p-5 hover:border-primary/35 hover:shadow-md transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{scheme.dept}</span>
                    <span className="badge bg-primary/5 text-primary border-primary/10 text-[9px] font-bold px-2 py-0.5 rounded">{scheme.category}</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-foreground line-clamp-1">{scheme.name}</h4>
                  <div className="space-y-1.5 pt-1 text-xs">
                    <p className="text-muted-foreground"><strong className="text-foreground font-semibold">Eligibility:</strong> {scheme.eligibility}</p>
                    <p className="text-muted-foreground"><strong className="text-foreground font-semibold">Benefits:</strong> {scheme.benefits}</p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-border/40 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Last Date: {scheme.deadline}
                  </span>
                  <Link
                    href="/login"
                    className="px-3.5 py-1.5 bg-primary text-primary-foreground rounded-lg font-bold text-[10px] hover:opacity-90 transition-all cursor-pointer"
                  >
                    {t('applyNow')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── TWO-COLUMN FEED: VILLAGE NOTICES & PORTAL NEWS ── */}
        <div id="news" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Announcements */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              {t('villageAnnounce')}
            </h3>
            
            <div className="space-y-3">
              {VILLAGE_ANNOUNCEMENTS.map((not, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-card border border-border shadow-xs hover:border-primary/20 transition-all space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full font-bold uppercase">{not.category}</span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold">
                      <Clock className="w-3 h-3" />
                      {not.date}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm leading-tight text-foreground">{t(not.titleKey as any)}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t(not.descKey as any)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Portal News */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-500" />
              {t('latestNews')}
            </h3>
            
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-card border border-border shadow-xs hover:border-purple-500/20 transition-all flex gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-border hidden sm:block">
                  <img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=150" alt="News" className="w-full h-full object-cover" />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-purple-500 font-bold uppercase">Panchayat Update</span>
                  <h4 className="font-bold text-sm leading-snug">{t('news1Title')}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{t('news1Desc')}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border shadow-xs hover:border-purple-500/20 transition-all flex gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-border hidden sm:block">
                  <img src="https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?w=150" alt="News" className="w-full h-full object-cover" />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-purple-500 font-bold uppercase">Agriculture</span>
                  <h4 className="font-bold text-sm leading-snug">{t('news2Title')}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{t('news2Desc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── EMERGENCY CONTACT HELPLINES ── */}
        <div id="emergency" className="relative overflow-hidden space-y-6 bg-red-500/[0.03] dark:bg-red-950/[0.05] p-6 sm:p-8 rounded-3xl border border-red-500/25">
          {/* Section Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
            <img 
              src="/tn-emblem.svg" 
              alt="Tamil Nadu Crest Watermark" 
              className="w-[70%] max-w-[280px] aspect-square object-contain opacity-[0.20] filter grayscale contrast-[0.9] brightness-[1.05] blur-[2.5px]" 
              style={{
                maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 100%)',
                WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 100%)'
              }}
            />
          </div>

          <div className="relative z-10">
            <h2 className="text-lg font-extrabold flex items-center gap-2 text-red-600 dark:text-red-400">
              <ShieldAlert className="w-5.5 h-5.5" />
              {t('emergencyHelpline')}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">{t('emergencyDesc')}</p>
          </div>

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-card p-4 rounded-2xl border border-border/80 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                  <Phone className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs">{t('police')}</h4>
                  <p className="text-sm font-black text-red-600 dark:text-red-400 mt-0.5">100</p>
                </div>
              </div>
              <a href="tel:100" className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-[10px] font-bold shadow-xs hover:bg-red-600 transition-all cursor-pointer">
                {t('call')}
              </a>
            </div>

            <div className="bg-card p-4 rounded-2xl border border-border/80 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                  <Phone className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs">{t('fire')}</h4>
                  <p className="text-sm font-black text-red-600 dark:text-red-400 mt-0.5">101</p>
                </div>
              </div>
              <a href="tel:101" className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-[10px] font-bold shadow-xs hover:bg-red-600 transition-all cursor-pointer">
                {t('call')}
              </a>
            </div>

            <div className="bg-card p-4 rounded-2xl border border-border/80 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                  <Phone className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs">{t('ambulance')}</h4>
                  <p className="text-sm font-black text-red-600 dark:text-red-400 mt-0.5">108</p>
                </div>
              </div>
              <a href="tel:108" className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-[10px] font-bold shadow-xs hover:bg-red-600 transition-all cursor-pointer">
                {t('call')}
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* ── FOOTER ── */}
      <footer className="w-full mt-12 pt-10 pb-6 bg-[#0f172a] text-slate-100 rounded-3xl p-6 sm:p-10 space-y-8 shadow-lg border border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img src="/tn-emblem.svg" alt="TN Crest Logo" className="w-9 h-9 object-contain invert brightness-200" />
              <div>
                <h4 className="font-bold text-sm text-white">{t('gramSevaAI')}</h4>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">{t('govOfTN')}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{t('footerAbout')}</p>
          </div>

          <div className="space-y-3">
            <h5 className="font-extrabold text-xs text-white uppercase tracking-wider">{t('usefulLinks')}</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/login" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer"><ChevronRight className="w-3.5 h-3.5" />{t('welfareSchemes')}</Link></li>
              <li><Link href="/login" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer"><ChevronRight className="w-3.5 h-3.5" />{t('aiAssistant')}</Link></li>
              <li><Link href="/login" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer"><ChevronRight className="w-3.5 h-3.5" />{t('nearbyOffices')}</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-extrabold text-xs text-white uppercase tracking-wider">{t('aboutTitle')}</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"><ChevronRight className="w-3.5 h-3.5" />{t('privacyPolicy')}</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"><ChevronRight className="w-3.5 h-3.5" />{t('termsConditions')}</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"><ChevronRight className="w-3.5 h-3.5" />{t('citizenCharter')}</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500 font-semibold">
          <p>{t('copyright')}</p>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>{t('disclaimer')}</span>
          </div>
        </div>
      </footer>

      {/* ── SOCIAL SHARE MODAL DIALOG ── */}
      <AnimatePresence>
        {socialOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSocialOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-border p-6 rounded-[16px] w-full max-w-sm space-y-4 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-extrabold text-sm flex items-center gap-1.5 text-foreground">
                  <Share2 className="w-4.5 h-4.5 text-primary" /> Official Channels & Share
                </h3>
                <button
                  onClick={() => setSocialOpen(false)}
                  className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <motion.a
                  href="https://x.com/TNDIPRNEWS"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center justify-center p-5 bg-slate-50 dark:bg-slate-800/30 border border-border/60 hover:border-blue-400 hover:bg-blue-50/10 rounded-xl transition-colors cursor-pointer aspect-square text-foreground group"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    <FaXTwitter className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground mt-2 group-hover:text-foreground">X (Twitter)</span>
                </motion.a>

                <motion.a
                  href="https://www.facebook.com/CMOTamilnadu/"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center justify-center p-5 bg-slate-50 dark:bg-slate-800/30 border border-border/60 hover:border-blue-600 hover:bg-blue-600/10 rounded-xl transition-colors cursor-pointer aspect-square text-foreground group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    <FaFacebookF className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground mt-2 group-hover:text-foreground">Facebook</span>
                </motion.a>

                <motion.a
                  href="https://www.instagram.com/cmotamilnadu"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center justify-center p-5 bg-slate-50 dark:bg-slate-800/30 border border-border/60 hover:border-pink-500 hover:bg-pink-500/10 rounded-xl transition-colors cursor-pointer aspect-square text-foreground group"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    <FaInstagram className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground mt-2 group-hover:text-foreground">Instagram</span>
                </motion.a>

                <motion.a
                  href="https://www.youtube.com/@TNDIPR21"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center justify-center p-5 bg-slate-50 dark:bg-slate-800/30 border border-border/60 hover:border-red-500 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer aspect-square text-foreground group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#FF0000] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    <FaYoutube className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground mt-2 group-hover:text-foreground">YouTube</span>
                </motion.a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
