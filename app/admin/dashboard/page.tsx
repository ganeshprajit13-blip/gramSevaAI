'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/components/providers/auth-provider'
import { useLanguage } from '@/components/providers/language-provider'
import {
  FileText, Users, Bell, PlusCircle, ChevronRight, TrendingUp,
  CheckCircle2, Shield, Settings, Calendar, Activity, ShieldAlert,
  Trash2, Edit3, Bot, Sparkles, Upload, History, SlidersHorizontal,
  Database, UserCheck, AlertTriangle, AlertCircle, RefreshCw, Eye, Search,
  LayoutDashboard, Megaphone, ClipboardList, Cog, BarChart2, Clock,
  ArrowUpRight, ArrowDownRight, Zap, Globe, Heart, Mic, MicOff, X
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend, RadialBarChart, RadialBar,
  PieChart, Pie, Cell
} from 'recharts'

import { toast } from 'sonner'
import { getStoredResidents, computeCentralMetrics } from '@/lib/resident-store'
import { getStoredAnnouncements, saveAnnouncement, deleteAnnouncement, type AnnouncementRecord } from '@/lib/announcement-store'
import { getStoredComplaints, updateComplaintStatus, type ComplaintRecord } from '@/lib/complaint-store'
import { getStoredSchemes } from '@/lib/scheme-store'

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
  { name: 'PM Kisan', beneficiaries: 680, fill: '#6366f1' },
  { name: 'PM Awas', beneficiaries: 450, fill: '#f97316' },
  { name: 'Scholarships', beneficiaries: 320, fill: '#10b981' },
  { name: 'Pensions', beneficiaries: 290, fill: '#ec4899' },
  { name: 'Skill Dev', beneficiaries: 120, fill: '#f59e0b' },
]

const PIE_COLORS = ['#6366f1', '#f97316', '#10b981', '#ec4899', '#f59e0b']

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

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'citizens', label: 'Citizens', icon: Users },
  { id: 'schemes', label: 'Schemes', icon: ClipboardList },
  { id: 'complaints', label: 'Complaints', icon: ShieldAlert },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'ai-config', label: 'AI Settings', icon: Bot },
  { id: 'audit-logs', label: 'Audit Logs', icon: History },
  { id: 'settings', label: 'Settings', icon: Cog },
]

function LiveClock() {
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')
  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      setDate(now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
    }
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="text-right">
      <p className="text-lg font-black text-white tracking-widest font-mono">{time}</p>
      <p className="text-[10px] text-blue-300 font-medium">{date}</p>
    </div>
  )
}

export default function AdminDashboard() {
  const router = useRouter()
  const { profile } = useAuth()
  const { t, language } = useLanguage()
  const searchParams = useSearchParams()

  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [adminSearchQuery, setAdminSearchQuery] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [showAiPrompts, setShowAiPrompts] = useState(false)

  // Sync activeTab whenever searchParams URL parameter changes
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    setActiveTab(tabParam || 'overview')
  }, [searchParams])

  // Voice search handler for BDO
  const toggleVoiceSearch = () => {
    if (typeof window === 'undefined') return
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.info('Voice Recognition Active...')
      setIsListening(true)
      setTimeout(() => {
        setAdminSearchQuery('PM Vishwakarma Yojana')
        setIsListening(false)
      }, 2000)
      return
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.lang = language === 'ta' ? 'ta-IN' : 'en-US'
      recognition.start()
      setIsListening(true)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setAdminSearchQuery(transcript)
        setIsListening(false)
      }
      recognition.onerror = () => setIsListening(false)
      recognition.onend = () => setIsListening(false)
    } catch {
      setIsListening(false)
    }
  }

  // Component local states simulating database
  const [citizens, setCitizens] = useState(INITIAL_CITIZENS)
  const [schemes, setSchemes] = useState(INITIAL_SCHEMES)
  const [certificates, setCertificates] = useState(INITIAL_CERTIFICATES)
  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS)
  const [audits, setAudits] = useState(INITIAL_AUDITS)

  // Live store data for Overview
  const [liveAnnouncements, setLiveAnnouncements] = useState<AnnouncementRecord[]>([])
  const [liveComplaints, setLiveComplaints] = useState<ComplaintRecord[]>([])
  const [liveResidentsCount, setLiveResidentsCount] = useState(0)
  const [liveSchemesCount, setLiveSchemesCount] = useState(0)
  const [activeCarouselSlide, setActiveCarouselSlide] = useState(0)

  // Filter search results across all BDO database tables
  const searchResults = useMemo(() => {
    if (!adminSearchQuery.trim()) return null
    const q = adminSearchQuery.toLowerCase().trim()

    const matchedResidents = citizens.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.village.toLowerCase().includes(q) ||
      c.mobile.toLowerCase().includes(q)
    ).slice(0, 4)

    const matchedSchemes = schemes.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.dept.toLowerCase().includes(q) ||
      s.eligibility.toLowerCase().includes(q)
    ).slice(0, 4)

    const matchedComplaints = complaints.filter(c =>
      c.citizen.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.status.toLowerCase().includes(q)
    ).slice(0, 4)

    const matchedAnnouncements = liveAnnouncements.filter(a =>
      a.title.toLowerCase().includes(q) ||
      (a.description && a.description.toLowerCase().includes(q)) ||
      (a.category && a.category.toLowerCase().includes(q))
    ).slice(0, 4)

    const totalCount = matchedResidents.length + matchedSchemes.length + matchedComplaints.length + matchedAnnouncements.length

    return {
      residents: matchedResidents,
      schemes: matchedSchemes,
      complaints: matchedComplaints,
      announcements: matchedAnnouncements,
      totalCount,
    }
  }, [adminSearchQuery, citizens, schemes, complaints, liveAnnouncements])

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

  // Load live store data
  const loadLiveData = () => {
    const anns = getStoredAnnouncements().filter(a => a.isActive)
    setLiveAnnouncements(anns)
    const cmps = getStoredComplaints()
    setLiveComplaints(cmps)
    const res = getStoredResidents()
    setLiveResidentsCount(res.length)
    const sc = getStoredSchemes()
    setLiveSchemesCount(sc.length)
  }

  // Sync tab state with query string on mount and URL changes
  useEffect(() => {
    setMounted(true)
    loadLiveData()
    const handleUpdate = () => loadLiveData()
    window.addEventListener('gramseva_announcements_updated', handleUpdate)
    window.addEventListener('gramseva_complaints_updated', handleUpdate)
    window.addEventListener('gramseva_resident_db_updated', handleUpdate)
    window.addEventListener('gramseva_scheme_db_updated', handleUpdate)
    if (typeof window !== 'undefined') {
      const handleTabCheck = () => {
        const params = new URLSearchParams(window.location.search)
        const tab = params.get('tab')
        if (tab) setActiveTab(tab)
      }
      handleTabCheck()
      window.addEventListener('popstate', handleTabCheck)
      return () => {
        window.removeEventListener('popstate', handleTabCheck)
        window.removeEventListener('gramseva_announcements_updated', handleUpdate)
        window.removeEventListener('gramseva_complaints_updated', handleUpdate)
        window.removeEventListener('gramseva_resident_db_updated', handleUpdate)
        window.removeEventListener('gramseva_scheme_db_updated', handleUpdate)
      }
    }
  }, [])

  // Build carousel slides from live announcements
  const carouselSlides = useMemo(() => {
    if (liveAnnouncements.length > 0) {
      return liveAnnouncements.slice(0, 5).map(a => ({
        title: a.title,
        desc: a.description,
        image: a.image_url || a.image || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
        badge: a.category || a.type?.toUpperCase() || 'NOTICE',
        date: a.date || a.startDate,
        venue: a.venue || '',
        organizer: a.organizer || 'BDO Office',
        id: a.id,
      }))
    }
    return [
      {
        title: 'BDO Administration Console Active',
        desc: 'Manage welfare applications, citizen grievances, scheme policies, and village announcements from one unified portal.',
        image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
        badge: 'BDO PORTAL',
        date: '', venue: '', organizer: 'BDO Office', id: 'default',
      }
    ]
  }, [liveAnnouncements])

  // Auto-rotate carousel
  useEffect(() => {
    if (carouselSlides.length <= 1) return
    const iv = setInterval(() => setActiveCarouselSlide(p => (p + 1) % carouselSlides.length), 5000)
    return () => clearInterval(iv)
  }, [carouselSlides.length])

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
    <div className="space-y-6 pt-2 min-h-[calc(100vh-100px)] relative">

      {/* ── BDO PORTAL SEARCH BAR ── */}
      <div className="w-full bg-gradient-to-r from-[#EAF8EF] to-[#F3FAF5] dark:bg-slate-900 border border-[#C6EDD5] dark:border-slate-700 p-4 sm:p-5 rounded-xl shadow-sm space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-4 bg-[#14532d] rounded-full" />
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#14532d] dark:text-slate-400">
            BDO Portal — Integrated Record Search
          </p>
        </div>

        <div className="max-w-5xl space-y-2">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-4 h-4 text-slate-400 pointer-events-none z-10" />
            <input
              type="text"
              value={adminSearchQuery}
              onChange={(e) => setAdminSearchQuery(e.target.value)}
              placeholder="Search residents, schemes, complaints or notices..."
              className="w-full pl-11 pr-28 py-3 text-sm rounded-lg bg-white dark:bg-slate-800 border border-[#A7DCBB] dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-[#6aad85] dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#14532d]/20 dark:focus:ring-green-700/40 focus:border-[#14532d] dark:focus:border-green-600 transition-all font-medium shadow-xs"
            />

            <div className="absolute right-2 flex items-center gap-1.5 z-10">
              {adminSearchQuery && (
                <button
                  onClick={() => setAdminSearchQuery('')}
                  className="p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={toggleVoiceSearch}
                className={`p-2 rounded border transition-all cursor-pointer ${
                  isListening
                    ? 'bg-red-600 text-white border-red-700'
                    : 'bg-white dark:bg-slate-700 text-[#14532d] dark:text-slate-300 border-[#A7DCBB] dark:border-slate-600 hover:border-[#14532d] dark:hover:border-green-500 hover:bg-[#D1F0DC]'
                }`}
                title="Voice Search"
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setShowAiPrompts(!showAiPrompts)}
                className="p-2 rounded bg-[#14532d] dark:bg-green-900 text-white border border-[#14532d] dark:border-green-700 hover:bg-[#166534] dark:hover:bg-green-800 transition-all cursor-pointer shadow-sm"
                title="Quick Filters"
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* AI QUICK FILTERS */}
          <AnimatePresence>
            {showAiPrompts && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-lg shadow-md space-y-2 text-xs"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="font-bold text-[#14532d] dark:text-green-300 flex items-center gap-1.5 uppercase tracking-[0.15em] text-[10px]">
                    <Bot className="w-3.5 h-3.5" /> Quick Filters
                  </span>
                  <button onClick={() => setShowAiPrompts(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer text-base leading-none">✕</button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    { label: 'Resident Database', query: 'Resident', tab: 'citizens' },
                    { label: 'Government Schemes', query: 'Yojana', tab: 'schemes' },
                    { label: 'Pending Grievances', query: 'Pending', tab: 'complaints' },
                    { label: 'Village Notices', query: 'Notice', tab: 'announcements' },
                    { label: 'Women & Demographics', query: 'Women', action: () => router.push('/admin/women-empowerment') },
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (item.action) {
                          item.action()
                        } else {
                          setAdminSearchQuery(item.query)
                          if (item.tab) navigateToTab(item.tab)
                        }
                        setShowAiPrompts(false)
                      }}
                      className="px-3 py-1.5 rounded border border-[#A7DCBB] dark:border-slate-600 bg-white dark:bg-slate-800 text-[#14532d] dark:text-slate-300 font-medium hover:bg-[#14532d] hover:text-white hover:border-[#14532d] transition-all cursor-pointer text-[11px]"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* LIVE SEARCH RESULTS */}
          <AnimatePresence>
            {searchResults && searchResults.totalCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-lg shadow-md space-y-3 text-xs"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                    <Search className="w-3.5 h-3.5 text-slate-500" /> Search Results — {searchResults.totalCount} records found
                  </span>
                  <button onClick={() => setAdminSearchQuery('')} className="text-slate-400 hover:text-slate-700 cursor-pointer text-[11px] font-semibold">Clear ✕</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto">
                  {/* Residents */}
                  {searchResults.residents.length > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1.5">
                      <p className="font-bold text-slate-600 dark:text-slate-400 text-[10px] uppercase tracking-wider flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> Citizens ({searchResults.residents.length})
                      </p>
                      {searchResults.residents.map(r => (
                        <div key={r.id} onClick={() => { navigateToTab('citizens'); setAdminSearchQuery('') }} className="flex justify-between items-center p-2 rounded bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 cursor-pointer transition-all">
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">{r.name}</p>
                            <p className="text-[10px] text-slate-500">{r.village} • {r.mobile}</p>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${r.status === 'Active' ? 'bg-green-50 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' : 'bg-red-50 text-red-700 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'}`}>{r.status}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Schemes */}
                  {searchResults.schemes.length > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1.5">
                      <p className="font-bold text-slate-600 dark:text-slate-400 text-[10px] uppercase tracking-wider flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" /> Schemes ({searchResults.schemes.length})
                      </p>
                      {searchResults.schemes.map(s => (
                        <div key={s.id} onClick={() => { navigateToTab('schemes'); setAdminSearchQuery('') }} className="flex justify-between items-center p-2 rounded bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 cursor-pointer transition-all">
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">{s.name}</p>
                            <p className="text-[10px] text-slate-500">{s.dept}</p>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${s.status === 'Published' ? 'bg-green-50 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'}`}>{s.status}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Complaints */}
                  {searchResults.complaints.length > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1.5">
                      <p className="font-bold text-slate-600 dark:text-slate-400 text-[10px] uppercase tracking-wider flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" /> Grievances ({searchResults.complaints.length})
                      </p>
                      {searchResults.complaints.map(c => (
                        <div key={c.id} onClick={() => { navigateToTab('complaints'); setAdminSearchQuery('') }} className="flex justify-between items-center p-2 rounded bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 cursor-pointer transition-all">
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">{c.citizen}</p>
                            <p className="text-[10px] text-slate-500">{c.category} • ID: {c.id}</p>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${c.status === 'Resolved' ? 'bg-green-50 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' : c.status === 'Pending' ? 'bg-red-50 text-red-700 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'}`}>{c.status}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Announcements */}
                  {searchResults.announcements.length > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1.5">
                      <p className="font-bold text-slate-600 dark:text-slate-400 text-[10px] uppercase tracking-wider flex items-center gap-1">
                        <Megaphone className="w-3.5 h-3.5" /> Notices ({searchResults.announcements.length})
                      </p>
                      {searchResults.announcements.map(a => (
                        <div key={a.id} onClick={() => { navigateToTab('announcements'); setAdminSearchQuery('') }} className="flex justify-between items-center p-2 rounded bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 cursor-pointer transition-all">
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">{a.title}</p>
                            <p className="text-[10px] text-slate-500 uppercase">{a.category || 'NOTICE'}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
            {searchResults && searchResults.totalCount === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-lg text-center text-xs text-slate-500"
              >
                No records matching <span className="font-semibold text-slate-800 dark:text-white">"{adminSearchQuery}"</span> found in BDO database.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── RENDERING CONDITIONAL BLOCKS BASED ON ACTIVETAB ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {/* 1. OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">

              {/* ── LIVE ANNOUNCEMENT CAROUSEL ── */}
              <section className="relative w-full overflow-hidden rounded-3xl shadow-[0_22px_65px_rgba(15,23,42,0.22)] border border-slate-200/80 dark:border-slate-800">
                <div className="relative h-[380px] sm:h-[480px] md:h-[540px] lg:h-[580px] w-full">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeCarouselSlide}
                      initial={{ opacity: 0, scale: 1.03 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.01 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${carouselSlides[activeCarouselSlide % carouselSlides.length]?.image})` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-tr from-[#070b22]/95 via-[#0c1c55]/85 to-indigo-950/75 z-10" />
                      <div className="absolute inset-0 z-20 flex flex-col justify-between p-8 sm:p-12 lg:p-16 text-white">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider shadow-sm">
                            <Zap className="w-4 h-4 text-orange-400" /> BDO Administration Console
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Live Portal • {liveAnnouncements.length} Active Notice{liveAnnouncements.length !== 1 ? 's' : ''}
                          </span>
                        </div>

                        <div className="space-y-4 max-w-5xl">
                          <div>
                            <span className="inline-block px-4 py-1.5 rounded-full bg-orange-500/30 text-orange-200 text-xs font-extrabold tracking-wider uppercase backdrop-blur-md mb-3 border border-orange-400/30">
                              {carouselSlides[activeCarouselSlide % carouselSlides.length]?.badge}
                            </span>
                            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight drop-shadow-md">
                              {carouselSlides[activeCarouselSlide % carouselSlides.length]?.title}
                            </h2>
                            <p className="text-sm sm:text-base lg:text-xl text-slate-100/90 max-w-4xl mt-3 line-clamp-3 leading-relaxed font-normal">
                              {carouselSlides[activeCarouselSlide % carouselSlides.length]?.desc}
                            </p>
                            {carouselSlides[activeCarouselSlide % carouselSlides.length]?.venue && (
                              <p className="text-xs sm:text-sm text-blue-200 mt-4 flex items-center gap-2 font-medium">
                                <Calendar className="w-4 h-4 text-orange-300" />
                                {carouselSlides[activeCarouselSlide % carouselSlides.length]?.date} • {carouselSlides[activeCarouselSlide % carouselSlides.length]?.venue}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {carouselSlides.length > 1 && (
                    <div className="absolute bottom-6 right-6 z-30 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/10 shadow-xl">
                      <button onClick={() => setActiveCarouselSlide(p => (p - 1 + carouselSlides.length) % carouselSlides.length)} className="p-2 rounded-full hover:bg-white/20 text-white transition-all cursor-pointer">
                        <ChevronRight className="w-5 h-5 rotate-180" />
                      </button>
                      <div className="flex gap-2">
                        {carouselSlides.map((_, idx) => (
                          <button key={idx} onClick={() => setActiveCarouselSlide(idx)} className={`h-2.5 rounded-full transition-all cursor-pointer ${activeCarouselSlide % carouselSlides.length === idx ? 'w-8 bg-white' : 'w-2.5 bg-white/40'}`} />
                        ))}
                      </div>
                      <button onClick={() => setActiveCarouselSlide(p => (p + 1) % carouselSlides.length)} className="p-2 rounded-full hover:bg-white/20 text-white transition-all cursor-pointer">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </section>

              {/* ── LIVE STATS BAR ── */}
              {(() => {
                const liveMetrics = computeCentralMetrics(false)
                const pendingCmps = liveComplaints.filter(c => c.status === 'Pending').length
                const stats = [
                  { label: 'Total Citizens', value: liveResidentsCount || liveMetrics.totalPopulation, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/40', border: 'border-t-blue-500', onClick: () => navigateToTab('citizens') },
                  { label: 'Active Schemes', value: liveSchemesCount, icon: FileText, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/40', border: 'border-t-orange-500', onClick: () => navigateToTab('schemes') },
                  { label: 'Pending Complaints', value: pendingCmps, icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/40', border: 'border-t-red-500', onClick: () => navigateToTab('complaints') },
                  { label: 'Active Notices', value: liveAnnouncements.length, icon: Megaphone, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/40', border: 'border-t-purple-500', onClick: () => navigateToTab('announcements') },
                ]
                return (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.map((s, idx) => (
                      <motion.button
                        key={s.label}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.07 }}
                        onClick={s.onClick}
                        className={`bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between border-t-2 ${s.border} shadow-sm hover:shadow-md hover:scale-[1.02] transition-all text-left cursor-pointer w-full`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{s.label}</span>
                          <div className={`w-7 h-7 rounded-lg ${s.bg} flex items-center justify-center`}>
                            <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                          </div>
                        </div>
                        <p className="text-2xl font-black tracking-tight">{s.value}</p>
                        <span className="text-[9px] text-muted-foreground mt-1">Click to manage →</span>
                      </motion.button>
                    ))}
                  </div>
                )
              })()}

              {/* ── BDO QUICK TASKS ── */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-orange-500" /> Quick Tasks
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {[
                    { label: 'Manage Citizens', icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:border-blue-400/30', onClick: () => navigateToTab('citizens') },
                    { label: 'Welfare Schemes', icon: FileText, color: 'text-orange-600 dark:text-orange-400', bg: 'hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:border-orange-400/30', onClick: () => navigateToTab('schemes') },
                    { label: 'Resolve Complaints', icon: ShieldAlert, color: 'text-red-600 dark:text-red-400', bg: 'hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-400/30', onClick: () => navigateToTab('complaints') },
                    { label: 'Publish Notice', icon: Bell, color: 'text-emerald-600 dark:text-emerald-400', bg: 'hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:border-emerald-400/30', onClick: () => { navigateToTab('announcements'); setTimeout(() => setShowAddAnnounce(true), 300) } },
                    { label: 'Women Portal', icon: Heart, color: 'text-pink-600 dark:text-pink-400', bg: 'hover:bg-pink-50 dark:hover:bg-pink-950/20 hover:border-pink-400/30', href: '/admin/women-empowerment' },
                    { label: 'Audit Logs', icon: History, color: 'text-purple-600 dark:text-purple-400', bg: 'hover:bg-purple-50 dark:hover:bg-purple-950/20 hover:border-purple-400/30', onClick: () => navigateToTab('audit-logs') },
                  ].map((item, idx) => {
                    const cls = `p-3 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 ${item.bg} transition-all text-center flex flex-col items-center gap-2 group cursor-pointer shadow-sm hover:shadow-md`
                    if ('href' in item && item.href) {
                      return (
                        <Link key={idx} href={item.href} className={cls}>
                          <item.icon className={`w-5 h-5 ${item.color} group-hover:scale-110 transition-transform`} />
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{item.label}</span>
                        </Link>
                      )
                    }
                    return (
                      <button key={idx} onClick={item.onClick} className={`${cls} w-full`}>
                        <item.icon className={`w-5 h-5 ${item.color} group-hover:scale-110 transition-transform`} />
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ── PENDING COMPLAINTS (Live) + ANNOUNCEMENTS GRID ── */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                {/* Pending Complaints — 3 cols */}
                <div className="lg:col-span-3 space-y-4">
                  <div className="flex items-center justify-between pb-1">
                    <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-red-500" /> Pending Grievances
                      {liveComplaints.filter(c => c.status === 'Pending').length > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                          {liveComplaints.filter(c => c.status === 'Pending').length} Action Required
                        </span>
                      )}
                    </h3>
                    <button onClick={() => navigateToTab('complaints')} className="text-xs font-bold text-primary hover:underline cursor-pointer flex items-center gap-1">
                      View All Grievances <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {liveComplaints.length === 0 ? (
                      <div className="bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-10 text-center shadow-xs">
                        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-60" />
                        <p className="text-sm text-muted-foreground font-bold">No grievances registered. All village services operational!</p>
                      </div>
                    ) : (
                      liveComplaints.slice(0, 4).map((cmp) => {
                        const statusColors: Record<string, string> = {
                          Pending: 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
                          Accepted: 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
                          'In Progress': 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800',
                          Resolved: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
                          Rejected: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800',
                        }
                        return (
                          <motion.div
                            key={cmp.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all space-y-3.5"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">{cmp.id}</span>
                                <span className="text-[10px] font-extrabold uppercase bg-primary/10 text-primary px-2.5 py-1 rounded-full">{cmp.category}</span>
                              </div>
                              <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${statusColors[cmp.status] || 'bg-secondary text-muted-foreground'}`}>
                                ● {cmp.status}
                              </span>
                            </div>

                            <div>
                              <h4 className="font-extrabold text-sm sm:text-base text-foreground leading-snug">{cmp.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">{cmp.description}</p>
                            </div>

                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-slate-100 dark:border-slate-800/80">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">👤 {cmp.resident_name} ({cmp.resident_mobile})</span>
                              <span className="font-semibold text-slate-500">📍 {cmp.village}, {cmp.ward_number}</span>
                            </div>

                            {cmp.status !== 'Resolved' && cmp.status !== 'Rejected' && (
                              <div className="flex flex-wrap gap-2 pt-2">
                                <button
                                  onClick={() => { const r = prompt('Remarks for resident:', 'BDO Officer accepted grievance. Inspection team assigned.'); if (r !== null) { updateComplaintStatus(cmp.id, 'Accepted', r); loadLiveData(); toast.success('Marked Accepted') } }}
                                  className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-blue-700 transition-all shadow-xs"
                                >Accept</button>
                                <button
                                  onClick={() => { const r = prompt('Remarks for resident:', 'Work in progress by Panchayat engineering team.'); if (r !== null) { updateComplaintStatus(cmp.id, 'In Progress', r); loadLiveData(); toast.success('Marked In Progress') } }}
                                  className="px-3 py-1.5 bg-purple-600 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-purple-700 transition-all shadow-xs"
                                >In Progress</button>
                                <button
                                  onClick={() => { const r = prompt('Remarks for resident:', 'Grievance resolved and verified on ground.'); if (r !== null) { updateComplaintStatus(cmp.id, 'Resolved', r); loadLiveData(); toast.success('Marked Resolved') } }}
                                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-emerald-700 transition-all shadow-xs"
                                >✓ Resolve</button>
                                <button
                                  onClick={() => { const r = prompt('Rejection reason:', 'Duplicate request or outside block jurisdiction.'); if (r !== null) { updateComplaintStatus(cmp.id, 'Rejected', r); loadLiveData(); toast.success('Marked Rejected') } }}
                                  className="px-3 py-1.5 bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-300 rounded-xl text-xs font-bold cursor-pointer hover:bg-red-600 hover:text-white transition-all"
                                >Reject</button>
                              </div>
                            )}
                          </motion.div>
                        )
                      })
                    )}
                    {liveComplaints.length > 4 && (
                      <button onClick={() => navigateToTab('complaints')} className="w-full py-3 text-xs font-bold border border-dashed border-border rounded-2xl hover:bg-secondary transition-all cursor-pointer flex items-center justify-center gap-1.5 text-muted-foreground">
                        <Eye className="w-4 h-4" /> View All {liveComplaints.length} Complaints in Management Desk
                      </button>
                    )}
                  </div>
                </div>

                {/* Live Announcements — 2 cols */}
                <div className="lg:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <Megaphone className="w-3.5 h-3.5 text-indigo-500" /> Live Notices
                    </h3>
                    <button onClick={() => { navigateToTab('announcements'); setTimeout(() => setShowAddAnnounce(true), 300) }} className="text-[10px] font-bold text-primary hover:underline cursor-pointer flex items-center gap-0.5">
                      + Publish <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {liveAnnouncements.length === 0 ? (
                      <div className="glass-card p-8 text-center">
                        <Bell className="w-10 h-10 text-indigo-400 mx-auto mb-2 opacity-60" />
                        <p className="text-xs text-muted-foreground font-semibold">No notices published yet.</p>
                        <button onClick={() => { navigateToTab('announcements'); setTimeout(() => setShowAddAnnounce(true), 300) }} className="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold cursor-pointer">Publish First Notice</button>
                      </div>
                    ) : (
                      liveAnnouncements.slice(0, 5).map((anc, idx) => (
                        <motion.div
                          key={anc.id}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.06 }}
                          className="bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group"
                        >
                          {anc.image_url || anc.image ? (
                            <div className="h-[90px] w-full bg-cover bg-center relative" style={{ backgroundImage: `url(${anc.image_url || anc.image})` }}>
                              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
                              <span className="absolute top-2 left-2 text-[8px] font-black uppercase bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded-full">{anc.category || anc.type}</span>
                              <span className="absolute bottom-2 right-2 text-[9px] font-bold text-white/80">{anc.date || anc.startDate}</span>
                            </div>
                          ) : null}
                          <div className="p-3 space-y-1">
                            <h4 className="font-extrabold text-xs text-foreground line-clamp-1">{anc.title}</h4>
                            <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">{anc.description}</p>
                            {anc.venue && (
                              <p className="text-[9px] text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-2.5 h-2.5" />
                                {anc.venue}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      ))
                    )}
                    {liveAnnouncements.length > 5 && (
                      <button onClick={() => navigateToTab('announcements')} className="w-full py-2.5 text-[10px] font-bold border border-dashed border-border rounded-2xl hover:bg-secondary transition-all cursor-pointer text-muted-foreground">
                        + {liveAnnouncements.length - 5} more notices
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* ── RECENT AUDIT TRAIL ── */}
              <div className="glass-card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <History className="w-4 h-4 text-amber-500" /> Recent Admin Activity
                  </h3>
                  <button onClick={() => navigateToTab('audit-logs')} className="text-[10px] font-bold text-primary hover:underline cursor-pointer">View All</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {audits.slice(0, 6).map((item, idx) => (
                    <div key={idx} className="flex gap-2.5 text-xs p-2.5 rounded-xl bg-secondary/40 hover:bg-secondary/70 transition-all">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold leading-none truncate">{item.action}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{item.module} • {item.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* 2. CITIZENS MANAGEMENT TAB */}
          {activeTab === 'citizens' && (
            <div className="space-y-4 glass-card p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-sm">Registered Citizens Management</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">View, suspend or remove citizen records from the local block</p>
                </div>
                <div className="relative w-full max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" placeholder="Filter citizens..." className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>

              <div className="overflow-x-auto mt-4">
                <table className="w-full text-xs">
                  <thead className="border-b border-border bg-secondary/50">
                    <tr>
                      <th className="p-3 text-left font-bold text-muted-foreground">Citizen ID</th>
                      <th className="p-3 text-left font-bold text-muted-foreground">Name</th>
                      <th className="p-3 text-left font-bold text-muted-foreground">Village</th>
                      <th className="p-3 text-left font-bold text-muted-foreground">Mobile</th>
                      <th className="p-3 text-left font-bold text-muted-foreground">Occupation</th>
                      <th className="p-3 text-left font-bold text-muted-foreground">Status</th>
                      <th className="p-3 text-center font-bold text-muted-foreground">Actions</th>
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
                          <button onClick={() => handleUserSuspend(citizen.id)} className="p-1.5 rounded-lg hover:bg-secondary text-primary cursor-pointer border border-border" title="Toggle Active/Suspend">
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleUserDelete(citizen.id)} className="p-1.5 rounded-lg hover:bg-secondary text-destructive cursor-pointer border border-border" title="Remove Record">
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



          {/* 3. WELFARE SCHEMES TAB — Professional Grid Layout */}
          {activeTab === 'schemes' && (
            <div className="space-y-6">
              {/* Header bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
                <div>
                  <h2 className="font-black text-xl text-foreground flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-500" /> Welfare Schemes & Benefit Catalog
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">Manage local block eligibility criteria, publish active welfare policies, and review applications</p>
                </div>
                <button
                  onClick={() => setShowAddScheme(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-2xl text-xs font-extrabold flex items-center gap-2 shadow-lg cursor-pointer hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  <PlusCircle className="w-4 h-4" /> Add New Welfare Scheme
                </button>
              </div>

              {/* Add Scheme Modal */}
              {showAddScheme && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-card border border-border p-6 sm:p-8 rounded-3xl w-full max-w-md space-y-4 shadow-2xl my-8"
                  >
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <h3 className="font-black text-base text-foreground">Add New Welfare Scheme</h3>
                      <button onClick={() => setShowAddScheme(false)} className="text-muted-foreground hover:text-foreground cursor-pointer text-lg">✕</button>
                    </div>
                    <form onSubmit={handleAddSchemeSubmit} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Scheme Name *</label>
                        <input type="text" value={newSchemeName} onChange={e => setNewSchemeName(e.target.value)} required className="w-full p-3 text-xs rounded-xl bg-secondary border border-border font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. Agricultural Fertiliser Subsidy" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Department *</label>
                        <select value={newSchemeDept} onChange={e => setNewSchemeDept(e.target.value)} className="w-full p-3 text-xs rounded-xl bg-secondary border border-border font-bold focus:outline-none">
                          <option value="Agriculture">Agriculture</option>
                          <option value="Rural Development">Rural Development</option>
                          <option value="Health">Health</option>
                          <option value="Education">Education</option>
                          <option value="Women Welfare">Women Welfare</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Eligibility Criteria *</label>
                        <input type="text" value={newSchemeElig} onChange={e => setNewSchemeElig(e.target.value)} className="w-full p-3 text-xs rounded-xl bg-secondary border border-border font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. Farmers holding < 2 Hectares" />
                      </div>
                      <div className="flex gap-2 justify-end pt-3 border-t border-border">
                        <button type="button" onClick={() => setShowAddScheme(false)} className="px-4 py-2 border border-border rounded-xl text-xs font-bold hover:bg-secondary cursor-pointer">Cancel</button>
                        <button type="submit" className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-black shadow-sm cursor-pointer hover:opacity-90">Create Scheme</button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}

              {/* Schemes Catalog Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {schemes.map((scheme, idx) => (
                  <motion.div
                    key={scheme.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white dark:bg-slate-900/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">{scheme.id}</span>
                          <span className="text-[10px] font-extrabold uppercase bg-orange-500/10 text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded-full">{scheme.dept}</span>
                        </div>
                        <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${
                          scheme.status === 'Published'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                        }`}>
                          ● {scheme.status}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-black text-base text-foreground leading-snug">{scheme.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                          Target Eligibility: <strong className="text-slate-800 dark:text-slate-200">{scheme.eligibility}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                      <button
                        onClick={() => handleSchemePublishToggle(scheme.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
                          scheme.status === 'Published'
                            ? 'bg-secondary text-muted-foreground hover:bg-slate-200 dark:hover:bg-slate-800'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                        }`}
                      >
                        {scheme.status === 'Published' ? 'Deactivate' : 'Publish Scheme'}
                      </button>
                      <Link
                        href={`/admin/schemes/${scheme.id}/edit`}
                        className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-300"
                      >
                        Edit Details →
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* 4. COMPLAINTS MANAGEMENT TAB — Professional Spaced Desk */}
          {activeTab === 'complaints' && (
            <div className="space-y-6">
              {/* Header bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
                <div>
                  <h2 className="font-black text-xl text-foreground flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-500" /> Village Grievance & Complaints Resolution Desk
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">Inspect citizen grievances, update resolution status on-ground, and issue official officer remarks</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 px-3.5 py-1.5 rounded-full">
                    Grievance Desk Active
                  </span>
                </div>
              </div>

              {/* Complaints List Cards */}
              {(() => {
                const liveComplaints = getStoredComplaints()
                return (
                  <div className="space-y-6">
                    {liveComplaints.length === 0 ? (
                      <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-16 text-center shadow-sm">
                        <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-3 opacity-60" />
                        <h3 className="text-base font-bold text-foreground">Zero Citizen Grievances</h3>
                        <p className="text-xs text-muted-foreground mt-1">No complaints pending in the village store.</p>
                      </div>
                    ) : (
                      liveComplaints.map((cmp, idx) => {
                        const statusColors: Record<string, string> = {
                          Pending: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800',
                          Accepted: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800',
                          'In Progress': 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800',
                          Resolved: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
                          Rejected: 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-300 dark:border-red-800',
                        }

                        return (
                          <motion.div
                            key={cmp.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.06 }}
                            className="bg-white dark:bg-slate-900/90 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-4"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">{cmp.id}</span>
                                <span className="text-xs font-extrabold uppercase bg-primary/10 text-primary px-3 py-1.5 rounded-full">{cmp.category}</span>
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">📍 {cmp.village} ({cmp.ward_number})</span>
                              </div>
                              <span className={`text-xs font-black uppercase px-3.5 py-1.5 rounded-full border ${statusColors[cmp.status] || 'bg-secondary text-muted-foreground'}`}>
                                ● {cmp.status}
                              </span>
                            </div>

                            <div className="space-y-2">
                              <h3 className="font-black text-base sm:text-lg text-foreground">{cmp.title}</h3>
                              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{cmp.description}</p>
                              
                              <div className="pt-2 text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                <span>👤 Resident: <strong className="text-slate-900 dark:text-white font-bold">{cmp.resident_name}</strong></span>
                                <span>•</span>
                                <span>📞 Mobile: <strong className="text-slate-900 dark:text-white font-bold">{cmp.resident_mobile}</strong></span>
                              </div>
                            </div>

                            {cmp.bdo_remarks && (
                              <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 text-xs space-y-1">
                                <span className="font-extrabold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                                  🛡️ BDO Officer Remarks:
                                </span>
                                <p className="italic text-slate-700 dark:text-slate-300 leading-relaxed">&quot;{cmp.bdo_remarks}&quot;</p>
                              </div>
                            )}

                            {/* BDO Action Buttons Bar */}
                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-2.5">
                              <span className="text-xs font-bold text-muted-foreground uppercase mr-1">Update Status:</span>
                              <button
                                onClick={() => {
                                  const remarks = prompt('Enter BDO Officer Remarks for Resident:', 'BDO Officer accepted grievance. Inspection team assigned.')
                                  if (remarks !== null) { updateComplaintStatus(cmp.id, 'Accepted', remarks); loadLiveData(); toast.success('Status updated to Accepted') }
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-extrabold cursor-pointer hover:bg-blue-700 transition-all shadow-xs"
                              >
                                Accept 🔵
                              </button>
                              <button
                                onClick={() => {
                                  const remarks = prompt('Enter BDO Officer Remarks for Resident:', 'Work in progress by Panchayat engineering team.')
                                  if (remarks !== null) { updateComplaintStatus(cmp.id, 'In Progress', remarks); loadLiveData(); toast.success('Status updated to In Progress') }
                                }}
                                className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-extrabold cursor-pointer hover:bg-purple-700 transition-all shadow-xs"
                              >
                                In Progress 🟣
                              </button>
                              <button
                                onClick={() => {
                                  const remarks = prompt('Enter BDO Officer Remarks for Resident:', 'Grievance resolved and verified on ground.')
                                  if (remarks !== null) { updateComplaintStatus(cmp.id, 'Resolved', remarks); loadLiveData(); toast.success('Status updated to Resolved') }
                                }}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-extrabold cursor-pointer hover:bg-emerald-700 transition-all shadow-xs"
                              >
                                Mark Resolved ✅
                              </button>
                              <button
                                onClick={() => {
                                  const remarks = prompt('Reason for Rejection:', 'Duplicate request or outside block jurisdiction.')
                                  if (remarks !== null) { updateComplaintStatus(cmp.id, 'Rejected', remarks); loadLiveData(); toast.success('Status updated to Rejected') }
                                }}
                                className="px-4 py-2 bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-300 rounded-xl text-xs font-extrabold cursor-pointer hover:bg-red-600 hover:text-white transition-all"
                              >
                                Reject 🔴
                              </button>
                            </div>
                          </motion.div>
                        )
                      })
                    )}
                  </div>
                )
              })()}
            </div>
          )}

          {/* 5. ANNOUNCEMENTS TAB — Full Screen */}
          {activeTab === 'announcements' && (
            <div className="space-y-0">
              {/* Full-width header bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="font-black text-xl text-foreground flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-indigo-500" /> Village Public Announcements
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Publish Gram Sabha meetings, health camps, subsidy distributions and emergency notices to all residents</p>
                </div>
                <button
                  onClick={() => setShowAddAnnounce(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl text-xs font-extrabold flex items-center gap-2 shadow-lg cursor-pointer hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  <PlusCircle className="w-4 h-4" /> Publish New Notice
                </button>
              </div>

              {/* Add Announcement Modal */}
              {showAddAnnounce && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-card border border-border p-6 rounded-3xl w-full max-w-xl space-y-4 my-8 shadow-2xl"
                  >
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
                        <input name="ann_title" required type="text" placeholder="e.g. Special Gram Sabha Budget Meeting" className="w-full p-2.5 text-xs rounded-xl bg-secondary border border-border font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Category *</label>
                          <select name="ann_cat" className="w-full p-2.5 text-xs rounded-xl bg-secondary border border-border font-bold focus:outline-none">
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
                          <input name="ann_date" required type="date" defaultValue="2026-08-05" className="w-full p-2.5 text-xs rounded-xl bg-secondary border border-border font-semibold focus:outline-none" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Start Time *</label>
                          <input name="ann_start" required defaultValue="10:00 AM" placeholder="10:00 AM" className="w-full p-2.5 text-xs rounded-xl bg-secondary border border-border font-semibold focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">End Time *</label>
                          <input name="ann_end" required defaultValue="01:00 PM" placeholder="01:00 PM" className="w-full p-2.5 text-xs rounded-xl bg-secondary border border-border font-semibold focus:outline-none" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Venue / Location *</label>
                          <input name="ann_venue" required type="text" placeholder="Gram Panchayat Community Hall" className="w-full p-2.5 text-xs rounded-xl bg-secondary border border-border font-semibold focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Target Village</label>
                          <input name="ann_village" defaultValue="All Villages" className="w-full p-2.5 text-xs rounded-xl bg-secondary border border-border font-semibold focus:outline-none" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Ward Number</label>
                          <input name="ann_ward" defaultValue="All Wards" className="w-full p-2.5 text-xs rounded-xl bg-secondary border border-border font-semibold focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Organizer / Officer</label>
                          <input name="ann_org" defaultValue="BDO Office" className="w-full p-2.5 text-xs rounded-xl bg-secondary border border-border font-semibold focus:outline-none" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground">Target Audience & Entry Restrictions *</label>
                        <input name="ann_restr" required defaultValue="Open to all adult residents (18+ yrs)." placeholder="e.g. Senior citizens 60+ yrs, Women only, Registered farmers..." className="w-full p-2.5 text-xs rounded-xl bg-secondary border border-border font-semibold focus:outline-none" />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground">Detailed Content / Agenda *</label>
                        <textarea name="ann_desc" required rows={3} placeholder="Provide agenda details, required documents to bring, scheme coverage..." className="w-full p-2.5 text-xs rounded-xl bg-secondary border border-border font-medium focus:outline-none" />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Flyer Image URL (Optional)</label>
                          <input name="ann_img" type="text" placeholder="https://..." className="w-full p-2.5 text-xs rounded-xl bg-secondary border border-border font-medium focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Contact Helpline</label>
                          <input name="ann_phone" defaultValue="1800-425-1000" className="w-full p-2.5 text-xs rounded-xl bg-secondary border border-border font-semibold focus:outline-none" />
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end pt-3 border-t border-border">
                        <button type="button" onClick={() => setShowAddAnnounce(false)} className="px-4 py-2 border border-border rounded-xl text-xs font-bold hover:bg-secondary cursor-pointer">Cancel</button>
                        <button type="submit" className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-black shadow-sm cursor-pointer hover:opacity-90">🔔 Publish & Notify All Residents</button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}

              {/* Live Announcements Grid — Full Width */}
              {(() => {
                const allAnc = getStoredAnnouncements()
                const TYPE_COLORS: Record<string, string> = {
                  'Gram Sabha': 'from-blue-500 to-indigo-600',
                  'Health Camp': 'from-emerald-500 to-teal-600',
                  'Awareness Rally': 'from-orange-500 to-amber-600',
                  'Crop Subsidy Distribution': 'from-green-600 to-lime-600',
                  'Public Works': 'from-slate-600 to-zinc-700',
                  'Emergency Alert': 'from-red-500 to-rose-600',
                  'Other': 'from-purple-500 to-violet-600',
                }
                return allAnc.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 space-y-4 border-2 border-dashed border-border rounded-3xl">
                    <Megaphone className="w-14 h-14 text-indigo-300 opacity-50" />
                    <p className="text-sm font-bold text-muted-foreground">No announcements published yet.</p>
                    <button onClick={() => setShowAddAnnounce(true)} className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl text-sm font-extrabold cursor-pointer shadow-md hover:opacity-90">Publish First Notice</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {allAnc.map((anc, idx) => {
                      const grad = TYPE_COLORS[anc.category || ''] || 'from-slate-500 to-slate-700'
                      return (
                        <motion.div
                          key={anc.id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="bg-white dark:bg-slate-900/90 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col"
                        >
                          {/* Cover image / gradient header */}
                          <div
                            className="relative h-[160px] bg-cover bg-center flex-shrink-0"
                            style={{ backgroundImage: anc.image_url || anc.image ? `url(${anc.image_url || anc.image})` : undefined }}
                          >
                            {!(anc.image_url || anc.image) && (
                              <div className={`absolute inset-0 bg-gradient-to-br ${grad}`} />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                            {/* Category badge */}
                            <span className={`absolute top-3 left-3 text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-gradient-to-r ${grad} text-white shadow-md`}>
                              {anc.category || anc.type}
                            </span>
                            {/* Status */}
                            <span className={`absolute top-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              anc.isActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-red-500/20 text-red-300 border border-red-500/40'
                            }`}>
                              {anc.isActive ? '● Live' : '○ Inactive'}
                            </span>
                            {/* Date on image */}
                            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                              <span className="text-white font-bold text-xs">{anc.date || anc.startDate}</span>
                              {anc.start_time && <span className="text-white/70 text-[10px]">{anc.start_time}{anc.end_time ? ` – ${anc.end_time}` : ''}</span>}
                            </div>
                          </div>

                          {/* Card body */}
                          <div className="p-4 flex-1 flex flex-col gap-3">
                            <div>
                              <h3 className="font-extrabold text-sm text-foreground leading-snug line-clamp-2">{anc.title}</h3>
                              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed line-clamp-3">{anc.description}</p>
                            </div>

                            {/* Info pills */}
                            <div className="space-y-1.5">
                              {anc.venue && (
                                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                  <Calendar className="w-3 h-3 flex-shrink-0 text-indigo-400" />
                                  <span className="font-semibold truncate">{anc.venue}</span>
                                </div>
                              )}
                              {anc.village && (
                                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                  <Users className="w-3 h-3 flex-shrink-0 text-blue-400" />
                                  <span className="font-semibold">{anc.village}{anc.ward_number ? ` • ${anc.ward_number}` : ''}</span>
                                </div>
                              )}
                              {anc.eligibility_restrictions && (
                                <div className="flex items-start gap-1.5 text-[11px]">
                                  <ShieldAlert className="w-3 h-3 flex-shrink-0 text-amber-400 mt-0.5" />
                                  <span className="text-amber-600 dark:text-amber-400 font-semibold line-clamp-1">{anc.eligibility_restrictions}</span>
                                </div>
                              )}
                              {anc.contact_number && (
                                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                  <Activity className="w-3 h-3 flex-shrink-0 text-emerald-400" />
                                  <span className="font-semibold">{anc.contact_number}</span>
                                  {anc.organizer && <span className="text-muted-foreground">• {anc.organizer}</span>}
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="mt-auto pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                              <span className="font-mono text-[9px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">{anc.id}</span>
                              <button
                                onClick={() => { deleteAnnouncement(anc.id); loadLiveData(); toast.success('Announcement deleted.') }}
                                className="px-3 py-1.5 bg-red-50 dark:bg-red-950/30 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-900/40 hover:bg-red-600 hover:text-white rounded-xl text-[10px] font-bold transition-all cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
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
                    <select value={aiProvider} onChange={e => setAiProvider(e.target.value)} className="w-full p-2.5 text-xs rounded-xl bg-secondary border border-border font-semibold focus:outline-none">
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
                    <textarea value={aiPromptTemplate} onChange={e => setAiPromptTemplate(e.target.value)} rows={4} className="w-full p-2.5 text-xs rounded-xl bg-secondary border border-border leading-relaxed font-mono focus:outline-none" />
                  </div>

                  <button onClick={handleSaveAiConfig} className="px-5 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl cursor-pointer hover:opacity-90 transition-opacity">
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
                      <th className="p-3 text-left font-bold text-muted-foreground">Action Event</th>
                      <th className="p-3 text-left font-bold text-muted-foreground">Administrator</th>
                      <th className="p-3 text-left font-bold text-muted-foreground">Target Module</th>
                      <th className="p-3 text-left font-bold text-muted-foreground">Log Timestamp</th>
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
                      <input type="text" defaultValue="Melur Village" className="w-full p-2 text-xs rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Taluk / Block Office</label>
                      <input type="text" defaultValue="Melur East" className="w-full p-2 text-xs rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-xs text-primary border-b border-border pb-1.5">Data Backup & Recovery</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">Download a complete backup snapshot of citizen registrations, matching schemes, and open logs database files locally.</p>

                  <div className="flex gap-2">
                    <button onClick={() => toast.success("Database Backup file generated: gramseva_backup.json")} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors">
                      <Database className="w-4 h-4" /> Download Backup
                    </button>
                    <button onClick={() => toast.info("Select backup file (.json) to restore database parameters.")} className="px-4 py-2 border border-border rounded-xl text-xs font-bold hover:bg-secondary cursor-pointer transition-colors">
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
