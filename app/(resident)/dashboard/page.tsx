'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import { useLanguage } from '@/components/providers/language-provider'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Search, ChevronRight, ChevronLeft, FileText, Coins, Users, MapPin, 
  Landmark, Droplet, Zap, Award, Leaf, HeartPulse, GraduationCap, 
  Bot, Sparkles, Clock, Phone, ExternalLink, ShieldAlert, Globe, 
  HelpCircle, Activity, ArrowRight, CheckCircle2, AlertCircle, 
  Calendar, ShieldCheck, CheckSquare, PlusCircle
} from 'lucide-react'

// Live data counts for stats cards
const STATS_ITEMS = [
  { translationKey: 'citizensRegistered', value: 1080, suffix: '+', icon: Users, color: 'text-blue-500' },
  { translationKey: 'schemesAvailable', value: 92, suffix: '', icon: FileText, color: 'text-orange-500' },
  { translationKey: 'certificatesIssued', value: 450, suffix: '+', icon: Award, color: 'text-emerald-500' },
  { translationKey: 'complaintsResolved', value: 210, suffix: '+', icon: CheckCircle2, color: 'text-teal-500' },
  { translationKey: 'aiQueriesToday', value: 120, suffix: '+', icon: Bot, color: 'text-purple-500' },
  { translationKey: 'villagePopulation', value: 4200, suffix: '', icon: Globe, color: 'text-indigo-500' },
] as const

// Government services grid definition
const GOV_SERVICES = [
  { translationKey: 'birthCert', descKey: 'birthCertDesc', icon: FileText, href: '/schemes?category=Student' },
  { translationKey: 'deathCert', descKey: 'deathCertDesc', icon: FileText, href: '/schemes?category=Other' },
  { translationKey: 'incomeCert', descKey: 'incomeCertDesc', icon: Coins, href: '/schemes?category=Education' },
  { translationKey: 'communityCert', descKey: 'communityCertDesc', icon: Users, href: '/schemes?category=Education' },
  { translationKey: 'nativityCert', descKey: 'nativityCertDesc', icon: MapPin, href: '/schemes?category=Other' },
  { translationKey: 'pattaTransfer', descKey: 'pattaTransferDesc', icon: Landmark, href: '/schemes?category=Agriculture' },
  { translationKey: 'waterConn', descKey: 'waterConnDesc', icon: Droplet, href: '/schemes?category=Housing' },
  { translationKey: 'electricitySvc', descKey: 'electricitySvcDesc', icon: Zap, href: '/schemes?category=Housing' },
  { translationKey: 'pensionSvc', descKey: 'pensionSvcDesc', icon: Award, href: '/schemes?category=Senior Citizen' },
  { translationKey: 'agriSvc', descKey: 'agriSvcDesc', icon: Leaf, href: '/schemes?category=Agriculture' },
  { translationKey: 'healthSvc', descKey: 'healthSvcDesc', icon: HeartPulse, href: '/schemes?category=Health' },
  { translationKey: 'eduSupport', descKey: 'eduSupportDesc', icon: GraduationCap, href: '/schemes?category=Student' },
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

export default function ResidentDashboard() {
  const { profile } = useAuth()
  const { t, language } = useLanguage()
  const router = useRouter()

  const [activeSlide, setActiveSlide] = useState(0)
  const [searchVal, setSearchVal] = useState('')
  const [greetingKey, setGreetingKey] = useState<'goodMorning' | 'goodAfternoon' | 'goodEvening' | 'goodDay'>('goodDay')

  // Auto-slide carousel state
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
    const hour = new Date().getHours()
    if (hour < 12) setGreetingKey('goodMorning')
    else if (hour < 18) setGreetingKey('goodAfternoon')
    else setGreetingKey('goodEvening')

    // Interval setup for auto-sliding (5 seconds)
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [CAROUSEL_SLIDES.length])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchVal.trim()) return
    router.push(`/schemes?search=${encodeURIComponent(searchVal)}`)
  }

  const handleAiSearch = () => {
    if (!searchVal.trim()) {
      router.push('/ai-assistant')
    } else {
      router.push(`/ai-assistant?q=${encodeURIComponent(searchVal)}`)
    }
  }

  const handleApplyService = (serviceName: string) => {
    toast.success(`${serviceName} application initialized successfully!`)
  }

  const firstName = profile?.name?.split(' ')[0] ?? 'Citizen'
  const profileComplete = profile?.profile_complete ?? false

  return (
    <div className="space-y-8 pt-2 pb-12 min-h-screen relative">
      
      {/* ── TOP SEARCH & HERO PORTAL SECTION ── */}
      <div className="space-y-5">
        {/* Welcome Greeting Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-sky-50 via-white to-emerald-50 p-4 rounded-[22px] border border-sky-100 shadow-sm">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              {t(greetingKey)}, {firstName}! 👋
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {language === 'en' ? 'Welcome to your village unified digital services dashboard.' : 'உங்களது கிராமத்தின் ஒருங்கிணைந்த டிஜிட்டல் சேவைகள் முகப்புப்பலகை.'}
            </p>
          </div>
          {/* Quick Stats Summary pill */}
          <div className="flex items-center gap-2 bg-background border border-border px-3 py-1.5 rounded-xl self-start md:self-auto text-xs font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>VAO Portal Active • Ward 1</span>
          </div>
        </div>

        {/* Global Search Interface */}
        <form onSubmit={handleSearchSubmit} className="w-full flex flex-col sm:flex-row gap-2 rounded-[24px] border border-slate-200/80 bg-white/80 p-2 shadow-[0_10px_35px_rgba(15,23,42,0.05)] backdrop-blur-sm">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-11 pr-4 py-3 rounded-[18px] bg-transparent border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-0 transition-all shadow-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="btn-primary px-6 py-3 rounded-[18px] shadow-[0_10px_30px_rgba(2,132,199,0.16)]"
            >
              {language === 'en' ? 'Search' : 'தேடுக'}
            </button>
            <button
              type="button"
              onClick={handleAiSearch}
              className="inline-flex items-center justify-center gap-2 rounded-[18px] bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(139,92,246,0.22)] transition-all hover:-translate-y-0.5 hover:bg-violet-700"
            >
              <Bot className="w-4 h-4" />
              <span>{language === 'en' ? 'AI Search' : 'AI தேடல்'}</span>
            </button>
          </div>
        </form>

        {/* Dynamic Carousel */}
        <div className="relative h-[250px] sm:h-[350px] w-full overflow-hidden rounded-[28px] shadow-[0_18px_55px_rgba(15,23,42,0.12)] border border-slate-200/80">
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
              {/* Overlay Gradient color depending on slide theme */}
              <div className={`absolute inset-0 bg-gradient-to-tr ${CAROUSEL_SLIDES[activeSlide].color} z-10`} />
              
              <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 sm:p-10 text-white space-y-3 sm:space-y-4">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-[10px] sm:text-xs font-bold tracking-wider uppercase backdrop-blur-md mb-2">
                    {CAROUSEL_SLIDES[activeSlide].badge}
                  </span>
                  <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight leading-tight max-w-2xl">
                    {CAROUSEL_SLIDES[activeSlide].title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-200 max-w-xl line-clamp-2 mt-1">
                    {CAROUSEL_SLIDES[activeSlide].desc}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <Link
                    href="/schemes"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-slate-900 rounded-xl font-bold text-xs hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    {t('learnMore')} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Slide dots and nav arrows */}
          <div className="absolute bottom-4 right-4 z-30 flex items-center gap-2">
            <button
              onClick={() => setActiveSlide((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length)}
              aria-label="Show previous highlight"
              className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-1.5">
              {CAROUSEL_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    activeSlide === idx ? 'w-5 bg-white' : 'w-2 bg-white/40'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => setActiveSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length)}
              aria-label="Show next highlight"
              className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── QUICK ACCESS PORTAL BAR ── */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{t('quickAccess')}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <Link href="/schemes?category=Student" className="p-3 rounded-[18px] bg-card border border-border hover:border-primary/30 hover:bg-primary/5 transition-all text-center flex flex-col items-center gap-2 group cursor-pointer shadow-sm">
            <FileText className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold">{language === 'en' ? 'Apply Certificate' : 'சான்றிதழ் விண்ணப்பம்'}</span>
          </Link>
          <Link href="/profile" className="p-3 rounded-2xl bg-card border border-border hover:border-primary/30 hover:bg-primary/5 transition-all text-center flex flex-col items-center gap-2 group cursor-pointer shadow-xs">
            <CheckSquare className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold">{language === 'en' ? 'Track Application' : 'விண்ணப்பத் தடம்'}</span>
          </Link>
          <Link href="/ai-assistant" className="p-3 rounded-2xl bg-card border border-border hover:border-primary/30 hover:bg-primary/5 transition-all text-center flex flex-col items-center gap-2 group cursor-pointer shadow-xs">
            <AlertCircle className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold">{language === 'en' ? 'Register Complaint' : 'புகார் அளித்தல்'}</span>
          </Link>
          <Link href="/schemes" className="p-3 rounded-2xl bg-card border border-border hover:border-primary/30 hover:bg-primary/5 transition-all text-center flex flex-col items-center gap-2 group cursor-pointer shadow-xs">
            <Search className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold">{language === 'en' ? 'Find Scheme' : 'திட்டத் தேடல்'}</span>
          </Link>
          <Link href="/nearby-offices" className="p-3 rounded-2xl bg-card border border-border hover:border-primary/30 hover:bg-primary/5 transition-all text-center flex flex-col items-center gap-2 group cursor-pointer shadow-xs">
            <Landmark className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold">{language === 'en' ? 'Contact Panchayat' : 'பஞ்சாயத்து தொடர்பு'}</span>
          </Link>
          <a href="#emergency" className="p-3 rounded-2xl bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 transition-all text-center flex flex-col items-center gap-2 group cursor-pointer shadow-xs">
            <ShieldAlert className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-red-600 dark:text-red-400">{language === 'en' ? 'Emergency Help' : 'அவசர உதவி'}</span>
          </a>
        </div>
      </div>

      {/* ── LIVE STATISTICS DATA WIDGETS ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {STATS_ITEMS.map((item, idx) => {
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card p-4 flex flex-col justify-between border-t-2 border-t-primary/35 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t(item.translationKey)}</span>
                <item.icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black tracking-tight mt-1">
                  {item.value.toLocaleString()}{item.suffix}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* ── CITIZEN ACTIVE PORTAL STATUS (APPLICATIONS & COMPLAINTS) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Certificate Applications Status */}
        <div className="glass-card p-5 space-y-4 border-l-4 border-l-blue-600 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              {language === 'en' ? 'Recent Applications & Certificates' : 'சமீபத்திய விண்ணப்பங்கள் & சான்றிதழ்கள்'}
            </h3>
            <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold px-2 py-0.5 rounded-full">
              4 Active
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 border border-border/60 text-xs">
              <div>
                <p className="font-bold">{t('incomeCert')}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Applied: 2026-07-01 • ID: #INC-9081</p>
              </div>
              <span className="badge badge-status-approved text-[10px]">
                {language === 'en' ? 'Approved & Issued' : 'அங்கீகரிக்கப்பட்டது'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 border border-border/60 text-xs">
              <div>
                <p className="font-bold">{t('nativityCert')}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Applied: 2026-07-05 • ID: #NAT-4421</p>
              </div>
              <span className="badge badge-status-pending text-[10px]">
                {language === 'en' ? 'Pending VAO Review' : 'பரிசீலனையில் உள்ளது'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 border border-border/60 text-xs">
              <div>
                <p className="font-bold">{t('pattaTransfer')}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Applied: 2026-07-06 • ID: #PT-1092</p>
              </div>
              <span className="badge badge-status-inprogress text-[10px]">
                {language === 'en' ? 'In Progress' : 'நடவடிக்கையில் உள்ளது'}
              </span>
            </div>
          </div>
        </div>

        {/* Complaint Status */}
        <div className="glass-card p-5 space-y-4 border-l-4 border-l-red-600 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              {language === 'en' ? 'Track Complaints' : 'புகார்கள் மற்றும் தீர்வுகள்'}
            </h3>
            <span className="text-[10px] bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-bold px-2 py-0.5 rounded-full">
              2 Registered
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 border border-border/60 text-xs">
              <div>
                <p className="font-bold">{language === 'en' ? 'Streetlight Outage - Ward 2' : 'தெருவிளக்கு பழுது - வார்டு 2'}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Filed: 2026-06-28 • ID: #CMP-1022</p>
              </div>
              <span className="badge badge-status-resolved text-[10px]">
                {language === 'en' ? 'Resolved' : 'தீர்க்கப்பட்டது'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 border border-border/60 text-xs">
              <div>
                <p className="font-bold">{language === 'en' ? 'Water Pipe Leakage' : 'குடிநீர் குழாய் கசிவு'}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Filed: 2026-07-04 • ID: #CMP-1902</p>
              </div>
              <span className="badge badge-status-assigned text-[10px]">
                {language === 'en' ? 'Assigned to Officer' : 'அதிகாரிக்கு ஒதுக்கப்பட்டது'}
              </span>
            </div>

            <Link href="/ai-assistant" className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-xl text-[10px] font-bold text-red-600 dark:text-red-400 transition-all cursor-pointer">
              {language === 'en' ? 'File a New Complaint with AI' : 'AI மூலம் புதிய புகார் அளி'}
            </Link>
          </div>
        </div>
      </div>

      {/* ── GOVERNMENT SERVICES SECTION ── */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Landmark className="w-5 h-5 text-primary" />
            {t('govServices')}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">{t('servicesDesc')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {GOV_SERVICES.map((svc, idx) => {
            return (
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
                    onClick={() => handleApplyService(t(svc.translationKey))}
                    className="w-full text-center py-2 px-3 bg-secondary hover:bg-primary hover:text-primary-foreground text-foreground border border-border hover:border-transparent rounded-xl text-[11px] font-bold transition-all cursor-pointer"
                  >
                    {t('applyNow')}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── DUAL BANNER: CHATBOT SUGGESTIONS & RECOMMENDED SCHEMES ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive AI Chatbot Teaser */}
        <div className="lg:col-span-2 glass-card p-6 border-t-4 border-t-purple-500 flex flex-col justify-between shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
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
            
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('askAiDesc')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              <Link href="/ai-assistant?q=Find%20schemes%20for%20farmers" className="p-3 rounded-xl border border-border hover:border-purple-500/40 hover:bg-purple-500/5 transition-all text-[11px] text-left text-muted-foreground hover:text-foreground flex items-center gap-2 cursor-pointer">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                "{t('sugFarmers')}"
              </Link>
              <Link href="/ai-assistant?q=Documents%20needed%20for%20Income%20Certificate" className="p-3 rounded-xl border border-border hover:border-purple-500/40 hover:bg-purple-500/5 transition-all text-[11px] text-left text-muted-foreground hover:text-foreground flex items-center gap-2 cursor-pointer">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                "{t('sugIncome')}"
              </Link>
              <Link href="/ai-assistant?q=How%20do%20I%20apply%20for%20Patta" className="p-3 rounded-xl border border-border hover:border-purple-500/40 hover:bg-purple-500/5 transition-all text-[11px] text-left text-muted-foreground hover:text-foreground flex items-center gap-2 cursor-pointer">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                "{t('sugPatta')}"
              </Link>
              <Link href="/ai-assistant?q=Show%20scholarships%20for%20students" className="p-3 rounded-xl border border-border hover:border-purple-500/40 hover:bg-purple-500/5 transition-all text-[11px] text-left text-muted-foreground hover:text-foreground flex items-center gap-2 cursor-pointer">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                "{t('sugStudent')}"
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t border-border/50 flex items-center justify-between mt-4">
            <span className="text-[10px] text-muted-foreground">{t('poweredByGroq')}</span>
            <Link
              href="/ai-assistant"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md transition-all cursor-pointer"
            >
              {t('startChatting')} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Recommended for You widget panel */}
        <div className="glass-card p-6 border-t-4 border-t-emerald-500 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base">{t('recommendedForYou')}</h3>
            </div>
            <p className="text-xs text-muted-foreground">{t('recommendedDesc')}</p>

            <div className="space-y-2 pt-2">
              {/* Profile completeness matching */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-xs font-semibold">
                <span className="text-emerald-700 dark:text-emerald-300">Farmer Fertiliser Subsidy</span>
                <span className="badge bg-emerald-500/15 text-emerald-500 border-transparent text-[9px] font-bold">95% Match</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-xs font-semibold">
                <span className="text-emerald-700 dark:text-emerald-300">PMAY Gramin Housing Grant</span>
                <span className="badge bg-emerald-500/15 text-emerald-500 border-transparent text-[9px] font-bold">88% Match</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-xs font-semibold">
                <span className="text-emerald-700 dark:text-emerald-300">Minority Welfare Scholarship</span>
                <span className="badge bg-emerald-500/15 text-emerald-500 border-transparent text-[9px] font-bold">75% Match</span>
              </div>
            </div>
          </div>

          <Link
            href="/schemes"
            className="w-full text-center py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all mt-4 cursor-pointer"
          >
            {t('allSchemes')}
          </Link>
        </div>
      </div>

      {/* ── LATEST WELFARE SCHEMES SECTION (6 CARDS) ── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              {t('welfareSchemes')}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Explore featured central & state government welfare schemes.</p>
          </div>
          <Link href="/schemes" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
            {t('allSchemes')} <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURED_SCHEMES.map((scheme, idx) => {
            return (
              <div key={idx} className="glass-card p-5 hover:border-primary/35 hover:shadow-md transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{scheme.dept}</span>
                    <span className="badge bg-primary/5 text-primary border-primary/10 text-[9px] font-bold px-2 py-0.5 rounded">{scheme.category}</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-foreground line-clamp-1">{scheme.name}</h4>
                  <div className="space-y-1.5 pt-1 text-xs">
                    <p className="text-muted-foreground leading-relaxed"><strong className="text-foreground font-semibold">Eligibility:</strong> {scheme.eligibility}</p>
                    <p className="text-muted-foreground leading-relaxed"><strong className="text-foreground font-semibold">Benefits:</strong> {scheme.benefits}</p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-border/40 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Last Date: {scheme.deadline}
                  </span>
                  <Link
                    href={`/schemes`}
                    className="px-3.5 py-1.5 bg-primary text-primary-foreground rounded-lg font-bold text-[10px] hover:opacity-90 transition-all cursor-pointer"
                  >
                    {t('applyNow')}
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── TWO-COLUMN FEED: VILLAGE NOTICES & PORTAL NEWS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Village Announcements */}
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

            <div className="p-4 rounded-2xl bg-card border border-border shadow-xs hover:border-purple-500/20 transition-all flex gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-border hidden sm:block">
                <img src="https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=150" alt="News" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-purple-500 font-bold uppercase">Education News</span>
                <h4 className="font-bold text-sm leading-snug">{t('news3Title')}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{t('news3Desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── EMERGENCY CONTACT HELPLINES SECTION ── */}
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

          <div className="bg-card p-4 rounded-2xl border border-border/80 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                <Phone className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="font-bold text-xs">{t('womenHelpline')}</h4>
                <p className="text-sm font-black text-red-600 dark:text-red-400 mt-0.5">1091</p>
              </div>
            </div>
            <a href="tel:1091" className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-[10px] font-bold shadow-xs hover:bg-red-600 transition-all cursor-pointer">
              {t('call')}
            </a>
          </div>

          <div className="bg-card p-4 rounded-2xl border border-border/80 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                <Phone className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="font-bold text-xs">{t('villageOffice')}</h4>
                <p className="text-sm font-black text-red-600 dark:text-red-400 mt-0.5">044-2432121</p>
              </div>
            </div>
            <a href="tel:044-2432121" className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-[10px] font-bold shadow-xs hover:bg-red-600 transition-all cursor-pointer">
              {t('call')}
            </a>
          </div>
        </div>
      </div>

      {/* ── MYGOV BRANDED GOVERNMENT PORTAL FOOTER ── */}
      <footer className="mt-12 pt-10 pb-6 bg-[#0f172a] text-slate-100 rounded-3xl p-6 sm:p-10 space-y-8 shadow-lg border border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Description */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img src="/tn-emblem.svg" alt="TN Crest Logo" className="w-9 h-9 object-contain invert brightness-200" />
              <div>
                <h4 className="font-bold text-sm text-white">{t('gramSevaAI')}</h4>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">{t('govOfTN')}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('footerAbout')}
            </p>
          </div>

          {/* Links Column 1 */}
          <div className="space-y-3">
            <h5 className="font-extrabold text-xs text-white uppercase tracking-wider">{t('usefulLinks')}</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/schemes" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer">
                  <ChevronRight className="w-3.5 h-3.5" />
                  {language === 'en' ? 'Explore State Schemes' : 'மாநில நலத்திட்டங்கள்'}
                </Link>
              </li>
              <li>
                <Link href="/ai-assistant" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer">
                  <ChevronRight className="w-3.5 h-3.5" />
                  {language === 'en' ? 'GramSeva AI Assistant' : 'AI உதவி மையம்'}
                </Link>
              </li>
              <li>
                <Link href="/nearby-offices" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer">
                  <ChevronRight className="w-3.5 h-3.5" />
                  {language === 'en' ? 'Panchayat & Taluk Offices' : 'அலுவலக முகவரிகள்'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Policy Links */}
          <div className="space-y-3">
            <h5 className="font-extrabold text-xs text-white uppercase tracking-wider">{t('aboutTitle')}</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a href="#" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer">
                  <ChevronRight className="w-3.5 h-3.5" />
                  {t('privacyPolicy')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer">
                  <ChevronRight className="w-3.5 h-3.5" />
                  {t('termsConditions')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer">
                  <ChevronRight className="w-3.5 h-3.5" />
                  {t('citizenCharter')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500 font-semibold">
          <p>{t('copyright')}</p>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>{t('disclaimer')}</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
