'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, ChevronRight, Clock, ExternalLink, X, Sparkles, Bot,
  CheckCircle2, AlertTriangle, ShieldAlert, Award, FileText, Share2,
  Bookmark, Download, MapPin, Building2, Eye
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/components/providers/auth-provider'
import { getStoredSchemes, evaluateResidentEligibility, type SchemeRecord } from '@/lib/scheme-store'
import { getStoredResidents, type ResidentRecord } from '@/lib/resident-store'

const CATEGORIES = [
  'All', 'Women Empowerment', 'Agriculture', 'Education', 'Health', 'Housing',
  'Pension', 'Employment', 'Business', 'Student Scholarship', 'Livestock',
  'Infrastructure', 'Other'
]

export default function ResidentSchemesPage() {
  const searchParams = useSearchParams()
  const { user } = useAuth()

  const [schemes, setSchemes] = useState<SchemeRecord[]>([])
  const [residentProfile, setResidentProfile] = useState<ResidentRecord | null>(null)
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') ?? 'All')
  const [selectedSchemeForAI, setSelectedSchemeForAI] = useState<SchemeRecord | null>(null)
  const [aiEvaluation, setAiEvaluation] = useState<any>(null)
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({})

  // Load Schemes and Logged-in Resident Profile
  const loadData = () => {
    const allSchemes = getStoredSchemes().filter(s => s.status === 'active' || s.status === 'published')
    setSchemes(allSchemes)

    if (user?.uid) {
      const residents = getStoredResidents()
      const found = residents.find(r => r.firebase_uid === user.uid)
      if (found) setResidentProfile(found)
    }
  }

  useEffect(() => {
    loadData()
    window.addEventListener('gramseva_scheme_db_updated', loadData)
    window.addEventListener('gramseva_resident_db_updated', loadData)
    return () => {
      window.removeEventListener('gramseva_scheme_db_updated', loadData)
      window.removeEventListener('gramseva_resident_db_updated', loadData)
    }
  }, [user])

  // Filter schemes
  const filteredSchemes = schemes.filter(s => {
    const title = s.title || s.name || ''
    const matchesSearch = search === '' ||
      title.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase())

    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Perform AI Eligibility Evaluation Modal
  const runAiEligibilityCheck = (scheme: SchemeRecord) => {
    if (!residentProfile) {
      toast.info('Please complete your resident profile first to unlock automated AI eligibility verification!')
      return
    }
    setSelectedSchemeForAI(scheme)
    const result = evaluateResidentEligibility(scheme, residentProfile)
    setAiEvaluation(result)
  }

  const toggleBookmark = (id: string) => {
    setBookmarked(prev => {
      const updated = !prev[id]
      toast.success(updated ? 'Bookmark Saved' : 'Bookmark Removed')
      return { ...prev, [id]: updated }
    })
  }

  return (
    <div className="space-y-6 pt-6 pb-20 max-w-7xl mx-auto px-4 md:px-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white space-y-3 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="flex items-center gap-2">
          <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-black uppercase px-2.5 py-1 rounded-md">
            GramSeva Smart Governance Portal
          </span>
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black uppercase px-2.5 py-1 rounded-md flex items-center gap-1">
            <Bot className="w-3 h-3" /> AI Eligibility Engine
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">Government Welfare Schemes</h1>
        <p className="text-xs md:text-sm text-slate-300 max-w-2xl">
          Browse official Central & State Government schemes deployed by the Block Development Officer (BDO). Click <strong>"Check My Eligibility"</strong> to compare your verified profile instantly.
        </p>

        {residentProfile && (
          <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Verified Profile Active for Resident: <strong className="text-white">{residentProfile.name}</strong> ({residentProfile.village})
          </div>
        )}
      </div>

      {/* SEARCH AND CATEGORY FILTER BAR */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search schemes by title, benefits, or category..."
              className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-10 py-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* SCHEMES GRID */}
      {filteredSchemes.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-extrabold text-slate-800 text-base mb-1">No matching schemes found</h3>
          <p className="text-xs text-slate-500">Try adjusting your category filter or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchemes.map((scheme) => {
            const isBookmarked = !!bookmarked[scheme.id]
            let residentEval: any = null
            if (residentProfile) {
              residentEval = evaluateResidentEligibility(scheme, residentProfile)
            }

            return (
              <motion.div
                key={scheme.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Poster & Badges */}
                <Link href={`/schemes/${scheme.id}`} className="relative block group">
                  <img
                    src={scheme.media?.poster_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80'}
                    alt={scheme.title}
                    className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-lg">
                      {scheme.category}
                    </span>
                    <span className="bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-lg">
                      {scheme.type}
                    </span>
                  </div>

                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleBookmark(scheme.id); }}
                    className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all ${
                      isBookmarked ? 'bg-amber-500 text-white' : 'bg-slate-900/60 text-white hover:bg-slate-900'
                    }`}
                  >
                    <Bookmark className="w-4 h-4 fill-current" />
                  </button>
                </Link>

                {/* Body Content */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <Link href={`/schemes/${scheme.id}`} className="font-extrabold text-base text-slate-900 leading-snug line-clamp-2 hover:text-blue-600 transition-colors">
                      {scheme.title || scheme.name}
                    </Link>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {scheme.description || scheme.ai_summary}
                    </p>
                  </div>

                  {/* Benefit Banner */}
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-900">Benefit Amount</span>
                    <span className="text-xs font-black text-emerald-700">
                      {scheme.benefit_details?.amount} ({scheme.benefit_details?.frequency})
                    </span>
                  </div>

                  {/* AI Eligibility Badge on Card */}
                  {residentEval && (
                    <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                      residentEval.status === 'Eligible'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold'
                        : residentEval.status === 'Partially Eligible'
                        ? 'bg-amber-50 border-amber-200 text-amber-900 font-bold'
                        : 'bg-red-50 border-red-200 text-red-900 font-bold'
                    }`}>
                      <span className="flex items-center gap-1.5">
                        {residentEval.status === 'Eligible' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-amber-600" />}
                        AI Status: <strong>{residentEval.status}</strong>
                      </span>
                    </div>
                  )}

                  {/* Required Documents Chips */}
                  {scheme.required_documents?.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Required Proofs</span>
                      <div className="flex flex-wrap gap-1">
                        {scheme.required_documents.slice(0, 3).map(doc => (
                          <span key={doc} className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">
                            {doc}
                          </span>
                        ))}
                        {scheme.required_documents.length > 3 && (
                          <span className="text-[10px] font-bold text-slate-400">+{scheme.required_documents.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <Link
                      href={`/schemes/${scheme.id}`}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Eye className="w-4 h-4" /> Open Full-Screen Scheme Details →
                    </Link>

                    <button
                      onClick={() => runAiEligibilityCheck(scheme)}
                      className="w-full py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Quick AI Eligibility Check
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* AI ELIGIBILITY EXPLANATION MODAL */}
      <AnimatePresence>
        {selectedSchemeForAI && aiEvaluation && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl overflow-hidden my-8"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <span className="font-extrabold text-sm text-slate-900">GramSeva AI Eligibility Verification</span>
                </div>
                <button onClick={() => setSelectedSchemeForAI(null)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Banner */}
              <div className={`p-4 rounded-2xl border space-y-1 ${
                aiEvaluation.status === 'Eligible'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : aiEvaluation.status === 'Partially Eligible'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider block">Decision Result</span>
                  <span className="font-black text-sm">{aiEvaluation.status}</span>
                </div>
                <p className="text-xs font-medium mt-1 leading-relaxed">{aiEvaluation.explanation}</p>
              </div>

              {/* Matched Criteria */}
              {aiEvaluation.matched?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Satisfied Qualification Rules ({aiEvaluation.matched.length})
                  </span>
                  <div className="space-y-1">
                    {aiEvaluation.matched.map((m: string, i: number) => (
                      <div key={i} className="p-2.5 bg-emerald-50/60 border border-emerald-100 rounded-xl text-xs font-semibold text-emerald-900">
                        ✓ {m}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Criteria Explanation */}
              {aiEvaluation.missing?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-extrabold text-red-800 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600" /> Unmet Criteria & Action Items ({aiEvaluation.missing.length})
                  </span>
                  <div className="space-y-1">
                    {aiEvaluation.missing.map((m: string, i: number) => (
                      <div key={i} className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-900">
                        ⚠️ {m}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedSchemeForAI(null)}
                  className="px-5 py-2.5 bg-slate-900 text-white font-black text-xs rounded-xl hover:bg-slate-800"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
