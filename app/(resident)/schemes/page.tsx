'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, ChevronRight, Clock, ExternalLink, X, Sparkles, Bot,
  CheckCircle2, AlertTriangle, ShieldAlert, Award, FileText, Share2,
  Bookmark, Download, MapPin, Building2, Eye, Mic, MicOff, Loader2, RotateCcw
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/components/providers/auth-provider'
import { useLanguage } from '@/components/providers/language-provider'
import { getStoredSchemes, evaluateResidentEligibility, type SchemeRecord } from '@/lib/scheme-store'
import { getStoredResidents, type ResidentRecord } from '@/lib/resident-store'
import { searchSchemes } from '@/lib/scheme-search'
import { useVoiceSearch } from '@/lib/use-voice-search'
import { getTranslatedContent } from '@/utils/translations'

const CATEGORIES = [
  'All', 'Women Empowerment', 'Agriculture', 'Education', 'Health', 'Housing',
  'Pension', 'Employment', 'Business', 'Student Scholarship', 'Livestock',
  'Infrastructure', 'Other'
] as const

const CATEGORY_TRANSLATIONS: Record<string, { en: string; ta: string }> = {
  'All': { en: 'All', ta: 'அனைத்தும்' },
  'Women Empowerment': { en: 'Women Empowerment', ta: 'மகளிர் நலம்' },
  'Agriculture': { en: 'Agriculture', ta: 'வேளாண்மை / உழவர் நலன்' },
  'Education': { en: 'Education', ta: 'கல்வி' },
  'Health': { en: 'Health', ta: 'சுகாதாரம் & மருத்துவம்' },
  'Housing': { en: 'Housing', ta: 'வீட்டுவசதி' },
  'Pension': { en: 'Pension', ta: 'ஓய்வூதியம்' },
  'Employment': { en: 'Employment', ta: 'வேலைவாய்ப்பு' },
  'Business': { en: 'Business', ta: 'சுயதொழில் & வணிகம்' },
  'Student Scholarship': { en: 'Student Scholarship', ta: 'மாணவர் உதவித்தொகை' },
  'Livestock': { en: 'Livestock', ta: 'கால்நடை பராமரிப்பு' },
  'Infrastructure': { en: 'Infrastructure', ta: 'கிராம கட்டமைப்பு' },
  'Other': { en: 'Other', ta: 'இதர திட்டங்கள்' }
}

export default function ResidentSchemesPage() {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { t, language } = useLanguage()

  const [schemes, setSchemes] = useState<SchemeRecord[]>([])
  const [residentProfile, setResidentProfile] = useState<ResidentRecord | null>(null)
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') ?? 'All')
  const [selectedSchemeForAI, setSelectedSchemeForAI] = useState<SchemeRecord | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [aiEvaluation, setAiEvaluation] = useState<any>(null)
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({})
  const [isPending, startTransition] = useTransition()
  const [filteredSchemes, setFilteredSchemes] = useState<SchemeRecord[]>([])

  useEffect(() => {
    const q = searchParams.get('search')
    if (q !== null && q !== undefined) {
      setSearch(q)
    }
    const cat = searchParams.get('category')
    if (cat !== null && cat !== undefined) {
      setSelectedCategory(cat)
    }
  }, [searchParams])

  // Load Schemes and Logged-in Resident Profile
  const loadData = () => {
    const allSchemes = getStoredSchemes().filter(s => s.status === 'active' || s.status === 'published' || s.status === 'upcoming')
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

  // Voice Search Hook
  const { isListening, toggleListening, stopListening } = useVoiceSearch({
    language,
    onResult: (spokenText) => {
      setSearch(spokenText)
    }
  })

  // Dynamic search execution with transition
  useEffect(() => {
    startTransition(() => {
      const results = searchSchemes(schemes, search, selectedCategory)
      setFilteredSchemes(results)
    })
  }, [schemes, search, selectedCategory])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    stopListening()
    const results = searchSchemes(schemes, search, selectedCategory)
    setFilteredSchemes(results)
  }

  const handleClearSearch = () => {
    setSearch('')
    stopListening()
  }

  const handleResetAll = () => {
    setSearch('')
    setSelectedCategory('All')
    stopListening()
  }

  // Perform AI Eligibility Evaluation Modal
  const runAiEligibilityCheck = (scheme: SchemeRecord) => {
    if (!residentProfile) {
      toast.info(language === 'ta'
        ? 'தானியங்கி AI தகுதி சரிபார்ப்பைப் பயன்படுத்த உங்கள் சுயவிவரப் படிவத்தை முதலில் பூர்த்தி செய்யவும்!'
        : 'Please complete your resident profile first to unlock automated AI eligibility verification!')
      return
    }
    setSelectedSchemeForAI(scheme)
    const result = evaluateResidentEligibility(scheme, residentProfile)
    setAiEvaluation(result)
  }

  const toggleBookmark = (id: string) => {
    setBookmarked(prev => {
      const updated = !prev[id]
      toast.success(updated ? t('schemeBookmarked') : t('bookmarkRemoved'))
      return { ...prev, [id]: updated }
    })
  }

  return (
    <div className="space-y-6 pt-6 pb-20 max-w-7xl mx-auto px-4 md:px-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white space-y-3 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="flex items-center gap-2 flex-wrap">
          <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-black uppercase px-2.5 py-1 rounded-md">
            {t('smartGovPortal')}
          </span>
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black uppercase px-2.5 py-1 rounded-md flex items-center gap-1">
            <Bot className="w-3 h-3" /> {t('aiEligibilityEngine')}
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">{t('welfareSchemes')}</h1>
        <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
          {t('browseCentralState')}
        </p>

        {residentProfile && (
          <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {t('verifiedProfileActive')} <strong className="text-white">{residentProfile.name}</strong> ({residentProfile.village})
          </div>
        )}
      </div>

      {/* SEARCH AND CATEGORY FILTER BAR */}
      <div className="space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <button
              type="submit"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 cursor-pointer"
              title={t('search')}
            >
              <Search className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isListening ? (language === 'ta' ? 'கேட்கிறது... தமிழில் பேசவும்' : 'Listening... Speak now') : t('searchSchemesPlaceholder')}
              className={`w-full bg-white dark:bg-slate-900 border rounded-2xl pl-10 pr-24 py-3 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs text-slate-900 dark:text-white transition-all ${
                isListening
                  ? 'border-red-500 ring-2 ring-red-400 placeholder:text-red-500 animate-pulse'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            />
            
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {isPending && <Loader2 className="w-4 h-4 text-blue-600 animate-spin mr-1" />}
              {search && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                  title={t('clearSearch')}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {/* Microphone Voice Search Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isListening
                    ? 'bg-red-500 text-white border-red-600 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
                title={isListening ? t('stopRecording') : `${t('voiceSearch')} (${language === 'ta' ? 'ta-IN' : 'en-IN'})`}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer shrink-0"
          >
            {t('search')}
          </button>
        </form>

        {/* Listening Active Banner */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-center justify-between text-xs text-red-700 dark:text-red-300 font-bold"
            >
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                {language === 'ta' ? '🎙️ தமிழில் பேசவும் (Speaking in Tamil: ta-IN)...' : '🎙️ Speak your search query now (English: en-IN)...'}
              </span>
              <button
                type="button"
                onClick={stopListening}
                className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-[10px] font-black uppercase hover:bg-red-700 cursor-pointer"
              >
                {t('stopRecording')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat
            const catLabel = CATEGORY_TRANSLATIONS[cat]?.[language] || cat
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'
                }`}
              >
                {catLabel}
              </button>
            )
          })}
        </div>
      </div>

      {/* SCHEMES GRID */}
      {filteredSchemes.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-3">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-base">{t('noSchemesFoundTitle')}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">{t('noSchemesFoundDesc')}</p>
          {(search || selectedCategory !== 'All') && (
            <button
              onClick={handleResetAll}
              className="inline-flex items-center gap-1.5 px-4 py-2 mt-2 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-bold hover:bg-blue-100 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> {t('resetAllFilters')}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchemes.map((scheme) => {
            const isBookmarked = !!bookmarked[scheme.id]
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let residentEval: any = null
            if (residentProfile) {
              residentEval = evaluateResidentEligibility(scheme, residentProfile)
            }

            const title = getTranslatedContent(scheme, 'title', language) || scheme.title || scheme.name
            const description = getTranslatedContent(scheme, 'description', language) || scheme.description || scheme.ai_summary
            const category = (language === 'ta' && scheme.category_ta) ? scheme.category_ta : (CATEGORY_TRANSLATIONS[scheme.category]?.ta && language === 'ta' ? CATEGORY_TRANSLATIONS[scheme.category].ta : scheme.category)
            const schemeType = (language === 'ta' && scheme.type_ta) ? scheme.type_ta : (language === 'ta' ? (scheme.type === 'Central Government' ? t('typeCentralGovt') : t('typeStateGovt')) : scheme.type)
            const benefitAmount = (language === 'ta' && scheme.benefit_details_ta?.amount) ? scheme.benefit_details_ta.amount : scheme.benefit_details?.amount
            const benefitFrequency = (language === 'ta' && scheme.benefit_details_ta?.frequency) ? scheme.benefit_details_ta.frequency : scheme.benefit_details?.frequency
            const reqDocs = (language === 'ta' && Array.isArray(scheme.required_documents_ta) && scheme.required_documents_ta.length > 0)
              ? scheme.required_documents_ta
              : scheme.required_documents || []

            return (
              <motion.div
                key={scheme.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Poster & Badges */}
                <Link href={`/schemes/${scheme.id}`} className="relative block group">
                  <img
                    src={scheme.media?.poster_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80'}
                    alt={title}
                    className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                    <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-lg">
                      {category}
                    </span>
                    <span className="bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-lg">
                      {schemeType}
                    </span>
                    {scheme.status === 'upcoming' ? (
                      <span className="bg-amber-500/95 backdrop-blur-md text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs">
                        <Clock className="w-2.5 h-2.5" /> {t('statusUpcoming')}
                      </span>
                    ) : (
                      <span className="bg-emerald-600/95 backdrop-blur-md text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> {t('statusLive')}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleBookmark(scheme.id); }}
                    className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all cursor-pointer ${
                      isBookmarked ? 'bg-amber-500 text-white' : 'bg-slate-900/60 text-white hover:bg-slate-900'
                    }`}
                    title={isBookmarked ? t('bookmarkRemoved') : t('schemeBookmarked')}
                  >
                    <Bookmark className="w-4 h-4 fill-current" />
                  </button>
                </Link>

                {/* Body Content */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <Link href={`/schemes/${scheme.id}`} className="font-extrabold text-base text-slate-900 dark:text-white leading-snug line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      {title}
                    </Link>
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {description}
                    </p>
                  </div>

                  {/* Benefit Banner */}
                  {benefitAmount && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-300">{t('directBenefitTransfer')}</span>
                      <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                        {benefitAmount} {benefitFrequency ? `(${benefitFrequency})` : ''}
                      </span>
                    </div>
                  )}

                  {/* AI Eligibility Badge on Card */}
                  {residentEval && (
                    <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                      residentEval.isEligible
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 font-bold'
                        : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 font-bold'
                    }`}>
                      <span className="flex items-center gap-1.5">
                        {residentEval.isEligible ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-amber-600" />}
                        {t('schemeMatchScore')}: <strong>{residentEval.matchScore}%</strong>
                      </span>
                      <span className="text-[11px] font-black">{residentEval.isEligible ? t('schemeEligible') : t('schemePartiallyEligible')}</span>
                    </div>
                  )}

                  {/* Required Documents Chips */}
                  {reqDocs.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">{t('requiredDocs')}</span>
                      <div className="flex flex-wrap gap-1">
                        {reqDocs.slice(0, 3).map((doc: string) => (
                          <span key={doc} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded">
                            {doc}
                          </span>
                        ))}
                        {reqDocs.length > 3 && (
                          <span className="text-[10px] font-bold text-slate-400">+{reqDocs.length - 3}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <Link
                      href={`/schemes/${scheme.id}`}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Eye className="w-4 h-4" /> {t('viewDetails')} →
                    </Link>

                    <button
                      onClick={() => runAiEligibilityCheck(scheme)}
                      className="w-full py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 border border-blue-200 dark:border-slate-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> {t('checkMyEligibility')}
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
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl overflow-hidden my-8 border border-slate-200 dark:border-slate-800"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {language === 'ta' ? 'கிராமசேவா AI தகுதி சரிபார்ப்பு' : 'GramSeva AI Eligibility Verification'}
                  </span>
                </div>
                <button onClick={() => setSelectedSchemeForAI(null)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Banner */}
              <div className={`p-4 rounded-2xl border space-y-1 ${
                aiEvaluation.isEligible
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider block">
                    {language === 'ta' ? 'முடிவு' : 'Decision Result'}
                  </span>
                  <span className="font-black text-sm">
                    {aiEvaluation.isEligible ? (language === 'ta' ? 'தகுதியுடையவர்' : 'Eligible') : (language === 'ta' ? 'பகுதி தகுதி உள்ளது' : 'Partially Eligible')} ({aiEvaluation.matchScore}%)
                  </span>
                </div>
                <p className="text-xs font-medium leading-relaxed">
                  {aiEvaluation.summary}
                </p>
              </div>

              {/* Criteria Evaluation List */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {t('eligibilityCriteria')}
                </h4>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {aiEvaluation.criteria?.map((item: any, i: number) => (
                    <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl flex items-start gap-3">
                      {item.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 text-xs">
                        <div className="flex justify-between items-center font-bold text-slate-800 dark:text-slate-200">
                          <span>{item.title}</span>
                          <span className={item.passed ? 'text-emerald-600' : 'text-amber-600'}>
                            {item.passed ? (language === 'ta' ? 'பொருந்துகிறது' : 'Passed') : (language === 'ta' ? 'சரிபார்க்கவும்' : 'Pending')}
                          </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 mt-0.5">{item.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center gap-3 pt-2">
                <Link
                  href={`/schemes/${selectedSchemeForAI.id}`}
                  onClick={() => setSelectedSchemeForAI(null)}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black text-center shadow-md transition-all cursor-pointer"
                >
                  {t('viewDetails')} →
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedSchemeForAI(null)}
                  className="px-5 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  {t('close')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
