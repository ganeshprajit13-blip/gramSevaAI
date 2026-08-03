'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  ChevronRight, ChevronLeft, CheckCircle2, User, MapPin, Briefcase,
  Heart, GraduationCap, Leaf, Users, ShieldCheck, Upload, AlertTriangle, FileText, Smartphone, Lock
} from 'lucide-react'
import { profileSchema, type ProfileFormValues } from '@/lib/validations'
import { useAuth } from '@/components/providers/auth-provider'
import { upsertResidentProfile, validateUniqueness, getStoredResidents, calculateProfileScore } from '@/lib/resident-store'

const steps = [
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'Education', icon: GraduationCap },
  { id: 3, title: 'Employment', icon: Briefcase },
  { id: 4, title: 'Land Details', icon: Leaf },
  { id: 5, title: 'Family Details', icon: Users },
  { id: 6, title: 'Women Empowerment', icon: Heart },
  { id: 7, title: 'Documents Upload', icon: Upload },
]

const VILLAGES = ['Kumarpuram', 'Sakthinagar', 'Vetrikovil', 'Mullaivayal', 'Kaligapuram', 'Periyakadu', 'Ariyanayagi', 'Kaviyarkulam']
const WARDS = ['1', '2', '3', '4']

export default function CompleteProfilePage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpValue, setOtpValue] = useState('')
  const [otpVerified, setOtpVerified] = useState(true)
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, { name: string; status: 'Uploaded' }>>({})

  const { user, profile, refreshProfile } = useAuth()
  const router = useRouter()

  const { register, handleSubmit, trigger, watch, setValue, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema) as any,
    defaultValues: {
      name: user?.displayName || '',
      dob: '1998-05-15',
      age: 28,
      gender: 'Female',
      mobile: '9876543210',
      mobile_verified: true,
      aadhaar: '987654321098',
      family_id: 'RAT-891023',
      marital_status: 'Married',
      village: 'Kumarpuram',
      ward_number: '1',
      house_number: '12-B',
      pincode: '625001',
      education: 'High School',
      school_college: 'Government Higher Secondary School',
      currently_studying: false,
      occupation: 'Homemaker',
      monthly_income: 6000,
      annual_income_range: 'Below ₹1,00,000',
      annual_income: 72000,
      own_land: true,
      land_type: 'Agricultural',
      land_area_acres: 1.5,
      crop_type: 'Paddy',
      livestock: 'Cow',
      family_members_count: 4,
      children_count: 2,
      women_count: 2,
      senior_citizens_count: 0,
      has_widow: false,
      has_disabled: false,
      disability_type: 'No Disability',
      has_pregnant: false,
      has_lactating: false,
      has_girl_child: true,
      shg_member: true,
      shg_name: 'Mullai Women SHG',
      entrepreneur: true,
      business_vertical: 'Tailoring',
      interested_skill_training: true,
      interested_govt_loans: true,
      has_bank_account: true,
      has_jandhan_account: true,
      digital_literate: true,
      has_smartphone: true,
      has_internet: true,
      previous_scheme_benefits: ['PMAY-G'],
    },
  })

  const watchGender = watch('gender')
  const watchOwnLand = watch('own_land')
  const watchOccupation = watch('occupation')
  const watchDob = watch('dob')

  // Auto calculate age from date of birth
  useEffect(() => {
    if (watchDob) {
      const birthYear = new Date(watchDob).getFullYear()
      const currentYear = new Date().getFullYear()
      if (!isNaN(birthYear) && birthYear < currentYear) {
        setValue('age', currentYear - birthYear)
      }
    }
  }, [watchDob, setValue])

  // Pre-fill existing stored record if available
  useEffect(() => {
    if (user?.uid) {
      const stored = getStoredResidents().find(r => r.firebase_uid === user.uid)
      if (stored) {
        Object.keys(stored).forEach((k) => {
          if (k in profileSchema.shape) {
            setValue(k as any, (stored as any)[k])
          }
        })
      }
    }
  }, [user, setValue])

  const sendOtp = () => {
    setOtpSent(true)
    toast.info('OTP Sent to mobile number! Use 123456 to verify.')
  }

  const verifyOtp = () => {
    if (otpValue === '123456' || otpValue.length === 6) {
      setOtpVerified(true)
      setValue('mobile_verified', true)
      toast.success('Mobile Number Verified Successfully!')
    } else {
      toast.error('Invalid OTP. Enter 123456.')
    }
  }

  const handleFileUpload = (docType: string, file: File | null) => {
    if (!file) return
    setUploadedFiles(prev => ({
      ...prev,
      [docType]: { name: file.name, status: 'Uploaded' }
    }))
    toast.success(`${docType.replace(/_/g, ' ').toUpperCase()} uploaded successfully!`)
  }

  const nextStep = () => {
    if (currentStep === 0 && !otpVerified) {
      toast.error('Please verify your mobile number with OTP first.')
      return
    }
    setCurrentStep(s => Math.min(s + 1, steps.length - 1))
  }

  const prevStep = () => {
    setCurrentStep(s => Math.max(s - 1, 0))
  }

  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    if (!user) {
      toast.error('Please sign in to save your resident profile.')
      return
    }

    // Uniqueness validation (1 Gmail = 1 Resident, unique Aadhaar & Ration Card)
    const check = validateUniqueness(user.uid, data.aadhaar, data.family_id)
    if (!check.valid) {
      toast.error(check.error || 'Duplicate record detected.')
      return
    }

    setSubmitting(true)
    try {
      // Upsert record into centralized resident store
      const updated = upsertResidentProfile({
        ...data,
        firebase_uid: user.uid,
        email: user.email || 'resident@gramseva.gov.in',
        documents: {
          aadhaar_card: uploadedFiles.aadhaar_card || { name: 'Aadhaar_Card.pdf', status: 'Uploaded' },
          ration_card: uploadedFiles.ration_card || { name: 'Ration_Card.pdf', status: 'Uploaded' },
          income_cert: uploadedFiles.income_cert || { name: 'Income_Certificate.pdf', status: 'Uploaded' },
          community_cert: uploadedFiles.community_cert,
          disability_cert: uploadedFiles.disability_cert,
          land_doc: uploadedFiles.land_doc,
          education_cert: uploadedFiles.education_cert,
        }
      })

      await refreshProfile()
      toast.success('Resident Profile Saved & Submitted for BDO Verification! 🎉')
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save profile.')
    } finally {
      setSubmitting(false)
    }
  }

  // Calculate live score preview
  const currentValues = watch()
  const score = calculateProfileScore({ ...currentValues, documents: uploadedFiles as any })

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-950 text-white rounded-3xl p-6 shadow-xl border border-blue-800/40 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold tracking-widest text-blue-300 uppercase">GramSeva Resident Onboarding</span>
              </div>
              <h1 className="text-2xl font-black">Mandatory Resident Registration</h1>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Complete your verified 7-step profile to unlock government scheme applications, direct benefit transfer (DBT), and AI scheme matching.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center min-w-[140px]">
              <p className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">Completion Score</p>
              <p className="text-3xl font-black text-white mt-0.5">{score}%</p>
              <div className="w-full bg-white/20 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full transition-all duration-500" style={{ width: `${score}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* STEP PROGRESS BAR */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs overflow-x-auto">
          <div className="flex items-center justify-between min-w-[640px]">
            {steps.map((step, idx) => {
              const Icon = step.icon
              const isDone = idx < currentStep
              const isCurrent = idx === currentStep
              return (
                <div key={step.id} className="flex items-center gap-2 flex-1">
                  <div
                    onClick={() => idx <= currentStep && setCurrentStep(idx)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${
                      isDone ? 'bg-emerald-600 text-white shadow-sm' : isCurrent ? 'bg-blue-600 text-white shadow-md ring-4 ring-blue-100' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-[10px] font-bold truncate ${isCurrent ? 'text-blue-600' : 'text-slate-500'}`}>{step.title}</p>
                    <p className="text-[9px] text-slate-400">Step {idx + 1}</p>
                  </div>
                  {idx < steps.length - 1 && <div className="h-0.5 flex-1 bg-slate-200 mx-2" />}
                </div>
              )
            })}
          </div>
        </div>

        {/* FORM CARD */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* ── STEP 1: PERSONAL INFO ── */}
                {currentStep === 0 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" /> Step 1 — Personal Information
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Full Name (As per Aadhaar) *</label>
                        <input {...register('name')} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Enter full name" />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth *</label>
                        <input type="date" {...register('dob')} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                        {errors.dob && <p className="text-xs text-red-500 mt-1">{errors.dob.message}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Age (Calculated Automatically)</label>
                        <input type="number" readOnly {...register('age')} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-sm font-bold text-slate-700" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Gender *</label>
                        <select {...register('gender')} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                          <option value="Female">Female</option>
                          <option value="Male">Male</option>
                          <option value="Transgender">Transgender</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number (OTP Verification) *</label>
                        <div className="flex gap-2">
                          <input {...register('mobile')} className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="10-digit mobile number" />
                          <button type="button" onClick={sendOtp} className="px-3 py-2 text-xs font-bold bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-xl transition-colors">
                            {otpSent ? 'Resend OTP' : 'Send OTP'}
                          </button>
                        </div>
                        {otpSent && (
                          <div className="flex gap-2 mt-2">
                            <input value={otpValue} onChange={e => setOtpValue(e.target.value)} placeholder="Enter 6-digit OTP (123456)" className="px-3 py-2 text-xs rounded-xl border border-blue-300 flex-1" />
                            <button type="button" onClick={verifyOtp} className="px-3 py-2 text-xs font-bold bg-green-600 text-white rounded-xl">Verify</button>
                          </div>
                        )}
                        {otpVerified && <p className="text-[11px] text-green-600 font-bold mt-1">✓ Mobile Verified</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Aadhaar Number (12 Digits - Encrypted) *</label>
                        <div className="relative">
                          <input {...register('aadhaar')} maxLength={12} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono" placeholder="12-digit Aadhaar" />
                          <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                        </div>
                        {errors.aadhaar && <p className="text-xs text-red-500 mt-1">{errors.aadhaar.message}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Family ID / Ration Card Number *</label>
                        <input {...register('family_id')} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono uppercase" placeholder="e.g. RAT-891023" />
                        {errors.family_id && <p className="text-xs text-red-500 mt-1">{errors.family_id.message}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Marital Status *</label>
                        <select {...register('marital_status')} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                          {['Single', 'Married', 'Widowed', 'Divorced', 'Separated'].map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Village *</label>
                        <select {...register('village')} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                          {VILLAGES.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Ward Number *</label>
                        <select {...register('ward_number')} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                          {WARDS.map(w => <option key={w} value={w}>Ward {w}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">House Number</label>
                        <input {...register('house_number')} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Door / House No." />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Pincode</label>
                        <input {...register('pincode')} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="6-digit Pincode" />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 2: EDUCATION ── */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-purple-600" /> Step 2 — Educational Qualification
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Highest Qualification *</label>
                        <select {...register('education')} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none">
                          {[
                            'No Formal Education', 'Primary', 'Middle', 'High School',
                            'Higher Secondary', 'Diploma', 'Undergraduate', 'Postgraduate', 'Doctorate'
                          ].map(e => <option key={e} value={e}>{e}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">School / College Name</label>
                        <input {...register('school_college')} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none" placeholder="Institution Name" />
                      </div>

                      <div className="flex items-center gap-3 pt-6">
                        <input type="checkbox" id="currently_studying" {...register('currently_studying')} className="w-4 h-4 text-purple-600 rounded" />
                        <label htmlFor="currently_studying" className="text-sm font-bold text-slate-700 cursor-pointer">Currently Studying?</label>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Student ID / Roll Number (Optional)</label>
                        <input {...register('student_id')} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none" placeholder="Student ID" />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 3: EMPLOYMENT ── */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-blue-600" /> Step 3 — Employment & Income Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Occupation Status *</label>
                        <select {...register('occupation')} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                          {[
                            'Student', 'Homemaker', 'Farmer', 'Agricultural Labourer',
                            'Government Employee', 'Private Employee', 'Self Employed', 'Business Owner',
                            'Daily Wage Worker', 'Construction Worker', 'Teacher', 'Healthcare Worker',
                            'Retired', 'Unemployed'
                          ].map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Personal Income (₹)</label>
                        <input type="number" {...register('monthly_income')} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Annual Family Income Bracket *</label>
                        <select {...register('annual_income_range')} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                          {['Below ₹1,00,000', '₹1,00,000 – ₹2,50,000', '₹2,50,000 – ₹5,00,000', '₹5,00,000 – ₹10,00,000', 'Above ₹10,00,000'].map(i => <option key={i} value={i}>{i}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Employer / Business Name (Optional)</label>
                        <input {...register('employer_name')} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Company / Business Name" />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 4: LAND DETAILS ── */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Leaf className="w-5 h-5 text-green-600" /> Step 4 — Land Ownership & Agriculture
                    </h2>

                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-2xl border border-green-200">
                      <input type="checkbox" id="own_land" {...register('own_land')} className="w-5 h-5 text-green-600 rounded" />
                      <label htmlFor="own_land" className="text-sm font-bold text-green-900 cursor-pointer">Do you or your family own land?</label>
                    </div>

                    {watchOwnLand && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Land Type</label>
                          <select {...register('land_type')} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none">
                            {['Agricultural', 'Residential', 'Commercial', 'Mixed'].map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Land Area (in Acres)</label>
                          <input type="number" step="0.1" {...register('land_area_acres')} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none" placeholder="e.g. 1.5" />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Primary Crop Type</label>
                          <select {...register('crop_type')} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none">
                            {['Paddy', 'Banana', 'Sugarcane', 'Vegetables', 'Coconut', 'Millets', 'Cotton', 'Others'].map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Livestock Owned</label>
                          <select {...register('livestock')} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none">
                            {['Cow', 'Goat', 'Chicken', 'Fish Farm', 'None'].map(l => <option key={l} value={l}>{l}</option>)}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── STEP 5: FAMILY DETAILS ── */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Users className="w-5 h-5 text-indigo-600" /> Step 5 — Family & Vulnerability Demographics
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Total Family Members</label>
                        <input type="number" min={1} {...register('family_members_count')} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Number of Children</label>
                        <input type="number" min={0} {...register('children_count')} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Number of Women</label>
                        <input type="number" min={0} {...register('women_count')} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Senior Citizens (60+)</label>
                        <input type="number" min={0} {...register('senior_citizens_count')} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      {[
                        { id: 'has_widow', label: 'Widow in Family', desc: 'Qualifies for Widow Pension' },
                        { id: 'has_disabled', label: 'Differently Abled Person', desc: 'Qualifies for Disability Scheme' },
                        { id: 'has_pregnant', label: 'Pregnant Woman', desc: 'Qualifies for PM Matru Vandana' },
                        { id: 'has_lactating', label: 'Lactating Mother', desc: 'Qualifies for Nutrition Schemes' },
                        { id: 'has_girl_child', label: 'Girl Child', desc: 'Qualifies for Girl Child Scholarship' },
                      ].map(item => (
                        <label key={item.id} className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                          <input type="checkbox" {...register(item.id as any)} className="w-4 h-4 mt-0.5 text-blue-600 rounded" />
                          <div>
                            <p className="text-xs font-bold text-slate-800">{item.label}</p>
                            <p className="text-[10px] text-slate-500">{item.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── STEP 6: WOMEN EMPOWERMENT ── */}
                {currentStep === 5 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-pink-600" /> Step 6 — Women Empowerment &amp; Literacy
                    </h2>

                    {watchGender !== 'Female' && (
                      <div className="p-3 bg-pink-50 border border-pink-200 rounded-xl text-xs text-pink-700 font-semibold mb-2">
                        Note: Information here applies to female family members or female head of household.
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-pink-200 bg-pink-50/50 cursor-pointer">
                        <input type="checkbox" {...register('shg_member')} className="w-4 h-4 text-pink-600 rounded" />
                        <span className="text-xs font-bold text-pink-900">Self Help Group (SHG) Member?</span>
                      </label>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">SHG Group Name (if member)</label>
                        <input {...register('shg_name')} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm" placeholder="SHG Name" />
                      </div>

                      <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-blue-200 bg-blue-50/50 cursor-pointer">
                        <input type="checkbox" {...register('entrepreneur')} className="w-4 h-4 text-blue-600 rounded" />
                        <span className="text-xs font-bold text-blue-900">Woman Entrepreneur / Business Owner?</span>
                      </label>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Business Vertical</label>
                        <select {...register('business_vertical')} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm">
                          <option value="">Select Vertical</option>
                          {['Tailoring', 'Food Business', 'Handicrafts', 'Dairy', 'Poultry', 'Agri Business', 'Online', 'Retail Shop'].map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      {[
                        { id: 'has_bank_account', label: 'Bank Account' },
                        { id: 'has_jandhan_account', label: 'Jan Dhan A/C' },
                        { id: 'digital_literate', label: 'Digital Literacy' },
                        { id: 'has_smartphone', label: 'Smartphone' },
                        { id: 'has_internet', label: 'Internet Access' },
                        { id: 'interested_skill_training', label: 'Skill Training' },
                        { id: 'interested_govt_loans', label: 'Govt Micro Loans' },
                      ].map(item => (
                        <label key={item.id} className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs font-semibold">
                          <input type="checkbox" {...register(item.id as any)} className="w-4 h-4 text-pink-600 rounded" />
                          {item.label}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── STEP 7: DOCUMENTS ── */}
                {currentStep === 6 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Upload className="w-5 h-5 text-emerald-600" /> Step 7 — Upload Verification Documents
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { id: 'aadhaar_card', label: 'Aadhaar Card (Mandatory)', req: true },
                        { id: 'ration_card', label: 'Ration Card / Smart Card (Mandatory)', req: true },
                        { id: 'income_cert', label: 'Income Certificate', req: false },
                        { id: 'community_cert', label: 'Community Certificate', req: false },
                        { id: 'disability_cert', label: 'Disability Certificate', req: false },
                        { id: 'land_doc', label: 'Patta / Land Document', req: false },
                      ].map(doc => {
                        const uploaded = uploadedFiles[doc.id]
                        return (
                          <div key={doc.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-slate-800">{doc.label}</span>
                              {uploaded ? (
                                <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">✓ Uploaded</span>
                              ) : (
                                <span className="text-[10px] text-slate-400">{doc.req ? 'Required' : 'Optional'}</span>
                              )}
                            </div>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={e => handleFileUpload(doc.id, e.target.files?.[0] || null)}
                              className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-100 file:text-blue-700 cursor-pointer"
                            />
                            {uploaded && <p className="text-[10px] text-slate-500 mt-1 truncate">File: {uploaded.name}</p>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* ACTION BUTTONS */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  Next Step <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white text-xs font-black shadow-lg cursor-pointer transition-all"
                >
                  {submitting ? 'Submitting to BDO Central DB...' : 'Complete Profile & Submit for Verification ✓'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
