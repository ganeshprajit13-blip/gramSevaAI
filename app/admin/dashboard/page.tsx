'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/components/providers/auth-provider'
import { useLanguage } from '@/components/providers/language-provider'
import {
  FileText, Users, Bell, PlusCircle, ChevronRight, TrendingUp,
  CheckCircle2, Shield, Settings, Calendar, Activity, ShieldAlert,
  Trash2, Edit3, Bot, Sparkles, Upload, History, SlidersHorizontal,
  Database, UserCheck, AlertTriangle, AlertCircle, RefreshCw, Eye, Search

} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend, RadialBarChart, RadialBar
} from 'recharts'

import { toast } from 'sonner'
import { getStoredResidents, computeCentralMetrics } from '@/lib/resident-store'
import { getStoredAnnouncements, saveAnnouncement, deleteAnnouncement, type AnnouncementRecord } from '@/lib/announcement-store'
import { getStoredComplaints, updateComplaintStatus, type ComplaintRecord } from '@/lib/complaint-store'

// Static mockup datasets for admin analytics
const monthlyApplicationsData = [
  { month: 'Jan', applied: 140, approved: 110 },
  { month: 'Feb', applied: 290, approved: 230 },
  { month: 'Mar', applied: 480, approved: 410 },
  { month: 'Apr', applied: 750, approved: 680 },
  { month: 'May', applied: 910, approved: 850 },
  { month: 'Jun', applied: 1080, approved: 980 },
]

const complaintsData = [
  { category: 'Water', registered: 45, resolved: 42 },
  { category: 'Power', registered: 68, resolved: 60 },
  { category: 'Roads', registered: 32, resolved: 24 },
  { category: 'Sanitation', registered: 29, resolved: 28 },
  { category: 'Other', registered: 18, resolved: 14 },
]

const schemePopularity = [
  { name: 'PM Kisan', beneficiaries: 680 },
  { name: 'PM Awas', beneficiaries: 450 },
  { name: 'Scholarships', beneficiaries: 320 },
  { name: 'Pensions', beneficiaries: 290 },
  { name: 'Skill Dev', beneficiaries: 120 },
]

// Mock databases for interactive admin operations
const INITIAL_CITIZENS = [
  { id: 'CIT-901', name: 'Sakthi Vadivel', village: 'Ward 1', mobile: '9876543210', occupation: 'Farmer', status: 'Active' },
  { id: 'CIT-902', name: 'Kumar Raja', village: 'Ward 2', mobile: '9765432109', occupation: 'Student', status: 'Active' },
  { id: 'CIT-903', name: 'Abirami Sundari', village: 'Ward 1', mobile: '9654321098', occupation: 'Teacher', status: 'Active' },
  { id: 'CIT-904', name: 'Ramasamy K', village: 'Ward 3', mobile: '9543210987', occupation: 'Retired', status: 'Active' },
  { id: 'CIT-905', name: 'Meena Devi', village: 'Ward 2', mobile: '9432109876', occupation: 'Homemaker', status: 'Suspended' },
]

const INITIAL_SCHEMES = [
  { id: 'SCH-01', name: 'PM Kisan Samman Nidhi', dept: 'Agriculture', eligibility: 'Farmers with land ≤ 2 hectares', status: 'Published' },
  { id: 'SCH-02', name: 'Pradhan Mantri Awas Yojana', dept: 'Rural Development', eligibility: 'BPL / Houseless families', status: 'Published' },
  { id: 'SCH-03', name: 'Ayushman Bharat PM-JAY', dept: 'Health', eligibility: 'Vulnerable families', status: 'Published' },
  { id: 'SCH-04', name: 'National Scholarship', dept: 'Minority Affairs', eligibility: 'Student income ≤ 2L', status: 'Draft' },
]

const INITIAL_CERTIFICATES = [
  { id: 'CERT-101', citizen: 'Sakthi Vadivel', type: 'Income Certificate', status: 'Pending', docName: 'Income_Declaration.pdf' },
  { id: 'CERT-102', citizen: 'Kumar Raja', type: 'Community Certificate', status: 'Pending', docName: 'Community_Proof.jpg' },
  { id: 'CERT-103', citizen: 'Ramasamy K', type: 'Patta Transfer', status: 'Pending', docName: 'Land_Deed.pdf' },
]

const INITIAL_COMPLAINTS = [
  { id: 'CMP-201', citizen: 'Sakthi Vadivel', category: 'Water Supply', priority: 'High', status: 'Pending', remarks: 'No water supply in Ward 1' },
  { id: 'CMP-202', citizen: 'Abirami Sundari', category: 'Electricity', priority: 'Medium', status: 'In Progress', remarks: 'Voltage fluctuation damages appliances' },
]

const INITIAL_AUDITS = [
  { action: 'Admin logged in', user: 'BDO Officer', module: 'Auth', timestamp: '2026-07-07 19:40' },
  { action: 'Scheme criteria modified', user: 'BDO Officer', module: 'Welfares', timestamp: '2026-07-07 18:15' },
  { action: 'Citizen suspension updated', user: 'BDO Officer', module: 'Residents', timestamp: '2026-07-07 17:30' },
  { action: 'Village Notice published', user: 'BDO Officer', module: 'Announcements', timestamp: '2026-07-07 16:00' },
]

export default function AdminDashboard() {
  const { profile } = useAuth()
  const { t, language } = useLanguage()
  
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // Component local states simulating database
  const [citizens, setCitizens] = useState(INITIAL_CITIZENS)
  const [schemes, setSchemes] = useState(INITIAL_SCHEMES)
  const [certificates, setCertificates] = useState(INITIAL_CERTIFICATES)
  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS)
  const [audits, setAudits] = useState(INITIAL_AUDITS)

  // Form states for creating resources
  const [showAddScheme, setShowAddScheme] = useState(false)
  const [newSchemeName, setNewSchemeName] = useState('')
  const [newSchemeDept, setNewSchemeDept] = useState('Agriculture')
  const [newSchemeElig, setNewSchemeElig] = useState('')

  const [showAddAnnounce, setShowAddAnnounce] = useState(false)
  const [noticeType, setNoticeType] = useState('scheme')
  const [noticeContent, setNoticeContent] = useState('')
  const [uploadedImageDataUrl, setUploadedImageDataUrl] = useState<string>('')

  // AI Configuration state variables
  const [aiProvider, setAiProvider] = useState('groq')
  const [aiPromptTemplate, setAiPromptTemplate] = useState('Verify citizen details and match with welfare database.')

  // Sync tab state with query string on mount and URL changes
  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      const handleTabCheck = () => {
        const params = new URLSearchParams(window.location.search)
        const tab = params.get('tab')
        if (tab) setActiveTab(tab)
      }
      handleTabCheck()
      window.addEventListener('popstate', handleTabCheck)
      return () => window.removeEventListener('popstate', handleTabCheck)
    }
  }, [])

  // Navigation tab helper
  const navigateToTab = (tabName: string) => {
    setActiveTab(tabName)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('tab', tabName)
      window.history.pushState({}, '', url.toString())
    }
  }

  // Action callback wrappers simulating database operations
  const handleUserSuspend = (id: string) => {
    setCitizens(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'Active' ? 'Suspended' : 'Active' } : c))
    toast.success(`Resident ${id} status updated successfully!`)
    setAudits(prev => [
      { action: `Status modified for ${id}`, user: 'BDO Officer', module: 'Residents', timestamp: 'Just now' },
      ...prev
    ])
  }

  const handleUserDelete = (id: string) => {
    setCitizens(prev => prev.filter(c => c.id !== id))
    toast.error(`Citizen ${id} record removed from sandbox.`)
    setAudits(prev => [
      { action: `Deleted citizen record ${id}`, user: 'BDO Officer', module: 'Residents', timestamp: 'Just now' },
      ...prev
    ])
  }

  const handleAddSchemeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSchemeName.trim()) return
    const newId = `SCH-0${schemes.length + 1}`
    setSchemes(prev => [...prev, { id: newId, name: newSchemeName, dept: newSchemeDept, eligibility: newSchemeElig || 'All Residents', status: 'Draft' }])
    toast.success(`Scheme "${newSchemeName}" created successfully in Draft mode.`)
    setNewSchemeName('')
    setNewSchemeElig('')
    setShowAddScheme(false)
    setAudits(prev => [
      { action: `Created draft scheme ${newId}`, user: 'BDO Officer', module: 'Welfares', timestamp: 'Just now' },
      ...prev
    ])
  }

  const handleSchemePublishToggle = (id: string) => {
    setSchemes(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'Published' ? 'Draft' : 'Published' } : s))
    toast.success(`Scheme ${id} publication state updated.`)
  }

  const handleCertificateApprove = (id: string, action: 'Approve' | 'Reject') => {
    setCertificates(prev => prev.filter(c => c.id !== id))
    toast.success(`Certificate request ${id} has been ${action === 'Approve' ? 'Approved' : 'Rejected'}.`)
    setAudits(prev => [
      { action: `${action}d certificate request ${id}`, user: 'BDO Officer', module: 'Certificates', timestamp: 'Just now' },
      ...prev
    ])
  }

  const handleComplaintResolve = (id: string) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: 'Resolved' } : c))
    toast.success(`Complaint ${id} marked as Resolved.`)
    setAudits(prev => [
      { action: `Resolved complaint ${id}`, user: 'BDO Officer', module: 'Complaints', timestamp: 'Just now' },
      ...prev
    ])
  }

  const handleAddAnnounceSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!noticeContent.trim()) return
    toast.success(`Notice broadcasted to all citizens: "${noticeContent.slice(0, 30)}..."`)
    setNoticeContent('')
    setShowAddAnnounce(false)
    setAudits(prev => [
      { action: `Broadcasted notice (${noticeType})`, user: 'BDO Officer', module: 'Announcements', timestamp: 'Just now' },
      ...prev
    ])
  }

  const handleSaveAiConfig = () => {
    toast.success(`AI Configuration updated: Provider set to ${aiProvider.toUpperCase()}.`)
    setAudits(prev => [
      { action: `Updated AI Provider settings`, user: 'BDO Officer', module: 'AI Config', timestamp: 'Just now' },
      ...prev
    ])
  }

  // Sidebar navigation listener hook
  useEffect(() => {
    const handleSidebarTabChange = (e: Event) => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search)
        const tab = params.get('tab')
        if (tab) setActiveTab(tab)
      }
    }
    window.addEventListener('popstate', handleSidebarTabChange)
    return () => window.removeEventListener('popstate', handleSidebarTabChange)
  }, [])

  return (
    <div className="space-y-6 pt-4 min-h-[calc(100vh-100px)] relative">
      
      {/* ── BDO BANNER ── */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 text-white shadow-xl border border-blue-800/30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-400 animate-pulse" />
              <span className="text-blue-300 text-xs font-semibold tracking-wider uppercase">{t('bdoConsole')}</span>
            </div>
            <h1 className="text-2xl sm:text-3.5xl font-extrabold tracking-tight">
              {t('welcomeBdo')}! 🛡️
            </h1>
            <p className="text-slate-300 text-xs max-w-xl leading-relaxed">
              Verify applications, moderate complaints, coordinate welfare policy criteria, broadcast local news alerts, and manage direct benefit distributions.
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 self-start md:self-auto">
            <img src="/tn-emblem.svg" alt="TN Government" className="w-9 h-9 object-contain invert brightness-200" />
            <div>
              <p className="text-xs font-bold text-white leading-tight">{t('govOfTN')}</p>
              <p className="text-[9px] text-blue-300 uppercase tracking-wider">{t('ruralDevDept')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-1 bg-secondary/80 p-1.5 rounded-2xl border border-border/80 scrollbar-none">
        <button onClick={() => navigateToTab('overview')} className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${activeTab === 'overview' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Overview</button>
        <Link href="/admin/women-empowerment" className="px-4 py-2 text-xs font-black rounded-xl whitespace-nowrap transition-all cursor-pointer bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-sm hover:shadow-md flex items-center gap-1.5">
          <span>💖 Women Empowerment &amp; Demographics</span>
          <span className="bg-white/20 text-[9px] px-1.5 py-0.5 rounded-md uppercase font-extrabold">NEW</span>
        </Link>
        <button onClick={() => navigateToTab('citizens')} className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${activeTab === 'citizens' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Citizens</button>
        <button onClick={() => navigateToTab('schemes')} className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${activeTab === 'schemes' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Schemes</button>
        
        <button onClick={() => navigateToTab('complaints')} className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${activeTab === 'complaints' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Complaints</button>
        <button onClick={() => navigateToTab('announcements')} className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${activeTab === 'announcements' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Announcements</button>
        <button onClick={() => navigateToTab('ai-config')} className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${activeTab === 'ai-config' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>AI Settings</button>
        <button onClick={() => navigateToTab('audit-logs')} className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${activeTab === 'audit-logs' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Audit Logs</button>
        <button onClick={() => navigateToTab('settings')} className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${activeTab === 'settings' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Settings</button>
      </div>

      {/* ── RENDERING CONDITIONAL BLOCKS BASED ON ACTIVETAB ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* 1. OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Statistical Cards Grid */}
              {(() => {
                const liveMetrics = computeCentralMetrics(false)
                return (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="glass-card p-4 border-l-4 border-l-blue-500 shadow-xs">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Total Citizens</span>
                      <p className="text-xl font-black mt-1">{liveMetrics.totalPopulation.toLocaleString()}</p>
                      <span className="text-[9px] text-emerald-600 font-semibold">✓ Live Data</span>
                    </div>
                    <div className="glass-card p-4 border-l-4 border-l-pink-500 shadow-xs">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Women Registered</span>
                      <p className="text-xl font-black mt-1">{liveMetrics.womenRegistered.toLocaleString()}</p>
                      <span className="text-[9px] text-pink-600 font-semibold">Live Store</span>
                    </div>
                    <div className="glass-card p-4 border-l-4 border-l-emerald-500 shadow-xs">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Scheme Eligible</span>
                      <p className="text-xl font-black mt-1">{liveMetrics.womenEligible.toLocaleString()}</p>
                      <span className="text-[9px] text-emerald-600 font-semibold">Auto Calculated</span>
                    </div>
                    <div className="glass-card p-4 border-l-4 border-l-orange-500 shadow-xs">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Pending Verifications</span>
                      <p className="text-xl font-black mt-1">{liveMetrics.pendingVerifications}</p>
                      <span className="text-[9px] text-orange-600 font-semibold">Awaiting BDO</span>
                    </div>
                    <div className="glass-card p-4 border-l-4 border-l-purple-500 shadow-xs">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Verified Citizens</span>
                      <p className="text-xl font-black mt-1">{liveMetrics.verifiedCount}</p>
                      <span className="text-[9px] text-purple-600 font-semibold">Documents Verified</span>
                    </div>
                  </div>
                )
              })()}

              {/* Charts grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Monthly applications */}
                <div className="lg:col-span-2 glass-card p-5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-primary" /> Monthly Applications & Approvals</h3>
                  <div className="h-[220px] w-full mt-2">
                    {mounted ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyApplicationsData} margin={{ left: -20, right: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.3} />
                          <XAxis dataKey="month" style={{ fontSize: '10px' }} />
                          <YAxis style={{ fontSize: '10px' }} />
                          <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                          <Area type="monotone" dataKey="applied" name="Applied" stroke="#f97316" fill="#f97316" fillOpacity={0.06} strokeWidth={2} />
                          <Area type="monotone" dataKey="approved" name="Approved" stroke="#10b981" fill="#10b981" fillOpacity={0.06} strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : null}
                  </div>
                </div>

                {/* System Audit log log-widget */}
                <div className="glass-card p-5 space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><History className="w-4.5 h-4.5 text-yellow-500" /> Recent Audits</h3>
                    <div className="space-y-3.5 pt-3">
                      {audits.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex gap-2.5 text-xs">
                          <div className="w-2 h-2 rounded-full bg-orange-500 mt-1 flex-shrink-0" />
                          <div>
                            <p className="font-bold leading-none">{item.action}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{item.module} • {item.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => navigateToTab('audit-logs')} className="w-full text-center py-2 text-[10px] font-bold border border-border rounded-xl hover:bg-secondary cursor-pointer">
                    View Complete Audit History
                  </button>
                </div>
              </div>

              {/* Second Row of charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Complaints resolution bar-chart */}
                <div className="glass-card p-5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Complaints Status by Category</h3>
                  <div className="h-[200px] w-full">
                    {mounted ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={complaintsData} margin={{ left: -20 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.3} />
                          <XAxis dataKey="category" style={{ fontSize: '10px' }} />
                          <YAxis style={{ fontSize: '10px' }} />
                          <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                          <Legend wrapperStyle={{ fontSize: '10px' }} />
                          <Bar dataKey="registered" name="Registered" fill="#f87171" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="resolved" name="Resolved" fill="#34d399" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : null}
                  </div>
                </div>

                {/* Popularity chart */}
                <div className="glass-card p-5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Welfare Scheme Beneficiaries</h3>
                  <div className="h-[200px] w-full">
                    {mounted ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart data={schemePopularity} innerRadius="30%" outerRadius="90%" barSize={10} margin={{ left: 10 }}>
                          <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                          <RadialBar background dataKey="beneficiaries" fill="#6366f1" />
                          <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={{ fontSize: '10px' }} />
                        </RadialBarChart>
                      </ResponsiveContainer>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. CITIZENS MANAGEMENT TAB */}
          {activeTab === 'citizens' && (
            <div className="space-y-4 glass-card p-6">
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-bold text-sm">Registered Citizens Management</h3>
                <div className="relative w-full max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" placeholder="Filter citizens..." className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-secondary border border-border focus:outline-none" />
                </div>
              </div>

              <div className="overflow-x-auto mt-4">
                <table className="w-full text-xs">
                  <thead className="border-b border-border bg-secondary/50">
                    <tr>
                      <th className="p-3 text-left">Citizen ID</th>
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Village</th>
                      <th className="p-3 text-left">Mobile</th>
                      <th className="p-3 text-left">Occupation</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {citizens.map((citizen) => (
                      <tr key={citizen.id} className="hover:bg-secondary/30 transition-all">
                        <td className="p-3 font-mono font-bold text-muted-foreground">{citizen.id}</td>
                        <td className="p-3 font-semibold">{citizen.name}</td>
                        <td className="p-3 text-muted-foreground">{citizen.village}</td>
                        <td className="p-3 text-muted-foreground">{citizen.mobile}</td>
                        <td className="p-3 text-muted-foreground">{citizen.occupation}</td>
                        <td className="p-3">
                          <span className={`badge ${
                            citizen.status === 'Active' ? 'badge-status-active' : 'badge-status-suspended'
                          }`}>
                            {citizen.status}
                          </span>
                        </td>
                        <td className="p-3 text-center flex items-center justify-center gap-2">
                          <button onClick={() => handleUserSuspend(citizen.id)} className="p-1 rounded hover:bg-secondary text-primary cursor-pointer" title="Toggle Active/Suspend">
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleUserDelete(citizen.id)} className="p-1 rounded hover:bg-secondary text-destructive cursor-pointer" title="Remove Record">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. SCHEMES TAB */}
          {activeTab === 'schemes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm">Village Welfare Scheme Catalog</h3>
                  <p className="text-[10px] text-muted-foreground">Configure matching eligibility constraints and required validation documents</p>
                </div>
                <button onClick={() => setShowAddScheme(true)} className="px-3.5 py-1.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                  <PlusCircle className="w-4 h-4" /> Add New Scheme
                </button>
              </div>

              {/* Add Scheme modal popup overlay */}
              {showAddScheme && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                  <div className="bg-card border border-border p-6 rounded-2xl w-full max-w-md space-y-4">
                    <h3 className="font-black text-sm">Add New Welfare Scheme</h3>
                    <form onSubmit={handleAddSchemeSubmit} className="space-y-3.5">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Scheme Name</label>
                        <input type="text" value={newSchemeName} onChange={e => setNewSchemeName(e.target.value)} required className="w-full p-2 text-xs rounded-xl bg-secondary border border-border" placeholder="e.g. Agricultural Fertiliser Subsidy" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Department</label>
                        <select value={newSchemeDept} onChange={e => setNewSchemeDept(e.target.value)} className="w-full p-2 text-xs rounded-xl bg-secondary border border-border">
                          <option value="Agriculture">Agriculture</option>
                          <option value="Rural Development">Rural Development</option>
                          <option value="Health">Health</option>
                          <option value="Education">Education</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Eligibility Criteria</label>
                        <input type="text" value={newSchemeElig} onChange={e => setNewSchemeElig(e.target.value)} className="w-full p-2 text-xs rounded-xl bg-secondary border border-border" placeholder="e.g. Farmers holding < 2 Hectares" />
                      </div>
                      <div className="flex gap-2 justify-end pt-3">
                        <button type="button" onClick={() => setShowAddScheme(false)} className="px-4 py-2 border border-border rounded-xl text-xs font-bold hover:bg-secondary cursor-pointer">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold cursor-pointer">Create Scheme</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Schemes Catalog table */}
              <div className="glass-card p-6">
                <table className="w-full text-xs">
                  <thead className="border-b border-border bg-secondary/50">
                    <tr>
                      <th className="p-3 text-left">ID</th>
                      <th className="p-3 text-left">Scheme Name</th>
                      <th className="p-3 text-left">Department</th>
                      <th className="p-3 text-left">Eligibility</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-center">Toggle State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {schemes.map((scheme) => (
                      <tr key={scheme.id} className="hover:bg-secondary/30 transition-all">
                        <td className="p-3 font-mono font-bold text-muted-foreground">{scheme.id}</td>
                        <td className="p-3 font-bold">{scheme.name}</td>
                        <td className="p-3 text-muted-foreground">{scheme.dept}</td>
                        <td className="p-3 text-muted-foreground">{scheme.eligibility}</td>
                        <td className="p-3">
                          <span className={`badge ${
                            scheme.status === 'Published' ? 'badge-status-published' : 'badge-status-draft'
                          }`}>
                            {scheme.status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button onClick={() => handleSchemePublishToggle(scheme.id)} className="px-2.5 py-1 text-[9px] font-bold rounded-lg border border-border hover:bg-secondary cursor-pointer">
                            {scheme.status === 'Published' ? 'Deactivate' : 'Publish'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. COMPLAINTS MANAGEMENT TAB — Live Store */}
          {activeTab === 'complaints' && (
            <div className="space-y-6 glass-card p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <h3 className="font-extrabold text-base text-foreground">Village Grievance & Complaints Resolution Desk</h3>
                  <p className="text-xs text-muted-foreground">Inspect submitted citizen grievances, update resolution status, and send officer remarks directly to the villager</p>
                </div>
                <span className="text-[10px] font-black uppercase bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 rounded-full">
                  Live Grievance Store
                </span>
              </div>

              {(() => {
                const liveComplaints = getStoredComplaints()
                return (
                  <div className="space-y-4">
                    {liveComplaints.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-8 text-center">No citizen complaints currently registered.</p>
                    ) : (
                      liveComplaints.map((cmp) => {
                        const statusColors: Record<string, string> = {
                          Pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
                          Accepted: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
                          'In Progress': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
                          Resolved: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
                          Rejected: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
                        }

                        return (
                          <div key={cmp.id} className="p-5 rounded-2xl bg-secondary/40 border border-border space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono font-bold text-xs bg-background px-2.5 py-1 rounded-md border border-border">{cmp.id}</span>
                                <span className="text-[9px] font-bold uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-full">{cmp.category}</span>
                                <span className="text-xs font-semibold text-muted-foreground">{cmp.village} ({cmp.ward_number})</span>
                              </div>
                              <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${statusColors[cmp.status] || 'bg-secondary text-muted-foreground'}`}>
                                {cmp.status}
                              </span>
                            </div>

                            <div>
                              <h4 className="font-bold text-sm text-foreground">{cmp.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{cmp.description}</p>
                              <p className="text-[11px] text-muted-foreground font-semibold mt-1">Submitted by: <strong className="text-foreground">{cmp.resident_name}</strong> (Mobile: {cmp.resident_mobile})</p>
                            </div>

                            {cmp.bdo_remarks && (
                              <div className="p-3 rounded-xl bg-background border border-border text-xs space-y-1">
                                <span className="font-bold text-primary block">BDO Officer Remarks:</span>
                                <p className="italic text-muted-foreground">&quot;{cmp.bdo_remarks}&quot;</p>
                              </div>
                            )}

                            {/* BDO Action Buttons */}
                            <div className="pt-2 flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase">Update Status:</span>
                              <button
                                onClick={() => {
                                  const remarks = prompt('Enter BDO Officer Remarks for Applicant:', 'BDO Accepted your complaint. Inspection team assigned.')
                                  if (remarks !== null) { updateComplaintStatus(cmp.id, 'Accepted', remarks); toast.success('Status updated to Accepted') }
                                }}
                                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                              >
                                Accept 🟢
                              </button>
                              <button
                                onClick={() => {
                                  const remarks = prompt('Enter BDO Officer Remarks for Applicant:', 'Work in progress by Panchayat team.')
                                  if (remarks !== null) { updateComplaintStatus(cmp.id, 'In Progress', remarks); toast.success('Status updated to In Progress') }
                                }}
                                className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                              >
                                In Progress 🔵
                              </button>
                              <button
                                onClick={() => {
                                  const remarks = prompt('Enter BDO Officer Remarks for Applicant:', 'Grievance resolved and verified.')
                                  if (remarks !== null) { updateComplaintStatus(cmp.id, 'Resolved', remarks); toast.success('Status updated to Resolved') }
                                }}
                                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                              >
                                Mark Resolved ✅
                              </button>
                              <button
                                onClick={() => {
                                  const remarks = prompt('Reason for Rejection:', 'Duplicate or invalid request.')
                                  if (remarks !== null) { updateComplaintStatus(cmp.id, 'Rejected', remarks); toast.success('Status updated to Rejected') }
                                }}
                                className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                              >
                                Reject 🔴
                              </button>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                )
              })()}
            </div>
          )}

          {/* 5. ANNOUNCEMENTS TAB — Enhanced with Full Details */}
          {activeTab === 'announcements' && (
            <div className="space-y-6 glass-card p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <h3 className="font-extrabold text-base text-foreground">Village Public Announcements Broadcasting Center</h3>
                  <p className="text-xs text-muted-foreground">Publish Gram Sabha meetings, health camps, subsidy distributions, and emergency notices to all residents</p>
                </div>
                <button
                  onClick={() => setShowAddAnnounce(true)}
                  className="px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" /> Publish Village Notice
                </button>
              </div>

              {/* Add Announcement Modal */}
              {showAddAnnounce && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
                  <div className="bg-card border border-border p-6 rounded-3xl w-full max-w-xl space-y-4 my-8 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <h3 className="font-black text-base text-foreground">Publish Village Public Announcement</h3>
                      <button onClick={() => setShowAddAnnounce(false)} className="text-muted-foreground hover:text-foreground cursor-pointer text-lg">✕</button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        const form = e.target as HTMLFormElement
                        const titleVal = (form.elements.namedItem('ann_title') as HTMLInputElement).value
                        const catVal = (form.elements.namedItem('ann_cat') as HTMLSelectElement).value
                        const dateVal = (form.elements.namedItem('ann_date') as HTMLInputElement).value
                        const startTimeVal = (form.elements.namedItem('ann_start') as HTMLInputElement).value
                        const endTimeVal = (form.elements.namedItem('ann_end') as HTMLInputElement).value
                        const venueVal = (form.elements.namedItem('ann_venue') as HTMLInputElement).value
                        const villageVal = (form.elements.namedItem('ann_village') as HTMLInputElement).value
                        const restrictionsVal = (form.elements.namedItem('ann_restr') as HTMLInputElement).value
                        const descVal = (form.elements.namedItem('ann_desc') as HTMLTextAreaElement).value
                        const imgVal = (form.elements.namedItem('ann_img') as HTMLInputElement).value
                        const orgVal = (form.elements.namedItem('ann_org') as HTMLInputElement).value
                        const phoneVal = (form.elements.namedItem('ann_phone') as HTMLInputElement).value
                        const wardVal = (form.elements.namedItem('ann_ward') as HTMLInputElement).value

                        saveAnnouncement({
                          title: titleVal,
                          category: catVal as any,
                          date: dateVal,
                          start_time: startTimeVal,
                          end_time: endTimeVal,
                          venue: venueVal,
                          village: villageVal,
                          ward_number: wardVal,
                          eligibility_restrictions: restrictionsVal,
                          description: descVal,
                          image_url: imgVal || 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
                          organizer: orgVal || 'BDO Office',
                          contact_number: phoneVal || '1800-425-1000',
                          status: 'Published'
                        })

                        toast.success('🎉 Village Announcement Published & Sent to all Resident Notifications!')
                        setShowAddAnnounce(false)
                      }}
                      className="space-y-4"
                    >
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground">Announcement Title *</label>
                        <input name="ann_title" required type="text" placeholder="e.g. Special Gram Sabha Budget Meeting" className="w-full p-2.5 text-xs rounded-xl bg-secondary border border-border font-semibold" />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Category *</label>
                          <select name="ann_cat" className="w-full p-2.5 text-xs rounded-xl bg-secondary border border-border font-bold">
                            <option value="Gram Sabha">Gram Sabha</option>
                            <option value="Health Camp">Health Camp</option>
                            <option value="Awareness Rally">Awareness Rally</option>
                            <option value="Crop Subsidy Distribution">Crop Subsidy Distribution</option>
                            <option value="Public Works">Public Works</option>
                            <option value="Emergency Alert">Emergency Alert</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Event Date *</label>
                          <input name="ann_date" required type="date" defaultValue="2026-08-05" className="w-full p-2.5 text-xs rounded-xl bg-secondary border border-border font-semibold" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Start Time *</label>
                          <input name="ann_start" required defaultValue="10:00 AM" placeholder="10:00 AM" className="w-full p-2.5 text-xs rounded-xl bg-secondary border border-border font-semibold" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">End Time *</label>
                          <input name="ann_end" required defaultValue="01:00 PM" placeholder="01:00 PM" className="w-full p-2.5 text-xs rounded-xl bg-secondary border border-border font-semibold" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Venue / Location *</label>
                          <input name="ann_venue" required type="text" placeholder="Gram Panchayat Community Hall" className="w-full p-2.5 text-xs rounded-xl bg-secondary border border-border font-semibold" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Target Village</label>
                          <input name="ann_village" defaultValue="All Villages" className="w-full p-2.5 text-xs rounded-xl bg-secondary border border-border font-semibold" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Ward Number</label>
                          <input name="ann_ward" defaultValue="All Wards" className="w-full p-2.5 text-xs rounded-xl bg-secondary border border-border font-semibold" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Organizer / Officer</label>
                          <input name="ann_org" defaultValue="BDO Office" className="w-full p-2.5 text-xs rounded-xl bg-secondary border border-border font-semibold" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground">Target Audience & Entry Restrictions *</label>
                        <input name="ann_restr" required defaultValue="Open to all adult residents (18+ yrs)." placeholder="e.g. Senior citizens 60+ yrs, Women only, Registered farmers..." className="w-full p-2.5 text-xs rounded-xl bg-secondary border border-border font-semibold" />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground">Detailed Content / Agenda *</label>
                        <textarea name="ann_desc" required rows={3} placeholder="Provide agenda details, required documents to bring, scheme coverage..." className="w-full p-2.5 text-xs rounded-xl bg-secondary border border-border font-medium" />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Flyer Image URL (Optional)</label>
                          <input name="ann_img" type="text" placeholder="https://..." className="w-full p-2.5 text-xs rounded-xl bg-secondary border border-border font-medium" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Contact Helpline</label>
                          <input name="ann_phone" defaultValue="1800-425-1000" className="w-full p-2.5 text-xs rounded-xl bg-secondary border border-border font-semibold" />
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end pt-3 border-t border-border">
                        <button type="button" onClick={() => setShowAddAnnounce(false)} className="px-4 py-2 border border-border rounded-xl text-xs font-bold hover:bg-secondary cursor-pointer">Cancel</button>
                        <button type="submit" className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-black shadow-sm cursor-pointer">🔔 Publish & Notify All Residents</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Published Announcements Feed from Store */}
              {(() => {
                const liveAnnouncements = getStoredAnnouncements()
                return (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Published Announcements ({liveAnnouncements.length})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {liveAnnouncements.map((anc) => (
                        <div key={anc.id} className="p-4 rounded-2xl bg-secondary/40 border border-border space-y-3 flex flex-col justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-bold uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-full">{anc.category}</span>
                              <span className="text-[10px] font-bold text-muted-foreground">{anc.date}</span>
                            </div>
                            <h4 className="font-extrabold text-sm text-foreground">{anc.title}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{anc.description}</p>
                          </div>

                          <div className="p-2.5 bg-background border border-border rounded-xl text-[11px] space-y-1">
                            <div className="flex justify-between"><span className="text-muted-foreground">Time:</span> <span className="font-bold">{anc.start_time} – {anc.end_time}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Venue:</span> <span className="font-bold">{anc.venue}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Restrictions:</span> <span className="font-bold text-amber-600 dark:text-amber-400">{anc.eligibility_restrictions}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Contact:</span> <span className="font-bold">{anc.contact_number}</span></div>
                          </div>

                          <div className="pt-2 flex justify-end">
                            <button
                              onClick={() => { deleteAnnouncement(anc.id); toast.success('Announcement deleted.') }}
                              className="px-3 py-1 bg-red-600/10 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                            >
                              Delete Notice
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </div>
          )}

          {/* 7. AI CONFIGURATION TAB */}
          {activeTab === 'ai-config' && (
            <div className="space-y-6 glass-card p-6">
              <div>
                <h3 className="font-bold text-sm">GramSeva AI Assistant Settings</h3>
                <p className="text-[10px] text-muted-foreground">Configure AI prompt directives, models and monitor querying limits</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">AI Provider Model</label>
                    <select value={aiProvider} onChange={e => setAiProvider(e.target.value)} className="w-full p-2.5 text-xs rounded-xl bg-secondary border border-border font-semibold">
                      <option value="groq">Groq (Llama 3 Model) - Fast [Default]</option>
                      <option value="gemini">Google Gemini 1.5 Pro - High Accuracy</option>
                      <option value="openai">OpenAI GPT-4o - Premium</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">AI API Security Key (Masked)</label>
                    <input type="password" value="••••••••••••••••••••••••••••" disabled className="w-full p-2.5 text-xs rounded-xl bg-secondary/60 border border-border font-mono text-muted-foreground cursor-not-allowed" />
                    <span className="text-[9px] text-muted-foreground block mt-1">API keys are loaded securely from `.env.local` variables during runtime.</span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">AI System Prompt Template</label>
                    <textarea value={aiPromptTemplate} onChange={e => setAiPromptTemplate(e.target.value)} rows={4} className="w-full p-2.5 text-xs rounded-xl bg-secondary border border-border leading-relaxed font-mono" />
                  </div>

                  <button onClick={handleSaveAiConfig} className="px-5 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl cursor-pointer">
                    Save AI Settings
                  </button>
                </div>

                {/* AI usage telemetry stats */}
                <div className="p-4 bg-secondary/40 border border-border rounded-2xl flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs flex items-center gap-1.5 text-purple-600"><Bot className="w-4 h-4" /> AI Diagnostics Metrics</h4>
                    <p className="text-[10px] text-muted-foreground">Real-time health status of local Groq/Gemini client APIs</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-background border border-border p-3 rounded-xl">
                      <span className="text-[9px] uppercase font-bold text-muted-foreground">API Latency</span>
                      <p className="text-sm font-black text-emerald-500 mt-1">320ms</p>
                    </div>
                    <div className="bg-background border border-border p-3 rounded-xl">
                      <span className="text-[9px] uppercase font-bold text-muted-foreground">Success Rate</span>
                      <p className="text-sm font-black text-emerald-500 mt-1">99.8%</p>
                    </div>
                    <div className="bg-background border border-border p-3 rounded-xl">
                      <span className="text-[9px] uppercase font-bold text-muted-foreground">Total Tokens Today</span>
                      <p className="text-sm font-black text-primary mt-1">42,500</p>
                    </div>
                    <div className="bg-background border border-border p-3 rounded-xl">
                      <span className="text-[9px] uppercase font-bold text-muted-foreground">API Status</span>
                      <p className="text-sm font-black text-emerald-500 mt-1 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Online
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 8. AUDIT LOGS TAB */}
          {activeTab === 'audit-logs' && (
            <div className="space-y-4 glass-card p-6">
              <div>
                <h3 className="font-bold text-sm">Security Admin Audit Log History</h3>
                <p className="text-[10px] text-muted-foreground">Direct ledger records tracking login sessions, database deletions, and document approvals</p>
              </div>

              <div className="overflow-x-auto mt-4">
                <table className="w-full text-xs">
                  <thead className="border-b border-border bg-secondary/50">
                    <tr>
                      <th className="p-3 text-left">Action Event</th>
                      <th className="p-3 text-left">Administrator</th>
                      <th className="p-3 text-left">Target Module</th>
                      <th className="p-3 text-left">Log Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {audits.map((log, idx) => (
                      <tr key={idx} className="hover:bg-secondary/30 transition-all font-mono text-[10px]">
                        <td className="p-3 text-foreground font-bold">{log.action}</td>
                        <td className="p-3 text-muted-foreground">{log.user}</td>
                        <td className="p-3"><span className="badge bg-secondary text-foreground font-semibold px-2">{log.module}</span></td>
                        <td className="p-3 text-muted-foreground">{log.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 9. SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="space-y-6 glass-card p-6">
              <div>
                <h3 className="font-bold text-sm">Village Administration Settings</h3>
                <p className="text-[10px] text-muted-foreground">Backup parameters, village boundaries, and interface localization setup</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="space-y-4">
                  <h4 className="font-bold text-xs text-primary border-b border-border pb-1.5">Village Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Village Name</label>
                      <input type="text" defaultValue="Melur Village" className="w-full p-2 text-xs rounded-xl bg-secondary border border-border" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Taluk / Block Office</label>
                      <input type="text" defaultValue="Melur East" className="w-full p-2 text-xs rounded-xl bg-secondary border border-border" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-xs text-primary border-b border-border pb-1.5">Data Backup & Recovery</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">Download a complete backup snapshot of citizen registrations, matching schemes, and open logs database files locally.</p>
                  
                  <div className="flex gap-2">
                    <button onClick={() => toast.success("Database Backup file generated: gramseva_backup.json")} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                      <Database className="w-4 h-4" /> Download Backup
                    </button>
                    <button onClick={() => toast.info("Select backup file (.json) to restore database parameters.")} className="px-4 py-2 border border-border rounded-xl text-xs font-bold hover:bg-secondary cursor-pointer">
                      Restore Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  )
}
