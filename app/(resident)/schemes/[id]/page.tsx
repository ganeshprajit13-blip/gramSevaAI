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
import { useLanguage } from '@/components/providers/language-provider'
import { getStoredSchemes, evaluateResidentEligibility, type SchemeRecord } from '@/lib/scheme-store'
import { getStoredResidents, type ResidentRecord } from '@/lib/resident-store'
import { getTranslatedContent } from '@/utils/translations'

export default function ResidentSchemeDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const { t, language } = useLanguage()

  const [scheme, setScheme] = useState<SchemeRecord | null>(null)
  const [residentProfile, setResidentProfile] = useState<ResidentRecord | null>(null)
  const [loading, setLoading] = useState(true)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    toast.success(!bookmarked ? t('schemeBookmarked') : t('bookmarkRemoved'))
  }

  const handleShare = () => {
    const currentTitle = scheme ? (getTranslatedContent(scheme, 'title', language) || scheme.title) : 'Government Scheme'
    if (navigator.share) {
      navigator.share({
        title: currentTitle,
        url: window.location.href
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success(t('linkCopied'))
    }
  }

  const handleDownloadPdf = () => {
    toast.info(t('downloadingPdf'))
    setTimeout(() => {
      toast.success(t('downloadCompleted'))
    }, 1500)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{t('loading')}</p>
        </div>
      </div>
    )
  }

  if (!scheme) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl max-w-md w-full shadow-xs space-y-4">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
            {language === 'ta' ? 'திட்டம் கிடைக்கவில்லை' : 'Scheme Not Found'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'ta' ? 'நீங்கள் கோரிய அரசுத் திட்டம் தற்போது பயன்பாட்டில் இல்லை அல்லது நீக்கப்பட்டுள்ளது.' : 'The government scheme you requested does not exist or has been archived.'}
          </p>
          <Link href="/schemes" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs">
            <ArrowLeft className="w-4 h-4" /> {t('backToSchemes')}
          </Link>
        </div>
      </div>
    )
  }

  const title = getTranslatedContent(scheme, 'title', language) || scheme.title || scheme.name || 'Government Welfare Scheme'
  const description = getTranslatedContent(scheme, 'description', language) || scheme.description
  const category = (language === 'ta' && scheme.category_ta) ? scheme.category_ta : scheme.category
  const schemeType = (language === 'ta' && scheme.type_ta) ? scheme.type_ta : scheme.type
  const aiSummary = (language === 'ta' && scheme.ai_summary_ta) ? scheme.ai_summary_ta : scheme.ai_summary
  const benefitAmount = (language === 'ta' && scheme.benefit_details_ta?.amount) ? scheme.benefit_details_ta.amount : scheme.benefit_details?.amount
  const benefitFrequency = (language === 'ta' && scheme.benefit_details_ta?.frequency) ? scheme.benefit_details_ta.frequency : scheme.benefit_details?.frequency
  const benefitType = (language === 'ta' && scheme.benefit_details_ta?.type) ? scheme.benefit_details_ta.type : scheme.benefit_details?.type
  const benefitsList = (language === 'ta' && Array.isArray(scheme.benefits_list_ta) && scheme.benefits_list_ta.length > 0)
    ? scheme.benefits_list_ta
    : scheme.benefits_list || []
  const reqDocs = (language === 'ta' && Array.isArray(scheme.required_documents_ta) && scheme.required_documents_ta.length > 0)
    ? scheme.required_documents_ta
    : scheme.required_documents || []
  const faqs = (language === 'ta' && Array.isArray(scheme.important_info_ta?.faqs) && scheme.important_info_ta.faqs.length > 0)
    ? scheme.important_info_ta.faqs
    : scheme.important_info?.faqs || []
  const officeName = (language === 'ta' && scheme.application_method_ta?.office_name) ? scheme.application_method_ta.office_name : scheme.application_method?.office_name
  const officerName = (language === 'ta' && scheme.application_method_ta?.officer_name) ? scheme.application_method_ta.officer_name : scheme.application_method?.officer_name
  const officeAddress = (language === 'ta' && scheme.application_method_ta?.office_address) ? scheme.application_method_ta.office_address : scheme.application_method?.office_address
  const workingHours = (language === 'ta' && scheme.application_method_ta?.working_hours) ? scheme.application_method_ta.working_hours : scheme.application_method?.working_hours

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-24 pt-6 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* TOP NAVIGATION BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <Link
            href="/schemes"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> {t('backToSchemes')}
          </Link>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleShare}
              className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-4 h-4" /> {t('share')}
            </button>

            <button
              onClick={toggleBookmark}
              className={`p-2 rounded-xl transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                bookmarked ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Bookmark className="w-4 h-4 fill-current" /> {bookmarked ? t('schemeBookmarked') : t('bookmark')}
            </button>

            <button
              onClick={handleDownloadPdf}
              className="px-3 py-2 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 rounded-xl transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" /> {language === 'ta' ? 'அரசிதழ் PDF' : 'PDF Gazette'}
            </button>

            {scheme.application_method?.online_url && (
              <a
                href={scheme.application_method.online_url}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-xl text-xs font-black hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <ExternalLink className="w-4 h-4" /> {t('applyNow')}
              </a>
            )}
          </div>
        </div>

        {/* HERO BANNER & POSTER CARD */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="relative h-64 md:h-80 w-full">
            <img
              src={scheme.media?.poster_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80'}
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex flex-col justify-end p-6 md:p-8 text-white space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-blue-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-md">
                  {category}
                </span>
                <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-md">
                  {schemeType}
                </span>
                <span className="bg-slate-800/80 backdrop-blur-md text-slate-200 text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {language === 'ta' ? 'கடைசி தேதி:' : 'Closing Date:'} {scheme.closing_date}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">{title}</h1>
              <p className="text-xs md:text-sm text-slate-300 max-w-3xl line-clamp-2 leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        </div>

        {/* EXECUTIVE AI SUMMARY CARD */}
        {aiSummary && (
          <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-900 rounded-2xl flex items-start gap-3 shadow-xs">
            <Bot className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <span className="text-xs font-black text-blue-900 dark:text-blue-300 uppercase tracking-wider block">
                {t('aiSchemeSummary')}
              </span>
              <p className="text-xs text-blue-950/90 dark:text-slate-200 font-medium leading-relaxed">
                {aiSummary}
              </p>
            </div>
          </div>
        )}

        {/* MAIN 2-COLUMN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT 2 COLUMNS */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. LIVE AI ELIGIBILITY EVALUATOR WIDGET */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    {language === 'ta' ? 'தானியங்கி AI தகுதி சரிபார்ப்பு' : 'Automated AI Eligibility Matcher'}
                  </h3>
                </div>
                {residentProfile && (
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-md">
                    {residentProfile.name} ({residentProfile.village})
                  </span>
                )}
              </div>

              {aiEvaluation ? (
                <div className="space-y-4">
                  {/* Status Banner */}
                  <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
                    aiEvaluation.isEligible
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300'
                      : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300'
                  }`}>
                    {aiEvaluation.isEligible ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-sm uppercase tracking-wider">
                          {language === 'ta' ? 'முடிவு:' : 'Evaluation Status:'} {aiEvaluation.isEligible ? (language === 'ta' ? 'முழுத் தகுதி உள்ளது' : 'Eligible') : (language === 'ta' ? 'பகுதி தகுதி உள்ளது' : 'Partially Eligible')} ({aiEvaluation.matchScore}%)
                        </h4>
                      </div>
                      <p className="text-xs font-medium leading-relaxed">{aiEvaluation.summary}</p>
                    </div>
                  </div>

                  {/* Criteria Checklist */}
                  <div className="space-y-2">
                    <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                      {t('eligibilityCriteria')}
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {aiEvaluation.criteria?.map((item: any, i: number) => (
                        <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs flex items-start gap-2">
                          {item.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200 block">{item.title}</span>
                            <span className="text-slate-500 dark:text-slate-400 text-[11px]">{item.reason}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-center space-y-2">
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {language === 'ta' ? 'தானியங்கி AI தகுதி சரிபார்ப்பைப் பெற உங்கள் சுயவிவரப் படிவத்தை முடிக்கவும்.' : 'Complete your verified resident profile to unlock automatic AI eligibility matching.'}
                  </p>
                  <Link href="/profile" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline">
                    {language === 'ta' ? 'சுயவிவரத்தைப் பூர்த்தி செய்க →' : 'Complete Profile Now →'}
                  </Link>
                </div>
              )}
            </div>

            {/* 2. SCHEME BENEFITS MATRIX */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <DollarSign className="w-5 h-5 text-emerald-600" /> {language === 'ta' ? 'திட்டத்தின் பலன்கள் & நிதி உதவி' : 'Scheme Benefits & Financial Assistance'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-900 dark:text-emerald-300">
                  <span className="text-[10px] font-black uppercase tracking-wider block text-emerald-800 dark:text-emerald-400">
                    {language === 'ta' ? 'நன்மைத் தொகை' : 'Benefit Amount'}
                  </span>
                  <p className="text-xl font-black mt-1 text-emerald-700 dark:text-emerald-300">{benefitAmount || 'N/A'}</p>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl text-blue-900 dark:text-blue-300">
                  <span className="text-[10px] font-black uppercase tracking-wider block text-blue-800 dark:text-blue-400">
                    {language === 'ta' ? 'வழங்கும் முறை' : 'Disbursement Frequency'}
                  </span>
                  <p className="text-xl font-black mt-1 text-blue-700 dark:text-blue-300">{benefitFrequency || 'Regular'}</p>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-2xl text-purple-900 dark:text-purple-300">
                  <span className="text-[10px] font-black uppercase tracking-wider block text-purple-800 dark:text-purple-400">
                    {language === 'ta' ? 'உதவிப் பிரிவு' : 'Assistance Category'}
                  </span>
                  <p className="text-xl font-black mt-1 text-purple-700 dark:text-purple-300">{benefitType || 'Direct Transfer'}</p>
                </div>
              </div>

              {benefitsList.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                    {language === 'ta' ? 'முக்கிய சிறப்பம்சங்கள் & நன்மைகள்' : 'Key Highlights & Support Services'}
                  </span>
                  <div className="space-y-2">
                    {benefitsList.map((b: string, i: number) => (
                      <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. REQUIRED PROOF DOCUMENTS */}
            {reqDocs.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <FileText className="w-5 h-5 text-purple-600" /> {t('requiredDocs')}
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {reqDocs.map((doc: string) => (
                    <div key={doc} className="p-3 bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-950 dark:text-purple-300">{doc}</span>
                      <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. FREQUENTLY ASKED QUESTIONS */}
            {faqs.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <HelpCircle className="w-5 h-5 text-indigo-600" /> {language === 'ta' ? 'அடிக்கடி கேட்கப்படும் கேள்விகள் (FAQs)' : 'Frequently Asked Questions (FAQs)'}
                </h3>

                <div className="space-y-3">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {faqs.map((faq: any, idx: number) => {
                    const isOpen = openFaqIndex === idx
                    return (
                      <div key={idx} className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden transition-all">
                        <button
                          onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                          className="w-full p-4 text-left font-bold text-xs text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100 flex items-center justify-between cursor-pointer"
                        >
                          <span>{language === 'ta' ? 'கேள்வி:' : 'Q:'} {faq.question}</span>
                          <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isOpen && (
                          <div className="p-4 bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 font-medium leading-relaxed">
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
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4 border-t-4 border-t-blue-600">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {language === 'ta' ? 'ஆன்லைன் விண்ணப்ப தளம்' : 'Online Submission Portal'}
                  </h3>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {language === 'ta'
                    ? 'இத்திட்டத்திற்கு நேரடி ஆன்லைன் பதிவு இயக்கத்தில் உள்ளது. அதிகாரப்பூர்வ அரசு தளம் மூலம் ஆதார் மற்றும் ரேஷன் விவரங்களை சமர்ப்பிக்கலாம்.'
                    : 'Direct online submission is enabled for this government scheme. Submit your verified Aadhaar and Ration Card documents via official portal.'}
                </p>

                {scheme.application_method?.online_url && (
                  <a
                    href={scheme.application_method.online_url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <ExternalLink className="w-4 h-4" /> {language === 'ta' ? 'அதிகாரப்பூர்வ தளத்தைத் திறக்கவும்' : 'Open Official Portal'}
                  </a>
                )}
              </div>
            )}

            {/* PHYSICAL BDO OFFICE LOCATION CARD */}
            {scheme.application_method?.type !== 'Online' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4 border-t-4 border-t-emerald-600">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {language === 'ta' ? 'அணுக வேண்டிய அரசு அலுவலகம்' : 'Physical Office Desk'}
                  </h3>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block text-[10px]">
                      {language === 'ta' ? 'அலுவலகத்தின் பெயர்' : 'Office Name'}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{officeName || 'Block Development Office (BDO)'}</span>
                  </div>

                  <div>
                    <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block text-[10px]">
                      {language === 'ta' ? 'பொறுப்பு அலுவலர்' : 'Officer In-Charge'}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{officerName || 'Welfare Extension Officer'}</span>
                  </div>

                  <div>
                    <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block text-[10px]">
                      {language === 'ta' ? 'முகவரி' : 'Address'}
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{officeAddress || 'Block Headquarters Main Office'}</span>
                  </div>

                  <div>
                    <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block text-[10px]">
                      {language === 'ta' ? 'வேலை நேரம்' : 'Working Hours'}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{workingHours || '9:30 AM - 5:30 PM (Mon-Sat)'}</span>
                  </div>
                </div>

                {scheme.application_method?.maps_location && (
                  <a
                    href={scheme.application_method.maps_location}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs"
                  >
                    <MapPin className="w-4 h-4 text-emerald-600" /> {language === 'ta' ? 'Google Maps-ல் அலுவலகத்தைக் காண்க' : 'View BDO Location on Google Maps'}
                  </a>
                )}
              </div>
            )}

            {/* HELPLINE & SUPPORT CARD */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-3">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Phone className="w-4 h-4 text-indigo-600" /> {language === 'ta' ? 'அதிகாரப்பூர்வ உதவி மையம்' : 'Official Help Desk'}
              </h3>

              <div className="space-y-2 text-xs">
                {scheme.important_info?.helpline_number && (
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between">
                    <span className="font-bold text-slate-600 dark:text-slate-400">{language === 'ta' ? 'கட்டணமில்லா உதவி எண்' : 'Toll-Free Helpline'}</span>
                    <span className="font-black text-indigo-600 dark:text-indigo-400">{scheme.important_info.helpline_number}</span>
                  </div>
                )}

                {scheme.important_info?.official_email && (
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between">
                    <span className="font-bold text-slate-600 dark:text-slate-400">{language === 'ta' ? 'மின்னஞ்சல் உதவி' : 'Email Support'}</span>
                    <span className="font-bold text-slate-900 dark:text-white truncate max-w-[180px]">{scheme.important_info.official_email}</span>
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
