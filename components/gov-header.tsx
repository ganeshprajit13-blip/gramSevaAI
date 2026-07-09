'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/components/providers/auth-provider'
import { useLanguage } from '@/components/providers/language-provider'
import { ShieldCheck, Volume2, Type, PanelLeft, CircleUserRound, Share2, X, Bot } from 'lucide-react'
import { FaYoutube, FaInstagram, FaFacebookF } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'



export default function GovHeader() {
  const { user, profile, logout } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const [textSize, setTextSizeState] = useState<'sm' | 'md' | 'lg'>('md')
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [socialOpen, setSocialOpen] = useState(false)

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
    if (size === 'sm') {
      root.style.fontSize = '14px'
    } else if (size === 'lg') {
      root.style.fontSize = '18px'
    } else {
      root.style.fontSize = '16px'
    }
  }

  return (
    <>
      <header className="w-full border-b border-border/80 bg-white/90 dark:bg-slate-900/90 sticky top-0 z-20 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      {/* 1. Tricolor Flag Strip */}
      <div className="w-full h-1 flex">
        <div className="flex-1 bg-[#FF9933]" /> {/* Saffron */}
        <div className="flex-1 bg-white" />      {/* White */}
        <div className="flex-1 bg-[#138808]" /> {/* Green */}
      </div>

      {/* 2. Main Gov Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
        {/* Left Side: Sidebar Toggle + India Crest Info */}
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => window.dispatchEvent(new Event('toggle-sidebar'))}
            className="w-9 h-9 rounded-full bg-white dark:bg-slate-900 border border-border text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500/30 flex items-center justify-center shadow-xs hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            title="Toggle Navigation Menu"
          >
            <PanelLeft className="w-4.5 h-4.5" />
          </button>

          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
            <span className="uppercase tracking-wider hidden sm:inline text-slate-800 dark:text-slate-300 font-bold">
              {t('govOfTN')} • {t('ruralDevDept')}
            </span>
            <span className="sm:hidden font-extrabold text-emerald-600 dark:text-emerald-500">
              {language === 'en' ? 'Govt of TN' : 'தமிழ்நாடு அரசு'}
            </span>
          </div>
        </div>

        {/* Right Side: Accessibility Controls + Language Toggle + Profile & Social */}
        <div className="flex items-center gap-3">
          {/* Screen Reader Access */}
          <button
            onClick={() => alert('Screen reader utility mapping active')}
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
                textSize === 'sm'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
              }`}
              title="Decrease Text Size"
            >
              A-
            </button>
            <button
              onClick={() => applyTextSize('md')}
              className={`h-7 px-2.5 rounded-full text-[10px] font-extrabold transition-all duration-200 cursor-pointer ${
                textSize === 'md'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
              }`}
              title="Normal Text Size"
            >
              A
            </button>
            <button
              onClick={() => applyTextSize('lg')}
              className={`h-7 px-2.5 rounded-full text-[10px] font-extrabold transition-all duration-200 cursor-pointer ${
                textSize === 'lg'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
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
              className={`h-7 px-2.5 rounded-full text-[10px] font-extrabold transition-all duration-200 cursor-pointer ${
                language === 'en'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('ta')}
              className={`h-7 px-2.5 rounded-full text-[10px] font-extrabold transition-all duration-200 cursor-pointer ${
                language === 'ta'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
              }`}
            >
              தமிழ்
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`h-7 px-2.5 rounded-full text-[10px] font-extrabold transition-all duration-200 cursor-pointer ${
                language === 'hi'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
              }`}
            >
              हिन्दी
            </button>
          </div>

          {/* Profile & Social Control Group */}
          <div className="flex items-center gap-3 relative">
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
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>

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
                aria-label="Close social channels dialog"
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
    </>
  )
}
