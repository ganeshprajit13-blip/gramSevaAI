'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { ChevronRight, ChevronLeft, CheckCircle2, User, MapPin, Briefcase, Heart } from 'lucide-react'
import { profileSchema, type ProfileFormValues } from '@/lib/validations'
import { completeProfile } from '@/actions/auth'
import { useAuth } from '@/components/providers/auth-provider'

const steps = [
  { id: 1, title: 'Personal Info', icon: User, fields: ['name', 'age', 'gender', 'marital_status'] },
  { id: 2, title: 'Location', icon: MapPin, fields: ['village', 'district'] },
  { id: 3, title: 'Occupation & Income', icon: Briefcase, fields: ['occupation', 'annual_income', 'education'] },
  { id: 4, title: 'Background', icon: Heart, fields: ['community', 'disability', 'farmer_status', 'land_ownership'] },
]

const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say']
const communityOptions = ['General', 'OBC', 'SC', 'ST', 'Other']
const maritalOptions = ['Single', 'Married', 'Divorced', 'Widowed']
const educationOptions = [
  'No Formal Education', 'Primary', 'Secondary', 'Higher Secondary',
  'Diploma', 'Graduate', 'Post Graduate', 'Doctorate',
]

function SelectField({ label, name, options, register, error }: {
  label: string
  name: string
  options: string[]
  register: any
  error?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5 text-foreground">{label}</label>
      <select
        {...register(name)}
        className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
      >
        <option value="">Select {label}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}

function InputField({ label, name, type = 'text', placeholder, register, error }: {
  label: string
  name: string
  type?: string
  placeholder?: string
  register: any
  error?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5 text-foreground">{label}</label>
      <input
        {...register(name)}
        type={type}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}

function ToggleField({ label, name, description, register }: {
  label: string
  name: string
  description: string
  register: any
}) {
  return (
    <label className="flex items-start gap-3 p-3 rounded-xl border border-border hover:border-primary/50 cursor-pointer transition-all group">
      <input
        {...register(name)}
        type="checkbox"
        className="w-4 h-4 mt-0.5 rounded accent-blue-600"
      />
      <div>
        <p className="text-sm font-medium group-hover:text-primary transition-colors">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </label>
  )
}

export default function CompleteProfilePage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const { user, refreshProfile } = useAuth()
  const router = useRouter()

  const { register, handleSubmit, trigger, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema) as any,
    defaultValues: {
      disability: false,
      farmer_status: false,
      land_ownership: false,
    },
  })

  const nextStep = async () => {
    const fields = steps[currentStep].fields as (keyof ProfileFormValues)[]
    const valid = await trigger(fields)
    if (valid) setCurrentStep((s) => Math.min(s + 1, steps.length - 1))
  }

  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    if (!user) { toast.error('Please sign in first'); return }
    setSubmitting(true)
    try {
      const idToken = await user.getIdToken()
      if (idToken.startsWith('mock-token-')) {
        // Handle mock profile update locally
        const mockSession = localStorage.getItem('gramseva_mock_session')
        if (mockSession) {
          const session = JSON.parse(mockSession)
          const updatedProfile = {
            ...session.profile,
            ...data,
            profile_complete: true,
            updated_at: new Date().toISOString()
          }
          session.profile = updatedProfile
          localStorage.setItem('gramseva_mock_session', JSON.stringify(session))
          
          // Also save in persistent local profiles
          localStorage.setItem(`gramseva_profile_data_${user.uid}`, JSON.stringify(updatedProfile))
        }
        toast.success('Profile completed! Welcome to GramSeva AI 🎉')
        await refreshProfile()
        router.push('/dashboard')
      } else {
        const { success, error } = await completeProfile(idToken, data)
        if (!success) { toast.error(error ?? 'Failed to save profile'); return }
        toast.success('Profile completed! Welcome to GramSeva AI 🎉')
        await refreshProfile()
        router.push('/dashboard')
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const step = steps[currentStep]

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 mb-4">
            <step.icon className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-1">Complete Your Profile</h1>
          <p className="text-muted-foreground text-sm">
            Discover matching government benefits — supporting students, women, workers, senior citizens, and farmers.
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  i < currentStep ? 'bg-green-500 text-white' :
                  i === currentStep ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' :
                  'bg-secondary text-muted-foreground'
                }`}>
                  {i < currentStep ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                </div>
                {i < steps.length - 1 && (
                  <div className={`h-0.5 w-16 sm:w-24 mx-1 transition-all duration-500 ${i < currentStep ? 'bg-green-500' : 'bg-border'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between px-1">
            {steps.map((s, i) => (
              <span key={s.id} className={`text-xs transition-colors ${i === currentStep ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                {s.title}
              </span>
            ))}
          </div>
        </div>

        {/* Form card */}
        <div className="glass-card p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Step 1: Personal Info */}
                {currentStep === 0 && (
                  <>
                    <InputField label="Full Name" name="name" placeholder="Enter your full name" register={register} error={errors.name?.message} />
                    <InputField label="Age" name="age" type="number" placeholder="Your age" register={register} error={errors.age?.message} />
                    <SelectField label="Gender" name="gender" options={genderOptions} register={register} error={errors.gender?.message} />
                    <SelectField label="Marital Status" name="marital_status" options={maritalOptions} register={register} error={errors.marital_status?.message} />
                  </>
                )}

                {/* Step 2: Location */}
                {currentStep === 1 && (
                  <>
                    <InputField label="Village / Town" name="village" placeholder="e.g., Rampur" register={register} error={errors.village?.message} />
                    <InputField label="District" name="district" placeholder="e.g., Varanasi" register={register} error={errors.district?.message} />
                  </>
                )}

                {/* Step 3: Occupation & Income */}
                {currentStep === 2 && (
                  <>
                    <InputField label="Occupation" name="occupation" placeholder="e.g., Farmer, Teacher, Labourer" register={register} error={errors.occupation?.message} />
                    <InputField label="Annual Income (₹)" name="annual_income" type="number" placeholder="e.g., 120000" register={register} error={errors.annual_income?.message} />
                    <SelectField label="Education Level" name="education" options={educationOptions} register={register} error={errors.education?.message} />
                  </>
                )}

                {/* Step 4: Background */}
                {currentStep === 3 && (
                  <>
                    <SelectField label="Community / Caste Category" name="community" options={communityOptions} register={register} error={errors.community?.message} />
                    <div className="space-y-3 mt-4">
                      <p className="text-sm font-medium text-muted-foreground">Select all that apply:</p>
                      <ToggleField label="Person with Disability" name="disability" description="Have any physical or mental disability" register={register} />
                      <ToggleField label="Farmer" name="farmer_status" description="Currently engaged in farming / agriculture" register={register} />
                      <ToggleField label="Land Owner" name="land_ownership" description="Own agricultural or residential land" register={register} />
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex gap-3 mt-8">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep((s) => s - 1)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border hover:border-primary/50 text-sm font-medium transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              )}
              <div className="flex-1" />
              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  {submitting ? 'Saving...' : 'Complete Profile'}
                </button>
              )}
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Step {currentStep + 1} of {steps.length} • Your information is used only for scheme matching
        </p>
      </div>
    </div>
  )
}
