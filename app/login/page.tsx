'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase/client'
import { useAuth } from '@/components/providers/auth-provider'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Shield, Users, Zap, MapPin, ChevronRight,
  Award, Sparkles, User, Lock, LogIn, Eye, EyeOff, Info,
  Building2, ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

const features = [
  { icon: Zap, title: 'AI-Powered Guidance', desc: 'Instant matches for scheme qualifications.' },
  { icon: Shield, title: 'Official & Secure', desc: 'Secure data management compliant with state laws.' },
  { icon: MapPin, title: 'Unified Services', desc: 'Apply for land, birth, nativity and water utilities.' },
  { icon: Users, title: 'Citizen Centric', desc: 'Direct benefit transfer for all household roles.' },
]

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
      toast.success('Signed in successfully!')
      router.push('/dashboard')
    } catch (err: unknown) {
      const errorCode = (err as { code?: string })?.code
      if (errorCode === 'auth/popup-closed-by-user') {
        toast.info('Sign-in cancelled')
      } else {
        toast.error('Sign-in failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) {
      toast.error('Please enter a username or email')
      return
    }
    if (!password.trim()) {
      toast.error('Please enter your password')
      return
    }
    if (role === 'admin' && captchaInput !== captchaCode) {
      toast.error('Invalid Captcha security code')
      generateCaptcha()
      setCaptchaInput('')
      return
    }

    setLoading(true)
    try {
      const success = await loginWithCredentials(username, password)
      if (success) {
        toast.success('Signed in successfully!')
        if (role === 'admin' || username === 'block_development_officer' || username === 'bdo@gmail.com') {
          router.push('/admin/dashboard')
        } else {
          router.push('/dashboard')
        }
      } else {
        toast.error('Sign-in failed. Please try again.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Incorrect credentials')
    } finally {
      setLoading(false)
    }
  }

  // Pre-fill BDO Admin credentials
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(2,132,199,0.10),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.12),_transparent_35%)] bg-background overflow-hidden flex flex-col lg:flex-row">
      
      {/* Left panel – Branding & Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-slate-50 dark:bg-slate-950 border-r border-border/80">
        {/* Emblem Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.08] pointer-events-none select-none z-0">
          <img src="/tn-emblem.svg" alt="TN Government Watermark" className="w-[60%] max-w-[320px] aspect-square object-contain" />
        </div>

        <div className="relative z-20 flex flex-col h-full justify-between">
          {/* Logo header */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <img src="/tn-emblem.svg" alt="TN Emblem" className="w-10 h-10 object-contain" />
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">GramSeva AI</h1>
                <p className="text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">Government of Tamil Nadu</p>
              </div>
            </Link>

            <Link href="/" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-all bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
          </div>

          {/* Heading intro */}
          <div className="space-y-6 max-w-lg mt-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" /> Smart Village Portal
            </span>
            <h2 className="text-3.5xl font-extrabold text-slate-900 dark:text-white leading-tight">
              Access Direct Welfare & Schemes{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-emerald-600 dark:from-orange-400 dark:to-emerald-400">
                Without Middlemen
              </span>
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              GramSeva bridges the gap between administrators and rural households. Validate your document criteria, track certificates, or voice complaints instantly.
            </p>

            {/* Feature lists */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              {features.map((f, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0 text-emerald-600 dark:text-emerald-400">
                    <f.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-slate-900 dark:text-white text-xs font-bold">{f.title}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] mt-0.5 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer copyright */}
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[10px] font-semibold mt-8">
            <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
            <span>Official Demonstration Sandbox • Secure State Servers</span>
          </div>
        </div>
      </div>

      {/* Right panel – Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md space-y-6"
        >
          {/* Mobile Back to Home */}
          <div className="flex items-center justify-between lg:hidden mb-4">
            <Link href="/" className="flex items-center gap-2">
              <img src="/tn-emblem.svg" alt="TN Crest" className="w-8 h-8 object-contain" />
              <span className="font-bold text-sm">GramSeva AI</span>
            </Link>
            <Link href="/" className="text-xs text-primary font-bold flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Home
            </Link>
          </div>

          <div>
            <h2 className="text-2xl font-black tracking-tight">Portal Authentication</h2>
            <p className="text-muted-foreground text-xs mt-1">Select your designated portal role and sign in to continue.</p>
          </div>

          {/* Role selector tabs */}
          <div className="flex bg-secondary p-1 rounded-xl border border-border">
            <button
              onClick={() => selectRole('citizen')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                role === 'citizen' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <User className="w-4 h-4" />
              Citizen Login
            </button>
            <button
              onClick={() => selectRole('admin')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                role === 'admin' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Building2 className="w-4 h-4" />
              BDO Officer / Admin
            </button>
          </div>

          {/* Login Card wrapper */}
          {role === 'admin' ? (
            /* Secure Official BDO/Officer SSO Portal */
            <div className="flex flex-col border border-slate-300 dark:border-slate-800 rounded-xl overflow-hidden shadow-lg bg-white dark:bg-slate-900">
              {/* Tricolor flag strip */}
              <div className="w-full h-1 flex">
                <div className="flex-1 bg-[#FF9933]" />
                <div className="flex-1 bg-white" />
                <div className="flex-1 bg-[#138808]" />
              </div>

              {/* Department Header */}
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-blue-900/60">
                <div className="flex items-center gap-3">
                  <img src="/tn-emblem.svg" alt="TN State Seal" className="w-8 h-8 object-contain" />
                  <div className="text-left">
                    <h3 className="font-extrabold text-[10px] sm:text-xs tracking-wider uppercase text-slate-100">Government of Tamil Nadu</h3>
                    <p className="text-[8px] sm:text-[9px] text-blue-300 font-bold uppercase tracking-widest mt-0.5">Rural Development & Panchayat Raj Department</p>
                  </div>
                </div>
              </div>

              {/* Form Body */}
              <form onSubmit={handleCredentialsLogin} className="p-6 sm:p-8 space-y-4 text-left">
                <div className="border-b border-border/80 pb-3 flex items-center justify-between mb-2">
                  <h4 className="font-black text-xs uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <Building2 className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" /> BDO Officer Sign-In
                  </h4>
                  <span className="text-[8px] sm:text-[9px] font-black uppercase bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-sm">
                    SECURED REGION
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-muted-foreground uppercase">Officer Username or Email</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter BDO admin ID"
                      disabled={loading}
                      className="field-shell !pl-9 pr-4 py-2.5 text-xs rounded-md"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-muted-foreground uppercase">Security Password</label>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your security password"
                      disabled={loading}
                      className="field-shell !pl-9 !pr-10 py-2.5 text-xs rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Security Verification (Captcha) */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-xs font-bold text-muted-foreground uppercase">Security Verification (Captcha)</label>
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 dark:bg-slate-800/80 select-none border border-slate-300 dark:border-slate-700 px-4 py-2 rounded-md font-mono font-bold tracking-widest text-sm text-slate-800 dark:text-slate-200 line-through decoration-slate-400 decoration-2 italic flex-shrink-0">
                      {captchaCode}
                    </div>
                    <button
                      type="button"
                      onClick={generateCaptcha}
                      className="text-[10px] text-primary hover:underline font-bold"
                    >
                      Refresh Captcha
                    </button>
                  </div>
                  <input
                    type="text"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    placeholder="Type the characters above"
                    disabled={loading}
                    className="field-shell !pl-3 pr-4 py-2.5 text-xs rounded-md"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-2.5 rounded-md font-bold text-xs disabled:opacity-50 mt-2 bg-[#1e3a8a] hover:bg-[#172e6b]"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <LogIn className="w-4 h-4" />
                  )}
                  {loading ? 'Securing Session...' : 'Authenticate BDO ID'}
                </button>

                {/* Sandbox Credentials Info */}
                <div className="p-3 bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 rounded-md text-[10px]">
                  <span className="font-bold text-blue-800 dark:text-blue-300 block mb-0.5">Pre-filled credentials for demonstration:</span>
                  <span className="font-mono text-slate-600 dark:text-slate-300">Username: block_development_officer</span>
                  <br />
                  <span className="font-mono text-slate-600 dark:text-slate-300">Password: bdo@123</span>
                </div>

                {/* Restricted Warning Notice */}
                <div className="p-3 bg-red-500/[0.04] border border-red-500/10 rounded-md text-[9px] sm:text-[10px] text-red-700 dark:text-red-400 leading-relaxed font-semibold">
                  <div className="flex gap-2">
                    <Shield className="w-4.5 h-4.5 flex-shrink-0 mt-0.5 text-red-500" />
                    <div>
                      <span className="font-extrabold uppercase block mb-0.5">Restricted System Notice</span>
                      This is a secure Government Computer System. Unauthorized access attempts are tracked and prosecuted under section 66 of the Information Technology Act (2000).
                    </div>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            /* Citizen Login Card */
            <div className="glass-card p-6 sm:p-8 space-y-6 shadow-[0_20px_60px_rgba(15,23,42,0.10)] text-left">
              <form onSubmit={handleCredentialsLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase">
                    Citizen Username or Email
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      disabled={loading}
                      className="field-shell !pl-9 pr-4 py-2.5 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-muted-foreground uppercase">Password</label>
                    <a href="#" className="text-[10px] text-primary hover:underline font-semibold" onClick={(e) => { e.preventDefault(); toast.info("Demo mode: Any password accepted for sandbox residents."); }}>
                      Forgot Password?
                    </a>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your security password"
                      disabled={loading}
                      className="field-shell !pl-9 !pr-10 py-2.5 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 rounded-[18px] font-bold text-xs disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4.5 h-4.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <LogIn className="w-4.5 h-4.5" />
                  )}
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>
              </form>

              <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-800 dark:text-blue-300">
                <div className="flex gap-2">
                  <Info className="w-4.5 h-4.5 flex-shrink-0 mt-0.5 text-blue-500" />
                  <div>
                    <span className="font-bold block mb-1">Citizen Demo Login:</span>
                    <span className="leading-relaxed block text-[10px]">Type any username and password to enter as a citizen. Registration is automatic.</span>
                  </div>
                </div>
              </div>

              {/* Google authentication */}
              <div className="relative flex py-1 items-center justify-center">
                <div className="flex-grow border-t border-border"></div>
                <span className="flex-shrink mx-3 text-muted-foreground text-[10px] uppercase tracking-wider font-bold">Or</span>
                <div className="flex-grow border-t border-border"></div>
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-5 py-2.5 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-border text-slate-800 dark:text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2">
                <a href="#" className="hover:underline font-semibold" onClick={(e) => { e.preventDefault(); toast.info("Demo Mode: Registration occurs automatically on login."); }}>Don't have an account? Register</a>
              </div>
            </div>
          )}
        </motion.div>
      </div>

    </div>
  )
}
