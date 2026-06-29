'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/providers/auth-provider'
import { motion } from 'framer-motion'
import {
  FileText, Bot, MapPin, Bell, ChevronRight,
  Sparkles, Award, ArrowRight, CheckCircle2, AlertCircle, Clock
} from 'lucide-react'

const categories = [
  { label: 'Agriculture', emoji: '🌾', href: '/schemes?category=Agriculture', count: 12 },
  { label: 'Education', emoji: '📚', href: '/schemes?category=Education', count: 8 },
  { label: 'Health', emoji: '🏥', href: '/schemes?category=Health', count: 6 },
  { label: 'Housing', emoji: '🏠', href: '/schemes?category=Housing', count: 5 },
  { label: 'Employment', emoji: '💼', href: '/schemes?category=Employment', count: 9 },
  { label: 'Women', emoji: '👩', href: '/schemes?category=Women', count: 7 },
  { label: 'Senior Citizen', emoji: '🧓', href: '/schemes?category=Senior Citizen', count: 4 },
  { label: 'Student', emoji: '🎓', href: '/schemes?category=Student', count: 11 },
]

export default function ResidentDashboard() {
  const { profile } = useAuth()
  const [greeting, setGreeting] = useState('Good day')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])

  const firstName = profile?.name?.split(' ')[0] ?? 'Citizen'
  const profileComplete = profile?.profile_complete ?? false

  return (
    <div className="space-y-6 pt-8 lg:pt-0 gov-watermark min-h-[calc(100vh-100px)] relative">
      {/* 1. Welcome Hero - Top Bento spanning all 3 columns */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-emerald-800 via-teal-800 to-cyan-900 text-white shadow-xl border border-emerald-700/30 z-10"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-16 -translate-x-16" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-200 text-xs font-semibold tracking-wider uppercase">Official Citizen Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {greeting}, {firstName}! 👋
            </h1>
            <p className="text-emerald-100/90 text-sm max-w-xl leading-relaxed">
              Welcome to the unified government scheme discovery platform. Discover services, check your eligibility, and get direct assistance.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 self-start md:self-auto">
            <img src="/tn-emblem.png" alt="TN Government" className="w-10 h-10 object-contain" />
            <div>
              <p className="text-xs font-bold text-white leading-tight">Government of Tamil Nadu</p>
              <p className="text-[10px] text-emerald-200 uppercase tracking-wide">Direct Benefit Scheme Portal</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Bento Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        
        {/* 2. Interactive AI Assistant Tile - spans 2 columns, 2 rows */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2 md:row-span-2 glass-card p-6 flex flex-col justify-between group overflow-hidden relative border-t-4 border-t-purple-500"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Bot className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-xs bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 animate-pulse" /> Live Assistant
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold">Ask AI Scheme Assistant</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Describe your current situation, qualifications, and needs in simple words (e.g. "I am a graduate looking for business support"). The AI will search and suggest matching schemes.
              </p>
            </div>

            {/* Quick Prompts Bento Inner Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              <Link href="/ai-assistant" className="p-3 rounded-xl border border-border hover:border-purple-500/40 hover:bg-purple-500/5 transition-all text-xs text-left text-muted-foreground hover:text-foreground flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                "Scholarships for OBC students?"
              </Link>
              <Link href="/ai-assistant" className="p-3 rounded-xl border border-border hover:border-purple-500/40 hover:bg-purple-500/5 transition-all text-xs text-left text-muted-foreground hover:text-foreground flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                "Farming assistance & subsidy?"
              </Link>
            </div>
          </div>

          <div className="pt-6 border-t border-border/50 flex items-center justify-between mt-4">
            <p className="text-xs text-muted-foreground">Powered by Groq Llama 3 Model</p>
            <Link
              href="/ai-assistant"
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md transition-all group-hover:translate-x-1"
            >
              Start Chatting <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* 3. Onboarding & Profile Status Bento - 1 column, 1 row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={`glass-card p-6 flex flex-col justify-between relative overflow-hidden border-t-4 ${
            profileComplete ? 'border-t-emerald-500' : 'border-t-orange-500'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Profile Health</p>
              <h3 className="text-base font-bold">Onboarding Status</h3>
            </div>
            {profileComplete ? (
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 animate-bounce" />
              </div>
            )}
          </div>

          {/* Radial completion percentage widget */}
          <div className="flex items-center gap-4 py-3">
            <div className="relative w-14 h-14 flex-shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-border"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={profileComplete ? "text-emerald-500" : "text-orange-500"}
                  strokeDasharray={`${profileComplete ? 100 : 40}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-xs font-bold">{profileComplete ? '100%' : '40%'}</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground leading-tight">
                {profileComplete
                  ? 'Your profile details are complete. High accuracy matching active.'
                  : 'Complete your onboarding form to get recommended benefits.'}
              </p>
            </div>
          </div>

          <Link
            href={profileComplete ? "/profile" : "/complete-profile"}
            className={`w-full text-center py-2 px-4 rounded-xl text-xs font-bold transition-all ${
              profileComplete
                ? 'bg-secondary hover:bg-secondary/80 text-foreground border border-border'
                : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md'
            }`}
          >
            {profileComplete ? 'Manage Profile' : 'Complete Onboarding Now'}
          </Link>
        </motion.div>

        {/* 4. Active Scheme Updates / Notifications - 1 column, 2 rows */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-1 md:row-span-2 glass-card p-6 flex flex-col justify-between border-t-4 border-t-blue-500"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-400" />
              </div>
              <Link href="/notifications" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-base font-bold">Announcements</h3>
              <p className="text-xs text-muted-foreground">Recent welfare notifications & publication updates</p>
            </div>

            {/* Micro Feed */}
            <div className="space-y-3 pt-2">
              <div className="p-3 rounded-xl bg-secondary/50 border border-border/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded font-semibold">AGRICULTURE</span>
                  <span className="text-[9px] text-muted-foreground flex items-center gap-1"><Clock className="w-2.5 h-2.5"/> 2h ago</span>
                </div>
                <p className="text-xs font-semibold leading-snug line-clamp-1">TN Free Crop Insurance 2026</p>
                <p className="text-[10px] text-muted-foreground line-clamp-2">Farmers can register for premium subsidy coverage directly online...</p>
              </div>

              <div className="p-3 rounded-xl bg-secondary/50 border border-border/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded font-semibold">EDUCATION</span>
                  <span className="text-[9px] text-muted-foreground flex items-center gap-1"><Clock className="w-2.5 h-2.5"/> 1d ago</span>
                </div>
                <p className="text-xs font-semibold leading-snug line-clamp-1">Kamarajar Higher Education Stipend</p>
                <p className="text-[10px] text-muted-foreground line-clamp-2">Financial support of ₹1,000/month for government school students...</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border/50 text-center">
            <span className="text-[11px] text-muted-foreground">Notifications are sent directly from Taluk offices.</span>
          </div>
        </motion.div>

        {/* 5. Browse Scheme Categories Bento Box - 2 columns, 1 row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="md:col-span-2 glass-card p-6 space-y-4 border-t-4 border-t-emerald-600"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold">Welfare Categories</h3>
              <p className="text-xs text-muted-foreground">Direct links to search benefits classified by department</p>
            </div>
            <Link href="/schemes" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
              All Schemes <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {categories.map((cat) => (
              <Link href={cat.href} key={cat.label} className="group block">
                <div className="p-3 rounded-xl border border-border/60 bg-card hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all text-center cursor-pointer">
                  <span className="text-xl block mb-1 group-hover:scale-110 transition-transform">{cat.emoji}</span>
                  <span className="text-xs font-semibold block truncate">{cat.label}</span>
                  <span className="text-[9px] text-muted-foreground mt-0.5 block">{cat.count} Schemes</span>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* 6. Maps & Office Locator Banner - Spans all 3 columns */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="md:col-span-3 glass-card p-6 overflow-hidden relative border-t-4 border-t-teal-600 group"
        >
          <div className="absolute top-0 right-0 w-80 h-full opacity-[0.03] dark:opacity-[0.06] bg-no-repeat bg-cover bg-right bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600')]" />
          
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-teal-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold">Locate Nearest Service Offices</h3>
                <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
                  Find contact numbers, staff hours, and map routing directions to your local E-Sevai Centers, VAO Offices, Taluk Offices, and Block Development Head Offices.
                </p>
              </div>
            </div>
            
            <Link
              href="/nearby-offices"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-md transition-all self-start sm:self-auto group-hover:translate-x-1"
            >
              Open Locator Map <MapPin className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  )
}
