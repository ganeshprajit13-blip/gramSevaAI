'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlusCircle, FileText, CheckCircle2, Clock, Sparkles, Eye,
  Trash2, AlertTriangle, Radio, Search, Filter, RefreshCw
} from 'lucide-react'
import { getStoredSchemes, updateSchemeStatus, deleteScheme, type SchemeRecord } from '@/lib/scheme-store'
import { toast } from 'sonner'

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold',
  published: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold',
  upcoming: 'bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold',
  draft: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20 font-bold',
  closed: 'bg-red-500/10 text-red-600 border-red-500/20 font-bold',
}

export default function AdminSchemesPage() {
  const [schemes, setSchemes] = useState<SchemeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'upcoming'>('all')
  const [schemeToDelete, setSchemeToDelete] = useState<SchemeRecord | null>(null)

  const loadSchemes = () => {
    const localData = getStoredSchemes()
    setSchemes(localData)
    setLoading(false)
  }

  useEffect(() => {
    loadSchemes()
    window.addEventListener('gramseva_scheme_db_updated', loadSchemes)
    return () => window.removeEventListener('gramseva_scheme_db_updated', loadSchemes)
  }, [])

  // Handle setting scheme status to Live ('active') or Upcoming ('upcoming')
  const handleSetStatus = (id: string, title: string, newStatus: 'active' | 'upcoming') => {
    const updated = updateSchemeStatus(id, newStatus)
    if (updated) {
      loadSchemes()
      if (newStatus === 'active') {
        toast.success(`Scheme marked as Live!`, {
          description: `"${title}" is now officially published and active for applications.`,
        })
      } else {
        toast.success(`Scheme marked as Upcoming!`, {
          description: `"${title}" has been set to upcoming status.`,
        })
      }
    } else {
      toast.error('Failed to update scheme status')
    }
  }

  // Handle scheme deletion
  const confirmDelete = () => {
    if (!schemeToDelete) return
    const title = schemeToDelete.title || schemeToDelete.name || 'Welfare Scheme'
    const success = deleteScheme(schemeToDelete.id)
    if (success) {
      loadSchemes()
      toast.success(`Scheme deleted successfully`, {
        description: `"${title}" has been removed from central records.`,
      })
    } else {
      toast.error('Failed to delete scheme')
    }
    setSchemeToDelete(null)
  }

  const liveCount = schemes.filter(s => s.status === 'active' || s.status === 'published').length
  const upcomingCount = schemes.filter(s => s.status === 'upcoming').length

  const filteredSchemes = schemes.filter(s => {
    const title = s.title || s.name || ''
    const matchesSearch = searchQuery === '' ||
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.type.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (statusFilter === 'live') {
      return s.status === 'active' || s.status === 'published'
    }
    if (statusFilter === 'upcoming') {
      return s.status === 'upcoming'
    }
    return true
  })

  return (
    <div className="space-y-6 pt-8 lg:pt-0 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-700 text-[10px] font-black uppercase px-2 py-0.5 rounded">
              BDO E-Governance
            </span>
            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase px-2 py-0.5 rounded">
              Scheme Management System
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Government Welfare Schemes</h1>
          <p className="text-xs text-slate-500">Deploy, manage status (Live / Upcoming), monitor adoption, and configure scheme lifecycle.</p>
        </div>

        <Link
          href="/admin/schemes/deploy"
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white text-xs font-black transition-all shadow-md flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4.5 h-4.5" /> Deploy New Scheme
        </Link>
      </div>

      {/* BDO ANALYTICS OVERVIEW DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs border-l-4 border-l-emerald-600 space-y-1">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Total Active (Live) Schemes</span>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-slate-900">{liveCount}</p>
            <span className="text-xs font-bold text-amber-600">({upcomingCount} Upcoming)</span>
          </div>
          <span className="text-[10px] font-semibold text-emerald-600">✓ Deployed in Block</span>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs border-l-4 border-l-blue-600 space-y-1">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Eligible Residents Target</span>
          <p className="text-2xl font-black text-slate-900">436</p>
          <span className="text-[10px] font-semibold text-blue-600">Calculated via Central Store</span>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs border-l-4 border-l-purple-600 space-y-1">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Applications Completed</span>
          <p className="text-2xl font-black text-slate-900">189</p>
          <span className="text-[10px] font-semibold text-purple-600">43.3% Adoption Rate</span>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs border-l-4 border-l-amber-600 space-y-1">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Applications Pending</span>
          <p className="text-2xl font-black text-slate-900">47</p>
          <span className="text-[10px] font-semibold text-amber-600">Awaiting Verification</span>
        </div>
      </div>

      {/* AI RECOMMENDATION BOX */}
      <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex items-start gap-3 shadow-xs">
        <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="space-y-1">
          <span className="text-xs font-black text-blue-900 uppercase tracking-wider">BDO AI Governance Recommendation</span>
          <p className="text-xs text-blue-900/80 font-medium">
            "Only 42% of eligible women in Ward 5 have applied for <strong>Kalaignar Magalir Urimai Thittam</strong>. Consider conducting an awareness camp in Ward 5 this Thursday."
          </p>
        </div>
      </div>

      {/* SCHEMES TABLE CONTAINER */}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-slate-200 rounded-xl animate-pulse" />)}</div>
      ) : schemes.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-extrabold text-slate-800 text-lg mb-1">No schemes deployed yet</h3>
          <p className="text-slate-500 text-xs mb-4">Deploy your first government scheme using the 10-step wizard.</p>
          <Link href="/admin/schemes/deploy" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black shadow-sm">
            <PlusCircle className="w-4 h-4" /> Deploy Scheme
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
          {/* Table Header Bar with Status Filter Tabs and Search */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                All Managed Government Schemes ({schemes.length})
              </span>
              <span className="text-[10px] bg-slate-200/80 text-slate-600 px-2.5 py-0.5 rounded-full font-bold">
                {liveCount} Live • {upcomingCount} Upcoming
              </span>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Status Filter Tabs */}
              <div className="inline-flex items-center bg-slate-200/60 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({schemes.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('live')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                    statusFilter === 'live' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-emerald-700'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Live ({liveCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('upcoming')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                    statusFilter === 'upcoming' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-amber-700'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  Upcoming ({upcomingCount})
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search schemes..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 w-44"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="border-b border-slate-200 bg-slate-100/70 text-slate-600 uppercase font-extrabold tracking-wider">
                <tr>
                  <th className="p-4">Scheme Title & Poster</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Benefit Amount</th>
                  <th className="p-4">Application Mode</th>
                  <th className="p-4 min-w-[150px]">Status</th>
                  <th className="p-4 min-w-[260px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredSchemes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">
                      No schemes matching the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredSchemes.map((s, i) => {
                    const isLive = s.status === 'active' || s.status === 'published'
                    const isUpcoming = s.status === 'upcoming'

                    return (
                      <motion.tr
                        key={s.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.02 * i }}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        {/* Scheme Title & Poster */}
                        <td className="p-4 font-bold flex items-center gap-3">
                          {s.media?.poster_url ? (
                            <img src={s.media.poster_url} alt="" className="w-10 h-10 object-cover rounded-lg shadow-xs" />
                          ) : (
                            <div className="w-10 h-10 bg-blue-100 text-blue-700 font-black rounded-lg flex items-center justify-center text-xs">
                              {s.category.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <span className="text-slate-900 font-extrabold block text-xs">{s.title || s.name}</span>
                            <span className="text-[10px] text-slate-500 font-semibold">{s.type} • ID: {s.id}</span>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="p-4">
                          <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-md text-[10px]">
                            {s.category}
                          </span>
                        </td>

                        {/* Benefit Amount */}
                        <td className="p-4 font-extrabold text-emerald-700">
                          {s.benefit_details?.amount || 'N/A'} ({s.benefit_details?.frequency || 'One-time'})
                        </td>

                        {/* Application Mode */}
                        <td className="p-4 font-semibold text-slate-700">
                          {s.application_method?.type || 'Online'}
                        </td>

                        {/* Status Column with Interactive Quick Switcher */}
                        <td className="p-4">
                          <div className="space-y-1.5">
                            <div>
                              {isLive ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black uppercase tracking-wider">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  Live
                                </span>
                              ) : isUpcoming ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-black uppercase tracking-wider">
                                  <Clock className="w-2.5 h-2.5 text-amber-700" />
                                  Upcoming
                                </span>
                              ) : (
                                <span className={`px-2.5 py-0.5 rounded-full border text-[10px] capitalize ${STATUS_STYLES[s.status] || STATUS_STYLES.active}`}>
                                  {s.status}
                                </span>
                              )}
                            </div>

                            {/* Status Quick Toggle */}
                            <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                              <button
                                type="button"
                                onClick={() => handleSetStatus(s.id, s.title || s.name || '', 'active')}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                                  isLive
                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                    : 'text-slate-500 hover:text-emerald-700 hover:bg-emerald-50'
                                }`}
                                title="Set scheme status to Live"
                              >
                                Live
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSetStatus(s.id, s.title || s.name || '', 'upcoming')}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                                  isUpcoming
                                    ? 'bg-amber-500 text-white shadow-2xs'
                                    : 'text-slate-500 hover:text-amber-700 hover:bg-amber-50'
                                }`}
                                title="Set scheme status to Upcoming"
                              >
                                Upcoming
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Actions Column: Set Live / Set Upcoming, Delete, View */}
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {/* Button to Set Status as Upcoming or Live */}
                            {isUpcoming ? (
                              <button
                                type="button"
                                onClick={() => handleSetStatus(s.id, s.title || s.name || '', 'active')}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-700 hover:bg-emerald-100 text-[11px] font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                                title="Set scheme status to Live"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Set Live</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSetStatus(s.id, s.title || s.name || '', 'upcoming')}
                                className="px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-700 hover:bg-amber-100 text-[11px] font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                                title="Set scheme status to Upcoming"
                              >
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                <span>Set Upcoming</span>
                              </button>
                            )}

                            {/* Delete Scheme Button */}
                            <button
                              type="button"
                              onClick={() => setSchemeToDelete(s)}
                              className="px-2.5 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700 text-[11px] font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                              title="Delete scheme permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-600" />
                              <span>Delete</span>
                            </button>

                            {/* View Live on Citizen Portal */}
                            <Link
                              href={`/schemes/${s.id}`}
                              target="_blank"
                              className="px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 text-[11px] font-bold transition-all flex items-center gap-1 shadow-2xs"
                              title="View scheme details in citizen view"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-600" />
                              <span>View</span>
                            </Link>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {schemeToDelete && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-slate-900">Delete Welfare Scheme?</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Are you sure you want to delete <strong className="text-slate-900 font-extrabold">{schemeToDelete.title || schemeToDelete.name}</strong>? This scheme will be permanently removed from central storage and the citizen portal.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span className="font-medium">Scheme ID:</span>
                  <span className="font-mono font-bold text-slate-800">{schemeToDelete.id}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="font-medium">Category:</span>
                  <span className="font-bold text-slate-800">{schemeToDelete.category}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="font-medium">Current Status:</span>
                  <span className="font-black text-slate-800 capitalize">{schemeToDelete.status}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSchemeToDelete(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Yes, Delete Scheme
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

