'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldAlert, Plus, CheckCircle2, Clock, AlertTriangle, XCircle,
  FileText, MessageSquare, ArrowLeft, Loader2, Sparkles, Send, X,
  Building2, MapPin, Phone
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/components/providers/auth-provider'
import {
  getStoredComplaints, createComplaint, type ComplaintRecord
} from '@/lib/complaint-store'
import { getStoredResidents, type ResidentRecord } from '@/lib/resident-store'

const CATEGORIES = [
  'Drinking Water & Sanitation',
  'Roads & Streetlights',
  'Agricultural Supply & Irrigation',
  'Welfare Scheme Benefit Dispute',
  'Public Distribution System (Ration)',
  'Health & Hygiene',
  'Other'
]

const STATUS_BADGES: Record<string, { bg: string; text: string; icon: any }> = {
  Pending: { bg: 'bg-amber-100 text-amber-800 border-amber-300', text: 'Pending BDO Review 🟡', icon: Clock },
  Accepted: { bg: 'bg-blue-100 text-blue-800 border-blue-300', text: 'Accepted by BDO 🟢', icon: CheckCircle2 },
  'In Progress': { bg: 'bg-purple-100 text-purple-800 border-purple-300', text: 'Work In Progress 🔵', icon: Loader2 },
  Resolved: { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', text: 'Resolved ✅', icon: CheckCircle2 },
  Rejected: { bg: 'bg-red-100 text-red-800 border-red-300', text: 'Rejected 🔴', icon: XCircle }
}

export default function ResidentComplaintsPage() {
  const { user } = useAuth()
  const [complaints, setComplaints] = useState<ComplaintRecord[]>([])
  const [resident, setResident] = useState<ResidentRecord | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [category, setCategory] = useState<ComplaintRecord['category']>('Drinking Water & Sanitation')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [village, setVillage] = useState('Chinnamanur')
  const [wardNumber, setWardNumber] = useState('Ward 3')
  const [attachmentUrl, setAttachmentUrl] = useState('')

  const loadData = () => {
    const allComplaints = getStoredComplaints()
    setComplaints(allComplaints)

    if (user?.uid) {
      const residents = getStoredResidents()
      const found = residents.find(r => r.firebase_uid === user.uid)
      if (found) {
        setResident(found)
        setVillage(found.village || 'Chinnamanur')
        setWardNumber(found.ward_number || 'Ward 3')
      }
    }
  }

  useEffect(() => {
    loadData()
    window.addEventListener('gramseva_complaints_updated', loadData)
    window.addEventListener('gramseva_resident_db_updated', loadData)
    return () => {
      window.removeEventListener('gramseva_complaints_updated', loadData)
      window.removeEventListener('gramseva_resident_db_updated', loadData)
    }
  }, [user])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      toast.error('Please enter a complaint title and description.')
      return
    }

    setSubmitting(true)
    try {
      createComplaint({
        resident_uid: user?.uid || 'demo_uid',
        resident_name: resident?.name || 'Resident Applicant',
        resident_mobile: resident?.mobile || '9876543210',
        village,
        ward_number: wardNumber,
        category,
        title,
        description,
        attachment_url: attachmentUrl || undefined
      })

      toast.success('🎉 Grievance / Complaint Submitted to BDO Office!')
      setShowModal(false)
      setTitle('')
      setDescription('')
      setAttachmentUrl('')
    } catch (err) {
      toast.error('Failed to submit complaint.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 pt-6 pb-20 max-w-6xl mx-auto px-4 md:px-6">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-red-900 via-rose-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white space-y-3 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-red-500/20 text-red-300 border border-red-400/30 text-[10px] font-black uppercase px-2.5 py-1 rounded-md">
              Public Grievance Redressal Mechanism
            </span>
            <span className="bg-rose-500/20 text-rose-300 border border-rose-400/30 text-[10px] font-black uppercase px-2.5 py-1 rounded-md">
              Direct BDO Access
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Village Grievances & Complaints</h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-xl">
            Lodge complaints regarding drinking water, streetlights, ration shop disputes, or scheme delays. Track live BDO officer inspection remarks in real-time.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 flex-shrink-0"
        >
          <Plus className="w-4 h-4" /> Lodge New Complaint
        </button>
      </div>

      {/* COMPLAINTS LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">My Registered Complaints & Status</h2>
          <span className="text-xs text-slate-500 font-bold">{complaints.length} Total Complaints</span>
        </div>

        {complaints.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8 shadow-xs">
            <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-extrabold text-slate-800 text-base mb-1">No Complaints Submitted</h3>
            <p className="text-xs text-slate-500 mb-4">Have an issue in your village? Lodge a direct grievance to the Block Development Officer.</p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl text-xs font-black shadow-xs"
            >
              <Plus className="w-4 h-4" /> Lodge Complaint Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map(cmp => {
              const badge = STATUS_BADGES[cmp.status] || STATUS_BADGES.Pending
              const BadgeIcon = badge.icon

              return (
                <motion.div
                  key={cmp.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {cmp.id}
                      </span>
                      <span className="bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                        {cmp.category}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        {cmp.village} ({cmp.ward_number})
                      </span>
                    </div>

                    <span className={`px-3 py-1 rounded-full border text-xs font-extrabold flex items-center gap-1.5 w-fit ${badge.bg}`}>
                      <BadgeIcon className="w-3.5 h-3.5" />
                      {badge.text}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-extrabold text-base text-slate-900">{cmp.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{cmp.description}</p>
                  </div>

                  {cmp.attachment_url && (
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 text-xs font-bold text-blue-600">
                      <FileText className="w-4 h-4" />
                      <a href={cmp.attachment_url} target="_blank" rel="noreferrer" className="hover:underline">
                        View Uploaded Photo Proof Attachment
                      </a>
                    </div>
                  )}

                  {/* BDO Officer Remarks Box */}
                  {cmp.bdo_remarks && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                        <Building2 className="w-4 h-4 text-blue-600" /> BDO Officer Remarks & Action Taken:
                      </div>
                      <p className="text-xs text-slate-700 font-medium italic pl-5">
                        "{cmp.bdo_remarks}"
                      </p>
                      <span className="text-[9px] text-slate-400 block pt-1 pl-5">Updated: {new Date(cmp.updated_at).toLocaleString()}</span>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* SUBMIT COMPLAINT MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl overflow-hidden my-8"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                  <h3 className="font-extrabold text-base text-slate-900">Lodge Official Grievance / Complaint</h3>
                </div>
                <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Complaint Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Complaint Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Disrupted drinking water supply in Ward 3"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Village</label>
                    <input
                      type="text"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Ward Number</label>
                    <input
                      type="text"
                      value={wardNumber}
                      onChange={(e) => setWardNumber(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Detailed Description & Evidence</label>
                  <textarea
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide specific location details, duration of problem, and how many households are impacted..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Photo / Document Proof URL (Optional)</label>
                  <input
                    type="text"
                    value={attachmentUrl}
                    onChange={(e) => setAttachmentUrl(e.target.value)}
                    placeholder="Paste image or photo proof URL here..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Submit Complaint
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
