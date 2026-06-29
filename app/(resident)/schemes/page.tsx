'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, Filter, ChevronRight, Clock, ExternalLink, X } from 'lucide-react'

interface Scheme {
  id: string
  name: string
  description?: string
  category: string
  department: string
  status: string
  eligibility_summary?: string
  application_deadline?: string
  application_mode?: string
  image_url?: string
}

const CATEGORIES = ['Agriculture', 'Education', 'Health', 'Housing', 'Employment', 'Women', 'Senior Citizen', 'Disability', 'Business', 'Student', 'Other']

const CATEGORY_COLORS: Record<string, string> = {
  Agriculture: 'bg-green-500/10 text-green-400 border-green-500/20',
  Education: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Health: 'bg-red-500/10 text-red-400 border-red-500/20',
  Housing: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Employment: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Women: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  'Senior Citizen': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Disability: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  Business: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  Student: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Other: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
}

function SchemeCard({ scheme }: { scheme: Scheme }) {
  const colorClass = CATEGORY_COLORS[scheme.category] ?? CATEGORY_COLORS.Other
  return (
    <Link href={`/schemes/${scheme.id}`} className="scheme-card block p-5 space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm leading-tight line-clamp-2 mb-1">{scheme.name}</h3>
          <p className="text-xs text-muted-foreground">{scheme.department}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
      </div>

      {scheme.eligibility_summary && (
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{scheme.eligibility_summary}</p>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <span className={`badge ${colorClass}`}>{scheme.category}</span>
        {scheme.application_mode && (
          <span className="badge bg-secondary text-secondary-foreground border-border">{scheme.application_mode}</span>
        )}
        {scheme.application_deadline && (
          <span className="badge bg-secondary text-secondary-foreground border-border flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(scheme.application_deadline).toLocaleDateString('en-IN')}
          </span>
        )}
      </div>
    </Link>
  )
}

function SkeletonCard() {
  return (
    <div className="glass-card p-5 space-y-3">
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-3 w-1/2" />
      <div className="skeleton h-8 w-full" />
      <div className="flex gap-2">
        <div className="skeleton h-5 w-20 rounded-full" />
        <div className="skeleton h-5 w-16 rounded-full" />
      </div>
    </div>
  )
}

export default function SchemesPage() {
  const searchParams = useSearchParams()
  const [schemes, setSchemes] = useState<Scheme[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') ?? '')
  const [showFilters, setShowFilters] = useState(false)

  const fetchSchemes = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (selectedCategory) params.set('category', selectedCategory)
      params.set('status', 'published')
      const res = await fetch(`/api/schemes?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setSchemes(data.data ?? [])
      }
    } catch {
      // Supabase not configured yet — show empty state
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSchemes() }, [search, selectedCategory])

  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      <div>
        <h1 className="page-title">Browse Schemes</h1>
        <p className="page-subtitle">All published government schemes — search, filter, and apply</p>
      </div>

      {/* Search + filter bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search schemes by name, keyword, or benefit…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-secondary border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
            showFilters || selectedCategory ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-secondary border-border text-foreground'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filter
          {selectedCategory && <span className="w-2 h-2 rounded-full bg-primary" />}
        </button>
      </div>

      {/* Category filter pills */}
      {showFilters && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              !selectedCategory ? 'bg-primary text-primary-foreground border-transparent' : 'bg-secondary border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                selectedCategory === cat ? 'bg-primary text-primary-foreground border-transparent' : 'bg-secondary border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : schemes.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="font-bold text-lg mb-2">No schemes found</h3>
          <p className="text-muted-foreground text-sm mb-4">
            {search || selectedCategory
              ? 'Try a different search term or category'
              : 'No published schemes yet. Check back soon!'}
          </p>
          {(search || selectedCategory) && (
            <button
              onClick={() => { setSearch(''); setSelectedCategory('') }}
              className="text-sm text-primary font-medium hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{schemes.length} scheme{schemes.length !== 1 ? 's' : ''} found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {schemes.map((scheme, i) => (
              <motion.div key={scheme.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * i }}>
                <SchemeCard scheme={scheme} />
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
