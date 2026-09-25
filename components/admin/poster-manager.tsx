'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Image as ImageIcon, PlusCircle, Trash2, Edit3, Eye, EyeOff,
  Sparkles, Upload, Link as LinkIcon, CheckCircle2, AlertCircle,
  Calendar, MapPin, Phone, Users, Tag, Sliders, ArrowUpRight,
  Layers, Search, Filter, ExternalLink, Star, RefreshCw, X, ChevronRight
} from 'lucide-react'
import { toast } from 'sonner'
import {
  getStoredAnnouncements,
  saveAnnouncement,
  deleteAnnouncement,
  saveStoredAnnouncements,
  INITIAL_ANNOUNCEMENTS,
  type AnnouncementRecord
} from '@/lib/announcement-store'

// Curated authentic government scheme & welfare poster templates
const OFFICIAL_POSTER_TEMPLATES = [
  {
    title: 'PM Vishwakarma Artisan Support & Toolkit Grant',
    category: 'scheme' as const,
    type: 'scheme' as const,
    image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
    description: 'Financial aid up to ₹3 Lakh, collateral-free credit, skill training & toolkits for rural artisans, traditional craftsmen, and self-employed villagers.',
    venue: 'Gram Panchayat Community Hall, Main Road',
    priority: 10,
    organizer: 'BDO Office - Rural Development',
    restrictions: 'Open to traditional artisans and craftsmen (18+ yrs).'
  },
  {
    title: "Kalaignar Magalir Urimai Thittam Direct Aid",
    category: 'women' as const,
    type: 'women' as const,
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    description: 'Monthly direct benefit transfer of ₹1,000 to eligible women heads of households, along with micro-entrepreneurship training and SHG support.',
    venue: 'Panchayat Union Office Ground',
    priority: 9,
    organizer: 'District Women Empowerment Officer',
    restrictions: 'Women heads of household aged 21-55 years with annual income < 2.5 Lakh.'
  },
  {
    title: 'PM Kisan & High-Yield Seed Subsidy Camp',
    category: 'farmer' as const,
    type: 'farmer' as const,
    image: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80',
    description: 'Distribution of high-yield paddy seed mini-kits at 50% government subsidy, solar irrigation pump subsidies, and soil testing kits under PM Krishi Sinchayee Yojana.',
    venue: 'Agricultural Extension Depot, Main Market Yard',
    priority: 8,
    organizer: 'Assistant Director of Agriculture & BDO Officer',
    restrictions: 'Registered Farmers with Aadhaar & Land Chitta copy.'
  },
  {
    title: 'Free Village Eye & Health Screening Drive',
    category: 'health' as const,
    type: 'health' as const,
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    description: 'Comprehensive village health camp offering free doctor consultations, blood pressure & sugar checks, eye examination, free spectacles distribution, and pediatric vaccinations.',
    venue: 'Primary Health Center (PHC), Ward 2',
    priority: 7,
    organizer: 'District Health Mission & BDO Wing',
    restrictions: 'Free entry for all village residents, senior citizens and children.'
  },
  {
    title: 'Pudhumai Penn Higher Education Merit Scholarship',
    category: 'scheme' as const,
    type: 'scheme' as const,
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    description: 'Financial support up to ₹20,000/year for meritorious rural students pursuing Diploma, Engineering, Medical, and Degree courses.',
    venue: 'Government Higher Secondary School Auditorium',
    priority: 6,
    organizer: 'Education Extension Dept',
    restrictions: 'Students passing Class 10/12 with >= 60% marks and family income < 2.5 Lakh.'
  },
  {
    title: 'PM Awas Yojana Gramin Housing Scheme Drive',
    category: 'scheme' as const,
    type: 'scheme' as const,
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    description: 'Direct financial assistance of ₹2.4 Lakh for constructing pucca houses with hygienic toilet and piped drinking water connections for rural families.',
    venue: 'Block Development Office, Housing Cell',
    priority: 9,
    organizer: 'Rural Housing Department & BDO Office',
    restrictions: 'BPL / SECC listed families without pucca house.'
  },
  {
    title: 'Village Gram Sabha Special Resolution Assembly',
    category: 'general' as const,
    type: 'general' as const,
    image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
    description: 'Public meeting to approve annual village budget, MGNREGA works allocation, drinking water project review, and grievance redressal.',
    venue: 'Panchayat Bhavan Main Hall',
    priority: 8,
    organizer: 'Gram Panchayat President & BDO Officer',
    restrictions: 'Open to all registered adult voters of the Panchayat.'
  },
  {
    title: 'Ration Festival Special Distribution & Fair Price Alert',
    category: 'festival' as const,
    type: 'festival' as const,
    image: 'https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?auto=format&fit=crop&w=800&q=80',
    description: 'Announcement of festival gift hampers, free sugarcane, sugar and rice distribution for all smart ration cardholders across Fair Price Shops.',
    venue: 'All Panchayat Ration Depots',
    priority: 5,
    organizer: 'Department of Civil Supplies & Consumer Protection',
    restrictions: 'Valid Smart Ration Cardholders.'
  }
]

export default function PosterManager() {
  const [posters, setPosters] = useState<AnnouncementRecord[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPoster, setEditingPoster] = useState<AnnouncementRecord | null>(null)

  // Form states
  const [imageSourceTab, setImageSourceTab] = useState<'upload' | 'url' | 'presets'>('upload')
  const [uploadedImageData, setUploadedImageData] = useState<string>('')
  const [imageUrl, setImageUrl] = useState<string>('')
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number | null>(null)

  const [formTitle, setFormTitle] = useState('')
  const [formType, setFormType] = useState<AnnouncementRecord['type']>('scheme')
  const [formCategory, setFormCategory] = useState('Gram Sabha')
  const [formPriority, setFormPriority] = useState<number>(8)
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0])
  const [formEndDate, setFormEndDate] = useState('2026-12-31')
  const [formStartTime, setFormStartTime] = useState('10:00 AM')
  const [formEndTime, setFormEndTime] = useState('01:00 PM')
  const [formVenue, setFormVenue] = useState('Gram Panchayat Community Hall')
  const [formVillage, setFormVillage] = useState('All Villages')
  const [formWard, setFormWard] = useState('Ward 1')
  const [formOrganizer, setFormOrganizer] = useState('BDO Office - Rural Development')
  const [formPhone, setFormPhone] = useState('1800-425-1000')
  const [formRestrictions, setFormRestrictions] = useState('Open to all eligible village residents.')
  const [formDescription, setFormDescription] = useState('')
  const [formIsActive, setFormIsActive] = useState<boolean>(true)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch all posters from localStorage
  const loadPosters = () => {
    const data = getStoredAnnouncements()
    setPosters(data)
  }

  useEffect(() => {
    loadPosters()
    const handleUpdate = () => loadPosters()
    window.addEventListener('gramseva_announcements_updated', handleUpdate)
    return () => window.removeEventListener('gramseva_announcements_updated', handleUpdate)
  }, [])

  // Computed preview image
  const currentPreviewImage = useMemo(() => {
    if (imageSourceTab === 'upload' && uploadedImageData) return uploadedImageData
    if (imageSourceTab === 'url' && imageUrl.trim()) return imageUrl.trim()
    if (imageSourceTab === 'presets' && selectedPresetIndex !== null) {
      return OFFICIAL_POSTER_TEMPLATES[selectedPresetIndex]?.image || ''
    }
    return uploadedImageData || imageUrl || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80'
  }, [imageSourceTab, uploadedImageData, imageUrl, selectedPresetIndex])

  // Reset / Open modal for new poster
  const handleOpenNewModal = () => {
    setEditingPoster(null)
    setImageSourceTab('upload')
    setUploadedImageData('')
    setImageUrl('')
    setSelectedPresetIndex(null)
    setFormTitle('')
    setFormType('scheme')
    setFormCategory('Gram Sabha')
    setFormPriority(8)
    setFormStartDate(new Date().toISOString().split('T')[0])
    setFormEndDate('2026-12-31')
    setFormStartTime('10:00 AM')
    setFormEndTime('01:00 PM')
    setFormVenue('Gram Panchayat Community Hall')
    setFormVillage('All Villages')
    setFormWard('Ward 1')
    setFormOrganizer('BDO Office - Rural Development')
    setFormPhone('1800-425-1000')
    setFormRestrictions('Open to all eligible village residents.')
    setFormDescription('Special public welfare drive and application facilitation organized by the Block Development Office.')
    setFormIsActive(true)
    setIsModalOpen(true)
  }

  // Open modal for editing existing poster
  const handleEditPoster = (poster: AnnouncementRecord) => {
    setEditingPoster(poster)
    const img = poster.image || poster.image_url || ''
    if (img.startsWith('data:image')) {
      setImageSourceTab('upload')
      setUploadedImageData(img)
      setImageUrl('')
    } else {
      setImageSourceTab('url')
      setImageUrl(img)
      setUploadedImageData('')
    }
    setSelectedPresetIndex(null)
    setFormTitle(poster.title)
    setFormType(poster.type || 'scheme')
    setFormCategory(poster.category || 'Gram Sabha')
    setFormPriority(poster.priority ?? 5)
    setFormStartDate(poster.startDate || poster.date || new Date().toISOString().split('T')[0])
    setFormEndDate(poster.endDate || '2026-12-31')
    setFormStartTime(poster.start_time || '10:00 AM')
    setFormEndTime(poster.end_time || '01:00 PM')
    setFormVenue(poster.venue || 'Gram Panchayat Community Hall')
    setFormVillage(poster.village || 'All Villages')
    setFormWard(poster.ward_number || 'Ward 1')
    setFormOrganizer(poster.organizer || poster.createdBy || 'BDO Office - Rural Development')
    setFormPhone(poster.contact_number || '1800-425-1000')
    setFormRestrictions(poster.eligibility_restrictions || 'Open to all eligible village residents.')
    setFormDescription(poster.description || '')
    setFormIsActive(poster.isActive !== false)
    setIsModalOpen(true)
  }

  // Handle local image file upload (converts to Data URL for instant offline preview & persistence)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB. Please choose a smaller image.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      setUploadedImageData(result)
      toast.success('Poster image uploaded successfully!')
    }
    reader.readAsDataURL(file)
  }

  // Select preset template
  const handleSelectPreset = (index: number) => {
    setSelectedPresetIndex(index)
    const preset = OFFICIAL_POSTER_TEMPLATES[index]
    if (preset) {
      setFormTitle(preset.title)
      setFormType(preset.type)
      setFormPriority(preset.priority)
      setFormDescription(preset.description)
      setFormVenue(preset.venue)
      setFormOrganizer(preset.organizer)
      setFormRestrictions(preset.restrictions)
      setImageUrl(preset.image)
    }
  }

  // Save / Insert poster
  const handleSavePoster = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formTitle.trim()) {
      toast.error('Please enter a poster title')
      return
    }

    const finalImage = currentPreviewImage || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80'

    const payload: Partial<AnnouncementRecord> = {
      ...(editingPoster ? { id: editingPoster.id } : {}),
      title: formTitle.trim(),
      description: formDescription.trim(),
      image: finalImage,
      image_url: finalImage,
      type: formType,
      priority: Number(formPriority) || 5,
      startDate: formStartDate,
      endDate: formEndDate,
      date: formStartDate,
      start_time: formStartTime,
      end_time: formEndTime,
      venue: formVenue,
      village: formVillage,
      ward_number: formWard,
      organizer: formOrganizer,
      createdBy: formOrganizer,
      contact_number: formPhone,
      eligibility_restrictions: formRestrictions,
      category: formCategory as any,
      isActive: formIsActive,
      status: formIsActive ? 'Published' : 'Draft'
    }

    saveAnnouncement(payload)
    toast.success(
      editingPoster
        ? '✅ Government Poster Updated & Synced to Homepage!'
        : '🎉 New Government Poster Inserted & Live on Homepage!'
    )
    setIsModalOpen(false)
    loadPosters()
  }

  // Toggle active visibility on homepage
  const handleToggleActive = (poster: AnnouncementRecord) => {
    const updated = {
      ...poster,
      isActive: !poster.isActive,
      status: !poster.isActive ? ('Published' as const) : ('Draft' as const)
    }
    saveAnnouncement(updated)
    toast.info(
      !poster.isActive
        ? `👁️ "${poster.title}" is now LIVE on homepage posters carousel.`
        : `🔒 "${poster.title}" is now HIDDEN from homepage.`
    )
    loadPosters()
  }

  // Fast set to top priority (Priority 10)
  const handlePinToTop = (poster: AnnouncementRecord) => {
    saveAnnouncement({
      ...poster,
      priority: 10,
      isActive: true
    })
    toast.success(`⭐ "${poster.title}" moved to TOP priority (#10) on Homepage!`)
    loadPosters()
  }

  // Delete poster
  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to remove the poster: "${title}"?`)) {
      deleteAnnouncement(id)
      toast.success('🗑️ Poster removed.')
      loadPosters()
    }
  }

  // Reset to default sample posters
  const handleResetDefaults = () => {
    if (confirm('Reset to default official government posters? Custom posters will be restored.')) {
      saveStoredAnnouncements(INITIAL_ANNOUNCEMENTS)
      toast.success('Default posters restored!')
      loadPosters()
    }
  }

  // Filtered poster list
  const filteredPosters = useMemo(() => {
    return posters.filter(p => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.organizer?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesType =
        filterType === 'all'
          ? true
          : filterType === 'active'
          ? p.isActive !== false
          : filterType === 'inactive'
          ? p.isActive === false
          : p.type === filterType

      return matchesSearch && matchesType
    })
  }, [posters, searchQuery, filterType])

  const activeCount = posters.filter(p => p.isActive !== false).length

  return (
    <div className="space-y-6">
      {/* ── TOP ACTION HEADER BAR ── */}
      <div className="bg-gradient-to-r from-[#0d3a1f] via-[#14532d] to-[#0f766e] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Background decorative patterns */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                <ImageIcon className="w-5 h-5 text-emerald-300" />
              </span>
              <span className="text-xs font-black uppercase tracking-widest text-emerald-300 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
                BDO Management Portal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Active Government Posters & Banners
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
              Manually insert, upload, update, and prioritize government welfare posters that appear live in the 2×2 grid carousel on the resident homepage.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/#services"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Live Homepage View</span>
              <ExternalLink className="w-4 h-4 text-emerald-300" />
            </a>

            <button
              onClick={handleOpenNewModal}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Insert New Poster</span>
            </button>
          </div>
        </div>

        {/* Quick KPI stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 text-xs">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-emerald-200/70">Total Posters</span>
            <p className="text-xl font-black text-white mt-0.5">{posters.length}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-emerald-200/70">Active on Homepage</span>
            <p className="text-xl font-black text-emerald-300 mt-0.5">{activeCount} Posters</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-emerald-200/70">Carousel Grid Pages</span>
            <p className="text-xl font-black text-white mt-0.5">{Math.max(1, Math.ceil(activeCount / 4))} Pages (2×2)</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-200/70">Sample Presets</span>
              <p className="text-xs font-bold text-emerald-200 mt-0.5">8 Templates Ready</p>
            </div>
            <button
              onClick={handleResetDefaults}
              title="Reset to official default posters"
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-all"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── FILTER & SEARCH TOOLBAR ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posters by title, scheme, officer..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All' },
            { id: 'active', label: '🟢 Live' },
            { id: 'inactive', label: '⚪ Draft' },
            { id: 'scheme', label: 'Schemes' },
            { id: 'women', label: 'Women' },
            { id: 'farmer', label: 'Farmers' },
            { id: 'health', label: 'Health' },
            { id: 'festival', label: 'Festivals' },
            { id: 'general', label: 'General' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterType === tab.id
                  ? 'bg-[#14532d] text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── POSTERS GRID / CARDS ── */}
      {filteredPosters.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 space-y-4">
          <ImageIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200">No posters found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery ? 'Try changing your search query or category filter.' : 'Click "Insert New Poster" to upload your first government announcement banner.'}
          </p>
          <button
            onClick={handleOpenNewModal}
            className="px-5 py-2.5 rounded-xl bg-[#14532d] text-white text-xs font-bold cursor-pointer hover:bg-[#0f3d22]"
          >
            Insert Poster Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredPosters.map((poster) => {
            const isLive = poster.isActive !== false
            return (
              <motion.div
                key={poster.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Visual Poster Card (Exact replica of Homepage Preview) */}
                <div className="relative h-44 bg-slate-950 overflow-hidden">
                  <img
                    src={poster.image || poster.image_url}
                    alt={poster.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 via-45% to-transparent p-3 flex flex-col justify-between" />

                  {/* Top Badges */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#0F766E] text-white text-[9px] font-extrabold uppercase tracking-wider shadow-sm">
                      {poster.type || 'Notice'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase flex items-center gap-1 ${
                      isLive ? 'bg-emerald-500 text-white shadow-xs' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {isLive ? '● Live on Home' : '○ Hidden'}
                    </span>
                  </div>

                  {/* Bottom details on poster */}
                  <div className="relative z-10 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-amber-400 text-slate-950 rounded">
                        ★ Priority #{poster.priority ?? 5}
                      </span>
                      <span className="text-[10px] text-slate-300 font-medium">
                        {poster.startDate || poster.date}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white leading-tight line-clamp-2">
                      {poster.title}
                    </h4>
                  </div>
                </div>

                {/* Card Meta & Actions */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                      <MapPin className="w-3 h-3 text-[#14532d] flex-shrink-0" />
                      <span className="truncate">{poster.venue || 'Gram Panchayat'}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                      {poster.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1.5">
                    <button
                      onClick={() => handlePinToTop(poster)}
                      title="Set to Top Priority (Priority 10)"
                      className="p-2 rounded-xl text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span>Top</span>
                    </button>

                    <button
                      onClick={() => handleToggleActive(poster)}
                      title={isLive ? 'Hide from homepage' : 'Show on homepage'}
                      className={`p-2 rounded-xl text-[10px] font-bold flex items-center gap-1 border cursor-pointer transition-all ${
                        isLive
                          ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                          : 'text-slate-500 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {isLive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{isLive ? 'Live' : 'Hidden'}</span>
                    </button>

                    <button
                      onClick={() => handleEditPoster(poster)}
                      className="p-2 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDelete(poster.id, poster.title)}
                      className="p-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-900/40 text-[10px] font-bold cursor-pointer transition-all"
                      title="Delete poster"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* ── INSERT / EDIT POSTER MODAL (WITH LIVE CARD PREVIEW) ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-4"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#14532d] text-white flex items-center justify-center shadow-md">
                    <ImageIcon className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
                      {editingPoster ? 'Edit Government Poster' : 'Insert Government Poster Manually'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      BDO Admin • Configure poster visuals, metadata, and live homepage ranking
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-300 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body - 2 Columns (Form on Left, Live Preview on Right) */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left 7 cols: Form Controls */}
                <form id="poster-form" onSubmit={handleSavePoster} className="lg:col-span-7 space-y-4">
                  
                  {/* Poster Title */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>Poster Title / Scheme Name *</span>
                      <span className="text-[10px] text-slate-400 font-normal">Shown boldly on banner</span>
                    </label>
                    <input
                      required
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="e.g. PM-Kisan 18th Installment Release & Crop Subsidy Camp"
                      className="w-full p-3 text-xs sm:text-sm font-bold rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  {/* ── IMAGE INPUT TABS (Upload / URL / Presets) ── */}
                  <div className="space-y-2 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-200">
                        Poster Visual / Image *
                      </label>
                      <div className="flex bg-slate-200 dark:bg-slate-700 p-0.5 rounded-xl text-[10px] font-bold">
                        <button
                          type="button"
                          onClick={() => setImageSourceTab('upload')}
                          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                            imageSourceTab === 'upload' ? 'bg-white dark:bg-slate-900 text-[#14532d] dark:text-emerald-300 shadow-xs' : 'text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          Upload File
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageSourceTab('url')}
                          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                            imageSourceTab === 'url' ? 'bg-white dark:bg-slate-900 text-[#14532d] dark:text-emerald-300 shadow-xs' : 'text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          Image URL
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageSourceTab('presets')}
                          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                            imageSourceTab === 'presets' ? 'bg-white dark:bg-slate-900 text-[#14532d] dark:text-emerald-300 shadow-xs' : 'text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          Govt Presets
                        </button>
                      </div>
                    </div>

                    {/* Tab 1: Local File Upload */}
                    {imageSourceTab === 'upload' && (
                      <div className="space-y-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-emerald-600/30 hover:border-emerald-600 rounded-2xl p-4 text-center cursor-pointer transition-all bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50 group"
                        >
                          <Upload className="w-7 h-7 mx-auto text-emerald-600 group-hover:scale-110 transition-transform mb-1.5" />
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {uploadedImageData ? 'Click to change uploaded poster image' : 'Click to browse & upload poster from computer/phone'}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Supports PNG, JPG, WebP (Max 5MB) • Works offline</p>
                        </div>
                      </div>
                    )}

                    {/* Tab 2: URL Link */}
                    {imageSourceTab === 'url' && (
                      <div className="space-y-1">
                        <div className="relative">
                          <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://images.unsplash.com/... or government image URL"
                            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* Tab 3: Official Templates */}
                    {imageSourceTab === 'presets' && (
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                        {OFFICIAL_POSTER_TEMPLATES.map((tmpl, idx) => (
                          <div
                            key={tmpl.title}
                            onClick={() => handleSelectPreset(idx)}
                            className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                              selectedPresetIndex === idx
                                ? 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-500'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                            }`}
                          >
                            <img src={tmpl.image} alt={tmpl.title} className="w-12 h-10 rounded-lg object-cover flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold truncate text-slate-800 dark:text-white">{tmpl.title}</p>
                              <span className="text-[9px] uppercase font-semibold text-emerald-600 dark:text-emerald-400">{tmpl.type}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Category & Priority */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold uppercase text-slate-500">Target Category Tag *</label>
                      <select
                        value={formType}
                        onChange={(e) => setFormType(e.target.value as any)}
                        className="w-full p-2.5 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="scheme">Welfare Scheme (scheme)</option>
                        <option value="women">Women Welfare (women)</option>
                        <option value="farmer">Agriculture / Farmer (farmer)</option>
                        <option value="health">Health / Medical Camp (health)</option>
                        <option value="campaign">Public Campaign (campaign)</option>
                        <option value="festival">Festival / Cultural (festival)</option>
                        <option value="emergency">Emergency Alert (emergency)</option>
                        <option value="general">General Notice (general)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-extrabold uppercase text-slate-500">
                          Priority Rank: <span className="text-emerald-600 font-black">#{formPriority}</span>
                        </label>
                        <span className="text-[9px] text-slate-400">10 = Top of Homepage</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={formPriority}
                        onChange={(e) => setFormPriority(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600 mt-2"
                      />
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold uppercase text-slate-500">Event / Start Date</label>
                      <input
                        type="date"
                        value={formStartDate}
                        onChange={(e) => setFormStartDate(e.target.value)}
                        className="w-full p-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold uppercase text-slate-500">End / Expiry Date</label>
                      <input
                        type="date"
                        value={formEndDate}
                        onChange={(e) => setFormEndDate(e.target.value)}
                        className="w-full p-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Venue & Organizer */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold uppercase text-slate-500">Venue / Location</label>
                      <input
                        type="text"
                        value={formVenue}
                        onChange={(e) => setFormVenue(e.target.value)}
                        placeholder="Panchayat Community Hall"
                        className="w-full p-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold uppercase text-slate-500">Organizer Officer</label>
                      <input
                        type="text"
                        value={formOrganizer}
                        onChange={(e) => setFormOrganizer(e.target.value)}
                        placeholder="BDO Office"
                        className="w-full p-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Description / Agenda */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold uppercase text-slate-500">Description & Scheme Details</label>
                    <textarea
                      rows={3}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Explain scheme benefits, eligibility requirements, documents needed, and application steps..."
                      className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium focus:outline-none"
                    />
                  </div>

                  {/* Target Audience / Restrictions */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold uppercase text-slate-500">Target Audience / Criteria</label>
                      <input
                        type="text"
                        value={formRestrictions}
                        onChange={(e) => setFormRestrictions(e.target.value)}
                        placeholder="All adults / Women only / Farmers..."
                        className="w-full p-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold uppercase text-slate-500">Helpline / Contact</label>
                      <input
                        type="text"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        placeholder="1800-425-1000"
                        className="w-full p-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Active Toggle Switch */}
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-slate-900 dark:text-white">Publish Directly to Homepage Carousel</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Make this poster visible to all residents immediately upon saving</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formIsActive}
                        onChange={(e) => setFormIsActive(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                </form>

                {/* Right 5 cols: REAL-TIME HOMEPAGE 2x2 CARD PREVIEW */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-4 bg-slate-50 dark:bg-slate-950 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-[#0F766E] dark:text-teal-400">
                          Live Homepage Card Preview
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">2×2 Grid Style</span>
                    </div>

                    {/* Exact Homepage Card Rendering */}
                    <div className="group relative h-48 sm:h-52 rounded-[20px] overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 bg-slate-900 cursor-pointer">
                      <img
                        src={currentPreviewImage}
                        alt="Poster Preview"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 via-45% to-transparent p-3.5 flex flex-col justify-between" />
                      
                      <div className="relative z-10 flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-md bg-[#0F766E] text-white text-[9px] font-extrabold uppercase tracking-wider shadow-xs">
                          {formType || 'Notice'}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[9px] font-black uppercase shadow-xs">
                          ★ Priority #{formPriority}
                        </span>
                      </div>

                      <div className="relative z-10 space-y-1">
                        <h4 className="text-xs sm:text-sm font-bold text-white leading-tight line-clamp-2">
                          {formTitle || 'Sample Poster Title will appear here...'}
                        </h4>
                        <div className="flex items-center justify-between text-[10px] text-slate-300 font-medium">
                          <span>{formStartDate}</span>
                          <span className="truncate max-w-[120px]">{formVenue}</span>
                        </div>
                      </div>
                    </div>

                    {/* Explanation Box */}
                    <div className="mt-4 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-[11px] space-y-1 text-slate-600 dark:text-slate-300">
                      <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Homepage Display Rules:</span>
                      </p>
                      <ul className="list-disc list-inside space-y-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                        <li>Posters are sorted automatically by <strong>Priority Rank</strong> (10 down to 1).</li>
                        <li>The top 4 active posters appear on <strong>Page 1 (2×2 grid)</strong>.</li>
                        <li>Additional posters are browsable via the <strong>&lt; Next / Prev &gt;</strong> carousel arrows.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Modal Action Buttons */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      form="poster-form"
                      className="px-6 py-2.5 rounded-xl bg-[#14532d] hover:bg-[#0f3d22] text-white text-xs font-black shadow-md hover:shadow-lg cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>{editingPoster ? 'Save Changes' : 'Insert & Publish Poster'}</span>
                    </button>
                  </div>

                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
