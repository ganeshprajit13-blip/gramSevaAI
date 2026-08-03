'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, CheckCircle2, AlertTriangle, XCircle, MapPin, Clock,
  FileText, Globe, Building2, Phone, Mail, ExternalLink, Sparkles,
  Bot, Share2, Bookmark, Download, DollarSign, HelpCircle, ChevronDown,
  ShieldCheck, Award, Eye, Play
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/components/providers/auth-provider'
import { getStoredSchemes, evaluateResidentEligibility, type SchemeRecord } from '@/lib/scheme-store'
import { getStoredResidents, type ResidentRecord } from '@/lib/resident-store'

export default function ResidentSchemeDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user } = useAuth()

  const [scheme, setScheme] = useState<SchemeRecord | null>(null)
  const [residentProfile, setResidentProfile] = useState<ResidentRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [aiEvaluation, setAiEvaluation] = useState<any>(null)
  const [bookmarked, setBookmarked] = useState(false)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)

  useEffect(() => {
    // 1. Fetch scheme from central store or API
    const localSchemes = getStoredSchemes()
    const found = localSchemes.find(s => s.id === id || s.id.toLowerCase() === id.toLowerCase())

    if (found) {
      setScheme(found)
      setLoading(false)
    } else {
      fetch(`/api/schemes/${id}`)
        .then(r => r.json())
        .then(d => {
          if (d.data) setScheme(d.data)
        })
        .finally(() => setLoading(false))
    }

    // 2. Fetch current resident profile
    if (user?.uid) {
      const residents = getStoredResidents()
      const res = residents.find(r => r.firebase_uid === user.uid)
      if (res) setResidentProfile(res)
    }
  }, [id, user])

  // Run AI Eligibility evaluation when scheme and profile are loaded
  useEffect(() => {
    if (scheme && residentProfile) {
      const result = evaluateResidentEligibility(scheme, residentProfile)
      setAiEvaluation(result)
    }
  }, [scheme, residentProfile])

  const toggleBookmark = () => {
    setBookmarked(!bookmarked)
    toast.success(!bookmarked ? 'Scheme Bookmarked' : 'Bookmark Removed')
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: scheme?.title || 'Government Scheme',
        url: window.location.href
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Scheme Link Copied to Clipboard!')
    }
  }

  const handleDownloadPdf = () => {
    toast.info('Downloading official scheme notification PDF...')
    setTimeout(() => {
      toast.success('Download Completed!')
    }, 1500)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Loading Scheme Details...</p>
        </div>
      </div>
    )
  }

  if (!scheme) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center bg-white border border-slate-200 p-8 rounded-3xl max-w-md w-full shadow-xs space-y-4">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-lg font-extrabold text-slate-900">Scheme Not Found</h2>
          <p className="text-xs text-slate-500">The government scheme you requested does not exist or has been archived.</p>
          <Link href="/schemes" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs">
            <ArrowLeft className="w-4 h-4" /> Back to Schemes
          </Link>
        </div>
      </div>
    )
  }

  const title = scheme.title || scheme.name || 'Government Welfare Scheme'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 pt-6 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* TOP NAVIGATION BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <Link
            href="/schemes"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Schemes
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all text-xs font-bold flex items-center gap-1.5"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>

            <button
              onClick={toggleBookmark}
              className={`p-2 rounded-xl transition-all text-xs font-bold flex items-center gap-1.5 ${
                bookmarked ? 'bg-amber-500 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Bookmark className="w-4 h-4 fill-current" /> {bookmarked ? 'Bookmarked' : 'Bookmark'}
            </button>

            <button
              onClick={handleDownloadPdf}
              className="px-3 py-2 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 rounded-xl transition-all text-xs font-bold flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" /> PDF Gazette
            </button>

            {scheme.application_method?.online_url && (
              <a
                href={scheme.application_method.online_url}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-xl text-xs font-black hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <ExternalLink className="w-4 h-4" /> Apply Now
              </a>
            )}
          </div>
        </div>

        {/* HERO BANNER & POSTER CARD */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="relative h-64 md:h-80 w-full">
            <img
              src={scheme.media?.poster_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80'}
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex flex-col justify-end p-6 md:p-8 text-white space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-blue-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-md">
                  {scheme.category}
                </span>
                <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-md">
                  {scheme.type}
                </span>
                <span className="bg-slate-800/80 backdrop-blur-md text-slate-200 text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Closing Date: {scheme.closing_date}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">{title}</h1>
              <p className="text-xs md:text-sm text-slate-300 max-w-3xl line-clamp-2">
                {scheme.description}
              </p>
            </div>
          </div>
        </div>

        {/* EXECUTIVE AI SUMMARY CARD */}
        {scheme.ai_summary && (
          <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex items-start gap-3 shadow-xs">
            <Bot className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <span className="text-xs font-black text-blue-900 uppercase tracking-wider block">GramSeva AI Executive Summary</span>
              <p className="text-xs text-blue-900/90 font-medium leading-relaxed">
                {scheme.ai_summary}
              </p>
            </div>
          </div>
        )}

        {/* MAIN 2-COLUMN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT 2 COLUMNS */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. LIVE AI ELIGIBILITY EVALUATOR WIDGET */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <h3 className="font-black text-base text-slate-900">Automated AI Eligibility Matcher</h3>
                </div>
                {residentProfile && (
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                    Verified Resident: {residentProfile.name}
                  </span>
                )}
              </div>

              {aiEvaluation ? (
                <div className="space-y-4">
                  {/* Status Banner */}
                  <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
                    aiEvaluation.status === 'Eligible'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : aiEvaluation.status === 'Partially Eligible'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-red-50 border-red-200 text-red-900'
                  }`}>
                    {aiEvaluation.status === 'Eligible' ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-sm uppercase tracking-wider">Evaluation Status: {aiEvaluation.status}</h4>
                      </div>
                      <p className="text-xs font-medium leading-relaxed">{aiEvaluation.explanation}</p>
                    </div>
                  </div>

                  {/* Matched Rules Checklist */}
                  {aiEvaluation.matched?.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Matched Profile Criteria ({aiEvaluation.matched.length})
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {aiEvaluation.matched.map((m: string, i: number) => (
                          <div key={i} className="p-2.5 bg-emerald-50/60 border border-emerald-100 rounded-xl text-xs font-semibold text-emerald-900 flex items-center gap-2">
                            <span className="text-emerald-600 font-bold">✓</span> {m}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Requirements */}
                  {aiEvaluation.missing?.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <span className="text-xs font-extrabold text-red-800 uppercase tracking-wider flex items-center gap-1.5">
                        <XCircle className="w-4 h-4 text-red-600" /> Unmet Qualification Requirements ({aiEvaluation.missing.length})
                      </span>
                      <div className="space-y-1.5">
                        {aiEvaluation.missing.map((m: string, i: number) => (
                          <div key={i} className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-900 flex items-start gap-2">
                            <span className="text-red-600 font-bold mt-0.5">⚠️</span> <div>{m}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2">
                  <p className="text-xs text-slate-600">Complete your verified resident profile to unlock automatic AI eligibility matching.</p>
                  <Link href="/complete-profile" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline">
                    Complete Profile Now →
                  </Link>
                </div>
              )}
            </div>

            {/* 2. SCHEME BENEFITS MATRIX */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <DollarSign className="w-5 h-5 text-emerald-600" /> Scheme Benefits & Financial Assistance
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900">
                  <span className="text-[10px] font-black uppercase tracking-wider block text-emerald-800">Benefit Amount</span>
                  <p className="text-xl font-black mt-1 text-emerald-700">{scheme.benefit_details?.amount || 'N/A'}</p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-blue-900">
                  <span className="text-[10px] font-black uppercase tracking-wider block text-blue-800">Disbursement Frequency</span>
                  <p className="text-xl font-black mt-1 text-blue-700">{scheme.benefit_details?.frequency || 'One-time'}</p>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-purple-900">
                  <span className="text-[10px] font-black uppercase tracking-wider block text-purple-800">Assistance Category</span>
                  <p className="text-xl font-black mt-1 text-purple-700">{scheme.benefit_details?.type || 'Subsidy'}</p>
                </div>
              </div>

              {scheme.benefits_list?.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Key Highlights & Support Services</span>
                  <div className="space-y-2">
                    {scheme.benefits_list.map((b, i) => (
                      <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. REQUIRED PROOF DOCUMENTS */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <FileText className="w-5 h-5 text-purple-600" /> Required Verification Documents
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {scheme.required_documents?.map(doc => (
                  <div key={doc} className="p-3 bg-purple-50/60 border border-purple-200 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-950">{doc}</span>
                    <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* 4. FREQUENTLY ASKED QUESTIONS */}
            {scheme.important_info?.faqs?.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <HelpCircle className="w-5 h-5 text-indigo-600" /> Frequently Asked Questions (FAQs)
                </h3>

                <div className="space-y-3">
                  {scheme.important_info.faqs.map((faq, idx) => {
                    const isOpen = openFaqIndex === idx
                    return (
                      <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden transition-all">
                        <button
                          onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                          className="w-full p-4 text-left font-bold text-xs text-slate-800 bg-slate-50/50 hover:bg-slate-100 flex items-center justify-between"
                        >
                          <span>Q: {faq.question}</span>
                          <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isOpen && (
                          <div className="p-4 bg-white text-xs text-slate-600 border-t border-slate-100 font-medium leading-relaxed">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN (APPLICATION METHOD & OFFICE DETAILS) */}
          <div className="space-y-6">
            {/* ONLINE PORTAL ACTION CARD */}
            {scheme.application_method?.type !== 'Offline' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 border-t-4 border-t-blue-600">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <h3 className="font-extrabold text-sm text-slate-900">Online Submission Portal</h3>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Direct online submission is enabled for this government scheme. Submit your verified Aadhaar and Ration Card documents via official portal.
                </p>

                {scheme.application_method?.online_url && (
                  <a
                    href={scheme.application_method.online_url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <ExternalLink className="w-4 h-4" /> Open Official Portal
                  </a>
                )}
              </div>
            )}

            {/* PHYSICAL BDO OFFICE LOCATION CARD */}
            {scheme.application_method?.type !== 'Online' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 border-t-4 border-t-emerald-600">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-extrabold text-sm text-slate-900">Physical BDO Office Desk</h3>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">Office Name</span>
                    <span className="font-bold text-slate-900">{scheme.application_method?.office_name || 'Block Development Office'}</span>
                  </div>

                  <div>
                    <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">Officer In-Charge</span>
                    <span className="font-bold text-slate-900">{scheme.application_method?.officer_name || 'Welfare Extension Officer'}</span>
                  </div>

                  <div>
                    <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">Address</span>
                    <span className="font-medium text-slate-700">{scheme.application_method?.office_address || 'Block Headquarters Main Office'}</span>
                  </div>

                  <div>
                    <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">Working Hours</span>
                    <span className="font-semibold text-slate-800">{scheme.application_method?.working_hours || '9:30 AM - 5:30 PM (Mon-Sat)'}</span>
                  </div>
                </div>

                {scheme.application_method?.maps_location && (
                  <a
                    href={scheme.application_method.maps_location}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs"
                  >
                    <MapPin className="w-4 h-4 text-emerald-600" /> View BDO Location on Google Maps
                  </a>
                )}
              </div>
            )}

            {/* HELPLINE & SUPPORT CARD */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Phone className="w-4 h-4 text-indigo-600" /> Official BDO Help Desk
              </h3>

              <div className="space-y-2 text-xs">
                {scheme.important_info?.helpline_number && (
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <span className="font-bold text-slate-600">Toll-Free Helpline</span>
                    <span className="font-black text-indigo-600">{scheme.important_info.helpline_number}</span>
                  </div>
                )}

                {scheme.important_info?.official_email && (
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <span className="font-bold text-slate-600">Email Support</span>
                    <span className="font-bold text-slate-900 truncate max-w-[180px]">{scheme.important_info.official_email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
