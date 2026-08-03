'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Award, ShieldAlert, Bell,
  Bot, MapPin, User, LogOut, X, ChevronRight,
  FileText, Building2, Newspaper
} from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'
import { useLanguage } from '@/components/providers/language-provider'

const navItems = [
  { href: '/dashboard',       labelKey: 'dashboard',       icon: LayoutDashboard, color: 'text-sky-500' },
  { href: '/schemes',         labelKey: 'welfareSchemes',  icon: Award,           color: 'text-orange-500' },
  { href: '/services',        labelKey: 'services',        icon: FileText,        color: 'text-blue-500' },
  { href: '/complaints',      labelKey: 'complaints',      icon: ShieldAlert,     color: 'text-red-500' },
  { href: '/announcements',   labelKey: 'announcements',   icon: Newspaper,       color: 'text-amber-500' },
  { href: '/notifications',   labelKey: 'notifications',   icon: Bell,            color: 'text-purple-500' },
  { href: '/ai-assistant',    labelKey: 'aiAssistant',     icon: Bot,             color: 'text-violet-500' },
  { href: '/nearby-offices',  labelKey: 'nearbyOffices',   icon: MapPin,          color: 'text-emerald-500' },
  { href: '/profile',         labelKey: 'myProfile',       icon: User,            color: 'text-teal-500' },
] as const

export default function ResidentSidebar({ onLogout }: { onLogout: () => void }) {
  const pathname = usePathname()
  const { profile } = useAuth()
  const { t } = useLanguage()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  // Listen for header toggle event
  useEffect(() => {
    const handleToggle = () => {
      // On mobile: toggle slide drawer; on desktop: collapse/expand
      if (window.innerWidth < 1024) {
        setMobileOpen(prev => !prev)
      } else {
        setCollapsed(prev => !prev)
      }
    }
    window.addEventListener('toggle-sidebar', handleToggle)
    return () => window.removeEventListener('toggle-sidebar', handleToggle)
  }, [])

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full">

      {/* Logo / Brand */}
      <div className={`p-4 border-b border-slate-200/80 dark:border-slate-800/80 ${collapsed && !isMobile ? 'px-3' : ''}`}>
        <Link
          href="/dashboard"
          onClick={() => isMobile && setMobileOpen(false)}
          className="flex items-center gap-3 group"
        >
          <div className="w-9 h-9 flex-shrink-0 rounded-xl bg-gradient-to-br from-[#0F766E]/15 to-emerald-500/10 ring-1 ring-[#0F766E]/20 flex items-center justify-center">
            <img src="/tn-emblem.svg" alt="TN Emblem" className="w-5.5 h-5.5 object-contain" />
          </div>
          {(!collapsed || isMobile) && (
            <div className="min-w-0">
              <p className="font-black text-sm leading-tight text-slate-900 dark:text-slate-100 truncate">
                {t('gramSevaAI')}
              </p>
              <p className="text-[9px] text-[#0F766E] font-bold uppercase tracking-[0.18em] truncate">
                {t('tamilNaduPortal')}
              </p>
            </div>
          )}
        </Link>
      </div>

      {/* User Profile Card */}
      {profile && (!collapsed || isMobile) && (
        <div className="mx-3 mt-4 p-3 rounded-2xl bg-gradient-to-r from-sky-50 to-emerald-50 dark:from-sky-950/30 dark:to-emerald-950/20 border border-sky-100 dark:border-sky-900/40 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0F766E] to-emerald-500 flex items-center justify-center text-white text-sm font-extrabold flex-shrink-0 shadow-md">
              {profile.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate text-slate-900 dark:text-slate-100">{profile.name ?? 'Resident'}</p>
              <p className="text-[10px] text-muted-foreground truncate">{profile.district ?? 'Tamil Nadu'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed avatar */}
      {profile && collapsed && !isMobile && (
        <div className="flex justify-center mt-4">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0F766E] to-emerald-500 flex items-center justify-center text-white text-sm font-extrabold shadow-md">
            {profile.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
        </div>
      )}

      {/* Nav Items */}
      <nav className="flex-1 p-2.5 space-y-0.5 mt-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => isMobile && setMobileOpen(false)}
              title={collapsed && !isMobile ? t(item.labelKey as any) : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer group ${
                isActive
                  ? 'bg-[#0F766E]/10 dark:bg-teal-950/40 text-[#0F766E] dark:text-teal-400 border border-[#0F766E]/20 dark:border-teal-800/40 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
              } ${collapsed && !isMobile ? 'justify-center px-0' : ''}`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? item.color : 'text-slate-400 group-hover:' + item.color}`} />
              {(!collapsed || isMobile) && (
                <>
                  <span className="flex-1 truncate">{t(item.labelKey as any)}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />}
                </>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-2.5 border-t border-slate-200/80 dark:border-slate-800/80">
        <button
          onClick={onLogout}
          title={collapsed && !isMobile ? t('signOut') : undefined}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 cursor-pointer w-full ${
            collapsed && !isMobile ? 'justify-center px-0' : ''
          }`}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {(!collapsed || isMobile) && <span>{t('signOut')}</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* ── DESKTOP SIDEBAR (permanent, collapsible) ── */}
      <motion.aside
        animate={{ width: collapsed ? 60 : 240 }}
        transition={{ type: 'spring', damping: 25, stiffness: 250 }}
        className="hidden lg:flex flex-col flex-shrink-0 h-screen sticky top-0 bg-white dark:bg-slate-950 border-r border-slate-200/80 dark:border-slate-800/80 shadow-[4px_0_20px_rgba(15,23,42,0.05)] overflow-hidden"
      >
        <SidebarContent />
      </motion.aside>

      {/* ── MOBILE SLIDE DRAWER ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-950 border-r border-slate-200/80 dark:border-slate-800/80 z-50 shadow-2xl lg:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
                className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer z-10"
              >
                <X className="w-4 h-4" />
              </button>
              <SidebarContent isMobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
