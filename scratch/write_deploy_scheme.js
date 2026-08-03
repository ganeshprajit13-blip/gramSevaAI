const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'app', 'admin', 'schemes', 'deploy', 'page.tsx');
const newFilePath = path.join(process.cwd(), 'app', 'admin', 'schemes', 'new', 'page.tsx');

const code = `'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, ArrowLeft, Save, Loader2, Sparkles, CheckCircle2, ChevronRight,
  ChevronLeft, Upload, Bot, ShieldCheck, MapPin, Phone, Globe, Building2,
  Calendar, Layers, DollarSign, AlertCircle, HelpCircle, Eye, Share2, Bookmark,
  TrendingUp, Users, Info, X, Plus, Trash2, Award
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useAuth } from '@/components/providers/auth-provider'
import { saveScheme, estimateTargetBeneficiaries, type SchemeRecord } from '@/lib/scheme-store'
import { getStoredResidents } from '@/lib/resident-store'

const CATEGORIES = [
  'Women Empowerment', 'Agriculture', 'Education', 'Health', 'Housing',
  'Pension', 'Employment', 'Business', 'Student Scholarship', 'Livestock',
  'Infrastructure', 'Other'
]

const SCHEME_TYPES = ['Central Government', 'State Government', 'District', 'Panchayat']

const DOCUMENT_OPTIONS = [
  'Aadhaar Card', 'Ration Card', 'Income Certificate', 'Community Certificate',
  'Birth Certificate', 'Transfer Certificate', 'Land Document', 'Bank Passbook',
  'Passport Photo', 'PAN Card', 'Disability Certificate', 'Farmer Certificate',
  'Death Certificate', 'Marriage Certificate'
]

const BENEFIT_TYPES = [
  'Cash Assistance', 'Subsidy', 'Loan', 'Scholarship', 'Free Training',
  'Insurance', 'Equipment', 'Seeds', 'Livestock', 'Housing', 'Employment', 'Other'
]

const FREQUENCIES = ['One-time', 'Monthly', 'Quarterly', 'Annual']

const STEPS = [
  { id: 1, name: 'Basic Details' },
  { id: 2, name: 'Eligibility Rules' },
  { id: 3, name: 'Required Documents' },
  { id: 4, name: 'Application Method' },
  { id: 5, name: 'Poster & Media' },
  { id: 6, name: 'AI Eligibility Checker' },
  { id: 7, name: 'Benefits Matrix' },
  { id: 8, name: 'Important Info & FAQs' },
  { id: 9, name: 'AI Summary' },
  { id: 10, name: 'Target Beneficiaries' }
]

export default function DeploySchemePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [customDocInput, setCustomDocInput] = useState('')

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Women Empowerment' as SchemeRecord['category'],
    type: 'State Government' as SchemeRecord['type'],
    description: '',
    benefits_text: '',
    launch_date: new Date().toISOString().split('T')[0],
    closing_date: '2027-12-31',
    status: 'active' as SchemeRecord['status'],

    // Step 2 Eligibility
    min_age: 18,
    max_age: 65,
    gender: 'All' as 'Male' | 'Female' | 'All',
    occupations: ['Student', 'Farmer', 'Homemaker', 'Daily Wage Worker', 'Self Employed'],
    income_ranges: ['Below ₹1,00,000', '₹1,00,000 – ₹2,50,000'],
    educations: ['Any'],
    land_ownership: 'Any' as SchemeRecord['eligibility']['land_ownership'],
    land_size_acres: 0,
    disability: 'Any' as 'Yes' | 'No' | 'Any',
    marital_statuses: ['Single', 'Married', 'Widow', 'Divorced', 'Separated'],
    village_filter: '',
    ward_filter: '',
    category_filter: ['All'],

    // Step 3 Documents
    required_documents: ['Aadhaar Card', 'Ration Card', 'Income Certificate', 'Bank Passbook'],

    // Step 4 Application Method
    application_type: 'Both' as 'Online' | 'Offline' | 'Both',
    online_url: 'https://tn.gov.in/schemes',
    official_website: 'https://tn.gov.in',
    redirection_link: 'https://tn.gov.in/apply',
    office_name: 'Block Development Office (BDO) GramSeva Portal Center',
    officer_name: 'Welfare Extension Officer',
    office_address: 'BDO Headquarters, Main Road, Block 1',
    working_hours: '9:30 AM - 5:30 PM (Mon-Sat)',
    contact_number: '1800-425-1000',
    maps_location: 'https://maps.google.com/?q=BDO+Office',

    // Step 5 Media
    poster_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    pdf_name: 'Government_Scheme_Notification_2026.pdf',
    brochure_name: 'Scheme_Information_Brochure.pdf',
    video_url: 'https://youtube.com/watch?v=demo',

    // Step 6 AI Checker
    ai_checker_enabled: true,

    // Step 7 Benefits
    benefit_type: 'Cash Assistance',
    benefit_amount: '₹1,000',
    benefit_frequency: 'Monthly',

    // Step 8 Important Info
    faqs: [
      { question: 'Who is eligible to apply?', answer: 'Any permanent resident satisfying the age, income, and document requirements.' },
      { question: 'What is the processing time?', answer: 'Applications are verified by the BDO within 7-14 working days.' }
    ],
    terms_conditions: 'Applicant must be a resident of the Block. All submitted certificates must be valid and verified by Village Administrative Officer (VAO).',
    helpline_number: '1800-425-1000',
    official_email: 'bdo.welfare@gramseva.gov.in',

    // Step 9 AI Summary
    ai_summary: '',
  })

  // Dynamic Estimation State
  const [estimation, setEstimation] = useState({
    totalEligible: 0,
    eligibleWomen: 0,
    eligibleFarmers: 0,
    eligibleStudents: 0,
    eligibleWidows: 0,
    villageBreakdown: {} as Record<string, number>
  })

  // Recalculate target estimation whenever eligibility criteria changes
  useEffect(() => {
    const res = estimateTargetBeneficiaries({
      min_age: Number(formData.min_age),
      max_age: Number(formData.max_age),
      gender: formData.gender,
      occupation: formData.occupations,
      disability: formData.disability,
      marital_status: formData.marital_statuses
    })
    setEstimation(res)
  }, [formData.min_age, formData.max_age, formData.gender, formData.occupations, formData.disability, formData.marital_statuses])

  // Auto Generate AI Summary
  const generateAiSummary = () => {
    const summary = \`This \${formData.type} scheme in the \${formData.category} sector provides \${formData.benefit_amount} (\${formData.benefit_frequency}) \${formData.benefit_type} to eligible residents aged \${formData.min_age}–\${formData.max_age} (\${formData.gender} applicants) with annual household income in \${formData.income_ranges.join(', ')}. Key documents required include \${formData.required_documents.slice(0, 3).join(', ')}.\`
    setFormData(prev => ({ ...prev, ai_summary: summary }))
    toast.success('AI Summary Generated Successfully!')
  }

  // Handle Form Submit (Publish or Save Draft)
  const handleSave = async (isDraft = false) => {
    if (!formData.title) {
      toast.error('Please enter a Scheme Title in Step 1')
      setCurrentStep(1)
      return
    }

    setLoading(true)
    try {
      const payload: Partial<SchemeRecord> = {
        title: formData.title,
        name: formData.title,
        category: formData.category,
        type: formData.type,
        description: formData.description || \`Official government welfare initiative under \${formData.category}.\`,
        benefits_list: formData.benefits_text ? formData.benefits_text.split('\\n').filter(Boolean) : [formData.benefit_amount + ' ' + formData.benefit_type],
        benefit_details: {
          type: formData.benefit_type,
          amount: formData.benefit_amount,
          frequency: formData.benefit_frequency
        },
        launch_date: formData.launch_date,
        closing_date: formData.closing_date,
        status: isDraft ? 'draft' : (formData.status || 'active'),
        eligibility: {
          min_age: Number(formData.min_age),
          max_age: Number(formData.max_age),
          gender: formData.gender,
          occupation: formData.occupations,
          income_range: formData.income_ranges,
          education: formData.educations,
          land_ownership: formData.land_ownership,
          land_size_acres: Number(formData.land_size_acres),
          disability: formData.disability,
          marital_status: formData.marital_statuses,
          village_filter: formData.village_filter,
          ward_filter: formData.ward_filter
        },
        required_documents: formData.required_documents,
        application_method: {
          type: formData.application_type,
          online_url: formData.online_url,
          official_website: formData.official_website,
          redirection_link: formData.redirection_link,
          office_name: formData.office_name,
          officer_name: formData.officer_name,
          office_address: formData.office_address,
          working_hours: formData.working_hours,
          contact_number: formData.contact_number,
          maps_location: formData.maps_location
        },
        media: {
          poster_url: formData.poster_url,
          pdf_url: formData.pdf_name,
          brochure_url: formData.brochure_name,
          video_url: formData.video_url
        },
        ai_checker_enabled: formData.ai_checker_enabled,
        important_info: {
          faqs: formData.faqs,
          terms_and_conditions: formData.terms_conditions,
          helpline_number: formData.helpline_number,
          official_website: formData.official_website,
          official_email: formData.official_email
        },
        ai_summary: formData.ai_summary || \`Supports eligible \${formData.category} beneficiaries with \${formData.benefit_amount}.\`
      }

      // Save into client central scheme-store
      saveScheme(payload)

      // Also call backend API
      try {
        await fetch('/api/schemes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      } catch (e) {
        // Fallback silently to client store
      }

      toast.success(isDraft ? 'Scheme Draft Saved!' : '🎉 Government Scheme Published Successfully!')
      router.push('/admin/schemes')
    } catch (err) {
      console.error(err)
      toast.error('Error saving scheme')
    } finally {
      setLoading(false)
    }
  }

  // Document Toggle Helper
  const toggleDoc = (doc: string) => {
    setFormData(prev => {
      const exists = prev.required_documents.includes(doc)
      return {
        ...prev,
        required_documents: exists
          ? prev.required_documents.filter(d => d !== doc)
          : [...prev.required_documents, doc]
      }
    })
  }

  const addCustomDoc = () => {
    if (!customDocInput.trim()) return
    if (!formData.required_documents.includes(customDocInput.trim())) {
      setFormData(prev => ({
        ...prev,
        required_documents: [...prev.required_documents, customDocInput.trim()]
      }))
    }
    setCustomDocInput('')
  }

  // FAQ Helper
  const addFaq = () => {
    setFormData(prev => ({
      ...prev,
      faqs: [...prev.faqs, { question: '', answer: '' }]
    }))
  }

  const updateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    setFormData(prev => {
      const updated = [...prev.faqs]
      updated[index][field] = value
      return { ...prev, faqs: updated }
    })
  }

  const removeFaq = (index: number) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 pt-6 px-4 md:px-8">
      {/* Top Header */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/schemes" className="p-2.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all shadow-xs">
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                BDO E-Governance Portal
              </span>
              <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                Step {currentStep} of 10
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              Deploy Government Welfare Scheme
            </h1>
          </div>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave(true)}
            disabled={loading}
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-100 transition-all shadow-xs"
          >
            Save Draft
          </button>
          <button
            onClick={() => setShowPreviewModal(true)}
            className="px-4 py-2.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold rounded-xl hover:bg-blue-100 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Eye className="w-4 h-4" /> Preview Scheme
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={loading}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white text-xs font-black rounded-xl transition-all flex items-center gap-1.5 shadow-md"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
            Publish Scheme
          </button>
        </div>
      </div>

      {/* STEP PROGRESS WIZARD BAR */}
      <div className="max-w-6xl mx-auto mb-8 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs overflow-x-auto">
        <div className="flex items-center min-w-[750px] justify-between">
          {STEPS.map(step => {
            const isCompleted = step.id < currentStep
            const isCurrent = step.id === currentStep
            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={\`flex flex-col items-center gap-1 group relative transition-all \${
                  isCurrent ? 'scale-105' : ''
                }\`}
              >
                <div
                  className={\`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all \${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-sm'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }\`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step.id}
                </div>
                <span
                  className={\`text-[10px] font-bold whitespace-nowrap \${
                    isCurrent ? 'text-blue-700' : isCompleted ? 'text-emerald-700' : 'text-slate-500'
                  }\`}
                >
                  {step.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* WIZARD CONTENT CONTAINER */}
      <div className="max-w-6xl mx-auto">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-sm space-y-8"
        >
          {/* STEP 1: BASIC SCHEME DETAILS */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" /> STEP 1: Basic Scheme Details
                </h2>
                <p className="text-xs text-slate-500">Provide official scheme title, category, target dates, and rich description.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Scheme Title <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Kalaignar Magalir Urimai Thittam / PM Kisan Support"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Scheme Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Scheme Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    {SCHEME_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Scheme Description (Rich Formatting)</label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter comprehensive scheme objectives, scope, and government mandate..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Benefits Summary (One per line)</label>
                  <textarea
                    rows={3}
                    value={formData.benefits_text}
                    onChange={(e) => setFormData({ ...formData, benefits_text: e.target.value })}
                    placeholder="₹1,000 Direct Monthly Bank Transfer&#10;Free financial literacy training&#10;Priority Self Help Group loan access"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Launch Date</label>
                  <input
                    type="date"
                    value={formData.launch_date}
                    onChange={(e) => setFormData({ ...formData, launch_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Closing Date</label>
                  <input
                    type="date"
                    value={formData.closing_date}
                    onChange={(e) => setFormData({ ...formData, closing_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Scheme Status</label>
                  <div className="flex gap-4">
                    {['active', 'upcoming', 'closed'].map((st) => (
                      <label key={st} className={\`flex-1 p-3 rounded-xl border flex items-center justify-center gap-2 cursor-pointer capitalize font-bold text-xs transition-all \${
                        formData.status === st ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }\`}>
                        <input
                          type="radio"
                          name="status"
                          value={st}
                          checked={formData.status === st}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                          className="hidden"
                        />
                        {st === 'active' ? '🟢 Active' : st === 'upcoming' ? '🟡 Upcoming' : '🔴 Closed'}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ELIGIBILITY CRITERIA */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" /> STEP 2: Configure Eligibility Rules
                </h2>
                <p className="text-xs text-slate-500">Define precise demographic filters to target specific resident segments.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Minimum Age</label>
                  <input
                    type="number"
                    value={formData.min_age}
                    onChange={(e) => setFormData({ ...formData, min_age: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Maximum Age</label>
                  <input
                    type="number"
                    value={formData.max_age}
                    onChange={(e) => setFormData({ ...formData, max_age: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Gender Preference</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold"
                  >
                    <option value="All">All Genders</option>
                    <option value="Female">Female Only (Women Empowerment)</option>
                    <option value="Male">Male Only</option>
                  </select>
                </div>

                <div className="space-y-1.5 md:col-span-3">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Eligible Occupations</label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {['Student', 'Farmer', 'Agricultural Labourer', 'Govt Employee', 'Private Employee', 'Business Owner', 'Self Employed', 'Daily Wage Worker', 'Homemaker', 'Unemployed', 'Any'].map(occ => {
                      const selected = formData.occupations.includes(occ)
                      return (
                        <button
                          key={occ}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              occupations: selected ? prev.occupations.filter(o => o !== occ) : [...prev.occupations, occ]
                            }))
                          }}
                          className={\`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border \${
                            selected ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 text-slate-600 border-slate-200'
                          }\`}
                        >
                          {occ} {selected && '✓'}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-1.5 md:col-span-3">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Annual Household Income Range</label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {['Below ₹1,00,000', '₹1,00,000 – ₹2,50,000', '₹2,50,000 – ₹5,00,000', '₹5,00,000 – ₹10,00,000', 'Above ₹10,00,000'].map(inc => {
                      const selected = formData.income_ranges.includes(inc)
                      return (
                        <button
                          key={inc}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              income_ranges: selected ? prev.income_ranges.filter(i => i !== inc) : [...prev.income_ranges, inc]
                            }))
                          }}
                          className={\`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border \${
                            selected ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-100 text-slate-600 border-slate-200'
                          }\`}
                        >
                          {inc} {selected && '✓'}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Land Ownership</label>
                  <select
                    value={formData.land_ownership}
                    onChange={(e) => setFormData({ ...formData, land_ownership: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold"
                  >
                    <option value="Any">Any Land Status</option>
                    <option value="No Land">No Land / Landless</option>
                    <option value="Agricultural">Agricultural Land</option>
                    <option value="Residential">Residential Land</option>
                    <option value="Commercial">Commercial Land</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Disability Specific?</label>
                  <select
                    value={formData.disability}
                    onChange={(e) => setFormData({ ...formData, disability: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold"
                  >
                    <option value="Any">Not Mandatory</option>
                    <option value="Yes">Differently Abled Citizens Only</option>
                    <option value="No">Non-Disabled Only</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Village Filter (Optional)</label>
                  <input
                    type="text"
                    value={formData.village_filter}
                    onChange={(e) => setFormData({ ...formData, village_filter: e.target.value })}
                    placeholder="All Villages or specific village name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: REQUIRED DOCUMENTS */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" /> STEP 3: Select Required Proof Documents
                </h2>
                <p className="text-xs text-slate-500">Check all mandatory verification documents residents must upload.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {DOCUMENT_OPTIONS.map(doc => {
                  const selected = formData.required_documents.includes(doc)
                  return (
                    <button
                      key={doc}
                      type="button"
                      onClick={() => toggleDoc(doc)}
                      className={\`p-3.5 rounded-xl border text-left flex items-center justify-between font-bold text-xs transition-all \${
                        selected ? 'bg-purple-50 border-purple-400 text-purple-900 shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }\`}
                    >
                      <span>{doc}</span>
                      {selected && <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />}
                    </button>
                  )
                })}
              </div>

              {/* Custom Document Input */}
              <div className="pt-4 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  value={customDocInput}
                  onChange={(e) => setCustomDocInput(e.target.value)}
                  placeholder="Add custom required document (e.g. Caste Validity Certificate)..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold"
                />
                <button
                  type="button"
                  onClick={addCustomDoc}
                  className="px-4 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700"
                >
                  Add Custom Proof
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: APPLICATION METHOD */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" /> STEP 4: Application Method & Redirection Setup
                </h2>
                <p className="text-xs text-slate-500">Configure online submission portal URLs or physical BDO office contact locations.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Application Mode</label>
                <div className="flex gap-4">
                  {['Online', 'Offline', 'Both'].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setFormData({ ...formData, application_type: m as any })}
                      className={\`flex-1 p-4 rounded-xl border font-bold text-sm transition-all \${
                        formData.application_type === m ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }\`}
                    >
                      {m === 'Online' ? '💻 Online Application' : m === 'Offline' ? '🏢 Physical BDO Desk' : '⚡ Both Online & Offline'}
                    </button>
                  ))}
                </div>
              </div>

              {(formData.application_type === 'Online' || formData.application_type === 'Both') && (
                <div className="p-5 bg-blue-50/50 border border-blue-200 rounded-2xl space-y-4">
                  <h3 className="text-xs font-black text-blue-900 uppercase tracking-wider flex items-center gap-1.5"><Globe className="w-4 h-4" /> Online Portal Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Official Government Portal URL</label>
                      <input
                        type="url"
                        value={formData.online_url}
                        onChange={(e) => setFormData({ ...formData, online_url: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Redirection / Direct Apply Link</label>
                      <input
                        type="url"
                        value={formData.redirection_link}
                        onChange={(e) => setFormData({ ...formData, redirection_link: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {(formData.application_type === 'Offline' || formData.application_type === 'Both') && (
                <div className="p-5 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-4">
                  <h3 className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5"><Building2 className="w-4 h-4" /> Physical Office Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Office Name</label>
                      <input
                        type="text"
                        value={formData.office_name}
                        onChange={(e) => setFormData({ ...formData, office_name: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Officer In-Charge Name</label>
                      <input
                        type="text"
                        value={formData.officer_name}
                        onChange={(e) => setFormData({ ...formData, officer_name: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium"
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[11px] font-bold text-slate-700">Office Address</label>
                      <input
                        type="text"
                        value={formData.office_address}
                        onChange={(e) => setFormData({ ...formData, office_address: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Working Hours</label>
                      <input
                        type="text"
                        value={formData.working_hours}
                        onChange={(e) => setFormData({ ...formData, working_hours: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Contact Number</label>
                      <input
                        type="text"
                        value={formData.contact_number}
                        onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: SCHEME POSTER & MEDIA */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-amber-600" /> STEP 5: Scheme Poster & Media Drag-and-Drop
                </h2>
                <p className="text-xs text-slate-500">Upload official graphics, government gazette notifications, and video links.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Poster Drag & Drop Area */}
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-blue-500 transition-all bg-slate-50 flex flex-col items-center justify-center space-y-3">
                  {formData.poster_url ? (
                    <div className="relative group w-full">
                      <img src={formData.poster_url} alt="Poster" className="w-full h-48 object-cover rounded-xl shadow-xs" />
                      <button
                        onClick={() => setFormData({ ...formData, poster_url: '' })}
                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-slate-400" />
                      <div>
                        <p className="text-xs font-bold text-slate-700">Drag & Drop Scheme Poster Image</p>
                        <p className="text-[10px] text-slate-500">PNG, JPG, WEBP up to 5MB</p>
                      </div>
                    </>
                  )}
                  <input
                    type="text"
                    value={formData.poster_url}
                    onChange={(e) => setFormData({ ...formData, poster_url: e.target.value })}
                    placeholder="Or paste image URL here..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Government Notification PDF</label>
                    <input
                      type="text"
                      value={formData.pdf_name}
                      onChange={(e) => setFormData({ ...formData, pdf_name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Scheme Brochure PDF</label>
                    <input
                      type="text"
                      value={formData.brochure_name}
                      onChange={(e) => setFormData({ ...formData, brochure_name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Video Guide URL (YouTube / MP4)</label>
                    <input
                      type="text"
                      value={formData.video_url}
                      onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: AI ELIGIBILITY CHECKER */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Bot className="w-5 h-5 text-blue-600" /> STEP 6: AI Eligibility Checker Setup
                </h2>
                <p className="text-xs text-slate-500">Enable real-time AI background checking against resident profile attributes.</p>
              </div>

              <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex items-center justify-between">
                <div className="space-y-1">
                  <span className="font-extrabold text-sm text-slate-900">Enable Automated AI Eligibility Engine</span>
                  <p className="text-xs text-slate-600 max-w-xl">
                    When enabled, residents will see a "Check My Eligibility" button. The GramSeva AI model evaluates their verified profile and provides an instant decision with clear explanation.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, ai_checker_enabled: !prev.ai_checker_enabled }))}
                  className={\`w-14 h-8 flex items-center rounded-full p-1 transition-all cursor-pointer \${
                    formData.ai_checker_enabled ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
                  }\`}
                >
                  <motion.div layout className="w-6 h-6 bg-white rounded-full shadow-md" />
                </button>
              </div>

              {/* DEMO SIMULATION */}
              <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-blue-600" /> Live Resident AI Experience Simulation</span>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">Evaluated Applicant: Kavitha R. (28 yrs, Female, Homemaker)</span>
                    <span className="bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded text-[10px]">✔ ELIGIBLE</span>
                  </div>
                  <p className="text-xs text-slate-600 italic">
                    "🎉 Congratulations! Your profile matches all age (21–65), female gender, and income criteria."
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: BENEFITS MATRIX */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" /> STEP 7: Benefits Matrix & Value Structure
                </h2>
                <p className="text-xs text-slate-500">Define financial amounts, frequency, or non-monetary assistance provided.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Benefit Type</label>
                  <select
                    value={formData.benefit_type}
                    onChange={(e) => setFormData({ ...formData, benefit_type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold"
                  >
                    {BENEFIT_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Benefit Amount / Value</label>
                  <input
                    type="text"
                    value={formData.benefit_amount}
                    onChange={(e) => setFormData({ ...formData, benefit_amount: e.target.value })}
                    placeholder="e.g. ₹1,000 / ₹6,000 / Free Equipment"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Disbursement Frequency</label>
                  <select
                    value={formData.benefit_frequency}
                    onChange={(e) => setFormData({ ...formData, benefit_frequency: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold"
                  >
                    {FREQUENCIES.map(fr => <option key={fr} value={fr}>{fr}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: IMPORTANT INFORMATION & FAQS */}
          {currentStep === 8 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-indigo-600" /> STEP 8: Frequently Asked Questions & Terms
                  </h2>
                  <p className="text-xs text-slate-500">Provide official help desk details and Q&A to reduce citizen queries.</p>
                </div>
                <button
                  type="button"
                  onClick={addFaq}
                  className="px-3.5 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-xl hover:bg-indigo-100 transition-all flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add FAQ Pair
                </button>
              </div>

              {/* FAQs List */}
              <div className="space-y-4">
                {formData.faqs.map((faq, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 relative group">
                    <button
                      type="button"
                      onClick={() => removeFaq(idx)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 uppercase">Question #{idx + 1}</label>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => updateFaq(idx, 'question', e.target.value)}
                        placeholder="e.g. Is there an age relaxation?"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 uppercase">Answer</label>
                      <input
                        type="text"
                        value={faq.answer}
                        onChange={(e) => updateFaq(idx, 'answer', e.target.value)}
                        placeholder="e.g. Yes, eligible widows above 18 can apply..."
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Helpline Number</label>
                  <input
                    type="text"
                    value={formData.helpline_number}
                    onChange={(e) => setFormData({ ...formData, helpline_number: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Official Support Email</label>
                  <input
                    type="email"
                    value={formData.official_email}
                    onChange={(e) => setFormData({ ...formData, official_email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 9: AI SUMMARY */}
          {currentStep === 9 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" /> STEP 9: Auto-Generated AI Executive Summary
                  </h2>
                  <p className="text-xs text-slate-500">GramSeva AI compiles a concise executive summary for citizens and BDO reports.</p>
                </div>
                <button
                  type="button"
                  onClick={generateAiSummary}
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-extrabold rounded-xl hover:opacity-90 transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <Bot className="w-4 h-4" /> Auto-Generate Summary
                </button>
              </div>

              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <textarea
                  rows={4}
                  value={formData.ai_summary}
                  onChange={(e) => setFormData({ ...formData, ai_summary: e.target.value })}
                  placeholder="Click 'Auto-Generate Summary' or type custom executive summary..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-4 text-xs font-medium leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* STEP 10: TARGET BENEFICIARY ESTIMATION */}
          {currentStep === 10 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" /> STEP 10: Live Target Beneficiary Estimation
                </h2>
                <p className="text-xs text-slate-500">Calculated in real-time against verified resident records in central database.</p>
              </div>

              {/* Estimation Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-blue-900">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider block">Total Eligible</span>
                  <p className="text-2xl font-black mt-1">{estimation.totalEligible}</p>
                  <span className="text-[9px] text-blue-700 font-semibold">Citizens</span>
                </div>
                <div className="p-4 bg-pink-50 border border-pink-200 rounded-2xl text-pink-900">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider block">Eligible Women</span>
                  <p className="text-2xl font-black mt-1">{estimation.eligibleWomen}</p>
                  <span className="text-[9px] text-pink-700 font-semibold">Beneficiaries</span>
                </div>
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider block">Eligible Farmers</span>
                  <p className="text-2xl font-black mt-1">{estimation.eligibleFarmers}</p>
                  <span className="text-[9px] text-emerald-700 font-semibold">Landholders</span>
                </div>
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-purple-900">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider block">Eligible Students</span>
                  <p className="text-2xl font-black mt-1">{estimation.eligibleStudents}</p>
                  <span className="text-[9px] text-purple-700 font-semibold">Youth</span>
                </div>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider block">Eligible Widows</span>
                  <p className="text-2xl font-black mt-1">{estimation.eligibleWidows}</p>
                  <span className="text-[9px] text-amber-700 font-semibold">Special Priority</span>
                </div>
              </div>

              {/* Village-Wise Breakdown */}
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" /> Village-Wise Beneficiary Distribution Breakdown
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(estimation.villageBreakdown).map(([village, count]) => (
                    <div key={village} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{village}</span>
                      <span className="text-xs font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg">
                        {count} Residents ({Math.round((count / (estimation.totalEligible || 1)) * 100)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* FOOTER WIZARD CONTROLS */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all disabled:opacity-40 flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" /> Previous Step
            </button>

            {currentStep < 10 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => Math.min(10, prev + 1))}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
              >
                Next Step <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white text-xs font-black rounded-xl transition-all flex items-center gap-1.5 shadow-md"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                Publish Scheme Now
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* PREVIEW SCHEME MODAL */}
      <AnimatePresence>
        {showPreviewModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl overflow-hidden my-8"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-black text-blue-600 uppercase tracking-wider">Resident View Preview</span>
                <button onClick={() => setShowPreviewModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <img src={formData.poster_url} alt="Poster" className="w-full h-48 object-cover rounded-2xl" />
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{formData.category}</span>
                  <h3 className="text-xl font-black text-slate-900">{formData.title}</h3>
                  <p className="text-xs text-slate-600">{formData.description || formData.ai_summary}</p>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-900 block">Benefit Amount</span>
                    <p className="text-lg font-black text-emerald-700">{formData.benefit_amount} ({formData.benefit_frequency})</p>
                  </div>
                  <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">Apply Now</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
`;

fs.mkdirSync(path.dirname(filePath), { recursive: true });
fs.writeFileSync(filePath, code, 'utf8');

// Also replace app/admin/schemes/new/page.tsx to re-export DeploySchemePage
const newFileCode = `'use client'
import DeploySchemePage from '../deploy/page'
export default DeploySchemePage
`;
fs.writeFileSync(newFilePath, newFileCode, 'utf8');

console.log('Successfully created DeploySchemePage at app/admin/schemes/deploy/page.tsx & updated app/admin/schemes/new/page.tsx!');
`;

fs.writeFileSync(path.join(process.cwd(), 'scratch', 'write_deploy_scheme.js'), code, 'utf8');
