'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/components/providers/auth-provider'
import { useLanguage } from '@/components/providers/language-provider'
import {
  ShieldCheck, Volume2, Type, CircleUserRound, Share2, X,
  Bot, ArrowRight, Home, FileText, Landmark, Bell, PanelLeft
} from 'lucide-react'
import { FaYoutube, FaInstagram, FaFacebookF } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'

export default function GovHeader() {
  const { user, profile, logout } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const pathname = usePathname()

  const [textSize, setTextSizeState] = useState<'sm' | 'md' | 'lg'>('md')
  const [profileOpen, setProfileOpen] = useState(false)
  const [socialOpen, setSocialOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setProfileOpen(false)
        setSocialOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const savedSize = localStorage.getItem('gramseva_text_size') as 'sm' | 'md' | 'lg'
    if (savedSize === 'sm' || savedSize === 'md' || savedSize === 'lg') {
      applyTextSize(savedSize)
    }
  }, [])

  const applyTextSize = (size: 'sm' | 'md' | 'lg') => {
    setTextSizeState(size)
    localStorage.setItem('gramseva_text_size', size)
    if (typeof window === 'undefined') return
    const root = document.documentElement
    if (size === 'sm') root.style.fontSize = '14px'
    else if (size === 'lg') root.style.fontSize = '18px'
    else root.style.fontSize = '16px'
  }

  const NAV_LINKS = [
    { href: '/dashboard', label: language === 'en' ? 'Home' : 'முகப்பு', icon: Home },
    { href: '/schemes', label: language === 'en' ? 'Latest Schemes' : 'திட்டங்கள்', icon: FileText },
    { href: '/services', label: language === 'en' ? 'Village Services' : 'சேவைகள்', icon: Landmark },
    { href: '/announcements', label: language === 'en' ? 'Announcements' : 'அறிவிப்புகள்', icon: Bell },
    { href: '/ai-assistant', label: 'GramSeva AI', icon: Bot, highlight: true },
  ]

  return (
    <>
      <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-xs backdrop-blur-md">

        {/* ── 1. TRICOLOR STRIP ── */}
        <div className="w-full h-1 flex">
          <div className="flex-1 bg-[#FF9933]" />
          <div className="flex-1 bg-white dark:bg-slate-300" />
          <div className="flex-1 bg-[#138808]" />
        </div>

        {/* ── 2. ACCESSIBILITY BAR ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/80">
          {/* Left: Gov label */}
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
            <span className="uppercase tracking-wider font-bold hidden sm:inline text-slate-800 dark:text-slate-200 text-[10px]">
              Government of Tamil Nadu • Rural Development &amp; Panchayat Raj
            </span>
            <span className="sm:hidden font-extrabold text-[#0F766E] text-[10px]">
              {language === 'en' ? 'Govt of TN • GramSeva AI' : 'தமிழ்நாடு அரசு • கிராமசேவா'}
            </span>
          </div>

          {/* Right: Screen reader + font sizer + language */}
          <div className="flex items-center gap-2.5">
            {/* Screen Reader */}
            <button
              onClick={() => alert('Screen reader utility active.')}
              className="h-7 hidden md:flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-[#0F766E] px-3 gap-1.5 transition-all text-[10px] font-semibold cursor-pointer"
            >
              <Volume2 className="w-3 h-3" />
              <span>{t('screenReader')}</span>
            </button>

            {/* Font Sizer */}
            <div className="h-7 flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-1 border border-slate-200 dark:border-slate-700">
              <Type className="w-3 h-3 text-slate-400 mx-1.5" />
              {(['sm', 'md', 'lg'] as const).map((size, i) => (
                <button
                  key={size}
                  onClick={() => applyTextSize(size)}
                  className={`h-5 px-2 rounded-full text-[9px] font-extrabold transition-all cursor-pointer ${
                    textSize === size ? 'bg-[#0F766E] text-white' : 'text-slate-600 dark:text-slate-300 hover:text-[#0F766E]'
                  }`}
                  title={size === 'sm' ? 'Decrease text' : size === 'lg' ? 'Increase text' : 'Normal text'}
                >
                  {['A-', 'A', 'A+'][i]}
                </button>
              ))}
            </div>

            {/* Language Selector */}
            <div className="h-7 flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-1 border border-slate-200 dark:border-slate-700">
              {([
                { code: 'en', label: 'EN' },
                { code: 'ta', label: 'குடிமி' },
              ] as { code: 'en' | 'ta' | 'hi'; label: string }[]).map(({ code, label }) => (
                <button
                  key={code}
                  onClick={() => setLanguage(code)}
                  className={`h-5 px-2.5 rounded-full text-[9px] font-extrabold transition-all cursor-pointer ${
                    language === code ? 'bg-[#0F766E] text-white' : 'text-slate-600 dark:text-slate-300 hover:text-[#0F766E]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── 3. MAIN BRANDING NAV BAR ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-3">
            {/* Sidebar Slide / Toggle Button (Desktop & Mobile) */}
            <button
              onClick={() => window.dispatchEvent(new Event('toggle-sidebar'))}
              className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-[#0F766E] hover:border-[#0F766E]/40 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 flex-shrink-0"
              title="Toggle Sidebar Navigation (Slide Button)"
            >
              <PanelLeft className="w-4 h-4 text-[#0F766E] dark:text-teal-400" />
            </button>

            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <img
                src="/tn-emblem.svg"
                alt="TN Crest Emblem"
                className="w-9 h-9 object-contain transition-transform group-hover:scale-105"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-[15px] text-[#0F766E] dark:text-teal-400 tracking-tight leading-none">
                    GramSeva <span className="text-[#16A34A]">AI</span>
                  </span>
                  <span className="text-[8px] font-black uppercase bg-teal-100 dark:bg-teal-900/50 text-[#0F766E] dark:text-teal-300 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-800 leading-none">
                    Govt Portal
                  </span>
                </div>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  Digital India Citizen Services
                </p>
              </div>
            </Link>
          </div>

          {/* Nav Links (desktop only) */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-600 dark:text-slate-300">
            {NAV_LINKS.map(({ href, label, icon: Icon, highlight }) => {
              const isActive = pathname === href || pathname?.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1 transition-colors hover:text-[#0F766E] dark:hover:text-teal-400 ${
                    highlight
                      ? 'text-purple-600 dark:text-purple-400 hover:text-purple-700'
                      : isActive
                      ? 'text-[#0F766E] dark:text-teal-400'
                      : ''
                  }`}
                >
                  {highlight && <Icon className="w-3.5 h-3.5" />}
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5">
            {/* Citizen Login / Dashboard Button */}
            {user ? (
              <Link
                href={profile?.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F766E] hover:bg-[#0d645e] text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer hover:-translate-y-0.5"
              >
                <span>{profile?.role === 'admin' ? 'BDO Portal' : language === 'en' ? 'My Dashboard' : 'என் தகவல்'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F766E] hover:bg-[#0d645e] text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer hover:-translate-y-0.5"
              >
                {language === 'en' ? 'Citizen Login' : 'உள்நுழை'}
              </Link>
            )}

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-[#0F766E] hover:border-[#0F766E]/30 flex items-center justify-center transition-all cursor-pointer hover:scale-105"
                title="Profile"
              >
                <CircleUserRound className="w-4.5 h-4.5" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 text-xs font-semibold"
                  >
                    {user ? (
                      <>
                        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                          <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Logged In As</p>
                          <p className="font-black text-slate-900 dark:text-white truncate mt-0.5">{profile?.name || user.email}</p>
                          <p className="text-[9px] text-[#0F766E] font-bold capitalize mt-0.5">{profile?.role === 'admin' ? 'Administrator' : 'Citizen'}</p>
                        </div>
                        <Link
                          href={profile?.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                          onClick={() => setProfileOpen(false)}
                          className="block px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#0F766E] transition-all"
                        >
                          Dashboard
                        </Link>
                        <Link
                          href={profile?.role === 'admin' ? '/admin/dashboard?tab=settings' : '/profile'}
                          onClick={() => setProfileOpen(false)}
                          className="block px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#0F766E] transition-all"
                        >
                          My Profile
                        </Link>
                        <Link
                          href={profile?.role === 'admin' ? '/admin/dashboard?tab=settings' : '/profile'}
                          onClick={() => setProfileOpen(false)}
                          className="block px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#0F766E] transition-all"
                        >
                          Settings
                        </Link>
                        <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                          <button
                            onClick={() => { setProfileOpen(false); logout() }}
                            className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 font-bold transition-all cursor-pointer"
                          >
                            Logout
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <Link href="/login" onClick={() => setProfileOpen(false)} className="block px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#0F766E] transition-all">
                          Resident Login
                        </Link>
                        <Link href="/login" onClick={() => setProfileOpen(false)} className="block px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#0F766E] transition-all">
                          Register Account
                        </Link>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Social Channels Trigger */}
            <button
              onClick={() => setSocialOpen(true)}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-[#0F766E] hover:border-[#0F766E]/30 hidden sm:flex items-center justify-center transition-all cursor-pointer hover:scale-105"
              title="Official Social Channels"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── SOCIAL SHARE MODAL ── */}
      <AnimatePresence>
        {socialOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSocialOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-border p-6 rounded-[20px] w-full max-w-sm space-y-4 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-extrabold text-sm flex items-center gap-1.5 text-foreground">
                  <Share2 className="w-4 h-4 text-[#0F766E]" /> Official Channels &amp; Share
                </h3>
                <button
                  onClick={() => setSocialOpen(false)}
                  className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { href: 'https://x.com/TNDIPRNEWS', icon: FaXTwitter, label: 'X (Twitter)', bg: 'bg-slate-900' },
                  { href: 'https://www.facebook.com/CMOTamilnadu/', icon: FaFacebookF, label: 'Facebook', bg: 'bg-[#1877F2]' },
                  { href: 'https://www.instagram.com/cmotamilnadu', icon: FaInstagram, label: 'Instagram', bg: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]' },
                  { href: 'https://www.youtube.com/@TNDIPR21', icon: FaYoutube, label: 'YouTube', bg: 'bg-[#FF0000]' },
                ].map(({ href, icon: Icon, label, bg }) => (
                  <motion.a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/30 border border-border/60 hover:border-[#0F766E]/30 rounded-xl transition-all cursor-pointer group"
                  >
                    <div className={`w-10 h-10 rounded-full ${bg} text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground mt-2 group-hover:text-foreground">{label}</span>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
