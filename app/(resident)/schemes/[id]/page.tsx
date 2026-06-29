'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, CheckCircle2, XCircle, AlertCircle, 
  MapPin, Clock, FileText, Globe, Building2, Loader2, Play
} from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'
import { Scheme, EligibilityResult } from '@/types'
import { formatCurrency, formatDate, getCategoryColor } from '@/utils'

export default function ResidentSchemeDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user, profile } = useAuth()
  const [scheme, setScheme] = useState<Scheme | null>(null)
  const [loading, setLoading] = useState(true)
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    fetch(`/api/schemes/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.data) setScheme(d.data)
      })
      .finally(() => setLoading(false))
  }, [id])

  const checkEligibility = async () => {
    setChecking(true)
    try {
      const res = await fetch(`/api/eligibility/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await user?.getIdToken()}`
        },
        body: JSON.stringify(profile || {})
      })
      const data = await res.json()
      if (data.data) {
        setEligibility(data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setChecking(false)
    }
  }

  if (loading) return <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>
  if (!scheme) return <div className="p-12 text-center">Scheme not found.</div>

  const colorClass = getCategoryColor(scheme.category)

  return (
    <div className="space-y-6 pt-8 lg:pt-0 max-w-4xl mx-auto pb-16">
      <Link href="/schemes" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Schemes
      </Link>

      <div className="glass-card overflow-hidden">
        <div className="p-6 sm:p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-b border-border">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`badge ${colorClass}`}>{scheme.category}</span>
            {scheme.application_mode && (
              <span className="badge bg-secondary text-secondary-foreground border-border">{scheme.application_mode}</span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 leading-tight">{scheme.name}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5"><Building2 className="w-4 h-4" /> {scheme.department}</div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {/* Eligibility Section */}
          <div className="bg-secondary/30 rounded-2xl p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold">Eligibility Check</h3>
                <p className="text-sm text-muted-foreground">Check if your profile matches the requirements</p>
              </div>
              <button 
                onClick={checkEligibility} 
                disabled={checking}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {eligibility ? 'Re-check' : 'Check Now'}
              </button>
            </div>

            {eligibility && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-4 border-t border-border">
                <div className={`flex items-start gap-3 p-4 rounded-xl mb-4 ${eligibility.eligible ? 'bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400'}`}>
                  {eligibility.eligible ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                  <div>
                    <h4 className="font-bold">{eligibility.eligible ? 'You appear to be eligible!' : 'You may not be eligible'}</h4>
                    <p className="text-sm opacity-90 mt-1">{eligibility.summary}</p>
                  </div>
                </div>

                {eligibility.results.length > 0 && (
                  <div className="space-y-2">
                    {eligibility.results.map((r, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm p-2 rounded-lg bg-background border border-border">
                        {r.passed ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                        <span className="flex-1">{r.explanation}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-3">About this scheme</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{scheme.description || 'No description available.'}</p>
              </div>

              {scheme.benefits && scheme.benefits.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-3">Key Benefits</h3>
                  <ul className="space-y-2">
                    {scheme.benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="glass-card p-5 space-y-4">
                <h3 className="font-bold border-b border-border pb-2">Important Details</h3>
                
                {scheme.application_deadline && (
                  <div className="flex gap-3 text-sm">
                    <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="font-medium">Deadline</p>
                      <p className="text-muted-foreground">{formatDate(scheme.application_deadline)}</p>
                    </div>
                  </div>
                )}

                {scheme.official_url && (
                  <div className="flex gap-3 text-sm">
                    <Globe className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="font-medium">Official Website</p>
                      <a href={scheme.official_url} target="_blank" rel="noreferrer" className="text-primary hover:underline line-clamp-1">
                        {scheme.official_url}
                      </a>
                    </div>
                  </div>
                )}

                <div className="pt-4 mt-4 border-t border-border">
                  <a 
                    href={scheme.official_url || '#'} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-center w-full py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:opacity-90 transition-opacity"
                  >
                    Apply Now
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
