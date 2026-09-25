'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, Calendar, Clock, MapPin, Phone, Users, ShieldAlert,
  Search, Filter, ExternalLink, X, Building2, CheckCircle2, Info
} from 'lucide-react'
import { useLanguage } from '@/components/providers/language-provider'
import { getStoredAnnouncements, type AnnouncementRecord } from '@/lib/announcement-store'

const CATEGORIES = [
  'All', 'Gram Sabha', 'Health Camp', 'Awareness Rally',
  'Crop Subsidy Distribution', 'Public Works', 'Emergency Alert', 'Other'
]

export default function ResidentAnnouncementsPage() {
  const { language, t } = useLanguage()
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [selectedAnnouncementModal, setSelectedAnnouncementModal] = useState<AnnouncementRecord | null>(null)

  const loadAnnouncements = () => {
    const data = getStoredAnnouncements().filter(a => a.status === 'Published' || a.isActive)
    setAnnouncements(data)
  }

  useEffect(() => {
    loadAnnouncements()
    window.addEventListener('gramseva_announcements_updated', loadAnnouncements)
    return () => window.removeEventListener('gramseva_announcements_updated', loadAnnouncements)
  }, [])

  const filtered = announcements.filter(a => {
    const matchesCategory = selectedCategory === 'All' || a.category === selectedCategory
    const matchesSearch = search === '' ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.venue ?? '').toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="space-y-6 pt-6 pb-20 max-w-6xl mx-auto px-4 md:px-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white space-y-3 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="bg-teal-500/20 text-teal-300 border border-teal-400/30 text-[10px] font-black uppercase px-2.5 py-1 rounded-md">
            {language === 'en' ? 'Official Gram Panchayat Broadcasting' : 'அதிகாரப்பூர்வ கிராம ஊராட்சி அறிவிப்புகள்'}
          </span>
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black uppercase px-2.5 py-1 rounded-md">
            {language === 'en' ? 'Live Village Events' : 'நேரடி கிராம நிகழ்வுகள்'}
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">{t('announcementsTitle')}</h1>
        <p className="text-xs md:text-sm text-slate-300 max-w-xl leading-relaxed">
          {t('announcementsSubtitle')}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchAnnouncementsPlaceholder')}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-10 py-3 text-xs sm:text-sm font-semibold shadow-xs"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map(cat => {
            const label = cat === 'All'
              ? t('all')
              : cat === 'Gram Sabha'
              ? (language === 'en' ? 'Gram Sabha' : 'கிராம சபை')
              : cat === 'Health Camp'
              ? (language === 'en' ? 'Health Camp' : 'மருத்துவ முகாம்')
              : cat === 'Awareness Rally'
              ? (language === 'en' ? 'Awareness Rally' : 'விழிப்புணர்வு பேரணி')
              : cat === 'Crop Subsidy Distribution'
              ? (language === 'en' ? 'Crop Subsidy Distribution' : 'பயிர் மானிய விநியோகம்')
              : cat === 'Public Works'
              ? (language === 'en' ? 'Public Works' : 'பொதுப்பணிகள்')
              : cat === 'Emergency Alert'
              ? (language === 'en' ? 'Emergency Alert' : 'அவசரகால எச்சரிக்கை')
              : t('catOther')

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#0F766E] text-white border-[#0F766E] shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ANNOUNCEMENTS GRID */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xs">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-base mb-1">
            {t('noAnnouncementsFound')}
          </h3>
          <p className="text-xs text-slate-500">
            {language === 'en' ? 'There are no active village announcements matching your filter.' : 'உங்கள் தேர்வுக்குரிய அறிவிப்புகள் ஏதுமில்லை.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map(anc => {
            const title = language === 'ta' && (anc as any).title_ta ? (anc as any).title_ta : anc.title
            const desc = language === 'ta' && (anc as any).description_ta ? (anc as any).description_ta : anc.description

            return (
              <motion.div
                key={anc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                {anc.image_url && (
                  <img
                    src={anc.image_url}
                    alt={title}
                    className="w-full h-44 object-cover"
                  />
                )}

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="bg-teal-100 dark:bg-teal-950/40 text-[#0F766E] dark:text-teal-400 text-[10px] font-black uppercase px-2.5 py-1 rounded-md">
                        {anc.category || t('announcements')}
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#0F766E]" /> {anc.date || (anc.createdAt ? anc.createdAt.split('T')[0] : '2026-08-05')}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 leading-snug">{title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">{desc}</p>
                  </div>

                  {/* Details Grid */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    {anc.start_time && (
                      <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold">
                        <span className="flex items-center gap-1.5 text-slate-500"><Clock className="w-3.5 h-3.5 text-[#0F766E]" /> {t('eventTime')}:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{anc.start_time} - {anc.end_time || '01:00 PM'}</span>
                      </div>
                    )}

                    {anc.venue && (
                      <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold">
                        <span className="flex items-center gap-1.5 text-slate-500"><MapPin className="w-3.5 h-3.5 text-emerald-600" /> {t('eventVenue')}:</span>
                        <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{anc.venue}</span>
                      </div>
                    )}

                    {anc.eligibility_restrictions && (
                      <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-[11px] text-amber-900 dark:text-amber-300 font-semibold flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        <span>{t('eventRestrictions')}: <strong>{anc.eligibility_restrictions}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedAnnouncementModal(anc)}
                      className="flex-1 py-2.5 bg-[#0F766E] hover:bg-[#0d645e] text-white rounded-xl text-xs font-black transition-all text-center cursor-pointer shadow-xs"
                    >
                      {language === 'en' ? 'View Full Announcement Details' : 'முழு விவரங்களைக் காண்க'}
                    </button>

                    {anc.maps_link && (
                      <a
                        href={anc.maps_link}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 rounded-xl text-xs font-bold flex items-center gap-1"
                      >
                        <MapPin className="w-4 h-4" /> {language === 'en' ? 'Map' : 'வரைபடம்'}
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* ── DETAIL MODAL ── */}
      <AnimatePresence>
        {selectedAnnouncementModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAnnouncementModal(null)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl z-10 border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {language === 'ta' && (selectedAnnouncementModal as any).title_ta
                    ? (selectedAnnouncementModal as any).title_ta
                    : selectedAnnouncementModal.title}
                </h3>
                <button onClick={() => setSelectedAnnouncementModal(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {language === 'ta' && (selectedAnnouncementModal as any).description_ta
                  ? (selectedAnnouncementModal as any).description_ta
                  : selectedAnnouncementModal.description}
              </p>

              <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <p><strong>{t('eventVenue')}:</strong> {selectedAnnouncementModal.venue || 'Gram Panchayat Community Hall'}</p>
                <p><strong>{t('eventDate')}:</strong> {selectedAnnouncementModal.date || '2026-08-05'}</p>
                <p><strong>{t('eventTime')}:</strong> {selectedAnnouncementModal.start_time || '10:00 AM'} - {selectedAnnouncementModal.end_time || '01:00 PM'}</p>
                <p><strong>{t('eventOrganizer')}:</strong> {selectedAnnouncementModal.organizer || 'Block Development Officer (BDO)'}</p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedAnnouncementModal(null)}
                  className="px-4 py-2 bg-[#0F766E] text-white text-xs font-bold rounded-xl"
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
