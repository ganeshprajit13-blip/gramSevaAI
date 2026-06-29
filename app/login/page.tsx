'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase/client'
import { useAuth } from '@/components/providers/auth-provider'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Shield, Users, Zap, MapPin, ChevronRight,
  Award, Sparkles, User, Lock, LogIn, Eye, EyeOff, Info
} from 'lucide-react'

const features = [
  { icon: Zap, title: 'AI-Powered', desc: 'Smart scheme recommendations based on your profile' },
  { icon: Shield, title: 'Secure & Private', desc: 'Your data stays protected with enterprise security' },
  { icon: MapPin, title: 'Nearby Offices', desc: 'Find government offices and services near you' },
  { icon: Users, title: 'For All Citizens', desc: 'Schemes for students, women, senior citizens, workers, and farmers' },
]

const stats = [
  { value: '100+', label: 'Schemes' },
  { value: '1000+', label: 'Residents' },
  { value: '28', label: 'States' },
  { value: '24/7', label: 'Support' },
]

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { loginWithCredentials } = useAuth()

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      await signInWithPopup(auth, googleProvider)
      toast.success('Signed in successfully!')
      router.push('/')
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

    setLoading(true)
    try {
      const success = await loginWithCredentials(username, password)
      if (success) {
        toast.success('Signed in successfully!')
        router.push('/')
      } else {
        toast.error('Sign-in failed. Please try again.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Incorrect credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden flex">
      {/* Left panel – Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-indigo-900/80 to-slate-900" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
        </div>

        {/* Grid lines decoration */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 relative flex-shrink-0">
              <img src="/tn-emblem.png" alt="TN Emblem" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">GramSeva AI</h1>
              <p className="text-blue-300 text-xs font-semibold uppercase tracking-wider">Government of Tamil Nadu</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-medium mb-4">
                <Sparkles className="w-3 h-3" />
                Welfare Direct Portal
              </span>
              <h2 className="text-4xl font-bold text-white leading-tight">
                Discover Government Schemes{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-orange-400">
                  Made For You
                </span>
              </h2>
              <p className="text-slate-300 mt-4 text-lg leading-relaxed">
                GramSeva AI matches Tamil Nadu residents with the exact government welfare schemes and benefits they qualify for — in seconds.
              </p>
            </motion.div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{f.title}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex gap-6">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-slate-400 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-slate-500 text-xs">
          <Shield className="w-3 h-3" />
          <span>Government-grade security • Data stays in India</span>
        </div>
      </div>

      {/* Right panel – Sign in */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 relative flex-shrink-0">
              <img src="/tn-emblem.png" alt="TN Emblem" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-lg font-bold">GramSeva</h1>
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Government of Tamil Nadu</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-1">Welcome back</h2>
            <p className="text-muted-foreground text-sm">
              Sign in to access your personalized welfare dashboard and discover eligible schemes.
            </p>
          </div>

          {/* Sign in card */}
          <div className="glass-card p-6 sm:p-8 space-y-6">
            {/* Credentials Login Form */}
            <form onSubmit={handleCredentialsLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Username or Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username or email"
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    disabled={loading}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
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
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white font-semibold text-sm transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>

            {/* Sandbox Login Help Info widget */}
            <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-800 dark:text-blue-300 space-y-2">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-foreground block mb-1">Demo Access Credentials:</span>
                  <div className="space-y-1 font-mono text-[11px] leading-relaxed">
                    <div>
                      <span className="font-semibold text-blue-900 dark:text-blue-100">BDO Admin Login:</span>
                      <br />Username: <span className="text-orange-600 dark:text-orange-400 font-bold">block_development_officer</span>
                      <br />Password: <span className="text-orange-600 dark:text-orange-400 font-bold">bdo@123</span>
                    </div>
                    <div className="pt-1.5 border-t border-blue-500/15">
                      <span className="font-semibold text-blue-900 dark:text-blue-100">Resident / Citizen Sandbox:</span>
                      <br />Any other username & password will log in as a resident.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Sign-in separator */}
            <div className="relative flex py-1 items-center justify-center">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink mx-3 text-muted-foreground text-[11px] uppercase tracking-wider font-semibold">Or log in with Google</span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            {/* Google Sign-in button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-5 py-2.5 rounded-xl bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm font-medium transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google Account
            </button>

            {/* Award badge */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <Award className="w-5 h-5 text-orange-400 flex-shrink-0" />
              <p className="text-xs text-orange-300">
                <span className="font-semibold text-orange-200">Official Government Portal.</span>{' '}
                Free service for all Tamil Nadu residents. No hidden charges.
              </p>
            </div>

            <div className="text-center text-[11px] text-muted-foreground">
              By signing in, you agree to our Terms of Service and Privacy Policy.
              Your data is stored securely in India.
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-muted-foreground">
            <span className="text-xs">Government of Tamil Nadu Initiative</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-xs">Powered by AI</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
