'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, MapPin, Briefcase, GraduationCap, Heart, Save, Loader2,
  ShieldCheck, Camera, Upload, X, RotateCcw, Check, ImagePlus
} from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'
import { toast } from 'sonner'
import { upsertProfile } from '@/actions/auth'

const PHOTO_KEY = 'gramseva_profile_photo'

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

  // ── Photo state ──────────────────────────────────────────────────────────────
  const [photo, setPhoto] = useState<string | null>(null)
  const [showPhotoMenu, setShowPhotoMenu] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Load saved photo from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(PHOTO_KEY)
    if (saved) setPhoto(saved)
  }, [])

  // ── Browse Gallery ────────────────────────────────────────────────────────────
  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file.'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB.'); return }
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      setPhoto(dataUrl)
      localStorage.setItem(PHOTO_KEY, dataUrl)
      toast.success('Profile photo updated!')
      setShowPhotoMenu(false)
    }
    reader.readAsDataURL(file)
    // reset so same file can be re-picked
    e.target.value = ''
  }

  // ── Camera ───────────────────────────────────────────────────────────────────
  const startCamera = useCallback(async (mode: 'user' | 'environment' = facingMode) => {
    try {
      if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()) }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode }, audio: false })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
          setCameraReady(true)
        }
      }
    } catch {
      toast.error('Camera access denied or not available.')
      setCameraOpen(false)
    }
  }, [facingMode])

  const openCamera = async () => {
    setShowPhotoMenu(false)
    setCameraOpen(true)
    setCameraReady(false)
    setTimeout(() => startCamera(facingMode), 100)
  }

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setCameraReady(false)
    setCameraOpen(false)
  }, [])

  const flipCamera = () => {
    const next = facingMode === 'user' ? 'environment' : 'user'
    setFacingMode(next)
    startCamera(next)
  }

  const snapPhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }
    ctx.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    setPhoto(dataUrl)
    localStorage.setItem(PHOTO_KEY, dataUrl)
    toast.success('Photo captured!')
    stopCamera()
  }

  const removePhoto = () => {
    setPhoto(null)
    localStorage.removeItem(PHOTO_KEY)
    setShowPhotoMenu(false)
    toast.success('Profile photo removed.')
  }

  // Cleanup on unmount
  useEffect(() => () => { streamRef.current?.getTracks().forEach(t => t.stop()) }, [])

  // ── Form Submit ───────────────────────────────────────────────────────────────
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
        profile_complete: true,
      }
      await upsertProfile(token, payload as any)
      const mockSession = localStorage.getItem('gramseva_mock_session')
      if (mockSession) {
        const session = JSON.parse(mockSession)
        session.profile = { ...session.profile, ...payload }
        localStorage.setItem('gramseva_mock_session', JSON.stringify(session))
      }
      await refreshProfile()
      toast.success('Profile updated successfully!')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const initials = (profile?.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="space-y-6 pt-2 lg:pt-0 max-w-5xl mx-auto pb-16">
      <div className="page-shell space-y-2">
        <div className="eyebrow">Resident Profile</div>
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Keep your information updated for the best scheme recommendations</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* ── LEFT: Avatar Card ── */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass-card p-6 text-center shadow-[0_16px_50px_rgba(15,23,42,0.06)] space-y-4">

            {/* Avatar with overlay buttons */}
            <div className="relative w-28 h-28 mx-auto">
              {photo ? (
                <img
                  src={photo}
                  alt="Profile"
                  className="w-28 h-28 rounded-full object-cover border-4 border-background shadow-xl"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#0F766E]/20 to-emerald-500/10 flex items-center justify-center border-4 border-background shadow-xl">
                  <span className="text-2xl font-black text-[#0F766E]">{initials}</span>
                </div>
              )}

              {/* Camera badge */}
              <button
                onClick={() => setShowPhotoMenu(v => !v)}
                className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-[#0F766E] text-white flex items-center justify-center shadow-lg border-2 border-background hover:bg-[#0d645e] transition-colors cursor-pointer"
                title="Change photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Photo action menu */}
            <AnimatePresence>
              {showPhotoMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden"
                >
                  {/* Browse gallery */}
                  <label className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                      <ImagePlus className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Browse Gallery</p>
                      <p className="text-[10px] text-muted-foreground">JPG, PNG, WEBP up to 5 MB</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFilePick}
                    />
                  </label>

                  <div className="h-px bg-slate-100 dark:bg-slate-800 mx-3" />

                  {/* Take photo */}
                  <button
                    onClick={openCamera}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                      <Camera className="w-4 h-4 text-[#0F766E]" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Take Photo</p>
                      <p className="text-[10px] text-muted-foreground">Use device camera</p>
                    </div>
                  </button>

                  {photo && (
                    <>
                      <div className="h-px bg-slate-100 dark:bg-slate-800 mx-3" />
                      <button
                        onClick={removePhoto}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer transition-colors"
                      >
                        <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center">
                          <X className="w-4 h-4 text-red-500" />
                        </div>
                        <p className="text-xs font-bold text-red-600">Remove Photo</p>
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <h3 className="font-bold text-lg">{profile?.name || 'Resident'}</h3>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
            </div>

            {/* Upload hint if no photo */}
            {!photo && (
              <label className="flex items-center justify-center gap-2 text-xs text-[#0F766E] font-bold cursor-pointer hover:underline">
                <Upload className="w-3.5 h-3.5" />
                Add Profile Photo
                <input type="file" accept="image/*" className="hidden" onChange={handleFilePick} />
              </label>
            )}

            <div className="pt-2 border-t border-border flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium">
              <ShieldCheck className="w-4 h-4" /> Account Verified
            </div>
          </div>
        </div>

        {/* ── RIGHT: Form ── */}
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
              <button type="submit" disabled={loading} className="btn-primary px-6 py-2.5 rounded-[18px]">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── CAMERA MODAL ── */}
      <AnimatePresence>
        {cameraOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) stopCamera() }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative bg-black rounded-3xl overflow-hidden shadow-2xl w-full max-w-md"
            >
              {/* Video feed */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full aspect-square object-cover"
                style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
              />

              {/* Canvas (hidden, used for capture) */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Overlay UI */}
              <div className="absolute inset-0 flex flex-col justify-between p-5">
                {/* Top bar */}
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm font-bold drop-shadow">
                    {cameraReady ? '📸 Ready' : '⏳ Starting…'}
                  </span>
                  <button
                    onClick={stopCamera}
                    className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Guide circle */}
                <div className="flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 rounded-full border-4 border-white/60 shadow-[0_0_0_9999px_rgba(0,0,0,0.25)]" />
                </div>

                {/* Bottom controls */}
                <div className="flex items-center justify-between">
                  {/* Flip camera */}
                  <button
                    onClick={flipCamera}
                    className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors cursor-pointer"
                    title="Flip camera"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>

                  {/* Shutter button */}
                  <button
                    onClick={snapPhoto}
                    disabled={!cameraReady}
                    className="w-16 h-16 rounded-full bg-white border-4 border-white/80 shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title="Capture photo"
                  >
                    <div className="w-12 h-12 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center">
                      <Check className="w-6 h-6 text-[#0F766E]" />
                    </div>
                  </button>

                  {/* Spacer */}
                  <div className="w-11" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
