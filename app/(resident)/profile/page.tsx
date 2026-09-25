'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, MapPin, Briefcase, GraduationCap, Heart, Save, Loader2,
  ShieldCheck, Camera, Upload, X, RotateCcw, Check, ImagePlus
} from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'
import { useLanguage } from '@/components/providers/language-provider'
import { toast } from 'sonner'
import { upsertProfile } from '@/actions/auth'
import { upsertResidentProfile } from '@/lib/resident-store'

const PHOTO_KEY = 'gramseva_profile_photo'

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth()
  const { t, language } = useLanguage()
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

  // Synchronize form values whenever profile updates or loads
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        name: profile.name ?? prev.name,
        age: profile.age ? String(profile.age) : prev.age,
        gender: profile.gender ?? prev.gender,
        village: profile.village ?? prev.village,
        district: profile.district ?? prev.district,
        occupation: profile.occupation ?? prev.occupation,
        annual_income: profile.annual_income ? String(profile.annual_income) : prev.annual_income,
        community: profile.community ?? prev.community,
        education: profile.education ?? prev.education,
        marital_status: profile.marital_status ?? prev.marital_status,
      }))
    }
  }, [profile])

  // ── Photo state ──────────────────────────────────────────────────────────────
  const [photo, setPhoto] = useState<string | null>(null)
  const [showPhotoMenu, setShowPhotoMenu] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('')
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const nativeCameraInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Load saved photo from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(PHOTO_KEY)
    if (saved) setPhoto(saved)
  }, [])

  // ── Browse Gallery / File Pick ────────────────────────────────────────────────
  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      setPhoto(dataUrl)
      localStorage.setItem(PHOTO_KEY, dataUrl)

      // Sync with mock session profile if active
      try {
        const mockSession = localStorage.getItem('gramseva_mock_session')
        if (mockSession) {
          const session = JSON.parse(mockSession)
          if (session.user) session.user.photoURL = dataUrl
          if (session.profile) session.profile.avatar_url = dataUrl
          localStorage.setItem('gramseva_mock_session', JSON.stringify(session))
        }
      } catch (err) {
        console.warn('Session sync warning:', err)
      }

      window.dispatchEvent(new Event('gramseva_photo_updated'))
      toast.success(t('profilePhotoUpdated'))
      setShowPhotoMenu(false)
      if (cameraOpen) stopCamera()
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // ── Camera Lifecycle ──────────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setCameraReady(false)
    setCameraOpen(false)
    setCapturedPreview(null)
    setCameraError(null)
  }, [])

  const connectStreamToVideo = useCallback((video: HTMLVideoElement, stream: MediaStream) => {
    try {
      video.muted = true
      video.defaultMuted = true
      video.playsInline = true
      video.setAttribute('playsinline', 'true')
      video.setAttribute('webkit-playsinline', 'true')
      video.setAttribute('autoplay', 'true')
      video.setAttribute('muted', 'true')
      video.srcObject = stream

      const handlePlaying = () => {
        setCameraReady(true)
      }

      video.onloadeddata = handlePlaying
      video.oncanplay = handlePlaying
      video.onplaying = handlePlaying

      video.play()
        .then(() => setCameraReady(true))
        .catch((pErr) => {
          console.warn('Video auto-play note:', pErr)
          setCameraReady(true)
        })
    } catch (err) {
      console.warn('Video connection note:', err)
      setCameraReady(true)
    }
  }, [])

  // Camera stream effect bound to cameraOpen, facingMode and selectedDeviceId
  useEffect(() => {
    let isSubscribed = true
    let activeStream: MediaStream | null = null

    if (cameraOpen && !capturedPreview) {
      setCameraReady(false)
      setCameraError(null)

      const startMedia = async () => {
        if (!navigator?.mediaDevices?.getUserMedia) {
          if (isSubscribed) {
            setCameraError(
              'Live camera access is not supported by your browser. Please use the Device Camera button.'
            )
          }
          return
        }

        try {
          // Stop any previous active streams
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop())
            streamRef.current = null
          }

          let stream: MediaStream
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: selectedDeviceId
                ? { deviceId: { exact: selectedDeviceId } }
                : { facingMode: { ideal: facingMode } },
              audio: false,
            })
          } catch {
            // Universal fallback
            stream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: false,
            })
          }

          if (!isSubscribed) {
            stream.getTracks().forEach((track) => track.stop())
            return
          }

          activeStream = stream
          streamRef.current = stream

          // Enumerate video devices
          try {
            const devices = await navigator.mediaDevices.enumerateDevices()
            const cams = devices.filter((d) => d.kind === 'videoinput')
            setVideoDevices(cams)
          } catch (e) {
            console.warn('Enumerate devices warning:', e)
          }

          if (videoRef.current) {
            connectStreamToVideo(videoRef.current, stream)
          }
        } catch (err: any) {
          console.error('Camera stream error:', err)
          if (isSubscribed) {
            const isDenied = err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError'
            setCameraError(
              isDenied
                ? 'Camera access was blocked by the browser. Please allow camera permissions or use the Device Camera App button below.'
                : 'Camera is currently unavailable or used by another application (e.g. Discord, WhatsApp, Zoom). Please close other apps or use Device Camera.'
            )
          }
        }
      }

      startMedia()
    }

    return () => {
      isSubscribed = false
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [cameraOpen, facingMode, selectedDeviceId, capturedPreview, connectStreamToVideo])

  const openCamera = () => {
    setShowPhotoMenu(false)
    setCapturedPreview(null)
    setCameraError(null)
    setCameraOpen(true)
  }

  const openNativeCamera = () => {
    setShowPhotoMenu(false)
    nativeCameraInputRef.current?.click()
  }

  const flipCamera = () => {
    if (videoDevices.length > 1) {
      const currentIndex = videoDevices.findIndex((d) => d.deviceId === selectedDeviceId)
      const nextIndex = (currentIndex + 1) % videoDevices.length
      setSelectedDeviceId(videoDevices[nextIndex].deviceId)
    } else {
      setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))
    }
  }

  const snapPhoto = () => {
    if (!videoRef.current) return
    setIsCapturing(true)
    setTimeout(() => setIsCapturing(false), 200)

    const video = videoRef.current
    const canvas = canvasRef.current || document.createElement('canvas')
    const width = video.videoWidth || video.clientWidth || 640
    const height = video.videoHeight || video.clientHeight || 480
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (facingMode === 'user' && !selectedDeviceId) {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }
    ctx.drawImage(video, 0, 0, width, height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    setCapturedPreview(dataUrl)
  }

  const confirmCapturedPhoto = () => {
    if (!capturedPreview) return
    setPhoto(capturedPreview)
    localStorage.setItem(PHOTO_KEY, capturedPreview)

    try {
      const mockSession = localStorage.getItem('gramseva_mock_session')
      if (mockSession) {
        const session = JSON.parse(mockSession)
        if (session.user) session.user.photoURL = capturedPreview
        if (session.profile) session.profile.avatar_url = capturedPreview
        localStorage.setItem('gramseva_mock_session', JSON.stringify(session))
      }
    } catch (err) {
      console.warn('Session sync warning:', err)
    }

    window.dispatchEvent(new Event('gramseva_photo_updated'))
    toast.success('Profile photo updated successfully! 📸')
    stopCamera()
  }

  const retakePhoto = () => {
    setCapturedPreview(null)
  }

  const removePhoto = () => {
    setPhoto(null)
    localStorage.removeItem(PHOTO_KEY)
    try {
      const mockSession = localStorage.getItem('gramseva_mock_session')
      if (mockSession) {
        const session = JSON.parse(mockSession)
        if (session.user) session.user.photoURL = null
        if (session.profile) session.profile.avatar_url = null
        localStorage.setItem('gramseva_mock_session', JSON.stringify(session))
      }
    } catch (err) {
      console.warn(err)
    }
    window.dispatchEvent(new Event('gramseva_photo_updated'))
    setShowPhotoMenu(false)
    toast.success(language === 'ta' ? 'சுயவிவரப் படம் நீக்கப்பட்டது.' : 'Profile photo removed.')
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  // ── Form Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...formData,
        age: parseInt(formData.age as string) || 0,
        annual_income: parseInt(formData.annual_income as string) || 0,
        profile_complete: true,
      }

      // 1. Try server action if user ID token is available
      try {
        const token = await user?.getIdToken()
        if (token) {
          await upsertProfile(token, payload as any)
        }
      } catch (tokenErr) {
        console.warn('Server upsert note:', tokenErr)
      }

      // 2. Sync with mock credentials session if active
      try {
        const mockSession = localStorage.getItem('gramseva_mock_session')
        if (mockSession) {
          const session = JSON.parse(mockSession)
          session.profile = { ...session.profile, ...payload }
          if (session.user && payload.name) session.user.displayName = payload.name
          localStorage.setItem('gramseva_mock_session', JSON.stringify(session))
        }
      } catch (sessionErr) {
        console.warn('Mock session sync note:', sessionErr)
      }

      // 3. Persist individual profile store in local storage
      const uid = user?.uid || profile?.firebase_uid || 'demo-resident-uid'
      const localProfileKey = `gramseva_profile_data_${uid}`
      try {
        const existing = localStorage.getItem(localProfileKey)
        const updatedProfile = existing ? { ...JSON.parse(existing), ...payload } : { ...profile, ...payload }
        localStorage.setItem(localProfileKey, JSON.stringify(updatedProfile))
      } catch (localErr) {
        console.warn('Local profile key note:', localErr)
      }

      // 4. Update centralized resident database for BDO analytics
      try {
        upsertResidentProfile({
          ...payload,
          firebase_uid: uid,
          name: payload.name || 'Resident',
          age: payload.age || 25,
          gender: (payload.gender as any) || 'Female',
          village: payload.village || 'Kumarpuram',
          occupation: payload.occupation || 'Farmer',
          annual_income: payload.annual_income || 50000,
          marital_status: payload.marital_status || 'Single',
          education: payload.education || 'High School',
          email: user?.email || profile?.email || 'resident@gramseva.gov.in',
        } as any)
      } catch (storeErr) {
        console.warn('Resident store sync note:', storeErr)
      }

      await refreshProfile()
      toast.success(t('profileUpdatedSuccess'))
    } catch (err: any) {
      console.error('Profile update error:', err)
      toast.error(err?.message || (language === 'ta' ? 'சுயவிவரத்தை புதுப்பிக்க முடியவில்லை' : 'Failed to update profile'))
    } finally {
      setLoading(false)
    }
  }

  const initials = (profile?.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  const genderOptions = [
    { value: 'Male', label: t('genderMale') },
    { value: 'Female', label: t('genderFemale') },
    { value: 'Other', label: t('genderOther') },
    { value: 'Prefer not to say', label: t('genderPreferNot') }
  ]

  const communityOptions = [
    { value: 'General', label: t('communityGeneral') },
    { value: 'OBC', label: t('communityOBC') },
    { value: 'SC', label: t('communitySC') },
    { value: 'ST', label: t('communityST') },
    { value: 'Other', label: t('genderOther') }
  ]

  const educationOptions = [
    { value: 'No Formal Education', label: t('eduNoFormal') },
    { value: 'Primary', label: t('eduPrimary') },
    { value: 'Secondary', label: t('eduSecondary') },
    { value: 'Higher Secondary', label: t('eduHigherSecondary') },
    { value: 'Diploma', label: t('eduDiploma') },
    { value: 'Graduate', label: t('eduGraduate') },
    { value: 'Post Graduate', label: t('eduPostGraduate') },
    { value: 'Doctorate', label: t('eduDoctorate') }
  ]

  const maritalOptions = [
    { value: 'Single', label: t('maritalSingle') },
    { value: 'Married', label: t('maritalMarried') },
    { value: 'Divorced', label: t('maritalDivorced') },
    { value: 'Widowed', label: t('maritalWidowed') }
  ]

  return (
    <div className="space-y-6 pt-2 lg:pt-0 max-w-5xl mx-auto pb-16">
      <div className="page-shell space-y-2">
        <div className="eyebrow">{language === 'ta' ? 'குடிமக்கள் சுயவிவரம்' : 'Resident Profile'}</div>
        <h1 className="page-title">{t('myProfile')}</h1>
        <p className="page-subtitle">
          {language === 'ta'
            ? 'உங்களுக்கான சிறந்த நலத்திட்ட பரிந்துரைகளைப் பெற உங்கள் தகவல்களைப் புதுப்பிக்கவும்'
            : 'Keep your information updated for the best scheme recommendations'}
        </p>
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
                title={t('openCamera')}
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
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden text-left"
                >
                  {/* Option 1: Live Camera Viewfinder */}
                  <button
                    type="button"
                    onClick={openCamera}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center">
                      <Camera className="w-4 h-4 text-[#0F766E]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{t('liveCamera')}</p>
                      <p className="text-[10px] text-muted-foreground">{t('takePhotoWithViewfinder')}</p>
                    </div>
                  </button>

                  <div className="h-px bg-slate-100 dark:bg-slate-800 mx-3" />

                  {/* Option 2: Device Camera Direct Capture */}
                  <button
                    type="button"
                    onClick={openNativeCamera}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                      <Camera className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{t('deviceCameraApp')}</p>
                      <p className="text-[10px] text-muted-foreground">{t('instantPhoneCamera')}</p>
                    </div>
                  </button>

                  <div className="h-px bg-slate-100 dark:bg-slate-800 mx-3" />

                  {/* Option 3: Browse Gallery */}
                  <label className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                      <ImagePlus className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{t('browseGallery')}</p>
                      <p className="text-[10px] text-muted-foreground">{t('imageFormatHint')}</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFilePick}
                    />
                  </label>

                  {/* Hidden native camera capture input */}
                  <input
                    ref={nativeCameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="user"
                    className="hidden"
                    onChange={handleFilePick}
                  />

                  {photo && (
                    <>
                      <div className="h-px bg-slate-100 dark:bg-slate-800 mx-3" />
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer transition-colors"
                      >
                        <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center">
                          <X className="w-4 h-4 text-red-500" />
                        </div>
                        <p className="text-xs font-bold text-red-600">{t('removePhoto')}</p>
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <h3 className="font-bold text-lg">{profile?.name || (language === 'ta' ? 'குடிமகன்' : 'Resident')}</h3>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
            </div>

            {/* Upload hint if no photo */}
            {!photo && (
              <button
                type="button"
                onClick={() => setShowPhotoMenu(true)}
                className="flex items-center justify-center gap-2 text-xs text-[#0F766E] font-bold cursor-pointer hover:underline mx-auto"
              >
                <Upload className="w-3.5 h-3.5" />
                {t('addProfilePhoto')}
              </button>
            )}

            <div className="pt-2 border-t border-border flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium">
              <ShieldCheck className="w-4 h-4" /> {t('accountVerified')}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Form ── */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
            <h3 className="text-lg font-bold mb-6 border-b border-border pb-2">{t('personalInfo')}</h3>

            <div className="grid sm:grid-cols-2 gap-5 mb-8">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('fullName')}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input aria-label={t('fullName')} type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="field-shell !pl-10 pr-4" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('ageLabel')}</label>
                <input aria-label={t('ageLabel')} type="number" required value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} className="field-shell" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('genderLabel')}</label>
                <select aria-label={t('genderLabel')} value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })} className="field-shell">
                  {genderOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('communityLabel')}</label>
                <select aria-label={t('communityLabel')} value={formData.community} onChange={(e) => setFormData({ ...formData, community: e.target.value as any })} className="field-shell">
                  {communityOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            <h3 className="text-lg font-bold mb-6 border-b border-border pb-2">{t('locationAndOccupation')}</h3>
            <div className="grid sm:grid-cols-2 gap-5 mb-8">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('districtLabel')}</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input aria-label={t('districtLabel')} type="text" required value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })} className="field-shell !pl-10 pr-4" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('villageLabel')}</label>
                <input aria-label={t('villageLabel')} type="text" required value={formData.village} onChange={(e) => setFormData({ ...formData, village: e.target.value })} className="field-shell" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('occupationLabel')}</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input aria-label={t('occupationLabel')} type="text" required value={formData.occupation} onChange={(e) => setFormData({ ...formData, occupation: e.target.value })} className="field-shell !pl-10 pr-4" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('annualIncome')}</label>
                <input aria-label={t('annualIncome')} type="number" required value={formData.annual_income} onChange={(e) => setFormData({ ...formData, annual_income: e.target.value })} className="field-shell" />
              </div>
            </div>

            <h3 className="text-lg font-bold mb-6 border-b border-border pb-2">{t('additionalDetails')}</h3>
            <div className="grid sm:grid-cols-2 gap-5 mb-8">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('educationLabel')}</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select aria-label={t('educationLabel')} value={formData.education} onChange={(e) => setFormData({ ...formData, education: e.target.value as any })} className="field-shell !pl-10 pr-4 appearance-none">
                    {educationOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('maritalStatusLabel')}</label>
                <div className="relative">
                  <Heart className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select aria-label={t('maritalStatusLabel')} value={formData.marital_status} onChange={(e) => setFormData({ ...formData, marital_status: e.target.value as any })} className="field-shell !pl-10 pr-4 appearance-none">
                    {maritalOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <button type="submit" disabled={loading} className="btn-primary px-6 py-2.5 rounded-[18px]">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {t('saveChanges')}
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4"
            onClick={(e) => { if (e.target === e.currentTarget) stopCamera() }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl w-full max-w-md flex flex-col"
            >
              {/* Flash effect overlay */}
              {isCapturing && (
                <div className="absolute inset-0 bg-white z-40 animate-out fade-out duration-200 pointer-events-none" />
              )}

              {/* Modal Top Header Bar */}
              <div className="p-4 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between z-20">
                <div className="flex items-center gap-2">
                  {capturedPreview ? (
                    <span className="text-xs font-black text-teal-300 bg-teal-950/80 border border-teal-500/30 px-3 py-1 rounded-full">
                      {language === 'ta' ? '📸 பட முன்னோட்டம்' : '📸 Photo Preview'}
                    </span>
                  ) : cameraReady ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      {t('liveCamera')}
                    </span>
                  ) : cameraError ? (
                    <span className="text-xs font-bold text-amber-300 bg-amber-950/80 border border-amber-500/30 px-3 py-1 rounded-full">
                      {language === 'ta' ? 'கேமரா அறிவிப்பு' : 'Camera Notice'}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-teal-300 bg-teal-950/80 border border-teal-500/30 px-3 py-1 rounded-full">
                      <Loader2 className="w-3 h-3 animate-spin text-teal-400" />
                      {language === 'ta' ? 'கேமரா தொடங்குகிறது...' : 'Starting Camera...'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={openNativeCamera}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    title={t('deviceCameraApp')}
                  >
                    <Camera className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline">{t('deviceCameraApp')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                    title={t('close')}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Viewfinder or Captured Preview */}
              {capturedPreview ? (
                <div className="relative w-full aspect-square bg-black">
                  <img
                    src={capturedPreview}
                    alt="Captured preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : cameraError ? (
                <div className="w-full aspect-square flex flex-col items-center justify-center p-6 text-center bg-slate-900 text-white space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm">{language === 'ta' ? 'கேமரா கிடைக்கவில்லை' : 'Camera Unavailable'}</h4>
                    <p className="text-xs text-slate-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
                      {cameraError}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs pt-2">
                    <button
                      type="button"
                      onClick={openNativeCamera}
                      className="flex-1 py-3 px-4 rounded-2xl bg-[#0F766E] hover:bg-[#0d645e] text-white text-xs font-black transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      <span>{t('deviceCameraApp')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        fileInputRef.current?.click()
                        stopCamera()
                      }}
                      className="flex-1 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <ImagePlus className="w-4 h-4" />
                      <span>{t('browseGallery')}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative w-full aspect-square bg-slate-900 overflow-hidden flex items-center justify-center">
                  <video
                    ref={(el) => {
                      videoRef.current = el
                      if (el && streamRef.current) {
                        connectStreamToVideo(el, streamRef.current)
                      }
                    }}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ transform: facingMode === 'user' && !selectedDeviceId ? 'scaleX(-1)' : 'none' }}
                  />

                  {/* Face Framing Guide Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-56 h-56 rounded-full border-2 border-white/80 border-dashed" />
                  </div>

                  {/* Loading spinner placeholder if video is decoding */}
                  {!cameraReady && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-xs gap-3">
                      <Loader2 className="w-8 h-8 text-[#0F766E] animate-spin" />
                      <p className="text-xs font-bold text-slate-300">{language === 'ta' ? 'கேமராவை இணைக்கிறது...' : 'Connecting to webcam...'}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Hidden canvas for snapshot rendering */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Viewfinder Secondary Fallback Info Bar */}
              {!capturedPreview && !cameraError && (
                <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{language === 'ta' ? 'கேமரா இயங்காவிட்டால்:' : 'If camera is black or busy:'}</span>
                  <button
                    type="button"
                    onClick={openNativeCamera}
                    className="text-[#0F766E] dark:text-teal-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Camera className="w-3 h-3" />
                    {t('deviceCameraApp')}
                  </button>
                </div>
              )}

              {/* Overlay Bottom Controls */}
              <div className="p-4 bg-slate-950 border-t border-slate-800">
                {capturedPreview ? (
                  // Confirm / Retake Controls
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={retakePhoto}
                      className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>{t('retake')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={confirmCapturedPhoto}
                      className="flex-1 py-3 rounded-2xl bg-[#0F766E] hover:bg-[#0d645e] text-white text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-900/30 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>{t('useThisPhoto')}</span>
                    </button>
                  </div>
                ) : (
                  // Live Camera Controls
                  <div className="flex items-center justify-between px-2">
                    {/* Flip Camera / Switch Device Button */}
                    <button
                      type="button"
                      onClick={flipCamera}
                      className="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white flex flex-col items-center justify-center transition-all cursor-pointer gap-0.5"
                      title={t('flipCamera')}
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span className="text-[9px] font-bold text-slate-400">{t('flipCamera')}</span>
                    </button>

                    {/* Shutter Button */}
                    <button
                      type="button"
                      onClick={snapPhoto}
                      disabled={!cameraReady}
                      className="w-16 h-16 rounded-full bg-white border-4 border-slate-300 shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ring-4 ring-teal-500/30"
                      title={t('openCamera')}
                    >
                      <div className="w-12 h-12 rounded-full bg-[#0F766E] flex items-center justify-center">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    </button>

                    {/* Gallery Shortcut Button */}
                    <button
                      type="button"
                      onClick={() => {
                        fileInputRef.current?.click()
                        stopCamera()
                      }}
                      className="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex flex-col items-center justify-center transition-all cursor-pointer gap-0.5"
                      title={t('browseGallery')}
                    >
                      <ImagePlus className="w-4 h-4 text-blue-400" />
                      <span className="text-[9px] font-bold text-slate-400">{t('browseGallery')}</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
