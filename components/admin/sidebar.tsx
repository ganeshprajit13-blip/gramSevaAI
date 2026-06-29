'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FileText, Users, Building2,
  LogOut, Menu, X, ChevronRight, Shield
} from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/schemes', label: 'Manage Schemes', icon: FileText },
  { href: '/admin/residents', label: 'Residents', icon: Users },
]

export default function AdminSidebar({ onLogout }: { onLogout: () => void }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { profile } = useAuth()

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <Link href="/admin/dashboard" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
          <div className="w-9 h-9 relative flex-shrink-0">
            <img src="/tn-emblem.png" alt="TN Emblem" className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">GramSeva Admin</p>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Tamil Nadu BDO</p>
          </div>
        </Link>
      </div>

      {/* Admin badge */}
      {profile && (
        <div className="p-4 mx-3 mt-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {profile.name?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{profile.name ?? 'Admin'}</p>
              <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full font-medium">BDO Admin</span>
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
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={isActive ? 'nav-item-active' : 'nav-item'}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
              {isActive && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <Link href="/dashboard" className="nav-item mb-1 w-full">
          <Building2 className="w-4 h-4" />
          <span>Resident View</span>
        </Link>
        <button
          onClick={onLogout}
          className="nav-item w-full text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-card border border-border shadow-md"
      >
        <Menu className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-card border-r border-border z-50 shadow-2xl"
            >
              <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-secondary">
                <X className="w-4 h-4" />
              </button>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border flex-col z-30 shadow-sm">
        <SidebarContent />
      </aside>
    </>
  )
}
