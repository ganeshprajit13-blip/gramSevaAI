'use client'

import { useState, useEffect } from 'react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FileText, Users, Building2,
  LogOut, Menu, X, ChevronRight, Award, ShieldAlert,
  Bot, History, Settings, Bell

} from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'
import { useLanguage } from '@/components/providers/language-provider'

const navItems = [
  { href: '/admin/dashboard', translationKey: 'dashboard', icon: LayoutDashboard },
  { href: '/admin/residents', translationKey: 'residents', icon: Users },
  { href: '/admin/schemes', translationKey: 'manageSchemes', icon: FileText },
  { href: '/admin/dashboard?tab=certificates', translationKey: 'certificates', icon: Award },
  { href: '/admin/dashboard?tab=complaints', translationKey: 'complaints', icon: ShieldAlert },
  { href: '/admin/dashboard?tab=announcements', translationKey: 'villageAnnounce', icon: Bell },
  { href: '/admin/dashboard?tab=ai-config', translationKey: 'aiAssistant', icon: Bot },
  { href: '/admin/dashboard?tab=audit-logs', translationKey: 'Audit Logs' as any, icon: History },
  { href: '/admin/dashboard?tab=settings', translationKey: 'myProfile', icon: Settings },
] as const


export default function AdminSidebar({ onLogout }: { onLogout: () => void }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { profile } = useAuth()
  const { t } = useLanguage()

  useEffect(() => {
    const handleToggle = () => setMobileOpen((prev) => !prev)
    window.addEventListener('toggle-sidebar', handleToggle)
    return () => window.removeEventListener('toggle-sidebar', handleToggle)
  }, [])

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-white via-slate-50/70 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Logo */}
      <div className="p-5 border-b border-border/80">
        <Link href="/admin/dashboard" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
          <div className="w-10 h-10 relative flex-shrink-0 rounded-2xl bg-white dark:bg-slate-800 ring-1 ring-gray-300 dark:ring-gray-600 flex items-center justify-center shadow-md">
            <img src="/tn-emblem.svg" alt="TN Emblem" className="w-6 h-6 object-contain" />
          </div>
          <div>
            <p className="font-black text-sm leading-tight text-slate-900 dark:text-slate-100">{t('gramSevaAdmin')}</p>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-[0.2em]">{t('tamilNaduBdo')}</p>
          </div>
        </Link>
      </div>

      {/* Admin badge */}
      {profile && (
        <div className="p-4 mx-3 mt-4 rounded-[18px] bg-gradient-to-r from-orange-50 to-rose-50 dark:from-orange-950/25 dark:to-rose-950/20 border border-orange-200 dark:border-orange-900/30 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md">
              {profile.name?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate text-slate-900 dark:text-slate-100">{profile.name ?? 'Admin'}</p>
              <span className="text-xs bg-orange-500/20 text-orange-600 dark:text-orange-300 px-2 py-0.5 rounded-full font-medium">{t('tamilNaduBdo')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 mt-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href + '-' + item.translationKey}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={isActive ? 'nav-item-active' : 'nav-item'}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span>{t(item.translationKey)}</span>
              {isActive && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <Link href="/dashboard" className="nav-item mb-1 w-full">
          <Building2 className="w-4 h-4" />
          <span>{t('residentView')}</span>
        </Link>
        <button
          onClick={onLogout}
          className="nav-item w-full text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('signOut')}</span>
        </button>
      </div>
    </div>
  )


  return (
    <>
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-card border-r border-border z-50 shadow-2xl"
            >
              <button onClick={() => setMobileOpen(false)} aria-label="Close navigation menu" className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-secondary cursor-pointer">
                <X className="w-4 h-4" />
              </button>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

