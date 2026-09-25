'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FileText, Users, Building2,
  LogOut, X, ChevronRight, ShieldAlert,
  Bot, History, Settings, Bell, Heart, Image as ImageIcon
} from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'
import { useLanguage } from '@/components/providers/language-provider'

const navItems = [
  { href: '/admin/dashboard', translationKey: 'dashboard', icon: LayoutDashboard },
  { href: '/admin/posters', translationKey: 'Government Posters' as any, icon: ImageIcon, label: 'Government Posters', isFeatured: true },
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
  const [currentTab, setCurrentTab] = useState('overview')

  // Track active query tab for /admin/dashboard
  useEffect(() => {
    const updateTab = () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search)
        setCurrentTab(params.get('tab') || 'overview')
      }
    }
    updateTab()
    window.addEventListener('popstate', updateTab)
    return () => window.removeEventListener('popstate', updateTab)
  }, [pathname])

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
    <div className="flex flex-col h-full bg-gradient-to-b from-[#EAF8EF] via-[#F3FAF5] to-[#EAF8EF] dark:from-[#0a2e18] dark:via-[#0d3a1f] dark:to-[#0a2e18] border-r border-[#C6EDD5] dark:border-white/10">

      {/* ── TRICOLOUR TOP BAR ── */}
      <div className="h-1 flex flex-shrink-0">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-white/70" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      {/* Logo / Brand */}
      <div className={`p-4 border-b border-[#C6EDD5] dark:border-white/10 ${collapsed && !isMobile ? 'px-3' : ''}`}>
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-3 group"
          onClick={() => isMobile && setMobileOpen(false)}
        >
          <div className="w-9 h-9 flex-shrink-0 rounded-lg bg-white ring-1 ring-[#A7DCBB] dark:ring-white/20 flex items-center justify-center shadow-sm">
            <img src="/tn-emblem.svg" alt="TN Emblem" className="w-5.5 h-5.5 object-contain" />
          </div>
          {(!collapsed || isMobile) && (
            <div className="min-w-0">
              <p className="font-bold text-sm leading-tight text-[#14532d] dark:text-white truncate tracking-wide">GramSeva Admin</p>
              <p className="text-[9px] text-[#166534] dark:text-green-300 font-semibold uppercase tracking-[0.15em] truncate mt-0.5">Tamil Nadu BDO Portal</p>
            </div>
          )}
        </Link>
      </div>

      {/* Admin Profile Card */}
      {profile && (!collapsed || isMobile) && (
        <div className="mx-3 mt-4 p-3 rounded-xl bg-white dark:bg-white/[0.06] border border-[#C6EDD5] dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#14532d] flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm">
              {profile.name?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate text-[#14532d] dark:text-white">{profile.name ?? 'BDO Officer'}</p>
              <span className="text-[9px] text-[#166534] dark:text-green-300 font-medium uppercase tracking-wider">Block Development Officer</span>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed avatar */}
      {profile && collapsed && !isMobile && (
        <div className="flex justify-center mt-4">
          <div
            className="w-9 h-9 rounded-lg bg-[#14532d] flex items-center justify-center text-white text-sm font-bold shadow-sm"
            title={profile.name ?? 'BDO Officer'}
          >
            {profile.name?.[0]?.toUpperCase() ?? 'A'}
          </div>
        </div>
      )}

      {/* Section label */}
      {(!collapsed || isMobile) && (
        <p className="px-4 pt-5 pb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#166534]/60 dark:text-green-400/60 select-none">
          Navigation
        </p>
      )}

      {/* Nav Items */}
      <nav className="flex-1 px-2 pb-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          let isActive = false
          if (pathname === '/admin/dashboard') {
            const itemTab = item.href.includes('?tab=') ? item.href.split('?tab=')[1] : 'overview'
            isActive = item.href.startsWith('/admin/dashboard') && currentTab === itemTab
          } else if (item.href !== '/admin/dashboard' && !item.href.includes('?tab=') && pathname.startsWith(item.href)) {
            isActive = true
          }
          const isFeatured = (item as any).isFeatured
          const labelText = (item as any).label || t(item.translationKey)
          const Icon = item.icon
          return (
            <Link
              key={item.href + '-' + item.translationKey}
              href={item.href}
              onClick={() => isMobile && setMobileOpen(false)}
              title={collapsed && !isMobile ? labelText : undefined}
              className={`flex items-center gap-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-[#14532d] text-white border-l-[3px] border-[#FF9933] px-3 pl-[10px] shadow-sm'
                  : 'text-[#1a5c35] dark:text-green-100/80 hover:bg-[#D1F0DC] dark:hover:bg-white/[0.08] hover:text-[#14532d] dark:hover:text-white border-l-[3px] border-transparent px-3 pl-[10px]'
              } ${collapsed && !isMobile ? 'justify-center !px-0 !pl-0 !border-l-0' : ''}`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#86EFAC]' : 'text-[#16a34a] dark:text-green-400/80'}`} />
              {(!collapsed || isMobile) && (
                <>
                  <span className="flex-1 truncate">{labelText}</span>
                  {isFeatured && !isActive && (
                    <span className="ml-auto text-[8px] font-bold uppercase bg-[#14532d]/10 text-[#14532d] dark:bg-white/10 dark:text-green-200 px-1.5 py-0.5 rounded border border-[#14532d]/20 dark:border-white/10">
                      AI
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-[#86EFAC] flex-shrink-0" />}
                </>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer controls */}
      <div className="p-2 border-t border-[#C6EDD5] dark:border-white/10 space-y-0.5">
        <Link
          href="/dashboard"
          title={collapsed && !isMobile ? t('residentView') : undefined}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-[#1a5c35] dark:text-green-200/70 hover:bg-[#D1F0DC] dark:hover:bg-white/[0.08] hover:text-[#14532d] dark:hover:text-white transition-all ${
            collapsed && !isMobile ? 'justify-center !px-0' : ''
          }`}
        >
          <Building2 className="w-4 h-4 flex-shrink-0 text-[#16a34a]/60 dark:text-green-400/60" />
          {(!collapsed || isMobile) && <span>{t('residentView')}</span>}
        </Link>
        <button
          onClick={onLogout}
          title={collapsed && !isMobile ? t('signOut') : undefined}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-red-600/80 dark:text-red-400/80 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 transition-all duration-150 cursor-pointer w-full ${
            collapsed && !isMobile ? 'justify-center !px-0' : ''
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
      {/* DESKTOP SIDEBAR */}
      <motion.aside
        animate={{ width: collapsed ? 60 : 250 }}
        transition={{ type: 'spring', damping: 25, stiffness: 250 }}
        className="hidden lg:flex flex-col flex-shrink-0 h-screen sticky top-0 bg-gradient-to-b from-[#EAF8EF] via-[#F3FAF5] to-[#EAF8EF] dark:from-[#0a2e18] dark:via-[#0d3a1f] dark:to-[#0a2e18] border-r border-[#C6EDD5] dark:border-white/10 shadow-[4px_0_18px_rgba(20,83,45,0.08)] overflow-hidden z-30"
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
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-gradient-to-b from-[#EAF8EF] via-[#F3FAF5] to-[#EAF8EF] dark:from-[#0a2e18] dark:via-[#0d3a1f] dark:to-[#0a2e18] border-r border-[#C6EDD5] dark:border-white/10 z-50 shadow-2xl lg:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
                className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-[#D1F0DC] dark:hover:bg-white/10 text-[#14532d] dark:text-white/60 cursor-pointer z-10"
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
