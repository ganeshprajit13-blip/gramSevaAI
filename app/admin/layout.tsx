'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import { Loader2 } from 'lucide-react'
import AdminSidebar from '@/components/admin/sidebar'
import GovHeader from '@/components/gov-header'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) router.push('/login')
      else if (profile && profile.role !== 'admin') router.push('/dashboard')
    }
  }, [user, profile, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm">Loading Admin Portal…</p>
        </div>
      </div>
    )
  }

  if (!user || profile?.role !== 'admin') return null

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex flex-1">
        <AdminSidebar onLogout={logout} />
        <div className="flex-1 flex flex-col min-h-screen">
          <GovHeader />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1700px] w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

