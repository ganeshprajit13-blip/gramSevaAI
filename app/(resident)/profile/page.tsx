'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, MapPin, Briefcase, GraduationCap, Users, Heart, Save, Loader2, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'
import { toast } from 'sonner'
import { upsertProfile } from '@/actions/auth'

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    age: profile?.age || '',
    gender: profile?.gender || 'Prefer not to say',
    village: profile?.village || '',
    district: profile?.district || '',
    occupation: profile?.occupation || '',
    annual_income: profile?.annual_income || '',
    community: profile?.community || 'General',
    education: profile?.education || 'Secondary',
    marital_status: profile?.marital_status || 'Single',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = await user?.getIdToken()
      if (!token) throw new Error('Not authenticated')
      
      const payload = {
        ...formData,
        age: parseInt(formData.age as string) || 0,
        annual_income: parseInt(formData.annual_income as string) || 0,
        profile_complete: true
      }
      
      await upsertProfile(token, payload as any)
      
      // Update local storage mock session if exists
      const mockSession = localStorage.getItem('gramseva_mock_session')
      if (mockSession) {
        const session = JSON.parse(mockSession)
        session.profile = { ...session.profile, ...payload }
        localStorage.setItem('gramseva_mock_session', JSON.stringify(session))
      }
      
      await refreshProfile()
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 pt-2 lg:pt-0 max-w-5xl mx-auto pb-16">
      <div className="page-shell space-y-2">
        <div className="eyebrow">Resident Profile</div>
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Keep your information updated for the best scheme recommendations</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="glass-card p-6 text-center shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/15 to-emerald-500/10 flex items-center justify-center mx-auto mb-4 border-4 border-background shadow-xl">
              <User className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-bold text-lg">{profile?.name || 'Resident'}</h3>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
            
            <div className="mt-4 pt-4 border-t border-border flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium">
              <ShieldCheck className="w-4 h-4" /> Account Verified
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
            <h3 className="text-lg font-bold mb-6 border-b border-border pb-2">Personal Information</h3>
            
            <div className="grid sm:grid-cols-2 gap-5 mb-8">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input aria-label="Full name" type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="field-shell !pl-10 pr-4" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Age</label>
                <input aria-label="Age" type="number" required value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} className="field-shell" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Gender</label>
                <select aria-label="Gender" value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })} className="field-shell">
                  {['Male', 'Female', 'Other', 'Prefer not to say'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Community</label>
                <select aria-label="Community" value={formData.community} onChange={(e) => setFormData({ ...formData, community: e.target.value as any })} className="field-shell">
                  {['General', 'OBC', 'SC', 'ST', 'Other'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <h3 className="text-lg font-bold mb-6 border-b border-border pb-2">Location & Occupation</h3>
            <div className="grid sm:grid-cols-2 gap-5 mb-8">
              <div className="space-y-2">
                <label className="text-sm font-medium">District</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input aria-label="District" type="text" required value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })} className="field-shell !pl-10 pr-4" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Village / Town</label>
                <input aria-label="Village or town" type="text" required value={formData.village} onChange={(e) => setFormData({ ...formData, village: e.target.value })} className="field-shell" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Occupation</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input aria-label="Occupation" type="text" required value={formData.occupation} onChange={(e) => setFormData({ ...formData, occupation: e.target.value })} className="field-shell !pl-10 pr-4" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Annual Income (₹)</label>
                <input aria-label="Annual income" type="number" required value={formData.annual_income} onChange={(e) => setFormData({ ...formData, annual_income: e.target.value })} className="field-shell" />
              </div>
            </div>

            <h3 className="text-lg font-bold mb-6 border-b border-border pb-2">Additional Details</h3>
            <div className="grid sm:grid-cols-2 gap-5 mb-8">
              <div className="space-y-2">
                <label className="text-sm font-medium">Education Level</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select aria-label="Education level" value={formData.education} onChange={(e) => setFormData({ ...formData, education: e.target.value as any })} className="field-shell !pl-10 pr-4 appearance-none">
                    {['No Formal Education', 'Primary', 'Secondary', 'Higher Secondary', 'Diploma', 'Graduate', 'Post Graduate', 'Doctorate'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Marital Status</label>
                <div className="relative">
                  <Heart className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select aria-label="Marital status" value={formData.marital_status} onChange={(e) => setFormData({ ...formData, marital_status: e.target.value as any })} className="field-shell !pl-10 pr-4 appearance-none">
                    {['Single', 'Married', 'Divorced', 'Widowed'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary px-6 py-2.5 rounded-[18px]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
