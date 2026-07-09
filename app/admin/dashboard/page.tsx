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
  const [noticeType, setNoticeType] = useState('Village Notice')
  const [noticeContent, setNoticeContent] = useState('')

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

      {/* ── DASHBOARD SUB-MENU ROUTING NAVIGATION ── */}
      <div className="flex overflow-x-auto gap-1 bg-secondary/80 p-1.5 rounded-2xl border border-border/80 scrollbar-none">
        <button onClick={() => navigateToTab('overview')} className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${activeTab === 'overview' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Overview</button>
        <button onClick={() => navigateToTab('citizens')} className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${activeTab === 'citizens' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Citizens</button>
        <button onClick={() => navigateToTab('schemes')} className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${activeTab === 'schemes' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Schemes</button>
        <button onClick={() => navigateToTab('certificates')} className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${activeTab === 'certificates' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Certificates</button>
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
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="glass-card p-4 border-l-4 border-l-blue-500 shadow-xs">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Total Citizens</span>
                  <p className="text-xl font-black mt-1">1,080</p>
                </div>
                <div className="glass-card p-4 border-l-4 border-l-emerald-500 shadow-xs">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Active Schemes</span>
                  <p className="text-xl font-black mt-1">92</p>
                </div>
                <div className="glass-card p-4 border-l-4 border-l-orange-500 shadow-xs">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Pending Applications</span>
                  <p className="text-xl font-black mt-1">48</p>
                </div>
                <div className="glass-card p-4 border-l-4 border-l-red-500 shadow-xs">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Open Complaints</span>
                  <p className="text-xl font-black mt-1">12</p>
                </div>
                <div className="glass-card p-4 border-l-4 border-l-purple-500 shadow-xs">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Certificates Issued</span>
                  <p className="text-xl font-black mt-1">450</p>
                </div>
              </div>

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

          {/* 4. CERTIFICATES VERIFICATION TAB */}
          {activeTab === 'certificates' && (
            <div className="space-y-4 glass-card p-6">
              <div>
                <h3 className="font-bold text-sm">Pending Citizen Document Verifications</h3>
                <p className="text-[10px] text-muted-foreground">Inspect submitted proofs, audit land titles and approve certificate issues</p>
              </div>

              <div className="space-y-3 mt-4">
                {certificates.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-6 text-center">All pending certificate applications verified.</p>
                ) : (
                  certificates.map((cert) => (
                    <div key={cert.id} className="p-4 rounded-2xl bg-secondary/40 border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-[9px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold px-2 py-0.5 rounded-full uppercase">{cert.type}</span>
                        <h4 className="font-bold text-xs">{cert.citizen}</h4>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Upload className="w-3 h-3" />
                          <span>Uploaded Document: <span className="font-mono underline text-primary">{cert.docName}</span></span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button onClick={() => handleCertificateApprove(cert.id, 'Approve')} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer">
                          <UserCheck className="w-3.5 h-3.5" /> Approve Issue
                        </button>
                        <button onClick={() => handleCertificateApprove(cert.id, 'Reject')} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer">
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 5. COMPLAINTS MANAGEMENT TAB */}
          {activeTab === 'complaints' && (
            <div className="space-y-4 glass-card p-6">
              <div>
                <h3 className="font-bold text-sm">Village Complaints Resolution Center</h3>
                <p className="text-[10px] text-muted-foreground">Audit open complaints and assign utility workers for resolutions</p>
              </div>

              <div className="space-y-3 mt-4">
                {complaints.map((cmp) => (
                  <div key={cmp.id} className="p-4 rounded-2xl bg-secondary/40 border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs">{cmp.id}</span>
                        <span className={`badge ${
                          cmp.priority === 'High' ? 'badge-status-high' : 'badge-status-medium'
                        }`}>
                          {cmp.priority} Priority
                        </span>
                      </div>
                      <h4 className="font-bold text-xs mt-0.5">{cmp.citizen} • Category: {cmp.category}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{cmp.remarks}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`badge ${
                        cmp.status === 'Resolved' ? 'badge-status-resolved' : 'badge-status-pending'
                      }`}>
                        {cmp.status}
                      </span>
                      {cmp.status !== 'Resolved' && (
                        <button onClick={() => handleComplaintResolve(cmp.id)} className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-bold cursor-pointer">
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. ANNOUNCEMENTS TAB */}
          {activeTab === 'announcements' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm">Notices & Circular Broadcast Center</h3>
                  <p className="text-[10px] text-muted-foreground">Publish water cuts, power utilities scheduling or Panchayat meetings</p>
                </div>
                <button onClick={() => setShowAddAnnounce(true)} className="px-3.5 py-1.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                  <PlusCircle className="w-4 h-4" /> Publish Notice
                </button>
              </div>

              {/* Add Announcement modal */}
              {showAddAnnounce && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                  <div className="bg-card border border-border p-6 rounded-2xl w-full max-w-md space-y-4">
                    <h3 className="font-black text-sm">Publish New Notice</h3>
                    <form onSubmit={handleAddAnnounceSubmit} className="space-y-3.5">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Notice Type</label>
                        <select value={noticeType} onChange={e => setNoticeType(e.target.value)} className="w-full p-2 text-xs rounded-xl bg-secondary border border-border">
                          <option value="Village Notice">Village Notice</option>
                          <option value="Water Supply Notice">Water Supply Notice</option>
                          <option value="Road Closure">Road Closure</option>
                          <option value="Health Camp">Health Camp</option>
                          <option value="Gram Sabha Meeting">Gram Sabha Meeting</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Content Detail</label>
                        <textarea value={noticeContent} onChange={e => setNoticeContent(e.target.value)} required rows={3} className="w-full p-2 text-xs rounded-xl bg-secondary border border-border" placeholder="Water pipelines cleaning will be conducted..." />
                      </div>
                      <div className="flex gap-2 justify-end pt-3">
                        <button type="button" onClick={() => setShowAddAnnounce(false)} className="px-4 py-2 border border-border rounded-xl text-xs font-bold hover:bg-secondary cursor-pointer">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold cursor-pointer">Broadcast Notice</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Announcements checklist mockup */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Broadcast Notices Feed</h3>
                <div className="divide-y divide-border">
                  <div className="py-3 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold">Scheduled Water supply maintenance - Ward 3</p>
                      <p className="text-[10px] text-muted-foreground">Type: Water Supply Notice • Wednesday 9AM-1PM</p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600">Active</span>
                  </div>
                  <div className="py-3 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold">Scheduled Substation maintenance - Village Area</p>
                      <p className="text-[10px] text-muted-foreground">Type: Utility Notice • Thursday 10AM-4PM</p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600">Active</span>
                  </div>
                </div>
              </div>
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
