'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { PlusCircle, Pencil, FileText, CheckCircle2, Archive, Clock, Sparkles, TrendingUp, Users, Target, Eye } from 'lucide-react'
import { getStoredSchemes, type SchemeRecord } from '@/lib/scheme-store'

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
          <p className="text-xs text-slate-500">Deploy, publish, monitor adoption, and run AI eligibility analytics.</p>
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
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs border-l-4 border-l-blue-600 space-y-1">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Total Active Schemes</span>
          <p className="text-2xl font-black text-slate-900">{schemes.filter(s => s.status === 'active' || s.status === 'published').length}</p>
          <span className="text-[10px] font-semibold text-emerald-600">✓ Deployed in Block</span>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs border-l-4 border-l-emerald-600 space-y-1">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Eligible Residents Target</span>
          <p className="text-2xl font-black text-slate-900">436</p>
          <span className="text-[10px] font-semibold text-emerald-600">Calculated via Central Store</span>
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

      {/* SCHEMES TABLE */}
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
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">All Managed Government Schemes ({schemes.length})</span>
            <span className="text-[10px] text-slate-500 font-bold">Real-time Central Storage</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="border-b border-slate-200 bg-slate-100/70 text-slate-600 uppercase font-extrabold tracking-wider">
                <tr>
                  <th className="p-4">Scheme Title & Poster</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Benefit Amount</th>
                  <th className="p-4">Application Mode</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {schemes.map((s, i) => (
                  <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.03 * i }} className="hover:bg-slate-50 transition-colors">
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
                        <span className="text-[10px] text-slate-500 font-semibold">{s.type}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-700 font-bold px-2 py-1 rounded-md text-[10px]">
                        {s.category}
                      </span>
                    </td>
                    <td className="p-4 font-extrabold text-emerald-700">
                      {s.benefit_details?.amount || 'N/A'} ({s.benefit_details?.frequency || 'One-time'})
                    </td>
                    <td className="p-4 font-semibold text-slate-700">
                      {s.application_method?.type || 'Online'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full border text-[10px] capitalize ${STATUS_STYLES[s.status] || STATUS_STYLES.active}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="p-4 flex items-center gap-2">
                      <Link
                        href={`/schemes`}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold hover:bg-blue-100 transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Live
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
