'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase/client'
import { useAuth } from '@/components/providers/auth-provider'
import { useLanguage } from '@/components/providers/language-provider'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Shield, Users, Zap, MapPin, ChevronRight,
  Award, Sparkles, User, Lock, LogIn, Eye, EyeOff, Info,
  Building2, ArrowLeft, ShieldCheck, Volume2, Type
} from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState<'citizen' | 'admin'>('citizen')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [captchaCode, setCaptchaCode] = useState('')
  const [captchaInput, setCaptchaInput] = useState('')
  const router = useRouter()
  const { loginWithCredentials } = useAuth()
  const { t, language, setLanguage } = useLanguage()

  const features = [
    {
      icon: Zap,
      title: language === 'ta' ? 'AI நலத்திட்டப் பொருத்தம்' : 'AI-Powered Scheme Matching',
      desc: language === 'ta' ? 'கிராமப்புற குடும்பங்களுக்கான உடனடி தகுதி சரிபார்ப்பு.' : 'Instant eligibility verification for rural households.'
    },
    {
      icon: Shield,
      title: language === 'ta' ? 'அதிகாரப்பூர்வ & பாதுகாப்பானது' : 'Official & Cyber Secure',
      desc: language === 'ta' ? 'அரசு தரவு பாதுகாப்பு விதிகளுக்கு உட்பட்டது.' : 'Compliant with state data privacy and security standards.'
    },
    {
      icon: MapPin,
      title: language === 'ta' ? 'ஒருங்கிணைந்த கிராம சேவைகள்' : 'Unified Village Services',
      desc: language === 'ta' ? 'பட்டா, பிறப்பு மற்றும் குடிமை சான்றிதழ்களுக்கு விண்ணப்பிக்கலாம்.' : 'Apply online for land patta, birth, and utility certificates.'
    },
    {
      icon: Users,
      title: language === 'ta' ? 'நேரடி நலத்திட்ட பரிமாற்றம்' : 'Direct Benefit Transfer',
      desc: language === 'ta' ? 'நேரடியாக வங்கிக் கணக்கில் நலத்திட்ட உதவி.' : 'Transparent welfare assistance straight to bank accounts.'
    },
  ]

  const generateCaptcha = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz'
    let result = ''
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setCaptchaCode(result)
  }

  useEffect(() => {
    generateCaptcha()
  }, [])

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      await signInWithPopup(auth, googleProvider)
      toast.success(t('loginSuccess'))
      router.push('/dashboard')
    } catch (err: unknown) {
      const errorCode = (err as { code?: string })?.code
      if (errorCode === 'auth/popup-closed-by-user') {
        toast.info(language === 'ta' ? 'உள்நுழைவு ரத்து செய்யப்பட்டது' : 'Sign-in cancelled')
      } else {
        toast.error(t('loginFailed'))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) {
      toast.error(language === 'ta' ? 'பயனர் பெயரை உள்ளிடவும்' : 'Please enter a username or email')
      return
    }
    if (!password.trim()) {
      toast.error(language === 'ta' ? 'கடவுச்சொல்லை உள்ளிடவும்' : 'Please enter your password')
      return
    }
    if (role === 'admin' && captchaInput !== captchaCode) {
      toast.error(language === 'ta' ? 'பாதுகாப்புக் குறியீடு (Captcha) தவறானது' : 'Invalid Captcha security code')
      generateCaptcha()
      setCaptchaInput('')
      return
    }

    setLoading(true)
    try {
      const success = await loginWithCredentials(username, password)
      if (success) {
        toast.success(t('loginSuccess'))
        if (role === 'admin' || username === 'block_development_officer' || username === 'bdo@gmail.com') {
          router.push('/admin/dashboard')
        } else {
          router.push('/dashboard')
        }
      } else {
        toast.error(t('loginFailed'))
      }
    } catch (err: any) {
      toast.error(err.message || t('loginFailed'))
    } finally {
      setLoading(false)
    }
  }

  const selectRole = (selectedRole: 'citizen' | 'admin') => {
    setRole(selectedRole)
    if (selectedRole === 'admin') {
      setUsername('block_development_officer')
      setPassword('bdo@123')
      generateCaptcha()
      setCaptchaInput('')
    } else {
      setUsername('')
      setPassword('')
      setCaptchaInput('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EAF8EF] via-[#F3FAF5] to-[#F9FCFA] dark:from-slate-950 dark:via-green-950/20 dark:to-slate-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-[#059669] selection:text-white">
      
      {/* ── TOP TRICOLOR FLAG & ACCESSIBILITY HEADER ── */}
      <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-xs backdrop-blur-md">
        {/* Tricolor Strip */}
        <div className="w-full h-1 flex">
          <div className="flex-1 bg-[#FF9933]" />
          <div className="flex-1 bg-white dark:bg-slate-800" />
          <div className="flex-1 bg-[#138808]" />
        </div>

        {/* Top Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/tn-emblem.svg" alt="TN Crest" className="w-9 h-9 object-contain group-hover:scale-105 transition-transform" />
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-base text-[#14532d] dark:text-green-400 tracking-tight leading-none">
                  GramSeva <span className="text-[#059669]">AI</span>
                </h1>
                <span className="text-[9px] font-black uppercase bg-[#EAF8EF] dark:bg-green-900/50 text-[#14532d] dark:text-green-300 px-1.5 py-0.5 rounded border border-[#A7DCBB] dark:border-green-800">
                  {language === 'ta' ? 'குடிமக்கள் உள்நுழைவு' : 'Citizen Login'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                {language === 'ta' ? 'தமிழ்நாடு அரசு • அதிகாரப்பூர்வ தளம்' : 'Government of Tamil Nadu • Citizen Portal'}
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {/* Quick Slide Button for Login Mode Switcher */}
            <div className="hidden sm:flex items-center gap-2 p-1 bg-[#EAF8EF] dark:bg-slate-800 rounded-xl border border-[#C6EDD5] dark:border-slate-700">
              <button
                type="button"
                onClick={() => selectRole('citizen')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  role === 'citizen'
                    ? 'bg-[#059669] text-white shadow-xs'
                    : 'text-[#14532d] dark:text-slate-400 hover:text-[#14532d] dark:hover:text-white hover:bg-[#D1F0DC]'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>{language === 'ta' ? 'குடிமகன்' : 'Citizen'}</span>
              </button>
              <button
                type="button"
                onClick={() => selectRole('admin')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  role === 'admin'
                    ? 'bg-[#14532d] text-white shadow-xs'
                    : 'text-[#14532d] dark:text-slate-400 hover:text-[#14532d] dark:hover:text-white hover:bg-[#D1F0DC]'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{language === 'ta' ? 'BDO அதிகாரி' : 'BDO Officer'}</span>
              </button>
            </div>

            {/* Language Selector */}
            <div className="h-8 flex items-center bg-[#EAF8EF] dark:bg-slate-800 rounded-full px-1 border border-[#C6EDD5] dark:border-slate-700">
              <button
                onClick={() => setLanguage('en')}
                className={`h-6 px-3 rounded-full text-[10px] font-extrabold transition-all cursor-pointer ${language === 'en' ? 'bg-[#059669] text-white' : 'text-[#14532d] dark:text-slate-300 hover:bg-[#D1F0DC]'}`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('ta')}
                className={`h-6 px-3 rounded-full text-[10px] font-extrabold transition-all cursor-pointer ${language === 'ta' ? 'bg-[#059669] text-white' : 'text-[#14532d] dark:text-slate-300 hover:bg-[#D1F0DC]'}`}
              >
                தமிழ்
              </button>
            </div>

            {/* Return to Home */}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-slate-800 border border-[#C6EDD5] dark:border-slate-700 rounded-xl text-xs font-bold text-[#14532d] dark:text-slate-200 hover:bg-[#EAF8EF] hover:border-[#059669] transition-all shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('backToHome')}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT (SPLIT LAYOUT SIMILAR TO HOME PAGE AESTHETICS) ── */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col lg:flex-row items-center justify-between gap-10">
        
        {/* LEFT PANEL: BRANDING & FEATURES (50%) */}
        <div className="w-full lg:w-1/2 space-y-6">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EAF8EF] dark:bg-green-900/20 text-[#14532d] dark:text-green-300 border border-[#A7DCBB] dark:border-green-800 text-xs font-extrabold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#059669]" /> {language === 'ta' ? 'அதிகாரப்பூர்வ ஊரக நலத்திட்ட தளம்' : 'Official Rural Welfare SSO'}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-4.5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {language === 'ta' ? (
                <>இடைத்தரகர்கள் இன்றி <span className="text-[#059669] dark:text-green-400">நேரடி அரசு நன்மைகளைப்</span> பெறுங்கள்</>
              ) : (
                <>Access Direct Government Benefits <span className="text-[#059669] dark:text-green-400">Without Middlemen</span></>
              )}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed max-w-lg font-medium">
              {language === 'ta'
                ? 'கிராமசேவா AI தளம் மூலம் அரசின் நலத்திட்டங்களை நேரடியாக அறிந்துகொள்ளுங்கள், சான்றிதழ்களுக்கு விண்ணப்பியுங்கள் மற்றும் புகார்களைப் பதிவு செய்யுங்கள்.'
                : 'GramSeva AI connects rural citizens directly with state welfare departments. Sign in to track certificate applications, discover personalized schemes, or log village complaints.'}
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 p-4 rounded-[18px] border border-[#C6EDD5] dark:border-slate-800 shadow-sm flex items-start gap-3.5 hover:shadow-md hover:border-[#A7DCBB] transition-all"
              >
                <div className="w-9 h-9 rounded-xl bg-[#EAF8EF] dark:bg-green-900/20 text-[#059669] dark:text-green-400 flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{f.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#14532d]/70 dark:text-slate-400">
            <Shield className="w-4 h-4 text-[#059669]" />
            <span>{language === 'ta' ? 'முழுமையான தரவுப் பாதுகாப்பு • தமிழ்நாடு அரசு வழிகாட்டுதல்களுக்கு உட்பட்டது' : 'Encrypted End-to-End • Compliant with State Digital Standards'}</span>
          </div>
        </div>

        {/* RIGHT PANEL: CITIZEN LOGIN & BDO OFFICER SSO FORM (50%) */}
        <div className="w-full lg:w-[460px]">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white dark:bg-slate-900 rounded-[18px] border border-[#C6EDD5] dark:border-slate-800 shadow-xl shadow-[#059669]/5 overflow-hidden"
          >
            {/* Top Interactive Sliding Role Selector Switch */}
            <div className="relative flex bg-[#EAF8EF] dark:bg-slate-950 p-1.5 border-b border-[#C6EDD5] dark:border-slate-800">
              <button
                type="button"
                onClick={() => selectRole('citizen')}
                className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-extrabold transition-colors cursor-pointer ${
                  role === 'citizen'
                    ? 'text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <User className="w-4 h-4" />
                {t('citizenRole')}
              </button>

              <button
                type="button"
                onClick={() => selectRole('admin')}
                className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-extrabold transition-colors cursor-pointer ${
                  role === 'admin'
                    ? 'text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4" />
                {t('bdoRole')}
              </button>

              {/* Animated Sliding Button Indicator */}
              <motion.div
                className={`absolute top-1.5 bottom-1.5 rounded-xl shadow-md ${
                  role === 'admin'
                    ? 'bg-gradient-to-r from-[#14532d] to-[#166534]'
                    : 'bg-[#059669]'
                }`}
                initial={false}
                animate={{
                  left: role === 'citizen' ? '0.375rem' : 'calc(50% + 0.1875rem)',
                  width: 'calc(50% - 0.5625rem)',
                }}
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              />
            </div>

            {/* FORM CONTAINER */}
            <div className="p-6 sm:p-8 space-y-5">
              
              {role === 'citizen' ? (
                /* CITIZEN LOGIN FORM */
                <form onSubmit={handleCredentialsLogin} className="space-y-4">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{t('citizenRole')}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {language === 'ta'
                        ? 'தகுதியான திட்டங்களைக் காண மற்றும் சான்றிதழ் நிலையை அறிய உள்நுழைக'
                        : 'Log in to view eligible schemes and track certificate status'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
                      {t('usernameLabel')}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder={language === 'ta' ? 'பயனர் பெயர் அல்லது தொலைபேசி எண்ணை உள்ளிடவும்' : 'Enter your username or email'}
                        disabled={loading}
                        className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-950 border border-[#A7DCBB] dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] font-medium transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
                        {t('passwordLabel')}
                      </label>
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); toast.info(language === 'ta' ? 'மாதிரி முறை: எந்த கடவுச்சொல்லையும் பயன்படுத்தலாம்.' : 'Demo Mode: Any password is accepted for resident login.'); }}
                        className="text-[10px] text-[#059669] font-bold hover:underline"
                      >
                        {language === 'ta' ? 'கடவுச்சொல் மறந்துவிட்டதா?' : 'Forgot Password?'}
                      </a>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={language === 'ta' ? 'கடவுச்சொல்லை உள்ளிடவும்' : 'Enter your password'}
                        disabled={loading}
                        className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-950 border border-[#A7DCBB] dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] font-medium transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-[#059669] to-[#047857] hover:from-[#047857] hover:to-[#059669] text-white rounded-xl text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <LogIn className="w-4 h-4" />
                    )}
                    <span>{loading ? t('loading') : t('loginButton')}</span>
                  </button>

                  <div className="p-3 bg-[#EAF8EF] dark:bg-green-950/40 border border-[#A7DCBB] dark:border-green-900 rounded-xl text-[11px] text-[#14532d] dark:text-green-300 font-semibold space-y-0.5">
                    <span className="font-extrabold block">💡 {t('demoCredentialsTitle')}:</span>
                    <span>{language === 'ta' ? 'மாதிரி பயனர் பெயர் மற்றும் கடவுச்சொல்லை உள்ளிட்டு நேரடியாக உள்நுழையலாம்.' : 'Enter any sample username & password. Account profile will be generated automatically.'}</span>
                  </div>

                  <div className="relative flex py-1 items-center justify-center">
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
                    <span className="flex-shrink mx-3 text-slate-400 text-[10px] uppercase font-bold">{language === 'ta' ? 'அல்லது' : 'Or'}</span>
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
                  </div>

                  {/* Google SSO */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-xs font-bold hover:bg-slate-100 transition-all cursor-pointer shadow-xs"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>{language === 'ta' ? 'Google கணக்கு மூலம் தொடரவும்' : 'Continue with Google'}</span>
                  </button>
                </form>
              ) : (
                /* BDO OFFICER SSO FORM */
                <form onSubmit={handleCredentialsLogin} className="space-y-4">

                  {/* ── Government Header Banner ── */}
                  <div className="rounded-xl overflow-hidden">
                    {/* Tricolour stripe */}
                    <div className="h-1 flex">
                      <div className="flex-1 bg-[#FF9933]" />
                      <div className="flex-1 bg-white/60" />
                      <div className="flex-1 bg-[#138808]" />
                    </div>
                    <div className="bg-gradient-to-r from-[#14532d] to-[#166534] p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-white/10 ring-1 ring-white/20 flex items-center justify-center flex-shrink-0">
                        <img src="/tn-emblem.svg" alt="TN Emblem" className="w-7 h-7 object-contain" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-white tracking-wide">{t('govOfTN')}</h4>
                        <p className="text-[9px] text-green-200 font-semibold uppercase tracking-[0.15em] mt-0.5">{language === 'ta' ? 'BDO வட்டார வளர்ச்சி அலுவலர் SSO' : 'BDO Nodal Officer — Secure SSO'}</p>
                      </div>
                      <div className="ml-auto">
                        <span className="text-[8px] font-bold uppercase bg-[#FF9933]/20 text-[#FF9933] border border-[#FF9933]/30 px-2 py-1 rounded tracking-wider">OFFICIAL</span>
                      </div>
                    </div>
                  </div>

                  {/* Officer ID */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      {t('usernameLabel')}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
                        className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#14532d]/30 focus:border-[#14532d] transition-all"
                      />
                    </div>
                  </div>

                  {/* Officer Password */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      {t('passwordLabel')}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#14532d]/30 focus:border-[#14532d] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#14532d] transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Captcha */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      {t('captchaLabel')}
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="bg-[#14532d]/8 dark:bg-green-950/40 border border-[#14532d]/20 dark:border-green-900/50 px-4 py-2 rounded-xl font-mono font-bold tracking-widest text-sm text-[#14532d] dark:text-green-300 line-through decoration-[#14532d]/40 italic select-none">
                        {captchaCode}
                      </div>
                      <button
                        type="button"
                        onClick={generateCaptcha}
                        className="text-[10px] text-[#14532d] dark:text-green-400 hover:underline font-bold"
                      >
                        {t('refreshCaptcha')}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value)}
                      placeholder={language === 'ta' ? 'மேலே உள்ள 5 குறியீட்டை உள்ளிடவும்' : 'Enter the 5 characters above'}
                      disabled={loading}
                      className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#14532d]/30 focus:border-[#14532d] transition-all"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-[#14532d] to-[#166534] hover:from-[#166534] hover:to-[#14532d] text-white rounded-xl text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <LogIn className="w-4 h-4" />
                    )}
                    <span>{loading ? t('loading') : t('loginButton')}</span>
                  </button>

                  {/* Pre-filled hint */}
                  <div className="p-3 bg-[#14532d]/[0.06] dark:bg-green-950/30 border border-[#14532d]/20 dark:border-green-900/40 rounded-xl text-[10px] text-[#14532d] dark:text-green-300 font-mono">
                    <span className="font-bold block mb-0.5">🔐 {t('demoCredentialsTitle')}:</span>
                    Username: block_development_officer<br />
                    Password: bdo@123
                  </div>
                </form>
              )}

            </div>
          </motion.div>
        </div>

      </div>

      {/* FOOTER */}
      <footer className="w-full bg-slate-950 text-slate-400 py-4 border-t border-slate-800 text-[11px] text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 GramSeva AI • Government of Tamil Nadu Citizen Portal</p>
          <p>Official Demonstration &amp; Testing Environment</p>
        </div>
      </footer>

    </div>
  )
}
