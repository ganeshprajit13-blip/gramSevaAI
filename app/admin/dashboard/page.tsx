'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/providers/auth-provider'
import {
  FileText, Users, Bell, PlusCircle, ChevronRight,
  TrendingUp, CheckCircle2, Shield, Settings, Calendar, Activity
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Stats {
  totalSchemes: number
  publishedSchemes: number
  totalResidents: number
  recentActivity: string
}

const analyticsData = [
  { month: 'Jan', residents: 120, schemes: 10 },
  { month: 'Feb', residents: 280, schemes: 18 },
  { month: 'Mar', residents: 490, schemes: 32 },
  { month: 'Apr', residents: 720, schemes: 45 },
  { month: 'May', residents: 910, schemes: 68 },
  { month: 'Jun', residents: 1080, schemes: 92 },
]

export default function AdminDashboard() {
  const { profile } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState<Stats>({
    totalSchemes: 92,
    publishedSchemes: 76,
    totalResidents: 1080,
    recentActivity: 'Crop subsidy approved',
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="space-y-6 pt-8 lg:pt-0 gov-watermark min-h-[calc(100vh-100px)] relative">
      
      {/* 1. Welcome BDO Header - Spans all columns */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-orange-600 via-red-600 to-rose-700 text-white shadow-xl border border-orange-500/30 z-10"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-400 animate-pulse" />
              <span className="text-orange-200 text-xs font-semibold tracking-wider uppercase">BDO Administration Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, BDO {profile?.name?.split(' ')[0] ?? 'Officer'} 🛡️
            </h1>
            <p className="text-orange-100/90 text-sm max-w-xl">
              Manage welfares, track resident submissions, analyze data graphs, and broadcast circular updates to local villages.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 self-start md:self-auto">
            <img src="/tn-emblem.png" alt="TN Government" className="w-10 h-10 object-contain invert brightness-200" />
            <div>
              <p className="text-xs font-bold text-white leading-tight">Government of Tamil Nadu</p>
              <p className="text-[10px] text-orange-200 uppercase tracking-wide">Rural Development Department</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">

        {/* 2. Metrics Bento - Spans 2 Columns */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="md:col-span-2 glass-card p-6 space-y-4 border-t-4 border-t-orange-500"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-500" /> Executive Summary
            </h3>
            <span className="text-xs text-muted-foreground">Updated in real-time</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/admin/schemes" className="p-4 rounded-2xl bg-orange-500/5 hover:bg-orange-500/10 border border-orange-500/10 transition-all text-left">
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-5 h-5 text-orange-500" />
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <p className="text-2xl font-black">{stats.totalSchemes}</p>
              <p className="text-xs text-muted-foreground font-semibold">Total Schemes</p>
            </Link>

            <Link href="/admin/schemes" className="p-4 rounded-2xl bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 transition-all text-left">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <p className="text-2xl font-black">{stats.publishedSchemes}</p>
              <p className="text-xs text-muted-foreground font-semibold">Published</p>
            </Link>

            <Link href="/admin/residents" className="p-4 rounded-2xl bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/10 transition-all text-left">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-blue-500" />
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <p className="text-2xl font-black">{stats.totalResidents}</p>
              <p className="text-xs text-muted-foreground font-semibold">Registered Residents</p>
            </Link>
          </div>
        </motion.div>

        {/* 3. Quick Operations Bento - Spans 1 Column */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 flex flex-col justify-between border-t-4 border-t-red-600"
        >
          <div>
            <h3 className="text-base font-bold mb-1">Quick Actions</h3>
            <p className="text-xs text-muted-foreground mb-4">Direct shortcuts to modify schemes or settings</p>
          </div>
          
          <div className="space-y-2">
            <Link
              href="/admin/schemes/new"
              className="w-full flex items-center justify-between p-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-md transition-all"
            >
              <span className="flex items-center gap-2"><PlusCircle className="w-4 h-4" /> Add New Scheme</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            
            <Link
              href="/admin/residents"
              className="w-full flex items-center justify-between p-3 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground border border-border text-xs font-semibold transition-all"
            >
              <span className="flex items-center gap-2"><Users className="w-4 h-4" /> Manage Residents</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* 4. Analytics Graph Bento - Spans 2 Columns, 2 Rows */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="md:col-span-2 md:row-span-2 glass-card p-6 space-y-4 border-t-4 border-t-rose-600 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold">Welfare analytics</h3>
              <p className="text-xs text-muted-foreground">Cumulative growth chart of registered citizens & policies</p>
            </div>
            <div className="flex items-center gap-2 text-xs bg-secondary px-3 py-1.5 rounded-xl border border-border">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span>H1 2026</span>
            </div>
          </div>

          <div className="flex-1 w-full min-h-[240px]">
            {mounted ? (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={analyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorResidents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSchemes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.3} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} style={{ fontSize: '10px', fill: '#94A3B8' }} />
                  <YAxis tickLine={false} axisLine={false} style={{ fontSize: '10px', fill: '#94A3B8' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="residents" name="Residents" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorResidents)" />
                  <Area type="monotone" dataKey="schemes" name="Schemes" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorSchemes)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[240px] flex items-center justify-center text-muted-foreground text-xs">
                Loading charts...
              </div>
            )}
          </div>
        </motion.div>

        {/* 5. System Audit & Log - Spans 1 Column, 2 Rows */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-1 md:row-span-2 glass-card p-6 flex flex-col justify-between border-t-4 border-t-yellow-500"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-1.5">
                <Activity className="w-4.5 h-4.5 text-yellow-500" /> Admin Audit
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500 flex-shrink-0 mt-1" />
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold leading-tight">Farmer Subsidy Update</p>
                  <p className="text-[10px] text-muted-foreground">BDO modified criteria rules</p>
                  <p className="text-[9px] text-muted-foreground font-medium">10 mins ago</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold leading-tight">Scholarships Published</p>
                  <p className="text-[10px] text-muted-foreground">Broadcasted to 1,080 residents</p>
                  <p className="text-[9px] text-muted-foreground font-medium">3 hours ago</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500 flex-shrink-0 mt-1" />
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold leading-tight">VAO Audit Completed</p>
                  <p className="text-[10px] text-muted-foreground">District verification checklist</p>
                  <p className="text-[9px] text-muted-foreground font-medium">Yesterday</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border/50 text-center flex items-center justify-center gap-1">
            <span className="text-[10px] text-muted-foreground">Session logged under official ID.</span>
          </div>
        </motion.div>

      </div>
    </div>
  )
}
