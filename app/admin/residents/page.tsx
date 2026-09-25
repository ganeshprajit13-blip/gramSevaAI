'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, MapPin, Briefcase, ShieldCheck, CheckCircle2, XCircle, Clock,
  Filter, Search, Eye, FileText, Download, AlertCircle, Sparkles, Building2, Lock
} from 'lucide-react'
import { toast } from 'sonner'
import {
  getStoredResidents, updateVerificationStatus, computeCentralMetrics,
  type ResidentRecord, type VerificationStatus
} from '@/lib/resident-store'

export default function AdminResidentsPage() {
  const [residents, setResidents] = useState<ResidentRecord[]>([])
  const [filterStatus, setFilterStatus] = useState<string>('All')
  const [filterVillage, setFilterVillage] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedResident, setSelectedResident] = useState<ResidentRecord | null>(null)
  const [remarksInput, setRemarksInput] = useState<string>('')

  const loadData = () => {
    const data = getStoredResidents()
    setResidents([...data])
  }

  useEffect(() => {
    loadData()
    window.addEventListener('gramseva_resident_db_updated', loadData)
    return () => window.removeEventListener('gramseva_resident_db_updated', loadData)
  }, [])

  const handleVerify = (id: string, status: VerificationStatus) => {
    const updated = updateVerificationStatus(id, status, remarksInput)
    if (updated) {
      toast.success(`Resident ${updated.name} verification set to ${status}!`)
      setSelectedResident(null)
      setRemarksInput('')
      loadData()
    }
  }

  // Filter residents
  const filteredResidents = residents.filter(r => {
    if (filterStatus !== 'All' && r.verification_status !== filterStatus) return false
    if (filterVillage !== 'All' && r.village !== filterVillage) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || r.family_id.toLowerCase().includes(q) || r.aadhaar.includes(q)
    }
    return true
  })

  const metrics = computeCentralMetrics(false)

  return (
    <div className="space-y-6 pt-4 min-h-screen">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-[#0d3a1f] via-[#14532d] to-[#0f766e] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800/40 relative overflow-hidden">
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
                  BDO Admin Verification Portal
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                Centralized Resident Database
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-xl leading-relaxed">
                Real-time verified resident database. Approve or reject verification requests based on uploaded official documents. Direct admin editing of demographic statistics is disabled to preserve data integrity.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 text-center min-w-[100px]">
              <p className="text-[10px] text-emerald-200 uppercase font-bold">Total</p>
              <p className="text-xl font-black text-white font-mono">{residents.length}</p>
            </div>
            <div className="bg-emerald-500/20 backdrop-blur-md rounded-2xl p-3 border border-emerald-400/30 text-center min-w-[100px]">
              <p className="text-[10px] text-emerald-200 uppercase font-bold">Verified</p>
              <p className="text-xl font-black text-emerald-300 font-mono">{metrics.verifiedCount}</p>
            </div>
            <div className="bg-amber-500/20 backdrop-blur-md rounded-2xl p-3 border border-amber-400/30 text-center min-w-[100px]">
              <p className="text-[10px] text-amber-200 uppercase font-bold">Pending</p>
              <p className="text-xl font-black text-amber-300 font-mono">{metrics.pendingVerifications}</p>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search Name, Family ID, Aadhaar..."
              className="w-full pl-9 pr-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <Filter className="w-3.5 h-3.5" /> Status:
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-2 py-1 text-xs font-bold bg-slate-100 border border-slate-200 rounded-lg"
            >
              <option value="All">All Statuses</option>
              <option value="Verified">Verified 🟢</option>
              <option value="Pending">Pending Verification 🟡</option>
              <option value="Rejected">Rejected 🔴</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
            Village:
            <select
              value={filterVillage}
              onChange={e => setFilterVillage(e.target.value)}
              className="px-2 py-1 text-xs font-bold bg-slate-100 border border-slate-200 rounded-lg"
            >
              <option value="All">All Villages</option>
              {['Kumarpuram', 'Sakthinagar', 'Vetrikovil', 'Mullaivayal', 'Kaligapuram', 'Periyakadu', 'Ariyanayagi', 'Kaviyarkulam'].map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-bold">Direct Demographic Edits Disabled</span>
          <Lock className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>

      {/* TABLE OF RESIDENTS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Resident Info</th>
                <th className="p-4">Village &amp; Ward</th>
                <th className="p-4">Aadhaar / Family ID</th>
                <th className="p-4">Occupation &amp; Income</th>
                <th className="p-4">Profile Score</th>
                <th className="p-4">Verification Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResidents.map((r, i) => {
                const statusBadge = {
                  Verified: 'bg-green-100 text-green-700 border-green-300',
                  Pending: 'bg-amber-100 text-amber-700 border-amber-300',
                  Rejected: 'bg-red-100 text-red-700 border-red-300',
                }[r.verification_status]

                return (
                  <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {r.photo_url ? (
                          <img src={r.photo_url} alt={r.name} className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-black flex items-center justify-center text-xs">
                            {r.name[0]}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-800">{r.name}</p>
                          <p className="text-[10px] text-slate-400">{r.email}</p>
                          <span className="text-[9px] font-semibold text-slate-500">{r.gender}, {r.age} yrs</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <p className="font-semibold text-slate-700">{r.village}</p>
                      <p className="text-[10px] text-slate-400">Ward {r.ward_number}</p>
                    </td>

                    <td className="p-4">
                      <p className="font-mono text-slate-700 font-bold">{r.aadhaar}</p>
                      <p className="font-mono text-[10px] text-slate-400">{r.family_id}</p>
                    </td>

                    <td className="p-4">
                      <p className="font-semibold text-slate-700">{r.occupation}</p>
                      <p className="text-[10px] text-slate-400">₹{r.annual_income?.toLocaleString()}/yr</p>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-800">{r.profile_completion_score}%</span>
                        <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: `${r.profile_completion_score}%` }} />
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusBadge}`}>
                        {r.verification_status === 'Verified' ? '✓ Verified' : r.verification_status === 'Pending' ? '⏳ Pending' : '✕ Rejected'}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedResident(r)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> Inspect Proofs
                      </button>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECTION & VERIFICATION MODAL */}
      <AnimatePresence>
        {selectedResident && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-200 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl"
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-black flex items-center justify-center text-lg">
                    {selectedResident.name[0]}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">{selectedResident.name}</h2>
                    <p className="text-xs text-slate-500">{selectedResident.email} · {selectedResident.village}, Ward {selectedResident.ward_number}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedResident(null)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
              </div>

              {/* DEMOGRAPHICS PREVIEW */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <div><span className="text-slate-400 block text-[10px]">Aadhaar</span><b className="font-mono">{selectedResident.aadhaar}</b></div>
                <div><span className="text-slate-400 block text-[10px]">Family ID</span><b className="font-mono">{selectedResident.family_id}</b></div>
                <div><span className="text-slate-400 block text-[10px]">Occupation</span><b>{selectedResident.occupation}</b></div>
                <div><span className="text-slate-400 block text-[10px]">Annual Income</span><b>₹{selectedResident.annual_income?.toLocaleString()}</b></div>
                <div><span className="text-slate-400 block text-[10px]">Education</span><b>{selectedResident.education}</b></div>
                <div><span className="text-slate-400 block text-[10px]">SHG Member</span><b>{selectedResident.shg_member ? 'Yes (' + selectedResident.shg_name + ')' : 'No'}</b></div>
              </div>

              {/* UPLOADED DOCUMENTS */}
              <div>
                <p className="text-xs font-bold text-slate-700 mb-2 uppercase">Uploaded Document Proofs</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(selectedResident.documents || {}).map(([key, doc]) => (
                    doc?.status === 'Uploaded' ? (
                      <div key={key} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl text-xs">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-slate-700 capitalize">{key.replace('_', ' ')}</span>
                        </div>
                        <span className="text-[10px] font-bold text-green-700">✓ Uploaded</span>
                      </div>
                    ) : null
                  ))}
                </div>
              </div>

              {/* VERIFICATION ACTIONS */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-700">BDO Verification Decision</p>
                <input
                  value={remarksInput}
                  onChange={e => setRemarksInput(e.target.value)}
                  placeholder="Enter verification remarks (optional)..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => handleVerify(selectedResident.id, 'Verified')}
                    className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    ✓ Approve &amp; Verify Resident
                  </button>
                  <button
                    onClick={() => handleVerify(selectedResident.id, 'Rejected')}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    ✕ Reject Verification
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
