'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, MapPin, Briefcase } from 'lucide-react'

interface Resident { id: string; name?: string; email: string; district?: string; occupation?: string; role: string; profile_complete: boolean; created_at: string }

export default function AdminResidentsPage() {
  const [residents, setResidents] = useState<Resident[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/profiles').then(r=>r.json()).then(d=>setResidents(d.data??[])).catch(()=>{}).finally(()=>setLoading(false))
  }, [])

  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      <div>
        <h1 className="page-title">Registered Residents</h1>
        <p className="page-subtitle">View all citizens who have registered on GramSeva AI</p>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({length:5}).map((_,i)=><div key={i} className="skeleton h-16 rounded-xl"/>)}</div>
      ) : residents.length === 0 ? (
        <div className="text-center py-16 glass-card">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-bold mb-2">No residents yet</h3>
          <p className="text-muted-foreground text-sm">Residents will appear here once they sign up and complete their profile.</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/50">
              <tr>
                {['Name','Email','District','Occupation','Profile'].map(h=>(
                  <th key={h} className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {residents.map((r,i)=>(
                <motion.tr key={r.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.03*i}} className="hover:bg-secondary/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                        {r.name?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <span className="font-medium">{r.name ?? '—'}</span>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">{r.email}</td>
                  <td className="p-4">
                    {r.district ? <span className="flex items-center gap-1 text-muted-foreground"><MapPin className="w-3 h-3"/>{r.district}</span> : '—'}
                  </td>
                  <td className="p-4">
                    {r.occupation ? <span className="flex items-center gap-1 text-muted-foreground"><Briefcase className="w-3 h-3"/>{r.occupation}</span> : '—'}
                  </td>
                  <td className="p-4">
                    <span className={`badge ${r.profile_complete ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                      {r.profile_complete ? 'Complete' : 'Incomplete'}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
