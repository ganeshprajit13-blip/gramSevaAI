'use client'

import { useState, useEffect } from 'react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FileText, Bot, MapPin, Bell, User,
  Building2, LogOut, Menu, X, ChevronRight, Award,
  ShieldAlert, FolderOpen, Settings
} from 'lucide-react'
import type { Profile } from '@/types'
import { useAuth } from '@/components/providers/auth-provider'
import { useLanguage } from '@/components/providers/language-provider'

const navItems = [
  { href: '/dashboard', translationKey: 'dashboard', icon: LayoutDashboard },
  { href: '/profile', translationKey: 'Recent Applications & Certificates' as any, icon: FolderOpen },
  { href: '/schemes', translationKey: 'welfareSchemes', icon: Award },
  { href: '/schemes?category=Student', translationKey: 'certificates', icon: FileText },
  { href: '/ai-assistant', translationKey: 'complaints', icon: ShieldAlert },
  { href: '/notifications', translationKey: 'notifications', icon: Bell },
  { href: '/ai-assistant', translationKey: 'aiAssistant', icon: Bot },
  { href: '/nearby-offices', translationKey: 'nearbyOffices', icon: MapPin },
  { href: '/profile', translationKey: 'myProfile', icon: User },
] as const


export default function ResidentSidebar({ onLogout }: { onLogout: () => void }) {
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
    <div className="flex flex-col h-full bg-gradient-to-b from-white via-slate-50/60 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Logo */}
      <div className="p-5 border-b border-border/80">
        <Link href="/dashboard" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
          <div className="w-10 h-10 relative flex-shrink-0 rounded-2xl bg-gradient-to-br from-primary/15 to-emerald-500/10 ring-1 ring-primary/10 flex items-center justify-center">
            <img src="/tn-emblem.svg" alt="TN Emblem" className="w-6 h-6 object-contain" />
          </div>
          <div>
            <p className="font-black text-sm leading-tight text-slate-900 dark:text-slate-100">{t('gramSevaAI')}</p>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-[0.2em]">{t('tamilNaduPortal')}</p>
          </div>
        </Link>
      </div>

      {/* User card */}
      {profile && (
        <div className="p-4 mx-3 mt-4 rounded-[18px] bg-gradient-to-r from-sky-50 to-emerald-50 dark:from-sky-950/30 dark:to-emerald-950/20 border border-sky-100 dark:border-sky-900/40 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md">
              {profile.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate text-slate-900 dark:text-slate-100">{profile.name ?? 'Resident'}</p>
              <p className="text-xs text-muted-foreground truncate">{profile.district ?? 'India'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav items */}
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

      {/* Logout */}
      <div className="p-3 border-t border-border">
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
      {/* Sliding sidebar drawer (overlay) */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-card border-r border-border z-50 shadow-2xl"
            >
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-secondary cursor-pointer"
              >
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

