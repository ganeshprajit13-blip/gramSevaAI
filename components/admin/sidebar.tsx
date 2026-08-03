'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FileText, Users, Building2,
  LogOut, X, ChevronRight, ShieldAlert,
  Bot, History, Settings, Bell, Heart
} from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'
import { useLanguage } from '@/components/providers/language-provider'

const navItems = [
  { href: '/admin/dashboard', translationKey: 'dashboard', icon: LayoutDashboard },
  { href: '/admin/women-empowerment', translationKey: 'Women Empowerment' as any, icon: Heart, label: 'Women Empowerment & Demographics', isFeatured: true },
  { href: '/admin/residents', translationKey: 'residents', icon: Users },
  { href: '/admin/schemes', translationKey: 'manageSchemes', icon: FileText },
  { href: '/admin/dashboard?tab=complaints', translationKey: 'complaints', icon: ShieldAlert },
  { href: '/admin/dashboard?tab=announcements', translationKey: 'villageAnnounce', icon: Bell },
  { href: '/admin/dashboard?tab=ai-config', translationKey: 'aiAssistant', icon: Bot },
  { href: '/admin/dashboard?tab=audit-logs', translationKey: 'Audit Logs' as any, icon: History },
  { href: '/admin/dashboard?tab=settings', translationKey: 'myProfile', icon: Settings },
] as const

export default function AdminSidebar({ onLogout }: { onLogout: () => void }) {
  const pathname = usePathname()
  const { profile } = useAuth()
  const { t } = useLanguage()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  // Listen for sidebar toggle event dispatched from header or slide toggle button
  useEffect(() => {
    const handleToggle = () => {
      if (window.innerWidth < 1024) {
        setMobileOpen((prev) => !prev)
      } else {
        setCollapsed((prev) => !prev)
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
    <div className="flex flex-col h-full bg-gradient-to-b from-white via-slate-50/70 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Logo / Brand */}
      <div className={`p-4 border-b border-slate-200/80 dark:border-slate-800/80 ${collapsed && !isMobile ? 'px-3' : ''}`}>
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-3 group"
          onClick={() => isMobile && setMobileOpen(false)}
        >
          <div className="w-9 h-9 relative flex-shrink-0 rounded-xl bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 flex items-center justify-center shadow-md">
            <img src="/tn-emblem.svg" alt="TN Emblem" className="w-5.5 h-5.5 object-contain" />
          </div>
          {(!collapsed || isMobile) && (
            <div className="min-w-0">
              <p className="font-black text-sm leading-tight text-slate-900 dark:text-slate-100 truncate">{t('gramSevaAdmin')}</p>
              <p className="text-[9px] text-[#0F766E] font-extrabold uppercase tracking-[0.18em] truncate">{t('tamilNaduBdo')}</p>
            </div>
          )}
        </Link>
      </div>

      {/* Admin Profile Card */}
      {profile && (!collapsed || isMobile) && (
        <div className="p-3 mx-3 mt-4 rounded-2xl bg-gradient-to-r from-orange-50 to-rose-50 dark:from-orange-950/25 dark:to-rose-950/20 border border-orange-200/80 dark:border-orange-900/30 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md">
              {profile.name?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate text-slate-900 dark:text-slate-100">{profile.name ?? 'BDO Officer'}</p>
              <span className="text-[10px] bg-orange-500/20 text-orange-600 dark:text-orange-300 px-2 py-0.5 rounded-full font-bold">{t('tamilNaduBdo')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed avatar */}
      {profile && collapsed && !isMobile && (
        <div className="flex justify-center mt-4">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white text-sm font-bold shadow-md" title={profile.name ?? 'BDO Officer'}>
            {profile.name?.[0]?.toUpperCase() ?? 'A'}
          </div>
        </div>
      )}

      {/* Nav Items */}
      <nav className="flex-1 p-2.5 space-y-1 mt-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href))
          const isFeatured = (item as any).isFeatured
          const labelText = (item as any).label || t(item.translationKey)
          const Icon = item.icon
          return (
            <Link
              key={item.href + '-' + item.translationKey}
              href={item.href}
              onClick={() => isMobile && setMobileOpen(false)}
              title={collapsed && !isMobile ? labelText : undefined}
              className={
                isFeatured
                  ? `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md'
                        : 'bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/40 dark:to-purple-950/40 text-pink-700 dark:text-pink-300 border border-pink-200/60 dark:border-pink-800/40 hover:shadow-sm'
                    } ${collapsed && !isMobile ? 'justify-center px-0' : ''}`
                  : `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-[#0F766E]/10 dark:bg-teal-950/40 text-[#0F766E] dark:text-teal-400 border border-[#0F766E]/20 dark:border-teal-800/40 shadow-xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                    } ${collapsed && !isMobile ? 'justify-center px-0' : ''}`
              }
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isFeatured && !isActive ? 'text-pink-600 dark:text-pink-400' : ''}`} />
              {(!collapsed || isMobile) && (
                <>
                  <span className="flex-1 truncate">{labelText}</span>
                  {isFeatured && !isActive && (
                    <span className="ml-auto text-[9px] font-black uppercase bg-pink-200 dark:bg-pink-900 text-pink-800 dark:text-pink-200 px-1.5 py-0.5 rounded-md">
                      AI
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60 flex-shrink-0" />}
                </>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer controls */}
      <div className="p-2.5 border-t border-slate-200/80 dark:border-slate-800/80 space-y-1">
        <Link
          href="/dashboard"
          title={collapsed && !isMobile ? t('residentView') : undefined}
          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${
            collapsed && !isMobile ? 'justify-center px-0' : ''
          }`}
        >
          <Building2 className="w-4 h-4 flex-shrink-0" />
          {(!collapsed || isMobile) && <span>{t('residentView')}</span>}
        </Link>
        <button
          onClick={onLogout}
          title={collapsed && !isMobile ? t('signOut') : undefined}
          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 cursor-pointer w-full ${
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
      {/* DESKTOP SIDEBAR (permanent & collapsible for BDO) */}
      <motion.aside
        animate={{ width: collapsed ? 60 : 250 }}
        transition={{ type: 'spring', damping: 25, stiffness: 250 }}
        className="hidden lg:flex flex-col flex-shrink-0 h-screen sticky top-0 bg-white dark:bg-slate-950 border-r border-slate-200/80 dark:border-slate-800/80 shadow-[4px_0_20px_rgba(15,23,42,0.05)] overflow-hidden z-30"
      >
        <SidebarContent />
      </motion.aside>

      {/* MOBILE SLIDE DRAWER */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
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

