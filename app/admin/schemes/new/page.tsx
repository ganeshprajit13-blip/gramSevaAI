'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useAuth } from '@/components/providers/auth-provider'
import RuleBuilder from '@/components/admin/rule-builder'
import { SchemeCategory, SchemeStatus, ApplicationMode, EligibilityRule } from '@/types'

const CATEGORIES: SchemeCategory[] = ['Agriculture', 'Education', 'Health', 'Housing', 'Employment', 'Women', 'Senior Citizen', 'Disability', 'Business', 'Student', 'Other']

export default function NewSchemePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    benefits: '',
    department: '',
    category: 'Agriculture' as SchemeCategory,
    status: 'draft' as SchemeStatus,
    application_deadline: '',
    application_mode: 'Online' as ApplicationMode,
    official_url: '',
    eligibility_summary: '',
  })
  
  const [rules, setRules] = useState<EligibilityRule[]>([])
  const [logic, setLogic] = useState<'AND' | 'OR'>('AND')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.department) {
      toast.error('Please fill required fields (Name, Department)')
      return
    }

    setLoading(true)
    try {
      const payload = {
        ...formData,
        application_deadline: formData.application_deadline || undefined,
        official_url: formData.official_url || undefined,
        benefits: formData.benefits.split('\n').filter(Boolean),
        eligibility_rules: rules,
        eligibility_logic: logic,
      }

      const res = await fetch('/api/schemes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await user?.getIdToken()}`,
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Failed to create scheme')
      
      toast.success('Scheme created successfully!')
      router.push('/admin/schemes')
    } catch (err) {
      toast.error('Error creating scheme')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 pt-8 lg:pt-0 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/schemes" className="p-2 hover:bg-secondary rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="page-title">Create New Scheme</h1>
          <p className="page-subtitle">Add a new government scheme to the platform</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="glass-card p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-semibold border-b border-border pb-2">Basic Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Scheme Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-background border border-input rounded-xl px-4 py-2.5"
                placeholder="e.g. PM Kisan Samman Nidhi"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Department <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-background border border-input rounded-xl px-4 py-2.5"
                placeholder="e.g. Ministry of Agriculture"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as SchemeCategory })}
                className="w-full bg-background border border-input rounded-xl px-4 py-2.5"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as SchemeStatus })}
                className="w-full bg-background border border-input rounded-xl px-4 py-2.5"
              >
                <option value="draft">Draft (Hidden)</option>
                <option value="published">Published (Visible)</option>
              </select>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-background border border-input rounded-xl px-4 py-2.5 resize-none"
                placeholder="Brief description of the scheme..."
              />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-semibold border-b border-border pb-2">Application Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Application Mode</label>
              <select
                value={formData.application_mode}
                onChange={(e) => setFormData({ ...formData, application_mode: e.target.value as ApplicationMode })}
                className="w-full bg-background border border-input rounded-xl px-4 py-2.5"
              >
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Both">Both</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Deadline (Optional)</label>
              <input
                type="date"
                value={formData.application_deadline}
                onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                className="w-full bg-background border border-input rounded-xl px-4 py-2.5"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Official Website URL (Optional)</label>
              <input
                type="url"
                value={formData.official_url}
                onChange={(e) => setFormData({ ...formData, official_url: e.target.value })}
                className="w-full bg-background border border-input rounded-xl px-4 py-2.5"
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Benefits (One per line)</label>
              <textarea
                rows={4}
                value={formData.benefits}
                onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                className="w-full bg-background border border-input rounded-xl px-4 py-2.5 resize-none"
                placeholder="₹6000 per year&#10;Direct bank transfer"
              />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 md:p-8 space-y-6 border-l-4 border-l-primary">
          <div>
            <h2 className="text-lg font-semibold border-b border-border pb-2 mb-2">Eligibility Rules & Automation</h2>
            <p className="text-sm text-muted-foreground mb-6">Define conditions to automatically check if a resident is eligible.</p>
          </div>
          
          <div className="space-y-2 mb-6">
            <label className="text-sm font-medium">Eligibility Summary (Text)</label>
            <textarea
              rows={2}
              value={formData.eligibility_summary}
              onChange={(e) => setFormData({ ...formData, eligibility_summary: e.target.value })}
              className="w-full bg-background border border-input rounded-xl px-4 py-2.5 resize-none"
              placeholder="e.g. For farmers with less than 2 hectares of land."
            />
          </div>

          <RuleBuilder 
            initialRules={rules} 
            initialLogic={logic} 
            onChange={(newRules, newLogic) => {
              setRules(newRules)
              setLogic(newLogic)
            }} 
          />
        </div>

        <div className="flex justify-end gap-4">
          <Link href="/admin/schemes" className="px-6 py-2.5 rounded-xl border border-border font-medium hover:bg-secondary transition-colors">
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Scheme
          </button>
        </div>
      </form>
    </div>
  )
}
