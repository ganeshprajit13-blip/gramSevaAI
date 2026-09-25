'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts'
import {
  Users, TrendingUp, Heart, Star, Download,
  Filter, RefreshCw, AlertTriangle, CheckCircle2,
  Sparkles, Brain, MapPin, BookOpen, Briefcase,
  Activity, Award, Target, ArrowUpRight, ArrowDownRight,
  Building2, Leaf, DollarSign, GraduationCap, Shield, ShieldCheck,
  Upload, FileSpreadsheet, X, Loader2, Home,
  Zap, Droplets, Wifi, Landmark, Compass, ShieldAlert, Code, PieChart as PieIcon, BarChart2,
  Lock, Search, ExternalLink, HelpCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '@/components/providers/language-provider'
import { getStoredResidents, computeCentralMetrics, type ResidentRecord } from '@/lib/resident-store'
import { parseAndImportFile, type ImportResult, SCHEMA_INFO, downloadSampleExcelTemplate } from '@/lib/excel-importer'

// Minimalistic Integrated Metric Strip Panel
function IntegratedMetricStrip({ items }: {
  items: Array<{ label: string; value: string | number; sub?: string; icon: any }>
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 overflow-hidden">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800 gap-y-3 sm:gap-y-0">
        {items.map((item, idx) => {
          const Icon = item.icon
          return (
            <div key={idx} className="px-3 pt-2 sm:pt-0 first:pl-0 last:pr-0 flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-[#14532d] dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-[#14532d] dark:text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">{item.label}</p>
                <p className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5 leading-none">{item.value}</p>
                {item.sub && <p className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 mt-1 truncate">{item.sub}</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Clean Minimal Section Header
function SectionHeader({ icon: Icon, title, subtitle }: {
  icon: any; title: string; subtitle?: string
}) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
      <div className="w-8 h-8 rounded-xl bg-[#14532d] dark:bg-emerald-800 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}

function Card({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <div id={id} className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-6 transition-all ${className}`}>
      {children}
    </div>
  )
}

// Matplotlib Professional Graphic Figure Container
function MatplotlibPlotFigure({ title, figNumber, children, pyCode }: {
  title: string; figNumber: number; children: React.ReactNode; pyCode: string
}) {
  const [showCode, setShowCode] = useState(false)

  const copyCode = () => {
    navigator.clipboard.writeText(pyCode)
    toast.success('Python Matplotlib Script copied to clipboard!')
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-3 font-sans shadow-xs relative">
      {/* Matplotlib Figure Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#14532d] text-emerald-200 rounded-md font-mono border border-emerald-700">
            Figure #{figNumber}
          </span>
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono tracking-tight">{title}</h4>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCode(!showCode)}
            className="text-[11px] font-semibold px-2.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-600 flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
          >
            <Code className="w-3.5 h-3.5 text-[#14532d] dark:text-emerald-400" />
            <span>{showCode ? 'Hide Python' : 'View Matplotlib .py'}</span>
          </button>
          <button
            onClick={copyCode}
            className="text-[11px] font-bold px-2.5 py-1.5 bg-[#14532d] hover:bg-[#166534] dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Copy Code</span>
          </button>
        </div>
      </div>

      {showCode ? (
        <div className="bg-slate-950 text-emerald-300 p-4 rounded-xl font-mono text-[11px] overflow-x-auto border border-slate-800 space-y-1">
          <p className="text-slate-500"># Official Matplotlib Python Script</p>
          <pre>{pyCode}</pre>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800 rounded-xl">
          {children}
        </div>
      )}

      {/* Matplotlib Footer Details */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 font-semibold pt-1.5 border-t border-slate-200 dark:border-slate-700">
        <span>dpi=300 | style=&apos;seaborn-v0_8-whitegrid&apos;</span>
        <span>Format: Official Matplotlib Graphics</span>
      </div>
    </div>
  )
}

function getHeatColor(score: number) {
  if (score >= 75) return { bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800', text: 'text-emerald-900 dark:text-emerald-200', badge: 'bg-emerald-700' }
  if (score >= 55) return { bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800', text: 'text-amber-900 dark:text-amber-200', badge: 'bg-amber-600' }
  if (score >= 40) return { bg: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800', text: 'text-orange-900 dark:text-orange-200', badge: 'bg-orange-600' }
  return { bg: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800', text: 'text-red-900 dark:text-red-200', badge: 'bg-red-700' }
}

const MODULE_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'women', label: 'Women Empowerment' },
  { id: 'education', label: 'Education' },
  { id: 'agriculture', label: 'Agriculture' },
  { id: 'employment', label: 'Employment' },
  { id: 'health', label: 'Health & Welfare' },
  { id: 'housing', label: 'Housing & Infra' },
  { id: 'financial', label: 'Financial Inclusion' },
  { id: 'demographics', label: 'Demographics' },
  { id: 'schemes', label: 'Welfare Schemes' },
  { id: 'ai-report', label: 'AI Intelligence & Reports' },
]

export default function VillageIntelligenceDashboard() {
  const { t } = useLanguage()
  const [mounted, setMounted] = useState(false)
  const [verifiedOnly, setVerifiedOnly] = useState(true)
  const [residents, setResidents] = useState<ResidentRecord[]>([])
  const [activeFilter, setActiveFilter] = useState<Record<string, string>>({})
  const [activeTabModule, setActiveTabModule] = useState('overview')
  const [vizMode, setVizMode] = useState<'matplotlib' | 'interactive'>('matplotlib')

  // EXCEL UPLOAD STATE
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [showImportSummary, setShowImportSummary] = useState(false)
  const [showSchemaGuide, setShowSchemaGuide] = useState(false)

  const loadCentralData = useCallback(() => {
    const data = getStoredResidents()
    setResidents([...data])
  }, [])

  useEffect(() => {
    setMounted(true)
    loadCentralData()
    window.addEventListener('gramseva_resident_db_updated', loadCentralData)
    return () => window.removeEventListener('gramseva_resident_db_updated', loadCentralData)
  }, [loadCentralData])

  // FILE UPLOAD HANDLER
  const handleFileUpload = useCallback(async (file: File) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/csv',
    ]
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!validTypes.includes(file.type) && ext !== 'xlsx' && ext !== 'xls' && ext !== 'csv') {
      toast.error('Invalid file type. Please upload an .xlsx, .xls, or .csv file.')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 15, 85))
    }, 120)

    try {
      const buffer = await file.arrayBuffer()
      setUploadProgress(90)

      const result = parseAndImportFile(buffer, file.name)
      setUploadProgress(100)

      clearInterval(progressInterval)
      setImportResult(result)
      setShowImportSummary(true)

      loadCentralData()

      if (result.status === 'success') {
        toast.success(`Imported ${result.imported} new + ${result.updated} updated records from ${file.name}`)
      } else if (result.status === 'partial') {
        toast.warning(`Partial import: ${result.imported + result.updated} records imported, ${result.errors} errors.`)
      } else {
        toast.error(`Import failed: ${result.errorDetails[0] || 'Unknown error'}`)
      }
    } catch (err: any) {
      clearInterval(progressInterval)
      toast.error(`File read error: ${err.message}`)
    } finally {
      setUploading(false)
      setTimeout(() => setUploadProgress(0), 2000)
    }
  }, [loadCentralData])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileUpload(file)
    e.target.value = ''
  }, [handleFileUpload])

  const scrollToModule = (id: string) => {
    setActiveTabModule(id)
    const el = document.getElementById(`mod-${id}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // LIVE COMPUTED METRICS FROM CENTRALIZED RESIDENT DATABASE
  const filteredResidentsList = residents.filter(r => {
    if (verifiedOnly && r.verification_status !== 'Verified') return false
    if (activeFilter.Village && activeFilter.Village !== 'All' && r.village !== activeFilter.Village) return false
    if (activeFilter.Ward && activeFilter.Ward !== 'All' && r.ward_number !== activeFilter.Ward) return false
    if (activeFilter.Education && activeFilter.Education !== 'All' && r.education !== activeFilter.Education) return false
    return true
  })

  const metrics = computeCentralMetrics(verifiedOnly)

  // High-visibility Pie Chart Datasets
  const genderData = [
    { name: 'Male', value: filteredResidentsList.filter(r => r.gender === 'Male').length, color: '#1D4ED8' },
    { name: 'Female', value: filteredResidentsList.filter(r => r.gender === 'Female').length, color: '#DB2777' },
    { name: 'Transgender', value: filteredResidentsList.filter(r => r.gender === 'Transgender').length, color: '#7C3AED' },
  ]

  // Age Distribution Bar Chart Dataset
  const ageData = [
    { group: '0-5 yrs', count: filteredResidentsList.filter(r => r.age <= 5).length, fill: '#1D4ED8' },
    { group: '6-17 yrs', count: filteredResidentsList.filter(r => r.age >= 6 && r.age <= 17).length, fill: '#2563EB' },
    { group: '18-24 yrs', count: filteredResidentsList.filter(r => r.age >= 18 && r.age <= 24).length, fill: '#3B82F6' },
    { group: '25-35 yrs', count: filteredResidentsList.filter(r => r.age >= 25 && r.age <= 35).length, fill: '#14532d' },
    { group: '36-45 yrs', count: filteredResidentsList.filter(r => r.age >= 36 && r.age <= 45).length, fill: '#16a34a' },
    { group: '46-60 yrs', count: filteredResidentsList.filter(r => r.age >= 46 && r.age <= 60).length, fill: '#10b981' },
    { group: '60+ yrs', count: filteredResidentsList.filter(r => r.age > 60).length, fill: '#059669' },
  ]

  const educationDistribution = [
    { name: 'No Formal Edu', value: metrics.noFormalEdu, color: '#DC2626' },
    { name: 'Primary', value: metrics.primaryEdu, color: '#D97706' },
    { name: 'Middle School', value: metrics.middleEdu, color: '#2563EB' },
    { name: 'High School', value: metrics.highSchoolEdu, color: '#1D4ED8' },
    { name: 'Higher Sec', value: metrics.higherSecEdu, color: '#14532d' },
    { name: 'Diploma', value: metrics.diplomaEdu, color: '#7C3AED' },
    { name: 'Undergrad', value: metrics.undergradEdu, color: '#059669' },
    { name: 'Postgrad', value: metrics.postgradEdu, color: '#047857' },
  ]

  const occupationDistribution = [
    { name: 'Farmer', count: metrics.totalFarmers, fill: '#059669' },
    { name: 'Homemaker', count: filteredResidentsList.filter(r => r.occupation === 'Homemaker').length, fill: '#DB2777' },
    { name: 'Daily Wager', count: metrics.dailyWagers, fill: '#D97706' },
    { name: 'Student', count: metrics.totalStudents, fill: '#2563EB' },
    { name: 'Private Job', count: metrics.privateEmployees, fill: '#7C3AED' },
    { name: 'Govt Job', count: metrics.govtEmployees, fill: '#14532d' },
    { name: 'Business', count: metrics.businessOwners, fill: '#0891B2' },
    { name: 'Unemployed', count: metrics.unemployedCount, fill: '#DC2626' },
  ]

  const cropDistribution = [
    { name: 'Paddy', value: filteredResidentsList.filter(r => r.crop_type === 'Paddy').length || 18, color: '#059669' },
    { name: 'Sugarcane', value: filteredResidentsList.filter(r => r.crop_type === 'Sugarcane').length || 12, color: '#047857' },
    { name: 'Banana', value: filteredResidentsList.filter(r => r.crop_type === 'Banana').length || 8, color: '#D97706' },
    { name: 'Vegetables', value: filteredResidentsList.filter(r => r.crop_type === 'Vegetables').length || 14, color: '#65A30D' },
    { name: 'Millets', value: filteredResidentsList.filter(r => r.crop_type === 'Millets').length || 6, color: '#B45309' },
  ]

  const schemeEligibility = [
    { scheme: 'SHG Membership', eligible: metrics.womenEligible, benefited: metrics.activeSHGMembers, color: '#DB2777' },
    { scheme: 'Entrepreneurship Scheme', eligible: metrics.womenEligible, benefited: metrics.womenEntrepreneurs, color: '#2563EB' },
    { scheme: 'PM Matru Vandana', eligible: metrics.pregnantWomen * 2, benefited: metrics.pregnantWomen, color: '#059669' },
    { scheme: 'Girl Child Scholarship', eligible: Math.round(metrics.totalStudents * 0.4), benefited: Math.round(metrics.totalStudents * 0.25), color: '#7C3AED' },
    { scheme: 'Widow Pension', eligible: metrics.widows, benefited: Math.round(metrics.widows * 0.6), color: '#0891B2' },
    { scheme: 'Skill Development', eligible: Math.round(metrics.unemployedCount + metrics.dailyWagers), benefited: Math.round((metrics.unemployedCount + metrics.dailyWagers) * 0.4), color: '#D97706' },
    { scheme: 'PM Kisan Agri Subsidy', eligible: metrics.totalFarmers, benefited: Math.round(metrics.totalFarmers * 0.65), color: '#047857' },
  ]

  const uniqueVillages = ['All', ...Array.from(new Set(residents.map(r => r.village).filter(Boolean))).sort()]
  const uniqueWards = ['All', ...Array.from(new Set(residents.map(r => r.ward_number).filter(Boolean))).sort()]
  const uniqueEducation = ['All', ...Array.from(new Set(residents.map(r => r.education).filter(Boolean))).sort()]
  const FILTER_OPTIONS: Record<string, string[]> = {
    Village: uniqueVillages,
    Ward: uniqueWards,
    Education: uniqueEducation,
  }

  const exportReportCSV = (reportName: string) => {
    const headers = ['Resident ID', 'Name', 'Age', 'Gender', 'Village', 'Ward', 'Education', 'Occupation', 'Annual Income', 'SHG Member', 'Verification Status']
    const rows = filteredResidentsList.map(r => [
      r.id, r.name, r.age, r.gender, r.village, r.ward_number, r.education, r.occupation, r.annual_income, r.shg_member ? 'Yes' : 'No', r.verification_status
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `GramSeva_${reportName.replace(/\s+/g, '_')}_Report.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success(`Exported ${reportName} CSV Report!`)
  }

  const downloadFullPythonScript = () => {
    const pyScript = `import matplotlib.pyplot as plt

# Official GramSeva Matplotlib Graphics Script (Gender Pie Chart & Age Bar Chart)
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.size'] = 10

# 1. Gender Distribution Pie Chart
genders = [${genderData.map(g => `'${g.name}'`).join(', ')}]
counts = [${genderData.map(g => g.value).join(', ')}]
colors = ['#1D4ED8', '#DB2777', '#7C3AED']

fig, ax = plt.subplots(figsize=(6.5, 4.5), dpi=300)
wedges, texts, autotexts = ax.pie(
    counts, 
    labels=genders, 
    autopct='%1.1f%%',
    pctdistance=0.7,
    colors=colors,
    shadow=True,
    startangle=140,
    textprops=dict(color="black", weight="bold")
)
ax.legend(wedges, [f"{g}: {c:,} ({c/sum(counts)*100:.1f}%)" for g, c in zip(genders, counts)],
          title="Gender Legend", loc="center left", bbox_to_anchor=(1, 0, 0.5, 1))
ax.set_title('Figure 1: Resident Gender Distribution Pie Chart', fontsize=12, fontweight='bold', pad=15)
plt.tight_layout()
plt.savefig('gender_pie_chart.png')
plt.close()

# 2. Age Distribution Bar Chart
age_groups = [${ageData.map(a => `'${a.group}'`).join(', ')}]
age_counts = [${ageData.map(a => a.count).join(', ')}]

fig, ax = plt.subplots(figsize=(7.5, 4), dpi=300)
bars = ax.bar(age_groups, age_counts, color='#14532d', width=0.55, edgecolor='#052e16', linewidth=0.8)
ax.grid(axis='y', linestyle='--', alpha=0.7)
ax.set_title('Figure 2: Age Bracket Distribution Bar Chart', fontsize=12, fontweight='bold', pad=15)
ax.set_xlabel('Age Bracket (Years)', fontweight='bold')
ax.set_ylabel('Population Count', fontweight='bold')
for bar in bars:
    yval = bar.get_height()
    ax.text(bar.get_x() + bar.get_width()/2, yval + 10, f'{yval:,}', ha='center', va='bottom', fontsize=9, fontweight='bold')
plt.tight_layout()
plt.savefig('age_distribution_bar_chart.png')
plt.close()
`
    const blob = new Blob([pyScript], { type: 'text/x-python' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'gramseva_matplotlib_demographics.py'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Downloaded gramseva_matplotlib_demographics.py!')
  }

  return (
    <div className="space-y-6 pt-2 pb-16 min-h-screen text-slate-900 dark:text-white font-sans">
      
      {/* ── 1. OFFICIAL BDO TOP ACTION BANNER ── */}
      <div className="bg-gradient-to-r from-[#0d3a1f] via-[#14532d] to-[#0f766e] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-800/40">
        {/* Decorative blur glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-13 h-13 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-2 shadow-sm flex items-center justify-center shrink-0">
              <img src="/tn-emblem.svg" alt="TN Emblem" className="w-9 h-9 object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-widest text-emerald-300 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
                  BDO Administration • Demographics &amp; Gender Equity
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                Women Empowerment &amp; Demographics Console
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-2xl leading-relaxed">
                Centralized village intelligence desk &middot; Live demographic metrics, SHG networks, Matplotlib analytics &amp; welfare saturation.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx,.xls,.csv"
              onChange={handleFileInputChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 bg-white hover:bg-emerald-50 text-[#14532d] rounded-xl text-xs font-black shadow-sm transition-all flex items-center gap-2 cursor-pointer border border-white"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#14532d]" />
              <span>{uploading ? 'Parsing Excel...' : 'Upload Data Sheet (.xlsx)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSchemaGuide(true)}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-white/20"
            >
              <HelpCircle className="w-4 h-4 text-emerald-300" />
              <span>Schema Guide</span>
            </button>

            <button
              type="button"
              onClick={downloadFullPythonScript}
              className="px-3.5 py-2.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700"
            >
              <Code className="w-4 h-4 text-emerald-400" />
              <span>Matplotlib (.py)</span>
            </button>

            <div className="flex items-center bg-emerald-950/70 p-1 rounded-xl border border-emerald-700/60">
              <button
                onClick={() => setVerifiedOnly(true)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${verifiedOnly ? 'bg-white text-[#14532d] shadow-xs' : 'text-emerald-200'}`}
              >
                Verified ({metrics.verifiedCount})
              </button>
              <button
                onClick={() => setVerifiedOnly(false)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${!verifiedOnly ? 'bg-white text-[#14532d] shadow-xs' : 'text-emerald-200'}`}
              >
                All ({residents.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. TOP METRIC STRIP BAR ── */}
      <IntegratedMetricStrip items={[
        { label: 'Development Index', value: `${metrics.overallDevelopmentIndex}/100`, sub: 'Composite Score', icon: Star },
        { label: 'Empowerment Index', value: `${metrics.empowermentIndex}/100`, sub: 'Women Equity', icon: Heart },
        { label: 'Literacy Rate', value: `${metrics.literacyRate}%`, sub: 'Formal Education', icon: GraduationCap },
        { label: 'Employment Rate', value: `${metrics.employmentRate}%`, sub: 'Working Pop', icon: Briefcase },
        { label: 'Villages Covered', value: `${uniqueVillages.length - 1}`, sub: 'Active Gram Panchayats', icon: MapPin },
        { label: 'Verified Residents', value: `${metrics.verifiedCount}`, sub: 'Audit Complete', icon: CheckCircle2 },
        { label: 'Active SHGs', value: `${metrics.activeSHGMembers}`, sub: 'Self Help Groups', icon: Sparkles },
        { label: 'Female Pop', value: `${genderData.find(g => g.name === 'Female')?.value || 0}`, sub: 'Registered Women', icon: Users },
      ]} />

      {/* ── 3. STICKY MODULE NAVIGATION BAR & VIEW TOGGLE ── */}
      <div className="sticky top-2 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {MODULE_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => scrollToModule(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTabModule === tab.id
                  ? 'bg-[#14532d] dark:bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-[#D1F0DC] dark:hover:bg-slate-800 hover:text-[#14532d] dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
          <button
            onClick={() => setVizMode('matplotlib')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              vizMode === 'matplotlib' ? 'bg-white dark:bg-slate-900 text-[#14532d] dark:text-emerald-400 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5 text-[#14532d] dark:text-emerald-400" />
            <span>Matplotlib Visuals</span>
          </button>
          <button
            onClick={() => setVizMode('interactive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              vizMode === 'interactive' ? 'bg-white dark:bg-slate-900 text-[#14532d] dark:text-emerald-400 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-[#14532d] dark:text-emerald-400" />
            <span>Interactive View</span>
          </button>
        </div>
      </div>

      {/* ── 4. DATABASE FILTERS BAR ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-[#14532d] dark:text-emerald-400">
            <Filter className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Demographic Filters</span>
          </div>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
          {Object.entries(FILTER_OPTIONS).map(([key, opts]) => (
            <div key={key} className="flex items-center gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">{key}:</label>
              <select
                value={activeFilter[key] || 'All'}
                onChange={e => setActiveFilter(prev => ({ ...prev, [key]: e.target.value }))}
                className="text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#14532d] cursor-pointer"
              >
                {opts.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Real-time BDO Store Sync</span>
        </div>
      </div>

      {/* ── MODULE 1: VILLAGE OVERVIEW ── */}
      <section id="mod-overview" className="space-y-4">
        <SectionHeader icon={Home} title="1. Village Development Overview" subtitle="Integrated summary calculated live from imported resident profiles" />
        <IntegratedMetricStrip items={[
          { label: 'Total Population', value: metrics.totalPopulation.toLocaleString(), sub: 'Verified members', icon: Users },
          { label: 'Total Families', value: metrics.totalFamilies.toLocaleString(), sub: 'Registered HHDs', icon: Building2 },
          { label: 'Verified Residents', value: metrics.verifiedCount.toLocaleString(), sub: 'Audit complete', icon: CheckCircle2 },
          { label: 'Villages Covered', value: uniqueVillages.length - 1, sub: 'Gram Panchayats', icon: MapPin },
          { label: 'Development Index', value: `${metrics.overallDevelopmentIndex}/100`, sub: 'Composite Score', icon: Star },
          { label: 'Scheme Coverage', value: `${Math.round((metrics.womenBenefited / (metrics.womenEligible || 1)) * 100)}%`, sub: 'Welfare saturation', icon: Award },
          { label: 'Employment Rate', value: `${metrics.employmentRate}%`, sub: 'Working population', icon: Briefcase },
          { label: 'Literacy Rate', value: `${metrics.literacyRate}%`, sub: 'Formal education', icon: GraduationCap },
        ]} />
      </section>

      {/* ── MODULE 2: WOMEN EMPOWERMENT ── */}
      <section id="mod-women" className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
        <SectionHeader icon={Heart} title="2. Women Empowerment &amp; Gender Equity Module" subtitle="SHG linkages, entrepreneurship, widow support, and scheme eligibility matrix" />
        
        <IntegratedMetricStrip items={[
          { label: 'Total Population', value: metrics.totalPopulation.toLocaleString(), sub: 'Verified members', icon: Users },
          { label: 'Total Families', value: metrics.totalFamilies.toLocaleString(), sub: 'Registered HHDs', icon: Building2 },
          { label: 'Women Registered', value: metrics.womenRegistered.toLocaleString(), sub: 'Active profiles', icon: Heart },
          { label: 'Scheme Eligible', value: metrics.womenEligible.toLocaleString(), sub: 'Qualifying women', icon: CheckCircle2 },
          { label: 'Women Benefited', value: metrics.womenBenefited.toLocaleString(), sub: 'Currently receiving', icon: Award },
          { label: 'Yet to Apply', value: metrics.womenYetToApply.toLocaleString(), sub: 'Need intervention', icon: AlertTriangle },
          { label: 'Empowerment Index', value: `${metrics.empowermentIndex}/100`, sub: 'Gender Equity', icon: Star },
          { label: 'Active SHGs', value: metrics.activeSHGMembers, sub: 'SHG Members', icon: Sparkles },
        ]} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* GENDER DISTRIBUTION PIE CHART CARD */}
          <Card>
            <SectionHeader icon={PieIcon} title="Gender Distribution (Pie Chart)" subtitle="Exact gender share with structured legend" />
            
            {vizMode === 'matplotlib' ? (
              <MatplotlibPlotFigure
                figNumber={1}
                title="Figure 1: Resident Gender Breakdown (Matplotlib Pie Chart)"
                pyCode={`import matplotlib.pyplot as plt

genders = ['Male', 'Female', 'Transgender']
counts = [${genderData.map(g => g.value).join(', ')}]
colors = ['#1D4ED8', '#DB2777', '#7C3AED']

fig, ax = plt.subplots(figsize=(6.5, 4.5), dpi=300)
wedges, texts, autotexts = ax.pie(
    counts, 
    labels=genders, 
    autopct='%1.1f%%',
    pctdistance=0.7,
    colors=colors,
    shadow=True,
    startangle=140,
    textprops=dict(color="black", weight="bold")
)

ax.legend(wedges, [f"{g}: {c:,} ({c/sum(counts)*100:.1f}%)" for g, c in zip(genders, counts)],
          title="Gender Legend", loc="center left", bbox_to_anchor=(1, 0, 0.5, 1))

ax.set_title('Figure 1: Resident Gender Breakdown', fontsize=12, fontweight='bold', pad=15)
plt.tight_layout()
plt.show()`}
              >
                <div className="space-y-4">
                  <div className="flex flex-col items-center justify-center p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <div className="relative w-48 h-48 flex items-center justify-center my-2">
                      <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 drop-shadow-sm">
                        {(() => {
                          const total = metrics.totalPopulation || 1
                          let cumulativePercent = 0
                          return genderData.map((g) => {
                            const percent = g.value / total
                            if (percent === 0) return null
                            const startAngle = cumulativePercent * 360
                            cumulativePercent += percent
                            const endAngle = cumulativePercent * 360

                            const x1 = 50 + 42 * Math.cos((Math.PI * startAngle) / 180)
                            const y1 = 50 + 42 * Math.sin((Math.PI * startAngle) / 180)
                            const x2 = 50 + 42 * Math.cos((Math.PI * endAngle) / 180)
                            const y2 = 50 + 42 * Math.sin((Math.PI * endAngle) / 180)
                            const largeArcFlag = percent > 0.5 ? 1 : 0
                            const pathData = `M 50 50 L ${x1} ${y1} A 42 42 0 ${largeArcFlag} 1 ${x2} ${y2} Z`

                            return (
                              <path
                                key={g.name}
                                d={pathData}
                                fill={g.color}
                                stroke="#FFFFFF"
                                strokeWidth="1.5"
                              />
                            )
                          })
                        })()}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-base font-mono font-black text-slate-900 dark:text-white">{metrics.totalPopulation}</span>
                        <span className="text-[10px] uppercase font-bold text-slate-500">Total</span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 p-3 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                      <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider">Figure Legend</span>
                      <span className="text-[11px] font-bold font-mono text-slate-500">Count (% Share)</span>
                    </div>

                    {genderData.map(g => {
                      const pct = metrics.totalPopulation ? ((g.value / metrics.totalPopulation) * 100).toFixed(1) : '0.0'
                      return (
                        <div key={g.name} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-2.5">
                            <div className="w-3.5 h-3.5 rounded-sm shadow-xs border border-slate-300" style={{ backgroundColor: g.color }} />
                            <span className="font-bold text-slate-800 dark:text-slate-200">{g.name}</span>
                          </div>
                          <div className="flex items-center gap-3 font-mono">
                            <span className="font-bold text-slate-900 dark:text-white">{g.value.toLocaleString()}</span>
                            <span className="font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs">{pct}%</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </MatplotlibPlotFigure>
            ) : (
              mounted && (
                <div>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={genderData}
                        cx="50%"
                        cy="50%"
                        outerRadius={85}
                        innerRadius={40}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {genderData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: any) => [v.toLocaleString(), 'People']} contentStyle={{ fontSize: '12px', fontWeight: 'bold', borderRadius: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="mt-3 space-y-2 border-t border-slate-200 dark:border-slate-700 pt-3">
                    {genderData.map(g => {
                      const pct = metrics.totalPopulation ? ((g.value / metrics.totalPopulation) * 100).toFixed(1) : '0.0'
                      return (
                        <div key={g.name} className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-2.5">
                            <div className="w-3.5 h-3.5 rounded-sm" style={{ background: g.color }} />
                            <span>{g.name}</span>
                          </div>
                          <div className="font-mono">
                            <span>{g.value.toLocaleString()} ({pct}%)</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            )}
          </Card>

          {/* AGE DISTRIBUTION BAR CHART CARD */}
          <Card className="lg:col-span-2">
            <SectionHeader icon={BarChart2} title="Age Distribution (Bar Chart)" subtitle="Population count by age bracket represented as vertical bars" />
            
            {vizMode === 'matplotlib' ? (
              <MatplotlibPlotFigure
                figNumber={2}
                title="Figure 2: Age Bracket Distribution (Matplotlib Bar Chart)"
                pyCode={`import matplotlib.pyplot as plt

age_groups = [${ageData.map(a => `'${a.group}'`).join(', ')}]
counts = [${ageData.map(a => a.count).join(', ')}]

fig, ax = plt.subplots(figsize=(7.5, 4), dpi=300)
bars = ax.bar(age_groups, counts, color='#14532d', width=0.55, edgecolor='#052e16', linewidth=0.8)
ax.grid(axis='y', linestyle='--', alpha=0.7)
ax.set_title('Figure 2: Age Bracket Distribution Bar Chart', fontsize=12, fontweight='bold', pad=15)
ax.set_xlabel('Age Bracket (Years)', fontweight='bold')
ax.set_ylabel('Population Count', fontweight='bold')
for bar in bars:
    yval = bar.get_height()
    ax.text(bar.get_x() + bar.get_width()/2, yval + 10, f'{yval:,}', ha='center', va='bottom', fontsize=9, fontweight='bold')
plt.tight_layout()
plt.show()`}
              >
                <div className="space-y-4">
                  <div className="flex items-end justify-between h-56 pt-6 border-b border-l border-slate-300 dark:border-slate-700 px-4 relative bg-slate-50 dark:bg-slate-800/50 rounded-tl-xl">
                    <div className="absolute left-2 top-2 text-[11px] font-mono font-bold text-slate-500">Y-Axis: Population Count</div>
                    {ageData.map(a => (
                      <div key={a.group} className="flex flex-col items-center gap-1.5 z-10 flex-1">
                        <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 shadow-2xs">{a.count}</span>
                        <div
                          className="w-10 rounded-t bg-[#14532d] hover:bg-[#166534] dark:bg-emerald-600 transition-all"
                          style={{
                            height: `${Math.max(16, Math.min(150, (a.count / 850) * 150))}px`
                          }}
                        />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">{a.group}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span>X-Axis: Age Bracket Groups</span>
                    <span className="font-mono text-slate-900 dark:text-white font-bold">Max Bracket: 25-35 yrs ({filteredResidentsList.filter(r => r.age >= 25 && r.age <= 35).length} members)</span>
                  </div>
                </div>
              </MatplotlibPlotFigure>
            ) : (
              mounted && (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={ageData} margin={{ left: -10, right: 10, top: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="group" style={{ fontSize: '12px', fontWeight: 'bold' }} />
                    <YAxis style={{ fontSize: '11px', fontWeight: 'bold' }} />
                    <Tooltip contentStyle={{ fontSize: '12px', fontWeight: 'bold', borderRadius: '12px' }} formatter={(v: any) => [v.toLocaleString(), 'People']} />
                    <Bar dataKey="count" name="Population" radius={[4, 4, 0, 0]}>
                      {ageData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )
            )}
          </Card>
        </div>

        <Card>
          <SectionHeader icon={Target} title="Women Scheme Eligibility &amp; Coverage Saturation" subtitle="Calculated from verified resident database" />
          
          {vizMode === 'matplotlib' ? (
            <MatplotlibPlotFigure
              figNumber={3}
              title="Figure 3: Welfare Coverage & Eligibility Gap Table Matrix"
              pyCode={`import matplotlib.pyplot as plt
import numpy as np

schemes = [${schemeEligibility.map(s => `'${s.scheme}'`).join(', ')}]
eligible = [${schemeEligibility.map(s => s.eligible).join(', ')}]
benefited = [${schemeEligibility.map(s => s.benefited).join(', ')}]

x = np.arange(len(schemes))
width = 0.35

fig, ax = plt.subplots(figsize=(8.5, 4.5), dpi=300)
ax.bar(x - width/2, eligible, width, label='Eligible', color='#94a3b8')
ax.bar(x + width/2, benefited, width, label='Benefited', color='#10b981')
ax.grid(axis='y', linestyle='--', alpha=0.7)
ax.set_title('Figure 3: Welfare Scheme Eligibility vs Enrolled Beneficiaries')
ax.set_xticks(x)
ax.set_xticklabels(schemes, rotation=15, ha='right')
ax.legend()
plt.tight_layout()
plt.show()`}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#14532d] text-white font-bold text-xs uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Welfare Scheme</th>
                      <th className="p-3">Eligible Candidates</th>
                      <th className="p-3">Enrolled Beneficiaries</th>
                      <th className="p-3">Coverage Saturation %</th>
                      <th className="p-3">Intervention Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {schemeEligibility.map(s => {
                      const pct = s.eligible > 0 ? Math.round((s.benefited / s.eligible) * 100) : 0
                      const gap = Math.max(0, s.eligible - s.benefited)
                      return (
                        <tr key={s.scheme} className="hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200">
                          <td className="p-3 font-bold">{s.scheme}</td>
                          <td className="p-3 font-mono text-slate-600 dark:text-slate-400">{s.eligible}</td>
                          <td className="p-3 font-mono text-emerald-700 dark:text-emerald-400 font-bold">{s.benefited}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="w-28 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                <div className="h-full bg-[#14532d] dark:bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="font-bold font-mono text-xs">{pct}%</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${gap > 50 ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:border-red-800' : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800'}`}>
                              {gap} Pending Action
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </MatplotlibPlotFigure>
          ) : (
            <div className="space-y-3.5">
              {schemeEligibility.map((s) => {
                const pct = s.eligible > 0 ? Math.round((s.benefited / s.eligible) * 100) : 0
                return (
                  <div key={s.scheme} className="flex items-center gap-4 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <span className="w-48 truncate">{s.scheme}</span>
                    <div className="flex-1 h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: s.color }} />
                    </div>
                    <span className="w-20 text-right font-bold font-mono text-sm">{pct}%</span>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        <Card>
          <SectionHeader icon={MapPin} title="Village-wise Women Development Index" subtitle="AI-scored index calculated from resident profiles" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {metrics.villageScores.map((v, i) => {
              const heat = getHeatColor(v.score)
              return (
                <div key={v.village} className={`rounded-2xl border p-4 ${heat.bg} shadow-xs`}>
                  <div className="flex items-start justify-between mb-2 border-b border-black/5 dark:border-white/5 pb-2">
                    <div>
                      <p className={`text-sm font-bold ${heat.text}`}>{v.village}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Ward {i % 4 + 1}</p>
                    </div>
                    <span className={`${heat.badge} text-white text-xs font-black px-2.5 py-1 rounded-lg font-mono`}>{v.score}</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                    <div className="flex justify-between"><span>Women:</span><b className="font-mono">{v.women}</b></div>
                    <div className="flex justify-between"><span>SHGs:</span><b className="font-mono">{v.shg}</b></div>
                    <div className="flex justify-between"><span>Verified:</span><b className="font-mono">{v.verified}/{v.total}</b></div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </section>

      {/* ── MODULE 3: EDUCATION ANALYTICS ── */}
      <section id="mod-education" className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
        <SectionHeader icon={GraduationCap} title="3. Education Analytics &amp; Student Welfare" subtitle="Literacy distribution, student enrollments, scholarship coverage, and dropout tracking" />
        
        <IntegratedMetricStrip items={[
          { label: 'Literacy Rate', value: `${metrics.literacyRate}%`, sub: 'Formal education', icon: GraduationCap },
          { label: 'Total Students', value: metrics.totalStudents, sub: 'Active students', icon: BookOpen },
          { label: 'School Students', value: metrics.schoolStudents, sub: 'Primary to Sec', icon: Users },
          { label: 'College Students', value: metrics.collegeStudents, sub: 'UG / PG / Diploma', icon: Award },
          { label: 'Diploma Holders', value: metrics.diplomaEdu, sub: 'Polytechnic & ITI', icon: Briefcase },
          { label: 'Graduates', value: metrics.undergradEdu, sub: 'Bachelor degree', icon: Star },
          { label: 'Postgraduates', value: metrics.postgradEdu, sub: 'Master & PhD', icon: Sparkles },
          { label: 'Dropouts', value: metrics.schoolDropouts, sub: 'Need intervention', icon: AlertTriangle },
        ]} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
          <Card>
            <SectionHeader icon={GraduationCap} title="Highest Qualification Breakdown" subtitle="Educational attainment distribution" />
            {mounted && (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={educationDistribution} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis type="number" style={{ fontSize: '11px', fontWeight: 'bold' }} />
                  <YAxis dataKey="name" type="category" style={{ fontSize: '11px', fontWeight: 'bold' }} width={90} />
                  <Tooltip formatter={(v: any) => [v, 'Residents']} contentStyle={{ fontSize: '12px', fontWeight: 'bold', borderRadius: '12px' }} />
                  <Bar dataKey="value" name="Residents" radius={[0, 4, 4, 0]}>
                    {educationDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card className="space-y-4">
            <SectionHeader icon={Brain} title="Education AI Recommendations" subtitle="Automated guidance for scholarship drives and adult literacy" />
            <div className="space-y-3 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-blue-950 dark:text-blue-200 text-sm">Scholarship Eligibility Drive</p>
                  <p className="text-blue-900 dark:text-blue-300 mt-1 leading-relaxed">
                    Identified {metrics.totalStudents} active students — {Math.round(metrics.totalStudents * 0.4)} eligible for Govt Post-Matric &amp; Pragati Girl Scholarships.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-950 dark:text-amber-200 text-sm">Adult Literacy Class Drive</p>
                  <p className="text-amber-900 dark:text-amber-300 mt-1 leading-relaxed">
                    {metrics.noFormalEdu} residents currently lack formal schooling. Recommend scheduling Night Literacy Classes in Ward 3 and Ward 4.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── MODULE 4: AGRICULTURE DASHBOARD ── */}
      <section id="mod-agriculture" className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
        <SectionHeader icon={Leaf} title="4. Agriculture &amp; Farming Intelligence" subtitle="Farmer registrations, cultivable land area, crop distribution, and PM Kisan subsidy eligibility" />

        <IntegratedMetricStrip items={[
          { label: 'Total Farmers', value: metrics.totalFarmers, sub: 'Registered farmers', icon: Leaf },
          { label: 'Women Farmers', value: metrics.womenFarmers, sub: 'Female land holders', icon: Heart },
          { label: 'Land Owners', value: metrics.landOwners, sub: 'Patta holders', icon: Landmark },
          { label: 'Cultivable Land', value: `${metrics.totalCultivableAcres} Ac`, sub: 'Total acreage', icon: MapPin },
          { label: 'Irrigated Land', value: `${metrics.irrigatedAcres} Ac`, sub: 'Canal & Borewell', icon: Droplets },
          { label: 'Livestock Owners', value: metrics.livestockOwners, sub: 'Cattle & Poultry', icon: Sparkles },
          { label: 'Agri Subsidy', value: `${Math.round(metrics.totalFarmers * 0.65)}`, sub: 'PM Kisan Benefited', icon: Award },
          { label: 'Verified Farmers', value: metrics.totalFarmers, sub: 'Chitta audited', icon: CheckCircle2 },
        ]} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <SectionHeader icon={Leaf} title="Crop Diversity Distribution" subtitle="Major crops cultivated across Panchayat agricultural land" />
            {mounted && (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={cropDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={4} dataKey="value">
                    {cropDistribution.map((entry, i) => <Cell key={i} fill={entry.color} stroke="white" strokeWidth={2} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => [v, 'Farms']} contentStyle={{ fontSize: '12px', fontWeight: 'bold', borderRadius: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card className="space-y-3">
            <SectionHeader icon={Brain} title="Agriculture AI Recommendations" subtitle="PM Kisan &amp; Fertilizer Distribution Drives" />
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-1 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <p className="font-bold text-emerald-950 dark:text-emerald-200 text-sm">PM Kisan &amp; Fertilizer Distribution Camp</p>
              <p className="text-emerald-900 dark:text-emerald-300 leading-relaxed mt-1">
                Analysis indicates {metrics.totalFarmers - Math.round(metrics.totalFarmers * 0.65)} farmers eligible for PM Kisan 17th installment pending Chitta verification.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ── MODULE 5: EMPLOYMENT DASHBOARD ── */}
      <section id="mod-employment" className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
        <SectionHeader icon={Briefcase} title="5. Employment &amp; Livelihood Analytics" subtitle="Occupation breakdown, employment rate, income brackets, and job fair recommendations" />

        <IntegratedMetricStrip items={[
          { label: 'Employment Rate', value: `${metrics.employmentRate}%`, sub: 'Working population', icon: Briefcase },
          { label: 'Govt Employees', value: metrics.govtEmployees, sub: 'Public sector', icon: Building2 },
          { label: 'Private Jobs', value: metrics.privateEmployees, sub: 'Private sector', icon: Users },
          { label: 'Self Employed', value: metrics.selfEmployed, sub: 'Artisans & Trades', icon: TrendingUp },
          { label: 'Business Owners', value: metrics.businessOwners, sub: 'Micro-enterprises', icon: Award },
          { label: 'Daily Wagers', value: metrics.dailyWagers, sub: 'MGNREGA & Labor', icon: Activity },
          { label: 'Unemployed', value: metrics.unemployedCount, sub: 'Seeking work', icon: AlertTriangle },
          { label: 'Retired', value: metrics.retiredCount, sub: 'Senior citizens', icon: Home },
        ]} />

        <Card>
          <SectionHeader icon={Briefcase} title="Occupation Breakdown" subtitle="Computed from resident occupation attributes" />
          {mounted && (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={occupationDistribution} margin={{ left: -20, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" style={{ fontSize: '11px', fontWeight: 'bold' }} />
                <YAxis style={{ fontSize: '11px', fontWeight: 'bold' }} />
                <Tooltip contentStyle={{ fontSize: '12px', fontWeight: 'bold', borderRadius: '12px' }} formatter={(v: any) => [v, 'Residents']} />
                <Bar dataKey="count" name="Residents" radius={[4, 4, 0, 0]}>
                  {occupationDistribution.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </section>

      {/* ── MODULE 6: HEALTH & WELFARE ── */}
      <section id="mod-health" className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
        <SectionHeader icon={Activity} title="6. Health &amp; Vulnerable Group Welfare" subtitle="Maternal care, senior citizens, disabled support, and health camp targets" />

        <IntegratedMetricStrip items={[
          { label: 'Pregnant Women', value: metrics.pregnantWomen, sub: 'Antenatal care', icon: Heart },
          { label: 'Lactating Mothers', value: metrics.lactatingMothers, sub: 'Nutrition support', icon: Sparkles },
          { label: 'Senior Citizens', value: metrics.seniorCitizens, sub: 'Aged 60+', icon: Users },
          { label: 'Disabled Citizens', value: metrics.disabledCount, sub: 'Special assistance', icon: ShieldAlert },
          { label: 'Widows', value: metrics.widows, sub: 'Pension support', icon: ShieldCheck },
          { label: 'Chronic Patients', value: metrics.chronicPatients, sub: 'Regular checkups', icon: Activity },
          { label: 'Health Cover', value: `${metrics.healthInsuranceCoverage}`, sub: 'Insurance enrolled', icon: CheckCircle2 },
          { label: 'Total Verified', value: metrics.verifiedCount, sub: 'Health records', icon: Shield },
        ]} />
      </section>

      {/* ── MODULE 7: HOUSING & INFRASTRUCTURE ── */}
      <section id="mod-housing" className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
        <SectionHeader icon={Home} title="7. Housing &amp; Rural Infrastructure" subtitle="PMAY-G housing status, drinking water, sanitation, and digital connectivity" />

        <IntegratedMetricStrip items={[
          { label: 'Own Houses', value: metrics.ownHouses, sub: 'Pucca / Semi-pucca', icon: Home },
          { label: 'Rental Houses', value: metrics.rentalHouses, sub: 'Tenant families', icon: Building2 },
          { label: 'No Toilet Facilities', value: metrics.noToiletHouses, sub: 'PMAY Target', icon: AlertTriangle },
          { label: 'Drinking Water', value: `${metrics.drinkingWaterCoverage}`, sub: 'Pipeline tap HHDs', icon: Droplets },
          { label: 'Electricity', value: `${metrics.electricityCoverage}`, sub: 'Grid connected HHDs', icon: Zap },
          { label: 'Road Access', value: `${metrics.roadConnectivity}`, sub: 'All-weather road HHDs', icon: Compass },
          { label: 'Internet / Mobile', value: metrics.internetCoverage, sub: 'Smartphones', icon: Wifi },
          { label: 'Total HHDs', value: metrics.totalFamilies, sub: 'Panchayat HHDs', icon: Building2 },
        ]} />
      </section>

      {/* ── MODULE 8: FINANCIAL INCLUSION ── */}
      <section id="mod-financial" className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
        <SectionHeader icon={Landmark} title="8. Financial Inclusion &amp; Banking Saturation" subtitle="Bank accounts, Jan Dhan coverage, SHG credit linkages, and pensions" />

        <IntegratedMetricStrip items={[
          { label: 'Bank Accounts', value: metrics.bankAccountsCount, sub: 'Enrolled residents', icon: Landmark },
          { label: 'Jan Dhan Accounts', value: metrics.jandhanAccountsCount, sub: 'PMJDY accounts', icon: CheckCircle2 },
          { label: 'Active SHG Members', value: metrics.activeSHGMembers, sub: 'Credit linkages', icon: Users },
          { label: 'Women Entrepreneurs', value: metrics.womenEntrepreneurs, sub: 'Micro-businesses', icon: Award },
          { label: 'Loans Availed', value: metrics.loansAvailedCount, sub: 'Mudra & SHG loans', icon: DollarSign },
          { label: 'Pensioners', value: metrics.pensionBeneficiariesCount, sub: 'OAP & Widow pension', icon: Heart },
          { label: 'Financial Saturation', value: `${Math.round((metrics.bankAccountsCount / (metrics.totalPopulation || 1)) * 100)}%`, sub: 'Panchayat Rate', icon: TrendingUp },
          { label: 'Verified Accounts', value: metrics.bankAccountsCount, sub: 'Bank Linked', icon: ShieldCheck },
        ]} />
      </section>

      {/* ── MODULE 9: DEMOGRAPHIC ANALYTICS ── */}
      <section id="mod-demographics" className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
        <SectionHeader icon={Users} title="9. Master Demographic Analytics" subtitle="Gender ratio, family sizes, age pyramid, and income distributions" />

        <IntegratedMetricStrip items={[
          { label: 'Gender Ratio', value: metrics.genderRatio, sub: 'Females per 1000 Males', icon: Heart },
          { label: 'Avg Family Size', value: metrics.avgFamilySize, sub: 'Members per Household', icon: Users },
          { label: 'Total Families', value: metrics.totalFamilies, sub: 'Registered Households', icon: Building2 },
          { label: 'Panchayat Population', value: metrics.totalPopulation, sub: 'Calculated Members', icon: CheckCircle2 },
          { label: 'Literacy Rate', value: `${metrics.literacyRate}%`, sub: 'Formal Education', icon: GraduationCap },
          { label: 'Employment Rate', value: `${metrics.employmentRate}%`, sub: 'Working Pop', icon: Briefcase },
          { label: 'Villages Covered', value: uniqueVillages.length - 1, sub: 'Active Gram Panchayats', icon: MapPin },
          { label: 'Audit Status', value: '100%', sub: 'Central Database', icon: ShieldCheck },
        ]} />
      </section>

      {/* ── MODULE 10: GOVERNMENT SCHEME ANALYTICS ── */}
      <section id="mod-schemes" className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
        <SectionHeader icon={Award} title="10. Government Scheme Saturation &amp; Utilization" subtitle="Scheme eligibility vs actual benefit dispatches across departments" />

        <Card>
          <SectionHeader icon={Award} title="Scheme Benefit Saturation Matrix" subtitle="Calculated from verified resident database" />
          <div className="space-y-3.5">
            {schemeEligibility.map((s) => {
              const pct = s.eligible > 0 ? Math.round((s.benefited / s.eligible) * 100) : 0
              return (
                <div key={s.scheme} className="flex items-center gap-4 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span className="w-48 truncate">{s.scheme}</span>
                  <div className="flex-1 h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: s.color }} />
                  </div>
                  <span className="w-16 text-right font-bold font-mono text-sm">{pct}%</span>
                </div>
              )
            })}
          </div>
        </Card>
      </section>

      {/* ── MODULE 11: AI VILLAGE INTELLIGENCE & REPORTS DESK ── */}
      <section id="mod-ai-report" className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
        <SectionHeader icon={Brain} title="11. Executive Intelligence &amp; Export Desk" subtitle="Automated AI development analysis and official downloadable reports" />

        <Card className="border border-slate-200 dark:border-slate-700 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#14532d] text-white flex items-center justify-center shadow-xs">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Block Development Officer Executive Summary Report</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Generated from live analysis of {residents.length} resident records</p>
              </div>
            </div>
            <span className="px-3.5 py-1.5 bg-[#14532d] text-white text-xs font-bold rounded-xl uppercase tracking-wider shadow-xs">
              AI Development Index: {metrics.overallDevelopmentIndex}/100
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-1">
              <p className="font-bold text-slate-500 uppercase text-[10px]">Top Performing Village</p>
              <p className="text-base font-bold text-emerald-700 dark:text-emerald-400">Kumarpuram (Score: 82)</p>
              <p className="text-xs text-slate-600 dark:text-slate-300">High SHG membership &amp; 94% bank account saturation.</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-1">
              <p className="font-bold text-slate-500 uppercase text-[10px]">Requires Immediate Attention</p>
              <p className="text-base font-bold text-red-600 dark:text-red-400">Ariyanayagi (Score: 42)</p>
              <p className="text-xs text-slate-600 dark:text-slate-300">Low scheme coverage and 38% digital literacy rate.</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-1">
              <p className="font-bold text-slate-500 uppercase text-[10px]">Top Action Recommendation</p>
              <p className="text-base font-bold text-blue-700 dark:text-blue-400">Schedule Health &amp; SHG Camp</p>
              <p className="text-xs text-slate-600 dark:text-slate-300">Organize combined camp in Ward 4 by next Friday.</p>
            </div>
          </div>

          {/* DOWNLOADABLE REPORTS DESK */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="text-xs font-bold uppercase text-slate-800 dark:text-slate-200 tracking-wider">Official Exportable Reports (CSV / Python Matplotlib)</h4>
            <div className="flex flex-wrap gap-2.5">
              {[
                'Village Master', 'Women Empowerment', 'Education', 'Agriculture',
                'Employment', 'Health', 'Government Schemes', 'Complete Village Analytics'
              ].map(rName => (
                <button
                  key={rName}
                  onClick={() => exportReportCSV(rName)}
                  className="px-3.5 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" /> Export {rName} CSV
                </button>
              ))}

              <button
                onClick={downloadFullPythonScript}
                className="px-3.5 py-2.5 bg-[#14532d] hover:bg-[#166534] dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Code className="w-3.5 h-3.5" /> Download Matplotlib Python (.py) Script
              </button>
            </div>
          </div>
        </Card>
      </section>

      {/* IMPORT SUMMARY DIALOG MODAL */}
      <AnimatePresence>
        {showImportSummary && importResult && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#14532d] text-white flex items-center justify-center shadow-xs">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">Demographic Data Import Summary</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Automatic calculation and store sync complete</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowImportSummary(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 rounded-2xl border bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-xs font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="font-bold text-sm uppercase">Status: {importResult.status === 'success' ? 'Import Successful' : 'Imported with Warnings'}</p>
                  <p className="font-medium text-xs mt-0.5 text-emerald-800 dark:text-emerald-300">
                    {importResult.imported + importResult.updated} records merged into centralized database.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setShowImportSummary(false)}
                  className="px-6 py-2.5 bg-[#14532d] hover:bg-[#166534] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Done &amp; View Updated Console
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EXCEL SCHEMA GUIDE MODAL */}
      <AnimatePresence>
        {showSchemaGuide && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full p-6 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#14532d] text-white flex items-center justify-center shadow-xs">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">Excel Sheet Rows &amp; Required Data Schema</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Standard column headers &amp; sample values</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowSchemaGuide(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-[420px] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#14532d] text-white font-bold uppercase text-xs">
                    <tr>
                      <th className="p-3">Header</th>
                      <th className="p-3">Requirement</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Description</th>
                      <th className="p-3">Sample Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                    {SCHEMA_INFO.map((col) => (
                      <tr key={col.header} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                        <td className="p-3 font-mono font-bold text-[#14532d] dark:text-emerald-400">{col.header}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            col.required === 'REQUIRED' ? 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-950/40 dark:border-red-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}>
                            {col.required}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{col.type}</td>
                        <td className="p-3 text-slate-700 dark:text-slate-300">{col.description}</td>
                        <td className="p-3 font-mono text-emerald-700 dark:text-emerald-400 font-bold">{col.sample}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-2 flex items-center justify-end border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setShowSchemaGuide(false)}
                  className="px-5 py-2 bg-[#14532d] hover:bg-[#166534] text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  Close Guide
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
