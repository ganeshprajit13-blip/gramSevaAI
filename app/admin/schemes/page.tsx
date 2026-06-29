'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { PlusCircle, Pencil, FileText, CheckCircle2, Archive, Clock } from 'lucide-react'

interface Scheme { id: string; name: string; category: string; status: string; department: string; created_at: string }

const STATUS_STYLES: Record<string, string> = {
  published: 'bg-green-500/10 text-green-400 border-green-500/20',
  draft: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  archived: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
}

export default function AdminSchemesPage() {
  const [schemes, setSchemes] = useState<Scheme[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/schemes?limit=50').then(r => r.json()).then(d => setSchemes(d.data ?? [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Manage Schemes</h1>
          <p className="page-subtitle">Create, edit, and publish government schemes</p>
        </div>
        <Link href="/admin/schemes/new" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all shadow-sm">
          <PlusCircle className="w-4 h-4" /> New Scheme
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({length:4}).map((_,i)=><div key={i} className="skeleton h-16 rounded-xl"/>)}</div>
      ) : schemes.length === 0 ? (
        <div className="text-center py-16 glass-card">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-bold mb-2">No schemes yet</h3>
          <p className="text-muted-foreground text-sm mb-4">Add your first government scheme to get started</p>
          <Link href="/admin/schemes/new" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium">
            <PlusCircle className="w-4 h-4" /> Create Scheme
          </Link>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/50">
              <tr>
                {['Scheme Name','Category','Department','Status','Actions'].map(h=>(
                  <th key={h} className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {schemes.map((s,i)=>(
                <motion.tr key={s.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.03*i}} className="hover:bg-secondary/30 transition-colors">
                  <td className="p-4 font-medium">{s.name}</td>
                  <td className="p-4 text-muted-foreground">{s.category}</td>
                  <td className="p-4 text-muted-foreground">{s.department}</td>
                  <td className="p-4"><span className={`badge ${STATUS_STYLES[s.status]??STATUS_STYLES.draft}`}>{s.status}</span></td>
                  <td className="p-4">
                    <Link href={`/admin/schemes/${s.id}/edit`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary border border-border text-xs font-medium hover:bg-secondary/80 transition-colors">
                      <Pencil className="w-3 h-3" /> Edit
                    </Link>
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
