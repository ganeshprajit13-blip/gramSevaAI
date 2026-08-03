'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, Calendar, Clock, MapPin, Phone, Users, ShieldAlert,
  Search, Filter, ExternalLink, X, Building2, CheckCircle2, Info
} from 'lucide-react'
import { getStoredAnnouncements, type AnnouncementRecord } from '@/lib/announcement-store'

const CATEGORIES = [
  'All', 'Gram Sabha', 'Health Camp', 'Awareness Rally',
  'Crop Subsidy Distribution', 'Public Works', 'Emergency Alert', 'Other'
]

export default function ResidentAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [selectedAnnouncementModal, setSelectedAnnouncementModal] = useState<AnnouncementRecord | null>(null)

  const loadAnnouncements = () => {
    const data = getStoredAnnouncements().filter(a => a.status === 'Published')
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
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white space-y-3 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-black uppercase px-2.5 py-1 rounded-md">
            Official Gram Panchayat Broadcasting
          </span>
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black uppercase px-2.5 py-1 rounded-md">
            Live Village Events
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">Village Public Announcements</h1>
        <p className="text-xs md:text-sm text-slate-300 max-w-xl">
          Gram Sabha schedule, health camps, subsidy distributions, and emergency village notices published directly by the Block Development Officer (BDO).
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
              placeholder="Search announcements by title, venue, or keyword..."
              className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-10 py-3 text-xs font-semibold shadow-xs"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ANNOUNCEMENTS GRID */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8 shadow-xs">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-extrabold text-slate-800 text-base mb-1">No Announcements Found</h3>
          <p className="text-xs text-slate-500">There are no active village announcements matching your filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map(anc => (
            <motion.div
              key={anc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              {anc.image_url && (
                <img
                  src={anc.image_url}
                  alt={anc.title}
                  className="w-full h-44 object-cover"
                />
              )}

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-md">
                      {anc.category}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-blue-600" /> {anc.date}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900 leading-snug">{anc.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{anc.description}</p>
                </div>

                {/* Details Grid */}
                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center justify-between text-slate-700 font-semibold">
                    <span className="flex items-center gap-1.5 text-slate-500"><Clock className="w-3.5 h-3.5 text-blue-600" /> Time:</span>
                    <span className="font-bold text-slate-900">{anc.start_time} - {anc.end_time}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-700 font-semibold">
                    <span className="flex items-center gap-1.5 text-slate-500"><MapPin className="w-3.5 h-3.5 text-emerald-600" /> Venue:</span>
                    <span className="font-bold text-slate-900 truncate max-w-[200px]">{anc.venue}</span>
                  </div>

                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 font-semibold flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span>Restrictions: <strong>{anc.eligibility_restrictions}</strong></span>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedAnnouncementModal(anc)}
                    className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-all text-center"
                  >
                    View Full Announcement Details
                  </button>

                  {anc.maps_link && (
                    <a
                      href={anc.maps_link}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold flex items-center gap-1"
                    >
                      <MapPin className="w-4 h-4" /> Map
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* FULL ANNOUNCEMENT MODAL */}
      <AnimatePresence>
        {selectedAnnouncementModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl overflow-hidden my-8"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-black text-blue-600 uppercase tracking-wider">Official Village Notice</span>
                <button onClick={() => setSelectedAnnouncementModal(null)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {selectedAnnouncementModal.image_url && (
                  <img src={selectedAnnouncementModal.image_url} alt="" className="w-full h-48 object-cover rounded-2xl" />
                )}

                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                    {selectedAnnouncementModal.category}
                  </span>
                  <h3 className="text-xl font-black text-slate-900">{selectedAnnouncementModal.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{selectedAnnouncementModal.description}</p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                  <div className="flex justify-between"><span className="font-bold text-slate-500">Date & Time:</span> <span className="font-extrabold text-slate-900">{selectedAnnouncementModal.date} ({selectedAnnouncementModal.start_time} - {selectedAnnouncementModal.end_time})</span></div>
                  <div className="flex justify-between"><span className="font-bold text-slate-500">Venue:</span> <span className="font-extrabold text-slate-900">{selectedAnnouncementModal.venue}</span></div>
                  <div className="flex justify-between"><span className="font-bold text-slate-500">Village/Ward:</span> <span className="font-bold text-slate-900">{selectedAnnouncementModal.village} ({selectedAnnouncementModal.ward_number})</span></div>
                  <div className="flex justify-between"><span className="font-bold text-slate-500">Target Group:</span> <span className="font-bold text-amber-700">{selectedAnnouncementModal.eligibility_restrictions}</span></div>
                  <div className="flex justify-between"><span className="font-bold text-slate-500">Organizer:</span> <span className="font-bold text-slate-900">{selectedAnnouncementModal.organizer}</span></div>
                  <div className="flex justify-between"><span className="font-bold text-slate-500">Contact Helpline:</span> <span className="font-bold text-blue-600">{selectedAnnouncementModal.contact_number}</span></div>
                </div>

                {selectedAnnouncementModal.maps_link && (
                  <a
                    href={selectedAnnouncementModal.maps_link}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 bg-emerald-600 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-xs"
                  >
                    <MapPin className="w-4 h-4" /> Open Venue Directions on Google Maps
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
